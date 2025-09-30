package net.cmspos.cmspos.controller.order;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import net.cmspos.cmspos.model.dto.order.OrderDto;
import net.cmspos.cmspos.model.dto.order.ReceiptResponseDto;
import net.cmspos.cmspos.model.dto.order.ShiftReportDto;
import net.cmspos.cmspos.model.entity.order.Order;
import net.cmspos.cmspos.model.enums.PaymentStatus;
import net.cmspos.cmspos.model.enums.Shift;
import net.cmspos.cmspos.service.OrderService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody OrderDto orderDto) {
        Order order = orderService.createOrder(orderDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        Order order = orderService.getOrderById(id);
        return ResponseEntity.status(HttpStatus.OK).body(order);
    }

    @PatchMapping("/{id}/payment-status")
    public ResponseEntity<Order> updatePaymentStatus(@PathVariable Long id,
                                                     @RequestParam PaymentStatus status) {
        Order updatedOrder = orderService.updatePaymentStatus(id, status);
        return ResponseEntity.ok(updatedOrder);
    }

    @GetMapping(value = "/{id}/receipt", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> getReceipt(@PathVariable Long id) {
        ReceiptResponseDto receipt = orderService.generateReceipt(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(new MediaType("text", "plain", StandardCharsets.UTF_8));
        return new ResponseEntity<>(receipt.getContent(), headers, HttpStatus.OK);
    }

    @GetMapping("/reports/shift")
    public ResponseEntity<ShiftReportDto> getShiftReport(@RequestParam Shift shift,
                                                         @RequestParam(required = false)
                                                         @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        ShiftReportDto report = orderService.getShiftReport(shift, date);
        return ResponseEntity.ok(report);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Order> deleteOrder(@PathVariable Long id) {
        Order voidedOrder = orderService.deleteOrder(id);
        return ResponseEntity.status(HttpStatus.OK).body(voidedOrder);
    }
}
