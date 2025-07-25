#!/bin/bash
# Script to run and summarize Postman tests

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PARENT_DIR="$(dirname "$DIR")"

# Run the Postman tests and capture the output
echo "Running Postman tests..."
TEST_OUTPUT=$(cd "$PARENT_DIR" && npm run test:postman 2>&1)

# Count successful API calls (200, 201, 204 responses)
SUCCESS_COUNT=$(echo "$TEST_OUTPUT" | grep -c "\[200 OK\|\[201 Created\|\[204 No Content")

# Count total API calls
TOTAL_CALLS=$(echo "$TEST_OUTPUT" | grep -c "\[[0-9]")

# Count failed API calls
FAILED_CALLS=$((TOTAL_CALLS - SUCCESS_COUNT))

# Count assertion failures
ASSERTION_FAILURES=$(echo "$TEST_OUTPUT" | grep -c "AssertionError")

# Display a summary
echo ""
echo "================ Postman Test Summary ================"
echo "API Endpoints:"
echo "  Total API Calls: $TOTAL_CALLS"
echo "  Successful Responses (200, 201, 204): $SUCCESS_COUNT"
echo "  Failed Responses: $FAILED_CALLS"
echo ""
echo "Test Assertions:"
echo "  Failed Assertions: $ASSERTION_FAILURES"
echo ""

# Check if there are any failures
if [ "$ASSERTION_FAILURES" -gt 0 ]; then
    echo "Failed Tests Summary:"
    
    # Extract specific error messages
    echo "$TEST_OUTPUT" | grep -A 1 "AssertionError" | grep -v "at assertion" | sort | uniq
    
    echo ""
    echo "Implementation status: Some tests are failing."
    echo "For detailed information, run: npm run test:postman"
else
    echo "All API endpoints responded successfully!"
    
    if [ "$FAILED_CALLS" -gt 0 ]; then
        echo "However, some endpoints returned non-success status codes."
        echo "Check the implementation plan document for next steps."
    else
        echo "Implementation status: All required endpoints are working correctly."
    fi
fi

echo "=================================================="
