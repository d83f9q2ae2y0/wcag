This is a solid architecture problem — two authentication sources feeding one unified JWT-based API. Here's the shape I'd build it in, following the Controller/Helper conventions from your project file where they apply (thin controllers, `$em` naming, `Helper` classes for domain logic).

## Overall flowThe key design decision: since `AAA` and `BBB` are structurally different (unique username vs. many rows per email), I don't try to unify them into one "User" entity. Instead both implement `UserInterface` independently, and their `getUserIdentifier()` returns a **prefixed** string (`aaa:username`, `bbb:42`). That prefix is what lets one shared user provider — used by the API firewall *and* the refresh-token flow — dispatch to the right repository without needing Lexik's payload-aware interface. Authorization between the two is just roles (`ROLE_AAA` vs `ROLE_BBB`).

## Entities

```php
// src/Entity/AAA.php
#[ORM\Entity]
class AAA implements UserInterface
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    private int $id;

    #[ORM\Column(unique: true)]
    private string $username;

    // ...other fields mirrored from LDAP if needed (email, displayName...)

    public function getUserIdentifier(): string
    {
        return 'aaa:' . $this->username;
    }

    public function getRoles(): array
    {
        return ['ROLE_AAA'];
    }

    public function eraseCredentials(): void {}

    public function getId(): int { return $this->id; }
    public function getUsername(): string { return $this->username; }
}
```

```php
// src/Entity/BBB.php
#[ORM\Entity]
class BBB implements UserInterface
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    private int $id;

    #[ORM\Column]
    private string $email;

    #[ORM\Column(unique: true, length: 128)]
    private string $token;

    #[ORM\Column]
    private \DateTimeImmutable $expiresAt;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $usedAt = null;

    // ...other domain fields specific to a BBB record

    public function getUserIdentifier(): string
    {
        return 'bbb:' . $this->id;
    }

    public function getRoles(): array
    {
        return ['ROLE_BBB'];
    }

    public function eraseCredentials(): void {}

    public function isExpired(): bool { return $this->expiresAt < new \DateTimeImmutable(); }
    public function isUsed(): bool { return $this->usedAt !== null; }
    public function markUsed(): static { $this->usedAt = new \DateTimeImmutable(); return $this; }

    public function getId(): int { return $this->id; }
    public function getEmail(): string { return $this->email; }
    public function getToken(): string { return $this->token; }
}
```

Each row created for a magic-link request is its own `BBB` entity — multiple rows can share `email`, which is exactly what you need to expose "all the times this email logged in" later.

## Shared user provider

```php
// src/Security/AppUserProvider.php
class AppUserProvider implements UserProviderInterface
{
    public function __construct(
        private AAARepository $aaaRepository,
        private BBBRepository $bbbRepository,
    ) {}

    public function loadUserByIdentifier(string $identifier): UserInterface
    {
        [$type, $value] = explode(':', $identifier, 2) + [null, null];

        return match ($type) {
            'aaa' => $this->aaaRepository->findOneBy(['username' => $value])
                ?? throw new UserNotFoundException(sprintf('AAA user "%s" not found.', $value)),
            'bbb' => $this->bbbRepository->find((int) $value)
                ?? throw new UserNotFoundException(sprintf('BBB record "%s" not found.', $value)),
            default => throw new UserNotFoundException('Invalid user identifier.'),
        };
    }

    public function refreshUser(UserInterface $user): UserInterface
    {
        if ($user instanceof AAA) {
            return $this->aaaRepository->find($user->getId()) ?? throw new UserNotFoundException('AAA user gone.');
        }
        if ($user instanceof BBB) {
            return $this->bbbRepository->find($user->getId()) ?? throw new UserNotFoundException('BBB record gone.');
        }
        throw new UnsupportedUserException(sprintf('Unsupported user class "%s".', get_class($user)));
    }

    public function supportsClass(string $class): bool
    {
        return $class === AAA::class || $class === BBB::class;
    }
}
```

This same provider is reused by both the `api` firewall (for validating incoming JWTs) and the refresh-token route, so refreshing a BBB-issued token correctly reloads a `BBB` row and refreshing an AAA-issued token reloads an `AAA` row — no collision even if an AAA username happens to look like a BBB id.

## security.yaml

