package net.cmspos.cmspos.service;

import java.util.List;
import net.cmspos.cmspos.model.entity.order.OrderDetail;

public interface OrderDetailService {
    List<OrderDetail> getOrderDetailsByOrder(Long orderId);
}
