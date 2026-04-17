#!/bin/bash
# TC18: Fastest flight, sort by duration
# Dates: Departure = 2024-04-01
source ./tests/android/adb/common.sh
TC_ID="TC18"
PASS=0

echo "[TC18] Search all flights from SFO on 2024-04-01, sort by duration ascending (fastest first)"
clear_db
tap 540 2303; sleep 2
find_and_tap "flight_origin_input"; sleep 0.3; type_text "SFO"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
pick_date "flight_departure_date" "2024-04-01"
find_and_tap "search_button"; sleep 4
find_and_tap "sort_button"; sleep 1
find_and_tap "sort_option_duration_asc"; sleep 2
screenshot "after_${TC_ID}"

pull_db_cat
C=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type='flight' AND query_params = '{\"origin\":\"SFO\",\"destination\":\"\",\"date\":\"2024-04-01\",\"returnDate\":\"\",\"passengers\":1,\"tripType\":\"one_way\"}';")
RC=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type='flight' AND query_params = '{\"origin\":\"SFO\",\"destination\":\"\",\"date\":\"2024-04-01\",\"returnDate\":\"\",\"passengers\":1,\"tripType\":\"one_way\"}' AND result_count = 5;")
[ "$RC" -gt 0 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — matching_entries=$RC (expected >=1 with result_count=5)"
