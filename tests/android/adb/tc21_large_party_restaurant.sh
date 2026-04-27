#!/bin/bash
# TC21: Party of 8
# Dates: Date = 2024-04-01
source ./tests/android/adb/common.sh
TC_ID="TC21"
PASS=0

echo "[TC21] Search restaurants in San Francisco on 2024-04-01 for a party of 8, book the first result (El Farolito), select the 18:00 time slot, with guest name Party Host, email party@test.com, phone 15550002121"
clear_db
tap 900 2303; sleep 2
find_and_tap "restaurant_search_input"; sleep 0.3; type_text "San%sFrancisco"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
pick_date "restaurant_date_picker" "2024-04-01"  # April 1, 2024
# Increment party size: default 2 -> 8 (tap +6 times at known coordinate)
for i in 1 2 3 4 5 6; do tap 985 1334; sleep 0.3; done
find_and_tap "search_button"; sleep 4

tap 540 570; sleep 3
adb shell input swipe 540 1800 540 400 400; sleep 0.5
find_and_tap "book_now_button" || { adb shell input swipe 540 1800 540 400 400; sleep 0.5; find_and_tap "book_now_button"; }; sleep 3

find_and_tap "guest_name_input"; sleep 0.3; type_text "Party%sHost"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_email_input"; sleep 0.3; type_text "party@test.com"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_phone_input"; sleep 0.3; type_text "15550002121"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.5
find_and_tap "checkout_next_button"; sleep 3
find_and_tap "time_slot_option_18_00" || find_and_tap "time_slot_option_18_30" || find_and_tap "time_slot_option_19_00"; sleep 0.5
find_and_tap "checkout_next_button"; sleep 3
find_and_tap "confirm_booking_button"; sleep 4

pull_db_cat
# Verify search was logged with correct params
SC=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type='restaurant' AND query_params = '{\"city\":\"San Francisco\",\"date\":\"2024-04-01\",\"time\":\"\",\"partySize\":8}' AND result_count = 27;")
RC=$(qdb "SELECT COUNT(*) FROM bookings WHERE booking_type='restaurant' AND user_name='Party Host' AND user_email='party@test.com' AND user_phone='15550002121' AND guests>=8 AND status='confirmed';")
[ "$RC" -gt 0 ] && [ "$SC" -gt 0 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS (search=$SC) — matches=$RC (expected Party Host, guests>=8, confirmed)"
