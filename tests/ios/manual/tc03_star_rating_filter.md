## TC03 — Star Rating Filter (iOS Manual)

**Device**: iPhone (iOS 14+)
**Steps**:
1. Launch app on iOS device or simulator
2. Tap Hotels tab (testID: `tab_hotels`)
3. Tap location field (testID: `hotel_search_input`), type "San Francisco"
4. Tap check-in date field (testID: `checkin_date_picker`), select a valid check-in date
5. Tap check-out date field (testID: `checkout_date_picker`), select a valid check-out date
6. Tap Search button (testID: `search_button`)
7. On Results screen, tap Filter button (testID: `filter_button`)
8. Locate the star rating filter and select "4 stars and above" (testID: `filter_star_rating`)
9. Confirm/apply the filter
10. Observe the updated results list (testID: `results_list`)

**Expected**: All hotel cards shown in the results list display a star rating of 4 or 5. No hotels with 1, 2, or 3 star ratings appear in the list.

**DB Check**: Use Xcode Devices window to download app container,
  then: `sqlite3 booking_benchmark.db "SELECT search_type, query_params, result_count FROM search_log ORDER BY timestamp DESC LIMIT 1;"`

Expected DB result: A row with `search_type='hotel'` and `query_params` containing `min_stars=4`, with `result_count` matching only 4+ star hotels.
