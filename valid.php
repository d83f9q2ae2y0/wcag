<?php

namespace App\Service;

use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Validator\ConstraintViolationListInterface;
use Doctrine\ORM\EntityManagerInterface;

class JsonArrayValidator
{
    private ValidatorInterface $validator;
    private EntityManagerInterface $entityManager;

    public function __construct(
        ValidatorInterface $validator,
        EntityManagerInterface $entityManager
    ) {
        $this->validator = $validator;
        $this->entityManager = $entityManager;
    }

    /**
     * Validates a JSON array with conditional rules based on the 'ccc' value
     *
     * @param array $data The data array to validate
     * @return ConstraintViolationListInterface The validation errors (empty if valid)
     */
    public function validateJsonArray(array $data): ConstraintViolationListInterface
    {
        // Define base constraints that apply to all cases
        $baseConstraints = new Assert\Collection([
            'fields' => [
                'aaa' => [
                    new Assert\NotBlank(),
                    new Assert\DateTime(),
                ],
                'bbb' => [
                    new Assert\NotBlank(),
                    new Assert\Type('string'),
                ],
                'ccc' => [
                    new Assert\NotBlank(),
                    new Assert\Choice(['choices' => [10, 11]]),
                ],
            ],
            'allowExtraFields' => true,
            'allowMissingFields' => false,
        ]);

        // First validate the base structure
        $violations = $this->validator->validate($data, $baseConstraints);

        // If base validation fails, return early
        if (count($violations) > 0) {
            return $violations;
        }

        // Additional validation when ccc = 11
        if (isset($data['ccc']) && $data['ccc'] === 11) {
            $violations = $this->validateCccEquals11($data, $violations);
        }

        return $violations;
    }

    /**
     * Validates additional constraints when ccc = 11
     */
    private function validateCccEquals11(array $data, ConstraintViolationListInterface $violations): ConstraintViolationListInterface
    {
        // Validate that 'ddd' exists and is an array
        $dddConstraints = new Assert\Collection([
            'fields' => [
                'ddd' => [
                    new Assert\NotBlank(message: 'The field "ddd" is required when ccc = 11'),
                    new Assert\Type('array', message: 'The field "ddd" must be an array'),
                ],
            ],
            'allowExtraFields' => true,
            'allowMissingFields' => true,
        ]);

        $dddViolations = $this->validator->validate($data, $dddConstraints);
        
        // Merge violations
        foreach ($dddViolations as $violation) {
            $violations->add($violation);
        }

        // If ddd validation failed, return early
        if (count($dddViolations) > 0 || !isset($data['ddd'])) {
            return $violations;
        }

        // Validate each object in the 'ddd' array
        foreach ($data['ddd'] as $index => $item) {
            $itemViolations = $this->validateDddItem($item, $index);
            
            foreach ($itemViolations as $violation) {
                $violations->add($violation);
            }
        }

        return $violations;
    }

    /**
     * Validates a single item in the 'ddd' array
     */
    private function validateDddItem(mixed $item, int $index): ConstraintViolationListInterface
    {
        $constraints = new Assert\Collection([
            'fields' => [
                'zzz' => [
                    new Assert\NotBlank(message: "ddd[{{ index }}].zzz is required"),
                    new Assert\Type('integer', message: "ddd[{{ index }}].zzz must be an integer"),
                    new EntityExistsConstraint(
                        entityClass: 'App\Entity\YourZzzEntity', // Replace with your actual entity
                        message: "ddd[{{ index }}].zzz references an invalid entity"
                    ),
                ],
                'yyy' => [
                    new Assert\NotBlank(message: "ddd[{{ index }}].yyy is required"),
                    new Assert\Type('integer', message: "ddd[{{ index }}].yyy must be an integer"),
                    new EntityExistsConstraint(
                        entityClass: 'App\Entity\YourYyyEntity', // Replace with your actual entity
                        message: "ddd[{{ index }}].yyy references an invalid entity"
                    ),
                ],
                'xxx' => [
                    new Assert\NotBlank(message: "ddd[{{ index }}].xxx is required"),
                    new Assert\Type('integer', message: "ddd[{{ index }}].xxx must be an integer"),
                    new Assert\Positive(message: "ddd[{{ index }}].xxx must be positive"),
                ],
                'www' => [
                    new Assert\NotBlank(message: "ddd[{{ index }}].www is required and cannot be empty"),
                    new Assert\Type('string', message: "ddd[{{ index }}].www must be a string"),
                ],
            ],
            'allowExtraFields' => false,
            'allowMissingFields' => false,
        ]);

        return $this->validator->validate($item, $constraints);
    }
}

<?php

namespace App\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 * @Target({"PROPERTY", "METHOD", "ANNOTATION"})
 */
#[\Attribute(\Attribute::TARGET_PROPERTY | \Attribute::TARGET_METHOD | \Attribute::IS_REPEATABLE)]
class EntityExistsConstraint extends Constraint
{
    public string $message = 'The entity with id "{{ value }}" does not exist.';
    public string $entityClass;

    public function __construct(
        string $entityClass,
        ?string $message = null,
        ?array $groups = null,
        mixed $payload = null
    ) {
        parent::__construct([], $groups, $payload);
        
        $this->entityClass = $entityClass;
        
        if ($message !== null) {
            $this->message = $message;
        }
    }

    public function validatedBy(): string
    {
        return EntityExistsValidator::class;
    }
}

<?php

namespace App\Validator\Constraints;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Exception\UnexpectedValueException;

class EntityExistsValidator extends ConstraintValidator
{
    private EntityManagerInterface $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof EntityExistsConstraint) {
            throw new UnexpectedTypeException($constraint, EntityExistsConstraint::class);
        }

        // Null and empty values are valid (use NotBlank constraint for that)
        if (null === $value || '' === $value) {
            return;
        }

        if (!is_int($value)) {
            throw new UnexpectedValueException($value, 'integer');
        }

        // Check if the entity exists
        $entity = $this->entityManager->getRepository($constraint->entityClass)->find($value);

        if (null === $entity) {
            $this->context->buildViolation($constraint->message)
                ->setParameter('{{ value }}', (string) $value)
                ->addViolation();
        }
    }
}
