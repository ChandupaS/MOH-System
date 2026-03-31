package com.maternalcare.controllers;

import com.maternalcare.entities.MotherProfile;
import com.maternalcare.repositories.MotherProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/mother")
@CrossOrigin(origins = "http://localhost:5173")
public class MotherController {
    
    @Autowired
    private MotherProfileRepository motherProfileRepository;

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
                // Allow mother to update their own information
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
}
