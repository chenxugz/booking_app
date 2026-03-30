## TC05 — Best Value Sort and Book (iOS Manual)

**Device**: iPhone (iOS 14+)
**Steps**:
1. Launch app on iOS device or simulator
2. Tap Hotels tab (testID: `tab_hotels`)
3. Tap location field (testID: `hotel_search_input`), type "San Francisco"
4. Tap check-in date field (testID: `checkin_date_picker`), select a valid check-in date
5. Tap check-out date field (testID: `checkout_date_picker`), select a valid check-out date
6. Tap Search button (testID: `search_button`)
7. On Results screen, tap Sort button (testID: `sort_button`)
8. Select "Best Value" sort option
9. Note the first hotel card at the top of the list (testID: `hotel_card_{id}`)
10. Tap the top hotel card to open Detail screen
11. Tap Book Now button (testID: `book_now_button`)
12. Complete checkout: enter guest name (testID: `guest_name_input`), email (testID: `guest_email_input`), phone (testID: `guest_phone_input`)
13. Tap Next (testID: `checkout_next_button`) through each step
14. Tap Confirm Booking (testID: `confirm_booking_button`)
15. Observe Confirmation screen and note the reference number (testID: `reference_number`)

**Expected**: Results are sorted by best value (combination of price and rating). The booking completes successfully and a unique reference number in the format `BOOK-HOTEL-{date}-{XXXX}` is displayed.

**DB Check**: Use Xcode Devices window to download app container,
  then: `sqlite3 booking_benchmark.db "SELECT reference_number, item_name, total_price, status FROM bookings ORDER BY created_at DESC LIMIT 1;"`

Expected DB result: A confirmed booking row with `booking_type='hotel'` and a valid reference number.
