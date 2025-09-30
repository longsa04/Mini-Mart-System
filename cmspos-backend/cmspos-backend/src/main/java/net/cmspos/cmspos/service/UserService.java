package net.cmspos.cmspos.service;

import java.util.List;
import net.cmspos.cmspos.model.dto.UserDto;
import net.cmspos.cmspos.model.entity.User;
import net.cmspos.cmspos.model.enums.UserRole;

public interface UserService {

    List<User> getAllUsers();

    User createUser(UserDto userDto);

    User getUserById(Long id);

    User updateUser(Long id, UserDto userDto);

    User deleteUser(Long id);

    List<User> getUsersByRole(UserRole role);
}
