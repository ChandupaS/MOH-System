package com.maternalcare.services;

import com.maternalcare.entities.HomeVisit;
import com.maternalcare.entities.MotherProfile;
import com.maternalcare.repositories.HomeVisitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class HomeVisitService {

    @Autowired
    private HomeVisitRepository homeVisitRepository;

    public void generateSchedule(MotherProfile mother) {
        String conditions = mother.getHealthConditions() != null ? mother.getHealthConditions().toLowerCase() : "";
        int intervalWeeks = 12; // Default 3 months

        if (conditions.contains("diabetes")) {
            intervalWeeks = Math.min(intervalWeeks, 2);
        }
        if (conditions.contains("heart disease")) {
            intervalWeeks = Math.min(intervalWeeks, 3);
        }
        if (conditions.contains("blood pressure")) {
            intervalWeeks = Math.min(intervalWeeks, 4);
        }

        LocalDate start = mother.getRegistrationDate();
        LocalDate end = mother.getEdd() != null ? mother.getEdd() : start.plusMonths(9);

        // Remove future visits for regeneration
        List<HomeVisit> existing = homeVisitRepository.findByMotherIdOrderByScheduledDateAsc(mother.getId());
        for (HomeVisit v : existing) {
            if (v.getScheduledDate().isAfter(LocalDate.now()) && v.getStatus().equals("Upcoming")) {
                homeVisitRepository.delete(v);
            }
        }

        List<HomeVisit> newVisits = new ArrayList<>();
        LocalDate current = start.plusWeeks(intervalWeeks);

        while (current.isBefore(end) || current.isEqual(end)) {
            if (current.isAfter(LocalDate.now())) {
                HomeVisit visit = new HomeVisit();
                visit.setMother(mother);
                visit.setScheduledDate(current);
                visit.setStatus("Upcoming");
                newVisits.add(visit);
            }
            current = current.plusWeeks(intervalWeeks);
        }

        homeVisitRepository.saveAll(newVisits);
    }
}
