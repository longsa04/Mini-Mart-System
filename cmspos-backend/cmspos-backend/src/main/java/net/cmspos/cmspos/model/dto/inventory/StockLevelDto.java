package net.cmspos.cmspos.model.dto.inventory;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class StockLevelDto {
    private Long stockId;
    private Long productId;
    private String productName;
    private String sku;
    private String categoryName;
    private Long locationId;
    private String locationName;
    private Integer quantity;
    private LocalDateTime lastUpdated;
}
