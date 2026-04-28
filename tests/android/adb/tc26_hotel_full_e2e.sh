#!/bin/bash
# TC26: Full hotel booking end-to-end
# Dates: Check-in = 2024-04-15, Check-out = 2024-04-18
source ./tests/android/adb/common.sh
TC_ID="TC26"
PASS=0

echo "[TC26] Complete a full hotel booking: search San Francisco (check-in 2024-04-15, check-out 2024-04-18, 2 guests), book the first result (Tenderloin Budget Motel), select Standard Double room, choose Flexible Rate, with guest name Alice E2E, email alice@e2e.com, phone 15550002626, and confirm"
clear_db
find_and_tap "tab_hotels"; sleep 1
tap 540 668; sleep 0.5; type_text "San%sFrancisco"
adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
pick_date "checkin_date_picker" "2024-04-15"   # April 15, 2024
pick_date "checkout_date_picker" "2024-04-18" # April 18, 2024
tap 985 1334; sleep 0.3  # guests -> 2
find_and_tap "search_button"; sleep 4

tap 540 570; sleep 3
adb shell input swipe 540 1800 540 400 400; sleep 0.5
find_and_tap "book_now_button" || { adb shell input swipe 540 1800 540 400 400; sleep 0.5; find_and_tap "book_now_button"; }; sleep 3

find_and_tap "guest_name_input"; sleep 0.3; type_text "Alice%sE2E"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_email_input"; sleep 0.3; type_text "alice@e2e.com"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_phone_input"; sleep 0.3; type_text "15550002626"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.5
find_and_tap "checkout_next_button"; sleep 3
tap 540 745; sleep 0.5
adb shell input swipe 540 1800 540 600 400; sleep 0.5
find_and_tap "checkout_next_button" || { adb shell input swipe 540 1800 540 600 400; sleep 0.5; find_and_tap "checkout_next_button"; }; sleep 3
find_and_tap "confirm_booking_button"; sleep 4
screenshot "after_${TC_ID}"

pull_db_cat
# Verify search was logged with correct params
SC=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type='hotel' AND query_params = '{\"city\":\"San Francisco\",\"checkIn\":\"2024-04-15\",\"checkOut\":\"2024-04-18\",\"guests\":2}' AND result_count = 24;")
RC=$(qdb "SELECT COUNT(*) FROM bookings WHERE booking_type='hotel' AND item_id='hotel_029' AND user_name='Alice E2E' AND user_email='alice@e2e.com' AND user_phone='15550002626' AND room_type='Standard Double' AND extras LIKE '%cancellation_policy%flexible%' AND guests=2 AND status='confirmed';")
REF=$(qdb "SELECT reference_number FROM bookings WHERE user_name='Alice E2E' ORDER BY created_at DESC LIMIT 1;")
[ "$RC" -gt 0 ] && [ "$SC" -gt 0 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS (search=$SC) — ref=$REF, matches=$RC (expected hotel_029, Alice E2E, guests=2, confirmed)"
