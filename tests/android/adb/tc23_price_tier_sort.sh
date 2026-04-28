#!/bin/bash
# TC23: Sort by review count
# Dates: Date = 2024-04-01
# DB Check: restaurant search logged with correct params, then sort=review_count_desc applied
source ./tests/android/adb/common.sh
TC_ID="TC23"
PASS=0

echo "[TC23] Search restaurants in San Francisco on 2024-04-01, then sort by most reviewed (review count descending)"
clear_db
find_and_tap "tab_restaurants"; sleep 1
find_and_tap "restaurant_search_input"; sleep 0.3; type_text "San%sFrancisco"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
pick_date "restaurant_date_picker" "2024-04-01"
find_and_tap "search_button"; sleep 4
find_and_tap "sort_button"; sleep 1
find_and_tap "sort_option_review_count_desc"; sleep 2
screenshot "after_${TC_ID}"

pull_db_cat
# Verify the search was logged with correct params
SC=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type='restaurant' AND query_params = '{\"city\":\"San Francisco\",\"date\":\"2024-04-01\",\"time\":\"\",\"partySize\":2}' AND result_count = 30;")
# Verify the sort was applied
SORT=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type='restaurant_sort' AND query_params = '{\"sort\":\"review_count_desc\"}' AND result_count = 30;")
[ "$SC" -gt 0 ] && [ "$SORT" -gt 0 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — search=$SC, sort_review_count=$SORT (expected both >=1 with result_count=30)"
