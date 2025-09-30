package net.cmspos.cmspos.service;

import java.time.LocalDate;
import java.util.List;
import net.cmspos.cmspos.model.dto.TaxDto;
import net.cmspos.cmspos.model.entity.Tax;

public interface TaxService {
    Tax recordTax(TaxDto taxDto);

    List<Tax> getTaxes(LocalDate startDate, LocalDate endDate);
}
