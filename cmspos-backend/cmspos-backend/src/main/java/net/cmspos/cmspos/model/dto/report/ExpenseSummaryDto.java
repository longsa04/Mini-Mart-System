package net.cmspos.cmspos.model.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.cmspos.cmspos.model.enums.ExpenseCategory;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseSummaryDto {
    private ExpenseCategory category;
    private double totalAmount;
}
