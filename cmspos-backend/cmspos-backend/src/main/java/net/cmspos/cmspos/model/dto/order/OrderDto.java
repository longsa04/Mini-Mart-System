package net.cmspos.cmspos.model.dto.order;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import net.cmspos.cmspos.model.enums.PaymentStatus;

@Getter
@Setter
public class OrderDto {

    private Long orderId;
    private Long userId;
    private Long customerId;
    private Long locationId;
    private Double total;
    private Double discount;
    private PaymentStatus paymentStatus;
    private LocalDateTime orderDate;
    private List<OrderDetailDto> orderDetails;
}
