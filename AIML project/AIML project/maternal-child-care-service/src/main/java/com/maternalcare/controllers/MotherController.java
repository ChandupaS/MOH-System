package com.maternalcare.controllers;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.maternalcare.entities.MotherProfile;
import com.maternalcare.repositories.MotherProfileRepository;

@RestController
@RequestMapping("/api/mother")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"})
public class MotherController {
    
    @Autowired
    private MotherProfileRepository motherProfileRepository;

    @Autowired
    private com.maternalcare.repositories.SymptomEntryRepository symptomEntryRepository;

    @GetMapping("/{motherId}/profile")
    public ResponseEntity<?> getMotherProfile(@PathVariable Long motherId) {
        return motherProfileRepository.findByUserId(motherId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{motherId}/profile")
    public ResponseEntity<?> updateMotherProfile(@PathVariable Long motherId, @RequestBody Map<String, String> data) {
        return motherProfileRepository.findByUserId(motherId)
            .map(profile -> {
                if (data.get("healthConditions") != null)
                    profile.setHealthConditions(data.get("healthConditions"));
                if (data.get("contactNumber") != null)
                    profile.setContactNumber(data.get("contactNumber"));
                if (data.get("address") != null)
                    profile.setAddress(data.get("address"));
                if (data.get("height") != null)
                    profile.setHeight(data.get("height"));
                if (data.get("weight") != null)
                    profile.setWeight(data.get("weight"));
                if (data.get("allergies") != null)
                    profile.setAllergies(data.get("allergies"));
                
                MotherProfile saved = motherProfileRepository.save(profile);
                return ResponseEntity.ok(saved);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/symptoms/{motherId}")
    public ResponseEntity<?> getMotherSymptoms(@PathVariable Long motherId) {
        return motherProfileRepository.findById(motherId)
            .map(mother -> ResponseEntity.ok(symptomEntryRepository.findByMotherIdOrderBySubmittedAtDesc(mother.getId())))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/symptoms")
    public ResponseEntity<?> postSymptom(@RequestBody com.maternalcare.entities.SymptomEntry entry) {
        entry.setSubmittedAt(java.time.LocalDateTime.now());
        return ResponseEntity.ok(symptomEntryRepository.save(entry));
    }
    @Autowired
    private com.maternalcare.repositories.HomeVisitRepository homeVisitRepository;

    @Autowired
    private com.maternalcare.repositories.VaccinationScheduleRepository vaccinationScheduleRepository;

    @GetMapping("/home-visits/{motherId}")
    public ResponseEntity<?> getMotherVisits(@PathVariable Long motherId) {
        return ResponseEntity.ok(homeVisitRepository.findByMotherIdOrderByScheduledDateAsc(motherId));
    }

    @GetMapping("/vaccinations/{motherId}")
    public ResponseEntity<?> getMotherVaccinations(@PathVariable Long motherId) {
        return ResponseEntity.ok(vaccinationScheduleRepository.findByMotherIdOrderByScheduledDateAsc(motherId));
    }
}
