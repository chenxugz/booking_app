#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC36"
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

echo "[$TC_ID] Baggage Policy Comparison"
launch_app; sleep 2; tap 540 2303; sleep 2
find_and_tap "flight_origin_input"; sleep 0.3; type_text "SFO"; adb shell input keyevent KEYCODE_BACK; sleep 0.3
find_and_tap "search_button"; sleep 4; screenshot "before_${TC_ID}"
for y in 570 770 970; do
  tap 540 $y; sleep 3; screenshot "${TC_ID}_detail_$y"
  adb shell input keyevent KEYCODE_BACK; sleep 2
done
adb shell "run-as $PACKAGE cat databases/booking_benchmark.db" > /tmp/bb.db 2>/dev/null
BP=$(sqlite3 /tmp/bb.db "SELECT COUNT(*) FROM search_log WHERE search_type='baggage_policy_view';" 2>/dev/null)
[ "$BP" -ge 3 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — $BP baggage views"
