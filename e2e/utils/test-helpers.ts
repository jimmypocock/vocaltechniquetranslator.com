import { Page } from '@playwright/test'

export async function waitForLocalStorage(page: Page, key: string, timeout = 5000) {
  await page.waitForFunction(
    (k) => localStorage.getItem(k) !== null,
    key,
    { timeout }
  )
}

export async function getLocalStorageItem(page: Page, key: string) {
  return await page.evaluate((k) => localStorage.getItem(k), key)
}

export async function setLocalStorageItem(page: Page, key: string, value: string) {
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [key, value])
}

export async function clearLocalStorage(page: Page) {
  await page.evaluate(() => localStorage.clear())
}

export async function mockApiResponse(page: Page, url: string, response: unknown, status = 200) {
  await page.route(url, (route) => {
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(response)
    })
  })
}

export async function waitForNetworkIdle(page: Page, timeout = 3000) {
  await page.waitForLoadState('networkidle', { timeout })
}

export async function measurePerformance(page: Page, action: () => Promise<void>) {
  const startTime = Date.now()
  await action()
  const endTime = Date.now()
  return endTime - startTime
}

export async function checkAccessibility(page: Page, selector?: string) {
  const target = selector ? page.locator(selector) : page
  
  // Check for basic accessibility attributes
  const checks = {
    hasAltText: async () => {
      const images = await target.locator('img:not([alt])').count()
      return images === 0
    },
    hasAriaLabels: async () => {
      const buttons = await target.locator('button:not([aria-label]):not(:has-text(""))').count()
      return buttons === 0
    },
    hasProperHeadings: async () => {
      const h1Count = await target.locator('h1').count()
      return h1Count === 1 // Should have exactly one h1
    }
  }
  
  const results: Record<string, boolean> = {}
  for (const [check, fn] of Object.entries(checks)) {
    results[check] = await fn()
  }
  
  return results
}

export function generateTestLyrics(lines: number = 4): string {
  const templates = [
    'Walking down the street today',
    'Sunshine in my heart to stay',
    'Everything will be okay',
    'Living life in my own way',
    'Dancing through the night away',
    'Singing songs of yesterday',
    'Dreams that never fade away',
    'Love that grows from day to day'
  ]
  
  const lyrics: string[] = []
  for (let i = 0; i < lines; i++) {
    lyrics.push(templates[i % templates.length])
  }
  
  return lyrics.join('\n')
}

export async function takeScreenshotOnFailure(page: Page, testName: string) {
  const timestamp = new Date().toISOString().replace(/:/g, '-')
  await page.screenshot({
    path: `e2e/screenshots/${testName}-${timestamp}.png`,
    fullPage: true
  })
}

export async function simulateSlowNetwork(page: Page) {
  // Simulate 3G network
  await page.route('**/*', (route) => {
    setTimeout(() => route.continue(), 500)
  })
}

export async function handleConsentBanner(page: Page) {
  // Handle consent banner if it appears
  const consentButton = page.getByRole('button', { name: 'Consent' })
  if (await consentButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await consentButton.click()
    await page.waitForTimeout(500) // Wait for banner to disappear
  }
}

export async function waitForAutoTranslation(page: Page) {
  // Wait for the debounce delay (500ms) plus some buffer
  await page.waitForTimeout(700)
}