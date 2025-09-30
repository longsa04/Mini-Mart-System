package net.cmspos.cmspos.model.dto.inventory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.cmspos.cmspos.model.enums.StockMovementType;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryAdjustmentRequest {

    private Long productId;

    private Long locationId;

    private StockMovementType movementType;

    private Integer quantity;

    private String reference;

    private String note;
}
