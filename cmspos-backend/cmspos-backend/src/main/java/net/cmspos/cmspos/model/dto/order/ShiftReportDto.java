package net.cmspos.cmspos.model.dto.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.cmspos.cmspos.model.enums.Shift;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShiftReportDto {
    private Shift shift;
    private LocalDate date;
    private double totalSales;
    private double totalTax;
    private long completedOrders;
    private long pendingOrders;
    private long voidOrders;
    private List<ShiftReportUserSummaryDto> cashierSummaries;
}
