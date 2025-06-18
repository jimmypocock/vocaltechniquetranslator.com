import { Page, Locator } from '@playwright/test'

export class FeedbackModal {
  readonly page: Page
  readonly modal: Locator
  readonly nameInput: Locator
  readonly emailInput: Locator
  readonly feedbackTextarea: Locator
  readonly submitButton: Locator
  readonly cancelButton: Locator
  readonly closeButton: Locator
  readonly successMessage: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.modal = page.locator('[role="dialog"]:has-text("Share Your Feedback")')
    this.nameInput = page.getByPlaceholder('Your name (optional)')
    this.emailInput = page.getByPlaceholder('Your email (optional)')
    this.feedbackTextarea = page.getByPlaceholder('Your feedback...')
    this.submitButton = page.getByRole('button', { name: 'Submit Feedback' })
    this.cancelButton = page.getByRole('button', { name: 'Cancel' })
    this.closeButton = page.locator('[aria-label="Close dialog"]')
    this.successMessage = page.locator('.text-green-600:has-text("Thank you for your feedback")')
    this.errorMessage = page.locator('.text-red-600')
  }

  async isOpen() {
    return await this.modal.isVisible()
  }

  async fillForm(data: { name?: string; email?: string; feedback: string }) {
    if (data.name) {
      await this.nameInput.fill(data.name)
    }
    if (data.email) {
      await this.emailInput.fill(data.email)
    }
    await this.feedbackTextarea.fill(data.feedback)
  }

  async submit() {
    await this.submitButton.click()
  }

  async cancel() {
    await this.cancelButton.click()
  }

  async close() {
    await this.closeButton.click()
  }

  async waitForSuccess() {
    await this.successMessage.waitFor({ state: 'visible' })
  }

  async waitForError() {
    await this.errorMessage.waitFor({ state: 'visible' })
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent()
  }
}