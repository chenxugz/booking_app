#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC37"
PASS=0

echo "[TC37] Search restaurants in San Francisco on 2024-04-01, find a steakhouse that has oysters on the seasonal specials menu (Alexander's Steakhouse), book it at 18:00, guest name Oyster Fan, email oyster@food.com, phone 15550003737"
clear_db
find_and_tap "tab_restaurants"; sleep 1
find_and_tap "restaurant_search_input"; sleep 0.3; type_text "San%sFrancisco"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
pick_date "restaurant_date_picker" "2024-04-01"
find_and_tap "search_button"; sleep 4

# Find Alexander's Steakhouse (rest_012) — need to scroll
for attempt in 1 2 3 4 5 6 7 8 9 10; do
  find_and_tap "restaurant_card_rest_012" && break
  adb shell input swipe 540 1200 540 600 300; sleep 0.5
done
sleep 3

# Scroll to Book Now
adb shell input swipe 540 1800 540 400 400; sleep 0.5
find_and_tap "book_now_button" || { adb shell input swipe 540 1800 540 400 400; sleep 0.5; find_and_tap "book_now_button"; }; sleep 3

# Guest info
find_and_tap "guest_name_input"; sleep 0.3; type_text "Oyster%sFan"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_email_input"; sleep 0.3; type_text "oyster@food.com"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "guest_phone_input"; sleep 0.3; type_text "15550003737"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.5
find_and_tap "checkout_next_button"; sleep 3

# Select 18:00 time slot
find_and_tap "time_slot_option_18_00"; sleep 0.5
find_and_tap "checkout_next_button"; sleep 3

# Confirm
find_and_tap "confirm_booking_button"; sleep 4
screenshot "after_${TC_ID}"

pull_db_cat
# Verify search was logged
SC=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type='restaurant' AND query_params = '{\"city\":\"San Francisco\",\"date\":\"2024-04-01\",\"time\":\"\",\"partySize\":2}' AND result_count = 30;")
# Verify booking: Alexander's Steakhouse (rest_012), 18:00, Oyster Fan
RC=$(qdb "SELECT COUNT(*) FROM bookings WHERE booking_type='restaurant' AND item_id='rest_012' AND item_name='Alexander''s Steakhouse' AND user_name='Oyster Fan' AND user_email='oyster@food.com' AND user_phone='15550003737' AND check_in='18:00' AND status='confirmed';")
[ "$SC" -gt 0 ] && [ "$RC" -gt 0 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS (search=$SC) — booking=$RC (expected rest_012 Alexander's Steakhouse, Oyster Fan, 18:00, confirmed)"
