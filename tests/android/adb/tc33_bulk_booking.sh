#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC33"
PASS=0

echo "[TC33] Search hotels in San Francisco, open the first hotel, use Bulk Booking to reserve 10 rooms with different employee names and corporate card ending in 4242"
clear_db; tap 180 2303; sleep 1
tap 540 668; sleep 0.5; type_text "San%sFrancisco"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
tap 540 1523; sleep 4; tap 540 570; sleep 3
swipe 540 1800 540 400 400; sleep 0.5
find_and_tap "bulk_booking_button" || { swipe 540 1800 540 400 400; sleep 0.5; find_and_tap "bulk_booking_button"; }; sleep 3
for i in $(seq 1 9); do find_and_tap "add_another_room_button" || { swipe 540 1800 540 400 400; sleep 0.3; find_and_tap "add_another_room_button"; }; sleep 0.5; done
swipe 540 400 540 1800 400; sleep 0.5; swipe 540 400 540 1800 400; sleep 0.5
for i in $(seq 0 9); do
  find_and_tap "guest_name_input_$i" && { type_text "Employee%s$((i+1))"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3; } || { swipe 540 1800 540 600 400; sleep 0.5; find_and_tap "guest_name_input_$i" && { type_text "Employee%s$((i+1))"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3; }; }
done
swipe 540 1800 540 400 400; sleep 0.5
find_and_tap "corporate_card_input" || { swipe 540 1800 540 400 400; sleep 0.5; find_and_tap "corporate_card_input"; }
type_text "4242424242424242"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.5
swipe 540 1800 540 400 400; sleep 0.5
find_and_tap "confirm_all_rooms_button" || { swipe 540 1800 540 400 400; sleep 0.5; find_and_tap "confirm_all_rooms_button"; }; sleep 4
screenshot "after_${TC_ID}"
pull_db_cat
COUNT=$(qdb "SELECT COUNT(*) FROM bookings WHERE extras LIKE '%corporate_card%';")
[ "$COUNT" -ge 10 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — $COUNT corporate bookings"
