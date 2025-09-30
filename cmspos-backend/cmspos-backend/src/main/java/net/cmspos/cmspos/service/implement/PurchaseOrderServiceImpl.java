package net.cmspos.cmspos.service.implement;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import net.cmspos.cmspos.exception.BadRequestException;
import net.cmspos.cmspos.exception.ResourceNotFoundException;
import net.cmspos.cmspos.model.dto.purchase.PurchaseOrderDetailDto;
import net.cmspos.cmspos.model.dto.purchase.PurchaseOrderDto;
import net.cmspos.cmspos.model.dto.purchase.PurchaseOrderLineResponseDto;
import net.cmspos.cmspos.model.dto.purchase.PurchaseOrderResponseDto;
import net.cmspos.cmspos.model.dto.purchase.SimpleReferenceDto;
import net.cmspos.cmspos.model.entity.Location;
import net.cmspos.cmspos.model.entity.Product;
import net.cmspos.cmspos.model.entity.Supplier;
import net.cmspos.cmspos.model.entity.inventory.Stock;
import net.cmspos.cmspos.model.entity.inventory.StockMovement;
import net.cmspos.cmspos.model.entity.purchase.PurchaseOrder;
import net.cmspos.cmspos.model.entity.purchase.PurchaseOrderDetail;
import net.cmspos.cmspos.model.enums.StockMovementType;
import net.cmspos.cmspos.repository.LocationRepository;
import net.cmspos.cmspos.repository.ProductRepository;
import net.cmspos.cmspos.repository.SupplierRepository;
import net.cmspos.cmspos.repository.inventory.StockMovementRepository;
import net.cmspos.cmspos.repository.inventory.StockRepository;
import net.cmspos.cmspos.repository.purchase.PurchaseOrderRepository;
import net.cmspos.cmspos.service.PurchaseOrderService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private static final String PURCHASE_REFERENCE_PREFIX = "PO-";

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final LocationRepository locationRepository;
    private final ProductRepository productRepository;
    private final StockRepository stockRepository;
    private final StockMovementRepository stockMovementRepository;

    @Override
    @Transactional
    public PurchaseOrderResponseDto createPurchaseOrder(PurchaseOrderDto purchaseOrderDto) {
        if (purchaseOrderDto.getDetails() == null || purchaseOrderDto.getDetails().isEmpty()) {
            throw new BadRequestException("Purchase order must include at least one item");
        }

        Location location = locationRepository.findById(purchaseOrderDto.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + purchaseOrderDto.getLocationId()));

        Supplier supplier = null;
        if (purchaseOrderDto.getSupplierId() != null) {
            supplier = supplierRepository.findById(purchaseOrderDto.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + purchaseOrderDto.getSupplierId()));
        }

        PurchaseOrder purchaseOrder = new PurchaseOrder();
        purchaseOrder.setSupplier(supplier);
        purchaseOrder.setLocation(location);
        purchaseOrder.setOrderDate(Optional.ofNullable(purchaseOrderDto.getOrderDate()).orElse(LocalDateTime.now()));

        List<PurchaseOrderDetail> details = new ArrayList<>();
        for (PurchaseOrderDetailDto detailDto : purchaseOrderDto.getDetails()) {
            PurchaseOrderDetail detail = toEntity(purchaseOrder, detailDto);
            details.add(detail);
        }
        purchaseOrder.setDetails(details);

        double calculatedTotal = details.stream()
                .mapToDouble(detail -> Optional.ofNullable(detail.getPrice()).orElse(0.0)
                        * Optional.ofNullable(detail.getQuantity()).orElse(0))
                .sum();
        purchaseOrder.setTotal(Optional.ofNullable(purchaseOrderDto.getTotal()).orElse(calculatedTotal));

        PurchaseOrder saved = purchaseOrderRepository.save(purchaseOrder);
        applyInventoryForPurchase(saved);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrderResponseDto getPurchaseOrder(Long id) {
        PurchaseOrder purchaseOrder = purchaseOrderRepository.findByPurchaseOrderId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found with id: " + id));
        return toResponse(purchaseOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseOrderResponseDto> getPurchaseOrders(LocalDate startDate, LocalDate endDate) {
        LocalDate effectiveEnd = Optional.ofNullable(endDate).orElse(LocalDate.now());
        LocalDate effectiveStart = Optional.ofNullable(startDate).orElse(effectiveEnd.minusMonths(1));

        LocalDateTime start = effectiveStart.atStartOfDay();
        LocalDateTime end = effectiveEnd.plusDays(1).atStartOfDay();
        return purchaseOrderRepository.findByOrderDateBetween(start, end).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private PurchaseOrderDetail toEntity(PurchaseOrder purchaseOrder, PurchaseOrderDetailDto dto) {
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + dto.getProductId()));

        PurchaseOrderDetail detail = new PurchaseOrderDetail();
        detail.setPurchaseOrder(purchaseOrder);
        detail.setProduct(product);
        detail.setQuantity(Optional.ofNullable(dto.getQuantity()).orElse(0));
        detail.setPrice(Optional.ofNullable(dto.getPrice()).orElse(Optional.ofNullable(product.getPrice()).orElse(0.0)));
        return detail;
    }

    private void applyInventoryForPurchase(PurchaseOrder purchaseOrder) {
        purchaseOrder.getDetails().forEach(detail -> {
            Product product = detail.getProduct();
            if (product == null) {
                throw new BadRequestException("Purchase order detail missing product information");
            }
            int quantity = Optional.ofNullable(detail.getQuantity()).orElse(0);
            if (quantity <= 0) {
                return;
            }

            Stock stock = stockRepository.findByProductAndLocation(product, purchaseOrder.getLocation())
                    .orElseGet(() -> Stock.builder()
                            .product(product)
                            .location(purchaseOrder.getLocation())
                            .quantity(0)
                            .build());

            int newQuantity = Optional.ofNullable(stock.getQuantity()).orElse(0) + quantity;
            stock.setQuantity(newQuantity);
            stockRepository.save(stock);

            stockMovementRepository.save(StockMovement.builder()
                    .product(product)
                    .location(purchaseOrder.getLocation())
                    .movementType(StockMovementType.PURCHASE)
                    .quantityChange(quantity)
                    .reference(buildPurchaseReference(purchaseOrder))
                    .note(String.format(Locale.ENGLISH, "Purchase order %d", purchaseOrder.getPurchaseOrderId()))
                    .build());
        });
    }

    private String buildPurchaseReference(PurchaseOrder purchaseOrder) {
        return PURCHASE_REFERENCE_PREFIX + purchaseOrder.getPurchaseOrderId();
    }

    private PurchaseOrderResponseDto toResponse(PurchaseOrder purchaseOrder) {
        List<PurchaseOrderDetail> detailEntities = Optional.ofNullable(purchaseOrder.getDetails())
                .orElse(Collections.emptyList());

        return PurchaseOrderResponseDto.builder()
                .poId(purchaseOrder.getPurchaseOrderId())
                .total(Optional.ofNullable(purchaseOrder.getTotal()).orElse(0.0))
                .orderDate(purchaseOrder.getOrderDate())
                .supplier(toReference(purchaseOrder.getSupplier(), Supplier::getSupplierId, Supplier::getName))
                .location(toReference(purchaseOrder.getLocation(), Location::getLocationId, Location::getName))
                .details(detailEntities.stream()
                        .map(this::toDetailResponse)
                        .collect(Collectors.toList()))
                .build();
    }

    private PurchaseOrderLineResponseDto toDetailResponse(PurchaseOrderDetail detail) {
        return PurchaseOrderLineResponseDto.builder()
                .id(detail.getPurchaseOrderDetailId())
                .quantity(Optional.ofNullable(detail.getQuantity()).orElse(0))
                .price(Optional.ofNullable(detail.getPrice()).orElse(0.0))
                .product(toReference(detail.getProduct(), Product::getProductId, Product::getName))
                .build();
    }

    private <T> SimpleReferenceDto toReference(T source, Function<T, Long> idExtractor, Function<T, String> nameExtractor) {
        if (source == null) {
            return null;
        }
        return SimpleReferenceDto.builder()
                .id(idExtractor.apply(source))
                .name(nameExtractor.apply(source))
                .build();
    }
}
