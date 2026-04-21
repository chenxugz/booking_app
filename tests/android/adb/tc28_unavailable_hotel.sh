#!/bin/bash
# TC28: Attempt to book unavailable hotel (hotel_028)
# Dates: N/A
# DB Check: booking count does NOT increase after booking attempt
source ./tests/android/adb/common.sh
TC_ID="TC28"
PASS=0

echo "[TC28] Search hotels in San Francisco (check-in 2024-04-01, check-out 2024-04-04), find Presidio Heights Inn (which is unavailable), and attempt to book it"
clear_db
tap 180 2303; sleep 1
tap 540 668; sleep 0.5; type_text "San%sFrancisco"
adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
pick_date "checkin_date_picker" "2024-04-01"
pick_date "checkout_date_picker" "2024-04-04"
find_and_tap "search_button"; sleep 4

# Count bookings BEFORE attempt
pull_db_cat
BEFORE=$(qdb "SELECT COUNT(*) FROM bookings;")

# Scroll to find hotel_028
for i in $(seq 1 12); do
  find_and_tap "hotel_card_hotel_028" && break
  adb shell input swipe 540 1200 540 400 400; sleep 0.5
done
sleep 3
adb shell input swipe 540 1800 540 400 400; sleep 0.5
find_and_tap "book_now_button" || { adb shell input swipe 540 1800 540 400 400; sleep 0.5; find_and_tap "book_now_button"; }; sleep 2
screenshot "after_${TC_ID}"
# Dismiss alert
tap 540 1400; sleep 0.5

# Count bookings AFTER attempt
pull_db_cat
AFTER=$(qdb "SELECT COUNT(*) FROM bookings;")

if [ "$AFTER" = "$BEFORE" ]; then
  PASS=1
fi
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — bookings_before=$BEFORE, bookings_after=$AFTER (no new booking)"
