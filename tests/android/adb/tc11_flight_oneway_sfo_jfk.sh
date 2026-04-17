#!/bin/bash
# TC11: One-way SFO -> JFK
# Dates: Departure = 2024-04-01
source ./tests/android/adb/common.sh
TC_ID="TC11"
PASS=0

echo "[TC11] Search one-way flights from SFO to JFK on 2024-04-01"
clear_db
tap 540 2303; sleep 2  # Flights tab
find_and_tap "trip_type_one_way"; sleep 0.5
find_and_tap "flight_origin_input"; sleep 0.3; type_text "SFO"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "flight_destination_input"; sleep 0.3; type_text "JFK"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
pick_date "flight_departure_date" "2024-04-01"  # April 1, 2024
find_and_tap "search_button"; sleep 4
screenshot "after_${TC_ID}"

pull_db_cat
C=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type='flight' AND query_params = '{\"origin\":\"SFO\",\"destination\":\"JFK\",\"date\":\"2024-04-01\",\"returnDate\":\"\",\"passengers\":1,\"tripType\":\"one_way\"}';")
RC=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type='flight' AND query_params = '{\"origin\":\"SFO\",\"destination\":\"JFK\",\"date\":\"2024-04-01\",\"returnDate\":\"\",\"passengers\":1,\"tripType\":\"one_way\"}' AND result_count = 4;")
[ "$RC" -gt 0 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — matching_entries=$RC (expected >=1 with result_count=4)"
