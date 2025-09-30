package net.cmspos.cmspos.service.implement;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import net.cmspos.cmspos.exception.BadRequestException;
import net.cmspos.cmspos.exception.ResourceNotFoundException;
import net.cmspos.cmspos.model.dto.ActivityLogDto;
import net.cmspos.cmspos.model.dto.activity.ActivityLogResponseDto;
import net.cmspos.cmspos.model.dto.activity.ActivityLogUserDto;
import net.cmspos.cmspos.model.entity.ActivityLog;
import net.cmspos.cmspos.model.entity.User;
import net.cmspos.cmspos.repository.ActivityLogRepository;
import net.cmspos.cmspos.repository.UserRepository;
import net.cmspos.cmspos.service.ActivityLogService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    @Override
    public ActivityLogResponseDto log(ActivityLogDto activityLogDto) {
        if (activityLogDto.getAction() == null || activityLogDto.getAction().isBlank()) {
            throw new BadRequestException("Action description is required for activity log");
        }

        User user = null;
        if (activityLogDto.getUserId() != null) {
            user = userRepository.findById(activityLogDto.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + activityLogDto.getUserId()));
        }

        ActivityLog log = ActivityLog.builder()
                .user(user)
                .action(activityLogDto.getAction())
                .logDate(Optional.ofNullable(activityLogDto.getLogDate()).orElse(LocalDateTime.now()))
                .build();

        ActivityLog saved = activityLogRepository.save(log);
        return toResponse(saved);
    }

    @Override
    public List<ActivityLogResponseDto> getLogs(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new BadRequestException("Start date cannot be after end date");
        }
        Optional<ActivityLog> latestLog = Optional.empty();
        if (endDate == null || startDate == null) {
            latestLog = activityLogRepository.findTopByOrderByLogDateDesc();
        }

        LocalDate effectiveEnd = Optional.ofNullable(endDate)
                .orElseGet(() -> latestLog.map(log -> log.getLogDate().toLocalDate()).orElse(LocalDate.now()));
        LocalDate effectiveStart = Optional.ofNullable(startDate).orElse(effectiveEnd.minusDays(7));

        if (effectiveStart.isAfter(effectiveEnd)) {
            return Collections.emptyList();
        }
        LocalDateTime start = effectiveStart.atStartOfDay();
        LocalDateTime end = effectiveEnd.plusDays(1).atStartOfDay();
        return activityLogRepository.findByLogDateBetweenOrderByLogDateDesc(start, end).stream()
                .map(this::toResponse)
                .toList();
    }

    private ActivityLogResponseDto toResponse(ActivityLog log) {
        if (log == null) {
            return null;
        }
        return ActivityLogResponseDto.builder()
                .id(log.getLogId())
                .action(log.getAction())
                .logDate(log.getLogDate())
                .user(toUserDto(log.getUser()))
                .build();
    }

    private ActivityLogUserDto toUserDto(User user) {
        if (user == null) {
            return null;
        }
        return ActivityLogUserDto.builder()
                .id(user.getUserId())
                .username(user.getUsername())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .email(user.getEmail())
                .build();
    }
}
