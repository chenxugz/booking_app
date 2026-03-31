# Booking Benchmark App — Supplementary Test Cases

## Overview
This file extends the base test suite with additional test cases. The app
runs **fully offline on both Android and iOS devices** — no internet, no
remote APIs. All data is local and bundled with the app.

Each test case includes:
- Mock data requirements
- ADB test script outline
- SQLite verification query

---



## Supplementary Test Cases (Offline-Compatible)

---


### TC31 — Invoice Reconciliation (Download Receipts)
**Category**: Hotel

**Scenario**:
User needs to download all receipts from the last 6 months from
"My Bookings" and save them to a local "Expense Reports" folder
within the app.

**Mock Data Requirements**:
- Pre-populate DB with 10 mock bookings spread across last 6 months
- Each booking has a mock receipt (simple generated PDF with reference
  number, date, amount)
- Add "Expense Folder" screen accessible from My Bookings

**UI Elements Required**:
```
testID="my_bookings_tab"
testID="booking_card_{reference_number}"
testID="download_receipt_button_{reference_number}"
testID="expense_folder_button"
testID="expense_folder_screen"
testID="receipt_item_{reference_number}"
```

**ADB Script Outline**:
```bash
# 1. Navigate to My Bookings
# 2. For each booking in last 6 months, tap download_receipt_button
# 3. Navigate to Expense Folder
# 4. Verify all receipts appear
# 5. Pull DB and verify download_log entries
```

**DB Verification**:
```sql
-- Add download_log table to schema
CREATE TABLE IF NOT EXISTS download_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference_number TEXT,
  downloaded_at INTEGER DEFAULT (strftime('%s','now'))
);

-- Verify all 6-month receipts were downloaded
SELECT COUNT(*) FROM download_log
WHERE downloaded_at >= strftime('%s', 'now', '-6 months');
```

---

### TC32 — Review Synthesis (Scan for Keywords)
**Category**: Hotel

**Scenario**:
Agent opens a hotel detail page, navigates to the reviews section,
and identifies which reviews mention "construction noise" or
"elevator wait times" among the last 50 reviews.

**Mock Data Requirements**:
- Add `reviews` array to each hotel in hotels.json (50 entries minimum
  for at least one hotel), with some containing target keywords:
  ```json
  "reviews": [
    {
      "id": "rev_001",
      "author": "Jane D.",
      "rating": 3,
      "date": "2024-03-01",
      "text": "Great location but construction noise woke us up at 7am."
    }
  ]
  ```

**UI Elements Required**:
```
testID="reviews_section"
testID="review_item_{review_id}"
testID="review_search_input"
testID="review_keyword_filter_button"
testID="filtered_review_count_label"
```

**DB Verification**:
```sql
CREATE TABLE IF NOT EXISTS review_searches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hotel_id TEXT,
  keyword TEXT,
  match_count INTEGER,
  searched_at INTEGER DEFAULT (strftime('%s','now'))
);

SELECT * FROM review_searches ORDER BY searched_at DESC LIMIT 2;
```

---


### TC33 — Bulk Booking (10 Rooms, Corporate Retreat)
**Category**: Hotel

**Scenario**:
Agent must book 10 separate rooms at the same hotel for a corporate
retreat, entering a different employee name for each room, all charged
to a single corporate card ending in 4242.

**UI Elements Required**:
```
testID="add_another_room_button"
testID="guest_name_input_{index}"
testID="room_type_selector_{index}"
testID="corporate_card_input"
testID="bulk_booking_summary_screen"
testID="confirm_all_rooms_button"
```

**DB Verification**:
```sql
-- All 10 bookings share same hotel, same card, different guest names
SELECT COUNT(*) FROM bookings
WHERE item_id='hotel_001'
AND created_at >= strftime('%s','now','-1 minute');
-- Expected: 10
```

---

### TC34 — Multi-City Flight Optimization
**Category**: Flight

**Scenario**:
Agent searches "SFO → LHR → CDG → FCO" vs "SFO → FCO → CDG → LHR"
and identifies which sequence has the lower total price.

**Mock Data Requirements**:
- Add multi-city flight combinations to flights.json with fixed prices
  so the cheaper sequence is always deterministic
- Add a "Multi-City" tab to the flight search form

**UI Elements Required**:
```
testID="flight_tab_multicity"
testID="multicity_leg_{index}_origin"
testID="multicity_leg_{index}_destination"
testID="multicity_add_leg_button"
testID="multicity_search_button"
testID="multicity_total_price_label"
testID="multicity_select_itinerary_button_{index}"
```

