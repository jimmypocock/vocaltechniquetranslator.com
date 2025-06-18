#!/bin/bash

# E2E Test Runner for Local Development
# This script ensures the dev server is running before executing E2E tests

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧪 E2E Test Runner${NC}"
echo "================================"

# Check if dev server is running
if ! lsof -i :3000 | grep -q LISTEN; then
    echo -e "${YELLOW}⚡ Starting development server...${NC}"
    npm run dev &
    DEV_PID=$!
    
    # Wait for server to be ready
    echo -e "${YELLOW}⏳ Waiting for server to be ready...${NC}"
    while ! curl -s http://localhost:3000 > /dev/null; do
        sleep 1
    done
    echo -e "${GREEN}✅ Development server is ready!${NC}"
    
    # Run tests
    echo -e "${YELLOW}🎭 Running E2E tests...${NC}"
    npm run test:e2e "$@"
    TEST_EXIT_CODE=$?
    
    # Kill dev server
    echo -e "${YELLOW}🛑 Stopping development server...${NC}"
    kill $DEV_PID 2>/dev/null || true
    
    exit $TEST_EXIT_CODE
else
    echo -e "${GREEN}✅ Development server is already running${NC}"
    echo -e "${YELLOW}🎭 Running E2E tests...${NC}"
    npm run test:e2e "$@"
fi