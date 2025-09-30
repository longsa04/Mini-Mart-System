package net.cmspos.cmspos.service;

import java.time.LocalDate;
import java.util.List;
import net.cmspos.cmspos.model.dto.purchase.PurchaseOrderDto;
import net.cmspos.cmspos.model.dto.purchase.PurchaseOrderResponseDto;

public interface PurchaseOrderService {
    PurchaseOrderResponseDto createPurchaseOrder(PurchaseOrderDto purchaseOrderDto);

    PurchaseOrderResponseDto getPurchaseOrder(Long id);

    List<PurchaseOrderResponseDto> getPurchaseOrders(LocalDate startDate, LocalDate endDate);
}
