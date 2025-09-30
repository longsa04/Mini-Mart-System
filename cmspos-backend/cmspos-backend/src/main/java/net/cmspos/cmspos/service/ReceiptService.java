package net.cmspos.cmspos.service;

import net.cmspos.cmspos.model.dto.order.ReceiptResponseDto;
import net.cmspos.cmspos.model.entity.order.Order;

public interface ReceiptService {
    ReceiptResponseDto buildReceipt(Order order);
}
