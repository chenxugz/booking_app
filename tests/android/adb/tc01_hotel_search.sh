#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC01"
PASS=0

echo "[$TC_ID] Search hotels in San Francisco for 2 guests, 3 nights"

launch_app
screenshot "before_${TC_ID}"

# Tap Hotels tab
tap 180 2200
sleep 1

# Tap location input and type city
tap 540 420
sleep 1
type_text "San%20Francisco"
sleep 1

# Tap check-in date picker
tap 270 560
sleep 1
# Select today + 1 day (tap a date cell near center of calendar)
tap 540 900
sleep 1

# Tap check-out date picker
tap 810 560
sleep 1
# Select today + 4 days
tap 720 900
sleep 1

# Increase guests to 2 (tap + on stepper, default is 1)
tap 650 700
sleep 1

# Tap Search button
tap 540 950
sleep 3

screenshot "after_${TC_ID}"

pull_db

COUNT=$(sqlite3 $DB_LOCAL \
  "SELECT COUNT(*) FROM search_log WHERE search_type='hotel';" 2>/dev/null)
[ "${COUNT:-0}" -gt "0" ] && PASS=1

STATUS="FAIL"
[ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS"
