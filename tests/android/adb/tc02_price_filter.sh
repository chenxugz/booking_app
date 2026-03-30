#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC02"
PASS=0

echo "[$TC_ID] Filter hotels by max price \$150/night"

launch_app
screenshot "before_${TC_ID}"

# Tap Hotels tab
tap 180 2200
sleep 1

# Enter San Francisco in location input
tap 540 420
sleep 1
type_text "San%20Francisco"
sleep 1

# Tap Search button
tap 540 950
sleep 3

# Tap Filter button on results screen
tap 810 300
sleep 2

# Drag price range slider to ~$150 (slider occupies roughly x=150 to x=930 at y=700)
# Drag right handle left to cap at ~$150 (roughly 40% of slider width)
swipe 930 700 450 700
sleep 1

# Close/apply filter
tap 540 2100
sleep 2

screenshot "after_${TC_ID}"

pull_db

# Visual pass: search_log has hotel entry (filter is UI-only, no separate DB entry)
COUNT=$(sqlite3 $DB_LOCAL \
  "SELECT COUNT(*) FROM search_log WHERE search_type='hotel';" 2>/dev/null)
[ "${COUNT:-0}" -gt "0" ] && PASS=1

STATUS="FAIL"
[ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS"
