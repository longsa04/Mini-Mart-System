package net.cmspos.cmspos.repository;

import net.cmspos.cmspos.model.entity.User;
import net.cmspos.cmspos.model.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    List<User> findByRole(UserRole userRole);
}
