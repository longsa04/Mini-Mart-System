package net.cmspos.cmspos.model.dto.purchase;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PurchaseOrderDto {
    private Long supplierId;
    private Long locationId;
    private Double total;
    private LocalDateTime orderDate;
    private List<PurchaseOrderDetailDto> details;
}
