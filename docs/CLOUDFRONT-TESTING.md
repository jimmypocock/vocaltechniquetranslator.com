# CloudFront Testing & S3 Policy Solutions

## Testing CloudFront Before DNS Switch

Since the Edge Function redirects CloudFront URLs to your domain, you have several options to test:

### Option 1: Temporary Disable Redirect (Recommended)

1. **Comment out the redirect function temporarily**:

```typescript
// In edge-functions-stack.ts, modify the redirect function:
this.redirectFunction = new cloudfront.Function(this, 'RedirectFunction', {
  code: cloudfront.FunctionCode.fromInline(`
    function handler(event) {
      var request = event.request;
      
      // TEMPORARILY DISABLED FOR TESTING
      // Remove this section when testing is complete
      return request;
      
      /* Original redirect code - uncomment after testing
      var headers = request.headers;
      var host = headers.host.value;
      
      if (host.includes('cloudfront.net')) {
        var response = {
          statusCode: 301,
          statusDescription: 'Moved Permanently',
          headers: {
            location: { value: 'https://www.${props.domainName}' + request.uri }
          }
        };
        return response;
      }
      
      if (host === '${props.domainName}') {
        var response = {
          statusCode: 301,
          statusDescription: 'Moved Permanently',
          headers: {
            location: { value: 'https://www.${props.domainName}' + request.uri }
          }
        };
        return response;
      }
      */
      
      return request;
    }
  `),
```

2. **Redeploy edge functions**:
```bash
npm run deploy:edge
```

3. **Wait 5-10 minutes for global propagation**

4. **Test your CloudFront URL directly**:
```bash
# Get your CloudFront URL
aws cloudformation describe-stacks --stack-name VTT-CDN \
  --query 'Stacks[0].Outputs[?OutputKey==`DistributionDomainName`].OutputValue' \
  --output text --region us-east-1
```

5. **Re-enable the redirect after testing**

### Option 2: Use curl with Host Header

Test without disabling the redirect by overriding the Host header:

```bash
# Get your CloudFront domain
CLOUDFRONT_DOMAIN=$(aws cloudformation describe-stacks --stack-name VTT-CDN \
  --query 'Stacks[0].Outputs[?OutputKey==`DistributionDomainName`].OutputValue' \
  --output text --region us-east-1)

# Test with curl
curl -H "Host: test.example.com" https://$CLOUDFRONT_DOMAIN/
```

This bypasses the redirect since the host header won't match your domain patterns.

### Option 3: Modify Local Hosts File

1. **Edit your hosts file**:
   - Mac/Linux: `/etc/hosts`
   - Windows: `C:\Windows\System32\drivers\etc\hosts`

2. **Add your CloudFront IP**:
```bash
# First, get CloudFront IPs
dig YOUR-DISTRIBUTION.cloudfront.net

# Add to hosts file (example)
13.225.xxx.xxx www.vocaltechniquetranslator.com
13.225.xxx.xxx vocaltechniquetranslator.com
```

3. **Test in your browser** - it will use CloudFront but with your domain name

4. **Remove hosts entries after testing**

### Option 4: Test with a Subdomain

1. **Add a test subdomain to your certificate and CDN**:
```typescript
// In certificate-stack.ts
subjectAlternativeNames: [
  `www.${props.domainName}`,
  `test.${props.domainName}`  // Add test subdomain
],

// In cdn-stack.ts
domainNames: props.certificate ? [
  `www.${props.domainName}`,
  props.domainName,
  `test.${props.domainName}`  // Add test subdomain
] : undefined,
```

2. **Create a CNAME for test subdomain** pointing to CloudFront

3. **Update redirect function to allow test subdomain**:
```typescript
// Skip redirect for test subdomain
if (host === 'test.${props.domainName}') {
  return request;
}
```

## S3 Bucket Policy Solutions

### Current Solution: Manual Script

After deployment, you may need to manually update the bucket policy to allow CloudFront OAC access.

### Future Solution 1: Pre-configured Policy in Foundation Stack

