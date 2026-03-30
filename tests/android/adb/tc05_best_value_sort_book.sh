#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC05"
PASS=0

echo "[$TC_ID] Sort by Best Value and book top result"

launch_app
screenshot "before_${TC_ID}"

# Tap Hotels tab
tap 180 2200
sleep 1

# Enter city
tap 540 420
sleep 1
type_text "San%20Francisco"
sleep 1

# Set check-in date
tap 270 560
sleep 1
tap 540 900
sleep 1

# Set check-out date
tap 810 560
sleep 1
tap 720 900
sleep 1

# Tap Search
tap 540 950
sleep 3

# Tap Sort button
tap 270 300
sleep 2

# Select Best Value option
tap 540 500
sleep 1

screenshot "mid_${TC_ID}_sorted"

# Tap first hotel card
tap 540 600
sleep 2

# Tap Book Now on detail screen
tap 540 2050
sleep 2

# Step 1: Fill guest info
tap 540 400
sleep 1
type_text "John%20Smith"
sleep 1

tap 540 520
sleep 1
type_text "john@example.com"
sleep 1

tap 540 640
sleep 1
type_text "5551234567"
sleep 1

# Tap Next
tap 540 2050
sleep 2

# Step 2: Skip extras, tap Next
tap 540 2050
sleep 2

# Step 3: Tap Confirm
tap 540 2050
sleep 3

screenshot "after_${TC_ID}"

pull_db

COUNT=$(sqlite3 $DB_LOCAL \
  "SELECT COUNT(*) FROM bookings WHERE booking_type='hotel';" 2>/dev/null)
[ "${COUNT:-0}" -gt "0" ] && PASS=1

STATUS="FAIL"
[ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS"
