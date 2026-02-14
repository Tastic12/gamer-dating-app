import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('should load landing page', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.getByRole('heading', { name: /find your player two/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /get started/i })).toBeVisible()
  })

  test('should navigate to signup from landing page', async ({ page }) => {
    await page.goto('/')
    
    await page.getByRole('link', { name: /get started/i }).click()
    await expect(page).toHaveURL('/signup')
  })

  test('should navigate to login from landing page', async ({ page }) => {
    await page.goto('/')
    
    await page.getByRole('link', { name: /sign in/i }).click()
    await expect(page).toHaveURL('/login')
  })

  test('should load privacy policy page', async ({ page }) => {
    await page.goto('/privacy')
    
    await expect(page.getByRole('heading', { name: /privacy policy/i })).toBeVisible()
  })

  test('should load terms of service page', async ({ page }) => {
    await page.goto('/terms')
    
    await expect(page.getByRole('heading', { name: /terms of service/i })).toBeVisible()
  })

  test('should have footer links on landing page', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.getByRole('link', { name: /privacy/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /terms/i })).toBeVisible()
  })
})
