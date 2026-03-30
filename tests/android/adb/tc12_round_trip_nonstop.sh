#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC12"
PASS=0

echo "[$TC_ID] Search round-trip non-stop flights"

launch_app
screenshot "before_${TC_ID}"

# Tap Flights tab
tap 540 2200
sleep 1

# Tap Round-trip toggle
tap 810 350
sleep 1

# Tap origin input
tap 540 460
sleep 1
type_text "SFO"
sleep 1

# Tap destination input
tap 540 580
sleep 1
type_text "JFK"
sleep 1

# Tap departure date picker
tap 270 700
sleep 1
tap 540 900
sleep 1

# Tap return date picker
tap 810 700
sleep 1
tap 720 900
sleep 1

# Tap Search
tap 540 950
sleep 3

# Tap Filter on results
tap 810 300
sleep 2

# Toggle non-stop filter
tap 540 450
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
