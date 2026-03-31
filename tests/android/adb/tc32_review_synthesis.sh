#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC32"
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

echo "[$TC_ID] Review Synthesis — Keyword Search"
launch_app; sleep 2; tap 180 2303; sleep 1
tap 540 668; sleep 0.5; type_text "San%sFrancisco"; adb shell input keyevent KEYCODE_BACK; sleep 0.3
tap 540 1523; sleep 4; tap 540 570; sleep 3
swipe 540 1800 540 400 400; sleep 0.5
find_and_tap "view_reviews_button" || { swipe 540 1800 540 400 400; sleep 0.5; find_and_tap "view_reviews_button"; }; sleep 3
find_and_tap "review_search_input"; sleep 0.5; type_text "construction%snoise"
adb shell input keyevent KEYCODE_BACK; sleep 0.3
find_and_tap "review_keyword_filter_button"; sleep 2; screenshot "after_${TC_ID}"
adb shell "run-as $PACKAGE cat databases/booking_benchmark.db" > /tmp/bb.db 2>/dev/null
RESULT=$(sqlite3 /tmp/bb.db "SELECT keyword FROM review_searches ORDER BY searched_at DESC LIMIT 1;" 2>/dev/null)
echo "$RESULT" | grep -q "construction noise" && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — keyword=$RESULT"
