package net.cmspos.cmspos.model.dto.activity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogUserDto {
    private Long id;
    private String username;
    private String role;
    private String email;
}
