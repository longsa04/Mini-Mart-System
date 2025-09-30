package net.cmspos.cmspos.model.entity.inventory;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.cmspos.cmspos.model.entity.Location;
import net.cmspos.cmspos.model.entity.Product;

@Entity
@Table(name = "stock", uniqueConstraints = {
        @UniqueConstraint(name = "uk_stock_product_location", columnNames = {"product_id", "location_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stock_id")
    private Long stockId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false, foreignKey = @ForeignKey(name = "fk_stock_product"))
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "location_id", nullable = false, foreignKey = @ForeignKey(name = "fk_stock_location"))
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Location location;

    @Default
    @Column(nullable = false)
    private Integer quantity = 0;

    @Default
    @Column(name = "last_updated", nullable = false)
    private LocalDateTime lastUpdated = LocalDateTime.now();

    @PrePersist
    @PreUpdate
    private void touchTimestamp() {
        lastUpdated = LocalDateTime.now();
    }
}




