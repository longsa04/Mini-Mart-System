package net.cmspos.cmspos.model.dto.activity;

import java.time.LocalDateTime;
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
public class ActivityLogResponseDto {
    private Long id;
    private String action;
    private LocalDateTime logDate;
    private ActivityLogUserDto user;
}
