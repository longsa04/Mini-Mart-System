package net.cmspos.cmspos.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.cmspos.cmspos.model.enums.Shift;

@Entity
@Table(name = "cash_register")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class CashRegister {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "register_id")
    private Long registerId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "location_id", nullable = false, foreignKey = @ForeignKey(name = "fk_cash_register_location"))
    private Location location;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_cash_register_user"))
    private User user;

    @Column(name = "opening_balance", nullable = false)
    private Double openingBalance;

    @Column(name = "closing_balance")
    private Double closingBalance;

    @Column(name = "register_date", nullable = false)
    private LocalDate registerDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Shift shift;

    @PrePersist
    private void onCreate() {
        if (registerDate == null) {
            registerDate = LocalDate.now();
        }
        if (shift == null) {
            shift = Shift.MORNING;
        }
        if (openingBalance == null) {
            openingBalance = 0.0;
        }
        if (closingBalance == null) {
            closingBalance = 0.0;
        }
    }
}
