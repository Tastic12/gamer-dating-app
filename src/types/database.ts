export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          date_of_birth: string
          pronouns: string | null
          region: string
          bio: string | null
          platforms: string[]
          favorite_genres: string[]
          top_games: string[]
          playstyle: 'casual' | 'competitive' | 'both' | null
          voice_chat: boolean
          typical_play_times: string[]
          photo_urls: string[]
          photo_approved: boolean
          show_online_status: boolean
          is_active: boolean
          is_banned: boolean
          email_verified: boolean
          onboarding_completed: boolean
          last_active_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          date_of_birth: string
          pronouns?: string | null
          region: string
          bio?: string | null
          platforms?: string[]
          favorite_genres?: string[]
          top_games?: string[]
          playstyle?: 'casual' | 'competitive' | 'both' | null
          voice_chat?: boolean
          typical_play_times?: string[]
          photo_urls?: string[]
          photo_approved?: boolean
          show_online_status?: boolean
          is_active?: boolean
          is_banned?: boolean
          email_verified?: boolean
          onboarding_completed?: boolean
          last_active_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          date_of_birth?: string
          pronouns?: string | null
          region?: string
          bio?: string | null
          platforms?: string[]
          favorite_genres?: string[]
          top_games?: string[]
          playstyle?: 'casual' | 'competitive' | 'both' | null
          voice_chat?: boolean
          typical_play_times?: string[]
          photo_urls?: string[]
          photo_approved?: boolean
          show_online_status?: boolean
          is_active?: boolean
          is_banned?: boolean
          email_verified?: boolean
          onboarding_completed?: boolean
          last_active_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      swipes: {
        Row: {
          id: string
          swiper_id: string
          swiped_id: string
          action: 'like' | 'pass'
          created_at: string
        }
        Insert: {
          id?: string
          swiper_id: string
          swiped_id: string
          action: 'like' | 'pass'
          created_at?: string
        }
        Update: {
          id?: string
          swiper_id?: string
          swiped_id?: string
          action?: 'like' | 'pass'
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          matched_at: string
          is_active: boolean
          unmatched_by: string | null
          unmatched_at: string | null
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
          matched_at?: string
          is_active?: boolean
          unmatched_by?: string | null
          unmatched_at?: string | null
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string
          matched_at?: string
          is_active?: boolean
          unmatched_by?: string | null
          unmatched_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          match_id: string
          sender_id: string
          content: string
          created_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          match_id: string
          sender_id: string
          content: string
          created_at?: string
          read_at?: string | null
        }
        Update: {
          id?: string
          match_id?: string
          sender_id?: string
          content?: string
          created_at?: string
          read_at?: string | null
        }
      }
      blocks: {
        Row: {
          id: string
          blocker_id: string
          blocked_id: string
          created_at: string
        }
        Insert: {
          id?: string
          blocker_id: string
          blocked_id: string
          created_at?: string
        }
        Update: {
          id?: string
          blocker_id?: string
          blocked_id?: string
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_id: string
          category: 'harassment' | 'spam' | 'inappropriate_content' | 'fake_profile' | 'underage' | 'other'
          description: string | null
          screenshot_url: string | null
          status: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
          admin_notes: string | null
          resolved_by: string | null
          resolved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_id: string
          category: 'harassment' | 'spam' | 'inappropriate_content' | 'fake_profile' | 'underage' | 'other'
          description?: string | null
          screenshot_url?: string | null
          status?: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
          admin_notes?: string | null
          resolved_by?: string | null
          resolved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          reported_id?: string
          category?: 'harassment' | 'spam' | 'inappropriate_content' | 'fake_profile' | 'underage' | 'other'
          description?: string | null
          screenshot_url?: string | null
          status?: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
          admin_notes?: string | null
          resolved_by?: string | null
          resolved_at?: string | null
          created_at?: string
        }
      }
      admin_users: {
        Row: {
          user_id: string
          role: 'moderator' | 'admin'
          created_at: string
        }
        Insert: {
          user_id: string
          role?: 'moderator' | 'admin'
          created_at?: string
        }
        Update: {
          user_id?: string
          role?: 'moderator' | 'admin'
          created_at?: string
        }
      }
      deletion_requests: {
        Row: {
          id: string
          user_id: string
          requested_at: string
          scheduled_deletion_at: string
          completed_at: string | null
          cancelled_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          requested_at?: string
          scheduled_deletion_at?: string
          completed_at?: string | null
          cancelled_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          requested_at?: string
          scheduled_deletion_at?: string
          completed_at?: string | null
          cancelled_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Convenience aliases
export type Profile = Tables<'profiles'>
export type Swipe = Tables<'swipes'>
export type Match = Tables<'matches'>
export type Message = Tables<'messages'>
export type Block = Tables<'blocks'>
export type Report = Tables<'reports'>
export type AdminUser = Tables<'admin_users'>
export type DeletionRequest = Tables<'deletion_requests'>
