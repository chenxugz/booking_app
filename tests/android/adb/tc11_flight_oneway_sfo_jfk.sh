#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC11"
PASS=0

echo "[$TC_ID] Search one-way SFO->JFK on 2026-04-01"

launch_app
screenshot "before_${TC_ID}"

# Tap Flights tab
tap 540 2200
sleep 1

# Ensure one-way is selected (tap one-way toggle)
tap 270 350
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
tap 540 700
sleep 1
# Navigate to April 2026 and tap the 1st
tap 700 900
sleep 1
tap 540 1000
sleep 1

# Tap Search
tap 540 950
sleep 3

screenshot "after_${TC_ID}"

pull_db

COUNT=$(sqlite3 $DB_LOCAL \
  "SELECT COUNT(*) FROM search_log WHERE search_type='flight';" 2>/dev/null)
[ "${COUNT:-0}" -gt "0" ] && PASS=1

STATUS="FAIL"
[ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS"
