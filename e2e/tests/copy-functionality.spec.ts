import { test, expect } from '../fixtures/test'

test.describe('Copy Functionality', () => {
  test.beforeEach(async ({ homePage, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    
    await homePage.goto()
    await homePage.enterLyrics('Copy this text')
    await homePage.clickTranslate()
    await homePage.waitForTranslation()
  })

  test('should copy translated text to clipboard', async ({ page, homePage }) => {
    // Copy to clipboard
    await homePage.copyToClipboard()
    
    // Read clipboard content
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
    
    // Should contain translated text
    expect(clipboardText).toBeTruthy()
    expect(clipboardText).not.toBe('Copy this text') // Should be transformed
  })

  test('should show copy feedback', async ({ page, homePage }) => {
    // Look for copy button
    const copyButton = homePage.copyButton
    
    // Get initial text
    const initialText = await copyButton.textContent()
    
    // Click copy
    await homePage.copyToClipboard()
    
    // Button text should change temporarily (e.g., to "Copied!")
    const afterClickText = await copyButton.textContent()
    expect(afterClickText).not.toBe(initialText)
    
    // Wait and verify it returns to original
    await page.waitForTimeout(2000)
    const finalText = await copyButton.textContent()
    expect(finalText).toBe(initialText)
  })

  test('should copy different content based on view mode', async ({ page, homePage }) => {
    // Copy in full view
    await homePage.copyToClipboard()
    const fullViewClipboard = await page.evaluate(() => navigator.clipboard.readText())
    
    // Switch to condensed view
    await homePage.toggleViewMode()
    
    // Copy in condensed view
    await homePage.copyToClipboard()
    const condensedViewClipboard = await page.evaluate(() => navigator.clipboard.readText())
    
    // Content should be different
    expect(fullViewClipboard).not.toBe(condensedViewClipboard)
    
    // Full view should be longer (includes original + translated)
    expect(fullViewClipboard.length).toBeGreaterThan(condensedViewClipboard.length)
  })

  test('should copy multi-line content with formatting', async ({ page, homePage }) => {
    // Clear and add multi-line content
    await homePage.clearLyrics()
    await homePage.enterLyrics(`Line one
Line two
Line three`)
    await homePage.clickTranslate()
    await homePage.waitForTranslation()
    
    // Copy
    await homePage.copyToClipboard()
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
    
    // Should preserve line breaks
    const lines = clipboardText.split('\n').filter(line => line.trim())
    expect(lines.length).toBeGreaterThan(2) // At least 3 lines
  })

  test('should handle copy when no translation exists', async ({ homePage }) => {
    // Clear everything
    await homePage.clearLyrics()
    
    // Copy button should not be visible or should be disabled
    const isCopyVisible = await homePage.copyButton.isVisible()
    
    if (isCopyVisible) {
      const isDisabled = await homePage.copyButton.isDisabled()
      expect(isDisabled).toBe(true)
    } else {
      expect(isCopyVisible).toBe(false)
    }
  })

  test('should copy with keyboard shortcut', async ({ page, homePage }) => {
    // Focus on the formatted lyrics area
    await homePage.formattedLyrics.focus()
    
    // Use keyboard shortcut
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control'
    await page.keyboard.press(`${modifier}+KeyC`)
    
    // Verify clipboard has content
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipboardText).toBeTruthy()
  })

  test('should copy intensity-specific translation', async ({ page, homePage }) => {
    // Copy at intensity 1
    await homePage.setIntensityViaButton(1)
    await homePage.waitForTranslation()
    await homePage.copyToClipboard()
    const intensity1Clipboard = await page.evaluate(() => navigator.clipboard.readText())
    
    // Copy at intensity 10
    await homePage.setIntensityViaButton(10)
    await homePage.waitForTranslation()
    await homePage.copyToClipboard()
    const intensity10Clipboard = await page.evaluate(() => navigator.clipboard.readText())
    
    // Should be different
    expect(intensity1Clipboard).not.toBe(intensity10Clipboard)
    
    // Higher intensity should have more transformations (hyphens)
    const hyphens1 = (intensity1Clipboard.match(/-/g) || []).length
    const hyphens10 = (intensity10Clipboard.match(/-/g) || []).length
    expect(hyphens10).toBeGreaterThan(hyphens1)
  })

  test('should handle special characters in copy', async ({ page, homePage }) => {
    await homePage.clearLyrics()
    await homePage.enterLyrics(`Special chars: "quotes" & ampersand
Apostrophe's and dots...`)
    await homePage.clickTranslate()
    await homePage.waitForTranslation()
    
    await homePage.copyToClipboard()
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
    
    // Should preserve some special characters
    expect(clipboardText).toContain('"')
    expect(clipboardText).toContain('&')
    expect(clipboardText).toContain('...')
  })
})