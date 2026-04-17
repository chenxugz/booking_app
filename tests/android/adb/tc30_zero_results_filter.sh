#!/bin/bash
# TC30: Zero results -> empty state
# Dates: N/A
# DB Check: search_log has hotel search with result_count=0
source ./tests/android/adb/common.sh
TC_ID="TC30"
PASS=0

echo "[TC30] Search hotels in a nonexistent city (Zzzznonexistent99) and observe the empty results"
clear_db
tap 180 2303; sleep 1
tap 540 668; sleep 0.5; type_text "Zzzznonexistent99"
adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "search_button"; sleep 4
screenshot "after_${TC_ID}"

pull_db_cat
RC=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type='hotel' AND query_params = '{\"city\":\"Zzzznonexistent99\",\"checkIn\":\"\",\"checkOut\":\"\",\"guests\":1}' AND result_count = 0;")

[ "$RC" -gt 0 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — matching_entries=$RC (expected >=1 with result_count=0)"
