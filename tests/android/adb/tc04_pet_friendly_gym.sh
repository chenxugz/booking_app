#!/bin/bash
# TC04: Pet Friendly + Gym filter
# Dates: Check-in = 2024-04-01, Check-out = 2024-04-04, 2 guests
# DB Check: hotel search logged with correct params, then hotel_filter with pet_friendly+gym -> result_count = 10
source ./tests/android/adb/common.sh
TC_ID="TC04"
PASS=0

echo "[TC04] Search hotels in San Francisco (check-in 2024-04-01, check-out 2024-04-04, 2 guests), then filter by pet-friendly AND gym amenities"
clear_db

find_and_tap "tab_hotels"; sleep 1
tap 540 668; sleep 0.5; type_text "San%sFrancisco"
adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
pick_date "checkin_date_picker" "2024-04-01"
pick_date "checkout_date_picker" "2024-04-04"
tap 985 1334; sleep 0.3  # guests -> 2
find_and_tap "search_button"; sleep 4

find_and_tap "filter_button"; sleep 1
adb shell input swipe 540 1800 540 600 400; sleep 0.5
find_and_tap "filter_pet_friendly"; sleep 0.3
find_and_tap "filter_gym"; sleep 0.3
find_and_tap "filter_close_button"; sleep 2
screenshot "after_${TC_ID}"

pull_db_cat
# Verify the initial search was logged correctly
SC=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type='hotel' AND query_params = '{\"city\":\"San Francisco\",\"checkIn\":\"2024-04-01\",\"checkOut\":\"2024-04-04\",\"guests\":2}' AND result_count = 24;")
# Verify the filter was applied correctly
RC=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type LIKE '%_filter' AND query_params = '{\"amenities\":[\"pet_friendly\",\"gym\"]}' AND result_count = 10;")
[ "$SC" -gt 0 ] && [ "$RC" -gt 0 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — search_matches=$SC, filter_matches=$RC (expected search=24, filter=10)"
