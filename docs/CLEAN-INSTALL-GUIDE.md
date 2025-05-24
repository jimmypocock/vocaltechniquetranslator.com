# Clean Install Guide

This guide shows how to deploy the Vocal Technique Translator from scratch to a new AWS account or for a new domain.

## Prerequisites

1. AWS Account with appropriate permissions
2. Domain name with DNS control
3. Node.js 18+ installed
4. AWS CLI configured

## Step-by-Step Clean Installation

### 1. Clone and Setup

```bash
git clone <repository>
cd VocalTechniqueTranslator
npm install
npm run cdk:install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```bash
# AWS Profile
AWS_PROFILE=your-profile-name

# Certificate ARN will be added after step 4
# Google Analytics (optional)
# NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3. Deploy Foundation Stack

```bash
npm run deploy:foundation
```

This creates:
- S3 bucket for your website content
- S3 bucket for CloudFront logs
- Both with proper lifecycle policies

### 4. Deploy Certificate Stack

```bash
npm run deploy:cert -- -c createCertificate=true
```

**IMPORTANT**:
1. Go to AWS Certificate Manager in the console
2. Find your certificate (in us-east-1 region)
3. Copy the CNAME records
4. Add these records to your DNS provider
5. Wait for validation (5-30 minutes)
6. Copy the certificate ARN and add to `.env`:
   ```bash
   CERTIFICATE_ARN=arn:aws:acm:us-east-1:xxxxx:certificate/xxxxx
   ```

### 5. Deploy Edge Functions

```bash
npm run deploy:edge
```

This creates CloudFront functions for:
- URL redirects (www enforcement)
- Security headers

### 6. Deploy WAF (Optional but Recommended)

```bash
npm run deploy:waf
```

This adds:
- Rate limiting (2000 requests/5 min per IP)
- Common attack protection
- AWS managed rule sets

### 7. Deploy CDN

```bash
npm run deploy:cdn
```

This creates:
- CloudFront distribution
- Origin Access Control (OAC)
- Connects everything together

**IMPORTANT**: After CDN deployment, run:
```bash
npm run fix:bucket-policy
```

This grants CloudFront permission to access your S3 bucket. Without this, you'll get 403 errors.

### 8. Deploy Application Content

```bash
npm run deploy:app
```

This deploys:
- Your website files to S3
- Invalidates CloudFront cache

### 9. Deploy Monitoring (Optional)

```bash
npm run deploy:monitoring -- -c notificationEmail=your-email@example.com
```

This adds:
- CloudWatch dashboards
- Billing alerts
- Error monitoring
- Email notifications

### 10. Configure DNS

1. Get your CloudFront domain:
   ```bash
   aws cloudformation describe-stacks --stack-name VTT-CDN \
     --query 'Stacks[0].Outputs[?OutputKey==`DistributionDomainName`].OutputValue' \
     --output text
   ```

2. Add DNS records:
   - `www.yourdomain.com` → CNAME → `xxxxx.cloudfront.net`
   - `yourdomain.com` → CNAME → `xxxxx.cloudfront.net`

   (Or use ALIAS records if using Route53)

3. Wait for DNS propagation (5 minutes to 48 hours)

## All-in-One Command

After initial setup, you can deploy everything at once, if desired:

```bash
npm run deploy:all -- -c notificationEmail=your-email@example.com
```

## Deployment Order Matters

The stacks must be deployed in this order due to dependencies:

```
1. Foundation (S3 buckets)
2. Certificate (SSL/TLS)
3. Edge Functions (CloudFront Functions)
4. WAF (Security rules)
5. CDN (CloudFront distribution)
6. App (Website content deployment)
7. Monitoring (CloudWatch)
```

**Note**: If you've already deployed the Foundation stack, you do NOT need to redeploy it.

## Cost Estimates

For a low-traffic site:
- Foundation: ~$0.50/month (S3 storage)
- Certificate: Free
- Edge Functions: ~$0.10/month
- WAF: ~$5/month (can skip to save money)
- CDN: ~$1/month (bandwidth)
- Monitoring: ~$0.50/month

Total: ~$7/month (or ~$2/month without WAF)

## Customization for Other Projects

To use this architecture for other projects:

1. Change domain name in `cdk/src/app.ts`
2. Update project name in stack names
3. Adjust WAF rules for your needs
4. Modify monitoring thresholds
5. Update security headers as needed

## Troubleshooting

### Certificate Won't Validate
- Ensure CNAME records are exact (don't add your domain to the value)
- Check both www and non-www records
- Use `dig` to verify: `dig _xxx.yourdomain.com CNAME`

### 403 Errors After Deployment
- Wait 15-20 minutes for CloudFront propagation
- Check S3 bucket has content: `aws s3 ls s3://your-bucket/`
- Verify DNS points to CloudFront

### Stack Creation Failed
- Check CloudFormation events in AWS Console
- Ensure your AWS account has required permissions
- Verify no conflicting resources exist

## Clean Uninstall

To completely remove everything:

```bash
# Remove in reverse order
npm run destroy:monitoring
npm run destroy:waf
aws cloudformation delete-stack --stack-name VTT-CDN
aws cloudformation delete-stack --stack-name VTT-EdgeFunctions
aws cloudformation delete-stack --stack-name VTT-Certificate
aws cloudformation delete-stack --stack-name VTT-Foundation
```

**WARNING**: This deletes everything including your S3 content!