package net.cmspos.cmspos.repository.order;

import java.time.LocalDateTime;
import java.util.List;
import net.cmspos.cmspos.model.entity.order.Order;
import net.cmspos.cmspos.model.entity.order.OrderDetail;
import net.cmspos.cmspos.model.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {
    List<OrderDetail> findByOrder(Order order);

    List<OrderDetail> findByOrder_PaymentStatusAndOrder_OrderDateBetween(PaymentStatus status, LocalDateTime start, LocalDateTime end);

    List<OrderDetail> findByOrder_PaymentStatusAndOrder_Location_LocationIdAndOrder_OrderDateBetween(PaymentStatus status, Long locationId, LocalDateTime start, LocalDateTime end);
}
