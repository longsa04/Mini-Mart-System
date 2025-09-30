package net.cmspos.cmspos.service.implement;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import net.cmspos.cmspos.exception.BadRequestException;
import net.cmspos.cmspos.exception.ResourceNotFoundException;
import net.cmspos.cmspos.model.dto.ExpenseDto;
import net.cmspos.cmspos.model.entity.Expense;
import net.cmspos.cmspos.model.entity.Location;
import net.cmspos.cmspos.model.entity.User;
import net.cmspos.cmspos.model.enums.ExpenseCategory;
import net.cmspos.cmspos.repository.ExpenseRepository;
import net.cmspos.cmspos.repository.LocationRepository;
import net.cmspos.cmspos.repository.UserRepository;
import net.cmspos.cmspos.service.ExpenseService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;

    @Override
    public Expense createExpense(ExpenseDto expenseDto) {
        if (expenseDto.getLocationId() == null) {
            throw new BadRequestException("Location id is required for an expense");
        }
        if (expenseDto.getDescription() == null || expenseDto.getDescription().isBlank()) {
            throw new BadRequestException("Description is required for an expense");
        }
        if (expenseDto.getAmount() == null || expenseDto.getAmount() <= 0) {
            throw new BadRequestException("Expense amount must be greater than zero");
        }

        Location location = locationRepository.findById(expenseDto.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + expenseDto.getLocationId()));

        User user = null;
        if (expenseDto.getUserId() != null) {
            user = userRepository.findById(expenseDto.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + expenseDto.getUserId()));
        }

        Expense expense = Expense.builder()
                .location(location)
                .user(user)
                .description(expenseDto.getDescription())
                .amount(expenseDto.getAmount())
                .category(Optional.ofNullable(expenseDto.getCategory()).orElse(ExpenseCategory.OTHER))
                .expenseDate(Optional.ofNullable(expenseDto.getExpenseDate()).orElse(LocalDateTime.now()))
                .build();

        return expenseRepository.save(expense);
    }

    @Override
    public List<Expense> getExpenses(LocalDate startDate, LocalDate endDate) {
        LocalDate effectiveEnd = Optional.ofNullable(endDate).orElse(LocalDate.now());
        LocalDate effectiveStart = Optional.ofNullable(startDate).orElse(effectiveEnd.minusMonths(1));
        LocalDateTime start = effectiveStart.atStartOfDay();
        LocalDateTime end = effectiveEnd.plusDays(1).atStartOfDay();
        return expenseRepository.findByExpenseDateBetween(start, end);
    }

    @Override
    public void deleteExpense(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));
        expenseRepository.delete(expense);
    }
}
