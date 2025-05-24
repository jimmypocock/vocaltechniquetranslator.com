#!/bin/bash
set -e

echo "🏗️  Deploying Foundation Stack (S3 Buckets)..."
echo "⚠️  This stack has termination protection enabled"

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

# Deploy foundation stack
echo "☁️  Deploying foundation resources..."
npx cdk deploy VTT-Foundation --require-approval never "$@"

cd ..

echo "✅ Foundation deployment complete!"
echo ""
echo "📋 Created resources:"
echo "   - Content bucket for website files"
echo "   - Logs bucket for CloudFront logs"
echo ""
echo "⚠️  These buckets have RETAIN policy - they won't be deleted with the stack"