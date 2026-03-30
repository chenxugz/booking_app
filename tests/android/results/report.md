# Booking Benchmark — Android ADB Test Report

Generated: (run `run_all_tests.sh` to populate results)

---

## TC01 — Hotel Search by City

**Platform**: Android
**Status**: PENDING
**Steps**:
1. Launch app
2. Tap Hotels tab (testID: tab_hotels)
3. Enter "San Francisco" in location input (testID: hotel_search_input)
4. Set check-in date (testID: checkin_date_picker)
5. Set check-out date (testID: checkout_date_picker)
6. Set guests to 2 (testID: guest_count_stepper)
7. Tap Search (testID: search_button)

**DB Verification**:
Query: `SELECT COUNT(*) FROM search_log WHERE search_type='hotel';`
Expected: COUNT > 0

**Screenshots**: before_TC01.png → after_TC01.png

---

## TC02 — Price Filter Max $150

**Platform**: Android
**Status**: PENDING
**Steps**:
1. Launch app, go to Hotels tab
2. Search San Francisco hotels
3. Tap Filter (testID: filter_button)
4. Drag price range slider max to $150 (testID: price_range_slider)
5. Apply filter

**DB Verification**:
Query: `SELECT COUNT(*) FROM search_log WHERE search_type='hotel';`
Expected: COUNT > 0 (filter is UI-only; results show only hotels <= $150)

**Screenshots**: before_TC02.png → after_TC02.png

---

## TC03 — Star Rating Filter (4-star and above)

**Platform**: Android
**Status**: PENDING
**Steps**:
1. Launch app, go to Hotels tab
2. Search San Francisco hotels
3. Tap Filter (testID: filter_button)
4. Select 4-star rating chip (testID: filter_star_4)
5. Apply filter

**DB Verification**:
Query: `SELECT COUNT(*) FROM search_log WHERE search_type='hotel';`
Expected: COUNT > 0; all visible cards show >= 4 stars

**Screenshots**: before_TC03.png → after_TC03.png

---

## TC04 — Pet Friendly + Gym Filter

**Platform**: Android
**Status**: PENDING
**Steps**:
1. Launch app, go to Hotels tab
2. Search San Francisco hotels
3. Tap Filter
4. Toggle pet_friendly ON (testID: filter_pet_friendly)
5. Toggle gym ON (testID: filter_gym)
6. Set distance <= 5 miles
7. Apply filter

**DB Verification**:
Query: `SELECT COUNT(*) FROM search_log WHERE search_type='hotel';`
Expected: COUNT > 0

**Screenshots**: before_TC04.png → after_TC04.png

---

## TC05 — Sort Best Value and Book Top Result

**Platform**: Android
**Status**: PENDING
**Steps**:
1. Launch app, search hotels in San Francisco
2. Tap Sort (testID: sort_button), select Best Value
3. Tap first hotel card (testID: hotel_card_001 or similar)
4. Tap Book Now (testID: book_now_button)
5. Fill guest info (name, email, phone)
6. Tap Next through all 3 steps, Confirm

**DB Verification**:
Query: `SELECT * FROM bookings WHERE booking_type='hotel' ORDER BY created_at DESC LIMIT 1;`
Expected: Row exists with booking_type='hotel', status='confirmed'

**Screenshots**: before_TC05.png → mid_TC05_sorted.png → after_TC05.png

---

## TC06 — Multi-Amenity Filter (Pool + Breakfast + Free Parking)

**Platform**: Android
**Status**: PENDING
**Steps**:
1. Launch app, search hotels in San Francisco
2. Tap Filter
3. Toggle pool ON (testID: filter_pool)
4. Toggle breakfast ON (testID: filter_breakfast)
5. Toggle free_parking ON (testID: filter_free_parking)
6. Apply filter

**DB Verification**:
Query: `SELECT COUNT(*) FROM search_log WHERE search_type='hotel';`
Expected: COUNT > 0; all results include pool, breakfast, free_parking

