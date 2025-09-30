package net.cmspos.cmspos.model.dto;

import lombok.AccessLevel;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import net.cmspos.cmspos.model.enums.Shift;
import net.cmspos.cmspos.model.enums.UserRole;
import net.cmspos.cmspos.model.enums.UserStatus;

@Getter
@Setter
@Data
public class UserDto {

    private Long userId;
    private String username;
    private String password;      // <-- added password
    private UserRole role;
    private Long locationId;
    private Shift shift;
    private UserStatus status;
    private String phone;
    private String email;

    @Setter(AccessLevel.NONE)
    private boolean locationIdProvided;


    @Setter(AccessLevel.NONE)
    private boolean locationClearRequested;



    public void setLocationId(Long locationId) {
        this.locationId = locationId;
        this.locationIdProvided = true;
        this.locationClearRequested = locationId == null;
    }
}
