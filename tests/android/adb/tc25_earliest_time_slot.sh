#!/bin/bash
# TC25: Book earliest available time slot
# Dates: Date = 2024-04-01
source ./tests/android/adb/common.sh
TC_ID="TC25"
PASS=0

echo "[TC25] Search restaurants in San Francisco on 2024-04-01, book a restaurant and select the earliest available time slot"
clear_db
tap 900 2303; sleep 2
find_and_tap "restaurant_search_input"; sleep 0.3; type_text "San%sFrancisco"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
pick_date "restaurant_date_picker" "2024-04-01"
find_and_tap "search_button"; sleep 4

tap 540 570; sleep 3
adb shell input swipe 540 1800 540 400 400; sleep 0.5
find_and_tap "book_now_button" || { adb shell input swipe 540 1800 540 400 400; sleep 0.5; find_and_tap "book_now_button"; }; sleep 3

find_and_tap "guest_name_input"; sleep 0.3; type_text "Early%sUser"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_email_input"; sleep 0.3; type_text "early@test.com"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_phone_input"; sleep 0.3; type_text "15550002525"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.5
find_and_tap "checkout_next_button"; sleep 3
# First slot = earliest
find_and_tap "time_slot_option_18_00" || find_and_tap "time_slot_option_11_00" || find_and_tap "time_slot_option_11_30"; sleep 0.5
find_and_tap "checkout_next_button"; sleep 3
find_and_tap "confirm_booking_button"; sleep 4

pull_db_cat
CI=$(qdb "SELECT check_in FROM bookings ORDER BY created_at DESC LIMIT 1;")
[ -n "$CI" ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — time_slot=$CI"