**Screenshots**: before_TC06.png → after_TC06.png

---

## TC07 — Large Group Booking (6 Guests)

**Platform**: Android
**Status**: PENDING
**Steps**:
1. Launch app, go to Hotels tab
2. Set guest count to 6 (testID: guest_count_stepper)
3. Search San Francisco hotels
4. Book a hotel through full checkout flow

**DB Verification**:
Query: `SELECT guests FROM bookings WHERE booking_type='hotel' ORDER BY created_at DESC LIMIT 1;`
Expected: guests = 6

**Screenshots**: before_TC07.png → after_TC07.png

---

## TC08 — Room Type King Suite

**Platform**: Android
**Status**: PENDING
**Steps**:
1. Launch app, search hotels
2. Tap hotel offering King Suite
3. Book Now → fill guest info → Step 2: select King Suite room type
4. Complete checkout

**DB Verification**:
Query: `SELECT room_type FROM bookings WHERE booking_type='hotel' ORDER BY created_at DESC LIMIT 1;`
Expected: room_type = 'King Suite'

**Screenshots**: before_TC08.png → after_TC08.png

---

## TC09 — Promo Code SAVE10

**Platform**: Android
**Status**: PENDING
**Steps**:
1. Launch app, search and select a hotel
2. At checkout Step 2, enter promo code "SAVE10" (testID: promo_code_input)
3. Tap Apply (testID: promo_code_apply_button)
4. Complete checkout

**DB Verification**:
Query: `SELECT reference_number, promo_code, total_price FROM bookings WHERE promo_code='SAVE10';`
Expected: Row exists with promo_code='SAVE10', total_price reflects 10% discount

**Screenshots**: before_TC09.png → after_TC09.png

---

## TC10 — Non-Refundable Rate

**Platform**: Android
**Status**: PENDING
**Steps**:
1. Launch app, search hotels
2. Filter by non-refundable cancellation policy
3. Select and book a non-refundable hotel

**DB Verification**:
Query: `SELECT * FROM bookings WHERE booking_type='hotel' ORDER BY created_at DESC LIMIT 1;`
Expected: Row exists; item corresponds to a hotel with cancellation_policy='non_refundable'

**Screenshots**: before_TC10.png → after_TC10.png

---

## TC11 — One-Way Flight SFO to JFK

**Platform**: Android
**Status**: PENDING
**Steps**:
1. Launch app, tap Flights tab (testID: tab_flights)
2. Select one-way (testID: trip_type_oneway)
3. Enter origin SFO (testID: flight_origin_input)
4. Enter destination JFK (testID: flight_destination_input)
5. Set date 2026-04-01 (testID: departure_date_picker)
6. Tap Search (testID: search_button)

**DB Verification**:
Query: `SELECT * FROM search_log WHERE search_type='flight' ORDER BY timestamp DESC LIMIT 1;`
Expected: Row with query_params containing origin='SFO', destination='JFK'

**Screenshots**: before_TC11.png → after_TC11.png

---

## TC12 — Round-Trip Non-Stop Flights

**Platform**: Android
**Status**: PENDING
**Steps**:
1. Launch app, tap Flights tab
2. Select round-trip (testID: trip_type_roundtrip)
3. Enter origin, destination, dates
4. Search, then tap Filter → toggle non-stop only (testID: filter_nonstop)
5. Apply

**DB Verification**:
Query: `SELECT * FROM search_log WHERE search_type='flight' ORDER BY timestamp DESC LIMIT 1;`
Expected: Row exists

**Screenshots**: before_TC12.png → after_TC12.png

---

## TC13 — Morning Departure Filter (6am–12pm)

**Platform**: Android
**Status**: PENDING
**Steps**:
1. Launch app, search SFO→JFK flights
2. Tap Filter → select Morning departure time range (testID: filter_morning_departure)
3. Apply

**DB Verification**:
Query: `SELECT COUNT(*) FROM search_log WHERE search_type='flight';`
Expected: COUNT > 0; all visible flights depart between 06:00–11:59

