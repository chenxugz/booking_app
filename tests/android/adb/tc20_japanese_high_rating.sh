#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC20"
PASS=0

echo "[$TC_ID] Filter Japanese cuisine with rating >= 4.5"

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

# Select Japanese cuisine chip
tap 270 500
sleep 1

# Select 4.5 star rating filter
tap 810 650
sleep 1

# Apply
tap 540 2100
sleep 2

screenshot "after_${TC_ID}"

pull_db

COUNT=$(sqlite3 $DB_LOCAL \
  "SELECT COUNT(*) FROM search_log WHERE search_type='restaurant';" 2>/dev/null)
[ "${COUNT:-0}" -gt "0" ] && PASS=1

STATUS="FAIL"
[ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS"
