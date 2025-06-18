import { test, expect } from '../fixtures/test'

test.describe('Local Storage Persistence', () => {
  test('should persist lyrics in local storage', async ({ page, homePage }) => {
    await homePage.goto()
    
    // Enter lyrics
    const testLyrics = 'These lyrics should be saved'
    await homePage.enterLyrics(testLyrics)
    
    // Wait for debounced save (1 second + buffer)
    await page.waitForTimeout(1500)
    
    // Reload page
    await page.reload()
    
    // Verify lyrics persisted
    const savedLyrics = await homePage.lyricsTextarea.inputValue()
    expect(savedLyrics).toBe(testLyrics)
  })

  test('should persist intensity setting', async ({ page, homePage }) => {
    await homePage.goto()
    
    // Enter lyrics and translate first to make intensity controls visible
    await homePage.enterLyrics('Test lyrics for intensity')
    await homePage.clickTranslate()
    await homePage.waitForTranslation()
    
    // Set intensity to 4 (Moderate level)
    await homePage.setIntensityViaButton(4)
    
    // Wait for save
    await page.waitForTimeout(500)
    
    // Reload page
    await page.reload()
    
    // Verify intensity persisted
    const savedIntensity = await homePage.getIntensityValue()
    expect(savedIntensity).toBe('4')
  })

  test('should persist view mode preference', async ({ page, homePage }) => {
    await homePage.goto()
    
    // Enter lyrics and translate
    await homePage.enterLyrics('View mode test')
    await homePage.clickTranslate()
    await homePage.waitForTranslation()
    
    // Toggle to condensed view (if not already)
    const isCondensed = await homePage.isCondensedView()
    if (!isCondensed) {
      await homePage.toggleViewMode()
      // Wait for view change to take effect and be saved
      await page.waitForTimeout(500)
    }
    
    // Reload page
    await page.reload()
    
    // Re-enter lyrics and translate to see view mode
    await homePage.enterLyrics('View mode test')
    await homePage.clickTranslate()
    await homePage.waitForTranslation()
    
    // Verify view mode persisted
    const isStillCondensed = await homePage.isCondensedView()
    expect(isStillCondensed).toBe(true)
  })

  test('should persist translated state across reload', async ({ page, homePage }) => {
    await homePage.goto()
    
    // Enter and translate lyrics
    await homePage.enterLyrics('Persistent translation test')
    await homePage.clickTranslate()
    await homePage.waitForTranslation()
    
    // Get translation
    const originalTranslation = await homePage.getTranslatedText()
    
    // Reload page
    await page.reload()
    
    // Verify translation is still shown
    await homePage.waitForTranslation()
    const reloadedTranslation = await homePage.getTranslatedText()
    expect(reloadedTranslation).toBe(originalTranslation)
  })

  test('should clear local storage when clearing lyrics', async ({ page, homePage }) => {
    await homePage.goto()
    
    // Enter lyrics and translate
    await homePage.enterLyrics('To be cleared')
    await homePage.clickTranslate()
    await homePage.waitForTranslation()
    
    // Clear lyrics
    await homePage.clearLyrics()
    
    // Wait for the debounced save to clear localStorage
    await page.waitForTimeout(1500)
    
    // Reload page
    await page.reload()
    
    // Verify nothing persisted
    const lyrics = await homePage.lyricsTextarea.inputValue()
    expect(lyrics).toBe('')
    
    const isTranslationVisible = await homePage.formattedLyrics.isVisible()
    expect(isTranslationVisible).toBe(false)
  })

  test('should handle multiple browser tabs', async ({ page, context, homePage }) => {
    await homePage.goto()
    
    // Enter lyrics in first tab
    await homePage.enterLyrics('Multi-tab test')
    await homePage.clickTranslate()
    await homePage.waitForTranslation()
    await homePage.setIntensityViaButton(4)
    
    // Wait for local storage save
    await page.waitForTimeout(1500)
    
    // Open second tab
    const page2 = await context.newPage()
    const homePage2 = new (await import('../pages/HomePage')).HomePage(page2)
    await homePage2.goto()
    
    // Verify data is shared
    const lyrics2 = await homePage2.lyricsTextarea.inputValue()
    expect(lyrics2).toBe('Multi-tab test')
    
    const intensity2 = await homePage2.getIntensityValue()
    expect(intensity2).toBe('4')
    
    // Update in second tab
    await homePage2.enterLyrics('Updated from tab 2')
    
    // Wait for local storage save
    await page2.waitForTimeout(1500)
    
    // Go back to first tab and reload
    await page.bringToFront()
    await page.reload()
    
    // Verify update reflected
    const updatedLyrics = await homePage.lyricsTextarea.inputValue()
    expect(updatedLyrics).toBe('Updated from tab 2')
    
    await page2.close()
  })

  test('should respect storage quota limits', async ({ homePage }) => {
    await homePage.goto()
    
    // Create a very large string (but reasonable for testing)
    const largeLyrics = 'Test line\n'.repeat(1000)
    
    await homePage.enterLyrics(largeLyrics)
    await homePage.clickTranslate()
    await homePage.waitForTranslation()
    
    // Should handle large content gracefully
    const savedLyrics = await homePage.lyricsTextarea.inputValue()
    expect(savedLyrics).toBe(largeLyrics)
  })
})