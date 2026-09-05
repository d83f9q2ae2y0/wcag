framework:
    rate_limiter:
        public_api:
            policy: 'sliding_window'
            limit: 30
            interval: '1 minute'
            storage_service: 'cache.rate_limiter'

        user_api:
            policy: 'sliding_window'
            limit: 60
            interval: '1 minute'
            storage_service: 'cache.rate_limiter'

        admin_api:
            policy: 'sliding_window'
            limit: 120
            interval: '1 minute'
            storage_service: 'cache.rate_limiter'

        upload:
            policy: 'token_bucket'
            limit: 5
            rate: { interval: '15 minutes', amount: 5 }
            storage_service: 'cache.rate_limiter'

        payment:
            policy: 'sliding_window'
            limit: 5
            interval: '10 minutes'
            storage_service: 'cache.rate_limiter'



<?php
// src/EventListener/RateLimitListener.php

declare(strict_types=1);

namespace App\EventListener;

use Symfony\Component\Bundle\SecurityBundle\Security;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\RateLimiter\RateLimiterFactory;

/**
 * Priorité 6 : volontairement inférieure à celle du firewall de sécurité (priorité 8),
 * pour que le token/utilisateur soit déjà résolu quand on discrimine par user ID.
 */
#[AsEventListener(event: KernelEvents::REQUEST, priority: 6)]
final class RateLimitListener
{
    public function __construct(
        private readonly RateLimiterFactory $publicApiLimiter,
        private readonly RateLimiterFactory $userApiLimiter,
        private readonly RateLimiterFactory $adminApiLimiter,
        private readonly RateLimiterFactory $uploadLimiter,
        private readonly RateLimiterFactory $paymentLimiter,
        private readonly Security $security,
    ) {
    }

    public function __invoke(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();
        $path = $request->getPathInfo();

        [$factory, $key] = match (true) {
            str_starts_with($path, '/api/upload')  => [$this->uploadLimiter, $this->byIp($request)],
            str_starts_with($path, '/api/payment') => [$this->paymentLimiter, $this->byIp($request)],
            str_starts_with($path, '/api/admin/')  => [$this->adminApiLimiter, $this->byUser($request)],
            str_starts_with($path, '/api/user/')   => [$this->userApiLimiter, $this->byUser($request)],
            str_starts_with($path, '/api/')        => [$this->publicApiLimiter, $this->byIp($request)],
            default => [null, null],
        };

        if ($factory === null) {
            return; // route hors périmètre API : pas de rate limiting
        }

        $limit = $factory->create($key)->consume(1);

        // On stocke les infos pour les exposer dans les headers de la réponse
        $request->attributes->set('_rate_limit', $limit);

        if (!$limit->isAccepted()) {
            throw new TooManyRequestsHttpException(
                $limit->getRetryAfter()->getTimestamp() - time(),
                'Trop de requêtes, veuillez réessayer plus tard.'
            );
        }
    }

    private function byIp(Request $request): string
    {
        return 'ip:' . ($request->getClientIp() ?? 'unknown');
    }

    private function byUser(Request $request): string
    {
        $user = $this->security->getUser();

        return $user !== null
            ? 'user:' . $user->getUserIdentifier()
            : $this->byIp($request); // fallback défensif si jamais atteint sans auth
    }
}
