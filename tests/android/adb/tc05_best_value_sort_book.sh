#!/bin/bash
# TC05: Best Value sort and book top result
# Dates: Check-in = 2024-04-01, Check-out = 2024-04-04
source ./tests/android/adb/common.sh
TC_ID="TC05"
PASS=0

echo "[TC05] Search hotels in San Francisco (check-in 2024-04-01, check-out 2024-04-04, 2 guests), sort by Best Value, book the top result (Tenderloin Budget Motel, \$62/night), select Standard Double room, with guest name John Doe, email john@best.com, phone 15550001234"
clear_db
tap 180 2303; sleep 1
tap 540 668; sleep 0.5; type_text "San%sFrancisco"
adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
pick_date "checkin_date_picker" "2024-04-01"   # April 1, 2024
pick_date "checkout_date_picker" "2024-04-04" # April 4, 2024
tap 985 1334; sleep 0.3  # guests -> 2
find_and_tap "search_button"; sleep 4

# Sort by Best Value
find_and_tap "sort_button"; sleep 1
find_and_tap "sort_option_best_value"; sleep 2

# Book first result
tap 540 570; sleep 3
adb shell input swipe 540 1800 540 400 400; sleep 0.5
find_and_tap "book_now_button" || { adb shell input swipe 540 1800 540 400 400; sleep 0.5; find_and_tap "book_now_button"; }; sleep 3

# Checkout step 1: guest info
find_and_tap "guest_name_input"; sleep 0.3; type_text "John%sDoe"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_email_input"; sleep 0.3; type_text "john@best.com"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_phone_input"; sleep 0.3; type_text "15550001234"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.5
find_and_tap "checkout_next_button"; sleep 3

# Step 2: select first room
tap 540 745; sleep 0.5
find_and_tap "checkout_next_button"; sleep 3

# Step 3: confirm
find_and_tap "confirm_booking_button"; sleep 4
screenshot "after_${TC_ID}"

pull_db_cat
# Verify exact booking: Tenderloin Budget Motel (hotel_029), guest John Doe, $372 total, confirmed
RC=$(qdb "SELECT COUNT(*) FROM bookings WHERE booking_type='hotel' AND item_id='hotel_029' AND item_name='Tenderloin Budget Motel' AND user_name='John Doe' AND room_type='Standard Double' AND total_price=372.0 AND status='confirmed';")
[ "$RC" -gt 0 ] && PASS=1
REF=$(qdb "SELECT reference_number FROM bookings WHERE item_id='hotel_029' ORDER BY created_at DESC LIMIT 1;")
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — ref=$REF, matches=$RC (expected hotel_029, John Doe, \$372, confirmed)"
