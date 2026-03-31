package com.maternalcare.repositories;

import com.maternalcare.entities.ClinicVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClinicVisitRepository extends JpaRepository<ClinicVisit, Long> {
    List<ClinicVisit> findByMotherIdOrderByVisitDateDesc(Long motherId);
}
