#!/bin/bash
# TC08: Select King Suite room type (hotel_005)
# Dates: Check-in = today+1, Check-out = today+4
source ./tests/android/adb/common.sh
TC_ID="TC08"
PASS=0

echo "[TC08] Search hotels in San Francisco (check-in 2024-04-01, check-out 2024-04-04), find Union Square Premier, book it with King Suite room type, choose Flexible Rate, guest name Suite Guest, email suite@test.com, phone 15550008888"
clear_db
find_and_tap "tab_hotels"; sleep 1
tap 540 668; sleep 0.5; type_text "San%sFrancisco"
adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
pick_date "checkin_date_picker" "2024-04-01"
pick_date "checkout_date_picker" "2024-04-04"
find_and_tap "search_button"; sleep 4

# Sort by price desc to bring hotel_005 ($299) closer to top
find_and_tap "sort_button"; sleep 1
find_and_tap "sort_option_price_desc"; sleep 2

# Find hotel_005
adb shell input swipe 540 1200 540 600 300; sleep 0.5
find_and_tap "hotel_card_hotel_005" || { adb shell input swipe 540 1200 540 600 300; sleep 0.5; find_and_tap "hotel_card_hotel_005"; }; sleep 3

adb shell input swipe 540 1800 540 400 400; sleep 0.5
find_and_tap "book_now_button" || { adb shell input swipe 540 1800 540 400 400; sleep 0.5; find_and_tap "book_now_button"; }; sleep 3

find_and_tap "guest_name_input"; sleep 0.3; type_text "Suite%sGuest"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_email_input"; sleep 0.3; type_text "suite@test.com"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_phone_input"; sleep 0.3; type_text "15550008888"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.5
find_and_tap "checkout_next_button"; sleep 3

find_and_tap "room_type_option_king_suite" || { adb shell input swipe 540 1200 540 600 300; sleep 0.5; find_and_tap "room_type_option_king_suite"; }; sleep 0.5
adb shell input swipe 540 1800 540 600 400; sleep 0.5
find_and_tap "checkout_next_button" || { adb shell input swipe 540 1800 540 600 400; sleep 0.5; find_and_tap "checkout_next_button"; }; sleep 3
find_and_tap "confirm_booking_button"; sleep 4

pull_db_cat
# Verify search was logged with correct params
SC=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type='hotel' AND query_params = '{\"city\":\"San Francisco\",\"checkIn\":\"2024-04-01\",\"checkOut\":\"2024-04-04\",\"guests\":1}' AND result_count = 24;")
RC=$(qdb "SELECT COUNT(*) FROM bookings WHERE booking_type='hotel' AND item_id='hotel_005' AND item_name='Union Square Premier' AND user_name='Suite Guest' AND user_email='suite@test.com' AND user_phone='15550008888' AND room_type='King Suite' AND extras LIKE '%cancellation_policy%flexible%' AND status='confirmed';")
[ "$RC" -gt 0 ] && [ "$SC" -gt 0 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS (search=$SC) — matches=$RC (expected hotel_005, Suite Guest, King Suite, confirmed)"
