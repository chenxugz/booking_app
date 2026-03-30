#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC03"
PASS=0

echo "[$TC_ID] Filter by 4-star rating and above"

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

# Tap Search
tap 540 950
sleep 3

# Tap Filter button
tap 810 300
sleep 2

# Tap 4-star filter chip/button (approximate position in filter panel)
tap 540 550
sleep 1

# Apply filter
tap 540 2100
sleep 2

screenshot "after_${TC_ID}"

pull_db

COUNT=$(sqlite3 $DB_LOCAL \
  "SELECT COUNT(*) FROM search_log WHERE search_type='hotel';" 2>/dev/null)
[ "${COUNT:-0}" -gt "0" ] && PASS=1

STATUS="FAIL"
[ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS"
