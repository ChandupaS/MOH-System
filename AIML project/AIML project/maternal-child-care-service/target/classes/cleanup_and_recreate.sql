-- ============================================================
-- MATERNAL CHILD CARE SERVICE - DATABASE CLEANUP & RECREATION
-- This script drops all old tables and creates fresh ones
-- based on the Java entity classes
-- ============================================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS announcement_read_status CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS symptom_entries CASCADE;
DROP TABLE IF EXISTS clinic_visit_records CASCADE;
DROP TABLE IF EXISTS home_visit_schedules CASCADE;
DROP TABLE IF EXISTS vaccination_schedules CASCADE;
DROP TABLE IF EXISTS child_profiles CASCADE;
DROP TABLE IF EXISTS mother_profiles CASCADE;
DROP TABLE IF EXISTS midwife_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- CREATE CORE TABLES IN CORRECT DEPENDENCY ORDER
-- ============================================================

-- 1. USERS TABLE (Core authentication)
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    role            VARCHAR(50) NOT NULL CHECK (role IN ('DOCTOR', 'MIDWIFE', 'MOTHER', 'CHILD')),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. MIDWIFE PROFILES
CREATE TABLE midwife_profiles (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    gn_division     VARCHAR(255) NOT NULL
);

-- 3. MOTHER PROFILES
CREATE TABLE mother_profiles (
    id                      BIGSERIAL PRIMARY KEY,
    user_id                 BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    gn_division             VARCHAR(255) NOT NULL,
    nic                     VARCHAR(50),
    contact_number          VARCHAR(50),
    dob                     DATE,
    address                 TEXT,
    phm_area                VARCHAR(255),
    moh_area                VARCHAR(255),
    father_first_name       VARCHAR(255),
    father_last_name        VARCHAR(255),
    father_nic              VARCHAR(50),
    edd                     DATE,
    lmp                     DATE,
    health_conditions       TEXT,
    gravida                 INTEGER,
    para                    INTEGER,
    previous_c_sections     INTEGER,
    previous_miscarriages   INTEGER,
    previous_stillbirths    INTEGER,
    blood_group             VARCHAR(20),
    height                  VARCHAR(20),
    weight                  VARCHAR(20),
    allergies               TEXT,
    registration_date       DATE DEFAULT CURRENT_DATE
);

-- 4. CHILD PROFILES
CREATE TABLE child_profiles (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    mother_id       BIGINT NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE
);

-- 5. HOME VISIT SCHEDULES
CREATE TABLE home_visit_schedules (
    id              BIGSERIAL PRIMARY KEY,
    mother_id       BIGINT NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE,
    scheduled_date  DATE NOT NULL,
    status          VARCHAR(50) NOT NULL DEFAULT 'Upcoming',
    midwife_notes   TEXT,
    completed_at    TIMESTAMP
);

-- 6. VACCINATION SCHEDULES
CREATE TABLE vaccination_schedules (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type                VARCHAR(50) NOT NULL,
    vaccine_name        VARCHAR(255) NOT NULL,
    scheduled_date      DATE NOT NULL,
    administered_date   DATE,
    status              VARCHAR(50) NOT NULL DEFAULT 'Pending'
);

-- 7. SYMPTOM ENTRIES
CREATE TABLE symptom_entries (
    id              BIGSERIAL PRIMARY KEY,
    mother_id       BIGINT NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE,
    symptoms        TEXT NOT NULL,
    severity        VARCHAR(50) NOT NULL,
    notes           TEXT,
    submitted_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. CLINIC VISIT RECORDS
CREATE TABLE clinic_visit_records (
    id              BIGSERIAL PRIMARY KEY,
    mother_id       BIGINT NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE,
    visit_date      DATE NOT NULL,
    notes           TEXT,
    status          VARCHAR(50) NOT NULL DEFAULT 'Upcoming'
);

-- 9. ANNOUNCEMENTS
CREATE TABLE announcements (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    body            TEXT NOT NULL,
    priority        VARCHAR(50) NOT NULL DEFAULT 'General',
    target          VARCHAR(50) NOT NULL DEFAULT 'Both',
    posted_by       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    posted_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP
);

-- 10. ANNOUNCEMENT READ STATUS
CREATE TABLE announcement_read_status (
    id              BIGSERIAL PRIMARY KEY,
    midwife_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    announcement_id BIGINT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    read_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (midwife_user_id, announcement_id)
);

-- ============================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_mother_gn ON mother_profiles(gn_division);
CREATE INDEX idx_homevisit_mother ON home_visit_schedules(mother_id);
CREATE INDEX idx_homevisit_date ON home_visit_schedules(scheduled_date);
CREATE INDEX idx_vacc_user ON vaccination_schedules(user_id);
CREATE INDEX idx_symptom_mother ON symptom_entries(mother_id);
CREATE INDEX idx_clinic_mother ON clinic_visit_records(mother_id);
CREATE INDEX idx_ann_target ON announcements(target);
CREATE INDEX idx_ann_postedat ON announcements(posted_at DESC);
CREATE INDEX idx_readstatus_midwife ON announcement_read_status(midwife_user_id);

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
-- All tables have been successfully created!
-- The database is now ready for the Spring Boot application.
