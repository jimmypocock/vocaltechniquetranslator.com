# Stack Decoupling Guide

**UPDATE**: This project has been fully decoupled into 7 separate stacks as of the latest version. See the [Architecture](#full-decoupled-architecture-implemented) section below for details.

## When to Use Decoupled vs Monolithic Architecture

### Use Decoupled Stacks When:

1. **You have a production site with real users**
   - Changes are riskier
   - Downtime must be minimized
   - Rollback needs to be fast

2. **Multiple teams work on different parts**
   - Security team manages WAF
   - DevOps manages monitoring
   - Frontend team deploys content

3. **You need granular deployment control**
   - Update WAF rules without touching the app
   - Change monitoring thresholds frequently
   - Test new features in isolation

4. **You experience these pain points:**
   - Stack updates take forever
   - Resources get "stuck" during deletion
   - Can't update one thing without risking another
   - Global resources (Lambda@Edge) cause delays

### Stay with Monolithic Stack When:

1. **You're in early development**
   - Rapid prototyping
   - Everything changes together
   - Simplicity is more important

2. **You have a small, simple application**
   - Few resources
   - Infrequent updates
   - Single developer/team

3. **Cost is a primary concern**
   - Fewer stacks = less CloudFormation overhead
   - Simpler to manage

## Migration Path

### Phase 1: Identify Pain Points
Your current pain point: **Certificate trapped in stack**

This suggests you need at minimum:
- Separate Certificate Stack ✓
- Separate Edge Functions Stack (they replicate globally)
- Consider separate S3 bucket stack

### Phase 2: Start Small
Don't decouple everything at once:

```bash
# Start with just certificate separation
VocalTechniqueTranslatorStack (existing)
└── Everything except certificate

VocalTranslatorCertificateStack (new)
└── Just the certificate
```

### Phase 3: Gradual Decomposition
As you hit more pain points, extract more:

```bash
# Extract edge functions when they cause delays
VocalTranslatorEdgeFunctionsStack
├── Redirect function
└── Security headers function

# Extract S3 when you need bucket independence  
VocalTranslatorFoundationStack
├── Content bucket
└── Logs bucket
```

## Cost-Benefit Analysis

### Benefits of Decoupling

1. **Faster deployments** (update only what changed)
2. **Reduced blast radius** (failures affect less)
3. **Parallel development** (teams don't block each other)
4. **Easier troubleshooting** (smaller, focused stacks)
5. **Better resource lifecycle** (certificates, buckets persist)

### Costs of Decoupling

1. **More complexity** (multiple stacks to manage)
2. **Cross-stack dependencies** (exports/imports)
3. **More deployment commands** (need automation)
4. **Potential for drift** (stacks can get out of sync)

## Recommended Approach for Your Situation

Given your current issues, I recommend:

### Immediate Actions (High Value, Low Effort)

1. **Extract Certificate to its own stack**
   - Prevents deletion issues
   - One-time setup
   - High value

2. **Keep monitoring separate** ✓ (already done)
   - Change alerts without touching app
   - Add/remove metrics easily

### Medium-Term Actions

3. **Extract Edge Functions**
   - When you need to update redirects/headers frequently
   - When global replication causes delays

4. **Consider Foundation Stack**
   - If you need S3 bucket independence
   - If you want to preserve content during stack updates

### Long-Term Considerations

5. **Full microservices approach**
   - Only if you have multiple teams
   - Only if complexity is justified
   - Consider AWS Service Catalog for governance

## Practical Example: Your Next Deployment

Once your current stack stabilizes:

```bash
# Option 1: Minimal extraction (recommended)
npm run deploy:cert           # One time
npm run deploy:app            # Uses existing cert
npm run deploy:monitoring     # Already separate

# Option 2: Full decoupling (if needed)
npm run deploy:foundation     # One time
npm run deploy:cert          # One time  
npm run deploy:edge          # Rarely updated
npm run deploy:waf           # Security updates
npm run deploy:cdn           # Main app updates
npm run deploy:monitoring    # Alert changes
```

## Decision Framework

Ask yourself:

1. **How often does this resource change?**
   - Rarely → Keep in main stack
   - Frequently → Consider extracting

2. **What's the blast radius if it fails?**
   - High → Definitely extract
   - Low → Maybe keep together

3. **Who needs to update it?**
   - Different team → Extract
   - Same team → Keep together

4. **How painful is it when stuck?**
   - Very (like certificates) → Extract
   - Not very → Keep together

## Your Specific Recommendations

Based on your current issues:

1. **Must Extract**: Certificate (causing current problems)
2. **Should Extract**: Edge Functions (global replication issues)
3. **Consider Extracting**: S3 buckets (if you need versioning/backup)
4. **Keep Together**: CloudFront + OAI (tightly coupled)
5. **Already Separate**: WAF, Monitoring ✓

This gives you the benefits of decoupling where it matters most while avoiding unnecessary complexity.

## Full Decoupled Architecture (Implemented)

The project now uses a fully decoupled architecture with 7 stacks:

1. **VTT-Foundation**: S3 buckets for content and logs
2. **VTT-Certificate**: ACM certificate management  
3. **VTT-EdgeFunctions**: CloudFront Functions for redirects and headers
4. **VTT-WAF**: Web Application Firewall rules
5. **VTT-CDN**: CloudFront distribution
6. **VTT-App**: Application content deployment
7. **VTT-Monitoring**: CloudWatch alarms and dashboards

### Key Implementation Details

- **No Circular Dependencies**: Stacks import resources by name/ID rather than passing objects
- **Validation Script**: Run `npm run validate` to check for issues before deployment
- **Independent Updates**: Each stack can be updated without affecting others
- **Proper Dependency Chain**: Clear hierarchy prevents deployment issues

### Benefits Realized

- ✅ Certificate can be reused across deployments
- ✅ S3 buckets persist through stack updates
- ✅ WAF rules can be updated independently
- ✅ Content updates don't risk infrastructure
- ✅ Monitoring can be adjusted without touching the app
- ✅ Faster deployments (only update what changed)
- ✅ Better error isolation