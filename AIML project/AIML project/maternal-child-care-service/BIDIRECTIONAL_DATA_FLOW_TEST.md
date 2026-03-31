# Bidirectional Data Flow - Testing Guide

## Overview
This document describes how to test the bidirectional data synchronization between mothers and midwives in the maternal child care application.

## Architecture

### Data Flow Paths
1. **Mother Updates → Visible to Midwife**
   - Mother logs in, edits her profile via "Edit Profile" button
   - Mother updates: contact number, address, height, weight, health conditions, allergies
   - Changes submitted via `PUT /api/mother/{userId}/profile`
   - Data stored in shared `mother_profiles` table
   - Midwife views same mother via MotherProfileHub
   - Midwife sees updated fields immediately

2. **Midwife Updates → Visible to Mother**
   - Midwife logs in, navigates to specific mother via "Manage Mothers"
   - Midwife clicks "Go to Profile" button
   - Midwife clicks "Edit Clinical Info" button on MotherProfileHub
   - Midwife updates: EDD, LMP, gravida, para, blood group, health conditions, allergies
   - Changes submitted via `PUT /api/midwife/{midwifeId}/mother/{motherId}`
   - Data stored in same `mother_profiles` table
   - Mother's next MotherDashboard load shows updated values

## Test Scenarios

### Scenario 1: Mother Updates Profile → Midwife Sees Changes

**Prerequisites:**
- Mother (Amila Kumari) logged in
- Midwife (test account) logged in to different browser/tab
- Backend running on localhost:8080
- Frontend running on localhost:5173

**Steps:**
1. Mother opens MotherDashboard (/mother)
2. Mother clicks "Edit Profile" button in "Your Profile Information" section
3. Mother updates fields:
   - Contact Number: Change from "0771234567" to "0771234567-UPDATED"
   - Health Conditions: Add "Updated during test"
4. Mother clicks "Save Changes" button
5. Verify success message: "Profile updated successfully! Your midwife can now see the changes."
6. Mother logs out

**Verification:**
1. Midwife navigates to Manage Mothers (/midwife/mothers)
2. Midwife clicks "Go to Profile" button for "Amila Kumari"
3. Midwife views MotherProfileHub
4. Verify midwife sees:
   - Contact Number: "0771234567-UPDATED" ✅
   - Health Conditions: Shows "Updated during test" ✅
5. Confirm data matches exactly what mother entered

### Scenario 2: Midwife Updates Clinical Info → Mother Sees Changes

**Prerequisites:**
- Midwife logged in
- Mother (Nuwani Dissanayake) logged in to different browser/tab
- Backend running on localhost:8080
- Frontend running on localhost:5173

**Steps:**
1. Midwife navigates to /midwife/mothers
2. Midwife clicks "Go to Profile" for "Nuwani Dissanayake"
3. Midwife clicks "Edit Clinical Info" button
4. Midwife updates fields:
   - Expected Delivery Date: Change to "2025-06-01"
   - Gravida: Change from 2 to 3
   - Health Conditions: Update to "Hypertension, Gestational Diabetes, Anemia"
5. Midwife clicks "Save Changes" button
6. Verify success message: "Mother profile updated successfully!"
7. Midwife navigates away from profile

**Verification:**
1. Mother refreshes MotherDashboard (/mother)
2. Mother navigates to Pregnancy Details section
3. Verify mother sees:
   - Expected Delivery Date: "2025-06-01" ✅
   - Gravida: 3 ✅
4. Alternatively, mother can see in the profile panel:
   - Health Conditions: Updated to "Hypertension, Gestational Diabetes, Anemia" ✅

### Scenario 3: Bidirectional Updates - Full Cycle

**Steps:**
1. Mother updates personal info (height, weight, address) and saves
2. Midwife refreshes MotherProfileHub and verifies updates visible
3. Midwife updates clinical data (EDD, para, allergies) and saves
4. Mother refreshes dashboard and verifies updates visible
5. Repeat 1-4 to confirm continuous sync works

