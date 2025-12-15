<?php

namespace App\Service;

use Doctrine\ORM\EntityManagerInterface;

class BookStatisticsService
{
    private EntityManagerInterface $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function getBookStatistics(): array
    {
        return [
            'booksReleasedByTypeAndMonth' => $this->getBooksReleasedByTypeAndMonth(),
            'booksReleasedByTypeAndYear' => $this->getBooksReleasedByTypeAndYear(),
            'booksCreatedByMonth' => $this->getBooksCreatedByMonth(),
            'booksCreatedByYear' => $this->getBooksCreatedByYear(),
        ];
    }

    /**
     * Get books released per type and per month across multiple years
     */
    private function getBooksReleasedByTypeAndMonth(): array
    {
        $qb = $this->entityManager->createQueryBuilder();
        
        $results = $qb
            ->select(
                'bt.id as type_id',
                'bt.label as type_label',
                'YEAR(b.releaseDate) as year',
                'MONTH(b.releaseDate) as month',
                'COUNT(b.id) as count'
            )
            ->from('App\Entity\Book', 'b')
            ->innerJoin('b.bookType', 'bt')
            ->where('b.releaseDate IS NOT NULL')
            ->groupBy('bt.id', 'bt.label', 'year', 'month')
            ->orderBy('year', 'ASC')
            ->addOrderBy('month', 'ASC')
            ->addOrderBy('bt.label', 'ASC')
            ->getQuery()
            ->getResult();

        return $this->formatByTypeAndMonth($results);
    }

    /**
     * Get books released per type and per year
     */
    private function getBooksReleasedByTypeAndYear(): array
    {
        $qb = $this->entityManager->createQueryBuilder();
        
        $results = $qb
            ->select(
                'bt.id as type_id',
                'bt.label as type_label',
                'YEAR(b.releaseDate) as year',
                'COUNT(b.id) as count'
            )
            ->from('App\Entity\Book', 'b')
            ->innerJoin('b.bookType', 'bt')
            ->where('b.releaseDate IS NOT NULL')
            ->groupBy('bt.id', 'bt.label', 'year')
            ->orderBy('year', 'ASC')
            ->addOrderBy('bt.label', 'ASC')
            ->getQuery()
            ->getResult();

        return $this->formatByTypeAndYear($results);
    }

    /**
     * Get books created per month across multiple years
     */
    private function getBooksCreatedByMonth(): array
    {
        $qb = $this->entityManager->createQueryBuilder();
        
        $results = $qb
            ->select(
                'YEAR(b.createdAt) as year',
                'MONTH(b.createdAt) as month',
                'COUNT(b.id) as count'
            )
            ->from('App\Entity\Book', 'b')
            ->where('b.createdAt IS NOT NULL')
            ->groupBy('year', 'month')
            ->orderBy('year', 'ASC')
            ->addOrderBy('month', 'ASC')
            ->getQuery()
            ->getResult();

        return $this->formatByMonth($results);
    }

    /**
     * Get books created per year
     */
    private function getBooksCreatedByYear(): array
    {
        $qb = $this->entityManager->createQueryBuilder();
        
        $results = $qb
            ->select(
                'YEAR(b.createdAt) as year',
                'COUNT(b.id) as count'
            )
            ->from('App\Entity\Book', 'b')
            ->where('b.createdAt IS NOT NULL')
            ->groupBy('year')
            ->orderBy('year', 'ASC')
            ->getQuery()
            ->getResult();

        return array_map(function($row) {
            return [
                'year' => (int)$row['year'],
                'count' => (int)$row['count']
            ];
        }, $results);
    }

    /**
     * Format data for books by type and month
     */
    private function formatByTypeAndMonth(array $results): array
    {
        $formatted = [
            'types' => [],
            'years' => [],
            'data' => []
        ];

        $types = [];
        $years = [];

        foreach ($results as $row) {
            $typeId = $row['type_id'];
            $typeLabel = $row['type_label'];
            $year = (int)$row['year'];
            $month = (int)$row['month'];
            $count = (int)$row['count'];

            // Collect unique types and years
            if (!isset($types[$typeId])) {
                $types[$typeId] = $typeLabel;
            }
            if (!in_array($year, $years)) {
                $years[] = $year;
            }

            // Store data
            if (!isset($formatted['data'][$typeId])) {
                $formatted['data'][$typeId] = [];
            }
            if (!isset($formatted['data'][$typeId][$year])) {
                $formatted['data'][$typeId][$year] = array_fill(1, 12, 0);
            }
            $formatted['data'][$typeId][$year][$month] = $count;
        }

        // Format the output
        $formatted['types'] = array_map(function($id, $label) {
            return ['id' => $id, 'label' => $label];
        }, array_keys($types), $types);

        sort($years);
        $formatted['years'] = $years;

        // Convert data to array format
        $dataArray = [];
        foreach ($formatted['data'] as $typeId => $yearData) {
            $typeLabel = $types[$typeId];
            foreach ($yearData as $year => $monthData) {
                $dataArray[] = [
                    'typeId' => $typeId,
                    'typeLabel' => $typeLabel,
                    'year' => $year,
                    'months' => array_values($monthData)
                ];
            }
        }
        $formatted['data'] = $dataArray;

        return $formatted;
    }

    /**
     * Format data for books by type and year
     */
    private function formatByTypeAndYear(array $results): array
    {
        $formatted = [
            'types' => [],
            'years' => [],
            'data' => []
        ];

        $types = [];
        $years = [];

        foreach ($results as $row) {
            $typeId = $row['type_id'];
            $typeLabel = $row['type_label'];
            $year = (int)$row['year'];
            $count = (int)$row['count'];

            // Collect unique types and years
            if (!isset($types[$typeId])) {
                $types[$typeId] = $typeLabel;
            }
            if (!in_array($year, $years)) {
                $years[] = $year;
            }

            // Store data
            $formatted['data'][] = [
                'typeId' => $typeId,
                'typeLabel' => $typeLabel,
                'year' => $year,
                'count' => $count
            ];
        }

        // Format types
        $formatted['types'] = array_map(function($id, $label) {
            return ['id' => $id, 'label' => $label];
        }, array_keys($types), $types);

        sort($years);
        $formatted['years'] = $years;

        return $formatted;
    }

    /**
     * Format data for books by month
     */
    private function formatByMonth(array $results): array
    {
        $formatted = [
            'years' => [],
            'data' => []
        ];

        $years = [];
        $data = [];

        foreach ($results as $row) {
            $year = (int)$row['year'];
            $month = (int)$row['month'];
            $count = (int)$row['count'];

            if (!in_array($year, $years)) {
                $years[] = $year;
            }

            if (!isset($data[$year])) {
                $data[$year] = array_fill(1, 12, 0);
            }
            $data[$year][$month] = $count;
        }

        sort($years);
        $formatted['years'] = $years;

        // Convert to array format
        $dataArray = [];
        foreach ($data as $year => $monthData) {
            $dataArray[] = [
                'year' => $year,
                'months' => array_values($monthData)
            ];
        }
        $formatted['data'] = $dataArray;

        return $formatted;
    }
}
