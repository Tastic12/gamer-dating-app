import { describe, it, expect } from 'vitest'
import { loginSchema, signupSchema } from '@/lib/validations/auth'
import { displayNameSchema, platformsSchema, genresSchema } from '@/lib/validations/profile'

describe('Auth Validations', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      })
      expect(result.success).toBe(false)
    })

    it('should reject short password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '1234567',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('signupSchema', () => {
    const validSignup = {
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      dateOfBirth: new Date('2000-01-01'),
      ageConfirmation: true,
    }

    it('should validate correct signup data', () => {
      const result = signupSchema.safeParse(validSignup)
      expect(result.success).toBe(true)
    })

    it('should reject mismatched passwords', () => {
      const result = signupSchema.safeParse({
        ...validSignup,
        confirmPassword: 'different',
      })
      expect(result.success).toBe(false)
    })

    it('should reject underage users', () => {
      const result = signupSchema.safeParse({
        ...validSignup,
        dateOfBirth: new Date(), // today = underage
      })
      expect(result.success).toBe(false)
    })

    it('should reject without age confirmation', () => {
      const result = signupSchema.safeParse({
        ...validSignup,
        ageConfirmation: false,
      })
      expect(result.success).toBe(false)
    })
  })
})

describe('Profile Validations', () => {
  describe('displayNameSchema', () => {
    it('should accept valid display names', () => {
      expect(displayNameSchema.safeParse('GamerPro_123').success).toBe(true)
      expect(displayNameSchema.safeParse('Player1').success).toBe(true)
    })

    it('should reject too short names', () => {
      expect(displayNameSchema.safeParse('a').success).toBe(false)
    })

    it('should reject names with special characters', () => {
      expect(displayNameSchema.safeParse('Gamer@Pro').success).toBe(false)
      expect(displayNameSchema.safeParse('Gamer Pro').success).toBe(false)
    })
  })

  describe('platformsSchema', () => {
    it('should accept valid platforms', () => {
      expect(platformsSchema.safeParse(['PC', 'PlayStation']).success).toBe(true)
    })

    it('should reject empty platforms', () => {
      expect(platformsSchema.safeParse([]).success).toBe(false)
    })

    it('should reject invalid platforms', () => {
      expect(platformsSchema.safeParse(['InvalidPlatform']).success).toBe(false)
    })
  })

  describe('genresSchema', () => {
    it('should accept valid genres', () => {
      expect(genresSchema.safeParse(['FPS', 'RPG']).success).toBe(true)
    })

    it('should reject more than 5 genres', () => {
      expect(
        genresSchema.safeParse(['FPS', 'RPG', 'MMORPG', 'MOBA', 'Strategy', 'Racing']).success
      ).toBe(false)
    })
  })
})