**Expected Result:**
All updates are immediately visible across both portals after refresh/navigation

## Test Data

### Test Mothers (Pre-Seeded)

#### 1. Amila Kumari
- Email: amila.kumari@test.com
- GN Division: Colombo Central
- EDD: 2025-06-15
- LMP: 2024-09-08
- Gravida: 1, Para: 0
- Blood Group: O+
- Height: 165 cm, Weight: 68 kg
- Allergies: Penicillin
- Health Conditions: Gestational Diabetes
- Contact: 0771234567
- Address: 123 Main Street, Colombo 7

#### 2. Nuwani Dissanayake
- Email: nuwani.diss@test.com
- GN Division: Colombo South
- EDD: 2025-05-20
- LMP: 2024-08-13
- Gravida: 2, Para: 1 (1 previous C-section)
- Blood Group: A-
- Height: 162 cm, Weight: 72 kg
- Allergies: Sulfonamides
- Health Conditions: Hypertension, Gestational Diabetes
- Contact: 0772345678
- Address: 456 Oakwood Avenue, Colombo 3

#### 3. Kavya Perera
- Email: kavya.perera@test.com
- GN Division: Colombo Central
- EDD: 2025-07-10
- LMP: 2024-10-03
- Gravida: 1, Para: 0
- Blood Group: B+
- Height: 170 cm, Weight: 65 kg
- Allergies: None
- Health Conditions: None
- Contact: 0773456789
- Address: 789 Maple Drive, Colombo 5

## API Endpoints Involved

### Mother's Own Profile APIs
- **GET** `/api/mother/{userId}/profile` - Mother retrieves her own profile
- **PUT** `/api/mother/{userId}/profile` - Mother updates her own profile fields

### Midwife's View APIs
- **GET** `/api/midwife/{midwifeId}/mothers` - List all mothers in division
- **GET** `/api/midwife/{midwifeId}/mother/{motherId}` - Get specific mother's profile
- **PUT** `/api/midwife/{midwifeId}/mother/{motherId}` - Midwife updates mother's profile

## Database Schema

### mother_profiles Table
```sql
CREATE TABLE mother_profiles (
  id SERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE REFERENCES users(id),
  gn_division VARCHAR(255),
  edd DATE,
  lmp DATE,
  gravida INTEGER,
  para INTEGER,
  previous_c_sections INTEGER,
  previous_miscarriages INTEGER,
  previous_stillbirths INTEGER,
  blood_group VARCHAR(10),
  height VARCHAR(50),
  weight VARCHAR(50),
  allergies TEXT,
  health_conditions TEXT,
  contact_number VARCHAR(20),
  address TEXT,
  registration_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Troubleshooting

### Issue: Mother's changes not visible to midwife
**Check:**
1. Backend is running (`http://localhost:8080`)
2. Mother's profile update returned status 200
3. Midwife reloaded MotherProfileHub (not just navigated)
4. Database connection is active

### Issue: Midwife's changes not visible to mother
**Check:**
1. Midwife's profile update succeeded with success message
2. Mother reloaded MotherDashboard page
3. Check browser console for any API errors
4. Verify same mother_profiles table row is being updated

### Issue: API errors
**Check:**
1. Both PUT endpoints are returning 200 status
2. Request payloads match expected field names
3. User IDs in URLs are correct
4. Backend logs for any SQL or validation errors

## Success Criteria

✅ All test scenarios completed successfully
✅ No errors in browser console
✅ All API calls return 200 status code
✅ Database shows single updated values (no duplicates)
✅ Both mother and midwife portals show identical data for same patient
✅ Updates persist after page refresh/logout-login

## Notes

- Test data password hash is a placeholder - use your own bcrypt hash for real testing
- All timestamps use UTC+5:30 (Sri Lanka timezone) as per application.properties
- Data is synced through shared `mother_profiles` table - no separate sync mechanism needed
- Frontend caches data, so reload is often required to see updates
