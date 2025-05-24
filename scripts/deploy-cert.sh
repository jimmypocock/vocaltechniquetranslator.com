#!/bin/bash
set -e

echo "🔐 Deploying Certificate Stack..."

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

# Deploy only the certificate stack
echo "☁️  Deploying certificate..."
npx cdk deploy VTT-Certificate --require-approval never "$@"

cd ..

echo "✅ Certificate deployment complete!"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Go to AWS Certificate Manager in the AWS Console"
echo "2. Find your certificate and copy the CNAME validation records"
echo "3. Add these CNAME records to your DNS provider"
echo "4. Wait for validation (5-30 minutes)"
echo "5. Run 'npm run status' to check when the stack is ready"
echo "6. Once validated, run 'npm run deploy:all' to deploy the application"