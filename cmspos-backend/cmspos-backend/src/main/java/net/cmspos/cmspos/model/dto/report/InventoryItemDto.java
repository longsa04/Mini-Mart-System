package net.cmspos.cmspos.model.dto.report;

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
public class InventoryItemDto {
    private Long productId;
    private String productName;
    private int stockQuantity;
    private double unitPrice;
    private double stockValue;
}
