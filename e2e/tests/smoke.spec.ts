import { test, expect } from '../fixtures/test'
import { handleConsentBanner } from '../utils/test-helpers'

test.describe('Smoke Tests', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/')
    
    await handleConsentBanner(page)
    
    // Check page title
    await expect(page).toHaveTitle(/Vocal Technique Translator/)
    
    // Check main elements are present - wait for them to load
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 })
    await expect(page.getByPlaceholder('Enter your song lyrics here...')).toBeVisible()
    
    // The app auto-translates, so we don't need a translate button
    // Just check that the textarea is present
    const textarea = page.getByPlaceholder('Enter your song lyrics here...')
    await expect(textarea).toBeVisible()
  })

  test('should have working navigation', async ({ page }) => {
    await page.goto('/')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    await handleConsentBanner(page)
    
    // Check navigation links exist - use more specific selectors since there are multiple links
    const aboutLink = page.getByRole('link', { name: /about/i }).first()
    const howItWorksLink = page.getByRole('link', { name: /how it works/i }).first()
    
    // Wait for links to be visible
    await expect(aboutLink).toBeVisible({ timeout: 10000 })
    await expect(howItWorksLink).toBeVisible()
    
    // Navigate to About
    await aboutLink.click()
    await expect(page).toHaveURL(/\/about/)
    await expect(page.locator('h1:has-text("About")')).toBeVisible()
    
    // Navigate back and then to How It Works
    await page.goto('/')
    await page.getByRole('link', { name: /how it works/i }).first().click()
    await expect(page).toHaveURL(/\/how-it-works/)
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should perform a basic translation', async ({ page }) => {
    await page.goto('/')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    await handleConsentBanner(page)
    
    // Enter text
    const textarea = page.getByPlaceholder('Enter your song lyrics here...')
    await textarea.fill('Hello world')
    
    // The app auto-translates, so wait for the translation to appear
    // Look for the formatted lyrics container
    await page.waitForTimeout(500) // Wait for debounce
    
    // Check if translation appeared (look for the formatted lyrics section)
    const translatedSection = page.locator('.formatted-lyrics, [class*="formatted"], .output-section').first()
    await expect(translatedSection).toBeVisible({ timeout: 5000 })
    
    // Verify translation happened by checking the content changed
    const translatedText = await translatedSection.textContent()
    expect(translatedText).toBeTruthy()
    expect(translatedText?.toLowerCase()).not.toContain('hello world')
  })
})