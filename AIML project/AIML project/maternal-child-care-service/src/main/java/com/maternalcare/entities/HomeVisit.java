package com.maternalcare.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "home_visit_schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HomeVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mother_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user"})
    private MotherProfile mother;

    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate;

    @Column(nullable = false)
    private String status; // Upcoming, Completed, Missed, Rescheduled

    @Column(name = "midwife_notes", columnDefinition = "TEXT")
    private String midwifeNotes;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // Vitals recorded during visit
    @Column(name = "blood_pressure")
    private String bloodPressure;

    @Column(name = "weight_kg")
    private String weightKg;

    @Column(name = "temperature")
    private String temperature;

    @Column(name = "pulse_rate")
    private String pulseRate;

    @Column(name = "fundal_height")
    private String fundalHeight;

    @Column(name = "fetal_heart_rate")
    private String fetalHeartRate;

    @Column(name = "rescheduled_date")
    private LocalDate rescheduledDate;
}
