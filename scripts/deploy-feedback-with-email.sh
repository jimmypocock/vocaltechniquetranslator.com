#!/bin/bash

# Deploy feedback system with email notifications
# This script deploys both S3 storage and API with email alerts

set -e

echo "📧 Deploying Feedback System with Email Notifications..."
echo "======================================================="

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
elif [ -f ../.env ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

# Check if email is provided
if [ -z "$1" ]; then
    echo "❌ Please provide your notification email address"
    echo "Usage: $0 your-email@example.com"
    echo ""
    echo "This email will receive notifications when new feedback is submitted."
    exit 1
fi

NOTIFICATION_EMAIL="$1"

echo "📧 Notification Email: $NOTIFICATION_EMAIL"
echo ""

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured. Please run 'aws configure' or set AWS_PROFILE"
    exit 1
fi

# Verify email first
echo "🔍 Checking if email is verified with SES..."
VERIFICATION_STATUS=$(aws ses get-identity-verification-attributes --identities "$NOTIFICATION_EMAIL" --region us-east-1 --query "VerificationAttributes.\"$NOTIFICATION_EMAIL\".VerificationStatus" --output text 2>/dev/null || echo "NotFound")

if [ "$VERIFICATION_STATUS" != "Success" ]; then
    echo "⚠️  Email is not verified with SES yet."
    echo ""
    echo "Setting up email verification..."
    ./scripts/setup-ses-email.sh "$NOTIFICATION_EMAIL"
    echo ""
    echo "❌ Please verify your email first, then run this script again."
    echo "   Check your inbox for a verification email from AWS."
    exit 1
fi

echo "✅ Email is verified with SES"
echo ""

# Navigate to CDK directory
cd "$(dirname "$0")/../cdk"

# Deploy feedback storage first
echo "🗄️  Deploying feedback storage..."
npx cdk deploy VTT-Feedback --require-approval never

# Deploy feedback API with email notifications
echo "📡 Deploying feedback API with email notifications..."
npx cdk deploy VTT-FeedbackAPI \
    --require-approval never \
    --context notificationEmail="$NOTIFICATION_EMAIL" \
    --outputs-file feedback-api-outputs.json

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Feedback system with email notifications deployed successfully!"
    echo ""
    
    # Extract API endpoint
    if [ -f "feedback-api-outputs.json" ]; then
        API_ENDPOINT=$(jq -r '.["VTT-FeedbackAPI"].FeedbackApiEndpoint // empty' feedback-api-outputs.json)
        
        if [ ! -z "$API_ENDPOINT" ]; then
            echo "📋 Configuration:"
            echo "==============="
            echo "API Endpoint: $API_ENDPOINT"
            echo "Notification Email: $NOTIFICATION_EMAIL"
            echo ""
            echo "📝 Add this to your .env file:"
            echo "NEXT_PUBLIC_FEEDBACK_API_ENDPOINT=$API_ENDPOINT"
            echo ""
            echo "📧 Email notifications will be sent to: $NOTIFICATION_EMAIL"
        fi
    fi
    
    echo ""
    echo "🎉 Setup complete! You'll now receive email notifications for new feedback."
else
    echo ""
    echo "❌ Failed to deploy feedback system!"
    exit 1
fi