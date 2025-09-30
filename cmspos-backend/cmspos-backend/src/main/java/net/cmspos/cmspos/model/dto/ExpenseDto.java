package net.cmspos.cmspos.model.dto;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import net.cmspos.cmspos.model.enums.ExpenseCategory;

@Getter
@Setter
public class ExpenseDto {
    private Long locationId;
    private Long userId;
    private String description;
    private Double amount;
    private ExpenseCategory category;
    private LocalDateTime expenseDate;
}
