#!/bin/bash

# Deploy Cognito authentication stack for admin panel
# This script deploys AWS Cognito user pool and identity pool for secure admin authentication

set -e

echo "🔐 Deploying Cognito Authentication Stack..."
echo "=========================================="

# Load environment variables (look in project root)
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
elif [ -f ../.env ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
else
    echo "⚠️  .env file not found. Make sure to run from project root directory."
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured. Please run 'aws configure' or set AWS_PROFILE"
    echo "💡 Your AWS_PROFILE is set to: ${AWS_PROFILE:-not set}"
    exit 1
fi

# Get account info
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION="us-east-1"

echo "📋 Account: $ACCOUNT_ID"
echo "📍 Region: $REGION"
echo ""

# Navigate to CDK directory
cd "$(dirname "$0")/../cdk"

# Deploy the Cognito stack
echo "🚀 Deploying VTT-Cognito stack..."
npx cdk deploy VTT-Cognito \
    --require-approval never \
    --outputs-file cognito-outputs.json

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Cognito stack deployed successfully!"
    echo ""
    
    # Extract outputs and show next steps
    if [ -f "cognito-outputs.json" ]; then
        echo "📝 Cognito Configuration:"
        echo "========================"
        
        USER_POOL_ID=$(jq -r '.["VTT-Cognito"].UserPoolId // empty' cognito-outputs.json)
        CLIENT_ID=$(jq -r '.["VTT-Cognito"].UserPoolClientId // empty' cognito-outputs.json)
        IDENTITY_POOL_ID=$(jq -r '.["VTT-Cognito"].IdentityPoolId // empty' cognito-outputs.json)
        HOSTED_UI_URL=$(jq -r '.["VTT-Cognito"].CognitoHostedUIURL // empty' cognito-outputs.json)
        
        if [ ! -z "$USER_POOL_ID" ]; then
            echo "User Pool ID: $USER_POOL_ID"
            echo "Client ID: $CLIENT_ID"
            echo "Identity Pool ID: $IDENTITY_POOL_ID"
            echo ""
            echo "🔗 Hosted UI URL: $HOSTED_UI_URL"
            echo ""
            
            echo "📋 Next steps:"
            echo "1. Add these values to your .env file:"
            echo "   NEXT_PUBLIC_COGNITO_USER_POOL_ID=$USER_POOL_ID"
            echo "   NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=$CLIENT_ID"
            echo "   NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=$IDENTITY_POOL_ID"
            echo "   NEXT_PUBLIC_COGNITO_DOMAIN=$USER_POOL_ID.auth.$REGION.amazoncognito.com"
            echo ""
            echo "2. Create an admin user:"
            echo "   aws cognito-idp admin-create-user \\"
            echo "     --user-pool-id $USER_POOL_ID \\"
            echo "     --username admin \\"
            echo "     --user-attributes Name=email,Value=your-email@example.com \\"
            echo "     --temporary-password TempPass123! \\"
            echo "     --message-action SUPPRESS"
            echo ""
            echo "3. Set permanent password:"
            echo "   aws cognito-idp admin-set-user-password \\"
            echo "     --user-pool-id $USER_POOL_ID \\"
            echo "     --username admin \\"
            echo "     --password YourSecurePassword123! \\"
            echo "     --permanent"
        fi
    else
        echo "⚠️  Could not find output file. Check the AWS console for Cognito resources."
    fi
else
    echo ""
    echo "❌ Failed to deploy Cognito stack!"
    exit 1
fi

echo ""
echo "🎉 Cognito deployment complete!"
echo "You can now use secure authentication for the admin panel."