#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC35"
PASS=0

echo "[TC35] Navigate to My Bookings, filter by flights, find the delayed flight, and file a compensation claim for the 180-minute delay"
clear_db; tap 180 2303; sleep 1
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
  pull_db_cat
  CLAIM=$(qdb "SELECT claim_reference FROM compensation_claims ORDER BY submitted_at DESC LIMIT 1;")
  [ -n "$CLAIM" ] && PASS=1
fi
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — claim=$CLAIM"
