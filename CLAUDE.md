# Booking Benchmark App — Claude Code Instructions (Cross-Platform)

## Project Purpose
This is a cross-platform booking app (hotel/flight/restaurant search) built
as a benchmark environment for GUI agents. The app runs **fully offline on
both Android and iOS devices** — no internet, no remote APIs. All data is
local and bundled with the app.

Key goals:
- Realistic UI that mimics Priceline/Yelp/Expedia on mobile
- Single codebase runs on both Android and iOS
- Every interaction is testable and deterministic
- SQLite database logs all actions for automated verification
- ADB-based automated testing on Android (screenshot + tap + DB verification)
- iOS testing scaffolded but not yet automated (manual + XCUITest ready)

---

## Tech Stack
- **Framework**: React Native (CLI, not Expo) — single codebase for Android + iOS
- **Language**: TypeScript
- **UI**: React Native Paper (Material Design 3) + React Navigation v6
- **Database**: react-native-sqlite-storage — local SQLite, works on both platforms
- **State**: Zustand (lightweight, no boilerplate)
- **Data**: Mock JSON bundled in `/src/assets/data/` — zero network calls ever
- **Min Android SDK**: 26 (Android 8.0)
- **Min iOS**: 14.0
- **Build (Android)**: Gradle
- **Build (iOS)**: Xcode + CocoaPods

---

## Project Structure
```
booking-benchmark/
├── CLAUDE.md
├── android/                        # Android native project (auto-generated)
├── ios/                            # iOS native project (auto-generated)
├── src/
│   ├── navigation/                 # RootNavigator, TabNavigator, stack routes
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── ResultsScreen.tsx
│   │   ├── DetailScreen.tsx
│   │   ├── CheckoutScreen.tsx
│   │   ├── ConfirmationScreen.tsx
│   │   └── MyBookingsScreen.tsx
│   ├── components/                 # Reusable RN components
│   ├── db/
│   │   ├── database.ts             # SQLite init, open/close
│   │   ├── schema.ts               # CREATE TABLE statements
│   │   └── queries.ts              # All DB read/write helpers
│   ├── store/                      # Zustand stores (search, booking, filters)
│   ├── data/
│   │   ├── hotels.json
│   │   ├── flights.json
│   │   └── restaurants.json
│   └── utils/
│       ├── referenceNumber.ts      # BOOK-{TYPE}-{date}-{rand4} generator
│       └── filterEngine.ts         # Deterministic filter/sort logic
├── tests/
│   ├── android/
│   │   ├── adb/                    # ADB shell scripts per test case
│   │   │   ├── tc01_hotel_search.sh
│   │   │   ├── tc02_price_filter.sh
│   │   │   └── ...
│   │   ├── screenshots/            # before/after per test case
│   │   └── results/
│   │       ├── report.md
│   │       └── progress.log
│   └── ios/
│       ├── manual/                 # Step-by-step manual test checklists
│       └── xcuitest/               # XCUITest stubs (ready for future automation)
├── package.json
└── tsconfig.json
```

---

## Screens to Build

| Screen | Description |
|---|---|
| **Home** | Tab bar: Hotels / Flights / Restaurants. Each tab has its own search form |
| **Results** | Scrollable FlatList of cards + bottom sheet filters + sort menu |
| **Detail** | Image carousel, amenities, reviews, pricing tiers, Book Now button |
| **Checkout** | 3-step flow: Guest Info → Extras/Preferences → Review & Confirm |
| **Confirmation** | Unique reference number, booking summary, View My Bookings CTA |
| **My Bookings** | Full history from SQLite, filterable by type (hotel/flight/restaurant) |

---

## testID Requirements (CRITICAL)

Every interactive element MUST have a `testID` prop. This is used by:
- ADB UiAutomator on Android
- XCUITest accessibilityIdentifier on iOS

React Native's `testID` maps to both platforms automatically.
```tsx
// Inputs
<TextInput testID="hotel_search_input" ... />

// Buttons
<TouchableOpacity testID="search_button" ...>

// Checkboxes / switches
<Checkbox testID="filter_pet_friendly" ... />

// Sliders
<Slider testID="price_range_slider" ... />

// Date pickers
<DatePicker testID="checkin_date_picker" ... />

// List items
<TouchableOpacity testID={`hotel_card_${item.id}`} ...>

// Tab bar
<Tab testID="tab_hotels" ...>
<Tab testID="tab_flights" ...>
<Tab testID="tab_restaurants" ...>
```

