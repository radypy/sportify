import type { Sport, SkillLevel } from './sports'

export interface Profile {
  id: string
  name: string | null
  avatar_url: string | null
  age: number | null
  city: string | null
  position: string | null
  preferred_times: string | null
  skill_level: SkillLevel | null
  favorite_sports: Sport[]
  bio: string | null
  games_played: number
  rating: number | null
  created_at: string
  updated_at: string
}

export interface Game {
  id: string
  creator_id: string
  sport: Sport
  title: string
  location: string
  city: string | null
  date_time: string
  max_players: number
  current_players: number
  skill_level: SkillLevel | null
  price: number | null
  description: string | null
  status: 'open' | 'full' | 'cancelled' | 'completed'
  created_at: string
}

export interface GameParticipant {
  id: string
  game_id: string
  user_id: string
  joined_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Partial<Profile> & { id: string }
        Update: Partial<Profile>
      }
      games: {
        Row: Game
        Insert: Omit<Game, 'id' | 'current_players' | 'status' | 'created_at'>
        Update: Partial<Game>
      }
      game_participants: {
        Row: GameParticipant
        Insert: Omit<GameParticipant, 'id' | 'joined_at'>
        Update: Partial<GameParticipant>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