**DB Verification**:
```sql
SELECT query_params, result_count FROM search_log
WHERE search_type='flight_multicity'
ORDER BY timestamp DESC LIMIT 2;

SELECT total_price FROM bookings
WHERE booking_type='flight'
ORDER BY created_at DESC LIMIT 1;
```

---


### TC35 — Delayed Flight Compensation Claim
**Category**: Flight

**Scenario**:
A mock flight in "My Bookings" is marked as delayed by 3 hours.
Agent navigates to Help → File Compensation Claim, fills in the
delay details, and submits. App shows claim reference number.

**Mock Data Requirements**:
- Add `status: "delayed"` and `delay_minutes: 180` to one flight booking
  pre-populated in DB

**UI Elements Required**:
```
testID="my_bookings_tab"
testID="flight_booking_card_{reference_number}"
testID="flight_delayed_badge"
testID="help_button"
testID="file_compensation_claim_button"
testID="claim_delay_duration_input"
testID="claim_submit_button"
testID="claim_reference_number_label"
```

**DB Verification**:
```sql
CREATE TABLE IF NOT EXISTS compensation_claims (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_reference TEXT,
  delay_minutes INTEGER,
  claim_reference TEXT,
  submitted_at INTEGER DEFAULT (strftime('%s','now'))
);

SELECT * FROM compensation_claims ORDER BY submitted_at DESC LIMIT 1;
```

---

### TC36 — Baggage Policy Comparison (3 Airlines)
**Category**: Flight

**Scenario**:
Agent navigates to the baggage policy detail page for 3 different
budget airlines and compares whether a 40x20x25cm backpack qualifies
as a "personal item" for each.

**Mock Data Requirements**:
- Add `baggage_policy` to flights.json:
  ```json
  "baggage_policy": {
    "personal_item_max_cm": "40x30x15",
    "carry_on_max_cm": "55x40x20",
    "checked_bag_fee": 35.0
  }
  ```

**UI Elements Required**:
```
testID="flight_detail_baggage_tab"
testID="personal_item_dimensions_label"
testID="carry_on_dimensions_label"
testID="checked_bag_fee_label"
testID="baggage_policy_airline_{airline_id}"
```

**DB Verification**:
```sql
SELECT query_params FROM search_log
WHERE search_type='baggage_policy_view'
ORDER BY timestamp DESC LIMIT 3;
-- Expect 3 rows, one per airline viewed
```

---




### TC37 — Seasonal Menu Comparison (3 Restaurants)
**Category**: Restaurant

**Scenario**:
Agent navigates to the "Seasonal Specials" menu section of 3 different
steakhouse restaurants and identifies which ones currently have oysters
on the menu.

**Mock Data Requirements**:
- Add `seasonal_specials` array to restaurant data:
  ```json
  "seasonal_specials": [
    { "item": "Oysters Rockefeller", "price": 24.0 },
    { "item": "Wagyu Tartare", "price": 32.0 }
  ]
  ```
- At least 2 of 3 target steakhouses have oysters; 1 does not

**UI Elements Required**:
```
testID="restaurant_menu_tab"
testID="seasonal_specials_section"
testID="menu_item_{item_name}"
testID="has_oysters_badge"
```

**DB Verification**:
```sql
SELECT query_params FROM search_log
WHERE search_type='menu_view'
AND query_params LIKE '%seasonal_specials%'
ORDER BY timestamp DESC LIMIT 3;
-- Expect 3 rows, one per restaurant visited
```

---

## New DB Tables Summary

Add these tables to your existing schema in `src/db/schema.ts`:

```sql
CREATE TABLE IF NOT EXISTS download_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference_number TEXT,
  downloaded_at INTEGER DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS review_searches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hotel_id TEXT,
  keyword TEXT,
  match_count INTEGER,
  searched_at INTEGER DEFAULT (strftime('%s','now'))
);


CREATE TABLE IF NOT EXISTS compensation_claims (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_reference TEXT,
  delay_minutes INTEGER,
  claim_reference TEXT,
  submitted_at INTEGER DEFAULT (strftime('%s','now'))
);


```

---

## Autonomy Instructions

**NEVER STOP during build or test loop.** Once started:
- Do NOT ask "should I continue?" between test cases
- If a test fails, diagnose, fix, and re-run immediately
- Log all progress to `/tests/android/results/progress.log`
- The human may be away — keep working until manually stopped