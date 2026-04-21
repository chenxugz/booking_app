#!/bin/bash
# TC15: Add checked baggage
# Dates: Departure = 2024-04-01
source ./tests/android/adb/common.sh
TC_ID="TC15"
PASS=0

echo "[TC15] Search flights SFO to JFK on 2024-04-01, book the first result (JetBlue B6 415) in Economy class with checked baggage, guest name Bag User, email bag@fly.com, phone 15550001515"
clear_db
tap 540 2303; sleep 2
find_and_tap "flight_origin_input"; sleep 0.3; type_text "SFO"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "flight_destination_input"; sleep 0.3; type_text "JFK"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
pick_date "flight_departure_date" "2024-04-01"
find_and_tap "search_button"; sleep 4

tap 540 570; sleep 3
adb shell input swipe 540 1800 540 400 400; sleep 0.5
find_and_tap "book_now_button" || { adb shell input swipe 540 1800 540 400 400; sleep 0.5; find_and_tap "book_now_button"; }; sleep 3

find_and_tap "guest_name_input"; sleep 0.3; type_text "Bag%sUser"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_email_input"; sleep 0.3; type_text "bag@fly.com"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_phone_input"; sleep 0.3; type_text "15550001515"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.5
find_and_tap "checkout_next_button"; sleep 3
find_and_tap "seat_class_option_economy"; sleep 0.5
adb shell input swipe 540 1800 540 600 400; sleep 0.5
find_and_tap "add_baggage_button" || { adb shell input swipe 540 1800 540 600 400; sleep 0.5; find_and_tap "add_baggage_button"; }; sleep 0.5
find_and_tap "checkout_next_button"; sleep 3
find_and_tap "confirm_booking_button"; sleep 4

pull_db_cat
RC=$(qdb "SELECT COUNT(*) FROM bookings WHERE booking_type='flight' AND item_id='flight_004' AND user_name='Bag User' AND extras LIKE '%baggage%true%' AND status='confirmed';")
[ "$RC" -gt 0 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — matches=$RC (expected flight_004, Bag User, baggage=true, confirmed)"
