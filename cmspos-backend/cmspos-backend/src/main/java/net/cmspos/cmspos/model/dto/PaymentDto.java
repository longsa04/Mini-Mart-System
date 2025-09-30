package net.cmspos.cmspos.model.dto;

import lombok.Getter;
import lombok.Setter;
import net.cmspos.cmspos.model.enums.PaymentMethod;

@Getter
@Setter
public class PaymentDto {
    private Long orderId;
    private PaymentMethod method;
    private Double amount;
    private Double receivedAmount;
    private Double changeAmount;
    private Long userId;
}
