# Maternal Child Care Service - Database Setup Guide

## Files Created

### 1. **application.properties**
Located at: `src/main/resources/application.properties`

This file contains the Spring Boot configuration for connecting to your Supabase PostgreSQL database.

```properties
spring.application.name=demo

spring.datasource.url=jdbc:postgresql://aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres
spring.datasource.username=postgres.jberdyjdgtkeljuyuzgd
spring.datasource.password=SLIITAI0102G18
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

**Configuration Details:**
- **spring.application.name**: Application identifier (demo)
- **datasource.url**: Supabase PostgreSQL connection string
- **datasource.username**: Supabase project user
- **datasource.password**: Supabase project password
- **driver-class-name**: PostgreSQL JDBC driver
- **jpa.database-platform**: Hibernate dialect for PostgreSQL
- **jpa.hibernate.ddl-auto**: Set to "update" - tables will be automatically created/updated on startup
- **jpa.show-sql**: Logs SQL queries (useful for debugging)

### 2. **cleanup_and_recreate.sql**
Located at: `src/main/resources/cleanup_and_recreate.sql`

This SQL script removes old tables and creates fresh ones according to your entity classes.

## Database Schema Overview

The application uses 10 interconnected tables:

```
┌─────────────────────────────────────────────────────────────┐
│                        USERS (Core)                         │
│  id | name | email | password | role | created_at          │
│  Roles: DOCTOR, MIDWIFE, MOTHER, CHILD                      │
└─────────────────────────────────────────────────────────────┘
                    ↓
        ┌─────────────┴─────────────┬──────────────┐
        ↓                           ↓              ↓
   MIDWIFE_PROFILES         MOTHER_PROFILES   CHILD_PROFILES
   (GN Division)            (Full pregnancy  (Vaccination
                             health data)     tracking)
        ↓                           ↓              ↓
        └─────────────┬─────────────┴──────────────┘
                      ↓
    ┌─────────────────┴──────────────────────┐
    ↓                                        ↓
HOME_VISIT_SCHEDULES              VACCINATION_SCHEDULES
SYMPTOM_ENTRIES                   CLINIC_VISIT_RECORDS
```

### Tables and Fields

#### 1. **users**
Core authentication table
- `id` (BIGSERIAL PRIMARY KEY)
- `name` (VARCHAR 255)
- `email` (VARCHAR 255 UNIQUE)
- `password` (VARCHAR 255)
- `role` (DOCTOR, MIDWIFE, MOTHER, CHILD)
- `created_at` (TIMESTAMP)

#### 2. **midwife_profiles**
Maps users to GN divisions
- `id` (BIGSERIAL PRIMARY KEY)
- `user_id` (BIGINT FK → users.id)
- `gn_division` (VARCHAR 255)

#### 3. **mother_profiles**
Comprehensive pregnancy and health data
- `id` (BIGSERIAL PRIMARY KEY)
- `user_id` (BIGINT FK → users.id)
- `gn_division`, `nic`, `contact_number`, `dob`, `address`
- `phm_area`, `moh_area`
- Father details: `father_first_name`, `father_last_name`, `father_nic`
- Pregnancy data: `edd`, `lmp`, `health_conditions`
- Obstetric history: `gravida`, `para`, `previous_c_sections`, `previous_miscarriages`, `previous_stillbirths`
- Health metrics: `blood_group`, `height`, `weight`, `allergies`
- `registration_date`

#### 4. **child_profiles**
Links children to their mothers
- `id` (BIGSERIAL PRIMARY KEY)
- `user_id` (BIGINT FK → users.id)
- `mother_id` (BIGINT FK → mother_profiles.id)

#### 5. **home_visit_schedules**
Home visits for mothers
- `id` (BIGSERIAL PRIMARY KEY)
- `mother_id` (BIGINT FK)
- `scheduled_date` (DATE)
- `status` (Upcoming, Completed, Missed)
- `midwife_notes` (TEXT)
- `completed_at` (TIMESTAMP)

#### 6. **vaccination_schedules**
Vaccination records for mothers and children
- `id` (BIGSERIAL PRIMARY KEY)
- `user_id` (BIGINT FK → users.id)
- `type` (MOTHER or CHILD)
- `vaccine_name` (VARCHAR 255)
- `scheduled_date` (DATE)
- `administered_date` (DATE)
- `status` (Pending, Completed, Overdue)

#### 7. **symptom_entries**
Mother symptom tracking
- `id` (BIGSERIAL PRIMARY KEY)
- `mother_id` (BIGINT FK)
- `symptoms` (TEXT)
- `severity` (Low, Medium, High)
- `notes` (TEXT)
- `submitted_at` (TIMESTAMP)

#### 8. **clinic_visit_records**
Clinic visits for mothers
- `id` (BIGSERIAL PRIMARY KEY)
- `mother_id` (BIGINT FK)
- `visit_date` (DATE)
- `notes` (TEXT)
- `status` (Upcoming, Completed, Missed)

#### 9. **announcements**
Doctor announcements to staff and mothers
- `id` (BIGSERIAL PRIMARY KEY)
- `title` (VARCHAR 255)
- `body` (TEXT)
- `priority` (General, Important, Urgent)
- `target` (Midwives, Mothers, Both)
- `posted_by` (BIGINT FK → users.id)
- `posted_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 10. **announcement_read_status**
Tracks which midwives have read announcements
- `id` (BIGSERIAL PRIMARY KEY)
- `midwife_user_id` (BIGINT FK → users.id)
- `announcement_id` (BIGINT FK → announcements.id)
- `read_at` (TIMESTAMP)
- UNIQUE constraint on (midwife_user_id, announcement_id)

