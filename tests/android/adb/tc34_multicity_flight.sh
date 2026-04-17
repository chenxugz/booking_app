#!/bin/bash
# TC34: Multi-city flight SFO -> JFK -> LAX
# Dates: Leg 1 = 2024-04-01, Leg 2 = 2024-04-05
source ./tests/android/adb/common.sh
TC_ID="TC34"
PASS=0

echo "[TC34] Search multi-city flights: leg 1 SFO to JFK on 2024-04-01, leg 2 JFK to LAX on 2024-04-05"
clear_db
tap 540 2303; sleep 2
find_and_tap "trip_type_multi_city"; sleep 1
screenshot "before_${TC_ID}"

find_and_tap "multi_city_origin_1"; sleep 0.3; type_text "SFO"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "multi_city_destination_1"; sleep 0.3; type_text "JFK"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
pick_date "multi_city_date_1" "2024-04-01"      # April 1, 2024
find_and_tap "multi_city_destination_2"; sleep 0.3; type_text "LAX"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
pick_date "multi_city_date_2" "2024-04-05"       # April 5, 2024

adb shell input swipe 540 1800 540 600 400; sleep 0.5
find_and_tap "search_button"; sleep 4
screenshot "after_${TC_ID}"

pull_db_cat
MC=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type='flight' AND query_params = '{\"tripType\":\"multi_city\",\"legs\":[{\"origin\":\"SFO\",\"destination\":\"JFK\",\"date\":\"2024-04-01\"},{\"origin\":\"JFK\",\"destination\":\"LAX\",\"date\":\"2024-04-05\"}],\"passengers\":1}';")
[ "$MC" -gt 0 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — $MC multi-city searches"
