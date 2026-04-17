#!/bin/bash
# TC17: 2 passengers with vegetarian meal
# Dates: Departure = 2024-04-01
source ./tests/android/adb/common.sh
TC_ID="TC17"
PASS=0

echo "[TC17] Book a flight SFO to JFK on 2024-04-01 for 2 passengers, select vegetarian meal preference"
clear_db
tap 540 2303; sleep 2
find_and_tap "flight_origin_input"; sleep 0.3; type_text "SFO"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "flight_destination_input"; sleep 0.3; type_text "JFK"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
pick_date "flight_departure_date" "2024-04-01"
find_and_tap "passenger_count_increment"; sleep 0.3  # 1->2
find_and_tap "search_button"; sleep 4

tap 540 570; sleep 3
adb shell input swipe 540 1800 540 400 400; sleep 0.5
find_and_tap "book_now_button" || { adb shell input swipe 540 1800 540 400 400; sleep 0.5; find_and_tap "book_now_button"; }; sleep 3

find_and_tap "guest_name_input"; sleep 0.3; type_text "Duo%sFlyer"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_email_input"; sleep 0.3; type_text "duo@fly.com"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_phone_input"; sleep 0.3; type_text "15550001717"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.5
find_and_tap "checkout_next_button"; sleep 3
find_and_tap "seat_class_option_economy"; sleep 0.5
adb shell input swipe 540 1800 540 600 400; sleep 0.5
find_and_tap "meal_pref_vegetarian" || { adb shell input swipe 540 1800 540 600 400; sleep 0.5; find_and_tap "meal_pref_vegetarian"; }; sleep 0.5
find_and_tap "checkout_next_button"; sleep 3
find_and_tap "confirm_booking_button"; sleep 4

pull_db_cat
G=$(qdb "SELECT guests FROM bookings ORDER BY created_at DESC LIMIT 1;")
E=$(qdb "SELECT extras FROM bookings ORDER BY created_at DESC LIMIT 1;")
[ "$G" = "2" ] && echo "$E" | grep -q '"meal_preference":"vegetarian"' && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — guests=$G, extras=$E"
