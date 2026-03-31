package com.maternalcare.repositories;

import com.maternalcare.entities.SymptomEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SymptomEntryRepository extends JpaRepository<SymptomEntry, Long> {
    List<SymptomEntry> findByMotherIdOrderBySubmittedAtDesc(Long motherId);
}
