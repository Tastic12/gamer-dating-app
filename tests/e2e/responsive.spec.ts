import { test, expect, devices } from '@playwright/test'

test.describe('Responsive Design', () => {
  test.describe('Mobile', () => {
    test.use({ ...devices['iPhone 13'] })

    test('should display mobile-friendly landing page', async ({ page }) => {
      await page.goto('/')
      
      await expect(page.getByRole('heading', { name: /find your player two/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /get started/i })).toBeVisible()
    })

    test('should display mobile login form', async ({ page }) => {
      await page.goto('/login')
      
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
      
      // Check that form is within viewport
      const form = page.locator('form')
      await expect(form).toBeInViewport()
    })

    test('should display mobile signup form', async ({ page }) => {
      await page.goto('/signup')
      
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
    })
  })

  test.describe('Tablet', () => {
    test.use({ ...devices['iPad Pro 11'] })

    test('should display tablet landing page', async ({ page }) => {
      await page.goto('/')
      
      await expect(page.getByRole('heading', { name: /find your player two/i })).toBeVisible()
    })
  })

  test.describe('Desktop', () => {
    test.use({ viewport: { width: 1440, height: 900 } })

    test('should display desktop landing page', async ({ page }) => {
      await page.goto('/')
      
      await expect(page.getByRole('heading', { name: /find your player two/i })).toBeVisible()
      // On desktop, we should see the navigation
      await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible()
    })
  })
})