```yaml
security:
    enable_authenticator_manager: true

    providers:
        app_user_provider:
            id: App\Security\AppUserProvider

    firewalls:
        login_ldap:
            pattern: ^/api/login/ldap
            stateless: true
            provider: app_user_provider
            custom_authenticators:
                - App\Security\LdapAuthenticator

        login_magic_link:
            pattern: ^/api/login/magic-link
            stateless: true
            provider: app_user_provider
            custom_authenticators:
                - App\Security\MagicLinkAuthenticator

        api_refresh:
            pattern: ^/api/token/refresh
            stateless: true
            provider: app_user_provider

        api:
            pattern: ^/api
            stateless: true
            provider: app_user_provider
            jwt: ~   # enables lexik_jwt_authentication on this firewall

    access_control:
        - { path: ^/api/login/ldap, roles: PUBLIC_ACCESS }
        - { path: ^/api/login/magic-link, roles: PUBLIC_ACCESS }
        - { path: ^/api/token/refresh, roles: PUBLIC_ACCESS }
        - { path: ^/api, roles: IS_AUTHENTICATED_FULLY }
```

## Shared token issuer

Used by both authenticators so JWT + refresh-token creation logic lives in one place.

```php
// src/Security/TokenIssuer.php
class TokenIssuer
{
    public function __construct(
        private JWTTokenManagerInterface $jwtManager,
        private RefreshTokenGeneratorInterface $refreshTokenGenerator,
        private RefreshTokenManagerInterface $refreshTokenManager,
        private int $refreshTokenTtl = 2592000, // 30 days
    ) {}

    public function issue(UserInterface $user): array
    {
        $refreshToken = $this->refreshTokenGenerator->createForUserWithTtl($user, $this->refreshTokenTtl);
        $this->refreshTokenManager->save($refreshToken);

        return [
            'success' => true,
            'token' => $this->jwtManager->create($user),
            'refresh_token' => $refreshToken->getRefreshToken(),
        ];
    }
}
```

## LdapAuthenticator

```php
// src/Security/LdapAuthenticator.php
class LdapAuthenticator implements AuthenticatorInterface
{
    public function __construct(
        private LdapInterface $ldap,
        private AAARepository $aaaRepository,
        private TokenIssuer $tokenIssuer,
        private string $ldapBaseDn,
        private string $ldapSearchDn,
        private string $ldapSearchPassword,
    ) {}

    public function supports(Request $request): ?bool
    {
        return $request->attributes->get('_route') === 'login_ldap';
    }

    public function authenticate(Request $request): Passport
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $username = $data['username'] ?? null;
        $password = $data['password'] ?? null;

        if (!$username || !$password) {
            throw new CustomUserMessageAuthenticationException('Username and password are required.');
        }

        try {
            $this->ldap->bind($this->ldapSearchDn, $this->ldapSearchPassword);
            $result = $this->ldap->query($this->ldapBaseDn, sprintf('(uid=%s)', $username))->execute();

            if (0 === count($result)) {
                throw new CustomUserMessageAuthenticationException('Invalid credentials.');
            }

            $this->ldap->bind($result[0]->getDn(), $password);
        } catch (ConnectionException) {
            throw new CustomUserMessageAuthenticationException('Invalid credentials.');
        }

        return new SelfValidatingPassport(
            new UserBadge($username, function (string $identifier) {
                return $this->aaaRepository->findOneBy(['username' => $identifier])
                    ?? throw new CustomUserMessageAuthenticationException('Unknown local account.');
            })
        );
    }

    public function createToken(Passport $passport, string $firewallName): TokenInterface
    {
        return new PostAuthenticationToken($passport->getUser(), $firewallName, $passport->getUser()->getRoles());
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        return new JsonResponse($this->tokenIssuer->issue($token->getUser()));
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        return new JsonResponse(['success' => false, 'errors' => ['auth' => $exception->getMessage()]], 401);
    }

    public function start(Request $request, AuthenticationException $authException = null): Response
    {
        return new JsonResponse(['success' => false, 'errors' => ['auth' => 'Authentication required.']], 401);
    }
}
```

The LDAP bind-then-verify pattern (bind as a service account, search for the DN, then bind again as the user to check the password) is the standard way to validate credentials without ever handling the LDAP password directly in your app logic.

