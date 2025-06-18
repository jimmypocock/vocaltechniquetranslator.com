import { Page, Locator } from '@playwright/test'

export class KeyboardShortcutsModal {
  readonly page: Page
  readonly modal: Locator
  readonly closeButton: Locator
  readonly shortcuts: Locator

  constructor(page: Page) {
    this.page = page
    this.modal = page.locator('div.fixed.z-\\[10000\\]').filter({ has: page.locator('h3:has-text("Keyboard Shortcuts")') })
    this.closeButton = page.locator('button[aria-label="Close modal"]')
    this.shortcuts = page.locator('.space-y-2.max-h-\\[60vh\\]')
  }

  async isOpen() {
    return await this.modal.isVisible()
  }

  async close() {
    await this.closeButton.click()
  }

  async getShortcuts() {
    const shortcutElements = await this.shortcuts.locator('> div').all()
    const shortcuts: { key: string; action: string }[] = []
    
    for (const element of shortcutElements) {
      const keyElement = element.locator('kbd')
      const keys = await keyElement.allTextContents()
      const description = await element.locator('span.text-sm').textContent()
      
      if (keys.length > 0 && description) {
        shortcuts.push({ 
          key: keys.join('+'), 
          action: description.trim() 
        })
      }
    }
    
    return shortcuts
  }

  async hasShortcut(key: string) {
    const shortcuts = await this.getShortcuts()
    return shortcuts.some(s => s.key === key)
  }
}