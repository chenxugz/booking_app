#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC35"
PASS=0

echo "[TC35] Navigate to My Bookings, filter by flights, find the delayed flight (Delta DL 302), file a compensation claim with delay duration 180 minutes and description Flight was delayed due to mechanical issues at SFO"
clear_db
find_and_tap "tab_my_bookings"; sleep 3
find_and_tap "filter_flight"; sleep 1

# Scroll to find delayed flight with File Claim button
FOUND=0
for i in $(seq 1 12); do
  adb shell uiautomator dump /sdcard/ui.xml 2>/dev/null; adb pull /sdcard/ui.xml /tmp/ui.xml 2>/dev/null
  grep -q "file_compensation_claim_button" /tmp/ui.xml && FOUND=1 && break
  swipe 540 1200 540 600 300; sleep 0.5
done

if [ "$FOUND" = "1" ]; then
  find_and_tap "file_compensation_claim_button"; sleep 3

  # Enter delay duration (field is now empty, not pre-filled)
  find_and_tap "claim_delay_duration_input"; sleep 0.3
  type_text "180"
  adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3

  # Enter description
  find_and_tap "claim_description_input"; sleep 0.3
  type_text "Flight%swas%sdelayed%sdue%sto%smechanical%sissues%sat%sSFO"
  adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3

  # Submit
  find_and_tap "claim_submit_button"; sleep 3
  screenshot "after_${TC_ID}"

  pull_db_cat
  # Verify claim with exact delay, description, and booking reference
  RC=$(qdb "SELECT COUNT(*) FROM compensation_claims WHERE booking_reference='BOOK-FLIGHT-MOCK05' AND delay_minutes=180 AND description='Flight was delayed due to mechanical issues at SFO';")
  CLAIM=$(qdb "SELECT claim_reference FROM compensation_claims WHERE booking_reference='BOOK-FLIGHT-MOCK05' ORDER BY submitted_at DESC LIMIT 1;")
  [ "$RC" -gt 0 ] && PASS=1
fi

STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — claim=$CLAIM, matches=$RC (expected BOOK-FLIGHT-MOCK05, 180 min, description verified)"
