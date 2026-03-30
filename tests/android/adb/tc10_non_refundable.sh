#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC10"
PASS=0

echo "[$TC_ID] Choose non-refundable rate hotel and book"

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

# Tap Filter to find non_refundable policy hotels
tap 810 300
sleep 2

# Select non-refundable cancellation policy option
tap 540 950
sleep 1

# Apply filter
tap 540 2100
sleep 2

# Tap first hotel card
tap 540 600
sleep 2

# Tap Book Now
tap 540 2050
sleep 2

# Step 1: Guest info
tap 540 400
sleep 1
type_text "Carol%20Smith"
sleep 1
tap 540 520
sleep 1
type_text "carol@example.com"
sleep 1
tap 540 640
sleep 1
type_text "5555556666"
sleep 1

# Next
tap 540 2050
sleep 2

# Step 2: Next
tap 540 2050
sleep 2

# Step 3: Confirm
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
