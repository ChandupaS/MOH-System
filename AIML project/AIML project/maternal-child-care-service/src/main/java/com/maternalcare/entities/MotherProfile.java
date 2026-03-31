package com.maternalcare.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "mother_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class MotherProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "gn_division", nullable = false)
    private String gnDivision;

    @Column(name = "health_conditions")
    private String healthConditions; // Stores conditions like "Diabetes, Heart Disease"

    private String nic;
    private String contactNumber;
    private LocalDate dob;
    private String address;
    private String phmArea;
    private String mohArea;

    @Column(name = "father_first_name")
    private String fatherFirstName;
    
    @Column(name = "father_last_name")
    private String fatherLastName;

    @Column(name = "father_nic")
    private String fatherNic;

    private LocalDate edd; // Expected Delivery Date
    private LocalDate lmp; // Last Menstrual Period
    
    // Additional Pregnancy Details
    private Integer gravida;
    private Integer para;
    
    @Column(name = "previous_c_sections")
    private Integer previousCSections;
    
    @Column(name = "previous_miscarriages")
    private Integer previousMiscarriages;
    
    @Column(name = "previous_stillbirths")
    private Integer previousStillbirths;
    
    @Column(name = "blood_group")
    private String bloodGroup;
    
    private String height;
    private String weight;
    private String allergies;

    @Column(name = "blood_pressure")
    private String bloodPressure;

    @Column(name = "fundal_height")
    private String fundalHeight;

    @Column(name = "fetal_heart_rate")
    private String fetalHeartRate;

    @Column(columnDefinition = "TEXT")
    private String complications;

    @Column(name = "midwife_notes", columnDefinition = "TEXT")
    private String midwifeNotes;

    @Column(name = "registration_date")
    private LocalDate registrationDate = LocalDate.now();
}
