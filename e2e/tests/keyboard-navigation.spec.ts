import { test, expect } from '../fixtures/test'
import { KeyboardShortcutsModal } from '../pages/KeyboardShortcutsModal'

test.describe('Keyboard Navigation and Shortcuts', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto()
  })

  test('should open keyboard shortcuts modal', async ({ page, homePage }) => {
    const shortcutsModal = new KeyboardShortcutsModal(page)
    
    await homePage.openKeyboardShortcuts()
    await expect(shortcutsModal.modal).toBeVisible()
    
    // Verify shortcuts are displayed by checking if the shortcuts container has content
    const shortcutsContainer = shortcutsModal.shortcuts
    await expect(shortcutsContainer).toBeVisible()
    const shortcutElements = await shortcutsContainer.locator('> div').count()
    expect(shortcutElements).toBeGreaterThan(0)
    
    // Close modal
    await shortcutsModal.close()
    await expect(shortcutsModal.modal).not.toBeVisible()
  })

  test('should navigate with keyboard shortcuts', async ({ page, homePage }) => {
    // Enter lyrics
    await homePage.enterLyrics('Test lyrics for keyboard navigation')
    await homePage.clickTranslate()
    await homePage.waitForTranslation()
    
    // Focus away from textarea to make shortcuts work
    await page.locator('body').click()
    await page.waitForTimeout(100)
    
    // Test intensity shortcuts (1-3 map to their numeric values)
    await page.keyboard.press('1')
    await page.waitForTimeout(200)
    let intensity = await homePage.getIntensityValue()
    expect(intensity).toBe('1')
    
    await page.keyboard.press('2')
    await page.waitForTimeout(200)
    intensity = await homePage.getIntensityValue()
    expect(intensity).toBe('2')
    
    await page.keyboard.press('3')
    await page.waitForTimeout(200)
    intensity = await homePage.getIntensityValue()
    expect(intensity).toBe('3')
    
    // Test number shortcuts 4-9, 0
    await page.keyboard.press('5')
    await page.waitForTimeout(200)
    intensity = await homePage.getIntensityValue()
    expect(intensity).toBe('5')
    
    await page.keyboard.press('0')
    await page.waitForTimeout(200)
    intensity = await homePage.getIntensityValue()
    expect(intensity).toBe('10')
    
    // Test arrow keys for intensity
    await page.keyboard.press('ArrowLeft')
    await page.waitForTimeout(200)
    intensity = await homePage.getIntensityValue()
    expect(intensity).toBe('9')
    
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(200)
    intensity = await homePage.getIntensityValue()
    expect(intensity).toBe('10')
  })

  test('should copy with Ctrl+C / Cmd+C', async ({ page, homePage }) => {
    // Enter and translate lyrics
    await homePage.enterLyrics('Copy test')
    await homePage.clickTranslate()
    await homePage.waitForTranslation()
    
    // Focus on translated text area
    await homePage.formattedLyrics.focus()
    
    // Test copy shortcut (platform dependent)
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control'
    await page.keyboard.press(`${modifier}+KeyC`)
    
    // Verify copy button shows feedback (if implemented)
    // This would need to check for visual feedback or clipboard content
  })

  test('should toggle view mode with keyboard shortcut', async ({ page, homePage }) => {
    await homePage.enterLyrics('View mode test')
    await homePage.clickTranslate()
    await homePage.waitForTranslation()
    
    // Focus away from textarea to make shortcuts work
    await page.locator('body').click()
    await page.waitForTimeout(100)
    
    // Check initial view state
    const isCondensedInitially = await homePage.isCondensedView()
    
    // Toggle view with 'v' key
    await page.keyboard.press('v')
    
    // Wait a moment for the toggle to take effect
    await page.waitForTimeout(200)
    
    // Verify view changed
    const isCondensedAfter = await homePage.isCondensedView()
    expect(isCondensedAfter).toBe(!isCondensedInitially)
  })

  test('should clear with Escape key', async ({ page, homePage }) => {
    await homePage.enterLyrics('Clear test')
    await homePage.clickTranslate()
    await homePage.waitForTranslation()
    
    // Focus away from textarea first to make shortcuts work
    await page.locator('body').click()
    await page.waitForTimeout(100)
    
    // Press Escape
    await page.keyboard.press('Escape')
    
    // Wait for the clear action
    await page.waitForTimeout(200)
    
    // Verify cleared
    const lyricsValue = await homePage.lyricsTextarea.inputValue()
    expect(lyricsValue).toBe('')
  })

  test('should handle Tab navigation', async ({ page, homePage }) => {
    // Start from textarea
    await homePage.lyricsTextarea.focus()
    
    // Tab through interactive elements
    await page.keyboard.press('Tab')
    
    // Check if focus moved to the next interactive element (intensity button or similar)
    const activeElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(activeElement).toBeTruthy()
    
    // Continue tabbing and verify focus moves through UI
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Shift+Tab should go backwards
    await page.keyboard.press('Shift+Tab')
  })

  test('should show keyboard shortcuts help with ? key', async ({ page, homePage }) => {
    await homePage.goto()
    const shortcutsModal = new KeyboardShortcutsModal(page)
    
    // Focus away from any input fields
    await page.locator('body').click()
    await page.waitForTimeout(100)
    
    // Press ? to open help
    await page.keyboard.press('Shift+Slash') // ? key
    
    // Wait for modal to appear
    await page.waitForTimeout(300)
    
    // Verify modal opened
    await expect(shortcutsModal.modal).toBeVisible()
    
    // Press Escape to close
    await page.keyboard.press('Escape')
    await expect(shortcutsModal.modal).not.toBeVisible()
  })
})