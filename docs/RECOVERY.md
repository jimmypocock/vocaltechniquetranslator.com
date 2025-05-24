# Recovery Guide: Getting Back Online After Stack Issues

## Current Architecture

The application now uses a fully decoupled architecture with 7 separate stacks:
- VTT-Foundation (S3 buckets)
- VTT-Certificate (SSL certificate)
- VTT-EdgeFunctions (CloudFront functions)
- VTT-WAF (Web Application Firewall)
- VTT-CDN (CloudFront distribution)
- VTT-App (Content deployment)
- VTT-Monitoring (CloudWatch alarms)

## Step 1: Check Stack Status

```bash
npm run status:all
```

This will show the status of all stacks. Wait until no stacks show "IN_PROGRESS".

## Step 2: Manual Recovery (if needed)

If any stack ends up in `UPDATE_ROLLBACK_FAILED` or `DELETE_FAILED`:

1. Go to AWS Console → CloudFormation
2. Select the failed stack
3. Actions → "Continue Update Rollback" or "Delete" (if safe)
4. Skip problematic resources when prompted

## Step 3: Recovery Strategies

### Option A: Partial Recovery (Recommended)

If some stacks are healthy but others failed:

```bash
# Check what's deployed
npm run status:all

# Deploy only what's missing/failed
npm run deploy:foundation     # If S3 buckets are missing
npm run deploy:cert           # If certificate is missing
npm run deploy:edge           # If CloudFront functions are missing
npm run deploy:waf            # If WAF is missing
npm run deploy:cdn            # If CloudFront is missing
npm run deploy:app            # If content needs updating
npm run deploy:monitoring     # If monitoring is missing
```

### Option B: Full Re-deployment

If you need to start fresh:

```bash
# Deploy all stacks in order
npm run deploy:all:decoupled -- -c notificationEmail=your-email@example.com
```

## Common Issues and Solutions

### Certificate Stuck in Stack

```bash
# If certificate is already validated, save its ARN
aws acm list-certificates --region us-east-1

# Add to .env
echo "CERTIFICATE_ARN=arn:aws:acm:us-east-1:xxxxx:certificate/xxxxx" >> .env

# Deploy without creating new certificate
npm run deploy:cdn
```

### CloudFront Distribution Not Updating

```bash
# Get distribution ID
aws cloudformation describe-stacks --stack-name VTT-CDN \
  --query 'Stacks[0].Outputs[?OutputKey==`DistributionId`].OutputValue' \
  --output text

# Create invalidation
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*"
```

### S3 Bucket Access Denied

```bash
# Update bucket policy for OAC
aws s3api put-bucket-policy --bucket vocaltechniquetranslator.com-app \
  --policy file://bucket-policy.json
```

## Available NPM Commands

### Individual Stack Commands
- `npm run deploy:foundation` - Deploy S3 buckets
- `npm run deploy:cert` - Deploy certificate
- `npm run deploy:edge` - Deploy CloudFront functions
- `npm run deploy:waf` - Deploy WAF rules
- `npm run deploy:cdn` - Deploy CloudFront distribution
- `npm run deploy:app` -         Deploy website content
- `npm run deploy:monitoring` - Deploy monitoring

### Batch Commands
- `npm run deploy:all:decoupled` - Deploy all stacks in order
- `npm run validate` - Check for issues before deployment

### Status Commands
- `npm run status <stack-name>` - Monitor specific stack
- `npm run status:all` - Check all stacks

### Destroy Commands (use carefully!)
- `npm run destroy:waf` - Remove WAF protection
- `npm run destroy:monitoring` - Remove monitoring
- `aws cloudformation delete-stack --stack-name <stack-name>` - Delete any stack

## Best Practices Going Forward

1. **Always run validation first**: `npm run validate`
2. **Deploy stacks independently** when possible
3. **Keep your .env file** with the certificate ARN
4. **Check status before deploying**: `npm run status:all`
5. **Update content separately**: `npm run deploy:app`

#        # Starting Fresh (Clean Deployment)

```bash
# 1. Deploy foundation
npm run deploy:foundation

# 2. Deploy certificate (if needed)
npm run deploy:cert -- -c createCertificate=true
# Add DNS records and wait for validation
# Save certificate ARN to .env

# 3. Deploy remaining infrastructure
npm run deploy:edge
npm run deploy:waf
npm run deploy:cdn

# 4. Deploy content
npm run deploy:app

#         5. Add monitoring
npm run deploy:monitoring -- -c notificationEmail=your-email@example.com
```

## Emergency Resources

- AWS Support: https://console.aws.amazon.com/support/
- CloudFormation Console: https://console.aws.amazon.com/cloudformation/
- CloudFront Console: https://console.aws.amazon.com/cloudfront/
- Certificate Manager: https://console.aws.amazon.com/acm/