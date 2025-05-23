# Deployment Guide for Vocal Technique Translator

This guide explains how to deploy the Vocal Technique Translator to AWS using CDK.

## Prerequisites

1. **AWS Account**: You need an AWS account with appropriate permissions
2. **AWS CLI**: Install and configure the AWS CLI

   ```bash
   # For standard AWS credentials
   aws configure

   # For AWS SSO
   aws sso login --profile your-profile-name
   export AWS_PROFILE=your-profile-name
   ```

3. **Node.js**: Version 18.x or later
4. **Domain**: vocaltechniquetranslator.com (configure DNS after deployment)

## Architecture

The deployment creates:

- **S3 Bucket**: Hosts the static website files
- **CloudFront Distribution**: CDN for global performance and HTTPS
- **Lambda@Edge**: Redirects www to non-www domain
- **ACM Certificate**: SSL/TLS certificate for HTTPS (must be created manually)

## Initial Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Create ACM Certificate** (choose one option):

   **Option A: Create via CDK (Recommended)**

   ```bash
   # Deploy with certificate creation
   npm run deploy -- -c createCertificate=true
   ```

   After deployment:
   1. **Find validation records**: Go to AWS Certificate Manager → Your certificate → Copy CNAME records
   2. **Add BOTH validation records to DNS provider**:
      - **For non-www domain**:
        - Type: CNAME
        - Name: Use only the prefix part (e.g., if AWS shows `_abc123def.vocaltechniquetranslator.com`, use only `_abc123def`)
        - Value: Use the full value as shown (e.g., `_xyz789.acm-validations.aws.`)
      - **For www subdomain**:
        - Type: CNAME
        - Name: Use the prefix WITH www (e.g., if AWS shows `_abc123def.www.vocaltechniquetranslator.com`, use `_abc123def.www`)
        - Value: Use the full value as shown
      - **Important**: Your DNS provider will automatically append your domain to the name field
   3. **Wait for validation** (5-30 minutes) - status will change to "Issued" for BOTH domains
   4. **Save certificate ARN**:

      ```bash
      # Copy .env.example to .env
      cp .env.example .env
      # Add your certificate ARN to .env file
      echo "CERTIFICATE_ARN=arn:aws:acm:us-east-1:XXX:certificate/YYY" >> .env
      ```

   **Option B: Create manually in AWS Console**
   - Go to AWS Certificate Manager in us-east-1 region
   - Request a public certificate for:
     - `vocaltechniquetranslator.com`
     - `www.vocaltechniquetranslator.com`
   - Choose DNS validation
   - Add the CNAME records to your DNS
   - Wait for validation
   - Copy the certificate ARN

## Deployment Steps

All deployments use the same `npm run deploy` command, which runs the smart deploy.sh script that handles dependencies, building, and bootstrapping automatically.

### First Deployment (with certificate creation)

```bash
npm run deploy -- -c createCertificate=true
```

After certificate is validated:
1. Save the certificate ARN to `.env` file:
   ```bash
   echo "CERTIFICATE_ARN=arn:aws:acm:us-east-1:XXX:certificate/YYY" > .env
   ```
2. Future deployments will automatically use this certificate

### Subsequent Deployments

```bash
npm run deploy
```
The deploy script automatically uses the certificate from `.env` file.

### Starting Fresh (Complete Redeploy)

If you need to delete and recreate everything:
1. **Keep your certificate** - it's already validated and can be reused
2. Delete the stack: `aws cloudformation delete-stack --stack-name VocalTechniqueTranslatorStack`
3. Wait for deletion: `aws cloudformation wait stack-delete-complete --stack-name VocalTechniqueTranslatorStack`
4. Deploy fresh: `npm run deploy` (uses certificate from .env)

### Manual Certificate Override

```bash
npm run deploy -- -c certificateArn=arn:aws:acm:us-east-1:YOUR_ACCOUNT:certificate/YOUR_CERT_ID
```

### With AWS SSO Profile

```bash
# Option 1: Set profile for session
export AWS_PROFILE=your-profile-name
npm run deploy

# Option 2: Pass profile directly
npm run deploy -- --profile your-profile-name
```

The deploy script automatically:

- Checks AWS credentials
- Installs dependencies (if needed)
- Builds TypeScript
- Bootstraps CDK (first time only)
- Deploys the stack

## Post-Deployment

**⚠️ IMPORTANT**: Complete these steps AFTER deployment finishes successfully!

1. **Note the CloudFront distribution domain** from the deployment output (e.g., `d1234abcd.cloudfront.net`)
2. **Configure DNS** (only after CloudFront is deployed):
   - **Option A - Route 53 (Recommended)**:
     - Create ALIAS record for `www.vocaltechniquetranslator.com` → CloudFront distribution
     - Create ALIAS record for `vocaltechniquetranslator.com` → CloudFront distribution
   - **Option B - Other DNS Providers**:
     - Create CNAME record for `www.vocaltechniquetranslator.com` → CloudFront distribution domain
     - Create CNAME record for `vocaltechniquetranslator.com` → CloudFront distribution domain
3. **Wait for DNS propagation** (5 minutes to 48 hours, typically 1-2 hours)
4. **Note**: CloudFront updates take 15-20 minutes to propagate globally

## Redirect Behavior

The CloudFront Function (Lambda@Edge) handles these redirects:

- `https://xyz.cloudfront.net` → `https://www.vocaltechniquetranslator.com`
- `https://vocaltechniquetranslator.com` → `https://www.vocaltechniquetranslator.com`

- All traffic is forced to HTTPS (HTTP automatically redirects to HTTPS)

The primary domain is `www.vocaltechniquetranslator.com` - all other URLs redirect to it.

## Updating the Site

To update the website content:

```bash
# The deployment automatically uploads index.html
npm run deploy
```

## Useful Commands

- `npm run diff` - Compare deployed stack with current state
- `npm run synth` - Synthesize CloudFormation template
- `npm run destroy` - Remove all resources (WARNING: destructive)

## Cost Considerations

- **S3**: ~$0.023/GB/month for storage
- **CloudFront**: ~$0.085/GB for data transfer
- **Lambda@Edge**: ~$0.00005001 per request
- **Route 53**: ~$0.50/month per hosted zone

For a low-traffic site, expect < $1/month.

## Troubleshooting

### Certificate Issues

- Ensure certificate is in us-east-1 region
- Verify both domains are included in the certificate
- Check BOTH validation records are added (www and non-www)
- Check certificate is validated and issued for BOTH domains
- Verify validation with: `dig _prefix.vocaltechniquetranslator.com CNAME +short`

### Deployment Failures

- Check AWS credentials: `aws sts get-caller-identity`
- Ensure you have necessary IAM permissions
- Review CloudFormation events in AWS Console
- If TypeScript errors occur, delete .d.ts files: `rm -f lib/*.d.ts`

### 403 Forbidden Errors

Common causes and solutions:
1. **CloudFront still updating** - Wait 15-20 minutes after deployment
2. **DNS not configured** - Ensure ALIAS/CNAME records are added
3. **Wrong origin** - Redeploy to fix S3 origin configuration
4. **Missing index.html** - Check S3 bucket: `aws s3 ls s3://bucketname/`
5. **Cache issues** - Invalidate CloudFront: `aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"`

### Site Not Loading

- Check CloudFront distribution status (should be "Deployed")
- Verify DNS records point to CloudFront
- Test DNS resolution: `dig www.vocaltechniquetranslator.com A`
- Clear browser cache or test in incognito mode
- Check CloudFront directly: `curl -I https://YOUR_DIST_ID.cloudfront.net/`