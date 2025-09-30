package net.cmspos.cmspos.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.cmspos.cmspos.model.enums.ExpenseCategory;

@Entity
@Table(name = "expense")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "expense_id")
    private Long expenseId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "location_id", nullable = false, foreignKey = @ForeignKey(name = "fk_expense_location"))
    private Location location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_expense_user"))
    private User user;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(nullable = false)
    private Double amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ExpenseCategory category = ExpenseCategory.OTHER;

    @Column(name = "expense_date", nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime expenseDate;

    @PrePersist
    private void onCreate() {
        if (expenseDate == null) {
            expenseDate = LocalDateTime.now();
        }
        if (amount == null) {
            amount = 0.0;
        }
        if (category == null) {
            category = ExpenseCategory.OTHER;
        }
    }
}