**Screenshots**: before_TC13.png → after_TC13.png

---

## TC14 — Cheapest Flight (Sort Price Ascending)

**Platform**: Android
**Status**: PENDING
**Steps**:
1. Launch app, search SFO→JFK flights
2. Tap Sort → select Price: Low to High (testID: sort_price_asc)
3. Tap first result, Book Now, complete checkout

**DB Verification**:
Query: `SELECT * FROM bookings WHERE booking_type='flight' ORDER BY created_at DESC LIMIT 1;`
Expected: Row exists with booking_type='flight', status='confirmed'

**Screenshots**: before_TC14.png → mid_TC14_sorted.png → after_TC14.png

---

## TC15 — Add Checked Baggage

**Platform**: Android
**Status**: PENDING
**Steps**:
1. Launch app, search and select a flight
2. Checkout Step 2: toggle Add Checked Baggage (testID: extras_checked_baggage)
3. Complete checkout

**DB Verification**:
Query: `SELECT extras FROM bookings WHERE booking_type='flight' ORDER BY created_at DESC LIMIT 1;`
Expected: extras JSON contains 'baggage'

**Screenshots**: before_TC15.png → after_TC15.png

---

## TC16 — Window Seat Preference

**Platform**: Android
**Status**: PENDING
**Steps**:
1. Launch app, search and select a flight
2. Checkout Step 2: select Window seat (testID: seat_preference_window)
3. Complete checkout

**DB Verification**:
Query: `SELECT extras FROM bookings WHERE booking_type='flight' ORDER BY created_at DESC LIMIT 1;`
Expected: extras JSON contains 'seat_preference': 'window'

**Screenshots**: before_TC16.png → after_TC16.png

---

## TC17 — Two Passengers with Meal Preferences

**Platform**: Android
**Status**: PENDING
**Steps**:
1. Launch app, tap Flights tab
2. Set passengers to 2 (testID: passenger_count_stepper)
3. Search and select a flight
4. Checkout Step 2: set meal preferences for each passenger
5. Complete checkout

**DB Verification**:
Query: `SELECT guests FROM bookings WHERE booking_type='flight' ORDER BY created_at DESC LIMIT 1;`
Expected: guests = 2

**Screenshots**: before_TC17.png → after_TC17.png

---

## TC18 — Fastest Flight (Under 5 Hours)

**Platform**: Android
**Status**: PENDING
**Steps**:
1. Launch app, search flights
2. Sort by Duration: Shortest (testID: sort_duration_asc)
3. Filter max duration 300 min (testID: filter_max_duration_slider)
4. Apply

**DB Verification**:
Query: `SELECT COUNT(*) FROM search_log WHERE search_type='flight';`
Expected: COUNT > 0

**Screenshots**: before_TC18.png → mid_TC18_sorted.png → after_TC18.png

---

## TC19 — Restaurants Open Sunday After 8pm

**Platform**: Android
**Status**: PENDING
**Steps**:
1. Launch app, tap Restaurants tab (testID: tab_restaurants)
2. Enter location (testID: restaurant_location_input)
3. Search
4. Filter → toggle Sunday open, time after 20:00
5. Apply

**DB Verification**:
Query: `SELECT * FROM search_log WHERE search_type='restaurant' ORDER BY timestamp DESC LIMIT 1;`
Expected: Row exists

**Screenshots**: before_TC19.png → after_TC19.png

---

## TC20 — Japanese Cuisine, Rating >= 4.5

**Platform**: Android
**Status**: PENDING
**Steps**:
1. Launch app, search restaurants
2. Filter → select Japanese cuisine (testID: filter_cuisine_japanese)
3. Select 4.5 star rating (testID: filter_rating_4_5)
4. Apply

**DB Verification**:
Query: `SELECT COUNT(*) FROM search_log WHERE search_type='restaurant';`
Expected: COUNT > 0; all visible results are Japanese with rating >= 4.5

**Screenshots**: before_TC20.png → after_TC20.png

---

