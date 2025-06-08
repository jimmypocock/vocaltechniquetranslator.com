#!/bin/bash

# Feedback CLI - Interactive feedback management tool

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

function show_menu() {
    clear
    echo -e "${BLUE}📊 VTT Feedback Manager${NC}"
    echo "========================"
    echo ""
    echo "1) Quick Export to CSV"
    echo "2) Export with Analysis"
    echo "3) Export JSON Only"
    echo "4) Open Web Viewer"
    echo "5) Deploy Feedback Infrastructure"
    echo "6) Show Recent Feedback (Last 10)"
    echo "7) Search Feedback by Word"
    echo "8) Exit"
    echo ""
    echo -n "Select an option: "
}

function quick_export() {
    echo -e "${YELLOW}📥 Exporting feedback to CSV...${NC}"
    "$SCRIPT_DIR/export-feedback.sh"
    echo ""
    echo "Press any key to return to menu..."
    read -n 1
}

function export_with_analysis() {
    echo -e "${YELLOW}📊 Exporting with analysis...${NC}"
    python3 "$SCRIPT_DIR/analyze-feedback.py" --analyze
    echo ""
    echo "Press any key to return to menu..."
    read -n 1
}

function export_json() {
    echo -e "${YELLOW}📄 Exporting to JSON...${NC}"
    python3 "$SCRIPT_DIR/analyze-feedback.py" --format json
    echo ""
    echo "Press any key to return to menu..."
    read -n 1
}

function open_viewer() {
    echo -e "${YELLOW}🌐 Opening web viewer...${NC}"
    open "$SCRIPT_DIR/feedback-viewer.html"
    echo ""
    echo "Web viewer opened in your browser."
    echo "Drag and drop a JSON export file to view feedback."
    echo ""
    echo "Press any key to return to menu..."
    read -n 1
}

function deploy_infrastructure() {
    echo -e "${YELLOW}🚀 Deploying feedback infrastructure...${NC}"
    "$SCRIPT_DIR/deploy-feedback.sh"
    echo ""
    echo "Press any key to return to menu..."
    read -n 1
}

function show_recent() {
    echo -e "${YELLOW}📋 Recent Feedback (Last 10)${NC}"
    echo "========================"
    
    # Get bucket name
    BUCKET_NAME=$(aws cloudformation describe-stacks \
        --stack-name VTT-Feedback \
        --query "Stacks[0].Outputs[?OutputKey=='FeedbackBucketName'].OutputValue" \
        --output text 2>/dev/null || echo "")
    
    if [ -z "$BUCKET_NAME" ]; then
        echo -e "${RED}❌ Feedback infrastructure not deployed${NC}"
        echo "Run option 5 to deploy the feedback system."
    else
        # List last 10 files
        echo "Fetching recent feedback..."
        RECENT_FILES=$(aws s3api list-objects-v2 \
            --bucket "$BUCKET_NAME" \
            --prefix "feedback/" \
            --query "sort_by(Contents[?ends_with(Key, '.json')], &LastModified)[-10:].Key" \
            --output text)
        
        if [ -z "$RECENT_FILES" ]; then
            echo "No feedback found."
        else
            # Display each feedback item
            for key in $RECENT_FILES; do
                echo -e "\n${BLUE}File: $key${NC}"
                aws s3 cp "s3://$BUCKET_NAME/$key" - 2>/dev/null | jq -r '
                    "Date: \(.submittedAt // .timestamp)
Original: \(.originalWord)
Current: \(.currentTransformation)
Suggested: \(.suggestedTransformation)
Intensity: \(.intensity)
Reason: \(.reason // "N/A")"
                ' || echo "Error reading file"
                echo "---"
            done
        fi
    fi
    
    echo ""
    echo "Press any key to return to menu..."
    read -n 1
}

function search_feedback() {
    echo -n "Enter word to search for: "
    read search_word
    
    if [ -z "$search_word" ]; then
        echo "No search term provided."
        return
    fi
    
    echo -e "${YELLOW}🔍 Searching for '$search_word'...${NC}"
    
    # Create temp directory
    TEMP_DIR=$(mktemp -d)
    
    # Get bucket name
    BUCKET_NAME=$(aws cloudformation describe-stacks \
        --stack-name VTT-Feedback \
        --query "Stacks[0].Outputs[?OutputKey=='FeedbackBucketName'].OutputValue" \
        --output text 2>/dev/null || echo "")
    
    if [ -z "$BUCKET_NAME" ]; then
        echo -e "${RED}❌ Feedback infrastructure not deployed${NC}"
    else
        # Download all feedback
        aws s3 sync "s3://$BUCKET_NAME/feedback/" "$TEMP_DIR" --exclude "*" --include "*.json" >/dev/null 2>&1
        
        # Search in files
        echo -e "\n${GREEN}Results:${NC}"
        grep -l -i "$search_word" "$TEMP_DIR"/*.json 2>/dev/null | while read -r file; do
            jq -r --arg word "$search_word" '
                select(
                    (.originalWord // "" | test($word; "i")) or
                    (.currentTransformation // "" | test($word; "i")) or
                    (.suggestedTransformation // "" | test($word; "i"))
                ) |
                "Date: \(.submittedAt // .timestamp)
Original: \(.originalWord)
Current: \(.currentTransformation)
Suggested: \(.suggestedTransformation)
Intensity: \(.intensity)
---"
            ' "$file" 2>/dev/null
        done || echo "No matches found."
    fi
    
    # Cleanup
    rm -rf "$TEMP_DIR"
    
    echo ""
    echo "Press any key to return to menu..."
    read -n 1
}

# Main loop
while true; do
    show_menu
    read -r choice
    
    case $choice in
        1) quick_export ;;
        2) export_with_analysis ;;
        3) export_json ;;
        4) open_viewer ;;
        5) deploy_infrastructure ;;
        6) show_recent ;;
        7) search_feedback ;;
        8) echo "Goodbye!"; exit 0 ;;
        *) echo -e "${RED}Invalid option${NC}"; sleep 1 ;;
    esac
done