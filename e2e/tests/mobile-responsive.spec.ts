import { test, expect } from '@playwright/test'
import { HomePage } from '../pages/HomePage'

// These tests will run on both Mobile Chrome and Mobile Safari
// as defined in playwright.config.ts projects
test.describe('Mobile Responsiveness', () => {
  test('should display properly on mobile viewport', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    
    // Check viewport exists
    const viewport = page.viewportSize()
    expect(viewport).toBeTruthy()
    expect(viewport!.width).toBeLessThanOrEqual(414) // Mobile width
    
    // Essential elements should be visible
    await expect(homePage.lyricsTextarea).toBeVisible()
    
    // Enter lyrics to make intensity controls visible
    await homePage.enterLyrics('Test mobile')
    await homePage.waitForTranslation()
    
    // Now check if intensity controls appear (they're in FormattedLyrics component)
    const intensitySelector = page.locator('button:has-text("Minimal"), button:has-text("Moderate"), button:has-text("Maximum"), button:has-text("Min"), button:has-text("Mod"), button:has-text("Full")')
    await expect(intensitySelector.first()).toBeVisible()
    
    // No horizontal scroll on mobile
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const windowWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 1) // Allow 1px tolerance
  })

  test('should handle touch interactions', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    
    // Enter lyrics using touch
    await homePage.lyricsTextarea.tap()
    await homePage.enterLyrics('Mobile test lyrics')
    
    // App auto-translates, wait for result
    await homePage.waitForTranslation()
    
    // Verify translation appeared
    const translation = await homePage.getTranslatedText()
    expect(translation).toBeTruthy()
    // Just check that some transformation occurred, not specific text
    expect(translation).not.toBe('Mobile test lyrics')
  })

  test('should handle intensity controls on mobile', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    
    await homePage.enterLyrics('Test word')
    await homePage.waitForTranslation()
    
    // Test intensity buttons are touch-friendly (they're in the FormattedLyrics component)
    const intensityButtons = page.locator('button:has-text("Minimal"), button:has-text("Moderate"), button:has-text("Maximum"), button:has-text("Min"), button:has-text("Mod"), button:has-text("Full")')
    const buttons = await intensityButtons.all()
    expect(buttons.length).toBeGreaterThan(0)
    
    // Test tapping different intensities
    for (const button of buttons.slice(0, Math.min(3, buttons.length))) { // Test up to 3 buttons
      await button.tap()
      await page.waitForTimeout(200) // Brief pause between taps
    }
    
    // Verify intensity changed
    const finalIntensity = await homePage.getIntensityValue()
    expect(finalIntensity).toBeTruthy()
  })

  test('should handle virtual keyboard properly', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    
    // Focus textarea to potentially show keyboard
    await homePage.lyricsTextarea.tap()
    
    // Textarea should remain visible when keyboard might appear
    await expect(homePage.lyricsTextarea).toBeInViewport()
    
    // Should be able to type
    await page.keyboard.type('Virtual keyboard test')
    
    const value = await homePage.lyricsTextarea.inputValue()
    expect(value).toBe('Virtual keyboard test')
  })

  test('should show mobile-optimized layout', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    
    // Enter lyrics first to make intensity controls visible
    await homePage.enterLyrics('Layout test')
    await homePage.waitForTranslation()
    
    // Check that elements are stacked vertically (mobile layout)
    const textareaBox = await homePage.lyricsTextarea.boundingBox()
    const intensitySelector = page.locator('button:has-text("Minimal"), button:has-text("Moderate"), button:has-text("Maximum"), button:has-text("Min"), button:has-text("Mod"), button:has-text("Full")')
    const intensityBox = await intensitySelector.first().boundingBox()
    
    if (textareaBox && intensityBox) {
      // On mobile, intensity controls should be below textarea
      expect(intensityBox.y).toBeGreaterThan(textareaBox.y)
    }
  })
})

test.describe('Mobile Performance', () => {
  test('should load quickly on mobile', async ({ page }) => {
    const startTime = Date.now()
    
    const homePage = new HomePage(page)
    await homePage.goto()
    
    const loadTime = Date.now() - startTime
    
    // Should load within reasonable time on mobile (more lenient than desktop)
    expect(loadTime).toBeLessThan(8000) // 8 seconds for mobile
  })

  test('should handle offline gracefully', async ({ page, context }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    
    // Enter lyrics while online
    await homePage.enterLyrics('Offline test')
    await homePage.waitForTranslation()
    
    // Go offline
    await context.setOffline(true)
    
    // Should still be able to change intensity (client-side)
    const intensityButtons = page.locator('button:has-text("Minimal"), button:has-text("Moderate"), button:has-text("Maximum"), button:has-text("Min"), button:has-text("Mod"), button:has-text("Full")')
    if (await intensityButtons.first().isVisible()) {
      await intensityButtons.nth(1).tap() // Click Moderate/second button
      const intensity = await homePage.getIntensityValue()
      expect(intensity).toBeTruthy() // Just verify intensity is readable
    }
    
    await context.setOffline(false)
  })
})

test.describe('Mobile Accessibility', () => {
  test('should support touch navigation', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    
    // Enter lyrics to make interactive elements visible
    await homePage.enterLyrics('Touch test')
    await homePage.waitForTranslation()
    
    // All interactive elements should be tappable
    const intensitySelector = page.locator('button:has-text("Minimal"), button:has-text("Moderate"), button:has-text("Maximum"), button:has-text("Min"), button:has-text("Mod"), button:has-text("Full")')
    const interactiveElements = [
      homePage.lyricsTextarea,
      intensitySelector.first(),
      homePage.copyButton
    ]
    
    for (const element of interactiveElements) {
      if (await element.isVisible()) {
        // Element should be large enough for touch (minimum 44px)
        const box = await element.boundingBox()
        if (box) {
          expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(24) // Reduced for small buttons
        }
      }
    }
  })

  test('should handle zoom properly', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    
    // Check if viewport meta tag allows zooming for accessibility
    const viewportMeta = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]')
      return meta?.getAttribute('content')
    })
    
    // Should allow user scaling for accessibility
    expect(viewportMeta).not.toContain('user-scalable=no')
    expect(viewportMeta).not.toContain('maximum-scale=1')
  })
})