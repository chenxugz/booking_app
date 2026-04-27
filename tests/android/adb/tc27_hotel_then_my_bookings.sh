#!/bin/bash
# TC27: Book hotel, then verify in My Bookings
# Dates: Check-in = 2024-04-01, Check-out = 2024-04-04
# DB Check: bookings has 1 hotel entry with ref matching BOOK-HOTEL
source ./tests/android/adb/common.sh
TC_ID="TC27"
PASS=0

echo "[TC27] Search hotels in San Francisco (check-in 2024-04-01, check-out 2024-04-04), book the first result (Tenderloin Budget Motel), select Standard Double room, choose Flexible Rate, with guest name Sarah Chen, email sarah.chen@email.com, phone 15550002727, then navigate to My Bookings to verify the booking appears"
clear_db

# Do a full hotel booking first
tap 180 2303; sleep 1
tap 540 668; sleep 0.5; type_text "San%sFrancisco"
adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
pick_date "checkin_date_picker" "2024-04-01"
pick_date "checkout_date_picker" "2024-04-04"
find_and_tap "search_button"; sleep 4
tap 540 570; sleep 3
adb shell input swipe 540 1800 540 400 400; sleep 0.5
find_and_tap "book_now_button" || { adb shell input swipe 540 1800 540 400 400; sleep 0.5; find_and_tap "book_now_button"; }; sleep 3
find_and_tap "guest_name_input"; sleep 0.3; type_text "Sarah%sChen"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_email_input"; sleep 0.3; type_text "sarah.chen@email.com"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_phone_input"; sleep 0.3; type_text "15550002727"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.5
find_and_tap "checkout_next_button"; sleep 3
tap 540 745; sleep 0.5
adb shell input swipe 540 1800 540 600 400; sleep 0.5
find_and_tap "checkout_next_button" || { adb shell input swipe 540 1800 540 600 400; sleep 0.5; find_and_tap "checkout_next_button"; }; sleep 3
find_and_tap "confirm_booking_button"; sleep 4

# Now tap View My Bookings
find_and_tap "view_my_bookings_button"; sleep 3
screenshot "after_${TC_ID}"

pull_db_cat
# Verify search was logged with correct params
SC=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type='hotel' AND query_params = '{\"city\":\"San Francisco\",\"checkIn\":\"2024-04-01\",\"checkOut\":\"2024-04-04\",\"guests\":1}' AND result_count = 24;")
RC=$(qdb "SELECT COUNT(*) FROM bookings WHERE booking_type='hotel' AND user_name='Sarah Chen' AND user_email='sarah.chen@email.com' AND user_phone='15550002727' AND room_type='Standard Double' AND extras LIKE '%cancellation_policy%flexible%' AND status='confirmed';")
REF=$(qdb "SELECT reference_number FROM bookings WHERE user_name='Sarah Chen' ORDER BY created_at DESC LIMIT 1;")
[ "$RC" = "1" ] && [ "$SC" -gt 0 ] && echo "$REF" | grep -q "BOOK-HOTEL" && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS (search=$SC) — ref=$REF, matches=$RC (expected 1 booking, Sarah Chen, confirmed)"
