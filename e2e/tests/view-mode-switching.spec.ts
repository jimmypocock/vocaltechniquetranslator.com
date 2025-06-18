import { test, expect } from '../fixtures/test'

test.describe('View Mode Switching', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto()
    await homePage.enterLyrics('Blue jean baby, L.A. lady\nSeamstress for the band')
    await homePage.clickTranslate()
    await homePage.waitForTranslation()
  })

  test('should toggle between full and condensed view', async ({ homePage, page }) => {
    // Check initial state
    const initialViewButton = page.locator('button:has-text("View:")').first()
    const initialText = await initialViewButton.textContent()
    
    // Toggle view
    await homePage.toggleViewMode()
    
    // Verify view changed
    const updatedText = await initialViewButton.textContent()
    expect(updatedText).not.toBe(initialText)
    
    // Toggle back
    await homePage.toggleViewMode()
    const finalText = await initialViewButton.textContent()
    expect(finalText).toBe(initialText)
  })

  test('should show original lyrics in full view', async ({ homePage, page }) => {
    // Ensure we're in full view
    const viewButton = page.locator('button:has-text("View:")').first()
    const viewText = await viewButton.textContent()
    
    if (viewText?.includes('Condensed')) {
      await homePage.toggleViewMode()
    }
    
    // In full view, should see both original and translated
    const content = await homePage.formattedLyrics.textContent()
    expect(content).toContain('Blue jean baby') // Original
    expect(content).toContain('-') // Translation with syllables
  })

  test('should show only translation in condensed view', async ({ homePage, page }) => {
    // Ensure we're in condensed view
    const viewButton = page.locator('button:has-text("View:")').first()
    const viewText = await viewButton.textContent()
    
    if (viewText?.includes('Full')) {
      await homePage.toggleViewMode()
    }
    
    // In condensed view, should only see translation
    const content = await homePage.formattedLyrics.textContent()
    expect(content).not.toContain('Blue jean baby') // No original
    expect(content).toContain('-') // Only translation
  })

  test('should maintain view mode when changing intensity', async ({ homePage, page }) => {
    // Set to condensed view
    const viewButton = page.locator('button:has-text("View:")').first()
    const initialView = await viewButton.textContent()
    
    if (initialView?.includes('Full')) {
      await homePage.toggleViewMode()
    }
    
    // Change intensity
    await homePage.setIntensityViaButton(8)
    await homePage.waitForTranslation()
    
    // View mode should remain condensed
    const afterIntensityView = await viewButton.textContent()
    expect(afterIntensityView).toContain('Condensed')
  })

  test('should update copy functionality based on view mode', async ({ homePage, page }) => {
    // In full view, copy should include both original and translation
    await homePage.copyToClipboard()
    
    // Switch to condensed view
    await homePage.toggleViewMode()
    
    // Copy again - should only copy translation
    await homePage.copyToClipboard()
    
    // Note: Actually verifying clipboard content requires additional setup
    // This test ensures the copy button works in both modes
  })

  test('should handle view mode with multi-line content', async ({ homePage, page }) => {
    // Enter multi-line lyrics
    await homePage.clearLyrics()
    await homePage.enterLyrics(`Line one
Line two
Line three
Line four`)
    await homePage.clickTranslate()
    await homePage.waitForTranslation()
    
    // Test both views maintain line structure
    const fullViewContent = await homePage.formattedLyrics.textContent()
    const fullViewLines = fullViewContent?.split('\n').filter(line => line.trim()).length || 0
    
    await homePage.toggleViewMode()
    
    const condensedViewContent = await homePage.formattedLyrics.textContent()
    const condensedViewLines = condensedViewContent?.split('\n').filter(line => line.trim()).length || 0
    
    // Both should maintain structure (condensed has fewer lines as no original)
    expect(fullViewLines).toBeGreaterThan(condensedViewLines)
    expect(condensedViewLines).toBe(4) // Just the 4 translated lines
  })

  test('should show view toggle only when translation exists', async ({ homePage, page }) => {
    // Clear and verify no view toggle
    await homePage.clearLyrics()
    
    const viewToggleCount = await page.locator('button:has-text("View:")').count()
    expect(viewToggleCount).toBe(0)
    
    // Add lyrics and translate
    await homePage.enterLyrics('Test')
    await homePage.clickTranslate()
    await homePage.waitForTranslation()
    
    // Now view toggle should appear
    const viewToggleAfterTranslate = await page.locator('button:has-text("View:")').count()
    expect(viewToggleAfterTranslate).toBeGreaterThan(0)
  })
})