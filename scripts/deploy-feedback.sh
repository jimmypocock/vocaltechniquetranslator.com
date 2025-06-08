#!/bin/bash

# Deploy Feedback Infrastructure
# This creates S3 bucket and API Gateway + Lambda for feedback collection

set -e

echo "🚀 Deploying Feedback Infrastructure..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Change to CDK directory
cd "$PROJECT_ROOT/cdk"

# Check if AWS credentials are configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    echo "Please configure AWS credentials before running this script"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing CDK dependencies..."
    npm install
fi

# Deploy Feedback Stack (S3 bucket)
echo -e "${YELLOW}📦 Deploying Feedback Storage Stack...${NC}"
npx cdk deploy VTT-Feedback --require-approval never

# Deploy Feedback API Stack (API Gateway + Lambda)
echo -e "${YELLOW}🔌 Deploying Feedback API Stack...${NC}"
npx cdk deploy VTT-FeedbackAPI --require-approval never

# Get the API endpoint from stack outputs
API_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name VTT-FeedbackAPI \
    --query "Stacks[0].Outputs[?OutputKey=='FeedbackApiEndpoint'].OutputValue" \
    --output text)

echo -e "${GREEN}✅ Feedback infrastructure deployed successfully!${NC}"
echo ""
echo "📝 Next steps:"
echo "1. Add this to your .env file:"
echo "   NEXT_PUBLIC_FEEDBACK_API_ENDPOINT=${API_ENDPOINT}"
echo ""
echo "2. Deploy your application with:"
echo "   npm run build && ./scripts/deploy-app-content.sh"
echo ""
echo "3. Test feedback submission on your site"
echo ""
echo "API Endpoint: ${API_ENDPOINT}"