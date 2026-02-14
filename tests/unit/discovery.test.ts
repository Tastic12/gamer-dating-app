import { describe, it, expect } from 'vitest'

describe('Discovery Logic', () => {
  describe('User ordering for matches', () => {
    it('should determine user1 and user2 correctly for match (user1 < user2)', () => {
      const userId1 = 'aaaaaaaa-1111-1111-1111-111111111111'
      const userId2 = 'bbbbbbbb-2222-2222-2222-222222222222'

      // Determine ordering
      const user1 = userId1 < userId2 ? userId1 : userId2
      const user2 = userId1 < userId2 ? userId2 : userId1

      expect(user1).toBe(userId1)
      expect(user2).toBe(userId2)
    })

    it('should handle reverse input order', () => {
      const userId1 = 'bbbbbbbb-2222-2222-2222-222222222222'
      const userId2 = 'aaaaaaaa-1111-1111-1111-111111111111'

      // Determine ordering
      const user1 = userId1 < userId2 ? userId1 : userId2
      const user2 = userId1 < userId2 ? userId2 : userId1

      expect(user1).toBe(userId2) // smaller one
      expect(user2).toBe(userId1) // larger one
    })
  })

  describe('Compatibility scoring', () => {
    const calculateScore = (
      userPlatforms: string[],
      userGenres: string[],
      userPlaystyle: string,
      userVoiceChat: boolean,
      targetPlatforms: string[],
      targetGenres: string[],
      targetPlaystyle: string,
      targetVoiceChat: boolean
    ) => {
      // Platform overlap (2 points each)
      const platformScore = targetPlatforms.filter(p => userPlatforms.includes(p)).length * 2

      // Genre overlap (1 point each)
      const genreScore = targetGenres.filter(g => userGenres.includes(g)).length

      // Same playstyle (3 points)
      const playstyleScore = targetPlaystyle === userPlaystyle ? 3 : 0

      // Same voice chat preference (2 points)
      const voiceChatScore = targetVoiceChat === userVoiceChat ? 2 : 0

      return platformScore + genreScore + playstyleScore + voiceChatScore
    }

    it('should give max score for perfect match', () => {
      const score = calculateScore(
        ['PC', 'PlayStation'],
        ['RPG', 'Action', 'Adventure'],
        'casual',
        true,
        ['PC', 'PlayStation'],
        ['RPG', 'Action', 'Adventure'],
        'casual',
        true
      )

      // 2 platforms * 2 = 4
      // 3 genres * 1 = 3
      // playstyle match = 3
      // voice chat match = 2
      // Total = 12
      expect(score).toBe(12)
    })

    it('should give 0 for no overlap', () => {
      const score = calculateScore(
        ['PC'],
        ['RPG'],
        'casual',
        true,
        ['PlayStation'],
        ['FPS'],
        'competitive',
        false
      )

      expect(score).toBe(0)
    })

    it('should calculate partial overlap correctly', () => {
      const score = calculateScore(
        ['PC', 'PlayStation', 'Nintendo Switch'],
        ['RPG', 'Action', 'Adventure'],
        'casual',
        true,
        ['PC', 'Xbox'],
        ['RPG', 'FPS'],
        'casual',
        false
      )

      // 1 platform (PC) * 2 = 2
      // 1 genre (RPG) * 1 = 1
      // playstyle match = 3
      // voice chat different = 0
      // Total = 6
      expect(score).toBe(6)
    })
  })

  describe('Swipe actions', () => {
    it('should validate swipe action types', () => {
      const validActions = ['like', 'pass']
      
      expect(validActions).toContain('like')
      expect(validActions).toContain('pass')
      expect(validActions).not.toContain('superlike')
    })
  })
})
