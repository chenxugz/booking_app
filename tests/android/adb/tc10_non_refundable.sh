#!/bin/bash
# TC10: Choose non-refundable rate and verify discount
# Dates: Check-in = 2024-04-01, Check-out = 2024-04-04
source ./tests/android/adb/common.sh
TC_ID="TC10"
PASS=0

echo "[TC10] Search hotels in San Francisco (check-in 2024-04-01, check-out 2024-04-04), book the first result (Tenderloin Budget Motel, \$62/night), select Standard Double room, choose the Non-Refundable Rate (15% off) at checkout, with guest name NonRef User, email nonref@test.com, phone 15550001010"
clear_db
tap 180 2303; sleep 1
tap 540 668; sleep 0.5; type_text "San%sFrancisco"
adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
pick_date "checkin_date_picker" "2024-04-01"
pick_date "checkout_date_picker" "2024-04-04"
find_and_tap "search_button"; sleep 4

tap 540 570; sleep 3
adb shell input swipe 540 1800 540 400 400; sleep 0.5
find_and_tap "book_now_button" || { adb shell input swipe 540 1800 540 400 400; sleep 0.5; find_and_tap "book_now_button"; }; sleep 3

# Step 1: Guest info
find_and_tap "guest_name_input"; sleep 0.3; type_text "NonRef%sUser"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_email_input"; sleep 0.3; type_text "nonref@test.com"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_phone_input"; sleep 0.3; type_text "15550001010"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.5
find_and_tap "checkout_next_button"; sleep 3

# Step 2: Select room type
tap 540 745; sleep 0.5

# Select Non-Refundable Rate
adb shell input swipe 540 1800 540 600 400; sleep 0.5
find_and_tap "rate_option_non_refundable" || { adb shell input swipe 540 1800 540 600 400; sleep 0.5; find_and_tap "rate_option_non_refundable"; }
sleep 0.5

adb shell input swipe 540 1800 540 600 400; sleep 0.5
find_and_tap "checkout_next_button" || { adb shell input swipe 540 1800 540 600 400; sleep 0.5; find_and_tap "checkout_next_button"; }; sleep 3

# Step 3: Confirm
find_and_tap "confirm_booking_button"; sleep 4
screenshot "after_${TC_ID}"

pull_db_cat
# Verify search was logged with correct params
SC=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type='hotel' AND query_params = '{\"city\":\"San Francisco\",\"checkIn\":\"2024-04-01\",\"checkOut\":\"2024-04-04\",\"guests\":1}' AND result_count = 24;")
# Verify: hotel_029, NonRef User, non_refundable in extras, total = $158.10 (62 * 3 nights * 1 guest * 0.85)
RC=$(qdb "SELECT COUNT(*) FROM bookings WHERE booking_type='hotel' AND item_id='hotel_029' AND user_name='NonRef User' AND user_email='nonref@test.com' AND user_phone='15550001010' AND room_type='Standard Double' AND extras LIKE '%non_refundable%' AND total_price=158.1 AND status='confirmed';")
[ "$RC" -gt 0 ] && [ "$SC" -gt 0 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS (search=$SC) — matches=$RC (expected hotel_029, NonRef User, non_refundable rate, total=\$158.10)"
