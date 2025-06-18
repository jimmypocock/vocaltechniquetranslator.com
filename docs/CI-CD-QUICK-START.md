# CI/CD Quick Start Guide 🚀

## Essential Setup (15 minutes)

### 1. Set Up AWS OIDC Provider (One-time)

```bash
# Create OIDC provider in AWS
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

### 2. Create IAM Role for GitHub

Create trust policy file `trust.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
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
  }]
}
```

Create the role:
```bash
aws iam create-role \
  --role-name GitHubActionsVTTDeploy \
  --assume-role-policy-document file://trust.json

# Attach basic policies
aws iam attach-role-policy \
  --role-name GitHubActionsVTTDeploy \
  --policy-arn arn:aws:iam::aws:policy/PowerUserAccess
```

### 3. Add GitHub Secrets
Go to **Settings** → **Secrets and variables** → **Actions**

Add these secrets:
```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_ADSENSE_PUB_ID=ca-pub-XXXXXXXXXXXXXXXX
AWS_ROLE_ARN=arn:aws:iam::YOUR_ACCOUNT_ID:role/GitHubActionsVTTDeploy
AWS_REGION=us-east-1
```

### 4. Enable GitHub Actions
- Go to **Actions** tab
- Click **Enable Actions** if needed

### 5. Test It
```bash
git checkout -b test-ci
echo "test" >> README.md
git add . && git commit -m "Test CI"
git push origin test-ci
```
Create a PR and watch the tests run! ✨

## What You Get

Every push/PR automatically:
- ✅ Runs 298+ unit tests
- ✅ Runs E2E tests on 3 browsers
- ✅ Checks TypeScript types
- ✅ Runs ESLint
- ✅ Tests mobile responsiveness
- ✅ Measures performance
- ✅ Uses secure temporary AWS credentials
- ✅ Comments on PR with results

## AWS Deployment

### First Time CDK Setup
```bash
# Install AWS CDK
npm install -g aws-cdk

# Bootstrap CDK (in cdk/ directory)
cd cdk && npm install && cdk bootstrap
```

### Deploy Commands
```bash
# First deployment (creates SSL certificate)
npm run deploy:all:decoupled -- -c createCertificate=true -c notificationEmail=your@email.com

# Subsequent deployments
npm run deploy:all:decoupled

# Deploy only app content (fastest)
npm run deploy:app
```

## Optional Enhancements

### Coverage Reports (Codecov)
1. Sign up at codecov.io
2. Add your repo
3. Add secret: `CODECOV_TOKEN`

### Branch Protection
**Settings** → **Branches** → **Add rule** for `main`:
- ✅ Require PR before merging
- ✅ Require status checks to pass
- ✅ Add required checks: `unit-tests`, `test-summary`

### Automated Deployment
Create `.github/workflows/deploy.yml`:
```yaml
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
```

## Monitoring

- **View runs**: Actions tab
- **Download artifacts**: Click any run → Artifacts
- **Re-run failed**: Click failed run → Re-run jobs
- **AWS Console**: Check CloudFormation stacks
- **CloudTrail**: Monitor OIDC role assumptions

## Common Commands

```bash
# Run tests locally first
npm run test:run
npm run lint
npm run type-check
npm run test:e2e:smoke

# Check AWS deployment status
cd cdk && cdk list
cd cdk && cdk diff
```

## Security Benefits 🔒

- **No long-term AWS keys** stored in GitHub
- **Temporary credentials** auto-expire after each run
- **Restricted access** only from your specific repository
- **Full audit trail** in AWS CloudTrail

That's it! Your code is now protected by automated testing with secure AWS access! 🎉