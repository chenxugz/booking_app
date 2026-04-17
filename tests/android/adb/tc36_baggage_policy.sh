#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC36"
PASS=0

echo "[TC36] Search flights from SFO on 2024-04-01, open 3 different flight detail pages to compare their baggage policies"
clear_db; tap 540 2303; sleep 2
find_and_tap "flight_origin_input"; sleep 0.3; type_text "SFO"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "search_button"; sleep 4; screenshot "before_${TC_ID}"
for y in 570 770 970; do
  tap 540 $y; sleep 3; screenshot "${TC_ID}_detail_$y"
  adb shell input keyevent KEYCODE_BACK; sleep 2
done
pull_db_cat
BP=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type='baggage_policy_view' AND result_count = 1;")
[ "$BP" -ge 3 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — $BP baggage views"
