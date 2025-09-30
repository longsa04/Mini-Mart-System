package net.cmspos.cmspos.controller;

import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import net.cmspos.cmspos.model.dto.TaxDto;
import net.cmspos.cmspos.model.entity.Tax;
import net.cmspos.cmspos.service.TaxService;
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
@RequestMapping("/taxes")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TaxController {

    private final TaxService taxService;

    @PostMapping
    public ResponseEntity<Tax> recordTax(@RequestBody TaxDto taxDto) {
        Tax recorded = taxService.recordTax(taxDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(recorded);
    }

    @GetMapping
    public ResponseEntity<List<Tax>> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(taxService.getTaxes(start, end));
    }
}
