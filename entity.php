// src/Entity/BaseEntity.php
use Doctrine\ORM\Mapping as ORM;

#[ORM\MappedSuperclass]
abstract class BaseEntity
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(type: 'datetime')]
    private ?\DateTimeInterface $createdAt = null;

    // Add all your common fields here
    
    // Getters and setters...
}


// src/Entity/EntityOne.php
#[ORM\Entity]
class EntityOne extends BaseEntity
{
    // Inherits all fields from BaseEntity
}

// src/Entity/EntityTwo.php
#[ORM\Entity]
class EntityTwo extends BaseEntity
{
    // Inherits all fields from BaseEntity
}