## MagicLinkAuthenticator

```php
// src/Security/MagicLinkAuthenticator.php
class MagicLinkAuthenticator implements AuthenticatorInterface
{
    public function __construct(
        private BBBRepository $bbbRepository,
        private TokenIssuer $tokenIssuer,
    ) {}

    public function supports(Request $request): ?bool
    {
        return $request->attributes->get('_route') === 'login_magic_link';
    }

    public function authenticate(Request $request): Passport
    {
        $linkToken = $request->query->get('token');

        if (!$linkToken) {
            throw new CustomUserMessageAuthenticationException('Missing magic link token.');
        }

        return new SelfValidatingPassport(
            new UserBadge($linkToken, function (string $linkToken) {
                $bbb = $this->bbbRepository->findOneBy(['token' => $linkToken]);

                if (!$bbb || $bbb->isUsed() || $bbb->isExpired()) {
                    throw new CustomUserMessageAuthenticationException('This login link is invalid or has expired.');
                }

                return $bbb;
            })
        );
    }

    public function createToken(Passport $passport, string $firewallName): TokenInterface
    {
        return new PostAuthenticationToken($passport->getUser(), $firewallName, $passport->getUser()->getRoles());
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        /** @var BBB $bbb */
        $bbb = $token->getUser();
        $bbb->markUsed();
        $this->bbbRepository->save($bbb); // flush

        return new JsonResponse($this->tokenIssuer->issue($bbb));
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        return new JsonResponse(['success' => false, 'errors' => ['auth' => $exception->getMessage()]], 401);
    }

    public function start(Request $request, AuthenticationException $authException = null): Response
    {
        return new JsonResponse(['success' => false, 'errors' => ['auth' => 'Authentication required.']], 401);
    }
}
```

Marking the row `usedAt` on success gives you single-use links for free, and `expiresAt` gives you a TTL — enforce both in the closure above so an expired/reused link fails authentication cleanly.

## Exposing BBB records for magic-link sessions

Following the controller/helper split from your project conventions:

```php
// src/Controller/BbbController.php
class BbbController extends AbstractController
{
    #[Route('/api/bbb/mine', name: 'bbb_mine', methods: ['GET'])]
    #[IsGranted('ROLE_BBB')]
    public function mine(BbbHelper $helper): JsonResponse
    {
        /** @var BBB $currentBbb */
        $currentBbb = $this->getUser();

        $records = $helper->getRecordsForEmail($currentBbb->getEmail());

        return new JsonResponse(['success' => true, 'data' => $records], 200);
    }
}
```

```php
// src/Helper/BbbHelper.php
class BbbHelper
{
    public function __construct(private EntityManagerInterface $em) {}

    public function getRecordsForEmail(string $email): array
    {
        $records = $this->em->getRepository(BBB::class)->findBy(['email' => $email]);

        return array_map(fn (BBB $b) => [
            'id' => $b->getId(),
            'email' => $b->getEmail(),
            'createdAt' => $b->getCreatedAt()?->format(DATE_ATOM),
        ], $records);
    }
}
```

`#[IsGranted('ROLE_BBB')]` is what actually enforces "only exposed when logged in via login link" — an AAA-authenticated request carries `ROLE_AAA` only, so it gets a 403 here automatically.

## Packages and config to add

```bash
composer require lexik/jwt-authentication-bundle gesdinet/jwt-refresh-token-bundle symfony/ldap
```

```yaml
# config/packages/gesdinet_jwt_refresh_token.yaml
gesdinet_jwt_refresh_token:
    refresh_token_class: App\Entity\RefreshToken
    ttl: 2592000
    single_use: false
```

```php
// src/Entity/RefreshToken.php
#[ORM\Entity]
class RefreshToken extends Gesdinet\JWTRefreshTokenBundle\Entity\RefreshToken {}
```

Standard `lexik_jwt_authentication.yaml` (keypair paths, TTL) applies unchanged — nothing special needed there since the discrimination happens entirely in the identifier string, not in the JWT payload.

**A couple of things worth deciding explicitly before you build this out:** rate-limit the magic-link request endpoint (not shown here) since it's `PUBLIC_ACCESS`, and pick a token generation strategy for `BBB::$token` with enough entropy (`random_bytes(32)` + base64url, not `uniqid()`).
