#!/bin/bash
# TC02: Price Filter <= $150
# Dates: N/A (hotel date not required for search)
# DB Check: hotel_filter entry with maxPrice=150 -> result_count = 10
source ./tests/android/adb/common.sh
TC_ID="TC02"
PASS=0

echo "[TC02] Search hotels in San Francisco, then filter by max price $150/night"
clear_db

tap 180 2303; sleep 1
tap 540 668; sleep 0.5; type_text "San%sFrancisco"
adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "search_button"; sleep 4

find_and_tap "filter_button"; sleep 1
find_and_tap "filter_price_150"; sleep 0.5
find_and_tap "filter_close_button"; sleep 2
screenshot "after_${TC_ID}"

pull_db_cat
RC=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type LIKE '%_filter' AND query_params = '{\"maxPrice\":150}' AND result_count = 10;")
[ "$RC" -gt 0 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — filter matching_entries=$RC (expected >=1 with result_count=10)"
