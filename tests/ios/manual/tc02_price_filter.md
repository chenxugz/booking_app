## TC02 — Price Filter (iOS Manual)

**Device**: iPhone (iOS 14+)
**Steps**:
1. Launch app on iOS device or simulator
2. Tap Hotels tab (testID: `tab_hotels`)
3. Tap location field (testID: `hotel_search_input`), type "San Francisco"
4. Tap check-in date field (testID: `checkin_date_picker`), select a valid check-in date
5. Tap check-out date field (testID: `checkout_date_picker`), select a valid check-out date
6. Tap Search button (testID: `search_button`)
7. On Results screen, tap Filter button (testID: `filter_button`)
8. Locate the price range filter and set maximum price to $150/night (testID: `price_range_slider`)
9. Confirm/apply the filter
10. Observe the updated results list (testID: `results_list`)

**Expected**: All hotel cards shown in the results list display a price per night of $150 or less. Any hotels priced above $150/night are no longer visible.

**DB Check**: Use Xcode Devices window to download app container,
  then: `sqlite3 booking_benchmark.db "SELECT search_type, query_params, result_count FROM search_log ORDER BY timestamp DESC LIMIT 1;"`

Expected DB result: A row with `search_type='hotel'` and `query_params` containing `max_price=150`, with `result_count` matching the number of hotels priced at or below $150.