```typescript
// foundation-stack.ts
import * as iam from 'aws-cdk-lib/aws-iam';

export class FoundationStack extends Stack {
  constructor(scope: Construct, id: string, props: FoundationStackProps) {
    super(scope, id, props);

    // ... existing bucket creation ...

    // Add CloudFront OAC policy to website bucket
    this.websiteBucket.addToResourcePolicy(new iam.PolicyStatement({
      sid: 'AllowCloudFrontServicePrincipalReadOnly',
      effect: iam.Effect.ALLOW,
      principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
      actions: ['s3:GetObject'],
      resources: [`${this.websiteBucket.bucketArn}/*`],
      conditions: {
        StringLike: {
          'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/*`
        }
      }
    }));

    // Export bucket reference for other stacks
    new CfnOutput(this, 'WebsiteBucketRef', {
      value: this.websiteBucket.bucketName,
      exportName: `${this.stackName}-WebsiteBucketRef`,
    });
  }
}
```

**Pros**:
- No manual step required
- Works for all future CloudFront distributions

**Cons**:
- Slightly less secure (allows any distribution in your account)
- Foundation stack needs to know about CloudFront requirements

### Future Solution 2: Custom Resource in CDN Stack

```typescript
// cdn-stack.ts
import * as cr from 'aws-cdk-lib/custom-resources';

export class CdnStack extends Stack {
  constructor(scope: Construct, id: string, props: CdnStackProps) {
    super(scope, id, props);

    // ... existing CDN setup ...

    // Custom resource to update bucket policy
    const bucketPolicyUpdater = new cr.AwsCustomResource(this, 'BucketPolicyUpdater', {
      onCreate: {
        service: 'S3',
        action: 'putBucketPolicy',
        parameters: {
          Bucket: props.domainName + '-app',
          Policy: JSON.stringify({
            Version: '2012-10-17',
            Statement: [{
              Sid: 'AllowCloudFrontServicePrincipalReadOnly',
              Effect: 'Allow',
              Principal: {
                Service: 'cloudfront.amazonaws.com'
              },
              Action: 's3:GetObject',
              Resource: `arn:aws:s3:::${props.domainName}-app/*`,
              Condition: {
                StringEquals: {
                  'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${this.distribution.distributionId}`
                }
              }
            }]
          })
        },
        physicalResourceId: cr.PhysicalResourceId.of('BucketPolicyUpdate'),
      },
      policy: cr.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: ['s3:PutBucketPolicy', 's3:GetBucketPolicy'],
          resources: [`arn:aws:s3:::${props.domainName}-app`],
        }),
      ]),
    });

    // Ensure policy is updated after distribution is created
    bucketPolicyUpdater.node.addDependency(this.distribution);
  }
}
```

**Pros**:
- Automatic policy update
- Specific to the exact distribution
- No manual steps

**Cons**:
- More complex
- Custom resources can fail and need cleanup

### Future Solution 3: Shared Bucket Construct

Create a reusable construct that handles the bucket and policy together:

```typescript
// shared/cloudfront-bucket.ts
export interface CloudFrontBucketProps {
  bucketName: string;
  domainName: string;
}

export class CloudFrontBucket extends Construct {
  public readonly bucket: s3.Bucket;
  
  constructor(scope: Construct, id: string, props: CloudFrontBucketProps) {
    super(scope, id);
    
    this.bucket = new s3.Bucket(this, 'Bucket', {
      bucketName: props.bucketName,
      // ... other config ...
    });
    
    // Pre-configure for CloudFront access
    this.bucket.addToResourcePolicy(new iam.PolicyStatement({
      sid: 'AllowCloudFrontServicePrincipalReadOnly',
      effect: iam.Effect.ALLOW,
      principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
      actions: ['s3:GetObject'],
      resources: [`${this.bucket.bucketArn}/*`],
      // Allow any distribution from this account
      conditions: {
        StringLike: {
          'AWS:SourceArn': `arn:aws:cloudfront::${Stack.of(this).account}:distribution/*`
        }
      }
    }));
  }
  
  // Method to restrict to specific distribution after creation
  public restrictToDistribution(distributionArn: string) {
    // Update policy to be more restrictive
  }
}
```

**Pros**:
- Reusable pattern
- Encapsulates best practices
- Can evolve over time

**Cons**:
- Requires refactoring existing stacks
- Another abstraction layer

## Recommendations

1. **For Testing**: Use Option 1 (temporary disable redirect) as it's the cleanest approach
2. **For S3 Policy**: Keep the manual script for now, but consider Solution 2 (Custom Resource) for v2
3. **Long term**: Solution 3 (Shared Construct) provides the best maintainability

## Testing Checklist

Before switching DNS:

- [ ] CloudFront distribution shows "Deployed" status
- [ ] Can access content via CloudFront URL (with redirect disabled)
- [ ] SSL certificate works properly
- [ ] Security headers are present (check with curl -I)
- [ ] Caching behavior is correct
- [ ] Error pages work (test 404)
- [ ] WAF rules aren't blocking legitimate traffic
- [ ] Logs are being written to S3
- [ ] Monitoring alarms are configured