package net.cmspos.cmspos.model.dto;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import net.cmspos.cmspos.model.enums.TaxType;

@Getter
@Setter
public class TaxDto {
    private Long orderId;
    private Long purchaseOrderId;
    private Double taxAmount;
    private TaxType type;
    private LocalDateTime taxDate;
}
