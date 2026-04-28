#!/bin/bash
# TC19: Restaurant search Sunday after 8pm
# Dates: Date = 2024-04-07 (Sunday), Time = 20:00
source ./tests/android/adb/common.sh
TC_ID="TC19"
PASS=0

echo "[TC19] Search restaurants in San Francisco for Sunday 2024-04-07 at 20:00"
clear_db
find_and_tap "tab_restaurants"; sleep 1
find_and_tap "restaurant_search_input"; sleep 0.3; type_text "San%sFrancisco"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
pick_date "restaurant_date_picker" "2024-04-07" # April 7, 2024 (Sunday)
pick_time "restaurant_time_picker" "20:00"
find_and_tap "search_button"; sleep 4
screenshot "after_${TC_ID}"

pull_db_cat
C=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type='restaurant' AND query_params = '{\"city\":\"San Francisco\",\"date\":\"2024-04-07\",\"time\":\"20:00\",\"partySize\":2}';")
[ "$C" -gt 0 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — $C restaurant search(es)"
