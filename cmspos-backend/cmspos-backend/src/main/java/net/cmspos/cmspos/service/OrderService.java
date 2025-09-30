package net.cmspos.cmspos.service;

import java.time.LocalDate;
import java.util.List;
import net.cmspos.cmspos.model.dto.order.OrderDto;
import net.cmspos.cmspos.model.dto.order.ReceiptResponseDto;
import net.cmspos.cmspos.model.dto.order.ShiftReportDto;
import net.cmspos.cmspos.model.entity.order.Order;
import net.cmspos.cmspos.model.enums.PaymentStatus;
import net.cmspos.cmspos.model.enums.Shift;

public interface OrderService {
    List<Order> getAllOrders();
    Order createOrder(OrderDto orderDto);
    Order getOrderById(Long id);
    Order updatePaymentStatus(Long id, PaymentStatus status);
    Order deleteOrder(Long id);
    ReceiptResponseDto generateReceipt(Long orderId);
    ShiftReportDto getShiftReport(Shift shift, LocalDate date);
}
