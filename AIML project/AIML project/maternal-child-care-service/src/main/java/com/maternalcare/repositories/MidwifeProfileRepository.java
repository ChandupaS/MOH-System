package com.maternalcare.repositories;

import com.maternalcare.entities.MidwifeProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MidwifeProfileRepository extends JpaRepository<MidwifeProfile, Long> {
    Optional<MidwifeProfile> findByUserId(Long userId);
    long countByGnDivision(String gnDivision);
}
