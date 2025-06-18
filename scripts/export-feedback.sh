#!/bin/bash

# Export Feedback from S3 to CSV
# This script downloads all feedback from S3 and converts to CSV

set -e

echo "📥 Exporting Feedback from S3..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Create export directory
EXPORT_DIR="$PROJECT_ROOT/feedback-exports"
mkdir -p "$EXPORT_DIR"

# Get bucket name from CloudFormation or use environment variable
if [ -z "$FEEDBACK_BUCKET_NAME" ]; then
    echo "🔍 Looking up feedback bucket name..."
    FEEDBACK_BUCKET_NAME=$(aws cloudformation describe-stacks \
        --stack-name VTT-Feedback \
        --query "Stacks[0].Outputs[?OutputKey=='FeedbackBucketName'].OutputValue" \
        --output text 2>/dev/null || echo "")
fi

if [ -z "$FEEDBACK_BUCKET_NAME" ]; then
    echo -e "${RED}❌ Could not find feedback bucket. Please set FEEDBACK_BUCKET_NAME environment variable${NC}"
    exit 1
fi

echo "📦 Using bucket: $FEEDBACK_BUCKET_NAME"

# Create temp directory for JSON files
TEMP_DIR=$(mktemp -d)
echo "📁 Downloading feedback to temp directory..."

# Download all feedback files
aws s3 sync "s3://$FEEDBACK_BUCKET_NAME/feedback/" "$TEMP_DIR" --exclude "*" --include "*.json"

# Count files
FILE_COUNT=$(find "$TEMP_DIR" -name "*.json" | wc -l | tr -d ' ')
echo "📊 Found $FILE_COUNT feedback files"

if [ "$FILE_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No feedback files found${NC}"
    rm -rf "$TEMP_DIR"
    exit 0
fi

# Create CSV file with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
CSV_FILE="$EXPORT_DIR/feedback_export_${TIMESTAMP}.csv"

# Create CSV header
echo "Timestamp,Original,Current,Suggested,Intensity,Context,Reason,ID,User Agent,IP" > "$CSV_FILE"

# Process each JSON file and append to CSV
echo "🔄 Converting to CSV..."
find "$TEMP_DIR" -name "*.json" -type f | while read -r json_file; do
    # Use jq to parse JSON and format as CSV
    jq -r '[
        .submittedAt // .timestamp,
        .originalWord,
        .currentTransformation,
        .suggestedTransformation,
        .intensity,
        .context,
        .reason // "",
        .id,
        .userAgent // "",
        .ip // ""
    ] | @csv' "$json_file" >> "$CSV_FILE" 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Warning: Could not parse $json_file${NC}"
    }
done

# Clean up temp directory
rm -rf "$TEMP_DIR"

# Create summary JSON file
SUMMARY_FILE="$EXPORT_DIR/feedback_summary_${TIMESTAMP}.json"
echo "📈 Creating summary..."

# Download and merge all JSON files into one
aws s3 sync "s3://$FEEDBACK_BUCKET_NAME/feedback/" "$TEMP_DIR" --exclude "*" --include "*.json" >/dev/null 2>&1
jq -s '.' "$TEMP_DIR"/**/*.json > "$SUMMARY_FILE" 2>/dev/null || echo "[]" > "$SUMMARY_FILE"
rm -rf "$TEMP_DIR"

echo -e "${GREEN}✅ Export complete!${NC}"
echo ""
echo "📁 Files created:"
echo "   CSV: $CSV_FILE"
echo "   JSON: $SUMMARY_FILE"
echo ""
echo "📊 Total feedback entries: $FILE_COUNT"

# Open the directory (macOS specific)
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$EXPORT_DIR"
fi