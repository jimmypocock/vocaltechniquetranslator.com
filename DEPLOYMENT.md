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
   2. **Add to DNS provider**:
      - Type: CNAME
      - Name: Use only the prefix part (e.g., if AWS shows `_abc123def.vocaltechniquetranslator.com`, use only `_abc123def`)
      - Value: Use the full value as shown (e.g., `_xyz789.acm-validations.aws.`)
      - **Important**: Your DNS provider will automatically append your domain to the name field
   3. **Wait for validation** (5-30 minutes) - status will change to "Issued"
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

### Subsequent Deployments

```bash
npm run deploy
```

### With Existing Certificate

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

1. **Note the CloudFront distribution domain** from the output
2. **Configure DNS**:
   - Create CNAME record for `www.vocaltechniquetranslator.com` → CloudFront distribution domain
   - Create CNAME record for `vocaltechniquetranslator.com` → CloudFront distribution domain
   - Alternative: Use Route 53 with ALIAS records pointing to the CloudFront distribution
3. **Wait for DNS propagation** (can take up to 48 hours)

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
- Check certificate is validated and issued

### Deployment Failures

- Check AWS credentials: `aws sts get-caller-identity`
- Ensure you have necessary IAM permissions
- Review CloudFormation events in AWS Console

### Site Not Loading

- Check CloudFront distribution status (should be "Deployed")
- Verify DNS records point to CloudFront
- Clear browser cache or test in incognito mode