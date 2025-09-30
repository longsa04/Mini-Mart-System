package net.cmspos.cmspos.service;

import java.time.LocalDate;
import java.util.List;
import net.cmspos.cmspos.model.dto.inventory.InventoryAdjustmentRequest;
import net.cmspos.cmspos.model.dto.inventory.StockLevelDto;
import net.cmspos.cmspos.model.dto.inventory.StockMovementDto;

public interface InventoryService {
    StockMovementDto adjustStock(InventoryAdjustmentRequest request);

    List<StockMovementDto> getMovements(Long productId, LocalDate startDate, LocalDate endDate);

    List<StockLevelDto> getStockLevels(Long productId, Long locationId);
}

