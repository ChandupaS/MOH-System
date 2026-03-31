package com.maternalcare.controllers;

import com.maternalcare.entities.*;
import com.maternalcare.repositories.*;
import com.maternalcare.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctor")
@CrossOrigin(origins = "http://localhost:5173")
public class DoctorController {
    @Autowired private UserService userService;
    @Autowired private MidwifeProfileRepository midwifeProfileRepository;
    @Autowired private MotherProfileRepository motherProfileRepository;
    @Autowired private AnnouncementRepository announcementRepository;

    @PostMapping("/add-midwife")
    public ResponseEntity<?> addMidwife(@RequestBody Map<String, String> data) {
        User user = new User(); user.setName(data.get("name")); user.setEmail(data.get("email")); user.setPassword(data.get("password")); user.setRole(UserRole.MIDWIFE);
        User savedUser = userService.saveUser(user);
        MidwifeProfile profile = new MidwifeProfile(); profile.setUser(savedUser); profile.setGnDivision(data.get("gnDivision"));
        midwifeProfileRepository.save(profile);
        return ResponseEntity.ok("Midwife added.");
    }

    @GetMapping("/mothers")
    public ResponseEntity<List<MotherProfile>> getAllMothers() { return ResponseEntity.ok(motherProfileRepository.findAll()); }

    @PostMapping("/announcements")
    public ResponseEntity<?> postAnnouncement(@RequestBody Announcement ann) { 
        if (ann.getTarget() == null) ann.setTarget("Both");
        return ResponseEntity.ok(announcementRepository.save(ann)); 
    }

    @PutMapping("/announcements/{id}")
    public ResponseEntity<?> editAnnouncement(@PathVariable Long id, @RequestBody Announcement updated) {
        return announcementRepository.findById(id).map(ann -> {
            ann.setTitle(updated.getTitle());
            ann.setBody(updated.getBody());
            ann.setPriority(updated.getPriority());
            if (updated.getTarget() != null) ann.setTarget(updated.getTarget());
            ann.setUpdatedAt(java.time.LocalDateTime.now());
            return ResponseEntity.ok(announcementRepository.save(ann));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/announcements/{id}")
    public ResponseEntity<?> deleteAnnouncement(@PathVariable Long id) {
        announcementRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/announcements")
    public ResponseEntity<List<Announcement>> getAnnouncements() { 
        return ResponseEntity.ok(announcementRepository.findAllByOrderByPostedAtDesc()); 
    }
}
