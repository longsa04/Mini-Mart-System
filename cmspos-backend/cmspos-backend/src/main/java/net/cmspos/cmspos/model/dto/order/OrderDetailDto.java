package net.cmspos.cmspos.model.dto.order;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderDetailDto {
    private Long orderDetailId;
    private Long orderId;
    private Long productId;
    private Integer quantity;
    private Double price;
}
