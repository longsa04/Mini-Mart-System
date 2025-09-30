package net.cmspos.cmspos.service.implement;

import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import net.cmspos.cmspos.exception.BadRequestException;
import net.cmspos.cmspos.exception.ResourceNotFoundException;
import net.cmspos.cmspos.model.dto.PaymentDto;
import net.cmspos.cmspos.model.entity.Payment;
import net.cmspos.cmspos.model.entity.User;
import net.cmspos.cmspos.model.entity.order.Order;
import net.cmspos.cmspos.model.enums.PaymentMethod;
import net.cmspos.cmspos.model.enums.PaymentStatus;
import net.cmspos.cmspos.repository.PaymentRepository;
import net.cmspos.cmspos.repository.UserRepository;
import net.cmspos.cmspos.service.OrderService;
import net.cmspos.cmspos.service.PaymentService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final OrderService orderService;

    @Override
    @Transactional
    public Payment recordPayment(PaymentDto paymentDto) {
        if (paymentDto.getOrderId() == null) {
            throw new BadRequestException("Order id is required for a payment");
        }
        if (paymentDto.getUserId() == null) {
            throw new BadRequestException("User id is required for a payment");
        }

        Order order = orderService.getOrderById(paymentDto.getOrderId());
        User user = userRepository.findById(paymentDto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + paymentDto.getUserId()));

        Payment payment = Payment.builder()
                .order(order)
                .user(user)
                .method(Optional.ofNullable(paymentDto.getMethod()).orElse(PaymentMethod.CASH))
                .amount(Optional.ofNullable(paymentDto.getAmount()).orElse(0.0))
                .receivedAmount(paymentDto.getReceivedAmount())
                .changeAmount(paymentDto.getChangeAmount())
                .build();

        Payment saved = paymentRepository.save(payment);

        double orderTotal = Optional.ofNullable(order.getTotal()).orElse(0.0);
        double paymentAmount = Optional.ofNullable(payment.getAmount()).orElse(0.0);
        if (order.getPaymentStatus() != PaymentStatus.CANCELLED && paymentAmount >= orderTotal) {
            orderService.updatePaymentStatus(order.getOrderId(), PaymentStatus.PAID);
        }

        return saved;
    }

    @Override
    public List<Payment> getPaymentsByOrder(Long orderId) {
        Order order = orderService.getOrderById(orderId);
        return paymentRepository.findByOrder(order);
    }
}

