package net.cmspos.cmspos.repository;

import java.time.LocalDateTime;
import java.util.List;
import net.cmspos.cmspos.model.entity.Payment;
import net.cmspos.cmspos.model.entity.order.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByOrder(Order order);

    List<Payment> findByPaidAtBetween(LocalDateTime start, LocalDateTime end);
}
