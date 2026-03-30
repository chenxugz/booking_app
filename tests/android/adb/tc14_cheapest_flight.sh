#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC14"
PASS=0

echo "[$TC_ID] Sort by price ascending and book cheapest flight"

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

# Tap Sort
tap 270 300
sleep 2

# Select Price: Low to High
tap 540 450
sleep 1

screenshot "mid_${TC_ID}_sorted"

# Tap first (cheapest) flight card
tap 540 600
sleep 2

# Tap Book Now
tap 540 2050
sleep 2

# Step 1: Guest info
tap 540 400
sleep 1
type_text "Dave%20Brown"
sleep 1
tap 540 520
sleep 1
type_text "dave@example.com"
sleep 1
tap 540 640
sleep 1
type_text "5557778888"
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
  "SELECT COUNT(*) FROM bookings WHERE booking_type='flight';" 2>/dev/null)
[ "${COUNT:-0}" -gt "0" ] && PASS=1

STATUS="FAIL"
[ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS"
