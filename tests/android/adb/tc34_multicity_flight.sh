#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC34"
PASS=0
find_and_tap() {
  adb shell uiautomator dump /sdcard/ui.xml 2>/dev/null
  adb pull /sdcard/ui.xml /tmp/ui.xml 2>/dev/null
  local line=$(grep -o "resource-id=\"$1\"[^>]*bounds=\"\[[0-9,]*\]\[[0-9,]*\]\"" /tmp/ui.xml | head -1)
  [ -z "$line" ] && return 1
  local x1=$(echo "$line" | sed 's/.*bounds="\[\([0-9]*\),.*/\1/')
  local y1=$(echo "$line" | sed 's/.*bounds="\[[0-9]*,\([0-9]*\)\].*/\1/')
  local x2=$(echo "$line" | sed 's/.*\]\[\([0-9]*\),.*/\1/')
  local y2=$(echo "$line" | sed 's/.*\]\[[0-9]*,\([0-9]*\)\]".*/\1/')
  tap $(( (x1 + x2) / 2 )) $(( (y1 + y2) / 2 ))
  sleep 0.7
  return 0
}

echo "[$TC_ID] Multi-City Flight"
launch_app; sleep 2; tap 540 2303; sleep 2
find_and_tap "trip_type_multi_city"; sleep 1
find_and_tap "multi_city_origin_1"; sleep 0.3; type_text "SFO"; adb shell input keyevent KEYCODE_BACK; sleep 0.3
find_and_tap "multi_city_destination_1"; sleep 0.3; type_text "JFK"; adb shell input keyevent KEYCODE_BACK; sleep 0.3
find_and_tap "multi_city_date_1"; sleep 0.3; type_text "2024-04-01"; adb shell input keyevent KEYCODE_BACK; sleep 0.3
find_and_tap "multi_city_destination_2"; sleep 0.3; type_text "LAX"; adb shell input keyevent KEYCODE_BACK; sleep 0.3
find_and_tap "multi_city_date_2"; sleep 0.3; type_text "2024-04-05"; adb shell input keyevent KEYCODE_BACK; sleep 0.3
swipe 540 1800 540 600 400; sleep 0.5; find_and_tap "search_button"; sleep 4
screenshot "after_${TC_ID}"
adb shell "run-as $PACKAGE cat databases/booking_benchmark.db" > /tmp/bb.db 2>/dev/null
MC=$(sqlite3 /tmp/bb.db "SELECT COUNT(*) FROM search_log WHERE search_type='flight' AND query_params LIKE '%multi_city%';" 2>/dev/null)
[ "$MC" -gt 0 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — $MC multi-city searches"
