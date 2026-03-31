package com.maternalcare.services;

import com.maternalcare.entities.MotherProfile;
import com.maternalcare.repositories.MotherProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MotherService {

    @Autowired
    private MotherProfileRepository motherProfileRepository;

    @Autowired
    private HomeVisitService homeVisitService;

    public MotherProfile registerMother(MotherProfile mother) {
        MotherProfile saved = motherProfileRepository.save(mother);
        homeVisitService.generateSchedule(saved);
        return saved;
    }

    public MotherProfile updateHealthConditions(Long motherId, String conditions) {
        MotherProfile mother = motherProfileRepository.findById(motherId).orElseThrow();
        mother.setHealthConditions(conditions);
        MotherProfile saved = motherProfileRepository.save(mother);
        homeVisitService.generateSchedule(saved);
        return saved;
    }

    public List<MotherProfile> getMothersByDivision(String division) {
        return motherProfileRepository.findByGnDivision(division);
    }
}
