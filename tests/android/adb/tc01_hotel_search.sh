#!/bin/bash
# TC01: Hotel Search — San Francisco, 2 guests, 3 nights
# Dates: Check-in = 2024-04-01, Check-out = 2024-04-04 (3 nights)
source ./tests/android/adb/common.sh
TC_ID="TC01"
PASS=0

echo "[TC01] Search hotels in San Francisco for 2 guests, 3 nights (check-in 2024-04-01, check-out 2024-04-04)"
clear_db
tap 180 2303; sleep 1  # Hotels tab
screenshot "before_${TC_ID}"

tap 540 668; sleep 0.5; type_text "San%sFrancisco"
adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3

pick_date "checkin_date_picker" "2024-04-01"   # April 1, 2024
pick_date "checkout_date_picker" "2024-04-04" # April 4, 2024 (3 nights)

tap 985 1334; sleep 0.3                   # guests -> 2
find_and_tap "search_button"; sleep 4
screenshot "after_${TC_ID}"

pull_db_cat
COUNT=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type='hotel' AND query_params = '{\"city\":\"San Francisco\",\"checkIn\":\"2024-04-01\",\"checkOut\":\"2024-04-04\",\"guests\":2}';")
[ "$COUNT" -gt 0 ] && PASS=1
RC=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type='hotel' AND query_params = '{\"city\":\"San Francisco\",\"checkIn\":\"2024-04-01\",\"checkOut\":\"2024-04-04\",\"guests\":2}' AND result_count = 24;")
[ "$RC" -gt 0 ] || PASS=0
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — searches=$COUNT, entries_with_24_results=$RC (expected >=1)"
