package net.cmspos.cmspos.model.dto.report;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailySalesSummaryDto {
    private LocalDate date;
    private double totalSales;
    private double totalTax;
    private long orderCount;
    private double averageOrderValue;
}
