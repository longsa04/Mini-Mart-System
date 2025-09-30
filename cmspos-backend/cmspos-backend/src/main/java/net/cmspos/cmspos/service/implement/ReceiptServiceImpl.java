package net.cmspos.cmspos.service.implement;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import net.cmspos.cmspos.model.dto.order.ReceiptResponseDto;
import net.cmspos.cmspos.model.entity.order.Order;
import net.cmspos.cmspos.model.entity.order.OrderDetail;
import net.cmspos.cmspos.service.ReceiptService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReceiptServiceImpl implements ReceiptService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm", Locale.ENGLISH);
    private static final String ORDER_REFERENCE_PREFIX = "ORDER-";

    @Value("${pos.tax.rate:0.0}")
    private double taxRate;

    @Override
    public ReceiptResponseDto buildReceipt(Order order) {
        String reference = ORDER_REFERENCE_PREFIX + order.getOrderId();
        double subtotal = order.getOrderDetails().stream()
                .mapToDouble(detail -> safe(detail.getPrice()) * safe(detail.getQuantity()))
                .sum();
        double discount = safe(order.getDiscount());
        double total = safe(order.getTotal());
        double taxableAmount = Math.max(0.0, subtotal - discount);
        double taxAmount = round(Math.max(0.0, total - taxableAmount));
        if (taxAmount == 0.0 && taxRate > 0.0) {
            taxAmount = round(taxableAmount * taxRate);
        }

        StringBuilder builder = new StringBuilder();
        builder.append("CMS POS RECEIPT\n");
        builder.append("Order #: ").append(reference).append("\n");
        builder.append("Date: ").append(DATE_FORMATTER.format(order.getOrderDate())).append("\n");
        if (order.getLocation() != null) {
            builder.append("Location: ").append(order.getLocation().getName()).append("\n");
        }
        if (order.getUser() != null) {
            builder.append("Cashier: ").append(order.getUser().getUsername()).append("\n");
        }
        if (order.getCustomer() != null) {
            builder.append("Customer: ").append(order.getCustomer().getName()).append("\n");
        }
        builder.append("Payment Status: ").append(order.getPaymentStatus()).append("\n");
        builder.append("----------------------------------------\n");
        builder.append(String.format(Locale.ENGLISH, "%1$-20s %2 %3%n", "Item", "Qty", "Total"));
        builder.append("----------------------------------------\n");

        order.getOrderDetails().stream()
                .sorted(Comparator.comparing(OrderDetail::getOrderDetailId, Comparator.nullsLast(Long::compareTo)))
                .forEach(detail -> {
                    double lineTotal = safe(detail.getPrice()) * safe(detail.getQuantity());
                    builder.append(String.format(Locale.ENGLISH, "%1$-20s %2 %3.2f%n",
                            detail.getProduct() != null ? detail.getProduct().getName() : detail.getOrderDetailId(),
                            safe(detail.getQuantity()),
                            lineTotal));
                });

        builder.append("----------------------------------------\n");
        builder.append(String.format(Locale.ENGLISH, "%1$-20s %2.2f%n", "Subtotal", subtotal));
        builder.append(String.format(Locale.ENGLISH, "%1$-20s %2.2f%n", "Discount", discount));
        builder.append(String.format(Locale.ENGLISH, "%1$-20s %2.2f%n", "Tax", taxAmount));
        builder.append(String.format(Locale.ENGLISH, "%1$-20s %2.2f%n", "Total", total));
        builder.append(String.format(Locale.ENGLISH, "%1$-20s %2%n", "Payment", order.getPaymentStatus()));
        builder.append("----------------------------------------\n");
        builder.append("Thank you for shopping!\n");

        return ReceiptResponseDto.builder()
                .receiptNumber(reference)
                .generatedAt(LocalDateTime.now())
                .content(builder.toString())
                .build();
    }

    private double safe(Double value) {
        return value == null ? 0.0 : value;
    }

    private int safe(Integer value) {
        return value == null ? 0 : value;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
