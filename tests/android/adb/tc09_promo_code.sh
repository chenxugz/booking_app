#!/bin/bash
# TC09: Apply promo code SAVE10
# Dates: Check-in = 2024-04-01, Check-out = 2024-04-04
source ./tests/android/adb/common.sh
TC_ID="TC09"
PASS=0

echo "[TC09] Book a hotel in San Francisco (check-in 2024-04-01, check-out 2024-04-04), apply promo code SAVE10 at checkout"
clear_db
tap 180 2303; sleep 1
tap 540 668; sleep 0.5; type_text "San%sFrancisco"
adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
pick_date "checkin_date_picker" "2024-04-01"
pick_date "checkout_date_picker" "2024-04-04"
find_and_tap "search_button"; sleep 4

tap 540 570; sleep 3
adb shell input swipe 540 1800 540 400 400; sleep 0.5
find_and_tap "book_now_button" || { adb shell input swipe 540 1800 540 400 400; sleep 0.5; find_and_tap "book_now_button"; }; sleep 3

find_and_tap "guest_name_input"; sleep 0.3; type_text "Promo%sUser"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_email_input"; sleep 0.3; type_text "promo@test.com"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_phone_input"; sleep 0.3; type_text "15550009999"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.5
find_and_tap "checkout_next_button"; sleep 3

tap 540 745; sleep 0.5  # first room type
adb shell input swipe 540 1800 540 600 400; sleep 0.5
find_and_tap "promo_code_input"; sleep 0.3
type_text "SAVE10"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "apply_promo_button"; sleep 1
find_and_tap "checkout_next_button"; sleep 3
find_and_tap "confirm_booking_button"; sleep 4

pull_db_cat
P=$(qdb "SELECT promo_code FROM bookings ORDER BY created_at DESC LIMIT 1;")
[ "$P" = "SAVE10" ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — promo=$P"
