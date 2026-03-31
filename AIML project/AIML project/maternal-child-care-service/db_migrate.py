import psycopg2
import sys

DB_URL = "postgresql://postgres.jberdyjdgtkeljuyuzgd:SLIITAI0102G18@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require"

def connect():
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = False
    return conn

def run(conn, sql, label=""):
    try:
        cur = conn.cursor()
        cur.execute(sql)
        conn.commit()
        print(f"  OK: {label}")
    except Exception as e:
        conn.rollback()
        print(f"  WARN [{label}]: {e}")

def main():
    print("Connecting to Supabase...")
    conn = connect()
    print("Connected.\n")

    # ── 1. SHOW EXISTING TABLES ──────────────────────────────────────────────
    cur = conn.cursor()
    cur.execute("""
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename;
    """)
    existing = [r[0] for r in cur.fetchall()]
    print("Existing tables:", existing)
    print()

    # ── 2. EXPECTED TABLES (from current entities) ───────────────────────────
    expected = {
        "users",
        "midwife_profiles",
        "mother_profiles",
        "home_visit_schedules",
        "vaccination_schedules",
        "symptom_entries",
        "clinic_visit_records",
        "child_profiles",
        "announcements",
        "announcement_read_status",
    }

    # ── 3. DROP TABLES NOT IN EXPECTED SET (and any old ones) ───────────────
    # Drop in safe reverse-dependency order
    old_tables = [t for t in existing if t not in expected]
    if old_tables:
        print("Dropping old/stale tables:", old_tables)
        for t in old_tables:
            run(conn, f'DROP TABLE IF EXISTS "{t}" CASCADE;', f"Drop {t}")
    else:
        print("No stale old tables found.")

    print()

    # ── 4. DROP ALL EXPECTED TABLES (in FK-safe order) to recreate cleanly ──
    print("Dropping existing expected tables for clean recreation...")
    drop_order = [
        "announcement_read_status",
        "announcements",
        "symptom_entries",
        "clinic_visit_records",
        "home_visit_schedules",
        "vaccination_schedules",
        "child_profiles",
        "mother_profiles",
        "midwife_profiles",
        "users",
    ]
    for t in drop_order:
        run(conn, f'DROP TABLE IF EXISTS "{t}" CASCADE;', f"Drop {t}")

    print()

    # ── 5. CREATE TABLES IN CORRECT ORDER ───────────────────────────────────
    print("Creating tables...")

    # users — core auth table, maps to User.java
    run(conn, """
        CREATE TABLE users (
            id          BIGSERIAL PRIMARY KEY,
            name        VARCHAR(255) NOT NULL,
            email       VARCHAR(255) NOT NULL UNIQUE,
            password    VARCHAR(255) NOT NULL,
            role        VARCHAR(50)  NOT NULL CHECK (role IN ('DOCTOR','MIDWIFE','MOTHER')),
            created_at  TIMESTAMP    DEFAULT NOW()
        );
    """, "Create users")

    # midwife_profiles — maps to MidwifeProfile.java
    run(conn, """
        CREATE TABLE midwife_profiles (
            id          BIGSERIAL PRIMARY KEY,
            user_id     BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
            gn_division VARCHAR(255) NOT NULL
        );
    """, "Create midwife_profiles")

    # mother_profiles — maps to MotherProfile.java
    run(conn, """
        CREATE TABLE mother_profiles (
            id                    BIGSERIAL PRIMARY KEY,
            user_id               BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
            gn_division           VARCHAR(255) NOT NULL,
            nic                   VARCHAR(50),
            contact_number        VARCHAR(50),
            dob                   DATE,
            address               TEXT,
            phm_area              VARCHAR(255),
            moh_area              VARCHAR(255),
            father_first_name     VARCHAR(255),
            father_last_name      VARCHAR(255),
            father_nic            VARCHAR(50),
            edd                   DATE,
            lmp                   DATE,
            health_conditions     TEXT,
            gravida               INTEGER,
            para                  INTEGER,
            previous_c_sections   INTEGER,
            previous_miscarriages INTEGER,
            previous_stillbirths  INTEGER,
            blood_group           VARCHAR(20),
            height                VARCHAR(20),
            weight                VARCHAR(20),
            allergies             TEXT,
            registration_date     DATE DEFAULT CURRENT_DATE
        );
    """, "Create mother_profiles")

    # child_profiles — maps to ChildProfile.java
    run(conn, """
        CREATE TABLE child_profiles (
            id        BIGSERIAL PRIMARY KEY,
            user_id   BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
            mother_id BIGINT NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE
        );
    """, "Create child_profiles")

    # home_visit_schedules — maps to HomeVisit.java
    run(conn, """
        CREATE TABLE home_visit_schedules (
            id             BIGSERIAL PRIMARY KEY,
            mother_id      BIGINT NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE,
            scheduled_date DATE NOT NULL,
            status         VARCHAR(50) NOT NULL DEFAULT 'Upcoming',
            midwife_notes  TEXT,
            completed_at   TIMESTAMP
        );
    """, "Create home_visit_schedules")

    # vaccination_schedules — maps to VaccinationSchedule.java
    run(conn, """
        CREATE TABLE vaccination_schedules (
            id               BIGSERIAL PRIMARY KEY,
            user_id          BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            type             VARCHAR(50) NOT NULL,
            vaccine_name     VARCHAR(255) NOT NULL,
            scheduled_date   DATE NOT NULL,
            administered_date DATE,
            status           VARCHAR(50) NOT NULL DEFAULT 'Pending'
        );
    """, "Create vaccination_schedules")

    # symptom_entries — maps to SymptomEntry.java
    run(conn, """
        CREATE TABLE symptom_entries (
            id           BIGSERIAL PRIMARY KEY,
            mother_id    BIGINT NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE,
            symptoms     TEXT NOT NULL,
            severity     VARCHAR(50) NOT NULL,
            notes        TEXT,
            submitted_at TIMESTAMP DEFAULT NOW()
        );
    """, "Create symptom_entries")

    # clinic_visit_records — maps to ClinicVisit.java
    run(conn, """
        CREATE TABLE clinic_visit_records (
            id         BIGSERIAL PRIMARY KEY,
            mother_id  BIGINT NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE,
            visit_date DATE NOT NULL,
            notes      TEXT,
            status     VARCHAR(50) NOT NULL DEFAULT 'Upcoming'
        );
    """, "Create clinic_visit_records")

    # announcements — maps to Announcement.java
    run(conn, """
        CREATE TABLE announcements (
            id        BIGSERIAL PRIMARY KEY,
            title     VARCHAR(255) NOT NULL,
            body      TEXT NOT NULL,
            priority  VARCHAR(50) NOT NULL DEFAULT 'General',
            target    VARCHAR(50) NOT NULL DEFAULT 'Both',
            posted_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            posted_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP
        );
    """, "Create announcements")

    # announcement_read_status — maps to AnnouncementReadStatus.java
    run(conn, """
        CREATE TABLE announcement_read_status (
            id              BIGSERIAL PRIMARY KEY,
            midwife_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            announcement_id BIGINT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
            read_at         TIMESTAMP DEFAULT NOW(),
            UNIQUE (midwife_user_id, announcement_id)
        );
    """, "Create announcement_read_status")

    print()

    # ── 6. ADD INDEXES FOR PERFORMANCE ──────────────────────────────────────
    print("Adding indexes...")
    run(conn, "CREATE INDEX idx_mother_gn ON mother_profiles(gn_division);", "Index mother gn_division")
    run(conn, "CREATE INDEX idx_homevisit_mother ON home_visit_schedules(mother_id);", "Index home_visit mother_id")
    run(conn, "CREATE INDEX idx_homevisit_date ON home_visit_schedules(scheduled_date);", "Index home_visit scheduled_date")
    run(conn, "CREATE INDEX idx_vacc_user ON vaccination_schedules(user_id);", "Index vaccination user_id")
    run(conn, "CREATE INDEX idx_symptom_mother ON symptom_entries(mother_id);", "Index symptom mother_id")
    run(conn, "CREATE INDEX idx_ann_target ON announcements(target);", "Index announcements target")
    run(conn, "CREATE INDEX idx_ann_postedat ON announcements(posted_at DESC);", "Index announcements posted_at")
    run(conn, "CREATE INDEX idx_readstatus_midwife ON announcement_read_status(midwife_user_id);", "Index read_status midwife")

    print()

    # ── 7. SEED — create default doctor account ──────────────────────────────
    print("Seeding default doctor account...")
    run(conn, """
        INSERT INTO users (name, email, password, role)
        VALUES ('Dr. Admin', 'doctor@suwa.lk', 'doctor123', 'DOCTOR')
        ON CONFLICT (email) DO NOTHING;
    """, "Seed doctor user")

    print()

    # ── 8. VERIFY ALL TABLES CREATED ────────────────────────────────────────
    cur.execute("""
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename;
    """)
    final = [r[0] for r in cur.fetchall()]
    print("Final tables in database:", final)
    print()

    missing = expected - set(final)
    if missing:
        print(f"ERROR — missing tables: {missing}")
        sys.exit(1)
    else:
        print("All required tables are present.")
        print("\nDatabase migration complete.")

    conn.close()

if __name__ == "__main__":
    main()
