package com.maternalcare.repositories;

import com.maternalcare.entities.MotherProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MotherProfileRepository extends JpaRepository<MotherProfile, Long> {
    List<MotherProfile> findByGnDivision(String gnDivision);
    Optional<MotherProfile> findByUserId(Long userId);
    long countByGnDivision(String gnDivision);
}
