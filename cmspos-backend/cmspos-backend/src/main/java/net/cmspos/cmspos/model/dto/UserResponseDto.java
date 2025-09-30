package net.cmspos.cmspos.model.dto;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import net.cmspos.cmspos.model.enums.Shift;
import net.cmspos.cmspos.model.enums.UserRole;
import net.cmspos.cmspos.model.enums.UserStatus;

@Getter
@Setter
public class UserResponseDto {

    private Long userId;
    private String username;
    private UserRole role;
    private Long locationId;
    private String locationName;
    private Shift shift;
    private UserStatus status;
    private String phone;
    private String email;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
