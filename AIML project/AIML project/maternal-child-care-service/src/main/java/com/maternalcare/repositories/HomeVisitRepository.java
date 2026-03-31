package com.maternalcare.repositories;

import com.maternalcare.entities.HomeVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface HomeVisitRepository extends JpaRepository<HomeVisit, Long> {
    List<HomeVisit> findByMotherIdOrderByScheduledDateAsc(Long motherId);
    List<HomeVisit> findByMotherGnDivisionAndScheduledDate(String gnDivision, LocalDate date);
    List<HomeVisit> findByMotherGnDivisionAndScheduledDateBetween(String gnDivision, LocalDate start, LocalDate end);
    List<HomeVisit> findByMotherGnDivision(String gnDivision);

    @Query("SELECT v FROM HomeVisit v WHERE v.mother.gnDivision = :div AND v.status = 'Upcoming' AND v.scheduledDate < :today")
    List<HomeVisit> findOverdueByDivision(@Param("div") String gnDivision, @Param("today") LocalDate today);

    @Query("SELECT v FROM HomeVisit v WHERE v.mother.gnDivision = :div AND v.status = :status")
    List<HomeVisit> findByDivisionAndStatus(@Param("div") String gnDivision, @Param("status") String status);

    @Query("SELECT v FROM HomeVisit v WHERE v.mother.id = :motherId ORDER BY v.scheduledDate ASC")
    List<HomeVisit> findByMotherIdSorted(@Param("motherId") Long motherId);
}
