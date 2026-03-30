#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC16"
PASS=0

echo "[$TC_ID] Select window seat preference during flight checkout"

launch_app
screenshot "before_${TC_ID}"

# Tap Flights tab
tap 540 2200
sleep 1

# One-way
tap 270 350
sleep 1

# Origin
tap 540 460
sleep 1
type_text "SFO"
sleep 1

# Destination
tap 540 580
sleep 1
type_text "JFK"
sleep 1

# Date
tap 540 700
sleep 1
tap 540 900
sleep 1

# Tap Search
tap 540 950
sleep 3

# Tap first flight card
tap 540 600
sleep 2

# Tap Book Now
tap 540 2050
sleep 2

# Step 1: Guest info
tap 540 400
sleep 1
type_text "Frank%20Miller"
sleep 1
tap 540 520
sleep 1
type_text "frank@example.com"
sleep 1
tap 540 640
sleep 1
type_text "5554445555"
sleep 1

# Next
tap 540 2050
sleep 2

# Step 2: Select window seat preference radio/chip
tap 270 550
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
  "SELECT COUNT(*) FROM bookings WHERE booking_type='flight' AND extras LIKE '%seat_preference%';" 2>/dev/null)
[ "${COUNT:-0}" -gt "0" ] && PASS=1

STATUS="FAIL"
[ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS"
