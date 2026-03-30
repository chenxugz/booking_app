## TC06 — Multi-Amenity Filter (iOS Manual)

**Device**: iPhone (iOS 14+)
**Steps**:
1. Launch app on iOS device or simulator
2. Tap Hotels tab (testID: `tab_hotels`)
3. Tap location field (testID: `hotel_search_input`), type "San Francisco"
4. Tap check-in date field (testID: `checkin_date_picker`), select a valid check-in date
5. Tap check-out date field (testID: `checkout_date_picker`), select a valid check-out date
6. Tap Search button (testID: `search_button`)
7. On Results screen, tap Filter button (testID: `filter_button`)
8. Enable the "Pool" amenity checkbox (testID: `filter_pool`)
9. Enable the "Free Breakfast" amenity checkbox (testID: `filter_breakfast`)
10. Enable the "Free Parking" amenity checkbox (testID: `filter_free_parking`)
11. Confirm/apply the filter
12. Observe the updated results list (testID: `results_list`)

**Expected**: All hotel cards shown include all three amenities: pool, free breakfast, and free parking. Hotels missing any one of these amenities are excluded from results.

**DB Check**: Use Xcode Devices window to download app container,
  then: `sqlite3 booking_benchmark.db "SELECT search_type, query_params, result_count FROM search_log ORDER BY timestamp DESC LIMIT 1;"`

Expected DB result: A row with `search_type='hotel'` and `query_params` containing all three amenity filters (`pool`, `breakfast`, `free_parking`), with `result_count` reflecting only matching hotels.
