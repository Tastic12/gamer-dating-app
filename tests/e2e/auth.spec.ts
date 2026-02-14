import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('should display signup page', async ({ page }) => {
    await page.goto('/signup')
    
    await expect(page.getByRole('heading', { name: /create an account/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible()
    await expect(page.getByLabel(/confirm password/i)).toBeVisible()
    await expect(page.getByLabel(/date of birth/i)).toBeVisible()
  })

  test('should navigate from login to signup', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByRole('link', { name: /sign up/i }).click()
    await expect(page).toHaveURL('/signup')
  })

  test('should navigate from signup to login', async ({ page }) => {
    await page.goto('/signup')
    
    await page.getByRole('link', { name: /sign in/i }).click()
    await expect(page).toHaveURL('/login')
  })

  test('should show validation errors on empty login submission', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Check for validation messages
    await expect(page.getByText(/invalid email/i)).toBeVisible()
  })

  test('should show validation errors on empty signup submission', async ({ page }) => {
    await page.goto('/signup')
    
    await page.getByRole('button', { name: /create account/i }).click()
    
    // Check for validation messages
    await expect(page.getByText(/invalid email/i)).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByLabel(/email/i).fill('notanemail')
    await page.getByLabel(/password/i).fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()
    
    await expect(page.getByText(/invalid email/i)).toBeVisible()
  })

  test('should have Google OAuth button', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible()
  })
})
