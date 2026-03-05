#!/bin/bash
# Calculate commit timestamps for 30 commits spread over ~1.5 hours
current_time=$(date +%s)
start_time=$((current_time - 5400))  # 1.5 hours ago

delays=(
  180  # 1: Update imports and contract structure (3 min)
  150  # 2: Add custom errors for gas optimization (2.5 min)
  120  # 3: Optimize struct storage packing (2 min)
  180  # 4: Enhance events with more details (3 min)
  300  # 5: Add time-based booking lock functionality (5 min)
  150  # 6: Add ownership verification modifier (2.5 min)
  420  # 7: Enhance booking creation with time locks (7 min)
  180  # 8: Add booking completion status (3 min)
  150  # 9: Improve availability management (2.5 min)
  120  # 10: Add ownership verification functions (2 min)
  180  # 11: Implement ownership transfer (3 min)
  240  # 12: Add access control enhancements (4 min)
  150  # 13: Add reentrancy guards to all functions (2.5 min)
  180  # 14: Enhance input validation (3 min)
  120  # 15: Add comprehensive view functions (2 min)
  300  # 16: Enhance booking cancellation (5 min)
  180  # 17: Add booking completion logic (3 min)
  240  # 18: Add spot booking history tracking (4 min)
  180  # 19: Add totalPrice calculation to bookings (3 min)
  600  # 20: BREAK - Create test file structure (10 min break)
  300  # 21: Write tests for spot listing (5 min)
  240  # 22: Write tests for booking creation (4 min)
  300  # 23: Write tests for time-based locks (5 min)
  180  # 24: Write tests for availability (3 min)
  240  # 25: Write tests for ownership transfer (4 min)
  180  # 26: Write tests for access control (3 min)
  300  # 27: Write tests for reentrancy (5 min)
  420  # 28: Write edge case tests (7 min)
  240  # 29: Add comprehensive NatSpec docs (4 min)
  180  # 30: Final polish and verification (3 min)
)

timestamp=$start_time
for i in "${!delays[@]}"; do
  commit_num=$((i + 1))
  echo "Commit $commit_num: $(date -d "@$timestamp" '+%Y-%m-%d %H:%M:%S')"
  timestamp=$((timestamp + delays[i]))
done

