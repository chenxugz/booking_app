#!/bin/bash
# TC24: Gluten-free restaurant booking
# Dates: Date = 2024-04-01
source ./tests/android/adb/common.sh
TC_ID="TC24"
PASS=0

echo "[TC24] Search restaurants in San Francisco on 2024-04-01, book the first result (El Farolito), select a time slot, with guest name GF User, email gf@test.com, phone 15550002424"
clear_db
tap 900 2303; sleep 2
find_and_tap "restaurant_search_input"; sleep 0.3; type_text "San%sFrancisco"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
pick_date "restaurant_date_picker" "2024-04-01"
find_and_tap "search_button"; sleep 4

tap 540 570; sleep 3
adb shell input swipe 540 1800 540 400 400; sleep 0.5
find_and_tap "book_now_button" || { adb shell input swipe 540 1800 540 400 400; sleep 0.5; find_and_tap "book_now_button"; }; sleep 3

find_and_tap "guest_name_input"; sleep 0.3; type_text "GF%sUser"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_email_input"; sleep 0.3; type_text "gf@test.com"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_phone_input"; sleep 0.3; type_text "15550002424"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.5
find_and_tap "checkout_next_button"; sleep 3
find_and_tap "time_slot_option_18_00" || find_and_tap "time_slot_option_18_30" || find_and_tap "time_slot_option_19_00"; sleep 0.5
find_and_tap "checkout_next_button"; sleep 3
find_and_tap "confirm_booking_button"; sleep 4

pull_db_cat
RC=$(qdb "SELECT COUNT(*) FROM bookings WHERE booking_type='restaurant' AND user_name='GF User' AND status='confirmed';")
[ "$RC" -gt 0 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — matches=$RC (expected GF User, restaurant, confirmed)"
