package net.cmspos.cmspos.controller;

import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import net.cmspos.cmspos.model.dto.ActivityLogDto;
import net.cmspos.cmspos.model.dto.activity.ActivityLogResponseDto;
import net.cmspos.cmspos.service.ActivityLogService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/activity-logs")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @PostMapping
    public ResponseEntity<ActivityLogResponseDto> log(@RequestBody ActivityLogDto activityLogDto) {
        ActivityLogResponseDto log = activityLogService.log(activityLogDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(log);
    }

    @GetMapping
    public ResponseEntity<List<ActivityLogResponseDto>> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(activityLogService.getLogs(start, end));
    }
}
