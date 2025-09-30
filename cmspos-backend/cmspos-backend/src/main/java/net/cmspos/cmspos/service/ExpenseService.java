package net.cmspos.cmspos.service;

import java.time.LocalDate;
import java.util.List;
import net.cmspos.cmspos.model.dto.ExpenseDto;
import net.cmspos.cmspos.model.entity.Expense;

public interface ExpenseService {
    Expense createExpense(ExpenseDto expenseDto);

    List<Expense> getExpenses(LocalDate startDate, LocalDate endDate);

    void deleteExpense(Long id);
}
