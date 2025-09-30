package net.cmspos.cmspos.model.dto;

import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;
import net.cmspos.cmspos.model.enums.Shift;

@Getter
@Setter
public class CashRegisterDto {
    private Long locationId;
    private Long userId;
    private Double openingBalance;
    private Double closingBalance;
    private LocalDate registerDate;
    private Shift shift;
}
