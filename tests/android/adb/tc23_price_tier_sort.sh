#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC23"
PASS=0

echo "[$TC_ID] Filter price tier \$\$ and sort by review count"

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

# Select price tier $$ chip (second chip in price tier row)
tap 400 550
sleep 1

# Apply
tap 540 2100
sleep 2

# Tap Sort
tap 270 300
sleep 2

# Select Most Reviewed / review_count_desc
tap 540 500
sleep 1

screenshot "after_${TC_ID}"

pull_db

COUNT=$(sqlite3 $DB_LOCAL \
  "SELECT COUNT(*) FROM search_log WHERE search_type='restaurant';" 2>/dev/null)
[ "${COUNT:-0}" -gt "0" ] && PASS=1

STATUS="FAIL"
[ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS"
