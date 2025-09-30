package net.cmspos.cmspos.model.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import net.cmspos.cmspos.model.dto.UserResponseDto;

@Getter
@Setter
@AllArgsConstructor
public class AuthResponseDto {
    private String token;
    private long expiresIn;
    private UserResponseDto user;
}
