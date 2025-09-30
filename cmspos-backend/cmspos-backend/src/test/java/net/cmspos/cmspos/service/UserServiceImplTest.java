package net.cmspos.cmspos.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import net.cmspos.cmspos.model.dto.UserDto;
import net.cmspos.cmspos.model.entity.Location;
import net.cmspos.cmspos.model.entity.User;
import net.cmspos.cmspos.repository.LocationRepository;
import net.cmspos.cmspos.repository.UserRepository;
import net.cmspos.cmspos.service.implement.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private LocationRepository locationRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UserServiceImpl userService;

    @BeforeEach
    void setUp() {
        userService = new UserServiceImpl(userRepository, locationRepository, passwordEncoder);
    }

    @Test
    void updateUserWithoutLocationIdKeepsExistingLocation() {
        Location existingLocation = new Location();
        existingLocation.setLocationId(1L);
        existingLocation.setName("Existing");

        User existingUser = new User();
        existingUser.setUserId(10L);
        existingUser.setLocation(existingLocation);

        when(userRepository.findById(10L)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserDto userDto = new UserDto();
        userDto.setUsername("updated");

        User result = userService.updateUser(10L, userDto);

        assertThat(result.getLocation()).isSameAs(existingLocation);
        verify(locationRepository, never()).findById(any());
    }

    @Test
    void updateUserWithLocationIdReassignsLocation() {
        Location existingLocation = new Location();
        existingLocation.setLocationId(1L);
        existingLocation.setName("Existing");

        Location newLocation = new Location();
        newLocation.setLocationId(2L);
        newLocation.setName("New");

        User existingUser = new User();
        existingUser.setUserId(10L);
        existingUser.setLocation(existingLocation);

        when(userRepository.findById(10L)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(locationRepository.findById(2L)).thenReturn(Optional.of(newLocation));

        UserDto userDto = new UserDto();
        userDto.setLocationId(2L);

        User result = userService.updateUser(10L, userDto);

        assertThat(result.getLocation()).isSameAs(newLocation);
    }

    @Test
    void updateUserWithExplicitNullLocationRemovesAssociation() {
        Location existingLocation = new Location();
        existingLocation.setLocationId(1L);
        existingLocation.setName("Existing");

        User existingUser = new User();
        existingUser.setUserId(10L);
        existingUser.setLocation(existingLocation);

        when(userRepository.findById(10L)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserDto userDto = new UserDto();
        userDto.setLocationId(null);

        User result = userService.updateUser(10L, userDto);

        assertThat(result.getLocation()).isNull();
        verify(locationRepository, never()).findById(any());
    }
}
