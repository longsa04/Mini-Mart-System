package net.cmspos.cmspos.controller;

import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import net.cmspos.cmspos.model.dto.CashRegisterDto;
import net.cmspos.cmspos.model.entity.CashRegister;
import net.cmspos.cmspos.service.CashRegisterService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/cash-registers")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CashRegisterController {

    private final CashRegisterService cashRegisterService;

    @PostMapping
    public ResponseEntity<CashRegister> openRegister(@RequestBody CashRegisterDto cashRegisterDto) {
        CashRegister register = cashRegisterService.openRegister(cashRegisterDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(register);
    }

    @GetMapping
    public ResponseEntity<List<CashRegister>> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(cashRegisterService.getRegisters(date));
    }
}
