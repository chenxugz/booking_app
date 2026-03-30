## TC01 — Hotel Search by City (iOS Manual)

**Device**: iPhone (iOS 14+)
**Steps**:
1. Launch app on iOS device or simulator
2. Tap Hotels tab (testID: `tab_hotels`)
3. Tap location field (testID: `hotel_search_input`), type "San Francisco"
4. Tap check-in date field (testID: `checkin_date_picker`), select a date 3 nights from today
5. Tap check-out date field (testID: `checkout_date_picker`), confirm date is 3 nights after check-in
6. Tap guest count stepper (testID: `guest_count_stepper`), set to 2 guests
7. Tap Search button (testID: `search_button`)
8. Observe results list (testID: `results_list`)

**Expected**: Results screen displays hotel cards for hotels in San Francisco. Each card shows hotel name, price per night, star rating, and review score. Result count is greater than 0.

**DB Check**: Use Xcode Devices window to download app container,
  then: `sqlite3 booking_benchmark.db "SELECT search_type, query_params, result_count FROM search_log ORDER BY timestamp DESC LIMIT 1;"`

Expected DB result: A row with `search_type='hotel'`, `query_params` containing `city='San Francisco'` and `guests=2`, and `result_count > 0`.
