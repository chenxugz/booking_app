#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC31"
PASS=0

echo "[TC31] Navigate to My Bookings, download receipts for 3 bookings, then open the Expense Reports folder"
clear_db; tap 180 2303; sleep 1
find_and_tap "my_bookings_button"; sleep 3; screenshot "before_${TC_ID}"
for i in 1 2 3; do
  adb shell uiautomator dump /sdcard/ui.xml 2>/dev/null; adb pull /sdcard/ui.xml /tmp/ui.xml 2>/dev/null
  DL=$(grep -o 'resource-id="download_receipt_button_[^"]*"[^>]*bounds="\[[0-9,]*\]\[[0-9,]*\]"' /tmp/ui.xml | head -1)
  if [ -n "$DL" ]; then
    x1=$(echo "$DL" | sed 's/.*bounds="\[\([0-9]*\),.*/\1/'); y1=$(echo "$DL" | sed 's/.*bounds="\[[0-9]*,\([0-9]*\)\].*/\1/')
    x2=$(echo "$DL" | sed 's/.*\]\[\([0-9]*\),.*/\1/'); y2=$(echo "$DL" | sed 's/.*\]\[[0-9]*,\([0-9]*\)\]".*/\1/')
    tap $(( (x1 + x2) / 2 )) $(( (y1 + y2) / 2 )); sleep 1; tap 540 1400; sleep 0.5
  fi
  swipe 540 1200 540 800 300; sleep 0.5
done
find_and_tap "expense_folder_button"; sleep 2; screenshot "after_${TC_ID}"
pull_db_cat
COUNT=$(qdb "SELECT COUNT(*) FROM download_log;")
[ "$COUNT" -gt 0 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — $COUNT receipts downloaded"
