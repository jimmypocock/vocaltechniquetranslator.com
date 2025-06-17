import { test as base } from '@playwright/test'
import { HomePage } from '../pages/HomePage'

// Declare the types of your fixtures.
type MyFixtures = {
  homePage: HomePage
}

// Extend base test by providing your fixtures.
export const test = base.extend<MyFixtures>({
  // Define fixture that provides HomePage instance
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page)
    await use(homePage)
  },
})

export { expect } from '@playwright/test'