#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC08"
PASS=0

echo "[$TC_ID] Select King Suite room type during checkout"

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

# Set dates
tap 270 560
sleep 1
tap 540 900
sleep 1
tap 810 560
sleep 1
tap 720 900
sleep 1

# Tap Search
tap 540 950
sleep 3

# Tap first hotel card
tap 540 600
sleep 2

# Tap Book Now on detail screen
tap 540 2050
sleep 2

# Step 1: Guest info
tap 540 400
sleep 1
type_text "Alice%20Walker"
sleep 1
tap 540 520
sleep 1
type_text "alice@example.com"
sleep 1
tap 540 640
sleep 1
type_text "5551112222"
sleep 1

# Next
tap 540 2050
sleep 2

# Step 2: Select King Suite room type from dropdown/selector
tap 540 400
sleep 1
# Tap King Suite option in the room type list
tap 540 550
sleep 1

# Next
tap 540 2050
sleep 2

# Step 3: Confirm
tap 540 2050
sleep 3

screenshot "after_${TC_ID}"

pull_db

COUNT=$(sqlite3 $DB_LOCAL \
  "SELECT COUNT(*) FROM bookings WHERE booking_type='hotel' AND room_type='King Suite';" 2>/dev/null)
[ "${COUNT:-0}" -gt "0" ] && PASS=1

STATUS="FAIL"
[ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS"
