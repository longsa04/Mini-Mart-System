package net.cmspos.cmspos.service.implement;

import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import net.cmspos.cmspos.exception.BadRequestException;
import net.cmspos.cmspos.exception.ResourceNotFoundException;
import net.cmspos.cmspos.model.dto.inventory.InventoryAdjustmentRequest;
import net.cmspos.cmspos.model.dto.inventory.StockLevelDto;
import net.cmspos.cmspos.model.dto.inventory.StockMovementDto;
import net.cmspos.cmspos.model.entity.Location;
import net.cmspos.cmspos.model.entity.Product;
import net.cmspos.cmspos.model.entity.inventory.Stock;
import net.cmspos.cmspos.model.entity.inventory.StockMovement;
import net.cmspos.cmspos.model.enums.StockMovementType;
import net.cmspos.cmspos.repository.LocationRepository;
import net.cmspos.cmspos.repository.ProductRepository;
import net.cmspos.cmspos.repository.inventory.StockMovementRepository;
import net.cmspos.cmspos.repository.inventory.StockRepository;
import net.cmspos.cmspos.service.InventoryService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final ProductRepository productRepository;
    private final LocationRepository locationRepository;
    private final StockRepository stockRepository;
    private final StockMovementRepository stockMovementRepository;

    @Override
    @Transactional
    public StockMovementDto adjustStock(InventoryAdjustmentRequest request) {
        if (request.getLocationId() == null) {
            throw new BadRequestException("Location id is required for stock adjustments");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product with id " + request.getProductId() + " not found"));

        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location with id " + request.getLocationId() + " not found"));

        int quantity = Optional.ofNullable(request.getQuantity()).orElse(0);
        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than zero");
        }

        StockMovementType movementType = Optional.ofNullable(request.getMovementType())
                .orElse(StockMovementType.ADJUSTMENT);

        int change = resolveQuantityChange(movementType, quantity);

        Stock stock = stockRepository.findByProductAndLocation(product, location)
                .orElseGet(() -> Stock.builder()
                        .product(product)
                        .location(location)
                        .quantity(0)
                        .build());

        int updatedQuantity = Optional.ofNullable(stock.getQuantity()).orElse(0) + change;
        if (updatedQuantity < 0) {
            throw new BadRequestException("Adjustment would result in negative stock for product " + product.getName()
                    + " at location " + location.getName());
        }
        stock.setQuantity(updatedQuantity);
        stockRepository.save(stock);

        StockMovement movement = StockMovement.builder()
                .product(product)
                .location(location)
                .movementType(movementType)
                .quantityChange(change)
                .reference(request.getReference())
                .note(request.getNote())
                .build();

        StockMovement saved = stockMovementRepository.save(movement);
        return toDto(saved, updatedQuantity);
    }

    @Override
    public List<StockMovementDto> getMovements(Long productId, LocalDate startDate, LocalDate endDate) {
        LocalDate effectiveEnd = Optional.ofNullable(endDate).orElse(LocalDate.now());
        LocalDate effectiveStart = Optional.ofNullable(startDate).orElse(effectiveEnd.minusDays(30));
        if (effectiveEnd.isBefore(effectiveStart)) {
            throw new BadRequestException("End date cannot be before start date");
        }

        LocalDateTime start = effectiveStart.atStartOfDay();
        LocalDateTime end = effectiveEnd.plusDays(1).atStartOfDay();

        List<StockMovement> movements;
        if (productId != null) {
            movements = stockMovementRepository
                    .findByProduct_ProductIdAndCreatedAtBetweenOrderByCreatedAtDesc(productId, start, end);
        } else {
            movements = stockMovementRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(start, end);
        }

        return movements.stream()
                .map(movement -> toDto(movement, null))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockLevelDto> getStockLevels(Long productId, Long locationId) {
        if (locationId != null) {
            Location location = locationRepository.findById(locationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Location with id " + locationId + " not found"));

            List<Product> productScope;
            if (productId != null) {
                Product product = productRepository.findById(productId)
                        .orElseThrow(() -> new ResourceNotFoundException("Product with id " + productId + " not found"));
                productScope = List.of(product);
            } else {
                productScope = productRepository.findAll();
            }

            List<Stock> stocksAtLocation = stockRepository.findByLocation_LocationId(locationId);
            Map<Long, Stock> stockByProduct = stocksAtLocation.stream()
                    .filter(stock -> stock.getProduct() != null)
                    .collect(Collectors.toMap(stock -> stock.getProduct().getProductId(), Function.identity(), (existing, replacement) -> replacement));

            return productScope.stream()
                    .map(product -> toStockLevelDto(product, location, stockByProduct.get(product.getProductId())))
                    .collect(Collectors.toList());
        }

        List<Stock> stocks;
        if (productId != null) {
            stocks = stockRepository.findByProduct_ProductId(productId);
            if (stocks.isEmpty()) {
                Product product = productRepository.findById(productId)
                        .orElseThrow(() -> new ResourceNotFoundException("Product with id " + productId + " not found"));
                return List.of(toStockLevelDto(product, null, null));
            }
        } else {
            stocks = stockRepository.findAll();
        }

        return stocks.stream()
                .map(this::toStockLevelDto)
                .collect(Collectors.toList());
    }

    private StockLevelDto toStockLevelDto(Product product, Location overrideLocation, Stock stock) {
        Product resolvedProduct = product != null ? product : (stock != null ? stock.getProduct() : null);
        Location resolvedLocation = overrideLocation != null ? overrideLocation : (stock != null ? stock.getLocation() : null);

        return StockLevelDto.builder()
                .stockId(stock != null ? stock.getStockId() : null)
                .productId(resolvedProduct != null ? resolvedProduct.getProductId() : null)
                .productName(resolvedProduct != null ? resolvedProduct.getName() : null)
                .sku(resolvedProduct != null ? resolvedProduct.getSku() : null)
                .categoryName(resolvedProduct != null && resolvedProduct.getCategory() != null
                        ? resolvedProduct.getCategory().getName()
                        : null)
                .locationId(resolvedLocation != null ? resolvedLocation.getLocationId() : null)
                .locationName(resolvedLocation != null ? resolvedLocation.getName() : null)
                .quantity(stock != null ? Optional.ofNullable(stock.getQuantity()).orElse(0) : 0)
                .lastUpdated(stock != null ? stock.getLastUpdated() : null)
                .build();
    }

    private StockLevelDto toStockLevelDto(Stock stock) {
        Product product = stock.getProduct();
        Location location = stock.getLocation();
        return StockLevelDto.builder()
                .stockId(stock.getStockId())
                .productId(product != null ? product.getProductId() : null)
                .productName(product != null ? product.getName() : null)
                .sku(product != null ? product.getSku() : null)
                .categoryName(product != null && product.getCategory() != null ? product.getCategory().getName() : null)
                .locationId(location != null ? location.getLocationId() : null)
                .locationName(location != null ? location.getName() : null)
                .quantity(Optional.ofNullable(stock.getQuantity()).orElse(0))
                .lastUpdated(stock.getLastUpdated())
                .build();
    }

    private int resolveQuantityChange(StockMovementType movementType, int quantity) {
        return switch (movementType) {
            case SALE, TRANSFER -> -quantity;
            case RETURN, RECEIVE, ADJUSTMENT, PURCHASE -> quantity;
        };
    }

    private StockMovementDto toDto(StockMovement movement, Integer resultingQuantity) {
        return StockMovementDto.builder()
                .movementId(movement.getStockMovementId())
                .productId(movement.getProduct() != null ? movement.getProduct().getProductId() : null)
                .productName(movement.getProduct() != null ? movement.getProduct().getName() : null)
                .locationId(movement.getLocation() != null ? movement.getLocation().getLocationId() : null)
                .locationName(movement.getLocation() != null ? movement.getLocation().getName() : null)
                .movementType(movement.getMovementType())
                .quantityChange(movement.getQuantityChange())
                .reference(movement.getReference())
                .note(movement.getNote())
                .createdAt(movement.getCreatedAt())
                .resultingQuantity(resultingQuantity)
                .build();
    }
}



