#!/bin/bash

# Setup script for GitHub Actions OIDC with AWS
# This script creates the necessary OIDC provider and IAM role for secure GitHub Actions deployments

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Get AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
if [ -z "$ACCOUNT_ID" ]; then
    print_error "Failed to get AWS account ID. Please configure AWS CLI credentials."
    exit 1
fi

print_status "AWS Account ID: $ACCOUNT_ID"

# Get GitHub username and repository name
read -p "Enter your GitHub username: " GITHUB_USERNAME
read -p "Enter your repository name (default: vocaltechniquetranslator.com): " REPO_NAME
REPO_NAME=${REPO_NAME:-vocaltechniquetranslator.com}

print_status "GitHub repository: $GITHUB_USERNAME/$REPO_NAME"

# OIDC Provider URL and audience
OIDC_URL="https://token.actions.githubusercontent.com"
OIDC_AUDIENCE="sts.amazonaws.com"

# Check if OIDC provider already exists
print_status "Checking for existing OIDC provider..."
EXISTING_PROVIDER=$(aws iam list-open-id-connect-providers --query "OpenIDConnectProviderList[?contains(Arn, 'token.actions.githubusercontent.com')].Arn" --output text)

if [ -n "$EXISTING_PROVIDER" ]; then
    print_warning "OIDC provider already exists: $EXISTING_PROVIDER"
    OIDC_PROVIDER_ARN=$EXISTING_PROVIDER
else
    print_status "Creating OIDC provider..."
    OIDC_PROVIDER_ARN=$(aws iam create-open-id-connect-provider \
        --url $OIDC_URL \
        --client-id-list $OIDC_AUDIENCE \
        --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1 1c58a3a8518e8759bf075b76b750d4f2df264fcd \
        --query OpenIDConnectProviderArn \
        --output text)
    print_status "Created OIDC provider: $OIDC_PROVIDER_ARN"
fi

# Create trust policy
print_status "Creating trust policy..."
TRUST_POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "$OIDC_PROVIDER_ARN"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:$GITHUB_USERNAME/$REPO_NAME:*"
        }
      }
    }
  ]
}
EOF
)

# Save trust policy to temporary file
TEMP_FILE=$(mktemp)
echo "$TRUST_POLICY" > "$TEMP_FILE"

# IAM Role name
ROLE_NAME="GitHubActionsVTTDeploy"

# Check if role already exists
if aws iam get-role --role-name $ROLE_NAME &> /dev/null; then
    print_warning "Role $ROLE_NAME already exists. Updating trust policy..."
    aws iam update-assume-role-policy \
        --role-name $ROLE_NAME \
        --policy-document file://"$TEMP_FILE"
    print_status "Updated trust policy for role $ROLE_NAME"
else
    print_status "Creating IAM role..."
    aws iam create-role \
        --role-name $ROLE_NAME \
        --assume-role-policy-document file://"$TEMP_FILE" \
        --description "Role for GitHub Actions to deploy Vocal Technique Translator"
    print_status "Created IAM role: $ROLE_NAME"
fi

# Create deployment policy
print_status "Creating deployment policy..."
DEPLOY_POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:*",
        "s3:*",
        "cloudfront:*",
        "route53:*",
        "acm:*",
        "lambda:*",
        "apigateway:*",
        "cognito-idp:*",
        "wafv2:*",
        "cloudwatch:*",
        "logs:*",
        "iam:GetRole",
        "iam:PassRole",
        "iam:CreateServiceLinkedRole",
        "iam:DeleteServiceLinkedRole",
        "iam:GetServiceLinkedRoleDeletionStatus"
      ],
      "Resource": "*"
    }
  ]
}
EOF
)

# Save deployment policy to temporary file
DEPLOY_TEMP_FILE=$(mktemp)
echo "$DEPLOY_POLICY" > "$DEPLOY_TEMP_FILE"

# Attach policies to role
print_status "Attaching policies to role..."

# Check if custom policy exists and update/create it
POLICY_NAME="VTTDeployPolicy"
if aws iam get-role-policy --role-name $ROLE_NAME --policy-name $POLICY_NAME &> /dev/null; then
    print_status "Updating existing deployment policy..."
    aws iam put-role-policy \
        --role-name $ROLE_NAME \
        --policy-name $POLICY_NAME \
        --policy-document file://"$DEPLOY_TEMP_FILE"
else
    print_status "Creating deployment policy..."
    aws iam put-role-policy \
        --role-name $ROLE_NAME \
        --policy-name $POLICY_NAME \
        --policy-document file://"$DEPLOY_TEMP_FILE"
fi

# Clean up temporary files
rm -f "$TEMP_FILE" "$DEPLOY_TEMP_FILE"

# Get role ARN
ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query Role.Arn --output text)

print_status "Setup complete!"
echo ""
echo "========================================="
echo "GitHub Actions Secrets to Configure:"
echo "========================================="
echo ""
echo "Add these secrets to your GitHub repository:"
echo "Settings → Secrets and variables → Actions"
echo ""
echo "AWS_ROLE_ARN=$ROLE_ARN"
echo "AWS_REGION=us-east-1"
echo ""
echo "========================================="
echo "Example GitHub Actions Workflow:"
echo "========================================="
echo ""
cat <<'WORKFLOW'
name: Deploy to AWS
on:
  push:
    branches: [main]

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ secrets.AWS_REGION }}
      
      - name: Deploy
        run: npm run deploy:app
WORKFLOW
echo ""
echo "========================================="

print_status "Next steps:"
echo "1. Add the AWS_ROLE_ARN secret to your GitHub repository"
echo "2. Create or update your GitHub Actions workflow"
echo "3. Test the deployment with a push to main branch"