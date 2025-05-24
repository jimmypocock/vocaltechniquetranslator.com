# Scripts Directory

This directory contains all deployment and maintenance scripts for the Vocal Technique Translator.

## Deployment Scripts

### Core Deployment

- **deploy-all-decoupled.sh** - Deploys all stacks in the correct order
- **deploy-app-content.sh** - Deploys application content to S3 and invalidates CloudFront cache

### Individual Stack Deployment

- **deploy-foundation.sh** - Deploys S3 buckets for website and logs
- **deploy-cert.sh** - Creates or imports SSL certificate (one-time setup)
- **deploy-edge-functions.sh** - Deploys CloudFront functions for redirects and security headers
- **deploy-waf.sh** - Deploys WAF security rules
- **deploy-cdn.sh** - Deploys CloudFront distribution with custom domains
- **deploy-monitoring.sh** - Sets up CloudWatch monitoring and alerts

## Maintenance Scripts

- **maintenance-mode.sh** - Enable/disable maintenance mode
  - `on` - Shows maintenance page
  - `off` - Restores normal site
  - `update "message" "eta"` - Updates maintenance message

## Status and Monitoring

- **check-stack-status.sh** - Monitors a single stack's status
- **check-all-stacks.sh** - Shows status of all stacks at once
- **diagnose-stack.sh** - Diagnoses issues with a specific stack

## Cleanup Scripts

- **destroy-waf.sh** - Removes WAF stack (with confirmation)
- **destroy-monitoring.sh** - Removes monitoring stack (with confirmation)

## Script Conventions

All scripts:

1. Load AWS profile from .env automatically
2. Check for AWS credentials before proceeding
3. Build CDK TypeScript if needed
4. Provide clear status messages
5. Exit with proper error codes
6. Support the decoupled architecture with proper dependencies

## Common Script Patterns

```bash
# All scripts follow this pattern:
1. Load .env variables
2. Check AWS credentials
3. Build CDK (if needed)
4. Execute CDK deployment
5. Provide success/failure feedback
```

## Stack Dependencies

When deploying, ensure stacks are deployed in this order:

1. VTT-Foundation (required by CDN and App)
2. VTT-Certificate (required by CDN)
3. VTT-EdgeFunctions (required by CDN)
4. VTT-WAF (optional, used by CDN)
5. VTT-CDN (required by App)
6. VTT-App (deploys content)
7. VTT-Monitoring (optional, monitors CDN)