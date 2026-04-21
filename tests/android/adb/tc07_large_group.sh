#!/bin/bash
# TC07: Book for 6 guests
# Dates: Check-in = 2024-04-01, Check-out = 2024-04-04
source ./tests/android/adb/common.sh
TC_ID="TC07"
PASS=0

echo "[TC07] Search hotels in San Francisco (check-in 2024-04-01, check-out 2024-04-04, 6 guests), book the first result (Tenderloin Budget Motel), select Standard Double room, with guest name Group Leader, email group@test.com, phone 15550006666"
clear_db
tap 180 2303; sleep 1
tap 540 668; sleep 0.5; type_text "San%sFrancisco"
adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
pick_date "checkin_date_picker" "2024-04-01"
pick_date "checkout_date_picker" "2024-04-04"
for i in 1 2 3 4 5; do tap 985 1334; sleep 0.3; done  # guests 1->6
find_and_tap "search_button"; sleep 4

tap 540 570; sleep 3
adb shell input swipe 540 1800 540 400 400; sleep 0.5
find_and_tap "book_now_button" || { adb shell input swipe 540 1800 540 400 400; sleep 0.5; find_and_tap "book_now_button"; }; sleep 3

find_and_tap "guest_name_input"; sleep 0.3; type_text "Group%sLeader"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_email_input"; sleep 0.3; type_text "group@test.com"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_phone_input"; sleep 0.3; type_text "15550006666"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.5
find_and_tap "checkout_next_button"; sleep 3
tap 540 745; sleep 0.5
find_and_tap "checkout_next_button"; sleep 3
find_and_tap "confirm_booking_button"; sleep 4

pull_db_cat
RC=$(qdb "SELECT COUNT(*) FROM bookings WHERE booking_type='hotel' AND item_id='hotel_029' AND user_name='Group Leader' AND room_type='Standard Double' AND guests=6 AND status='confirmed';")
[ "$RC" -gt 0 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — matches=$RC (expected hotel_029, Group Leader, guests=6, confirmed)"
