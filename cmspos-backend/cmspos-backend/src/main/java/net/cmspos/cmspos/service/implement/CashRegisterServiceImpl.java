package net.cmspos.cmspos.service.implement;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import net.cmspos.cmspos.exception.BadRequestException;
import net.cmspos.cmspos.exception.ResourceNotFoundException;
import net.cmspos.cmspos.model.dto.CashRegisterDto;
import net.cmspos.cmspos.model.entity.CashRegister;
import net.cmspos.cmspos.model.entity.Location;
import net.cmspos.cmspos.model.entity.User;
import net.cmspos.cmspos.model.enums.Shift;
import net.cmspos.cmspos.repository.CashRegisterRepository;
import net.cmspos.cmspos.repository.LocationRepository;
import net.cmspos.cmspos.repository.UserRepository;
import net.cmspos.cmspos.service.CashRegisterService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CashRegisterServiceImpl implements CashRegisterService {

    private final CashRegisterRepository cashRegisterRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;

    @Override
    public CashRegister openRegister(CashRegisterDto cashRegisterDto) {
        if (cashRegisterDto.getLocationId() == null) {
            throw new BadRequestException("Location id is required to open a cash register");
        }
        if (cashRegisterDto.getUserId() == null) {
            throw new BadRequestException("User id is required to open a cash register");
        }

        Location location = locationRepository.findById(cashRegisterDto.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + cashRegisterDto.getLocationId()));

        User user = userRepository.findById(cashRegisterDto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + cashRegisterDto.getUserId()));

        CashRegister register = CashRegister.builder()
                .location(location)
                .user(user)
                .openingBalance(Optional.ofNullable(cashRegisterDto.getOpeningBalance()).orElse(0.0))
                .closingBalance(cashRegisterDto.getClosingBalance())
                .registerDate(Optional.ofNullable(cashRegisterDto.getRegisterDate()).orElse(LocalDate.now()))
                .shift(Optional.ofNullable(cashRegisterDto.getShift()).orElse(Shift.MORNING))
                .build();

        return cashRegisterRepository.save(register);
    }

    @Override
    public List<CashRegister> getRegisters(LocalDate date) {
        if (date == null) {
            return cashRegisterRepository.findAll();
        }
        return cashRegisterRepository.findByRegisterDate(date);
    }
}
