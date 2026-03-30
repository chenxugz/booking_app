#!/bin/bash
source ./tests/android/adb/common.sh
TC_ID="TC26"
PASS=0

echo "[$TC_ID] Complete full hotel booking end-to-end, verify reference number in DB"

launch_app
screenshot "before_${TC_ID}"

# Tap Hotels tab
tap 180 2200
sleep 1

# Enter city
tap 540 420
sleep 1
type_text "San%20Francisco"
sleep 1

# Set check-in date
tap 270 560
sleep 1
tap 540 900
sleep 1

# Set check-out date
tap 810 560
sleep 1
tap 720 900
sleep 1

# Set guests to 2
tap 650 700
sleep 1

# Tap Search
tap 540 950
sleep 3

screenshot "mid_${TC_ID}_results"

# Tap first hotel card
tap 540 600
sleep 2

screenshot "mid_${TC_ID}_detail"

# Tap Book Now
tap 540 2050
sleep 2

screenshot "mid_${TC_ID}_checkout_step1"

# Step 1: Guest info
tap 540 400
sleep 1
type_text "Kevin%20Hart"
sleep 1
tap 540 520
sleep 1
type_text "kevin@example.com"
sleep 1
tap 540 640
sleep 1
type_text "5551357924"
sleep 1

# Next
tap 540 2050
sleep 2

screenshot "mid_${TC_ID}_checkout_step2"

# Step 2: Select Standard King room type
tap 540 450
sleep 1

# Next
tap 540 2050
sleep 2

screenshot "mid_${TC_ID}_checkout_step3"

# Step 3: Confirm
tap 540 2050
sleep 3

screenshot "after_${TC_ID}"

pull_db

# Verify a reference number in expected format exists
REF=$(sqlite3 $DB_LOCAL \
  "SELECT reference_number FROM bookings WHERE booking_type='hotel' ORDER BY created_at DESC LIMIT 1;" 2>/dev/null)
echo "[$TC_ID] Reference number: $REF"

if [[ "$REF" =~ ^BOOK-HOTEL-[0-9]{8}-[A-Z0-9]{4}$ ]]; then
  PASS=1
fi

STATUS="FAIL"
[ $PASS -eq 1 ] && STATUS="PASS"
log_result "$TC_ID" "$STATUS"
