#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC24"
PASS=0

echo "[$TC_ID] Find gluten-free restaurant and complete booking"

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

# Tap Filter
tap 810 300
sleep 2

# Toggle gluten_free dietary filter
tap 270 850
sleep 1

# Apply
tap 540 2100
sleep 2

# Tap first restaurant card
tap 540 600
sleep 2

# Tap Book / Make Reservation button
tap 540 2050
sleep 2

# Step 1: Guest info
tap 540 400
sleep 1
type_text "Ivan%20Chen"
sleep 1
tap 540 520
sleep 1
type_text "ivan@example.com"
sleep 1
tap 540 640
sleep 1
type_text "5550001111"
sleep 1

# Next
tap 540 2050
sleep 2

# Step 2: Select first available time slot
tap 540 450
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
  "SELECT COUNT(*) FROM bookings WHERE booking_type='restaurant';" 2>/dev/null)
[ "${COUNT:-0}" -gt "0" ] && PASS=1

STATUS="FAIL"
[ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS"
