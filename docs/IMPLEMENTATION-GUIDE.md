# Google Search Console Fix Implementation Guide

## Quick Fix Steps

### 1. Deploy DNS Stack (If Not Already Done)
```bash
cd scripts
./deploy-dns.sh
```

### 2. Update Application Canonical URLs
All canonical URLs have been updated to use `www.vocaltechniquetranslator.com`:
- ✅ Updated sitemap.xml
- ✅ Updated robots.txt
- ✅ Updated all page metadata
- ✅ Added structured data to privacy and terms pages

### 3. Deploy Updated Application
```bash
cd scripts
./deploy-app-content.sh
```

### 4. Clear CloudFront Cache
```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### 5. Google Search Console Actions

#### A. Verify Domain Property
1. Go to Google Search Console
2. Add property for `vocaltechniquetranslator.com` (domain property)
3. Verify using DNS TXT record

#### B. Submit Updated Sitemap
1. Navigate to Sitemaps section
2. Remove old sitemap if exists
3. Submit: `https://www.vocaltechniquetranslator.com/sitemap.xml`

#### C. Request Validation for Redirect Errors
1. Go to Coverage report
2. Click on "Page with redirect" error
3. Click "Validate Fix" for each URL variant

#### D. Request Indexing for Legal Pages
1. Use URL Inspection tool
2. Enter: `https://www.vocaltechniquetranslator.com/privacy`
3. Click "Request Indexing"
4. Repeat for `/terms`

## Monitoring Checklist

### Week 1-2
- [ ] Check DNS propagation (use whatsmydns.net)
- [ ] Verify all redirects working correctly
- [ ] Monitor Search Console for validation progress

### Week 3-4
- [ ] Check Coverage report for improvements
- [ ] Review crawl stats
- [ ] Monitor indexed pages count

### Week 5-8
- [ ] Verify redirect errors resolved
- [ ] Check if legal pages are indexed
- [ ] Review search performance data

## Testing URLs

Test these URL patterns to ensure redirects work:
- `http://vocaltechniquetranslator.com` → `https://www.vocaltechniquetranslator.com`
- `https://vocaltechniquetranslator.com` → `https://www.vocaltechniquetranslator.com`
- `http://www.vocaltechniquetranslator.com` → `https://www.vocaltechniquetranslator.com`

## Success Metrics

1. **Redirect Errors**: Should show "Fixed" status within 2-4 weeks
2. **Legal Pages**: Should move from "Discovered" to "Indexed" within 4-8 weeks
3. **Search Performance**: Should see improved impressions/clicks after full indexing

## Troubleshooting

### If DNS Stack Fails
- Ensure Route 53 hosted zone exists for your domain
- Check AWS credentials are configured
- Verify domain registrar points to Route 53 name servers

### If Pages Still Not Indexed
- Add more internal links to privacy/terms pages
- Consider adding them to main navigation
- Increase content depth if needed

### If Redirect Errors Persist
- Check CloudFront behaviors are configured correctly
- Verify edge function code is deployed
- Test with curl to see actual redirect headers

## Next Steps

1. Consider implementing breadcrumb schema
2. Add FAQ schema to improve rich results
3. Monitor Core Web Vitals for performance
4. Set up regular sitemap updates for new content