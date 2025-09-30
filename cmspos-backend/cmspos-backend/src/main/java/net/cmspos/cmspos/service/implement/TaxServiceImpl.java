package net.cmspos.cmspos.service.implement;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import net.cmspos.cmspos.exception.BadRequestException;
import net.cmspos.cmspos.exception.ResourceNotFoundException;
import net.cmspos.cmspos.model.dto.TaxDto;
import net.cmspos.cmspos.model.entity.Tax;
import net.cmspos.cmspos.model.entity.order.Order;
import net.cmspos.cmspos.model.entity.purchase.PurchaseOrder;
import net.cmspos.cmspos.model.enums.TaxType;
import net.cmspos.cmspos.repository.TaxRepository;
import net.cmspos.cmspos.repository.order.OrderRepository;
import net.cmspos.cmspos.repository.purchase.PurchaseOrderRepository;
import net.cmspos.cmspos.service.TaxService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TaxServiceImpl implements TaxService {

    private final TaxRepository taxRepository;
    private final OrderRepository orderRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    @Override
    public Tax recordTax(TaxDto taxDto) {
        if (taxDto.getTaxAmount() == null || taxDto.getTaxAmount() <= 0) {
            throw new BadRequestException("Tax amount must be greater than zero");
        }

        Order order = null;
        if (taxDto.getOrderId() != null) {
            order = orderRepository.findById(taxDto.getOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + taxDto.getOrderId()));
        }

        PurchaseOrder purchaseOrder = null;
        if (taxDto.getPurchaseOrderId() != null) {
            purchaseOrder = purchaseOrderRepository.findById(taxDto.getPurchaseOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found with id: " + taxDto.getPurchaseOrderId()));
        }

        if (order == null && purchaseOrder == null) {
            throw new BadRequestException("Either orderId or purchaseOrderId must be provided for a tax record");
        }

        Tax tax = Tax.builder()
                .order(order)
                .purchaseOrder(purchaseOrder)
                .taxAmount(taxDto.getTaxAmount())
                .type(Optional.ofNullable(taxDto.getType()).orElse(TaxType.SALES))
                .taxDate(Optional.ofNullable(taxDto.getTaxDate()).orElse(LocalDateTime.now()))
                .build();

        return taxRepository.save(tax);
    }

    @Override
    public List<Tax> getTaxes(LocalDate startDate, LocalDate endDate) {
        LocalDate effectiveEnd = Optional.ofNullable(endDate).orElse(LocalDate.now());
        LocalDate effectiveStart = Optional.ofNullable(startDate).orElse(effectiveEnd.minusMonths(1));

        LocalDateTime start = effectiveStart.atStartOfDay();
        LocalDateTime end = effectiveEnd.plusDays(1).atStartOfDay();
        return taxRepository.findByTaxDateBetween(start, end);
    }
}
