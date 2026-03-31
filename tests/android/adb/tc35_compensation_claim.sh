#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC35"
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

echo "[$TC_ID] Delayed Flight Compensation Claim"
launch_app; sleep 2; tap 180 2303; sleep 1
find_and_tap "my_bookings_button"; sleep 3
find_and_tap "filter_flight"; sleep 1
FOUND=0
for i in $(seq 1 12); do
  adb shell uiautomator dump /sdcard/ui.xml 2>/dev/null; adb pull /sdcard/ui.xml /tmp/ui.xml 2>/dev/null
  grep -q "file_compensation_claim_button" /tmp/ui.xml && FOUND=1 && break
  swipe 540 1200 540 600 300; sleep 0.5
done
if [ "$FOUND" = "1" ]; then
  find_and_tap "file_compensation_claim_button"; sleep 3
  find_and_tap "claim_submit_button"; sleep 3; screenshot "after_${TC_ID}"
  adb shell "run-as $PACKAGE cat databases/booking_benchmark.db" > /tmp/bb.db 2>/dev/null
  CLAIM=$(sqlite3 /tmp/bb.db "SELECT claim_reference FROM compensation_claims ORDER BY submitted_at DESC LIMIT 1;" 2>/dev/null)
  [ -n "$CLAIM" ] && PASS=1
fi
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — claim=$CLAIM"
