#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC25"
PASS=0

echo "[$TC_ID] Book earliest available time slot at restaurant"

launch_app
screenshot "before_${TC_ID}"

# Tap Restaurants tab
tap 900 2200
sleep 1

# Tap location input
tap 540 420
sleep 1
type_text "San%20Francisco"
sleep 1

# Tap Search
tap 540 950
sleep 3

# Tap first restaurant card
tap 540 600
sleep 2

# On detail screen tap first available time slot chip
tap 200 1400
sleep 1

# Tap Book / Make Reservation button
tap 540 2050
sleep 2

# Step 1: Guest info
tap 540 400
sleep 1
type_text "Julia%20Roberts"
sleep 1
tap 540 520
sleep 1
type_text "julia@example.com"
sleep 1
tap 540 640
sleep 1
type_text "5552468135"
sleep 1

# Next
tap 540 2050
sleep 2

# Step 2: Confirm selected time slot (first/earliest)
tap 540 2050
sleep 2

# Step 3: Confirm
tap 540 2050
sleep 3

screenshot "after_${TC_ID}"

pull_db

COUNT=$(sqlite3 $DB_LOCAL \
  "SELECT COUNT(*) FROM bookings WHERE booking_type='restaurant';" 2>/dev/null)
[ "${COUNT:-0}" -gt "0" ] && PASS=1

STATUS="FAIL"
[ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS"
