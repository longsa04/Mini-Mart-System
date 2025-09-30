package net.cmspos.cmspos.controller.inventory;

import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import net.cmspos.cmspos.model.dto.inventory.InventoryAdjustmentRequest;
import net.cmspos.cmspos.model.dto.inventory.StockLevelDto;
import net.cmspos.cmspos.model.dto.inventory.StockMovementDto;
import net.cmspos.cmspos.service.InventoryService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/inventory")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/adjust")
    public ResponseEntity<StockMovementDto> adjustStock(@RequestBody InventoryAdjustmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.adjustStock(request));
    }

    @GetMapping("/stock")
    public ResponseEntity<List<StockLevelDto>> getStockLevels(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long locationId) {
        return ResponseEntity.ok(inventoryService.getStockLevels(productId, locationId));
    }

    @GetMapping("/movements")
    public ResponseEntity<List<StockMovementDto>> getMovements(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<StockMovementDto> movements = inventoryService.getMovements(productId, startDate, endDate);
        return ResponseEntity.ok(movements);
    }
}
