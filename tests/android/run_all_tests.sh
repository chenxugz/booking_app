#!/bin/bash
echo "Starting Booking Benchmark Test Suite - $(date)" >> ./tests/android/results/progress.log
for i in $(seq -w 1 37); do
  script="./tests/android/adb/tc${i}_*.sh"
  for f in $script; do
    [ -f "$f" ] && bash "$f"
  done
done
echo "Test Suite Complete - $(date)" >> ./tests/android/results/progress.log
cat ./tests/android/results/progress.log
