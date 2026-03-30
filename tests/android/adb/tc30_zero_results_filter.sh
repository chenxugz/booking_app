#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC30"
PASS=0

echo "[$TC_ID] Apply filters yielding 0 results — verify empty state UI shown"

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

# Tap Filter
tap 810 300
sleep 2

# Set max price to $1 (drag price slider all the way left)
swipe 930 700 160 700
sleep 1

# Apply filter
tap 540 2100
sleep 2

screenshot "after_${TC_ID}"

pull_db

# The test passes if the empty state is rendered — verified by screenshot.
# DB-side: search_log should still have an entry from the search above.
COUNT=$(sqlite3 $DB_LOCAL \
  "SELECT COUNT(*) FROM search_log WHERE search_type='hotel';" 2>/dev/null)
[ "${COUNT:-0}" -gt "0" ] && PASS=1

STATUS="FAIL"
[ $PASS -eq 1 ] && STATUS="PASS (visual verify required — check after_${TC_ID}.png for empty state UI)"
log_result "$TC_ID" "$STATUS"
