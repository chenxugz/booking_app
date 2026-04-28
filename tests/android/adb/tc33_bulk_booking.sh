#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC33"
PASS=0

echo "[TC33] Search hotels in San Francisco (check-in 2024-04-01, check-out 2024-04-04), open the first hotel (Tenderloin Budget Motel), use Bulk Booking to reserve 10 rooms: Alice Smith (Standard Double), Bob Johnson (Single Room), Carol Williams (Standard Double), David Brown (Single Room), Eva Davis (Standard Double), Frank Miller (Single Room), Grace Wilson (Standard Double), Henry Moore (Single Room), Iris Taylor (Standard Double), Jack Anderson (Single Room), using corporate card 4242424242424242"
clear_db; find_and_tap "tab_hotels"; sleep 1
tap 540 668; sleep 0.5; type_text "San%sFrancisco"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
pick_date "checkin_date_picker" "2024-04-01"
pick_date "checkout_date_picker" "2024-04-04"
find_and_tap "search_button"; sleep 4; tap 540 570; sleep 3
swipe 540 1800 540 400 400; sleep 0.5
find_and_tap "bulk_booking_button" || { swipe 540 1800 540 400 400; sleep 0.5; find_and_tap "bulk_booking_button"; }; sleep 3

# Add 9 more rooms (1 already exists)
for i in $(seq 1 9); do find_and_tap "add_another_room_button" || { swipe 540 1800 540 400 400; sleep 0.3; find_and_tap "add_another_room_button"; }; sleep 0.5; done

# Guest names and room types for 10 rooms (alternating Standard Double / Single Room)
NAMES=("Alice%sSmith" "Bob%sJohnson" "Carol%sWilliams" "David%sBrown" "Eva%sDavis" "Frank%sMiller" "Grace%sWilson" "Henry%sMoore" "Iris%sTaylor" "Jack%sAnderson")
# Even indices (0,2,4,6,8) = Standard Double (default, no tap needed)
# Odd indices (1,3,5,7,9) = Single Room (need to tap room_type_selector_{i}_single_room)

# Scroll to top
swipe 540 400 540 1800 400; sleep 0.5; swipe 540 400 540 1800 400; sleep 0.5; swipe 540 400 540 1800 400; sleep 0.5

# Fill each guest name and select room type
for i in $(seq 0 9); do
  # Fill guest name
  find_and_tap "guest_name_input_$i" && { type_text "${NAMES[$i]}"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3; } || { swipe 540 1800 540 600 400; sleep 0.5; find_and_tap "guest_name_input_$i" && { type_text "${NAMES[$i]}"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3; }; }
  # Select Single Room for odd-indexed rooms
  if [ $((i % 2)) -eq 1 ]; then
    find_and_tap "room_type_selector_${i}_single_room" || { swipe 540 1800 540 600 400; sleep 0.3; find_and_tap "room_type_selector_${i}_single_room"; }
    sleep 0.3
  fi
done

# Fill corporate card
swipe 540 1800 540 400 400; sleep 0.5
find_and_tap "corporate_card_input" || { swipe 540 1800 540 400 400; sleep 0.5; find_and_tap "corporate_card_input"; }
type_text "4242424242424242"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.5

# Confirm all rooms
swipe 540 1800 540 400 400; sleep 0.5
find_and_tap "confirm_all_rooms_button" || { swipe 540 1800 540 400 400; sleep 0.5; find_and_tap "confirm_all_rooms_button"; }; sleep 4
screenshot "after_${TC_ID}"

pull_db_cat

# Verify all 10 bookings with exact guest names, room types, and corporate card
PASS=1
DETAILS=""

# Standard Double rooms (even indices)
for name in "Alice Smith" "Carol Williams" "Eva Davis" "Grace Wilson" "Iris Taylor"; do
  RC=$(qdb "SELECT COUNT(*) FROM bookings WHERE item_id='hotel_029' AND user_name='$name' AND room_type='Standard Double' AND extras LIKE '%4242424242424242%' AND status='confirmed';")
  if [ "$RC" != "1" ]; then
    PASS=0
    DETAILS="$DETAILS MISSING:$name/Standard_Double"
  fi
done

# Single Room rooms (odd indices)
for name in "Bob Johnson" "David Brown" "Frank Miller" "Henry Moore" "Jack Anderson"; do
  RC=$(qdb "SELECT COUNT(*) FROM bookings WHERE item_id='hotel_029' AND user_name='$name' AND room_type='Single Room' AND extras LIKE '%4242424242424242%' AND status='confirmed';")
  if [ "$RC" != "1" ]; then
    PASS=0
    DETAILS="$DETAILS MISSING:$name/Single_Room"
  fi
done

TOTAL=$(qdb "SELECT COUNT(*) FROM bookings WHERE extras LIKE '%4242424242424242%';")
[ "$TOTAL" != "10" ] && PASS=0
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — total=$TOTAL bookings with card 4242424242424242, 5 Standard Double + 5 Single Room$DETAILS"
