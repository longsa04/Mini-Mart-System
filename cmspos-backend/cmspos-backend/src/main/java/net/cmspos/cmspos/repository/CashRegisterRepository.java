package net.cmspos.cmspos.repository;

import java.time.LocalDate;
import java.util.List;
import net.cmspos.cmspos.model.entity.CashRegister;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CashRegisterRepository extends JpaRepository<CashRegister, Long> {
    List<CashRegister> findByRegisterDate(LocalDate date);
}
