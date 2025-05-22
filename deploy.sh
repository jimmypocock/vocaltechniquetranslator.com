#!/bin/bash
set -e

echo "🚀 Deploying Vocal Technique Translator to AWS..."

# Load environment variables if .env exists
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Extract profile from arguments if provided
PROFILE_ARG=""
for arg in "$@"; do
    if [[ $arg == "--profile" ]]; then
        NEXT_IS_PROFILE=true
    elif [[ $NEXT_IS_PROFILE == true ]]; then
        PROFILE_ARG="--profile $arg"
        export AWS_PROFILE=$arg
        NEXT_IS_PROFILE=false
    fi
done

# Check if AWS CLI is configured
if ! aws sts get-caller-identity $PROFILE_ARG &> /dev/null; then
    echo "❌ AWS CLI is not configured or no credentials found."
    echo ""
    echo "If using AWS SSO:"
    echo "  1. Login: aws sso login --profile your-profile-name"
    echo "  2. Export: export AWS_PROFILE=your-profile-name"
    echo "  3. Or pass profile to this script: npm run deploy -- --profile your-profile-name"
    echo ""
    echo "If using standard credentials:"
    echo "  Run: aws configure"
    exit 1
fi

# Show which AWS account/profile is being used
echo "📋 Using AWS Account: $(aws sts get-caller-identity $PROFILE_ARG --query Account --output text)"
echo "👤 Profile: ${AWS_PROFILE:-default}"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build TypeScript
echo "🔨 Building CDK app..."
npm run build

# Bootstrap CDK if needed (only required once per account/region)
echo "🔧 Checking CDK bootstrap status..."
if ! aws cloudformation describe-stacks --stack-name CDKToolkit --region us-east-1 $PROFILE_ARG &> /dev/null; then
    echo "📋 Bootstrapping CDK..."
    npx cdk bootstrap aws://$(aws sts get-caller-identity $PROFILE_ARG --query Account --output text)/us-east-1 $PROFILE_ARG
fi

# Deploy the stack
echo "☁️  Deploying stack..."

# Check if certificate ARN is available from .env
if [ -n "$CERTIFICATE_ARN" ] && [[ ! "$*" =~ "certificateArn" ]] && [[ ! "$*" =~ "createCertificate" ]]; then
    echo "📜 Using certificate from .env: $CERTIFICATE_ARN"
    CERT_ARG="-c certificateArn=$CERTIFICATE_ARN"
fi

# Pass through any additional arguments (like -c createCertificate=true)
if [ $# -eq 0 ]; then
    npx cdk deploy --all --require-approval never $CERT_ARG
else
    npx cdk deploy --all --require-approval never "$@" $CERT_ARG
fi

echo "✅ Deployment complete!"

# Only show next steps if no certificate argument was provided
if [[ ! "$*" =~ "certificateArn" ]] && [[ ! "$*" =~ "createCertificate" ]]; then
    echo ""
    echo "Next steps:"
    echo "1. Create certificate: ./deploy.sh -c createCertificate=true"
    echo "2. Add DNS validation records from CloudFormation outputs"
    echo "3. Update Route 53 (or your DNS provider) to point to the CloudFront distribution"
fi