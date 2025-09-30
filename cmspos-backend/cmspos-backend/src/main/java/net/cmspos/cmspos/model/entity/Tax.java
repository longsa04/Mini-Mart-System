package net.cmspos.cmspos.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.cmspos.cmspos.model.entity.order.Order;
import net.cmspos.cmspos.model.entity.purchase.PurchaseOrder;
import net.cmspos.cmspos.model.enums.TaxType;

@Entity
@Table(name = "tax")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Tax {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tax_id")
    private Long taxId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", foreignKey = @ForeignKey(name = "fk_tax_order"))
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "po_id", foreignKey = @ForeignKey(name = "fk_tax_purchase_order"))
    private PurchaseOrder purchaseOrder;

    @Column(name = "tax_amount", nullable = false)
    private Double taxAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TaxType type;

    @Column(name = "tax_date", nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime taxDate;

    @PrePersist
    private void onCreate() {
        if (taxDate == null) {
            taxDate = LocalDateTime.now();
        }
        if (taxAmount == null) {
            taxAmount = 0.0;
        }
        if (type == null) {
            type = TaxType.SALES;
        }
    }
}