Use snake_case for all testID values. Never use generic names like
"button1" — always use descriptive names tied to function.

---

## Mock Data Requirements

All data bundled in `/src/data/`. Loaded once at app start by Zustand store.
Must be rich enough to support all 30 test cases below.

### hotels.json (minimum 30 entries)
```json
{
  "id": "hotel_001",
  "name": "Grand Pacific Hotel",
  "city": "San Francisco",
  "address": "123 Market St, San Francisco, CA",
  "lat": 37.7749,
  "lng": -122.4194,
  "price_per_night": 189.0,
  "star_rating": 4,
  "review_score": 4.6,
  "review_count": 342,
  "amenities": ["pool", "gym", "free_wifi", "pet_friendly", "free_parking", "breakfast"],
  "room_types": ["Standard King", "Deluxe Queen", "Suite"],
  "distance_to_union_square_miles": 0.8,
  "availability": true,
  "cancellation_policy": "flexible",
  "image_placeholder": "hotel_001",
  "reviews": [
    {
      "id": "rev_001",
      "author": "Jane D.",
      "rating": 3,
      "date": "2024-03-01",
      "text": "Great location but construction noise woke us up at 7am."
    }
  ]
}
```

### flights.json (minimum 30 entries)
```json
{
  "id": "flight_001",
  "airline": "United Airlines",
  "flight_number": "UA 487",
  "origin": "SFO",
  "destination": "JFK",
  "departure_time": "08:30",
  "arrival_time": "17:15",
  "date": "2024-04-01",
  "duration_minutes": 345,
  "stops": 0,
  "price": 312.0,
  "seat_classes": ["Economy", "Business"],
  "available_seats": 14,
  "baggage_included": false,
  "meal_options": ["standard", "vegetarian", "gluten_free"],
  "baggage_policy": {
    "personal_item_max_cm": "40x30x15",
    "carry_on_max_cm": "55x40x20",
    "checked_bag_fee": 35.0
  }
}
```

### restaurants.json (minimum 30 entries)
```json
{
  "id": "rest_001",
  "name": "Sakura Garden",
  "cuisine": "Japanese",
  "address": "456 Union St, San Francisco, CA",
  "price_tier": 2,
  "rating": 4.7,
  "review_count": 891,
  "open_days": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
  "open_time": "11:00",
  "close_time": "22:00",
  "amenities": ["outdoor_seating", "valet_parking", "private_dining"],
  "dietary": ["gluten_free", "vegan", "vegetarian"],
  "max_party_size": 12,
  "availability_slots": ["18:00", "18:30", "19:00", "20:00", "20:30"],
  "seasonal_specials": [
    { "item": "Oysters Rockefeller", "price": 24.0 },
    { "item": "Wagyu Tartare", "price": 32.0 }
  ]
}
```

---

## Database Schema (SQLite via react-native-sqlite-storage)

Initialize DB in `src/db/database.ts`. DB file is named `booking_benchmark.db`.
```sql
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_type TEXT NOT NULL,
  reference_number TEXT UNIQUE NOT NULL,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  user_name TEXT,
  user_email TEXT,
  user_phone TEXT,
  check_in TEXT,
  check_out TEXT,
  guests INTEGER,
  room_type TEXT,
  seat_class TEXT,
  extras TEXT,
  promo_code TEXT,
  total_price REAL,
  status TEXT DEFAULT 'confirmed',
  created_at INTEGER DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS search_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  search_type TEXT NOT NULL,
  query_params TEXT NOT NULL,
  result_count INTEGER,
  selected_item_id TEXT,
  timestamp INTEGER DEFAULT (strftime('%s','now'))
);

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

Reference number format: `BOOK-{TYPE}-{yyyyMMdd}-{XXXX}`
Example: `BOOK-HOTEL-20240315-A7K2`

Every booking MUST write to `bookings`. Every search MUST write to `search_log`.
Receipt downloads write to `download_log`. Review keyword searches write to `review_searches`.
Compensation claims write to `compensation_claims`.

---

## DB File Paths by Platform

These paths are used by test scripts to pull and query the DB.

### Android
```
/data/data/com.bookingbenchmark/databases/booking_benchmark.db
```
Pull via:
```bash
adb shell "run-as com.bookingbenchmark cp \
  /data/data/com.bookingbenchmark/databases/booking_benchmark.db \
  /sdcard/test_benchmark.db"
