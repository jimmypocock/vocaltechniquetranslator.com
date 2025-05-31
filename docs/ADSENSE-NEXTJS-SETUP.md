# Google AdSense Setup for Vocal Technique Translator

## Setup Instructions

### 1. Environment Variables

Update your `.env` file in the root directory with your AdSense configuration.

Add your AdSense publisher ID:
```
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
```

### 2. Create Ad Units in AdSense

Log into your [Google AdSense account](https://www.google.com/adsense) and create the following ad units:

1. **Header Banner** (Responsive Display)
   - Name: `VTT_Header_Banner`
   - Type: Display ads
   - Size: Responsive
   
2. **Content Middle** (In-article)
   - Name: `VTT_Content_Middle`
   - Type: In-article ads (native)
   
3. **Footer Banner** (Responsive Display)
   - Name: `VTT_Footer_Banner`
   - Type: Display ads
   - Size: Responsive

### 3. Update Ad Slot IDs

Replace the placeholder slot IDs in `components/VocalTranslatorApp.tsx`:

```tsx
// Replace these with your actual ad slot IDs
adSlot="1234567890"  // Header banner slot
adSlot="2345678901"  // Content middle slot
adSlot="3456789012"  // Footer banner slot
```

## Features Implemented

### ✅ Responsive Ad Components
- `AdUnit` - Base component with automatic responsive sizing
- `AdBanner` - Horizontal banner ads (728x90, 468x60, responsive)
- `AdSidebar` - Vertical ads for desktop (160x600, 300x250)
- `AdStickyBottom` - Mobile sticky footer ad (320x50)

### ✅ Privacy Compliance
- Cookie consent banner with accept/decline options
- Ads only load after user consent
- Privacy policy page with AdSense disclosure
- GDPR-compliant implementation

### ✅ Development Features
- Visual placeholders in development mode
- Test mode for staging environments
- Automatic environment detection
- Console error handling

### ✅ Optimized Placements
1. **Below Header** - High visibility without disrupting initial view
2. **Between Input/Output** - Natural pause point in user workflow  
3. **Footer Area** - Non-intrusive placement after content

## Testing

### Local Development
Ads show as placeholders with slot information. This helps with:
- Layout testing
- Responsive behavior verification
- User experience validation

### Production Testing
1. Deploy with your AdSense client ID
2. Verify ads load after accepting cookies
3. Test on multiple devices and screen sizes
4. Monitor AdSense dashboard for impressions

## Performance Considerations

- Ads lazy load using Next.js Script component
- Non-blocking async loading strategy
- Minimal impact on Core Web Vitals
- Proper error boundaries to prevent crashes

## Monitoring

Track performance using:
- Google AdSense dashboard
- Google Analytics (ad interaction events)
- Core Web Vitals monitoring
- User feedback on ad placement

## Best Practices Applied

1. **User Experience First**
   - Ads don't interfere with core functionality
   - Clear visual separation from content
   - Dismissible sticky ads on mobile

2. **Revenue Optimization**
   - Strategic placement based on heat maps
   - Mix of ad formats for variety
   - Responsive sizing for all devices

3. **Compliance**
   - Full GDPR cookie consent
   - Clear privacy policy
   - No ads without consent

## Next Steps

1. **A/B Testing**
   - Test different ad positions
   - Experiment with ad density
   - Try native vs display formats

2. **Advanced Features**
   - Implement refresh for long sessions
   - Add viewability tracking
   - Create custom ad loading animations

3. **Optimization**
   - Monitor CLS impact
   - Optimize for Core Web Vitals
   - Implement smart ad refresh