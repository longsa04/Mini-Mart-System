package net.cmspos.cmspos.model.dto.purchase;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PurchaseOrderDetailDto {
    private Long productId;
    private Integer quantity;
    private Double price;
}
