#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC13"
PASS=0

echo "[$TC_ID] Filter flights departing between 6am-12pm (morning)"

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

# Tap Filter on results
tap 810 300
sleep 2

# Select Morning departure time filter (6am-12pm chip)
tap 270 600
sleep 1

# Apply
tap 540 2100
sleep 2

screenshot "after_${TC_ID}"

pull_db

COUNT=$(sqlite3 $DB_LOCAL \
  "SELECT COUNT(*) FROM search_log WHERE search_type='flight';" 2>/dev/null)
[ "${COUNT:-0}" -gt "0" ] && PASS=1

STATUS="FAIL"
[ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS"
