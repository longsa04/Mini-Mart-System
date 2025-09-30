package net.cmspos.cmspos.repository.order;

import java.time.LocalDateTime;
import java.util.List;
import net.cmspos.cmspos.model.entity.order.Order;
import net.cmspos.cmspos.model.enums.PaymentStatus;
import net.cmspos.cmspos.model.enums.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByPaymentStatus(PaymentStatus status);

    List<Order> findByPaymentStatusAndOrderDateBetween(PaymentStatus status, LocalDateTime start, LocalDateTime end);

    List<Order> findByPaymentStatusAndLocation_LocationIdAndOrderDateBetween(PaymentStatus status, Long locationId, LocalDateTime start, LocalDateTime end);

    List<Order> findByOrderDateBetween(LocalDateTime start, LocalDateTime end);

    List<Order> findByUser_ShiftAndOrderDateBetween(Shift shift, LocalDateTime start, LocalDateTime end);
}