## TC21 — Large Party Reservation (8 People, 7:30pm)

**Platform**: Android
**Status**: PENDING
**Steps**:
1. Launch app, tap Restaurants tab
2. Set party size to 8 (testID: party_size_stepper)
3. Search, select restaurant
4. Checkout Step 2: select 7:30pm time slot (testID: time_slot_1930)
5. Complete booking

**DB Verification**:
Query: `SELECT guests FROM bookings WHERE booking_type='restaurant' ORDER BY created_at DESC LIMIT 1;`
Expected: guests = 8

**Screenshots**: before_TC21.png → after_TC21.png

---

## TC22 — Outdoor Seating + Valet Parking Filter

**Platform**: Android
**Status**: PENDING
**Steps**:
1. Launch app, search restaurants
2. Filter → toggle outdoor_seating (testID: filter_outdoor_seating)
3. Toggle valet_parking (testID: filter_valet_parking)
4. Apply

**DB Verification**:
Query: `SELECT COUNT(*) FROM search_log WHERE search_type='restaurant';`
Expected: COUNT > 0; results include outdoor_seating and valet_parking

**Screenshots**: before_TC22.png → after_TC22.png

---

## TC23 — Price Tier $$ + Sort by Review Count

**Platform**: Android
**Status**: PENDING
**Steps**:
1. Launch app, search restaurants
2. Filter → select price tier $$ (testID: filter_price_tier_2)
3. Apply
4. Sort → Most Reviewed (testID: sort_review_count_desc)

**DB Verification**:
Query: `SELECT COUNT(*) FROM search_log WHERE search_type='restaurant';`
Expected: COUNT > 0

**Screenshots**: before_TC23.png → after_TC23.png

---

## TC24 — Gluten-Free Restaurant Booking

**Platform**: Android
**Status**: PENDING
**Steps**:
1. Launch app, search restaurants
2. Filter → toggle gluten_free dietary (testID: filter_dietary_gluten_free)
3. Apply, select first result
4. Book through full checkout flow

**DB Verification**:
Query: `SELECT * FROM bookings WHERE booking_type='restaurant' ORDER BY created_at DESC LIMIT 1;`
Expected: Row exists with booking_type='restaurant', status='confirmed'

**Screenshots**: before_TC24.png → after_TC24.png

---

## TC25 — Book Earliest Available Time Slot

**Platform**: Android
**Status**: PENDING
**Steps**:
1. Launch app, search restaurants
2. Tap first restaurant card
3. On detail screen, tap first available time slot chip (testID: time_slot_earliest)
4. Proceed through booking

**DB Verification**:
Query: `SELECT * FROM bookings WHERE booking_type='restaurant' ORDER BY created_at DESC LIMIT 1;`
Expected: Row exists, check_in matches earliest available slot

**Screenshots**: before_TC25.png → after_TC25.png

---

## TC26 — Full Hotel Booking End-to-End

**Platform**: Android
**Status**: PENDING
**Steps**:
1. Launch app, Hotels tab
2. Enter city, set dates, set 2 guests
3. Tap Search → Results screen
4. Tap first hotel → Detail screen
5. Tap Book Now → Checkout Step 1: fill name, email, phone → Next
6. Checkout Step 2: select room type → Next
7. Checkout Step 3: Review → Confirm
8. Confirmation screen shows reference number

**DB Verification**:
Query: `SELECT reference_number FROM bookings WHERE booking_type='hotel' ORDER BY created_at DESC LIMIT 1;`
Expected: reference_number matches pattern BOOK-HOTEL-YYYYMMDD-XXXX

**Screenshots**: before_TC26.png → mid_TC26_results.png → mid_TC26_detail.png → mid_TC26_checkout_step1.png → mid_TC26_checkout_step2.png → mid_TC26_checkout_step3.png → after_TC26.png

---

## TC27 — Book Hotel then Verify in My Bookings

