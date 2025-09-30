package net.cmspos.cmspos.controller;

import java.util.HashMap;
import lombok.RequiredArgsConstructor;
import net.cmspos.cmspos.model.dto.UserResponseDto;
import net.cmspos.cmspos.model.dto.auth.AuthResponseDto;
import net.cmspos.cmspos.model.dto.auth.LoginRequestDto;
import net.cmspos.cmspos.model.entity.User;
import net.cmspos.cmspos.security.JwtService;
import net.cmspos.cmspos.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@RequestBody LoginRequestDto request) {
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword());

        Authentication authentication = authenticationManager.authenticate(authToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = principal.getUser();

        HashMap<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole());
        claims.put("userId", user.getUserId());

        String token = jwtService.generateToken(principal, claims);
        long expiresIn = jwtService.getExpirationMillis();

        UserResponseDto responseUser = toResponse(user);
        AuthResponseDto responseDto = new AuthResponseDto(token, expiresIn, responseUser);
        return ResponseEntity.ok(responseDto);
    }

    private UserResponseDto toResponse(User user) {
        UserResponseDto dto = new UserResponseDto();
        dto.setUserId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setRole(user.getRole());
        if (user.getLocation() != null) {
            dto.setLocationId(user.getLocation().getLocationId());
            dto.setLocationName(user.getLocation().getName());
        }
        dto.setShift(user.getShift());
        dto.setStatus(user.getStatus());
        dto.setPhone(user.getPhone());
        dto.setEmail(user.getEmail());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }
}
