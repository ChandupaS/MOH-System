package com.maternalcare.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "vaccination_schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class VaccinationSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Mother or Child User

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mother_id")
    private MotherProfile mother; // Associated Mother Profile

    @Column(nullable = false)
    private String type; // MOTHER or CHILD

    @Column(name = "vaccine_name", nullable = false)
    private String vaccineName;

    @Column(name = "dose_number")
    private String doseNumber;

    @Column(name = "batch_number")
    private String batchNumber;

    @Column(name = "administering_provider")
    private String administeringProvider;

    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate;

    @Column(name = "administered_date")
    private LocalDate administeredDate;

    @Column(nullable = false)
    private String status; // Pending, Completed, Overdue
}
