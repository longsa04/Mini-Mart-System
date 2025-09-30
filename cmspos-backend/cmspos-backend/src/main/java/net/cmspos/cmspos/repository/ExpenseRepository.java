package net.cmspos.cmspos.repository;

import java.time.LocalDateTime;
import java.util.List;
import net.cmspos.cmspos.model.entity.Expense;
import net.cmspos.cmspos.model.enums.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByExpenseDateBetween(LocalDateTime start, LocalDateTime end);

    List<Expense> findByCategory(ExpenseCategory category);
}
