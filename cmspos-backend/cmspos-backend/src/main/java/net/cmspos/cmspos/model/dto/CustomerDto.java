package net.cmspos.cmspos.model.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerDto {
    private String name;
    private String phone;
    private String email;
    private Integer points;
}
