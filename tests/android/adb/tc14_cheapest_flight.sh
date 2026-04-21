#!/bin/bash
# TC14: Sort by price ascending, book cheapest
# Dates: Departure = 2024-04-01
source ./tests/android/adb/common.sh
TC_ID="TC14"
PASS=0

echo "[TC14] Search flights SFO to JFK on 2024-04-01, sort by price ascending, book the cheapest flight (JetBlue B6 415, $199) in Economy class with guest name Cheap Flyer, email cheap@fly.com, phone 15550001414"
clear_db
tap 540 2303; sleep 2
find_and_tap "flight_origin_input"; sleep 0.3; type_text "SFO"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "flight_destination_input"; sleep 0.3; type_text "JFK"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
pick_date "flight_departure_date" "2024-04-01"
find_and_tap "search_button"; sleep 4

# Default sort is price_asc; book first result
tap 540 570; sleep 3
adb shell input swipe 540 1800 540 400 400; sleep 0.5
find_and_tap "book_now_button" || { adb shell input swipe 540 1800 540 400 400; sleep 0.5; find_and_tap "book_now_button"; }; sleep 3

find_and_tap "guest_name_input"; sleep 0.3; type_text "Cheap%sFlyer"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_email_input"; sleep 0.3; type_text "cheap@fly.com"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_phone_input"; sleep 0.3; type_text "15550001414"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.5
find_and_tap "checkout_next_button"; sleep 3
find_and_tap "seat_class_option_economy"; sleep 0.5
find_and_tap "checkout_next_button"; sleep 3
find_and_tap "confirm_booking_button"; sleep 4

pull_db_cat
RC=$(qdb "SELECT COUNT(*) FROM bookings WHERE booking_type='flight' AND item_id='flight_004' AND user_name='Cheap Flyer' AND user_email='cheap@fly.com' AND user_phone='15550001414' AND seat_class='Economy' AND status='confirmed';")
[ "$RC" -gt 0 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — matches=$RC (expected flight_004, Cheap Flyer, Economy, confirmed)"
