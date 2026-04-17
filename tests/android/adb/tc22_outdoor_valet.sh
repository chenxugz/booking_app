#!/bin/bash
# TC22: Outdoor seating + valet parking filter
# Dates: N/A (search only)
# DB Check: restaurant_filter entry with outdoor_seating+valet_parking, result_count > 0
source ./tests/android/adb/common.sh
TC_ID="TC22"
PASS=0

echo "[TC22] Search restaurants in San Francisco on 2024-04-01, then filter by outdoor seating AND valet parking"
clear_db
tap 900 2303; sleep 2
find_and_tap "search_button"; sleep 4
find_and_tap "filter_button"; sleep 1
adb shell input swipe 540 1800 540 600 400; sleep 0.5
find_and_tap "filter_outdoor_seating"; sleep 0.3
find_and_tap "filter_valet_parking"; sleep 0.3
find_and_tap "filter_close_button"; sleep 2
screenshot "after_${TC_ID}"

pull_db_cat
RC=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type LIKE '%_filter' AND query_params = '{\"amenities\":[\"outdoor_seating\",\"valet_parking\"]}' AND result_count = 5;")
[ "$RC" -gt 0 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — outdoor+valet matching_entries=$RC (expected >=1 with result_count=5)"
