import { test, expect } from '../fixtures/test'
import { FeedbackModal } from '../pages/FeedbackModal'

test.describe('Feedback Submission Flow', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto()
  })

  test('should open and close feedback modal', async ({ page, homePage }) => {
    const feedbackModal = new FeedbackModal(page)
    
    // Open modal
    await homePage.openFeedbackModal()
    await expect(feedbackModal.modal).toBeVisible()
    
    // Close with X button
    await feedbackModal.close()
    await expect(feedbackModal.modal).not.toBeVisible()
    
    // Open again and close with Cancel
    await homePage.openFeedbackModal()
    await feedbackModal.cancel()
    await expect(feedbackModal.modal).not.toBeVisible()
  })

  test('should validate required feedback field', async ({ page, homePage }) => {
    const feedbackModal = new FeedbackModal(page)
    
    await homePage.openFeedbackModal()
    
    // Try to submit without feedback
    await feedbackModal.submit()
    
    // Should show validation error or button should be disabled
    const isSubmitDisabled = await feedbackModal.submitButton.isDisabled()
    expect(isSubmitDisabled).toBe(true)
  })

  test('should submit feedback successfully', async ({ page, homePage }) => {
    const feedbackModal = new FeedbackModal(page)
    
    await homePage.openFeedbackModal()
    
    // Fill form
    await feedbackModal.fillForm({
      name: 'Test User',
      email: 'test@example.com',
      feedback: 'This is a test feedback submission from E2E tests'
    })
    
    // Submit
    await feedbackModal.submit()
    
    // Wait for success message
    await feedbackModal.waitForSuccess()
    
    // Modal should close after success
    await expect(feedbackModal.modal).not.toBeVisible({ timeout: 5000 })
  })

  test('should submit anonymous feedback', async ({ page, homePage }) => {
    const feedbackModal = new FeedbackModal(page)
    
    await homePage.openFeedbackModal()
    
    // Fill only feedback (no name or email)
    await feedbackModal.fillForm({
      feedback: 'Anonymous feedback test'
    })
    
    // Submit
    await feedbackModal.submit()
    
    // Should succeed
    await feedbackModal.waitForSuccess()
  })

  test('should validate email format', async ({ page, homePage }) => {
    const feedbackModal = new FeedbackModal(page)
    
    await homePage.openFeedbackModal()
    
    // Fill with invalid email
    await feedbackModal.fillForm({
      email: 'invalid-email',
      feedback: 'Test feedback'
    })
    
    // Check if email input has validation error
    const emailInput = feedbackModal.emailInput
    await emailInput.blur() // Trigger validation
    
    // Browser should show validation error for email type input
    const isEmailValid = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid)
    expect(isEmailValid).toBe(false)
  })

  test('should handle network errors gracefully', async ({ page, homePage }) => {
    const feedbackModal = new FeedbackModal(page)
    
    // Intercept network request to simulate error
    await page.route('**/api/feedback', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' })
      })
    })
    
    await homePage.openFeedbackModal()
    
    // Fill and submit
    await feedbackModal.fillForm({
      feedback: 'This should fail'
    })
    await feedbackModal.submit()
    
    // Should show error message
    await feedbackModal.waitForError()
    const errorMessage = await feedbackModal.getErrorMessage()
    expect(errorMessage).toContain('error')
    
    // Modal should remain open on error
    await expect(feedbackModal.modal).toBeVisible()
  })

  test('should preserve form data on validation error', async ({ page, homePage }) => {
    const feedbackModal = new FeedbackModal(page)
    
    await homePage.openFeedbackModal()
    
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      feedback: 'Test feedback that should be preserved'
    }
    
    // Fill form
    await feedbackModal.fillForm(testData)
    
    // Simulate validation error by intercepting request
    await page.route('**/api/feedback', route => {
      route.fulfill({
        status: 400,
        body: JSON.stringify({ error: 'Validation error' })
      })
    })
    
    await feedbackModal.submit()
    await feedbackModal.waitForError()
    
    // Verify form data is preserved
    const nameValue = await feedbackModal.nameInput.inputValue()
    const emailValue = await feedbackModal.emailInput.inputValue()
    const feedbackValue = await feedbackModal.feedbackTextarea.inputValue()
    
    expect(nameValue).toBe(testData.name)
    expect(emailValue).toBe(testData.email)
    expect(feedbackValue).toBe(testData.feedback)
  })

  test('should disable submit button during submission', async ({ page, homePage }) => {
    const feedbackModal = new FeedbackModal(page)
    
    // Slow down the response to observe loading state
    await page.route('**/api/feedback', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true })
      })
    })
    
    await homePage.openFeedbackModal()
    
    await feedbackModal.fillForm({
      feedback: 'Testing loading state'
    })
    
    // Start submission
    const submitPromise = feedbackModal.submit()
    
    // Button should be disabled during submission
    await expect(feedbackModal.submitButton).toBeDisabled()
    
    // Wait for completion
    await submitPromise
    await feedbackModal.waitForSuccess()
  })

  test('should close modal with Escape key', async ({ page, homePage }) => {
    const feedbackModal = new FeedbackModal(page)
    
    await homePage.openFeedbackModal()
    await expect(feedbackModal.modal).toBeVisible()
    
    // Press Escape
    await page.keyboard.press('Escape')
    
    // Modal should close
    await expect(feedbackModal.modal).not.toBeVisible()
  })
})