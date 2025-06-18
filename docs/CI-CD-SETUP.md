# CI/CD Pipeline Setup Guide for GitHub Actions

This guide walks you through setting up the automated testing and deployment pipeline for the Vocal Technique Translator app using AWS best practices.

## Prerequisites

- GitHub repository for your project
- AWS account with appropriate permissions
- AWS CLI configured with credentials (for initial setup only)
- (Optional) Codecov account for coverage reports

## Step 1: Enable GitHub Actions

1. Go to your GitHub repository
2. Click on the **Actions** tab
3. If Actions are not enabled, click **Enable Actions**

## Step 2: Set Up AWS OIDC Provider (One-time Setup)

GitHub Actions can securely authenticate with AWS using OpenID Connect (OIDC), eliminating the need for long-term access keys.

### Create OIDC Identity Provider in AWS

1. **Via AWS Console**:
   - Go to IAM → Identity providers → Add provider
   - Provider type: OpenID Connect
   - Provider URL: `https://token.actions.githubusercontent.com`
   - Audience: `sts.amazonaws.com`
   - Click "Add provider"

2. **Via AWS CLI**:
   ```bash
   aws iam create-open-id-connect-provider \
     --url https://token.actions.githubusercontent.com \
     --client-id-list sts.amazonaws.com \
     --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1 1c58a3a8518e8759bf075b76b750d4f2df264fcd
   ```

## Step 3: Create IAM Role for GitHub Actions

### Create Trust Policy

Create a file `github-actions-trust-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_USERNAME/vocaltechniquetranslator.com:*"
        }
      }
    }
  ]
}
```

Replace `YOUR_ACCOUNT_ID` and `YOUR_GITHUB_USERNAME` with your actual values.

### Create the IAM Role

```bash
# Create the role
aws iam create-role \
  --role-name GitHubActionsVTTDeploy \
  --assume-role-policy-document file://github-actions-trust-policy.json

# Attach necessary policies (example for S3 and CloudFront)
aws iam attach-role-policy \
  --role-name GitHubActionsVTTDeploy \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

aws iam attach-role-policy \
  --role-name GitHubActionsVTTDeploy \
  --policy-arn arn:aws:iam::aws:policy/CloudFrontFullAccess
```

### Create Custom Policy for CDK Deployments

Create a file `vtt-deploy-policy.json`:

```json
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
        "iam:*"
      ],
      "Resource": "*"
    }
  ]
}
```

Apply the policy:

```bash
aws iam put-role-policy \
  --role-name GitHubActionsVTTDeploy \
  --policy-name VTTDeployPolicy \
  --policy-document file://vtt-deploy-policy.json
```

## Step 4: Add Repository Secrets

Navigate to **Settings** → **Secrets and variables** → **Actions** and add the following secrets:

### Required Secrets

1. **NEXT_PUBLIC_GA_ID**
   - Your Google Analytics ID
   - Format: `G-XXXXXXXXXX`

2. **NEXT_PUBLIC_ADSENSE_PUB_ID**
   - Your Google AdSense Publisher ID
   - Format: `ca-pub-XXXXXXXXXXXXXXXX`

3. **AWS_ROLE_ARN**
   - The ARN of the IAM role created above
   - Format: `arn:aws:iam::YOUR_ACCOUNT_ID:role/GitHubActionsVTTDeploy`

4. **AWS_REGION**
   - Your AWS region (e.g., `us-east-1`)

### Optional Secrets

5. **AWS_CERTIFICATE_ARN**
   - ARN of your ACM certificate
   - Created during initial CDK deployment
   - Format: `arn:aws:acm:us-east-1:XXXXXXXXXXXX:certificate/...`

6. **CODECOV_TOKEN** (optional)
   - Sign up at https://codecov.io
   - Add your repository
   - Copy the upload token

7. **FEEDBACK_ADMIN_SECRET** (if using feedback system)
   - Generate a secure secret for admin access
   - Example: `openssl rand -base64 32`

## Step 5: Update GitHub Actions Workflow

Update your `.github/workflows/deploy.yml` to use OIDC:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  id-token: write  # Required for OIDC
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
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build Next.js app
        run: npm run build
        env:
          NEXT_PUBLIC_GA_ID: ${{ secrets.NEXT_PUBLIC_GA_ID }}
          NEXT_PUBLIC_ADSENSE_PUB_ID: ${{ secrets.NEXT_PUBLIC_ADSENSE_PUB_ID }}
      
      - name: Deploy to AWS
        run: npm run deploy:app
        env:
          AWS_CERTIFICATE_ARN: ${{ secrets.AWS_CERTIFICATE_ARN }}
