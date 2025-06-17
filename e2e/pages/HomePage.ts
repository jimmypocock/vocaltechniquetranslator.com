import { Page, Locator } from '@playwright/test'

export class HomePage {
  readonly page: Page
  readonly lyricsTextarea: Locator
  readonly intensitySlider: Locator
  readonly intensityButtons: Locator
  readonly formattedLyrics: Locator
  readonly viewModeToggle: Locator
  readonly copyButton: Locator
  readonly feedbackButton: Locator
  readonly keyboardShortcutsButton: Locator

  constructor(page: Page) {
    this.page = page
    this.lyricsTextarea = page.getByPlaceholder('Enter your song lyrics here...')
    // No translate button - app auto-translates
    this.intensitySlider = page.locator('input[type="range"]').first()
    this.intensityButtons = page.locator('button').filter({ hasText: /^[1-9]$|^10$/ })
    this.formattedLyrics = page.locator('.formatted-lyrics, [class*="formatted"], .output-section').first()
    this.viewModeToggle = page.locator('.view-toggle-button').first()
    this.copyButton = page.locator('button:has-text("Copy")').first()
    this.feedbackButton = page.locator('button:has-text("Feedback")').first()
    this.keyboardShortcutsButton = page.locator('button[title*="Keyboard shortcuts"], button:has-text("?")').first()
  }

  async goto() {
    await this.page.goto('/')
  }

  async enterLyrics(lyrics: string) {
    await this.lyricsTextarea.fill(lyrics)
  }

  async clickTranslate() {
    // App auto-translates, so this is no longer needed
    // Just wait for translation to appear
    await this.waitForTranslation()
  }

  async setIntensityViaSlider(value: number) {
    await this.intensitySlider.fill(value.toString())
  }

  async setIntensityViaButton(level: number) {
    // The app has 3 intensity levels: 1 (Minimal), 4 (Moderate), 8 (Maximum)
    let label: string
    if (level <= 3) label = 'Minimal'
    else if (level <= 7) label = 'Moderate'
    else label = 'Maximum'
    
    await this.page.getByRole('button', { name: new RegExp(label, 'i') }).click()
  }

  async getTranslatedText() {
    // Wait for translation to appear
    await this.waitForTranslation()
    
    // Get the body text and extract the translated portion
    const allText = await this.page.textContent('body')
    const inputText = await this.lyricsTextarea.inputValue()
    
    if (!allText) return null
    
    // Look for the pattern: original text followed by translated text with hyphens
    // The translated text typically has syllable separators (hyphens)
    const lines = allText.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      // Find lines that contain hyphens and are different from input
      if (line && 
          line !== inputText && 
          line.includes('-') && 
          line.length > 3 &&
          !line.includes('Vocal Technique') &&
          !line.includes('Copyright') &&
          !line.includes('Articles')) {
        return line
      }
    }
    return null
  }

  async copyToClipboard() {
    await this.copyButton.click()
  }

  async toggleViewMode() {
    await this.viewModeToggle.click()
  }

  async openFeedbackModal() {
    await this.feedbackButton.click()
  }

  async openKeyboardShortcuts() {
    await this.keyboardShortcutsButton.click()
  }

  async clearLyrics() {
    // Clear by selecting all text and deleting
    await this.lyricsTextarea.click()
    // Use different key combination based on platform
    const isMac = process.platform === 'darwin'
    await this.lyricsTextarea.press(isMac ? 'Meta+a' : 'Control+a')
    await this.lyricsTextarea.press('Delete')
  }

  async waitForTranslation() {
    // Wait for auto-translation to complete
    await this.page.waitForTimeout(1000) // Wait for debounce and processing
    // Check if translation section appears
    const translationHeading = this.page.locator('text="Translated for Vocal Technique"')
    await translationHeading.waitFor({ state: 'visible', timeout: 10000 })
  }

  async getIntensityValue() {
    // Try to get from slider first, if not visible, determine from active button
    if (await this.intensitySlider.isVisible()) {
      return await this.intensitySlider.inputValue()
    }
    
    // Try to get from the intensity display number
    const intensityDisplay = this.page.locator('.text-3xl.font-bold.text-purple-600')
    if (await intensityDisplay.isVisible()) {
      const intensityText = await intensityDisplay.textContent()
      if (intensityText) {
        return intensityText.trim()
      }
    }
    
    // Check which intensity button is active
    const minimalActive = await this.page.locator('button:has-text("Minimal")').evaluate(el => 
      el.classList.contains('border-purple-500') || el.classList.contains('bg-purple-50')
    )
    if (minimalActive) return '1'
    
    const moderateActive = await this.page.locator('button:has-text("Moderate")').evaluate(el => 
      el.classList.contains('border-purple-500') || el.classList.contains('bg-purple-50')
    )
    if (moderateActive) return '4'
    
    return '8' // Maximum is default
  }

  async isCondensedView() {
    // Check if view toggle button has condensed state (shows expand icon)
    const ariaLabel = await this.viewModeToggle.getAttribute('aria-label')
    return ariaLabel?.includes('expanded') || false
  }

  async isFullView() {
    // Check if view toggle button has full state (shows compress icon)
    const ariaLabel = await this.viewModeToggle.getAttribute('aria-label')
    return ariaLabel?.includes('condensed') || false
  }
}