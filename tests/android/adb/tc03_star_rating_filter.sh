#!/bin/bash
# TC03: Star Rating >= 4
# DB Check: hotel_filter entry with minStars=4 -> result_count = 8
source ./tests/android/adb/common.sh
TC_ID="TC03"
PASS=0

echo "[TC03] Search hotels in San Francisco, then filter by 4-star rating and above"
clear_db

tap 180 2303; sleep 1
tap 540 668; sleep 0.5; type_text "San%sFrancisco"
adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "search_button"; sleep 4

find_and_tap "filter_button"; sleep 1
adb shell input swipe 540 1800 540 600 400; sleep 0.5
find_and_tap "filter_stars_4"; sleep 0.5
find_and_tap "filter_close_button"; sleep 2
screenshot "after_${TC_ID}"

pull_db_cat
RC=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type LIKE '%_filter' AND query_params = '{\"minStars\":4}' AND result_count = 8;")
[ "$RC" -gt 0 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — 4-star filter matching_entries=$RC (expected >=1 with result_count=8)"
