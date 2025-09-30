package net.cmspos.cmspos.service.implement;

import java.util.List;
import lombok.RequiredArgsConstructor;
import net.cmspos.cmspos.exception.ResourceNotFoundException;
import net.cmspos.cmspos.model.entity.order.Order;
import net.cmspos.cmspos.model.entity.order.OrderDetail;
import net.cmspos.cmspos.repository.order.OrderDetailRepository;
import net.cmspos.cmspos.repository.order.OrderRepository;
import net.cmspos.cmspos.service.OrderDetailService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderDetailServiceImpl implements OrderDetailService {

    private final OrderDetailRepository orderDetailRepository;
    private final OrderRepository orderRepository;

    @Override
    public List<OrderDetail> getOrderDetailsByOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        return orderDetailRepository.findByOrder(order);
    }
}
