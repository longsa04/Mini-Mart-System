package net.cmspos.cmspos.model.dto.order;

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
public class ShiftReportUserSummaryDto {
    private Long cashierId;
    private String cashierName;
    private long orderCount;
    private double totalSales;
}
