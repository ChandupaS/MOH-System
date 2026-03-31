package com.maternalcare.repositories;

import com.maternalcare.entities.ChildProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ChildProfileRepository extends JpaRepository<ChildProfile, Long> {
    List<ChildProfile> findByMotherId(Long motherId);
    Optional<ChildProfile> findByUserId(Long userId);
}
