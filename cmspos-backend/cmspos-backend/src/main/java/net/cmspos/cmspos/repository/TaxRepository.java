package net.cmspos.cmspos.repository;

import java.time.LocalDateTime;
import java.util.List;
import net.cmspos.cmspos.model.entity.Tax;
import net.cmspos.cmspos.model.enums.TaxType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaxRepository extends JpaRepository<Tax, Long> {
    List<Tax> findByType(TaxType type);

    List<Tax> findByTaxDateBetween(LocalDateTime start, LocalDateTime end);
}
