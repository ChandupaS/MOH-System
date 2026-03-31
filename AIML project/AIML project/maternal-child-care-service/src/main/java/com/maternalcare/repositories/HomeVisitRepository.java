package com.maternalcare.repositories;

import com.maternalcare.entities.HomeVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface HomeVisitRepository extends JpaRepository<HomeVisit, Long> {
    List<HomeVisit> findByMotherIdOrderByScheduledDateAsc(Long motherId);
    List<HomeVisit> findByMotherGnDivisionAndScheduledDate(String gnDivision, LocalDate date);
    List<HomeVisit> findByMotherGnDivisionAndScheduledDateBetween(String gnDivision, LocalDate start, LocalDate end);
}
