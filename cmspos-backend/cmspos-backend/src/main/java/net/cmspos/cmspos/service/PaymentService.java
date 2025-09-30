package net.cmspos.cmspos.service;

import java.util.List;
import net.cmspos.cmspos.model.dto.PaymentDto;
import net.cmspos.cmspos.model.entity.Payment;

public interface PaymentService {
    Payment recordPayment(PaymentDto paymentDto);

    List<Payment> getPaymentsByOrder(Long orderId);
}
