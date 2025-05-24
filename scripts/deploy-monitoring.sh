#!/bin/bash
set -e

echo "📊 Deploying Monitoring Stack..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured. Please run 'aws configure' or set AWS_PROFILE"
    exit 1
fi

# Get notification email
NOTIFICATION_EMAIL=""
for arg in "$@"; do
    if [[ $arg == -c ]] || [[ $arg == --context ]]; then
        NEXT_IS_CONTEXT=true
    elif [[ $NEXT_IS_CONTEXT == true ]]; then
        if [[ $arg == notificationEmail=* ]]; then
            NOTIFICATION_EMAIL=$(echo $arg | cut -d'=' -f2)
        fi
        NEXT_IS_CONTEXT=false
    fi
done

if [ -z "$NOTIFICATION_EMAIL" ]; then
    echo "⚠️  No notification email provided"
    echo "Usage: npm run deploy:monitoring -- -c notificationEmail=your-email@example.com"
    echo "Continuing without email notifications..."
fi

# Build CDK if needed
cd cdk
if [ ! -d "node_modules" ]; then
    npm install
fi
rm -f lib/*.d.ts lib/*.js
npm run build

# Deploy only the monitoring stack
echo "☁️  Deploying monitoring..."
if [ -n "$NOTIFICATION_EMAIL" ]; then
    npx cdk deploy VTT-Monitoring --require-approval never -c notificationEmail=$NOTIFICATION_EMAIL "$@"
else
    npx cdk deploy VTT-Monitoring --require-approval never "$@"
fi

cd ..

echo "✅ Monitoring deployment complete!"

if [ -n "$NOTIFICATION_EMAIL" ]; then
    echo ""
    echo "📧 IMPORTANT: Check your email ($NOTIFICATION_EMAIL) for SNS subscription confirmation"
    echo "   You must confirm the subscription to receive alerts!"
fi