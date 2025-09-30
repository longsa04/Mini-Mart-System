package net.cmspos.cmspos.service;

import java.time.LocalDate;
import java.util.List;
import net.cmspos.cmspos.model.dto.CashRegisterDto;
import net.cmspos.cmspos.model.entity.CashRegister;

public interface CashRegisterService {
    CashRegister openRegister(CashRegisterDto cashRegisterDto);

    List<CashRegister> getRegisters(LocalDate date);
}
