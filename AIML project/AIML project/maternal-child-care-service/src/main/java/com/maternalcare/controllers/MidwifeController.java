package com.maternalcare.controllers;

import com.maternalcare.entities.*;
import com.maternalcare.repositories.*;
import com.maternalcare.services.MotherService;
import com.maternalcare.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/midwife")
@CrossOrigin(origins = "http://localhost:5173")
public class MidwifeController {
    @Autowired private MotherProfileRepository motherProfileRepository;
    @Autowired private HomeVisitRepository homeVisitRepository;
    @Autowired private AnnouncementRepository announcementRepository;
    @Autowired private MotherService motherService;
    @Autowired private com.maternalcare.services.HomeVisitService homeVisitService;
    @Autowired private UserService userService;
    @Autowired private MidwifeProfileRepository midwifeProfileRepository;
    @Autowired private VaccinationScheduleRepository vaccinationScheduleRepository;
    @Autowired private AnnouncementReadStatusRepository readStatusRepository;

    @GetMapping("/{midwifeId}/mothers")
    public ResponseEntity<?> getMothersInDivision(@PathVariable Long midwifeId) {
        return midwifeProfileRepository.findByUserId(midwifeId)
            .map(midwife -> ResponseEntity.ok(motherProfileRepository.findByGnDivision(midwife.getGnDivision())))
            .orElse(ResponseEntity.status(403).build());
    }

