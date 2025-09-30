package net.cmspos.cmspos.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import net.cmspos.cmspos.model.dto.PaymentDto;
import net.cmspos.cmspos.model.entity.Payment;
import net.cmspos.cmspos.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/payments")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<Payment> recordPayment(@RequestBody PaymentDto paymentDto) {
        Payment payment = paymentService.recordPayment(paymentDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(payment);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<Payment>> getPaymentsByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.getPaymentsByOrder(orderId));
    }
}
