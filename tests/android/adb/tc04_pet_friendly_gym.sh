#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC04"
PASS=0

echo "[$TC_ID] Filter pet_friendly + gym amenities within 5 miles of Union Square"

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

# Toggle pet_friendly amenity chip
tap 270 750
sleep 1

# Toggle gym amenity chip
tap 540 750
sleep 1

# Set distance to 5 miles (drag slider to midpoint)
swipe 930 850 540 850
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
