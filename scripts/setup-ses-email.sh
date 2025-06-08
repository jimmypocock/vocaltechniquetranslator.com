#!/bin/bash

# Setup SES email notifications for feedback
# This script verifies an email address for use with SES

set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
elif [ -f ../.env ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

# Check if email is provided
if [ -z "$1" ]; then
    echo "❌ Please provide an email address"
    echo "Usage: $0 your-email@example.com"
    exit 1
fi

EMAIL="$1"
REGION="us-east-1"

echo "📧 Setting up SES email notifications..."
echo "Email: $EMAIL"
echo "Region: $REGION"
echo ""

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured. Please run 'aws configure' or set AWS_PROFILE"
    exit 1
fi

# Verify the email address
echo "🔍 Verifying email address..."
aws ses verify-email-identity --email-address "$EMAIL" --region "$REGION"

if [ $? -eq 0 ]; then
    echo "✅ Email verification request sent!"
    echo ""
    echo "📬 Next Steps:"
    echo "1. Check your inbox for '$EMAIL'"
    echo "2. Click the verification link in the email from AWS"
    echo "3. Once verified, add this to your deployment:"
    echo ""
    echo "   npx cdk deploy VTT-FeedbackAPI --context notificationEmail=$EMAIL"
    echo ""
    echo "⚠️  Note: You must verify the email before deploying the feedback API"
    echo "   or email notifications will fail silently."
    echo ""
    echo "🔍 To check verification status:"
    echo "   aws ses get-identity-verification-attributes --identities $EMAIL --region $REGION"
else
    echo "❌ Failed to send verification email"
    exit 1
fi

echo ""
echo "🎉 Email setup initiated successfully!"