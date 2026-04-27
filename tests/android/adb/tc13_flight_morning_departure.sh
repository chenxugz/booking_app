#!/bin/bash
# TC13: Morning departure 6am-12pm filter
# Dates: Departure = 2024-04-01
# DB Check: flight_filter with departure 6-12 -> result_count = 3
source ./tests/android/adb/common.sh
TC_ID="TC13"
PASS=0

echo "[TC13] Search flights SFO to JFK on 2024-04-01, then filter by morning departure (6am-12pm)"
clear_db

tap 540 2303; sleep 2
find_and_tap "flight_origin_input"; sleep 0.3; type_text "SFO"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "flight_destination_input"; sleep 0.3; type_text "JFK"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
pick_date "flight_departure_date" "2024-04-01"
find_and_tap "search_button"; sleep 4

find_and_tap "filter_button"; sleep 1
find_and_tap "filter_departure_6_12"; sleep 0.5
find_and_tap "filter_close_button"; sleep 2
screenshot "after_${TC_ID}"

pull_db_cat
# Verify search was logged with correct params
SC=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type='flight' AND query_params = '{\"origin\":\"SFO\",\"destination\":\"JFK\",\"date\":\"2024-04-01\",\"returnDate\":\"\",\"passengers\":1,\"tripType\":\"one_way\"}' AND result_count = 4;")
RC=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type LIKE '%_filter' AND query_params = '{\"departureWindow\":\"6-12\"}' AND result_count = 3;")
[ "$RC" -gt 0 ] && [ "$SC" -gt 0 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS (search=$SC) — morning departure matching_entries=$RC (expected >=1 with result_count=3)"
