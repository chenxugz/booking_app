#!/bin/bash
# TC29: Submit checkout with empty fields -> validation errors
# Dates: N/A
# DB Check: booking count does NOT increase when submitting empty form
source ./tests/android/adb/common.sh
TC_ID="TC29"
PASS=0

echo "[TC29] Search hotels in San Francisco, select a hotel, go to checkout, and attempt to proceed without filling in name, email, or phone"
clear_db
tap 180 2303; sleep 1
tap 540 668; sleep 0.5; type_text "San%sFrancisco"
adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "search_button"; sleep 4

# Count bookings BEFORE
pull_db_cat
BEFORE=$(qdb "SELECT COUNT(*) FROM bookings;")

tap 540 570; sleep 3
adb shell input swipe 540 1800 540 400 400; sleep 0.5
find_and_tap "book_now_button" || { adb shell input swipe 540 1800 540 400 400; sleep 0.5; find_and_tap "book_now_button"; }; sleep 3

# Don't fill anything, just tap Next
find_and_tap "checkout_next_button"; sleep 2
screenshot "after_${TC_ID}"

# Count bookings AFTER — should be same (validation blocked submission)
pull_db_cat
AFTER=$(qdb "SELECT COUNT(*) FROM bookings;")

if [ "$AFTER" = "$BEFORE" ]; then
  PASS=1
fi
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — bookings_before=$BEFORE, bookings_after=$AFTER (validation blocked)"
