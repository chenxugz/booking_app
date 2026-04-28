#!/bin/bash
# TC20: Japanese cuisine >= 4.5
# DB Check: restaurant_filter with Japanese+4.5 -> result_count = 4
source ./tests/android/adb/common.sh
TC_ID="TC20"
PASS=0

echo "[TC20] Search restaurants in San Francisco on 2024-04-07, then filter by Japanese cuisine with rating >= 4.5"
clear_db

find_and_tap "tab_restaurants"; sleep 1
find_and_tap "restaurant_search_input"; sleep 0.3; type_text "San%sFrancisco"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
pick_date "restaurant_date_picker" "2024-04-07"
pick_time "restaurant_time_picker" "20:00"
find_and_tap "search_button"; sleep 4

find_and_tap "filter_button"; sleep 1
find_and_tap "filter_cuisine_japanese"; sleep 0.5
adb shell input swipe 540 1800 540 600 400; sleep 0.5
find_and_tap "filter_rating_4.5"; sleep 0.5
find_and_tap "filter_close_button"; sleep 2
screenshot "after_${TC_ID}"

pull_db_cat
# Verify search was logged with correct params
SC=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type='restaurant' AND query_params = '{\"city\":\"San Francisco\",\"date\":\"2024-04-07\",\"time\":\"20:00\",\"partySize\":2}' AND result_count = 30;")
RC=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type LIKE '%_filter' AND query_params = '{\"cuisine\":\"Japanese\",\"minRating\":4.5}' AND result_count = 4;")
[ "$RC" -gt 0 ] && [ "$SC" -gt 0 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS (search=$SC) — Japanese>=4.5 matching_entries=$RC (expected >=1 with result_count=4)"
