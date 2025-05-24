# Deployment Quick Start Guide

## 🚀 Deploy Your Site in 3 Steps

### Step 1: Environment Setup
```bash
# Copy and configure environment
cp .env.example .env

# Edit .env and add:
# - AWS_PROFILE=your-profile-name
# - CERTIFICATE_ARN=arn:aws:acm:... (after first deployment)
```

### Step 2: First Time Deployment
```bash
# Option A: If you need a new certificate
npm run deploy:cert
# Add DNS records as instructed, wait for validation
# Save certificate ARN to .env

# Option B: If you have a certificate
# Add CERTIFICATE_ARN to .env, then:
npm run deploy:all -- -c notificationEmail=your-email@example.com
```

### Step 3: Regular Updates
```bash
# Just deploy app changes
npm run deploy

# Update everything
npm run deploy:all
```

## 📋 Common Scenarios

### "I need to update the website content"
```bash
npm run deploy
```

### "I need to update security rules"
```bash
npm run deploy:waf
```

### "I need to change monitoring alerts"
```bash
npm run deploy:monitoring -- -c notificationEmail=new-email@example.com
```

### "The site needs maintenance"
```bash
# Show maintenance page
npm run maintenance:on

# Do your work...

# Bring site back
npm run maintenance:off
```

### "I want to check if everything is working"
```bash
npm run status:all
```

## 🏗️ Architecture Overview

Your site runs on these AWS stacks:

**Foundation Layer:**
- `VTT-Foundation` - S3 buckets for content and logs

**Security Layer:**
- `VTT-Certificate` - SSL/TLS certificate
- `VTT-WAF` - Rate limiting and attack protection

**Application Layer:**
- `VTT-EdgeFunctions` - URL redirects and headers
- `VTT-CDN` - CloudFront distribution

**Operations Layer:**
- `VTT-Monitoring` - Dashboards and alerts

## ⚠️ Important Notes

- **Certificate**: Created once, lives forever. Never delete while site is live.
- **AWS Profile**: Set in .env file, automatically used by all commands
- **Monitoring Email**: You'll get a confirmation email from AWS - click it!
- **Deployment Time**: First deployment ~10 minutes, updates ~5 minutes

## 🆘 Troubleshooting

### "Stack is stuck in UPDATE_IN_PROGRESS"
- Run `npm run status:all` to check
- See [RECOVERY.md](./RECOVERY.md) for detailed help

### "403 Forbidden after deployment"
- Wait 15-20 minutes (CloudFront propagation)
- Check DNS points to CloudFront

### "Certificate validation failed"
- Ensure CNAME records are added to DNS
- Check both www and non-www records

## 📚 More Information

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment guide
- [RECOVERY.md](./RECOVERY.md) - Stack recovery procedures
- [ARCHITECTURE.md](./cdk/src/ARCHITECTURE.md) - Stack architecture details