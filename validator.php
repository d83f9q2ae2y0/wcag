// src/Controller/EntityController.php

namespace App\Controller;

use App\Entity\EntityOne;
use App\Service\EntityValidationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class EntityController extends AbstractController
{
    public function __construct(
        private EntityValidationService $validationService,
        private EntityManagerInterface $entityManager
    ) {}

    #[Route('/api/entity-one', name: 'create_entity_one', methods: ['POST'])]
    public function createEntityOne(Request $request): JsonResponse
    {
        // Decode JSON
        $data = json_decode($request->getContent(), true);
        
        if ($data === null) {
            return $this->json(['error' => 'Invalid JSON'], Response::HTTP_BAD_REQUEST);
        }

        // Validate data for creation (includes uniqueness check)
        $errors = $this->validationService->validateForCreate($data, EntityOne::class);
        
        if (!empty($errors)) {
            return $this->json([
                'error' => 'Validation failed',
                'details' => $errors
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Create and populate entity
        $entity = new EntityOne();
        $entity->setName($data['name']);
        $entity->setEmail($data['email']);
        $entity->setAge($data['age']);
        $entity->setStatus($data['status']);
        $entity->setCreatedAt(new \DateTime());

        // Persist and flush
        $this->entityManager->persist($entity);
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Entity created successfully',
            'id' => $entity->getId()
        ], Response::HTTP_CREATED);
    }

    #[Route('/api/entity-one/{id}', name: 'update_entity_one', methods: ['PUT', 'PATCH'])]
    public function updateEntityOne(int $id, Request $request): JsonResponse
    {
        // Find existing entity
        $entity = $this->entityManager->getRepository(EntityOne::class)->find($id);
        
        if (!$entity) {
            return $this->json(['error' => 'Entity not found'], Response::HTTP_NOT_FOUND);
        }

        // Decode JSON
        $data = json_decode($request->getContent(), true);
        
        if ($data === null) {
            return $this->json(['error' => 'Invalid JSON'], Response::HTTP_BAD_REQUEST);
        }

        // Validate data for update (allows partial data, excludes current entity from uniqueness check)
        $errors = $this->validationService->validateForUpdate($data, EntityOne::class, $id);
        
        if (!empty($errors)) {
            return $this->json([
                'error' => 'Validation failed',
                'details' => $errors
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Update only provided fields
        if (isset($data['name'])) {
            $entity->setName($data['name']);
        }
        if (isset($data['email'])) {
            $entity->setEmail($data['email']);
        }
        if (isset($data['age'])) {
            $entity->setAge($data['age']);
        }
        if (isset($data['status'])) {
            $entity->setStatus($data['status']);
        }

        $entity->setUpdatedAt(new \DateTime());

        // Flush changes
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Entity updated successfully',
            'id' => $entity->getId()
        ], Response::HTTP_OK);
    }
}


<?php
// src/Service/EntityValidationService.php

namespace App\Service;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\ConstraintViolationListInterface;

class EntityValidationService
{
    public function __construct(
        private ValidatorInterface $validator,
        private EntityManagerInterface $entityManager
    ) {}

    /**
     * Validates JSON data for creating a new entity
     * 
     * @param array $data The decoded JSON data
     * @param string $entityClass The entity class name (e.g., EntityOne::class)
     * @return array Empty if valid, otherwise array of error messages
     */
    public function validateForCreate(array $data, string $entityClass): array
    {
        // Get constraints for the entity
        $constraints = $this->getConstraintsForEntity($entityClass);
        
        // Validate the data against constraints
        $violations = $this->validator->validate($data, $constraints);
        
        $errors = [];
        
        // Add constraint violations to errors
        foreach ($violations as $violation) {
            $errors[$violation->getPropertyPath()] = $violation->getMessage();
        }
        
        // Check if entity with same name already exists
        if (isset($data['name'])) {
            $repository = $this->entityManager->getRepository($entityClass);
            $existing = $repository->findOneBy(['name' => $data['name']]);
            
            if ($existing !== null) {
                $errors['name'] = sprintf('An entity with name "%s" already exists', $data['name']);
            }
        }

        return $errors;
    }

    /**
     * Validates JSON data for updating an existing entity
     * 
     * @param array $data The decoded JSON data
     * @param string $entityClass The entity class name
     * @param int $entityId The ID of the entity being updated
     * @return array Empty if valid, otherwise array of error messages
     */
    public function validateForUpdate(array $data, string $entityClass, int $entityId): array
    {
        // Get constraints for the entity (allowing partial data for updates)
        $constraints = $this->getConstraintsForEntity($entityClass, true);
        
        // Validate the data against constraints
        $violations = $this->validator->validate($data, $constraints);
        
        $errors = [];
        
        // Add constraint violations to errors
        foreach ($violations as $violation) {
            $errors[$violation->getPropertyPath()] = $violation->getMessage();
        }
        
        // Check if entity with same name already exists (excluding current entity)
        if (isset($data['name'])) {
            $repository = $this->entityManager->getRepository($entityClass);
            $qb = $repository->createQueryBuilder('e')
                ->where('e.name = :name')
                ->andWhere('e.id != :id')
                ->setParameter('name', $data['name'])
                ->setParameter('id', $entityId)
                ->setMaxResults(1);
            
            $existing = $qb->getQuery()->getOneOrNullResult();
            
            if ($existing !== null) {
                $errors['name'] = sprintf('An entity with name "%s" already exists', $data['name']);
            }
        }

        return $errors;
    }

    /**
     * Define constraints for entity validation
     * You can customize this based on your BaseEntity fields
     * 
     * @param string $entityClass The entity class name
     * @param bool $allowMissing Whether to allow missing fields (for updates)
     */
    private function getConstraintsForEntity(string $entityClass, bool $allowMissing = false): Assert\Collection
    {
        return new Assert\Collection([
            'fields' => [
                'name' => [
                    new Assert\NotBlank(['message' => 'Name cannot be blank']),
                    new Assert\Length([
                        'min' => 3,
                        'max' => 255,
                        'minMessage' => 'Name must be at least {{ limit }} characters',
                        'maxMessage' => 'Name cannot be longer than {{ limit }} characters',
                    ]),
                ],
                'email' => [
                    new Assert\NotBlank(),
                    new Assert\Email(['message' => 'Invalid email address']),
                ],
                'age' => [
                    new Assert\NotBlank(),
                    new Assert\Type(['type' => 'integer', 'message' => 'Age must be an integer']),
                    new Assert\Positive(['message' => 'Age must be positive']),
                    new Assert\Range([
                        'min' => 18,
                        'max' => 120,
                        'notInRangeMessage' => 'Age must be between {{ min }} and {{ max }}',
                    ]),
                ],
                'status' => [
                    new Assert\Choice([
                        'choices' => ['active', 'inactive', 'pending'],
                        'message' => 'Invalid status value',
                    ]),
                ],
                // Add more fields as needed
            ],
            'allowExtraFields' => false,
            'allowMissingFields' => $allowMissing, // For updates, allow partial data
            'extraFieldsMessage' => 'Field "{{ field }}" is not allowed',
            'missingFieldsMessage' => 'Field "{{ field }}" is required',
        ]);
    }
}
