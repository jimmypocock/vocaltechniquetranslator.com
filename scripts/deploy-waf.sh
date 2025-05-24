#!/bin/bash
set -e

echo "🛡️  Deploying WAF Stack..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured. Please run 'aws configure' or set AWS_PROFILE"
    exit 1
fi

# Build CDK if needed
cd cdk
if [ ! -d "node_modules" ]; then
    npm install
fi
rm -f lib/*.d.ts lib/*.js
npm run build

# Deploy only the WAF stack
echo "☁️  Deploying WAF rules..."
npx cdk deploy VTT-WAF --require-approval never "$@"

cd ..

echo "✅ WAF deployment complete!"