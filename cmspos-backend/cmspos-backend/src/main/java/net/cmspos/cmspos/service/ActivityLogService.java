package net.cmspos.cmspos.service;

import java.time.LocalDate;
import java.util.List;
import net.cmspos.cmspos.model.dto.ActivityLogDto;
import net.cmspos.cmspos.model.dto.activity.ActivityLogResponseDto;

public interface ActivityLogService {
    ActivityLogResponseDto log(ActivityLogDto activityLogDto);

    List<ActivityLogResponseDto> getLogs(LocalDate startDate, LocalDate endDate);
}
