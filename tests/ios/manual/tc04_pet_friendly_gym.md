## TC04 — Pet Friendly + Gym Filter (iOS Manual)

**Device**: iPhone (iOS 14+)
**Steps**:
1. Launch app on iOS device or simulator
2. Tap Hotels tab (testID: `tab_hotels`)
3. Tap location field (testID: `hotel_search_input`), type "San Francisco"
4. Tap check-in date field (testID: `checkin_date_picker`), select a valid check-in date
5. Tap check-out date field (testID: `checkout_date_picker`), select a valid check-out date
6. Tap Search button (testID: `search_button`)
7. On Results screen, tap Filter button (testID: `filter_button`)
8. Enable the "Pet Friendly" amenity checkbox (testID: `filter_pet_friendly`)
9. Enable the "Gym" amenity checkbox (testID: `filter_gym`)
10. Set max distance to 5 miles from Union Square (testID: `filter_distance_slider`)
11. Confirm/apply the filter
12. Observe the updated results list (testID: `results_list`)

**Expected**: All hotel cards shown include both "Pet Friendly" and "Gym" amenities and are within 5 miles of Union Square. Hotels lacking either amenity or exceeding the distance threshold are not shown.

**DB Check**: Use Xcode Devices window to download app container,
  then: `sqlite3 booking_benchmark.db "SELECT search_type, query_params, result_count FROM search_log ORDER BY timestamp DESC LIMIT 1;"`

Expected DB result: A row with `search_type='hotel'` and `query_params` containing `amenities` including `pet_friendly` and `gym`, and `max_distance=5`.
