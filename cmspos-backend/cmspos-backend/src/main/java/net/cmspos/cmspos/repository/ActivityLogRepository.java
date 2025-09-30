package net.cmspos.cmspos.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import net.cmspos.cmspos.model.entity.ActivityLog;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    @EntityGraph(attributePaths = "user")
    List<ActivityLog> findByLogDateBetweenOrderByLogDateDesc(LocalDateTime start, LocalDateTime end);

    Optional<ActivityLog> findTopByOrderByLogDateDesc();
}
