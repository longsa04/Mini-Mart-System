package net.cmspos.cmspos.model.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductDto {
    private String name;
    private Double price;
    private Long categoryId;
    private String sku;
}
