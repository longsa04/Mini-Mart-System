package net.cmspos.cmspos.model.entity.order;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import net.cmspos.cmspos.model.entity.Customer;
import net.cmspos.cmspos.model.entity.Location;
import net.cmspos.cmspos.model.entity.User;
import net.cmspos.cmspos.model.enums.PaymentStatus;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id", nullable = false, updatable = false)
    private Long orderId;

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_orders_user"))
    private User user;

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", foreignKey = @ForeignKey(name = "fk_orders_customer"))
    private Customer customer;

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "location_id", nullable = false, foreignKey = @ForeignKey(name = "fk_orders_location"))
    private Location location;

    @Column(nullable = false)
    private Double total = 0.0;

    @Column(nullable = false)
    private Double discount = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 30)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "order_date", nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime orderDate;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonManagedReference
    @Builder.Default
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderDetail> orderDetails = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        applyDefaults();
    }

    @PreUpdate
    protected void onUpdate() {
        applyDefaults();
    }

    private void applyDefaults() {
        if (orderDate == null) {
            orderDate = LocalDateTime.now();
        }
        if (discount == null) {
            discount = 0.0;
        }
        if (total == null) {
            total = 0.0;
        }
        if (paymentStatus == null) {
            paymentStatus = PaymentStatus.PENDING;
        }
    }
}
