#!/bin/bash
# TC16: Window seat preference
# Dates: Departure = 2024-04-01
source ./tests/android/adb/common.sh
TC_ID="TC16"
PASS=0

echo "[TC16] Search flights SFO to JFK on 2024-04-01, book the first result (JetBlue B6 415) in Economy class with window seat preference, guest name Window User, email win@fly.com, phone 15550001616"
clear_db
find_and_tap "tab_flights"; sleep 1
find_and_tap "flight_origin_input"; sleep 0.3; type_text "SFO"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "flight_destination_input"; sleep 0.3; type_text "JFK"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
pick_date "flight_departure_date" "2024-04-01"
find_and_tap "search_button"; sleep 4

tap 540 570; sleep 3
adb shell input swipe 540 1800 540 400 400; sleep 0.5
find_and_tap "book_now_button" || { adb shell input swipe 540 1800 540 400 400; sleep 0.5; find_and_tap "book_now_button"; }; sleep 3

find_and_tap "guest_name_input"; sleep 0.3; type_text "Window%sUser"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_email_input"; sleep 0.3; type_text "win@fly.com"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_phone_input"; sleep 0.3; type_text "15550001616"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.5
find_and_tap "checkout_next_button"; sleep 3
find_and_tap "seat_class_option_economy"; sleep 0.5
find_and_tap "seat_pref_window" || { adb shell input swipe 540 1200 540 600 300; sleep 0.5; find_and_tap "seat_pref_window"; }; sleep 0.5
find_and_tap "checkout_next_button"; sleep 3
find_and_tap "confirm_booking_button"; sleep 4

pull_db_cat
# Verify search was logged with correct params
SC=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type='flight' AND query_params = '{\"origin\":\"SFO\",\"destination\":\"JFK\",\"date\":\"2024-04-01\",\"returnDate\":\"\",\"passengers\":1,\"tripType\":\"one_way\"}' AND result_count = 4;")
RC=$(qdb "SELECT COUNT(*) FROM bookings WHERE booking_type='flight' AND item_id='flight_004' AND user_name='Window User' AND user_email='win@fly.com' AND user_phone='15550001616' AND seat_class='Economy' AND extras LIKE '%seat_preference%window%' AND status='confirmed';")
[ "$RC" -gt 0 ] && [ "$SC" -gt 0 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS (search=$SC) — matches=$RC (expected flight_004, Window User, seat=window, confirmed)"
