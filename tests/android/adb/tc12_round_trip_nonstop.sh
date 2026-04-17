#!/bin/bash
# TC12: Round-trip non-stop SFO -> JFK
# Dates: Departure = 2024-04-01, Return = 2024-04-08
source ./tests/android/adb/common.sh
TC_ID="TC12"
PASS=0

echo "[TC12] Search round-trip flights SFO to JFK (depart 2024-04-01, return 2024-04-08), then filter by non-stop only"
clear_db
tap 540 2303; sleep 2
find_and_tap "trip_type_round_trip"; sleep 0.5
find_and_tap "flight_origin_input"; sleep 0.3; type_text "SFO"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "flight_destination_input"; sleep 0.3; type_text "JFK"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
pick_date "flight_departure_date" "2024-04-01"  # April 1, 2024
pick_date "flight_return_date" "2024-04-08"      # April 8, 2024
find_and_tap "search_button"; sleep 4

find_and_tap "filter_button"; sleep 1
find_and_tap "filter_stops_0"; sleep 0.5
find_and_tap "filter_close_button"; sleep 1
screenshot "after_${TC_ID}"

pull_db_cat
C=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type='flight' AND query_params = '{\"origin\":\"SFO\",\"destination\":\"JFK\",\"date\":\"2024-04-01\",\"returnDate\":\"2024-04-08\",\"passengers\":1,\"tripType\":\"round_trip\"}';")
RC=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type LIKE '%_filter' AND query_params = '{\"stops\":0}' AND result_count = 4;")
[ "$RC" -gt 0 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — nonstop filter matching_entries=$RC (expected >=1 with result_count=4)"
