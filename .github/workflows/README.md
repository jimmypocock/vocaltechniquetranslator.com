# GitHub Actions Workflows

## Workflows

### `deploy.yml` - Deploy to Production
- **Triggers**: Push to `main` branch or manual dispatch
- **Jobs**:
  1. Test - Runs test suite
  2. Deploy - Builds app and deploys to S3, invalidates CloudFront

### `ci.yml` - Pull Request CI
- **Triggers**: Pull requests to `main`
- **Checks**: Lint, Type Check, Test, Build, Security Scan (Snyk)

### `security.yml` - Weekly Security Scan
- **Triggers**: Every Monday at 9 AM UTC or manual dispatch
- **Purpose**: Regular vulnerability scanning with Snyk
- **Features**: Uploads results to GitHub Security tab

## Required Configuration

### Variables - Public Configuration
Add these in **Settings → Secrets and variables → Actions → Variables tab**:

**Required:**
- `AWS_ROLE_ARN` - IAM role for deployment
- `S3_BUCKET_NAME` - S3 bucket name  
- `CLOUDFRONT_DISTRIBUTION_ID` - CloudFront distribution ID
- `NEXT_PUBLIC_GA_ID` - Google Analytics ID
- `NEXT_PUBLIC_COGNITO_USER_POOL_ID` - Cognito User Pool ID
- `NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID` - Cognito User Pool Client ID
- `NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID` - Cognito Identity Pool ID
- `NEXT_PUBLIC_COGNITO_DOMAIN` - Cognito Domain

**Optional:**
- `AWS_REGION` - AWS region (defaults to us-east-1)
- `NEXT_PUBLIC_FEEDBACK_API_ENDPOINT` - Feedback API endpoint

### Secrets - Sensitive Values
Add these in **Settings → Secrets and variables → Actions → Secrets tab**:

**Optional (for future use):**
- `NEXT_PUBLIC_ADSENSE_PUB_ID` - AdSense publisher ID
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID` - AdSense client ID
- `NEXT_PUBLIC_AD_SLOT_HEADER` - Header ad slot ID
- `NEXT_PUBLIC_AD_SLOT_FOOTER` - Footer ad slot ID
- `SNYK_TOKEN` - Snyk authentication token

## Why Variables vs Secrets?
- **Variables**: For non-sensitive config that's already public (AWS resources, GA ID)
- **Secrets**: For auth tokens and IDs you want to keep private
- All `NEXT_PUBLIC_*` values are exposed in the frontend anyway