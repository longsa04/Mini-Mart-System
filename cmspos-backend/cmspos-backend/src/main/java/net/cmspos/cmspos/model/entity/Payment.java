package net.cmspos.cmspos.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.cmspos.cmspos.model.entity.order.Order;
import net.cmspos.cmspos.model.enums.PaymentMethod;

@Entity
@Table(name = "payment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long paymentId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false, foreignKey = @ForeignKey(name = "fk_payment_order"))
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentMethod method;

    @Column(nullable = false)
    private Double amount;

    @Column(name = "received_amount")
    private Double receivedAmount;

    @Column(name = "change_amount")
    private Double changeAmount;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_payment_user"))
    private User user;

    @Column(name = "paid_at", nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime paidAt;

    @PrePersist
    private void onCreate() {
        if (paidAt == null) {
            paidAt = LocalDateTime.now();
        }
        if (amount == null) {
            amount = 0.0;
        }
        if (method == null) {
            method = PaymentMethod.CASH;
        }
    }
}
