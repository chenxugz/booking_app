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
