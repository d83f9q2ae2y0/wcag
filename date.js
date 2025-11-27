// src/Repository/YourEntityRepository.php

namespace App\Repository;

use App\Entity\YourEntity;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class YourEntityRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, YourEntity::class);
    }

    /**
     * Find entities between two dates
     *
     * @param \DateTimeInterface $startDate
     * @param \DateTimeInterface $endDate
     * @return YourEntity[]
     */
    public function findByDateRange(\DateTimeInterface $startDate, \DateTimeInterface $endDate): array
    {
        return $this->createQueryBuilder('e')
            ->andWhere('e.createdAt >= :startDate')
            ->andWhere('e.createdAt <= :endDate')
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate)
            ->orderBy('e.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}

// src/Service/YourEntityService.php

namespace App\Service;

use App\Repository\YourEntityRepository;

class YourEntityService
{
    private YourEntityRepository $repository;

    public function __construct(YourEntityRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Helper method that accepts start and end dates
     *
     * @param \DateTimeInterface $startDate
     * @param \DateTimeInterface $endDate
     * @return array
     */
    public function getEntitiesByDateRange(\DateTimeInterface $startDate, \DateTimeInterface $endDate): array
    {
        return $this->repository->findByDateRange($startDate, $endDate);
    }

    /**
     * Helper method that accepts a year
     *
     * @param int $year
     * @return array
     * @throws \Exception
     */
    public function getEntitiesByYear(int $year): array
    {
        $startDate = new \DateTime("$year-01-01 00:00:00");
        $endDate = new \DateTime("$year-12-31 23:59:59");
        
        return $this->repository->findByDateRange($startDate, $endDate);
    }
}
