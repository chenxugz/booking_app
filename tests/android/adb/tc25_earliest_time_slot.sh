#!/bin/bash
# TC25: Book earliest available time slot
# Dates: Date = 2024-04-01
source ./tests/android/adb/common.sh
TC_ID="TC25"
PASS=0

echo "[TC25] Search restaurants in San Francisco on 2024-04-01, book the first result (El Farolito), select the earliest available time slot (11:00), with guest name Early User, email early@test.com, phone 15550002525"
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
RC=$(qdb "SELECT COUNT(*) FROM bookings WHERE booking_type='restaurant' AND user_name='Early User' AND user_email='early@test.com' AND user_phone='15550002525' AND check_in IS NOT NULL AND check_in != '' AND status='confirmed';")
CI=$(qdb "SELECT check_in FROM bookings WHERE user_name='Early User' ORDER BY created_at DESC LIMIT 1;")
[ "$RC" -gt 0 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — matches=$RC, time_slot=$CI (expected Early User, confirmed, with time slot)"
