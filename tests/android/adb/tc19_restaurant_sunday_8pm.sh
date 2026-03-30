#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC19"
PASS=0

echo "[$TC_ID] Find restaurants open Sunday after 8pm"

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

# Set party size to 2
tap 540 560
sleep 1
type_text "2"
sleep 1

# Set date to a Sunday (tap date picker)
tap 540 680
sleep 1
# Navigate to next Sunday in calendar
tap 700 900
sleep 1
tap 180 1000
sleep 1

# Set time to after 8pm (tap time picker)
tap 540 800
sleep 1
# Scroll to 20:00 / 8:00 PM
swipe 540 900 540 600 200
sleep 1
tap 540 700
sleep 1

# Tap Search
tap 540 950
sleep 3

# Tap Filter
tap 810 300
sleep 2

# Toggle Sunday open filter
tap 180 550
sleep 1

# Toggle late night (after 8pm) filter
tap 540 650
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
