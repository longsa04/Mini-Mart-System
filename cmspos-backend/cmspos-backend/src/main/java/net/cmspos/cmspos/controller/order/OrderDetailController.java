package net.cmspos.cmspos.controller.order;

import java.util.List;
import lombok.RequiredArgsConstructor;
import net.cmspos.cmspos.model.entity.order.OrderDetail;
import net.cmspos.cmspos.service.OrderDetailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/orders/{orderId}/details")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class OrderDetailController {

    private final OrderDetailService orderDetailService;

    @GetMapping
    public ResponseEntity<List<OrderDetail>> getOrderDetailsByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderDetailService.getOrderDetailsByOrder(orderId));
    }
}
