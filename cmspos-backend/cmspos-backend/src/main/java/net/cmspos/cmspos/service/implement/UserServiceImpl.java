package net.cmspos.cmspos.service.implement;

import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import net.cmspos.cmspos.exception.BadRequestException;
import net.cmspos.cmspos.exception.ResourceNotFoundException;
import net.cmspos.cmspos.model.dto.UserDto;
import net.cmspos.cmspos.model.entity.Location;
import net.cmspos.cmspos.model.entity.User;
import net.cmspos.cmspos.model.enums.UserRole;
import net.cmspos.cmspos.model.enums.UserStatus;
import net.cmspos.cmspos.repository.LocationRepository;
import net.cmspos.cmspos.repository.UserRepository;
import net.cmspos.cmspos.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User createUser(UserDto userDto) {
        validatePassword(userDto.getPassword());

        User user = new User();
        user.setUsername(userDto.getUsername());
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        user.setRole(Optional.ofNullable(userDto.getRole()).orElse(UserRole.CASHIER));
        user.setShift(userDto.getShift());
        user.setStatus(Optional.ofNullable(userDto.getStatus()).orElse(UserStatus.ACTIVE));
        user.setPhone(userDto.getPhone());
        user.setEmail(userDto.getEmail());
        user.setLocation(resolveLocation(userDto.getLocationId()));

        return userRepository.save(user);
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Override
    public User updateUser(Long id, UserDto userDto) {
        User existingUser = getUserById(id);

        if (userDto.getUsername() != null) {
            existingUser.setUsername(userDto.getUsername());
        }
        if (userDto.getPassword() != null && !userDto.getPassword().isBlank()) {
            validatePassword(userDto.getPassword());
            existingUser.setPassword(passwordEncoder.encode(userDto.getPassword()));
        }
        if (userDto.getRole() != null) {
            existingUser.setRole(userDto.getRole());
        }
        if (userDto.getShift() != null) {
            existingUser.setShift(userDto.getShift());
        }
        if (userDto.getStatus() != null) {
            existingUser.setStatus(userDto.getStatus());
        }
        if (userDto.getPhone() != null) {
            existingUser.setPhone(userDto.getPhone());
        }
        if (userDto.getEmail() != null) {
            existingUser.setEmail(userDto.getEmail());
        }
        if (userDto.isLocationIdProvided() && userDto.getLocationId() != null) {
            existingUser.setLocation(resolveLocation(userDto.getLocationId()));
        } else if (userDto.isLocationClearRequested()) {
            existingUser.setLocation(null);
        }

        return userRepository.save(existingUser);
    }

    @Override
    public User deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
        return user;
    }

    @Override
    public List<User> getUsersByRole(UserRole role) {
        return role == null ? getAllUsers() : userRepository.findByRole(role);
    }

    private void validatePassword(String password) {
        if (password == null || password.isBlank()) {
            throw new BadRequestException("Password is required");
        }
    }

    private Location resolveLocation(Long locationId) {
        if (locationId == null) {
            return null;
        }
        return locationRepository.findById(locationId)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + locationId));
    }
}
