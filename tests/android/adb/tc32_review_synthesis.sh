#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC32"
PASS=0

echo "[TC32] Search hotels in San Francisco, open the first hotel, view its reviews, and search for the keyword construction noise"
clear_db; tap 180 2303; sleep 1
tap 540 668; sleep 0.5; type_text "San%sFrancisco"; adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
tap 540 1523; sleep 4; tap 540 570; sleep 3
swipe 540 1800 540 400 400; sleep 0.5
find_and_tap "view_reviews_button" || { swipe 540 1800 540 400 400; sleep 0.5; find_and_tap "view_reviews_button"; }; sleep 3
find_and_tap "review_search_input"; sleep 0.5; type_text "construction%snoise"
adb shell input keyevent KEYCODE_ESCAPE; sleep 0.3
find_and_tap "review_keyword_filter_button"; sleep 2; screenshot "after_${TC_ID}"
pull_db_cat
RESULT=$(qdb "SELECT keyword FROM review_searches ORDER BY searched_at DESC LIMIT 1;")
echo "$RESULT" | grep -q "construction noise" && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — keyword=$RESULT"
