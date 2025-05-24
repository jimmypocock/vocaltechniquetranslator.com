# Monitoring Guide for Vocal Technique Translator

This guide explains how to use the monitoring stack to keep track of your website's performance, costs, and health.

## Overview

The VTT-Monitoring stack provides:
- **Real-time CloudWatch Dashboard** - Visual metrics for your site
- **Cost Alerts** - Email notifications at $10, $50, and $100 monthly spend
- **Performance Alerts** - Notifications for high error rates or traffic spikes
- **CloudFront Metrics** - Request counts, error rates, and bandwidth usage

## Accessing Your Dashboard

### Via AWS Console

1. **Direct Link** (after deployment):
   ```
   https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=VocalTranslatorDashboard
   ```

2. **Manual Navigation**:
   - Log into AWS Console
   - Navigate to CloudWatch → Dashboards
   - Click on "VocalTranslatorDashboard"

### Dashboard Sections

The dashboard is organized into four main sections:

#### 1. Traffic Overview
- **Total Requests** - Number of requests to your site
- **Requests by Status Code** - Breakdown of 2xx, 3xx, 4xx, 5xx responses
- **Origin vs Cache Hits** - Shows CloudFront cache effectiveness

#### 2. Performance Metrics
- **Error Rate** - Percentage of 4xx and 5xx errors
- **Origin Latency** - Time to fetch from S3 (when not cached)
- **Cache Hit Rate** - Percentage of requests served from cache

#### 3. Bandwidth Usage
- **Data Transfer** - Amount of data served to users
- **Origin Data Transfer** - Data fetched from S3

#### 4. Geographic Distribution
- **Requests by Country** - Where your traffic comes from
- **Edge Location Usage** - Which CloudFront POPs are serving traffic

## Understanding the Metrics

### Key Metrics to Watch

1. **Cache Hit Rate**
   - **Good**: Above 90%
   - **Action**: If low, check cache headers and TTL settings
   - **Impact**: Higher = lower costs and faster performance

2. **Error Rate**
   - **Good**: Below 1%
   - **Warning**: 1-5%
   - **Critical**: Above 5%
   - **Common 4xx**: Usually from bots scanning for vulnerabilities

3. **Origin Latency**
   - **Good**: Below 100ms
   - **Warning**: 100-500ms
   - **Critical**: Above 500ms
   - **Note**: Only matters for cache misses

4. **WAF Blocked Requests**
   - **Normal**: Some blocked requests from bots
   - **Check**: Sudden spikes might indicate an attack
   - **Action**: Review WAF logs if legitimate users report issues

## Email Alerts

### Alert Types

1. **Billing Alerts**
   - Triggers at: $10, $50, $100 per month
   - Includes: Current spend and projection
   - Action: Review CloudWatch cost explorer

2. **High Error Rate Alert**
   - Triggers: When 5xx errors exceed 1% for 5 minutes
   - Indicates: Potential issues with your site
   - Action: Check CloudFront logs and S3 availability

3. **Traffic Spike Alert**
   - Triggers: 50% increase in requests over 10 minutes
   - Indicates: Viral content or potential DDoS
   - Action: Monitor WAF and consider scaling

### Managing Alerts

#### Subscribe to Alerts
When you first deploy monitoring, you'll receive a confirmation email from AWS SNS. Click the confirmation link to start receiving alerts.

#### Change Alert Email
```bash
npm run deploy:monitoring -- -c notificationEmail=new-email@example.com
```

#### Disable Specific Alerts
In AWS Console:
1. Go to CloudWatch → Alarms
2. Find the alarm (e.g., "VocalTranslator-HighErrorRate")
3. Actions → Disable

## Cost Optimization Tips

### Monitor These Cost Drivers

1. **Data Transfer Out**
   - Biggest cost component
   - Monitor: Bandwidth usage widget
   - Optimize: Enable compression, optimize images

2. **Request Count**
   - CloudFront charges per request
   - Monitor: Total requests widget
   - Optimize: Increase cache TTL, combine assets

3. **Origin Requests**
   - S3 GET requests add up
   - Monitor: Cache hit rate
   - Optimize: Longer cache headers, fix cache misses

### Cost Breakdown (Typical)
- CloudFront requests: $0.01 per 10,000 requests
- Data transfer: $0.085 per GB (first 10TB)
- S3 storage: $0.023 per GB per month
- S3 requests: $0.0004 per 1,000 GET requests

## Troubleshooting with Monitoring

### Scenario 1: High Error Rate Alert

1. **Check Dashboard**:
   - Look at "Requests by Status Code" widget
   - Identify if 4xx or 5xx errors

2. **For 4xx Errors**:
   - Usually bots looking for wordpress/admin
   - Check WAF is blocking appropriately
   - No action needed unless affecting real users

3. **For 5xx Errors**:
   - Check S3 bucket accessibility
   - Verify CloudFront → S3 permissions
   - Look for deployment issues