```

## Step 6: Configure Branch Protection (Recommended)

1. Go to **Settings** → **Branches**
2. Add a branch protection rule for `main`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
4. Add these required status checks:
   - `unit-tests`
   - `e2e-tests / E2E Tests - chromium`
   - `test-summary`

## Step 7: Test the Pipeline

1. Create a new branch:
   ```bash
   git checkout -b test-ci-pipeline
   ```

2. Make a small change (e.g., update README)

3. Commit and push:
   ```bash
   git add .
   git commit -m "Test CI pipeline"
   git push origin test-ci-pipeline
   ```

4. Create a Pull Request

5. Watch the Actions tab to see tests running

## Security Best Practices

### Why OIDC?
- **No long-term credentials**: Temporary credentials are generated for each workflow run
- **Automatic rotation**: Credentials expire after the workflow completes
- **Fine-grained access**: Restrict which repositories and branches can assume the role
- **Audit trail**: All actions are logged in CloudTrail with workflow details

### Additional Security Measures

1. **Restrict role assumption**:
   - Limit to specific branches: `repo:owner/repo:ref:refs/heads/main`
   - Limit to pull requests: `repo:owner/repo:pull_request`
   - Limit to specific environments: `repo:owner/repo:environment:production`

2. **Use least privilege**:
   - Only grant permissions needed for deployment
   - Consider separate roles for different environments
   - Regularly review and audit permissions

3. **Enable CloudTrail**:
   - Monitor all AssumeRoleWithWebIdentity calls
   - Set up alerts for unusual activity

## Monitoring and Maintenance

### View Test Results
- Go to the **Actions** tab to see all workflow runs
- Click on any run to see detailed logs
- Failed tests will show with ❌
- Successful tests will show with ✅

### AWS CloudTrail Monitoring
- Search for `AssumeRoleWithWebIdentity` events
- Filter by `userIdentity.principalId` containing `token.actions.githubusercontent.com`
- Review the `requestParameters.roleArn` to verify correct role usage

## Troubleshooting

### Common OIDC Issues

1. **"Could not assume role"**
   - Verify the trust policy conditions match your repository
   - Check that the OIDC provider URL is lowercase
   - Ensure the thumbprints are correct

2. **"Invalid request"**
   - Verify `permissions: id-token: write` is set in workflow
   - Check that `aws-actions/configure-aws-credentials@v4` is used

3. **"Access denied"**
   - Review IAM role permissions
   - Check CloudTrail logs for detailed error messages
   - Verify the role ARN in secrets is correct

## AWS Deployment Commands

### Manual Deployment (Current Setup)

```bash
# First time deployment (creates certificate)
npm run deploy:all:decoupled -- -c createCertificate=true -c notificationEmail=your@email.com

# Subsequent deployments
npm run deploy:all:decoupled

# Deploy only app content (fastest)
npm run deploy:app

# Deploy specific stack
npm run deploy:cdn
npm run deploy:monitoring
```

### Available Deployment Scripts

- `deploy:all:decoupled` - Deploy all 11 AWS stacks in order
- `deploy:app` - Deploy only static content to S3
- `deploy:cdn` - Update CloudFront distribution
- `deploy:foundation` - S3 buckets setup
- `deploy:certificate` - SSL/TLS certificate
- `deploy:waf` - Web Application Firewall
- `deploy:monitoring` - CloudWatch dashboards
- `deploy:feedback` - Feedback system (S3 + Lambda)

## Next Steps

1. **Set up automated deployment workflow** - GitHub Actions to deploy on merge to main
2. **Add staging environment** - Separate AWS stack for preview deployments
3. **Configure deployment notifications** - SNS topics for deployment status
4. **Add infrastructure tests** - CDK snapshot testing
5. **Implement blue-green deployments** - Zero-downtime updates

## Summary

Your CI/CD pipeline is now configured to:
- ✅ Run tests on every push and PR
- ✅ Check code quality (lint, types)
- ✅ Generate coverage reports
- ✅ Test across browsers and devices
- ✅ Use secure OIDC authentication with AWS
- ✅ Support automated AWS deployments
- ✅ Protect your main branch

The pipeline ensures code quality and security best practices!