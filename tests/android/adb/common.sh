#!/bin/bash
PACKAGE="com.bookingbenchmark"
DB_DEVICE="/data/data/$PACKAGE/databases/booking_benchmark.db"
DB_LOCAL="./tests/android/benchmark_local.db"

launch_app() {
  adb shell am force-stop $PACKAGE
  sleep 1
  adb shell am start -n $PACKAGE/.MainActivity
  sleep 3
}

pull_db() {
  adb shell "run-as $PACKAGE cp $DB_DEVICE /sdcard/test_benchmark.db" 2>/dev/null
  adb pull /sdcard/test_benchmark.db $DB_LOCAL 2>/dev/null
}

screenshot() {
  local name=$1
  adb shell screencap /sdcard/${name}.png
  adb pull /sdcard/${name}.png ./tests/android/screenshots/
}

tap() {
  adb shell input tap $1 $2
}

swipe() {
  adb shell input swipe $1 $2 $3 $4 300
}

type_text() {
  adb shell input text "$1"
}

log_result() {
  local tc=$1
  local status=$2
  echo "[$tc] $status - $(date)" >> ./tests/android/results/progress.log
  echo "[$tc] $status"
}

# Type a date/time into a TextInput field.
# Usage: pick_date "checkin_date_picker" "2024-04-01"
#        pick_time "restaurant_time_picker" "20:00"
# Finds the field by testID, taps it, types the value, then dismisses keyboard.
pick_date() {
  local testid=$1
  local value=$2
  # Dump UI once to find the field
  adb shell uiautomator dump /sdcard/ui.xml 2>/dev/null
  adb pull /sdcard/ui.xml /tmp/ui.xml 2>/dev/null
  local line=$(grep -o "resource-id=\"$testid\"[^>]*bounds=\"\[[0-9,]*\]\[[0-9,]*\]\"" /tmp/ui.xml | head -1)
  if [ -z "$line" ]; then
    echo "WARNING: pick_date could not find $testid"
    return 1
  fi
  local x1=$(echo "$line" | sed 's/.*bounds="\[\([0-9]*\),.*/\1/')
  local y1=$(echo "$line" | sed 's/.*bounds="\[[0-9]*,\([0-9]*\)\].*/\1/')
  local x2=$(echo "$line" | sed 's/.*\]\[\([0-9]*\),.*/\1/')
  local y2=$(echo "$line" | sed 's/.*\]\[[0-9]*,\([0-9]*\)\]".*/\1/')
  local cx=$(( (x1 + x2) / 2 ))
  local cy=$(( (y1 + y2) / 2 ))
  # Tap the field
  adb shell input tap $cx $cy
  sleep 0.8
  # Type the value
  adb shell input text "$value"
  sleep 0.3
  # Dismiss keyboard
  adb shell input keyevent KEYCODE_ESCAPE
  sleep 0.3
}

# Alias — same logic for time fields
pick_time() {
  pick_date "$1" "$2"
}

# Find element by resource-id and tap it (uses uiautomator dump)
find_and_tap() {
  adb shell uiautomator dump /sdcard/ui.xml 2>/dev/null
  adb pull /sdcard/ui.xml /tmp/ui.xml 2>/dev/null
  local line=$(grep -o "resource-id=\"$1\"[^>]*bounds=\"\[[0-9,]*\]\[[0-9,]*\]\"" /tmp/ui.xml | head -1)
  [ -z "$line" ] && return 1
  local x1=$(echo "$line" | sed 's/.*bounds="\[\([0-9]*\),.*/\1/')
  local y1=$(echo "$line" | sed 's/.*bounds="\[[0-9]*,\([0-9]*\)\].*/\1/')
  local x2=$(echo "$line" | sed 's/.*\]\[\([0-9]*\),.*/\1/')
  local y2=$(echo "$line" | sed 's/.*\]\[[0-9]*,\([0-9]*\)\]".*/\1/')
  tap $(( (x1 + x2) / 2 )) $(( (y1 + y2) / 2 ))
  sleep 0.7
  return 0
}

# Pull DB via run-as cat (works on more devices than cp to sdcard)
pull_db_cat() {
  adb shell "run-as $PACKAGE cat databases/booking_benchmark.db" > /tmp/bb.db 2>/dev/null
}

# Query the pulled DB
qdb() {
  sqlite3 /tmp/bb.db "$1" 2>/dev/null
}

# Clear the database by deleting the DB file and restarting the app.
# The app will recreate empty tables on startup.
# Call this at the beginning of each test to ensure a clean state.
clear_db() {
  adb shell am force-stop $PACKAGE
  sleep 1
  adb shell "run-as $PACKAGE rm -f databases/booking_benchmark.db databases/booking_benchmark.db-journal" 2>/dev/null
  adb shell am start -n $PACKAGE/.MainActivity
  sleep 5
}
