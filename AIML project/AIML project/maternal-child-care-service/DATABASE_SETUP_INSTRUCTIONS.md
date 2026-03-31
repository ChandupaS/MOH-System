# Database Setup Instructions for Supabase

## Problem
The Hibernate DDL auto-update is not creating tables in Supabase automatically. This is likely due to connection issues or timing problems.

## Solution: Manual Table Creation

### Step 1: Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard
2. Login to your account
3. Select your project (MOH System)

### Step 2: Open SQL Editor
1. In the left sidebar, click on **SQL Editor**
2. Or directly access: **Database > SQL queries**

### Step 3: Copy and Paste SQL
1. Open this file: `SUPABASE_SETUP.sql`
2. Copy **ALL** the content
3. In Supabase SQL Editor, paste the entire script
4. Click **RUN** button (or press Ctrl+Enter)

### What This Does
- Drops old tables (if they exist)
- Creates all 10 required tables with proper relationships
- Creates indexes for better performance
- Inserts test data (2 midwife accounts)

### Step 4: Verify Tables Created
After running the SQL:
1. Go to **Database > Tables** in Supabase
2. You should see these tables:
   - users
   - midwife_profiles
   - mother_profiles
   - child_profiles
   - home_visit_schedules
   - vaccination_schedules
   - symptom_entries
   - clinic_visit_records
   - announcements
   - announcement_read_status

### Step 5: Start the Backend
Once tables are created, run:
```bash
cd "c:\Users\DELL\Desktop\MOH-Kaduwela\AIML_PROJECT\AIML project\AIML project\maternal-child-care-service"
java -jar target/maternal-care-0.0.1-SNAPSHOT.jar
```

The backend will now:
- Connect to Supabase successfully
- Use the DDL auto-update mode to keep schema in sync
- All operations (register mother, save profiles) will work

## Test Credentials

After setup, you can login with:

**Doctor Account:**
- Email: `doctor@moh.gov.lk`
- Password: `password123`

**Midwife Accounts:**
- Email: `midwife.perera@moh.gov.lk`
- Password: `password123`
- GN Division: `Malabe East`

OR

- Email: `midwife.kumari@moh.gov.lk`
- Password: `password123`
- GN Division: `Kaduwela`

## Troubleshooting

If you get errors when running the SQL:

1. **"Table already exists"** - This is okay, the DROP IF EXISTS handled it
2. **"Foreign key constraint error"** - Run the script all at once, don't run individual statements
3. **"Connection timeout"** - Check your internet connection and Supabase status

## Backend Configuration
The application is configured to:
- **URL**: `jdbc:postgresql://aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres`
- **Username**: `postgres.jberdyjdgtkeljuyuzgd`
- **Password**: `SLIITAI0102G18`
- **DDL Mode**: `update` (keeps tables synchronized with Java entities)

## Next Steps
1. Run the SQL setup in Supabase
2. Verify tables exist in Supabase dashboard
3. Start the backend JAR
4. Open frontend http://localhost:5173
5. Login with test credentials
6. Register new mothers, save profiles, etc.

Everything will now persist to Supabase! ✅