adb pull /sdcard/test_benchmark.db ./tests/android/
```

### iOS (for future automation / manual inspection)
```
$(idb fs list --bundle-id com.bookingbenchmark)
# or via Xcode Devices window → Download Container → inspect app sandbox
```
Path inside sandbox:
```
Library/LocalDatabase/booking_benchmark.db
```

---

## Test Cases (30 Use Cases)

The app must fully support all of the following. Each is verified via
SQLite query after the ADB script runs on Android.

### Hotels
1. Search hotels in San Francisco for 2 guests, 3 nights
2. Filter by max price $150/night — verify all results ≤ $150
3. Filter by 4-star rating and above only
4. Find pet-friendly hotels with gym within 5 miles of Union Square
5. Sort by Best Value and book the top result
6. Filter by pool + free breakfast + free parking simultaneously
7. Book a hotel for 6 guests (large group)
8. Select room type "King Suite" and verify saved in DB
9. Apply promo code "SAVE10" at checkout and verify discount in DB
10. Choose non-refundable rate and verify cancellation_policy in DB

### Flights
11. Search one-way SFO → JFK on 2024-04-01
12. Search round-trip non-stop flights only
13. Filter flights departing between 6am–12pm
14. Sort by price ascending and book cheapest
15. Add checked baggage — verify extras JSON in DB
16. Select window seat preference — verify in DB
17. Book for 2 passengers with different meal preferences
18. Find fastest flight under 5 hours duration

### Restaurants
19. Find restaurants open Sunday after 8pm near Union Square
20. Filter by Japanese cuisine with rating ≥ 4.5
21. Reserve table for 8 people at 7:30pm
22. Find restaurants with outdoor seating AND valet parking
23. Filter by price tier $$ and sort by review count
24. Find gluten-free friendly restaurant and complete booking
25. Book earliest available time slot within next 3 days

### Complex / Edge Cases
26. Complete full hotel booking end-to-end, verify reference number in DB
27. Book hotel, navigate to My Bookings, verify entry is listed
28. Attempt to book unavailable hotel (availability: false) — verify error UI
29. Submit checkout with missing required fields — verify validation errors shown
30. Apply filters yielding 0 results — verify empty state UI is displayed

---

## Android ADB Test Automation

### Setup
```bash
# Verify device connected
adb devices

# Install APK
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Launch app
adb shell am start -n com.bookingbenchmark/.MainActivity

# Wait for app to load
sleep 3
```

### Per-Test Script Template
Each script in `/tests/android/adb/tc##_name.sh`:
```bash
#!/bin/bash
PACKAGE="com.bookingbenchmark"
DB_DEVICE="/data/data/$PACKAGE/databases/booking_benchmark.db"
DB_LOCAL="./tests/android/benchmark_local.db"
TC_ID="TC01"
PASS=0

echo "[$TC_ID] Starting..."

# 1. Reset app
adb shell am force-stop $PACKAGE
sleep 1
adb shell am start -n $PACKAGE/.MainActivity
sleep 3

# 2. Before screenshot
adb shell screencap /sdcard/before_$TC_ID.png
adb pull /sdcard/before_$TC_ID.png ./tests/android/screenshots/

# 3. ADB actions (tap, input, swipe)
adb shell input tap 540 400
adb shell input text "San Francisco"
adb shell input tap 540 900
sleep 2

# 4. After screenshot
adb shell screencap /sdcard/after_$TC_ID.png
adb pull /sdcard/after_$TC_ID.png ./tests/android/screenshots/

# 5. Pull and query DB
adb shell "run-as $PACKAGE cp $DB_DEVICE /sdcard/test_benchmark.db"
adb pull /sdcard/test_benchmark.db $DB_LOCAL

COUNT=$(sqlite3 $DB_LOCAL \
  "SELECT COUNT(*) FROM search_log WHERE search_type='hotel';")
[ "$COUNT" -gt "0" ] && PASS=1

# 6. Log result
STATUS="FAIL"
[ $PASS -eq 1 ] && STATUS="PASS"
echo "[$TC_ID] $STATUS" >> ./tests/android/results/progress.log
echo "[$TC_ID] $STATUS"
```