    @GetMapping("/{midwifeId}/mother/{id}")
    public ResponseEntity<?> getMotherById(@PathVariable Long midwifeId, @PathVariable Long id) {
        return midwifeProfileRepository.findByUserId(midwifeId).flatMap(midwife ->
            motherProfileRepository.findById(id).filter(mother -> mother.getGnDivision().equals(midwife.getGnDivision()))
        ).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{midwifeId}/profile")
    public ResponseEntity<?> getMidwifeProfile(@PathVariable Long midwifeId) {
        return midwifeProfileRepository.findByUserId(midwifeId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{midwifeId}/register-mother")
    public ResponseEntity<?> registerMother(@PathVariable Long midwifeId, @RequestBody Map<String, String> data) {
        try {
            MidwifeProfile midwife = midwifeProfileRepository.findByUserId(midwifeId)
                .orElseThrow(() -> new Exception("Midwife profile not found."));

            User user = new User();
            user.setName(data.get("firstName") + " " + data.get("lastName"));
            user.setEmail(data.get("email"));
            user.setPassword(data.get("password") != null ? data.get("password") : "default123");
            user.setRole(UserRole.MOTHER);
            User savedUser = userService.saveUser(user);

            MotherProfile profile = new MotherProfile();
            profile.setUser(savedUser);
            // Enforce GN Division access control on the backend:
            profile.setGnDivision(midwife.getGnDivision());
            profile.setNic(data.get("nic"));
            profile.setContactNumber(data.get("contactNumber"));
            profile.setAddress(data.get("address"));
            profile.setPhmArea(data.get("phmArea"));
            profile.setMohArea(data.get("mohArea"));
            profile.setFatherFirstName(data.get("fatherFirstName"));
            profile.setFatherLastName(data.get("fatherLastName"));
            profile.setFatherNic(data.get("fatherNic"));
            
            if (data.get("dob") != null && !data.get("dob").isEmpty())
                profile.setDob(LocalDate.parse(data.get("dob")));
            if (data.get("edd") != null && !data.get("edd").isEmpty())
                profile.setEdd(LocalDate.parse(data.get("edd")));
            if (data.get("lmp") != null && !data.get("lmp").isEmpty())
                profile.setLmp(LocalDate.parse(data.get("lmp")));
            if (data.get("healthConditions") != null)
                profile.setHealthConditions(data.get("healthConditions"));
            
            if (data.get("bloodPressure") != null) profile.setBloodPressure(data.get("bloodPressure"));
            if (data.get("fundalHeight") != null) profile.setFundalHeight(data.get("fundalHeight"));
            if (data.get("fetalHeartRate") != null) profile.setFetalHeartRate(data.get("fetalHeartRate"));
            if (data.get("complications") != null) profile.setComplications(data.get("complications"));
            if (data.get("midwifeNotes") != null) profile.setMidwifeNotes(data.get("midwifeNotes"));

            MotherProfile saved = motherService.registerMother(profile);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }

    @PutMapping("/{midwifeId}/mother/{id}")
    public ResponseEntity<?> updateMother(@PathVariable Long midwifeId, @PathVariable Long id, @RequestBody Map<String, String> data) {
        return midwifeProfileRepository.findByUserId(midwifeId).flatMap(midwife ->
            motherProfileRepository.findById(id).filter(m -> m.getGnDivision().equals(midwife.getGnDivision()))
        ).map(profile -> {
            if (data.get("gnDivision") != null) profile.setGnDivision(data.get("gnDivision"));
            if (data.get("nic") != null) profile.setNic(data.get("nic"));
            if (data.get("contactNumber") != null) profile.setContactNumber(data.get("contactNumber"));
            if (data.get("address") != null) profile.setAddress(data.get("address"));
            if (data.get("phmArea") != null) profile.setPhmArea(data.get("phmArea"));
            if (data.get("mohArea") != null) profile.setMohArea(data.get("mohArea"));
            if (data.get("fatherFirstName") != null) profile.setFatherFirstName(data.get("fatherFirstName"));
            if (data.get("fatherLastName") != null) profile.setFatherLastName(data.get("fatherLastName"));
            if (data.get("fatherNic") != null) profile.setFatherNic(data.get("fatherNic"));
            
            if (data.get("gravida") != null) profile.setGravida(data.get("gravida").isEmpty() ? null : Integer.parseInt(data.get("gravida")));
            if (data.get("para") != null) profile.setPara(data.get("para").isEmpty() ? null : Integer.parseInt(data.get("para")));
            if (data.get("previousCSections") != null) profile.setPreviousCSections(data.get("previousCSections").isEmpty() ? null : Integer.parseInt(data.get("previousCSections")));
            if (data.get("previousMiscarriages") != null) profile.setPreviousMiscarriages(data.get("previousMiscarriages").isEmpty() ? null : Integer.parseInt(data.get("previousMiscarriages")));
            if (data.get("previousStillbirths") != null) profile.setPreviousStillbirths(data.get("previousStillbirths").isEmpty() ? null : Integer.parseInt(data.get("previousStillbirths")));
            if (data.get("bloodGroup") != null) profile.setBloodGroup(data.get("bloodGroup"));
            if (data.get("height") != null) profile.setHeight(data.get("height"));
            if (data.get("weight") != null) profile.setWeight(data.get("weight"));
            if (data.get("allergies") != null) profile.setAllergies(data.get("allergies"));

            if (data.get("bloodPressure") != null) profile.setBloodPressure(data.get("bloodPressure"));
            if (data.get("fundalHeight") != null) profile.setFundalHeight(data.get("fundalHeight"));
            if (data.get("fetalHeartRate") != null) profile.setFetalHeartRate(data.get("fetalHeartRate"));
            if (data.get("complications") != null) profile.setComplications(data.get("complications"));
            if (data.get("midwifeNotes") != null) profile.setMidwifeNotes(data.get("midwifeNotes"));
            
            if (data.get("dob") != null && !data.get("dob").isEmpty())
                profile.setDob(LocalDate.parse(data.get("dob")));
            if (data.get("edd") != null && !data.get("edd").isEmpty()) {
                profile.setEdd(LocalDate.parse(data.get("edd")));
                // Auto-calculate LMP by subtracting 280 days
                profile.setLmp(profile.getEdd().minusDays(280));
            } else if (data.get("lmp") != null && !data.get("lmp").isEmpty()) {
                profile.setLmp(LocalDate.parse(data.get("lmp")));
            }
            
            if (data.get("healthConditions") != null)
                profile.setHealthConditions(data.get("healthConditions"));
            // Update user name if provided
            if ((data.get("firstName") != null || data.get("lastName") != null) && profile.getUser() != null) {
                String firstName = data.get("firstName") != null ? data.get("firstName") : "";
                String lastName = data.get("lastName") != null ? data.get("lastName") : "";
                profile.getUser().setName((firstName + " " + lastName).trim());
                userService.saveUser(profile.getUser());
            }
            
            MotherProfile saved = motherProfileRepository.save(profile);
            homeVisitService.generateSchedule(saved); // Regenerate visits based on updated EDD/Conditions
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{midwifeId}/home-visits")
    public ResponseEntity<?> getDivisionVisits(@PathVariable Long midwifeId) {
        return midwifeProfileRepository.findByUserId(midwifeId).map(midwife -> {
            LocalDate today = LocalDate.now();
            return ResponseEntity.ok(Map.of("today", homeVisitRepository.findByMotherGnDivisionAndScheduledDate(midwife.getGnDivision(), today), "thisWeek", homeVisitRepository.findByMotherGnDivisionAndScheduledDateBetween(midwife.getGnDivision(), today, today.plusWeeks(1))));
        }).orElse(ResponseEntity.status(403).build());
    }

    @GetMapping("/announcements")
    public ResponseEntity<?> getAnnouncements() { 
        return ResponseEntity.ok(announcementRepository.findByTargetInOrderByPostedAtDesc(java.util.List.of("Midwives", "Both"))); 
    }

    @GetMapping("/{midwifeUserId}/announcements/read-status")
    public ResponseEntity<?> getReadStatus(@PathVariable Long midwifeUserId) {
        java.util.List<Long> readIds = readStatusRepository.findByMidwifeId(midwifeUserId)
            .stream().map(status -> status.getAnnouncement().getId()).collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(readIds);
    }

    @PostMapping("/{midwifeUserId}/announcements/{annId}/read")
    public ResponseEntity<?> markAnnouncementAsRead(@PathVariable Long midwifeUserId, @PathVariable Long annId) {
        java.util.Optional<AnnouncementReadStatus> existing = readStatusRepository.findByMidwifeIdAndAnnouncementId(midwifeUserId, annId);
        if (existing.isEmpty()) {
            User user = new User(); user.setId(midwifeUserId);
            Announcement ann = new Announcement(); ann.setId(annId);
            AnnouncementReadStatus status = new AnnouncementReadStatus();
            status.setMidwife(user);
            status.setAnnouncement(ann);
            readStatusRepository.save(status);
        }
        return ResponseEntity.ok().build();
    }

    @PutMapping("/home-visit/{id}")
    public ResponseEntity<?> updateHomeVisitStatus(@PathVariable Long id, @RequestBody Map<String, String> data) {
        return homeVisitRepository.findById(id).map(visit -> {
            if (data.containsKey("status")) visit.setStatus(data.get("status"));
            if (data.containsKey("notes")) visit.setMidwifeNotes(data.get("notes"));
            if ("Completed".equals(data.get("status"))) visit.setCompletedAt(java.time.LocalDateTime.now());
            return ResponseEntity.ok(homeVisitRepository.save(visit));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{midwifeId}/mother/{id}/vaccinations")
    public ResponseEntity<?> getMotherVaccinationsByType(@PathVariable Long midwifeId, @PathVariable Long id, @RequestParam String type) {
        return midwifeProfileRepository.findByUserId(midwifeId).flatMap(midwife ->
            motherProfileRepository.findById(id).filter(m -> m.getGnDivision().equals(midwife.getGnDivision()))
        ).map(mother -> ResponseEntity.ok(vaccinationScheduleRepository.findByTypeAndMotherIdOrderByScheduledDateAsc(type, mother.getId())))
        .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{midwifeId}/mother/{id}/vaccinations")
    public ResponseEntity<?> addVaccination(@PathVariable Long midwifeId, @PathVariable Long id, @RequestBody VaccinationSchedule vacc) {
        return midwifeProfileRepository.findByUserId(midwifeId).flatMap(midwife ->
            motherProfileRepository.findById(id).filter(m -> m.getGnDivision().equals(midwife.getGnDivision()))
        ).map(mother -> {
            vacc.setUser(mother.getUser());
            vacc.setMother(mother);
            return ResponseEntity.ok(vaccinationScheduleRepository.save(vacc));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/vaccination/{id}")
    public ResponseEntity<?> updateVaccinationStatus(@PathVariable Long id, @RequestBody Map<String, String> data) {
        return vaccinationScheduleRepository.findById(id).map(vacc -> {
            if (data.containsKey("status")) vacc.setStatus(data.get("status"));
            if (data.containsKey("vaccineName")) vacc.setVaccineName(data.get("vaccineName"));
            if (data.containsKey("doseNumber")) vacc.setDoseNumber(data.get("doseNumber"));
            if (data.containsKey("batchNumber")) vacc.setBatchNumber(data.get("batchNumber"));
            if (data.containsKey("administeringProvider")) vacc.setAdministeringProvider(data.get("administeringProvider"));
            
            if (data.containsKey("scheduledDate")) vacc.setScheduledDate(LocalDate.parse(data.get("scheduledDate")));
            if (data.containsKey("administeredDate")) {
                vacc.setAdministeredDate(data.get("administeredDate") != null && !data.get("administeredDate").isEmpty() 
                    ? LocalDate.parse(data.get("administeredDate")) : null);
            }
            
            if ("Completed".equals(data.get("status")) && vacc.getAdministeredDate() == null) vacc.setAdministeredDate(LocalDate.now());
            return ResponseEntity.ok(vaccinationScheduleRepository.save(vacc));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/vaccination/{id}")
    public ResponseEntity<?> deleteVaccination(@PathVariable Long id) {
        vaccinationScheduleRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
