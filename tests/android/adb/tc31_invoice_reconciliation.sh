#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC31"
PASS=0

# Helper to dismiss an alert by tapping its OK button
# OK button is at bounds [810,1328][978,1470] -> center (894, 1399)
dismiss_alert() {
  sleep 1
  tap 894 1399
  sleep 1
}

echo "[TC31] Navigate to My Bookings, scroll down to find and download receipts for Hilton Downtown (BOOK-HOTEL-MOCK04), Marina Bay Inn (BOOK-HOTEL-MOCK07), and Airport Lodge (BOOK-HOTEL-MOCK10), then scroll back up and open the Expense Reports folder to view downloaded receipts"
clear_db; tap 180 2303; sleep 1
find_and_tap "my_bookings_button"; sleep 3
screenshot "before_${TC_ID}"

# Download BOOK-HOTEL-MOCK04 (Hilton Downtown) — need to scroll down
for attempt in 1 2 3 4 5 6 7 8; do
  find_and_tap "download_receipt_button_BOOK-HOTEL-MOCK04" && break
  swipe 540 1500 540 600 400; sleep 0.5
done
dismiss_alert

# Download BOOK-HOTEL-MOCK07 (Marina Bay Inn) — scroll further
for attempt in 1 2 3 4 5 6 7 8; do
  find_and_tap "download_receipt_button_BOOK-HOTEL-MOCK07" && break
  swipe 540 1500 540 600 400; sleep 0.5
done
dismiss_alert

# Download BOOK-HOTEL-MOCK10 (Airport Lodge) — scroll further
for attempt in 1 2 3 4 5 6 7 8; do
  find_and_tap "download_receipt_button_BOOK-HOTEL-MOCK10" && break
  swipe 540 1500 540 600 400; sleep 0.5
done
dismiss_alert

# Scroll back to top to find Expense Reports button
for i in 1 2 3 4 5; do swipe 540 600 540 1800 400; sleep 0.3; done

# Open Expense Reports folder
for attempt in 1 2 3; do
  find_and_tap "expense_folder_button" && break
  swipe 540 600 540 1800 400; sleep 0.5
done
sleep 3
screenshot "after_${TC_ID}"

pull_db_cat

# Verify exactly 3 receipts downloaded with correct reference numbers
R1=$(qdb "SELECT COUNT(*) FROM download_log WHERE reference_number='BOOK-HOTEL-MOCK04';")
R2=$(qdb "SELECT COUNT(*) FROM download_log WHERE reference_number='BOOK-HOTEL-MOCK07';")
R3=$(qdb "SELECT COUNT(*) FROM download_log WHERE reference_number='BOOK-HOTEL-MOCK10';")
TOTAL=$(qdb "SELECT COUNT(*) FROM download_log;")

# Verify user opened the Expense Reports folder and saw 3 receipts
FOLDER=$(qdb "SELECT COUNT(*) FROM search_log WHERE search_type='expense_folder_view' AND result_count = 3;")

[ "$R1" = "1" ] && [ "$R2" = "1" ] && [ "$R3" = "1" ] && [ "$TOTAL" = "3" ] && [ "$FOLDER" -gt 0 ] && PASS=1
STATUS="FAIL"; [ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS — MOCK04=$R1, MOCK07=$R2, MOCK10=$R3, total=$TOTAL, folder_opened=$FOLDER (expected 3 receipts, folder viewed with 3)"
