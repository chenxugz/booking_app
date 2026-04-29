#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC36"
PASS=0

echo "[TC36] Search flights from SFO to JFK on 2024-04-01, find the flight with the lowest checked baggage fee (Delta DL 209, \$30/bag), book it in Economy class, add checked baggage at checkout, guest name Baggage Hunter, email baggage@fly.com, phone 15550003636"
clear_db
find_and_tap "tab_flights"; sleep 1
find_and_tap "flight_origin_input"; sleep 0.3; type_text "SFO"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "flight_destination_input"; sleep 0.3; type_text "JFK"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
pick_date "flight_departure_date" "2024-04-01"
find_and_tap "search_button"; sleep 4

# Find Delta DL 209 (flight_002) — it may not be first result (sorted by price_asc, Delta is $289)
# Scroll to find it
for attempt in 1 2 3 4 5; do
  find_and_tap "flight_card_flight_002" && break
  adb shell input swipe 540 1200 540 600 300; sleep 0.5
done
sleep 3

# Scroll to Book Now
adb shell input swipe 540 1800 540 400 400; sleep 0.5
find_and_tap "book_now_button" || { adb shell input swipe 540 1800 540 400 400; sleep 0.5; find_and_tap "book_now_button"; }; sleep 3

# Guest info
find_and_tap "guest_name_input"; sleep 0.3; type_text "Baggage%sHunter"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_email_input"; sleep 0.3; type_text "baggage@fly.com"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_phone_input"; sleep 0.3; type_text "15550003636"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.5
find_and_tap "checkout_next_button"; sleep 3

# Select Economy class
find_and_tap "seat_class_option_economy"; sleep 0.5
# Add checked baggage
adb shell input swipe 540 1800 540 600 400; sleep 0.5
find_and_tap "add_baggage_button" || { adb shell input swipe 540 1800 540 600 400; sleep 0.5; find_and_tap "add_baggage_button"; }; sleep 0.5
adb shell input swipe 540 1800 540 600 400; sleep 0.5
find_and_tap "checkout_next_button" || { adb shell input swipe 540 1800 540 600 400; sleep 0.5; find_and_tap "checkout_next_button"; }; sleep 3

# Confirm
find_and_tap "confirm_booking_button"; sleep 4
screenshot "after_${TC_ID}"

pull_db_cat
# Verify search was logged
SC=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type='flight' AND query_params = '{\"origin\":\"SFO\",\"destination\":\"JFK\",\"date\":\"2024-04-01\",\"returnDate\":\"\",\"passengers\":1,\"tripType\":\"one_way\"}' AND result_count = 4;")
# Verify booking: Delta DL 209 (flight_002), Economy, baggage added, Baggage Hunter
RC=$(qdb "SELECT COUNT(*) FROM bookings WHERE booking_type='flight' AND item_id='flight_002' AND user_name='Baggage Hunter' AND user_email='baggage@fly.com' AND user_phone='15550003636' AND seat_class='Economy' AND extras LIKE '%baggage%true%' AND status='confirmed';")
[ "$SC" -gt 0 ] && [ "$RC" -gt 0 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS (search=$SC) — booking=$RC (expected flight_002 Delta DL 209, Baggage Hunter, Economy, baggage, confirmed)"
