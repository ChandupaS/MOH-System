package com.maternalcare.repositories;

import com.maternalcare.entities.VaccinationSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VaccinationScheduleRepository extends JpaRepository<VaccinationSchedule, Long> {
    List<VaccinationSchedule> findByMotherIdOrderByScheduledDateAsc(Long motherId);
    List<VaccinationSchedule> findByTypeAndMotherIdOrderByScheduledDateAsc(String type, Long motherId);
}
