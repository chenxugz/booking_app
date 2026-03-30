## TC07 — Large Group Booking (iOS Manual)

**Device**: iPhone (iOS 14+)
**Steps**:
1. Launch app on iOS device or simulator
2. Tap Hotels tab (testID: `tab_hotels`)
3. Tap location field (testID: `hotel_search_input`), type "San Francisco"
4. Tap check-in date field (testID: `checkin_date_picker`), select a valid check-in date
5. Tap check-out date field (testID: `checkout_date_picker`), select a valid check-out date
6. Tap guest count stepper (testID: `guest_count_stepper`), increase to 6 guests
7. Tap Search button (testID: `search_button`)
8. Observe results list (testID: `results_list`) — should show hotels that can accommodate 6 guests
9. Tap any hotel card to open Detail screen
10. Tap Book Now button (testID: `book_now_button`)
11. Complete checkout: enter guest name (testID: `guest_name_input`), email (testID: `guest_email_input`), phone (testID: `guest_phone_input`)
12. Tap Next (testID: `checkout_next_button`) through each step
13. Tap Confirm Booking (testID: `confirm_booking_button`)
14. Observe Confirmation screen for reference number (testID: `reference_number`)

**Expected**: The search accommodates a party of 6. The booking completes successfully and the confirmation screen shows a valid reference number.

**DB Check**: Use Xcode Devices window to download app container,
  then: `sqlite3 booking_benchmark.db "SELECT reference_number, item_name, guests, total_price FROM bookings ORDER BY created_at DESC LIMIT 1;"`

Expected DB result: A booking row with `guests=6` and `booking_type='hotel'`.