**Platform**: Android
**Status**: PENDING
**Steps**:
1. Complete a hotel booking (same as TC26)
2. On confirmation screen, tap View My Bookings (testID: view_my_bookings_button)
3. My Bookings screen shows the booking entry

**DB Verification**:
Query: `SELECT COUNT(*) FROM bookings WHERE booking_type='hotel';`
Expected: COUNT >= 1

**Screenshots**: before_TC27.png → mid_TC27_confirmation.png → after_TC27.png

---

## TC28 — Attempt to Book Unavailable Hotel (Error UI)

**Platform**: Android
**Status**: PENDING
**Steps**:
1. Launch app, search hotels
2. Scroll to find hotel with availability=false (grayed out / "Unavailable" label)
3. Tap hotel card → Detail screen
4. Tap Book Now → error alert/modal should appear

**DB Verification**:
Query: `SELECT COUNT(*) FROM bookings;`
Expected: COUNT unchanged (no booking written); error UI visible in screenshot

**Screenshots**: before_TC28.png → mid_TC28_scrolled.png → after_TC28.png (must show error)

---

## TC29 — Missing Required Fields Validation

**Platform**: Android
**Status**: PENDING
**Steps**:
1. Launch app, search hotels
2. Select any hotel, tap Book Now
3. On Checkout Step 1, leave name/email/phone empty
4. Tap Next → validation error messages must appear

**DB Verification**:
Query: `SELECT COUNT(*) FROM bookings;`
Expected: COUNT unchanged (validation prevented submission); error text visible in screenshot

**Screenshots**: before_TC29.png → mid_TC29_checkout_empty.png → after_TC29.png (must show validation errors)

---

## TC30 — Zero Results Empty State UI

**Platform**: Android
**Status**: PENDING
**Steps**:
1. Launch app, search hotels in San Francisco
2. Tap Filter → set max price to $1 (impossible filter)
3. Apply → empty state UI must appear ("No results found" or equivalent)

**DB Verification**:
Query: `SELECT COUNT(*) FROM search_log WHERE search_type='hotel';`
Expected: COUNT > 0 (search was performed); results list is empty; empty state UI visible

**Screenshots**: before_TC30.png → after_TC30.png (must show empty state)

---

## Summary

| TC | Description | Status |
|---|---|---|
| TC01 | Hotel Search by City | PENDING |
| TC02 | Price Filter Max $150 | PENDING |
| TC03 | Star Rating Filter 4+ | PENDING |
| TC04 | Pet Friendly + Gym Filter | PENDING |
| TC05 | Sort Best Value, Book Top | PENDING |
| TC06 | Multi-Amenity Filter | PENDING |
| TC07 | Large Group 6 Guests | PENDING |
| TC08 | Room Type King Suite | PENDING |
| TC09 | Promo Code SAVE10 | PENDING |
| TC10 | Non-Refundable Rate | PENDING |
| TC11 | One-Way Flight SFO→JFK | PENDING |
| TC12 | Round-Trip Non-Stop | PENDING |
| TC13 | Morning Departure Filter | PENDING |
| TC14 | Cheapest Flight | PENDING |
| TC15 | Add Checked Baggage | PENDING |
| TC16 | Window Seat Preference | PENDING |
| TC17 | Two Passengers + Meals | PENDING |
| TC18 | Fastest Flight < 5h | PENDING |
| TC19 | Restaurants Sunday 8pm+ | PENDING |
| TC20 | Japanese Cuisine >= 4.5 | PENDING |
| TC21 | Large Party 8, 7:30pm | PENDING |
| TC22 | Outdoor Seating + Valet | PENDING |
| TC23 | Price Tier $$ + Review Sort | PENDING |
| TC24 | Gluten-Free Restaurant | PENDING |
| TC25 | Earliest Time Slot | PENDING |
| TC26 | Full Hotel E2E | PENDING |
| TC27 | Hotel then My Bookings | PENDING |
| TC28 | Unavailable Hotel Error UI | PENDING |
| TC29 | Missing Fields Validation | PENDING |
| TC30 | Zero Results Empty State | PENDING |
