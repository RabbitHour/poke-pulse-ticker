export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      affiliate_clicks: {
        Row: {
          card_name: string | null
          card_set: string | null
          clicked_at: string
          id: string
          partner: string
          user_id: string | null
        }
        Insert: {
          card_name?: string | null
          card_set?: string | null
          clicked_at?: string
          id?: string
          partner: string
          user_id?: string | null
        }
        Update: {
          card_name?: string | null
          card_set?: string | null
          clicked_at?: string
          id?: string
          partner?: string
          user_id?: string | null
        }
        Relationships: []
      }
      alpha_signals: {
        Row: {
          card_api_id: string
          card_image: string | null
          card_name: string
          card_set: string
          description: string | null
          detected_at: string
          expires_at: string
          id: string
          price_change_pct: number
          signal_type: string
          strength: string
          volume_change_pct: number
        }
        Insert: {
          card_api_id: string
          card_image?: string | null
          card_name: string
          card_set: string
          description?: string | null
          detected_at?: string
          expires_at?: string
          id?: string
          price_change_pct?: number
          signal_type?: string
          strength?: string
          volume_change_pct?: number
        }
        Update: {
          card_api_id?: string
          card_image?: string | null
          card_name?: string
          card_set?: string
          description?: string | null
          detected_at?: string
          expires_at?: string
          id?: string
          price_change_pct?: number
          signal_type?: string
          strength?: string
          volume_change_pct?: number
        }
        Relationships: []
      }
      arena_chat_messages: {
        Row: {
          channel: string
          created_at: string
          id: string
          message: string
          sender_id: string
        }
        Insert: {
          channel?: string
          created_at?: string
          id?: string
          message: string
          sender_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
        }
        Relationships: []
      }
      arena_pack_opens: {
        Row: {
          cards_pulled: Json
          cost: number
          created_at: string
          id: string
          pack_type: string
          rarity_hit: string | null
          total_value: number
          user_id: string
        }
        Insert: {
          cards_pulled?: Json
          cost?: number
          created_at?: string
          id?: string
          pack_type?: string
          rarity_hit?: string | null
          total_value?: number
          user_id: string
        }
        Update: {
          cards_pulled?: Json
          cost?: number
          created_at?: string
          id?: string
          pack_type?: string
          rarity_hit?: string | null
          total_value?: number
          user_id?: string
        }
        Relationships: []
      }
      arena_price_bets: {
        Row: {
          card_api_id: string
          card_image: string | null
          card_name: string
          card_set: string
          created_at: string
          id: string
          index_type: string
          odds: number
          payout: number | null
          prediction: string
          resolved_at: string | null
          resolved_price: number | null
          resolves_at: string
          snapshot_price: number
          status: string
          user_id: string
          wager: number
        }
        Insert: {
          card_api_id: string
          card_image?: string | null
          card_name: string
          card_set: string
          created_at?: string
          id?: string
          index_type?: string
          odds?: number
          payout?: number | null
          prediction?: string
          resolved_at?: string | null
          resolved_price?: number | null
          resolves_at: string
          snapshot_price: number
          status?: string
          user_id: string
          wager?: number
        }
        Update: {
          card_api_id?: string
          card_image?: string | null
          card_name?: string
          card_set?: string
          created_at?: string
          id?: string
          index_type?: string
          odds?: number
          payout?: number | null
          prediction?: string
          resolved_at?: string | null
          resolved_price?: number | null
          resolves_at?: string
          snapshot_price?: number
          status?: string
          user_id?: string
          wager?: number
        }
        Relationships: []
      }
      arena_tournament_entries: {
        Row: {
          id: string
          joined_at: string
          prize_awarded: string | null
          rank: number | null
          score: number
          tournament_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          prize_awarded?: string | null
          rank?: number | null
          score?: number
          tournament_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          prize_awarded?: string | null
          rank?: number | null
          score?: number
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "arena_tournament_entries_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "arena_tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      arena_tournaments: {
        Row: {
          created_at: string
          current_entries: number
          description: string | null
          ends_at: string
          entry_cost: number
          game_type: string
          id: string
          max_entries: number
          name: string
          prize_description: string | null
          prize_pool: number
          starts_at: string
          status: string
        }
        Insert: {
          created_at?: string
          current_entries?: number
          description?: string | null
          ends_at: string
          entry_cost?: number
          game_type?: string
          id?: string
          max_entries?: number
          name: string
          prize_description?: string | null
          prize_pool?: number
          starts_at: string
          status?: string
        }
        Update: {
          created_at?: string
          current_entries?: number
          description?: string | null
          ends_at?: string
          entry_cost?: number
          game_type?: string
          id?: string
          max_entries?: number
          name?: string
          prize_description?: string | null
          prize_pool?: number
          starts_at?: string
          status?: string
        }
        Relationships: []
      }
      arena_wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          lifetime_earned: number
          lifetime_wagered: number
          lifetime_won: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          lifetime_earned?: number
          lifetime_wagered?: number
          lifetime_won?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          lifetime_earned?: number
          lifetime_wagered?: number
          lifetime_won?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_actions: {
        Row: {
          audit_id: string
          category: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          effort: string | null
          id: string
          impact: string | null
          notes: string | null
          status: string
          title: string
          user_id: string
        }
        Insert: {
          audit_id: string
          category?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          effort?: string | null
          id?: string
          impact?: string | null
          notes?: string | null
          status?: string
          title: string
          user_id: string
        }
        Update: {
          audit_id?: string
          category?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          effort?: string | null
          id?: string
          impact?: string | null
          notes?: string | null
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_actions_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "site_audits"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contest_entries: {
        Row: {
          contest_id: string
          final_value: number | null
          id: string
          joined_at: string
          pnl_pct: number | null
          portfolio_id: string
          rank: number | null
          user_id: string
        }
        Insert: {
          contest_id: string
          final_value?: number | null
          id?: string
          joined_at?: string
          pnl_pct?: number | null
          portfolio_id: string
          rank?: number | null
          user_id: string
        }
        Update: {
          contest_id?: string
          final_value?: number | null
          id?: string
          joined_at?: string
          pnl_pct?: number | null
          portfolio_id?: string
          rank?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contest_entries_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "trading_contests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contest_entries_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "trader_portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      delta_alerts: {
        Row: {
          card_api_id: string
          card_image: string | null
          card_name: string
          card_number: string
          card_set: string
          created_at: string
          deviation_threshold: number
          id: string
          is_active: boolean
          last_deviation: number | null
          last_triggered_at: string | null
          user_id: string
        }
        Insert: {
          card_api_id: string
          card_image?: string | null
          card_name: string
          card_number: string
          card_set: string
          created_at?: string
          deviation_threshold?: number
          id?: string
          is_active?: boolean
          last_deviation?: number | null
          last_triggered_at?: string | null
          user_id: string
        }
        Update: {
          card_api_id?: string
          card_image?: string | null
          card_name?: string
          card_number?: string
          card_set?: string
          created_at?: string
          deviation_threshold?: number
          id?: string
          is_active?: boolean
          last_deviation?: number | null
          last_triggered_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      digital_portfolio_cards: {
        Row: {
          card_api_id: string
          card_image: string | null
          card_name: string
          card_number: string
          card_rarity: string | null
          card_set: string
          id: string
          rip_session_id: string | null
          rip_value: number
          ripped_at: string
          user_id: string
        }
        Insert: {
          card_api_id: string
          card_image?: string | null
          card_name: string
          card_number: string
          card_rarity?: string | null
          card_set: string
          id?: string
          rip_session_id?: string | null
          rip_value?: number
          ripped_at?: string
          user_id: string
        }
        Update: {
          card_api_id?: string
          card_image?: string | null
          card_name?: string
          card_number?: string
          card_rarity?: string | null
          card_set?: string
          id?: string
          rip_session_id?: string | null
          rip_value?: number
          ripped_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      game_achievements: {
        Row: {
          achievement_id: string
          id: string
          player_id: string
          unlocked_at: string
        }
        Insert: {
          achievement_id: string
          id?: string
          player_id: string
          unlocked_at?: string
        }
        Update: {
          achievement_id?: string
          id?: string
          player_id?: string
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_achievements_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "game_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_achievements_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "game_players_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_achievements_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "game_pvp_leaderboard"
            referencedColumns: ["player_id"]
          },
        ]
      }
      game_battles: {
        Row: {
          card_score: number
          cards_wagered: number
          cards_won: number
          created_at: string
          id: string
          knowledge_score: number
          matchup_score: number
          opponent_id: string | null
          opponent_pokemon: string
          opponent_type: string
          player_id: string
          player_pokemon: string
          result: string
          xp_earned: number
        }
        Insert: {
          card_score?: number
          cards_wagered?: number
          cards_won?: number
          created_at?: string
          id?: string
          knowledge_score?: number
          matchup_score?: number
          opponent_id?: string | null
          opponent_pokemon: string
          opponent_type?: string
          player_id: string
          player_pokemon: string
          result: string
          xp_earned?: number
        }
        Update: {
          card_score?: number
          cards_wagered?: number
          cards_won?: number
          created_at?: string
          id?: string
          knowledge_score?: number
          matchup_score?: number
          opponent_id?: string | null
          opponent_pokemon?: string
          opponent_type?: string
          player_id?: string
          player_pokemon?: string
          result?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_battles_opponent_id_fkey"
            columns: ["opponent_id"]
            isOneToOne: false
            referencedRelation: "game_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_battles_opponent_id_fkey"
            columns: ["opponent_id"]
            isOneToOne: false
            referencedRelation: "game_players_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_battles_opponent_id_fkey"
            columns: ["opponent_id"]
            isOneToOne: false
            referencedRelation: "game_pvp_leaderboard"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "game_battles_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "game_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_battles_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "game_players_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_battles_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "game_pvp_leaderboard"
            referencedColumns: ["player_id"]
          },
        ]
      }
      game_collected_cards: {
        Row: {
          card_api_id: string
          card_image: string | null
          card_name: string
          card_rarity: string | null
          card_set: string | null
          collected_at: string
          id: string
          player_id: string
          pokemon_name: string
        }
        Insert: {
          card_api_id: string
          card_image?: string | null
          card_name: string
          card_rarity?: string | null
          card_set?: string | null
          collected_at?: string
          id?: string
          player_id: string
          pokemon_name: string
        }
        Update: {
          card_api_id?: string
          card_image?: string | null
          card_name?: string
          card_rarity?: string | null
          card_set?: string | null
          collected_at?: string
          id?: string
          player_id?: string
          pokemon_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_collected_cards_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "game_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_collected_cards_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "game_players_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_collected_cards_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "game_pvp_leaderboard"
            referencedColumns: ["player_id"]
          },
        ]
      }
      game_collected_pokemon: {
        Row: {
          collected_at: string
          id: string
          player_id: string
          pokemon_image: string | null
          pokemon_name: string
          pokemon_type: string | null
        }
        Insert: {
          collected_at?: string
          id?: string
          player_id: string
          pokemon_image?: string | null
          pokemon_name: string
          pokemon_type?: string | null
        }
        Update: {
          collected_at?: string
          id?: string
          player_id?: string
          pokemon_image?: string | null
          pokemon_name?: string
          pokemon_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_collected_pokemon_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "game_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_collected_pokemon_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "game_players_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_collected_pokemon_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "game_pvp_leaderboard"
            referencedColumns: ["player_id"]
          },
        ]
      }
      game_players: {
        Row: {
          coins_balance: number
          created_at: string
          display_name: string | null
          free_battles_remaining: number
          has_paid: boolean
          id: string
          last_login_date: string | null
          level: number
          login_streak: number
          starter_pokemon: string
          starter_pokemon_image: string | null
          total_losses: number
          total_wins: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          coins_balance?: number
          created_at?: string
          display_name?: string | null
          free_battles_remaining?: number
          has_paid?: boolean
          id?: string
          last_login_date?: string | null
          level?: number
          login_streak?: number
          starter_pokemon: string
          starter_pokemon_image?: string | null
          total_losses?: number
          total_wins?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          coins_balance?: number
          created_at?: string
          display_name?: string | null
          free_battles_remaining?: number
          has_paid?: boolean
          id?: string
          last_login_date?: string | null
          level?: number
          login_streak?: number
          starter_pokemon?: string
          starter_pokemon_image?: string | null
          total_losses?: number
          total_wins?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      game_purchases: {
        Row: {
          amount_cents: number
          created_at: string
          id: string
          product_type: string
          status: string
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          amount_cents?: number
          created_at?: string
          id?: string
          product_type?: string
          status?: string
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          id?: string
          product_type?: string
          status?: string
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      game_pvp_challenges: {
        Row: {
          challenger_answer: number | null
          challenger_id: string
          challenger_pokemon: string
          created_at: string
          id: string
          opponent_answer: number | null
          opponent_id: string | null
          opponent_pokemon: string | null
          quiz_correct_index: number | null
          quiz_question: string | null
          resolved_at: string | null
          status: string
          wager: number
          winner_id: string | null
        }
        Insert: {
          challenger_answer?: number | null
          challenger_id: string
          challenger_pokemon: string
          created_at?: string
          id?: string
          opponent_answer?: number | null
          opponent_id?: string | null
          opponent_pokemon?: string | null
          quiz_correct_index?: number | null
          quiz_question?: string | null
          resolved_at?: string | null
          status?: string
          wager?: number
          winner_id?: string | null
        }
        Update: {
          challenger_answer?: number | null
          challenger_id?: string
          challenger_pokemon?: string
          created_at?: string
          id?: string
          opponent_answer?: number | null
          opponent_id?: string | null
          opponent_pokemon?: string | null
          quiz_correct_index?: number | null
          quiz_question?: string | null
          resolved_at?: string | null
          status?: string
          wager?: number
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_pvp_challenges_challenger_id_fkey"
            columns: ["challenger_id"]
            isOneToOne: false
            referencedRelation: "game_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_pvp_challenges_challenger_id_fkey"
            columns: ["challenger_id"]
            isOneToOne: false
            referencedRelation: "game_players_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_pvp_challenges_challenger_id_fkey"
            columns: ["challenger_id"]
            isOneToOne: false
            referencedRelation: "game_pvp_leaderboard"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "game_pvp_challenges_opponent_id_fkey"
            columns: ["opponent_id"]
            isOneToOne: false
            referencedRelation: "game_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_pvp_challenges_opponent_id_fkey"
            columns: ["opponent_id"]
            isOneToOne: false
            referencedRelation: "game_players_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_pvp_challenges_opponent_id_fkey"
            columns: ["opponent_id"]
            isOneToOne: false
            referencedRelation: "game_pvp_leaderboard"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "game_pvp_challenges_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "game_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_pvp_challenges_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "game_players_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_pvp_challenges_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "game_pvp_leaderboard"
            referencedColumns: ["player_id"]
          },
        ]
      }
      index_cache: {
        Row: {
          cache_key: string
          created_at: string
          data: Json
          expires_at: string
          id: string
          updated_at: string
        }
        Insert: {
          cache_key: string
          created_at?: string
          data?: Json
          expires_at: string
          id?: string
          updated_at?: string
        }
        Update: {
          cache_key?: string
          created_at?: string
          data?: Json
          expires_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      market_catalog_groups: {
        Row: {
          group_id: number
          name: string
          refreshed_at: string
          sealed: Json
          sealed_count: number
          singles: Json
          singles_count: number
          source_updated: string | null
        }
        Insert: {
          group_id: number
          name: string
          refreshed_at?: string
          sealed?: Json
          sealed_count?: number
          singles?: Json
          singles_count?: number
          source_updated?: string | null
        }
        Update: {
          group_id?: number
          name?: string
          refreshed_at?: string
          sealed?: Json
          sealed_count?: number
          singles?: Json
          singles_count?: number
          source_updated?: string | null
        }
        Relationships: []
      }
      market_index_snapshots: {
        Row: {
          captured_at: string
          change_pct: number | null
          constituents: number
          id: number
          market_type: string
          meta: Json
          source: string
          value: number
        }
        Insert: {
          captured_at?: string
          change_pct?: number | null
          constituents?: number
          id?: never
          market_type: string
          meta?: Json
          source: string
          value: number
        }
        Update: {
          captured_at?: string
          change_pct?: number | null
          constituents?: number
          id?: never
          market_type?: string
          meta?: Json
          source?: string
          value?: number
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          alert_threshold: number
          created_at: string
          email_portfolio_alerts: boolean
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_threshold?: number
          created_at?: string
          email_portfolio_alerts?: boolean
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_threshold?: number
          created_at?: string
          email_portfolio_alerts?: boolean
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_cards: {
        Row: {
          added_at: string
          card_api_id: string
          card_image: string | null
          card_name: string
          card_number: string
          card_set: string
          id: string
          purchase_price: number | null
          quantity: number
          user_id: string
        }
        Insert: {
          added_at?: string
          card_api_id: string
          card_image?: string | null
          card_name: string
          card_number: string
          card_set: string
          id?: string
          purchase_price?: number | null
          quantity?: number
          user_id: string
        }
        Update: {
          added_at?: string
          card_api_id?: string
          card_image?: string | null
          card_name?: string
          card_number?: string
          card_set?: string
          id?: string
          purchase_price?: number | null
          quantity?: number
          user_id?: string
        }
        Relationships: []
      }
      portfolio_snapshots: {
        Row: {
          card_count: number
          created_at: string
          id: string
          snapshot_date: string
          total_cost: number
          total_value: number
          user_id: string
        }
        Insert: {
          card_count?: number
          created_at?: string
          id?: string
          snapshot_date?: string
          total_cost?: number
          total_value: number
          user_id: string
        }
        Update: {
          card_count?: number
          created_at?: string
          id?: string
          snapshot_date?: string
          total_cost?: number
          total_value?: number
          user_id?: string
        }
        Relationships: []
      }
      prediction_duels: {
        Row: {
          accepted_at: string | null
          card_api_id: string
          card_image: string | null
          card_name: string
          card_set: string
          challenger_id: string
          challenger_prediction: string
          created_at: string
          id: string
          opponent_id: string | null
          resolved_at: string | null
          resolved_price: number | null
          resolves_at: string
          snapshot_price: number
          status: string
          wager: number
          winner_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          card_api_id: string
          card_image?: string | null
          card_name: string
          card_set: string
          challenger_id: string
          challenger_prediction?: string
          created_at?: string
          id?: string
          opponent_id?: string | null
          resolved_at?: string | null
          resolved_price?: number | null
          resolves_at: string
          snapshot_price: number
          status?: string
          wager?: number
          winner_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          card_api_id?: string
          card_image?: string | null
          card_name?: string
          card_set?: string
          challenger_id?: string
          challenger_prediction?: string
          created_at?: string
          id?: string
          opponent_id?: string | null
          resolved_at?: string | null
          resolved_price?: number | null
          resolves_at?: string
          snapshot_price?: number
          status?: string
          wager?: number
          winner_id?: string | null
        }
        Relationships: []
      }
      price_alerts: {
        Row: {
          card_api_id: string
          card_image: string | null
          card_name: string
          card_number: string
          card_set: string
          created_at: string
          direction: string
          id: string
          is_triggered: boolean
          target_price: number
          triggered_at: string | null
          user_id: string
        }
        Insert: {
          card_api_id: string
          card_image?: string | null
          card_name: string
          card_number: string
          card_set: string
          created_at?: string
          direction?: string
          id?: string
          is_triggered?: boolean
          target_price: number
          triggered_at?: string | null
          user_id: string
        }
        Update: {
          card_api_id?: string
          card_image?: string | null
          card_name?: string
          card_number?: string
          card_set?: string
          created_at?: string
          direction?: string
          id?: string
          is_triggered?: boolean
          target_price?: number
          triggered_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          chat_age_verified: boolean
          created_at: string
          date_of_birth: string | null
          display_name: string | null
          id: string
          is_public: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          chat_age_verified?: boolean
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          id: string
          is_public?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          chat_age_verified?: boolean
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          id?: string
          is_public?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      race_bets: {
        Row: {
          created_at: string
          id: string
          odds: number
          payout: number | null
          race_id: string
          racer_id: string
          resolved_at: string | null
          status: string
          user_id: string
          wager: number
        }
        Insert: {
          created_at?: string
          id?: string
          odds?: number
          payout?: number | null
          race_id: string
          racer_id: string
          resolved_at?: string | null
          status?: string
          user_id: string
          wager?: number
        }
        Update: {
          created_at?: string
          id?: string
          odds?: number
          payout?: number | null
          race_id?: string
          racer_id?: string
          resolved_at?: string | null
          status?: string
          user_id?: string
          wager?: number
        }
        Relationships: [
          {
            foreignKeyName: "race_bets_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "race_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      race_sessions: {
        Row: {
          category: string
          created_at: string
          ends_at: string
          id: string
          race_type: string
          racers: Json
          results: Json | null
          started_at: string
          status: string
        }
        Insert: {
          category?: string
          created_at?: string
          ends_at: string
          id?: string
          race_type?: string
          racers?: Json
          results?: Json | null
          started_at?: string
          status?: string
        }
        Update: {
          category?: string
          created_at?: string
          ends_at?: string
          id?: string
          race_type?: string
          racers?: Json
          results?: Json | null
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      race_wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          lifetime_earned: number
          lifetime_wagered: number
          lifetime_won: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          lifetime_earned?: number
          lifetime_wagered?: number
          lifetime_won?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          lifetime_earned?: number
          lifetime_wagered?: number
          lifetime_won?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rip_sessions: {
        Row: {
          cards_pulled: Json
          coin_cost: number
          created_at: string
          era: string
          id: string
          product_type: string
          set_id: string
          set_name: string
          total_rip_value: number
          user_id: string
        }
        Insert: {
          cards_pulled?: Json
          coin_cost?: number
          created_at?: string
          era?: string
          id?: string
          product_type?: string
          set_id: string
          set_name: string
          total_rip_value?: number
          user_id: string
        }
        Update: {
          cards_pulled?: Json
          coin_cost?: number
          created_at?: string
          era?: string
          id?: string
          product_type?: string
          set_id?: string
          set_name?: string
          total_rip_value?: number
          user_id?: string
        }
        Relationships: []
      }
      ripz_episode_bets: {
        Row: {
          bet_type: string
          created_at: string
          episode_id: string
          id: string
          odds: number
          pack_index: number | null
          payout: number | null
          prediction: string
          resolved_at: string | null
          status: string
          user_id: string
          wager: number
        }
        Insert: {
          bet_type?: string
          created_at?: string
          episode_id: string
          id?: string
          odds?: number
          pack_index?: number | null
          payout?: number | null
          prediction: string
          resolved_at?: string | null
          status?: string
          user_id: string
          wager?: number
        }
        Update: {
          bet_type?: string
          created_at?: string
          episode_id?: string
          id?: string
          odds?: number
          pack_index?: number | null
          payout?: number | null
          prediction?: string
          resolved_at?: string | null
          status?: string
          user_id?: string
          wager?: number
        }
        Relationships: []
      }
      ripz_ratings: {
        Row: {
          comment: string | null
          created_at: string
          episode_id: string
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          episode_id: string
          id?: string
          rating?: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          episode_id?: string
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: []
      }
      ripz_wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          lifetime_ripped: number
          lifetime_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          lifetime_ripped?: number
          lifetime_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          lifetime_ripped?: number
          lifetime_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sales_leads: {
        Row: {
          ai_personalization: Json | null
          company: string | null
          converted_at: string | null
          created_at: string | null
          email: string
          id: string
          last_contacted_at: string | null
          name: string
          next_followup_at: string | null
          notes: string | null
          score: number | null
          source: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          ai_personalization?: Json | null
          company?: string | null
          converted_at?: string | null
          created_at?: string | null
          email: string
          id?: string
          last_contacted_at?: string | null
          name: string
          next_followup_at?: string | null
          notes?: string | null
          score?: number | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_personalization?: Json | null
          company?: string | null
          converted_at?: string | null
          created_at?: string | null
          email?: string
          id?: string
          last_contacted_at?: string | null
          name?: string
          next_followup_at?: string | null
          notes?: string | null
          score?: number | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sales_outreach_log: {
        Row: {
          ai_model_used: string | null
          body: string | null
          created_at: string | null
          id: string
          lead_id: string | null
          outreach_type: string | null
          response: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          ai_model_used?: string | null
          body?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string | null
          outreach_type?: string | null
          response?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          ai_model_used?: string | null
          body?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string | null
          outreach_type?: string | null
          response?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_outreach_log_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "sales_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_pipeline_metrics: {
        Row: {
          conversions: number | null
          created_at: string | null
          demos_scheduled: number | null
          emails_sent: number | null
          id: string
          leads_generated: number | null
          metric_date: string
          responses_received: number | null
          revenue_generated: number | null
        }
        Insert: {
          conversions?: number | null
          created_at?: string | null
          demos_scheduled?: number | null
          emails_sent?: number | null
          id?: string
          leads_generated?: number | null
          metric_date?: string
          responses_received?: number | null
          revenue_generated?: number | null
        }
        Update: {
          conversions?: number | null
          created_at?: string | null
          demos_scheduled?: number | null
          emails_sent?: number | null
          id?: string
          leads_generated?: number | null
          metric_date?: string
          responses_received?: number | null
          revenue_generated?: number | null
        }
        Relationships: []
      }
      sentiment_votes: {
        Row: {
          card_api_id: string
          created_at: string
          direction: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          card_api_id: string
          created_at?: string
          direction?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          card_api_id?: string
          created_at?: string
          direction?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_audits: {
        Row: {
          categories: Json
          competitive_intel: Json | null
          completed_at: string | null
          created_at: string
          id: string
          legal_compliance: Json | null
          overall_score: number | null
          recommendations: Json | null
          status: string
          summary: string | null
          trigger_type: string
          user_id: string
        }
        Insert: {
          categories?: Json
          competitive_intel?: Json | null
          completed_at?: string | null
          created_at?: string
          id?: string
          legal_compliance?: Json | null
          overall_score?: number | null
          recommendations?: Json | null
          status?: string
          summary?: string | null
          trigger_type?: string
          user_id: string
        }
        Update: {
          categories?: Json
          competitive_intel?: Json | null
          completed_at?: string | null
          created_at?: string
          id?: string
          legal_compliance?: Json | null
          overall_score?: number | null
          recommendations?: Json | null
          status?: string
          summary?: string | null
          trigger_type?: string
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      trade_orders: {
        Row: {
          card_api_id: string
          card_image: string | null
          card_name: string
          card_set: string
          created_at: string
          expires_at: string | null
          filled_at: string | null
          id: string
          limit_price: number | null
          order_type: string
          portfolio_id: string
          price: number
          quantity: number
          side: string
          status: string
          stop_price: number | null
          user_id: string
        }
        Insert: {
          card_api_id: string
          card_image?: string | null
          card_name: string
          card_set: string
          created_at?: string
          expires_at?: string | null
          filled_at?: string | null
          id?: string
          limit_price?: number | null
          order_type?: string
          portfolio_id: string
          price: number
          quantity: number
          side?: string
          status?: string
          stop_price?: number | null
          user_id: string
        }
        Update: {
          card_api_id?: string
          card_image?: string | null
          card_name?: string
          card_set?: string
          created_at?: string
          expires_at?: string | null
          filled_at?: string | null
          id?: string
          limit_price?: number | null
          order_type?: string
          portfolio_id?: string
          price?: number
          quantity?: number
          side?: string
          status?: string
          stop_price?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_orders_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "trader_portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      trader_holdings: {
        Row: {
          avg_cost: number
          card_api_id: string
          card_image: string | null
          card_name: string
          card_set: string
          created_at: string
          id: string
          portfolio_id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_cost?: number
          card_api_id: string
          card_image?: string | null
          card_name: string
          card_set: string
          created_at?: string
          id?: string
          portfolio_id: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_cost?: number
          card_api_id?: string
          card_image?: string | null
          card_name?: string
          card_set?: string
          created_at?: string
          id?: string
          portfolio_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trader_holdings_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "trader_portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      trader_portfolios: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          season_id: string
          starting_balance: number
          total_portfolio_value: number
          updated_at: string
          user_id: string
          virtual_balance: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          season_id?: string
          starting_balance?: number
          total_portfolio_value?: number
          updated_at?: string
          user_id: string
          virtual_balance?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          season_id?: string
          starting_balance?: number
          total_portfolio_value?: number
          updated_at?: string
          user_id?: string
          virtual_balance?: number
        }
        Relationships: []
      }
      trading_contests: {
        Row: {
          created_at: string
          description: string | null
          ends_at: string
          entry_balance: number
          id: string
          name: string
          prize_description: string | null
          starts_at: string
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          ends_at: string
          entry_balance?: number
          id?: string
          name: string
          prize_description?: string | null
          starts_at: string
          status?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          ends_at?: string
          entry_balance?: number
          id?: string
          name?: string
          prize_description?: string | null
          starts_at?: string
          status?: string
        }
        Relationships: []
      }
      unicorn_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          thread_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          thread_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unicorn_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "unicorn_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      unicorn_threads: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      unified_wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          lifetime_earned: number
          lifetime_ripped: number
          lifetime_spent: number
          lifetime_wagered: number
          lifetime_won: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          lifetime_earned?: number
          lifetime_ripped?: number
          lifetime_spent?: number
          lifetime_wagered?: number
          lifetime_won?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          lifetime_earned?: number
          lifetime_ripped?: number
          lifetime_spent?: number
          lifetime_wagered?: number
          lifetime_won?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_trials: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          is_active: boolean
          starts_at: string
          tier: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ends_at?: string
          id?: string
          is_active?: boolean
          starts_at?: string
          tier?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          is_active?: boolean
          starts_at?: string
          tier?: string
          user_id?: string
        }
        Relationships: []
      }
      watchlist: {
        Row: {
          added_at: string
          card_api_id: string
          card_image: string | null
          card_name: string
          card_number: string
          card_set: string
          id: string
          target_price: number | null
          user_id: string
        }
        Insert: {
          added_at?: string
          card_api_id: string
          card_image?: string | null
          card_name: string
          card_number: string
          card_set: string
          id?: string
          target_price?: number | null
          user_id: string
        }
        Update: {
          added_at?: string
          card_api_id?: string
          card_image?: string | null
          card_name?: string
          card_number?: string
          card_set?: string
          id?: string
          target_price?: number | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      arena_leaderboard: {
        Row: {
          avatar_url: string | null
          display_name: string | null
          lifetime_wagered: number | null
          lifetime_won: number | null
          user_id: string | null
        }
        Relationships: []
      }
      game_players_leaderboard: {
        Row: {
          display_name: string | null
          id: string | null
          level: number | null
          starter_pokemon: string | null
          starter_pokemon_image: string | null
          total_losses: number | null
          total_wins: number | null
          xp: number | null
        }
        Insert: {
          display_name?: string | null
          id?: string | null
          level?: number | null
          starter_pokemon?: string | null
          starter_pokemon_image?: string | null
          total_losses?: number | null
          total_wins?: number | null
          xp?: number | null
        }
        Update: {
          display_name?: string | null
          id?: string | null
          level?: number | null
          starter_pokemon?: string | null
          starter_pokemon_image?: string | null
          total_losses?: number | null
          total_wins?: number | null
          xp?: number | null
        }
        Relationships: []
      }
      game_pvp_leaderboard: {
        Row: {
          display_name: string | null
          level: number | null
          player_id: string | null
          starter_pokemon: string | null
          starter_pokemon_image: string | null
          total_losses: number | null
          total_wins: number | null
        }
        Insert: {
          display_name?: string | null
          level?: number | null
          player_id?: string | null
          starter_pokemon?: string | null
          starter_pokemon_image?: string | null
          total_losses?: number | null
          total_wins?: number | null
        }
        Update: {
          display_name?: string | null
          level?: number | null
          player_id?: string | null
          starter_pokemon?: string | null
          starter_pokemon_image?: string | null
          total_losses?: number | null
          total_wins?: number | null
        }
        Relationships: []
      }
      race_leaderboard: {
        Row: {
          avatar_url: string | null
          balance: number | null
          display_name: string | null
          lifetime_wagered: number | null
          lifetime_won: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      adjust_arena_wallet: {
        Args: { _amount: number; _reason: string }
        Returns: Json
      }
      adjust_race_wallet: {
        Args: { _amount: number; _reason: string }
        Returns: Json
      }
      adjust_ripz_wallet: {
        Args: { _amount: number; _reason: string }
        Returns: Json
      }
      adjust_wallet_balance: {
        Args: { _amount: number; _reason: string }
        Returns: Json
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      verify_chat_age: { Args: { _date_of_birth: string }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
