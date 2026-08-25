export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ReactionType = 'hug' | 'listen' | 'cheer'

export type MoodTag = 
  | 'ระบายความในใจ'
  | 'เหนื่อยล้า'
  | 'ต้องการกำลังใจ'
  | 'เรื่องความสัมพันธ์'
  | 'เรื่องเรียน/งาน'
  | 'เหงาจัง'

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          created_at: string
          content: string
          mood_tag: string
          author_alias: string
          author_avatar: string
          support_count: number
          user_session_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          content: string
          mood_tag?: string
          author_alias: string
          author_avatar: string
          support_count?: number
          user_session_id: string
        }
        Update: {
          id?: string
          created_at?: string
          content?: string
          mood_tag?: string
          author_alias?: string
          author_avatar?: string
          support_count?: number
          user_session_id?: string
        }
      }
      reactions: {
        Row: {
          id: string
          created_at: string
          post_id: string
          user_session_id: string
          reaction_type: ReactionType
        }
        Insert: {
          id?: string
          created_at?: string
          post_id: string
          user_session_id: string
          reaction_type: ReactionType
        }
        Update: {
          id?: string
          created_at?: string
          post_id?: string
          user_session_id?: string
          reaction_type?: ReactionType
        }
      }
      safety_audit_logs: {
        Row: {
          id: string
          created_at: string
          detected_category: string
          severity_score: number
          is_blocked: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          detected_category: string
          severity_score?: number
          is_blocked?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          detected_category?: string
          severity_score?: number
          is_blocked?: boolean
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
      reaction_type: ReactionType
    }
  }
}

// Convenience Type Helpers
export type Post = Database['public']['Tables']['posts']['Row']
export type PostInsert = Database['public']['Tables']['posts']['Insert']
export type Reaction = Database['public']['Tables']['reactions']['Row']
export type ReactionInsert = Database['public']['Tables']['reactions']['Insert']
export type SafetyAuditLog = Database['public']['Tables']['safety_audit_logs']['Row']