### Scenario 2: Slow Performance

1. **Check Cache Hit Rate**:
   - Low rate = more origin fetches = slower
   - Review cache headers in browser DevTools

2. **Check Origin Latency**:
   - High latency might indicate S3 issues
   - Consider S3 Transfer Acceleration if global audience

3. **Check Geographic Distribution**:
   - Users far from us-east-1 might see higher latency
   - CloudFront helps, but first request is always slower

### Scenario 3: Unexpected Costs

1. **Check Billing Alert Details**:
   - CloudWatch → Billing → Cost Explorer
   
2. **Common Causes**:
   - **Bandwidth spike**: Check for hotlinking
   - **Request spike**: Could be bots or scrapers
   - **Origin requests**: Cache configuration issue

3. **Quick Fixes**:
   - Enable WAF rate limiting (already on)
   - Add Referer header check for images
   - Increase cache TTL for static assets

## Advanced Monitoring

### Custom Metrics

To add custom metrics:

1. **In monitoring-stack.ts**, add new widgets:
```typescript
{
  type: 'line',
  properties: {
    metrics: [
      ['AWS/CloudFront', 'YourMetric', { stat: 'Average' }]
    ],
    period: 300,
    region: 'us-east-1',
    title: 'Your Custom Metric'
  }
}
```

2. **Redeploy**: `npm run deploy:monitoring`

### Log Analysis

For detailed analysis:

1. **Enable CloudFront Logs** (already enabled):
   - Stored in: `vocaltechniquetranslator.com-logs` bucket
   - Path: `cloudfront-logs/`

2. **Query with CloudWatch Insights**:
   ```
   fields @timestamp, cs-uri-stem, sc-status, cs-referer
   | filter sc-status >= 400
   | stats count() by sc-status
   ```

3. **Common Queries**:
   - Top 404 pages
   - Referrer analysis
   - Bot detection
   - Geographic patterns

### Integration with Other Services

1. **Slack Notifications**:
   - Add Lambda function to SNS topic
   - Forward alerts to Slack webhook

2. **PagerDuty**:
   - Integrate SNS with PagerDuty for critical alerts
   - Escalation policies for after-hours

3. **Custom Dashboards**:
   - Export dashboard as JSON
   - Customize in Grafana or Datadog

## Best Practices

### Daily Monitoring Routine

1. **Morning Check** (2 minutes):
   - Glance at dashboard for anomalies
   - Check overnight alerts
   - Note any unusual patterns

2. **Weekly Review** (10 minutes):
   - Review cost trends
   - Check cache hit rates
   - Look for optimization opportunities

3. **Monthly Analysis** (30 minutes):
   - Deep dive into costs
   - Review error patterns
   - Plan optimizations

### Alert Fatigue Prevention

1. **Tune Thresholds**:
   - Adjust based on your normal traffic
   - Prevent false positives

2. **Use Composite Alarms**:
   - Combine multiple conditions
   - Reduce noise

3. **Schedule Maintenance Windows**:
   - Disable alerts during deployments
   - Prevent expected spikes from alerting

## Monitoring Costs

The monitoring stack itself has minimal costs:
- **Dashboard**: Free (up to 3 dashboards)
- **Alarms**: $0.10 per alarm per month (you have ~5)
- **SNS**: $0.50 per million emails
- **Total**: Usually under $1/month

## Quick Reference

### Key Commands
```bash
# Deploy/update monitoring
npm run deploy:monitoring -- -c notificationEmail=your@email.com

# Remove monitoring
npm run destroy:monitoring

# Check monitoring stack status
npm run status
```

### Important URLs
- Dashboard: [CloudWatch Console](https://console.aws.amazon.com/cloudwatch/)
- Billing: [Cost Explorer](https://console.aws.amazon.com/cost-management/home)
- Alarms: [CloudWatch Alarms](https://console.aws.amazon.com/cloudwatch/home#alarmsV2:)
- Logs: [CloudFront Logs in S3](https://s3.console.aws.amazon.com/s3/buckets/vocaltechniquetranslator.com-logs)

### Metric Formulas
- **Cache Hit Rate**: (CacheHitCount / (CacheHitCount + OriginRequests)) * 100
- **Error Rate**: (4xxErrors + 5xxErrors) / TotalRequests * 100
- **Bandwidth Cost**: DataTransferOut(GB) * $0.085
- **Request Cost**: TotalRequests / 10,000 * $0.01

## Need Help?

If you see something unusual in monitoring:

1. **Check this guide first** - Most scenarios are covered
2. **Review AWS Status** - [status.aws.amazon.com](https://status.aws.amazon.com)
3. **Check CloudFront Known Issues** - In AWS Personal Health Dashboard
4. **Enable Detailed Logs** - For deep debugging

Remember: Most alerts are informational. Only high error rates and extreme cost spikes require immediate action.