#!/bin/bash
# TC24: Gluten-free restaurant booking
# Dates: Date = 2024-04-01
source ./tests/android/adb/common.sh
TC_ID="TC24"
PASS=0

echo "[TC24] Search restaurants in San Francisco on 2024-04-01, book the first result (El Farolito), select the 18:00 time slot, with guest name GF User, email gf@test.com, phone 15550002424"
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
find_and_tap "time_slot_option_18_00"; sleep 0.5
find_and_tap "checkout_next_button"; sleep 3
find_and_tap "confirm_booking_button"; sleep 4

pull_db_cat
# Verify search was logged with correct params
SC=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type='restaurant' AND query_params = '{\"city\":\"San Francisco\",\"date\":\"2024-04-01\",\"time\":\"\",\"partySize\":2}' AND result_count = 30;")
# Verify booking with exact time slot, restaurant, and guest info
RC=$(qdb "SELECT COUNT(*) FROM bookings WHERE booking_type='restaurant' AND item_id='rest_004' AND item_name='El Farolito' AND user_name='GF User' AND user_email='gf@test.com' AND user_phone='15550002424' AND check_in='18:00' AND status='confirmed';")
[ "$RC" -gt 0 ] && [ "$SC" -gt 0 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS (search=$SC) — matches=$RC (expected El Farolito, GF User, 18:00, confirmed)"