## Setup Instructions

### Step 1: Verify application.properties
The file has been created at:
```
src/main/resources/application.properties
```

This file is ready to use with your Supabase connection details.

### Step 2: Clean the Supabase Database
You have two options:

**Option A: Using psql Command Line**
```bash
psql -h aws-1-ap-northeast-1.pooler.supabase.com -U postgres.jberdyjdgtkeljuyuzgd -d postgres < cleanup_and_recreate.sql
```

**Option B: Using Supabase Dashboard**
1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy the contents of `cleanup_and_recreate.sql`
4. Paste and execute

**Option C: Let Hibernate Handle It**
Since `spring.jpa.hibernate.ddl-auto=update`, the tables will be automatically created on first run if they don't exist. However, it's recommended to clean up old tables first.

### Step 3: Build and Run the Spring Boot Application

```bash
cd maternal-child-care-service
mvn clean install
mvn spring-boot:run
```

The application will:
1. Read `application.properties`
2. Connect to Supabase
3. Create tables (if not exists) via Hibernate
4. Start on http://localhost:8080

### Step 4: Verify Database Creation
```bash
psql -h aws-1-ap-northeast-1.pooler.supabase.com -U postgres.jberdyjdgtkeljuyuzgd -d postgres -c "\dt"
```

You should see all 10 tables listed.

## Seed Data (Optional)

To populate test data, you can use the `seed.sql` file that's already in your project:
```bash
psql -h aws-1-ap-northeast-1.pooler.supabase.com -U postgres.jberdyjdgtkeljuyuzgd -d postgres < seed.sql
```

This will create test users and data for development.

## Important Notes

⚠️ **Password Security**: The connection credentials are hardcoded in `application.properties`. For production, use environment variables:

```properties
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DATABASE_USER}
spring.datasource.password=${DATABASE_PASSWORD}
```

Set these as environment variables in your deployment environment.

## Hibernate DDL Settings Explained

- **ddl-auto=update**: Automatically creates missing tables, adds missing columns. Safe for development.
- **ddl-auto=create-drop**: Drops all tables on shutdown (useful for testing)
- **ddl-auto=validate**: Only validates existing schema (for production)

For this project, **update** is set, so each time the app starts:
- Missing tables are created
- Missing columns are added
- Existing data is preserved

## Troubleshooting

### Connection Issues
- Verify Supabase project is active
- Check firewall allows IPv6/IPv4 connections
- Ensure credentials are correct in application.properties

### Table Not Found Errors
1. Run cleanup_and_recreate.sql again
2. Or restart the Spring Boot application to let Hibernate recreate them

### JSON Parsing Errors
- Ensure PostgreSQL JDBC driver version matches Spring Boot version
- Check that `@JsonIgnoreProperties` annotations are on entities

## Frontend Configuration

The frontend expects the backend at: `http://localhost:8080`

Frontend should be running at: `http://localhost:5173` (Vite default)

CORS is enabled for both ports in the controllers.

## Entity Classes Location

All entity classes are in:
```
src/main/java/com/maternalcare/entities/
```

They correspond exactly to the database tables created by this SQL script.
