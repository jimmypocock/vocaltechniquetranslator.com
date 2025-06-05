# Google Search Console Issues - Consolidated Fix Guide

## Current Status

### ✅ Already Fixed in Code
- All canonical URLs use `www.vocaltechniquetranslator.com`
- Sitemap uses www URLs
- Privacy and Terms pages have structured data
- No Course structured data exists (old cached error)

### ❌ Issues to Fix
1. **Redirect Errors**: Domain variations not redirecting properly to www
2. **Pages Not Indexed**: Privacy, Terms, Articles pages

## Action Items

### 1. Check Your Current Redirects
Run these commands to see what's happening:

```bash
# Test all domain variations
curl -I -L http://vocaltechniquetranslator.com
curl -I -L https://vocaltechniquetranslator.com  
curl -I -L http://www.vocaltechniquetranslator.com
curl -I -L https://www.vocaltechniquetranslator.com
```

All should end up at `https://www.vocaltechniquetranslator.com` with clean 301 redirects.

### 2. Fix CloudFront Redirects

In AWS Console:
1. Go to CloudFront → Your Distribution → Behaviors
2. Edit Default Behavior
3. Set "Viewer Protocol Policy" to "Redirect HTTP to HTTPS"
4. Go to "General" tab → "Alternate Domain Names"
5. Ensure BOTH domains are listed:
   - `vocaltechniquetranslator.com`
   - `www.vocaltechniquetranslator.com`

### 3. Check DNS Records

In Route 53 (or your DNS provider):
- `vocaltechniquetranslator.com` → A record pointing to CloudFront
- `www.vocaltechniquetranslator.com` → A record pointing to CloudFront

If missing, you need to add them.

### 4. Improve Page Indexing

#### For Privacy & Terms Pages:
Edit `/public/sitemap.xml` to increase priority:

```xml
<!-- Change priority from 0.3 to 0.5 -->
<url>
  <loc>https://www.vocaltechniquetranslator.com/privacy</loc>
  <lastmod>2025-01-29</lastmod>
  <changefreq>yearly</changefreq>
  <priority>0.5</priority>
</url>

<url>
  <loc>https://www.vocaltechniquetranslator.com/terms</loc>
  <lastmod>2025-01-29</lastmod>
  <changefreq>yearly</changefreq>
  <priority>0.5</priority>
</url>
```

#### For Articles Page:
Check if `/app/articles/page.tsx` has enough content. If it's just a list, add an intro paragraph explaining the articles section.

### 5. Google Search Console Actions

After making changes:

1. **Fix Redirect Errors**:
   - Coverage → "Page with redirect" → "Validate Fix"

2. **Request Indexing**:
   - URL Inspection → Enter each URL → "Request Indexing"
   - Do this for: /privacy, /terms, /articles

3. **Clear Course Error**: 
   - URL Inspection → /about → "Request Indexing"

4. **Resubmit Sitemap**:
   - Sitemaps → Enter sitemap URL → Submit

## What NOT to Do

- ❌ Don't run `fix-canonical-urls.sh` - URLs are already correct
- ❌ Don't change any canonical URLs in code - they're already using www
- ❌ Don't add more structured data - Privacy/Terms already have it

## Timeline

- **Redirect fixes**: Immediate after CloudFront changes
- **Course errors**: 1-2 weeks (just needs recrawl)
- **Page indexing**: 2-6 weeks
- **Full resolution**: 4-8 weeks

## Quick Checklist

- [ ] Test current redirects with curl commands
- [ ] Fix CloudFront redirect settings if needed
- [ ] Check DNS records exist for both domains
- [ ] Update sitemap.xml priorities
- [ ] Deploy changes
- [ ] Submit fixes in Search Console
- [ ] Wait and monitor weekly