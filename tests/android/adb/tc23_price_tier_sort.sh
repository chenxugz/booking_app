#!/bin/bash
# TC23: Sort by review count
# Dates: N/A (search only)
# DB Check: restaurant_filter entry with sort=review_count_desc, result_count > 0
source ./tests/android/adb/common.sh
TC_ID="TC23"
PASS=0

echo "[TC23] Search restaurants in San Francisco on 2024-04-01, then sort by most reviewed (review count descending)"
clear_db
tap 900 2303; sleep 2
find_and_tap "search_button"; sleep 4
find_and_tap "sort_button"; sleep 1
find_and_tap "sort_option_review_count_desc"; sleep 2
screenshot "after_${TC_ID}"

pull_db_cat
RC=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type LIKE '%_sort' AND query_params = '{\"sort\":\"review_count_desc\"}' AND result_count = 30;")
[ "$RC" -gt 0 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — sort matching_entries=$RC (expected >=1 with result_count=30)"