### DB Verification Queries
```bash
# Latest booking
sqlite3 ./tests/android/benchmark_local.db \
  "SELECT * FROM bookings ORDER BY created_at DESC LIMIT 1;"

# Booking by reference number
sqlite3 ./tests/android/benchmark_local.db \
  "SELECT * FROM bookings WHERE reference_number='BOOK-HOTEL-20240315-A7K2';"

# Verify promo code applied
sqlite3 ./tests/android/benchmark_local.db \
  "SELECT reference_number, promo_code, total_price FROM bookings \
   WHERE promo_code IS NOT NULL;"

# Count by type
sqlite3 ./tests/android/benchmark_local.db \
  "SELECT booking_type, COUNT(*) FROM bookings GROUP BY booking_type;"

# Recent searches
sqlite3 ./tests/android/benchmark_local.db \
  "SELECT search_type, query_params, result_count FROM search_log \
   ORDER BY timestamp DESC LIMIT 10;"
```

---

## iOS Test Scaffolding (Manual + Future Automation)

### Manual Test Checklist
Generate `/tests/ios/manual/tc##_name.md` for each of the 30 test cases:
```markdown
## TC01 — Hotel Search by City (iOS Manual)

**Device**: iPhone (iOS 14+)
**Steps**:
1. Launch app on iOS device or simulator
2. Tap Hotels tab (testID: tab_hotels)
3. Tap location field (testID: hotel_search_input), type "San Francisco"
4. Set check-in date (testID: checkin_date_picker)
5. Set check-out date (testID: checkout_date_picker)
6. Set guests to 2 (testID: guest_count_stepper)
7. Tap Search (testID: search_button)

**Expected**: Results screen shows hotels in San Francisco
**DB Check**: Use Xcode Devices window to download app container,
  then: sqlite3 booking_benchmark.db
        "SELECT * FROM search_log ORDER BY timestamp DESC LIMIT 1;"
```

### XCUITest Stub (future)
```swift
// tests/ios/xcuitest/TC01_HotelSearch.swift
func testHotelSearchByCity() {
    let app = XCUIApplication()
    app.launch()
    app.buttons["tab_hotels"].tap()
    app.textFields["hotel_search_input"].typeText("San Francisco")
    app.buttons["search_button"].tap()
    XCTAssert(app.otherElements["results_list"].exists)
}
```

---

## Test Report Format

Generate `/tests/android/results/report.md`:
```markdown
## TC01 — Hotel Search by City

**Platform**: Android  
**Status**: PASS ✅  
**Steps**:
1. Launch app
2. Tap Hotels tab
3. Enter "San Francisco"
4. Set dates and guests
5. Tap Search

**DB Verification**:
Query: SELECT * FROM search_log WHERE search_type='hotel' ORDER BY timestamp DESC LIMIT 1;
Result: Row found with query_params containing city='San Francisco', result_count > 0

**Screenshots**: before_TC01.png → after_TC01.png
```

---

## Coding Conventions
- TypeScript strict mode — no `any` types
- Functional components with hooks only
- Zustand for all global state — no prop drilling
- All mock data loaded from JSON assets at startup — never hardcoded in components
- SQLite is the single source of truth for completed actions
- `testID` on every interactive element — mandatory, never skip
- Error states must render visible `<Text>` — not just color or icon changes
- Filter logic lives in `src/utils/filterEngine.ts` — deterministic, pure functions
- Zero network calls anywhere in the codebase

---

## Autonomy Instructions

**NEVER STOP during the build or test loop.** Once started:
- Do NOT ask "should I continue?" or pause for confirmation
- Do NOT ask clarifying questions — make a reasonable decision and proceed
- If a build fails, read the error, fix it, rebuild immediately
- If a test fails, diagnose from logs/screenshots, fix app or script, re-run
- If all 30 test cases pass, look for gaps and add more coverage
- Write all progress to `/tests/android/results/progress.log` continuously
- The human may be away — keep working until manually stopped