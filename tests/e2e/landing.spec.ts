import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('should display the landing page', async ({ page }) => {
    await page.goto('/')

    // Check for main heading
    await expect(page.getByRole('heading', { name: /find your player two/i })).toBeVisible()

    // Check for navigation links
    await expect(page.getByRole('link', { name: /log in/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /sign up/i }).first()).toBeVisible()

    // Check for feature cards
    await expect(page.getByText(/gamer-first matching/i)).toBeVisible()
    await expect(page.getByText(/real-time chat/i)).toBeVisible()
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /log in/i }).click()
    await expect(page).toHaveURL('/login')
  })

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /sign up/i }).first().click()
    await expect(page).toHaveURL('/signup')
  })

  test('should navigate to privacy policy', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /privacy policy/i }).click()
    await expect(page).toHaveURL('/privacy')
  })

  test('should navigate to terms of service', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /terms of service/i }).click()
    await expect(page).toHaveURL('/terms')
  })
})
