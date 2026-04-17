# Booking Benchmark App

A cross-platform booking app (hotel/flight/restaurant) built as a benchmark environment for GUI agents. Runs fully offline on Android and iOS — no internet, no remote APIs.

## Features

### Hotel Booking
- Search by city with date pickers and guest count
- Filter by price, star rating, amenities (pool, gym, pet-friendly, etc.)
- Sort by price, rating, best value, most reviewed
- 3-step checkout: Guest Info, Room Selection + Promo Code, Review & Confirm
- Bulk booking for corporate retreats (up to 10 rooms)
- Hotel reviews with keyword search

### Flight Booking
- One-way, round-trip, and multi-city search
- Filter by stops, departure time window
- Sort by price, duration
- Seat class, seat preference, meal preference, baggage add-on
- Baggage policy comparison across airlines
- Delayed flight compensation claims

### Restaurant Booking
- Search by city, date, time, party size
- Filter by cuisine, rating, amenities (outdoor seating, valet parking)
- Sort by rating, price, review count
- Time slot selection
- Seasonal specials menu with oyster badge

### My Bookings
- Full booking history from SQLite
- Filter by type (hotel/flight/restaurant)
- Download receipts to Expense Reports folder
- Delayed flight badge with File Claim button

## Tech Stack

| Component | Technology |
|---|---|
| Framework | React Native 0.73 (CLI, not Expo) |
| Language | TypeScript |
| Navigation | React Navigation v6 (stack + bottom tabs) |
| State | Zustand |
| Database | react-native-sqlite-storage |
| Date/Time | react-native-date-picker |
| Data | Mock JSON (30 hotels, 30 flights, 30 restaurants) |
| Min Android | SDK 26 (Android 8.0) |
| Min iOS | 14.0 |

## Project Structure

```
booking_app/
├── src/
│   ├── components/          # DatePickerInput, TimePickerInput
│   ├── navigation/          # RootNavigator, HomeTabNavigator, types
│   ├── screens/             # 11 screens (Home tabs, Results, Detail, Checkout, etc.)
│   ├── db/                  # SQLite database, schema, queries
│   ├── store/               # Zustand stores (search, booking, data)
│   ├── data/                # Mock JSON (hotels, flights, restaurants)
│   └── utils/               # Reference number generator, filter engine
├── tests/
│   └── android/
│       ├── adb/             # 37 ADB test scripts (tc01-tc37)
│       ├── screenshots/     # Before/after screenshots per test
│       └── results/         # progress.log, report.md
├── android/                 # Android native project
└── ios/                     # iOS native project
```

## Database Schema

5 SQLite tables — all actions are logged for automated verification:

- **bookings** — All confirmed bookings (hotel/flight/restaurant)
- **search_log** — All searches, filter changes, sort changes, baggage/menu views
- **download_log** — Receipt downloads
- **review_searches** — Hotel review keyword searches
- **compensation_claims** — Delayed flight compensation claims

## Test Cases

37 test cases verified via ADB + SQLite on Android:

| # | Category | Test Case |
|---|---|---|
| TC01 | Hotel | Search San Francisco, 2 guests, 3 nights |
| TC02 | Hotel | Filter by max price $150/night |
| TC03 | Hotel | Filter by 4-star and above |
| TC04 | Hotel | Filter pet-friendly + gym |
| TC05 | Hotel | Sort by Best Value, book top result |
| TC06 | Hotel | Filter pool + breakfast + free parking |
| TC07 | Hotel | Book for 6 guests |
| TC08 | Hotel | Select King Suite room type |
| TC09 | Hotel | Apply promo code SAVE10 |
| TC10 | Hotel | Book with non-refundable rate |
| TC11 | Flight | One-way SFO to JFK |
| TC12 | Flight | Round-trip non-stop filter |
| TC13 | Flight | Morning departure filter (6am-12pm) |
| TC14 | Flight | Book cheapest flight |
| TC15 | Flight | Add checked baggage |
| TC16 | Flight | Window seat preference |
| TC17 | Flight | 2 passengers, vegetarian meal |
| TC18 | Flight | Sort by fastest duration |
| TC19 | Restaurant | Sunday 2024-04-07 at 20:00 |
| TC20 | Restaurant | Japanese cuisine, rating >= 4.5 |
| TC21 | Restaurant | Party of 8, select time slot |
| TC22 | Restaurant | Outdoor seating + valet parking |
| TC23 | Restaurant | Sort by most reviewed |
| TC24 | Restaurant | Book a restaurant |
| TC25 | Restaurant | Book earliest time slot |
| TC26 | Complex | Full hotel E2E booking |
| TC27 | Complex | Book then verify in My Bookings |
| TC28 | Edge | Unavailable hotel error |
| TC29 | Edge | Missing fields validation |
| TC30 | Edge | Zero results empty state |
| TC31 | Supplemental | Download receipts, Expense Reports |
| TC32 | Supplemental | Review keyword search |
| TC33 | Supplemental | Bulk booking 10 rooms |
| TC34 | Supplemental | Multi-city flight search |
| TC35 | Supplemental | Delayed flight compensation claim |
| TC36 | Supplemental | Baggage policy comparison (3 airlines) |
| TC37 | Supplemental | Seasonal menu comparison (3 restaurants) |

## Running

### Prerequisites
- Node.js 18+
- JDK 17
- Android SDK (API 26+)
- Connected Android device or emulator

### Install & Run
```bash
npm install
npx react-native start          # Start Metro bundler
npx react-native run-android    # Build and install
```

### Run Tests
```bash
# Run all 37 test cases
bash tests/android/run_all_tests.sh

# Run a single test
bash tests/android/adb/tc01_hotel_search.sh
```

Each test script:
1. Clears the database and restarts the app
2. Performs actions via ADB (tap, type, scroll)
3. Verifies results via exact SQLite queries
4. Logs PASS/FAIL to `tests/android/results/progress.log`

### Install APK
```bash
adb install app-debug.apk
```

Download the latest APK from [GitHub Releases](https://github.com/chenxugz/booking_app/releases).
