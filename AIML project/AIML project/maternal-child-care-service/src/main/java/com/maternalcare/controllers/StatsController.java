package com.maternalcare.controllers;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.maternalcare.entities.UserRole;
import com.maternalcare.repositories.MidwifeProfileRepository;
import com.maternalcare.repositories.MotherProfileRepository;
import com.maternalcare.services.UserService;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"})
public class StatsController {
    @Autowired private UserService userService;
    @Autowired private MotherProfileRepository motherProfileRepository;
    @Autowired private MidwifeProfileRepository midwifeProfileRepository;

    @GetMapping("/landing")
    public ResponseEntity<?> getLandingStats() {
        return ResponseEntity.ok(Map.of("totalMothers", userService.getCountByRole(UserRole.MOTHER), "totalChildren", userService.getCountByRole(UserRole.CHILD), "totalMidwives", userService.getCountByRole(UserRole.MIDWIFE), "totalDivisions", 56));
    }
    
    @GetMapping("/doctor")
    public ResponseEntity<?> getDoctorOverview() {
        return ResponseEntity.ok(Map.of("totalMothers", motherProfileRepository.count(), "totalMidwives", midwifeProfileRepository.count(), "divisionsCovered", 56, "recentRegistrations", 0));
    }
}
