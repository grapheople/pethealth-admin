export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      food_analyses: {
        Row: {
          id: string;
          image_url: string | null;
          image_storage_path: string | null;
          food_name: string | null;
          food_name_en: string | null;
          animal_type: string | null;
          nutrients: Json;
          ingredients: Json;
          ingredients_en: Json;
          overall_rating: number | null;
          rating_summary: string | null;
          rating_summary_en: string | null;
          recommendations: string | null;
          recommendations_en: string | null;
          calories_g: number;
          food_amount_g: number | null;
          raw_ai_response: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          image_url?: string | null;
          image_storage_path?: string | null;
          food_name?: string | null;
          food_name_en?: string | null;
          animal_type?: string | null;
          nutrients?: Json;
          ingredients?: Json;
          ingredients_en?: Json;
          overall_rating?: number | null;
          rating_summary?: string | null;
          rating_summary_en?: string | null;
          recommendations?: string | null;
          recommendations_en?: string | null;
          calories_g?: number;
          food_amount_g?: number | null;
          raw_ai_response?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          image_url?: string | null;
          image_storage_path?: string | null;
          food_name?: string | null;
          food_name_en?: string | null;
          animal_type?: string | null;
          nutrients?: Json;
          ingredients?: Json;
          ingredients_en?: Json;
          overall_rating?: number | null;
          rating_summary?: string | null;
          rating_summary_en?: string | null;
          recommendations?: string | null;
          recommendations_en?: string | null;
          calories_g?: number;
          food_amount_g?: number | null;
          raw_ai_response?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      stool_analyses: {
        Row: {
          id: string;
          image_url: string | null;
          image_storage_path: string | null;
          animal_type: string | null;
          color: string | null;
          color_assessment: string | null;
          color_assessment_en: string | null;
          consistency: string | null;
          consistency_assessment: string | null;
          consistency_assessment_en: string | null;
          shape: string | null;
          size: string | null;
          has_blood: boolean | null;
          has_mucus: boolean | null;
          has_foreign_objects: boolean | null;
          abnormalities: Json;
          health_score: number | null;
          health_summary: string | null;
          health_summary_en: string | null;
          concerns: Json;
          concerns_en: Json;
          recommendations: Json;
          recommendations_en: Json;
          urgency_level: string | null;
          raw_ai_response: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          image_url?: string | null;
          image_storage_path?: string | null;
          animal_type?: string | null;
          color?: string | null;
          color_assessment?: string | null;
          color_assessment_en?: string | null;
          consistency?: string | null;
          consistency_assessment?: string | null;
          consistency_assessment_en?: string | null;
          shape?: string | null;
          size?: string | null;
          has_blood?: boolean | null;
          has_mucus?: boolean | null;
          has_foreign_objects?: boolean | null;
          abnormalities?: Json;
          health_score?: number | null;
          health_summary?: string | null;
          health_summary_en?: string | null;
          concerns?: Json;
          concerns_en?: Json;
          recommendations?: Json;
          recommendations_en?: Json;
          urgency_level?: string | null;
          raw_ai_response?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          image_url?: string | null;
          image_storage_path?: string | null;
          animal_type?: string | null;
          color?: string | null;
          color_assessment?: string | null;
          color_assessment_en?: string | null;
          consistency?: string | null;
          consistency_assessment?: string | null;
          consistency_assessment_en?: string | null;
          shape?: string | null;
          size?: string | null;
          has_blood?: boolean | null;
          has_mucus?: boolean | null;
          has_foreign_objects?: boolean | null;
          abnormalities?: Json;
          health_score?: number | null;
          health_summary?: string | null;
          health_summary_en?: string | null;
          concerns?: Json;
          concerns_en?: Json;
          recommendations?: Json;
          recommendations_en?: Json;
          urgency_level?: string | null;
          raw_ai_response?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      community_posts: {
        Row: {
          id: string;
          user_id: number;
          board_type: string;
          pet_name: string;
          pet_photo_url: string | null;
          pet_species: string | null;
          pet_profile_id: number | null;
          author_display_name: string;
          content: string;
          content_en: string | null;
          image_url: string | null;
          is_anonymous: boolean;
          latitude: number | null;
          longitude: number | null;
          write_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: number;
          board_type: string;
          pet_name?: string;
          pet_photo_url?: string | null;
          pet_species?: string | null;
          pet_profile_id?: number | null;
          author_display_name?: string;
          content: string;
          content_en?: string | null;
          image_url?: string | null;
          is_anonymous?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          write_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: number;
          board_type?: string;
          pet_name?: string;
          pet_photo_url?: string | null;
          pet_species?: string | null;
          pet_profile_id?: number | null;
          author_display_name?: string;
          content?: string;
          content_en?: string | null;
          image_url?: string | null;
          is_anonymous?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          write_date?: string | null;
          created_at?: string;
        };
      };
      community_comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: number;
          pet_name: string;
          pet_species: string | null;
          content: string;
          content_en: string | null;
          is_anonymous: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: number;
          pet_name: string;
          pet_species?: string | null;
          content: string;
          content_en?: string | null;
          is_anonymous?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: number;
          pet_name?: string;
          pet_species?: string | null;
          content?: string;
          content_en?: string | null;
          is_anonymous?: boolean;
          created_at?: string;
        };
      };
      mission_completions: {
        Row: {
          id: string;
          user_id: number;
          mission_id: string;
          period_key: string;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: number;
          mission_id: string;
          period_key: string;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: number;
          mission_id?: string;
          period_key?: string;
          completed_at?: string;
        };
      };
      users: {
        Row: {
          id: number;
          uid: string;
          providers: string | null;
          name: string | null;
          email: string | null;
          phone: string | null;
          status: string;
          is_admin: boolean;
          total_exp: number;
          total_points: number;
          total_gems: number;
          streak_current: number;
          streak_longest: number;
          streak_last_date: string | null;
          membership_expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          uid: string;
          providers?: string | null;
          name?: string | null;
          email?: string | null;
          phone?: string | null;
          status?: string;
          is_admin?: boolean;
          total_exp?: number;
          total_points?: number;
          total_gems?: number;
          streak_current?: number;
          streak_longest?: number;
          streak_last_date?: string | null;
          membership_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          uid?: string;
          providers?: string | null;
          name?: string | null;
          email?: string | null;
          phone?: string | null;
          status?: string;
          is_admin?: boolean;
          total_exp?: number;
          total_points?: number;
          total_gems?: number;
          streak_current?: number;
          streak_longest?: number;
          streak_last_date?: string | null;
          membership_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      pet_profiles: {
        Row: {
          id: string;
          name: string;
          owner_name: string;
          owner_nickname: string;
          gender: string;
          species: string;
          breed: string;
          birth_date: string;
          weight_kg: number;
          food_brand: string;
          food_amount_g: number;
          food_cal_per_100g: number;
          personality_tags: string;
          personality_description: string;
          created_at: string;
          updated_at: string;
          home_latitude: number | null;
          home_longitude: number | null;
          user_id: number;
        };
        Insert: {
          id?: string;
          name: string;
          owner_name?: string;
          owner_nickname?: string;
          gender?: string;
          species?: string;
          breed?: string;
          birth_date?: string;
          weight_kg?: number;
          food_brand?: string;
          food_amount_g?: number;
          food_cal_per_100g?: number;
          personality_tags?: string;
          personality_description?: string;
          created_at?: string;
          updated_at?: string;
          home_latitude?: number | null;
          home_longitude?: number | null;
          user_id: number;
        };
        Update: {
          id?: string;
          name?: string;
          owner_name?: string;
          owner_nickname?: string;
          gender?: string;
          species?: string;
          breed?: string;
          birth_date?: string;
          weight_kg?: number;
          food_brand?: string;
          food_amount_g?: number;
          food_cal_per_100g?: number;
          personality_tags?: string;
          personality_description?: string;
          created_at?: string;
          updated_at?: string;
          home_latitude?: number | null;
          home_longitude?: number | null;
          user_id?: number;
        };
      };
      point_transactions: {
        Row: {
          id: number;
          user_id: number;
          amount: number;
          type: string;
          reason: string;
          reference_id: string | null;
          balance_after: number;
          created_at: string;
        };
        Insert: {
          user_id: number;
          amount: number;
          type: string;
          reason: string;
          reference_id?: string | null;
          balance_after: number;
          created_at?: string;
        };
        Update: {
          user_id?: number;
          amount?: number;
          type?: string;
          reason?: string;
          reference_id?: string | null;
          balance_after?: number;
          created_at?: string;
        };
      };
      gem_transactions: {
        Row: {
          id: number;
          user_id: number;
          amount: number;
          type: string;
          reason: string;
          reference_id: string | null;
          balance_after: number;
          created_at: string;
        };
        Insert: {
          user_id: number;
          amount: number;
          type: string;
          reason: string;
          reference_id?: string | null;
          balance_after: number;
          created_at?: string;
        };
        Update: {
          user_id?: number;
          amount?: number;
          type?: string;
          reason?: string;
          reference_id?: string | null;
          balance_after?: number;
          created_at?: string;
        };
      };
      user_mails: {
        Row: {
          id: number;
          user_id: number;
          title_ko: string;
          title_en: string;
          body_ko: string;
          body_en: string;
          rewards: Json;
          is_claimed: boolean;
          claimed_at: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          user_id: number;
          title_ko: string;
          title_en?: string;
          body_ko?: string;
          body_en?: string;
          rewards?: Json;
          is_claimed?: boolean;
          claimed_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: number;
          title_ko?: string;
          title_en?: string;
          body_ko?: string;
          body_en?: string;
          rewards?: Json;
          is_claimed?: boolean;
          claimed_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
      };
      notices: {
        Row: {
          id: number;
          title_ko: string;
          title_en: string;
          body_ko: string;
          body_en: string;
          router_link: string;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          title_ko: string;
          title_en?: string;
          body_ko?: string;
          body_en?: string;
          router_link?: string;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          title_ko?: string;
          title_en?: string;
          body_ko?: string;
          body_en?: string;
          router_link?: string;
          expires_at?: string | null;
          created_at?: string;
        };
      };
      deleted_accounts: {
        Row: {
          id: number;
          provider: string;
          provider_id: string;
          deleted_at: string;
        };
        Insert: {
          provider: string;
          provider_id: string;
          deleted_at?: string;
        };
        Update: {
          provider?: string;
          provider_id?: string;
          deleted_at?: string;
        };
      };
      streak_check_ins: {
        Row: {
          id: number;
          user_id: number;
          check_in_date: string;
          streak_count: number;
          created_at: string;
        };
        Insert: {
          user_id: number;
          check_in_date?: string;
          streak_count?: number;
          created_at?: string;
        };
        Update: {
          user_id?: number;
          check_in_date?: string;
          streak_count?: number;
          created_at?: string;
        };
      };
      user_checkup_records: {
        Row: {
          id: number;
          user_id: number;
          pet_profile_id: number | null;
          checkup_date: string;
          hospital_name: string | null;
          description: string | null;
          image_urls: Json | null;
          created_at: string;
        };
        Insert: {
          user_id: number;
          pet_profile_id?: number | null;
          checkup_date: string;
          hospital_name?: string | null;
          description?: string | null;
          image_urls?: Json | null;
          created_at?: string;
        };
        Update: {
          user_id?: number;
          pet_profile_id?: number | null;
          checkup_date?: string;
          hospital_name?: string | null;
          description?: string | null;
          image_urls?: Json | null;
          created_at?: string;
        };
      };
      user_food_records: {
        Row: {
          id: number;
          user_id: number;
          pet_profile_id: number | null;
          registration_type: string;
          food_items: Json;
          total_amount_g: number;
          total_calories: number;
          image_url: string | null;
          analysis: Json | null;
          memo: string | null;
          pet_comment: string | null;
          pet_comment_en: string | null;
          record_date: string;
          created_at: string;
        };
        Insert: {
          user_id: number;
          pet_profile_id?: number | null;
          registration_type: string;
          food_items: Json;
          total_amount_g?: number;
          total_calories?: number;
          image_url?: string | null;
          analysis?: Json | null;
          memo?: string | null;
          pet_comment?: string | null;
          pet_comment_en?: string | null;
          record_date: string;
          created_at?: string;
        };
        Update: {
          user_id?: number;
          pet_profile_id?: number | null;
          registration_type?: string;
          food_items?: Json;
          total_amount_g?: number;
          total_calories?: number;
          image_url?: string | null;
          analysis?: Json | null;
          memo?: string | null;
          pet_comment?: string | null;
          pet_comment_en?: string | null;
          record_date?: string;
          created_at?: string;
        };
      };
      user_grooming_records: {
        Row: {
          id: number;
          user_id: number;
          pet_profile_id: number | null;
          grooming_date: string;
          image_url: string | null;
          description: string | null;
          shop_name: string | null;
          created_at: string;
        };
        Insert: {
          user_id: number;
          pet_profile_id?: number | null;
          grooming_date: string;
          image_url?: string | null;
          description?: string | null;
          shop_name?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: number;
          pet_profile_id?: number | null;
          grooming_date?: string;
          image_url?: string | null;
          description?: string | null;
          shop_name?: string | null;
          created_at?: string;
        };
      };
      user_inventory: {
        Row: {
          id: number;
          user_id: number;
          item_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: number;
          item_id: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: number;
          item_id?: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_stool_records: {
        Row: {
          id: number;
          user_id: number;
          pet_profile_id: number | null;
          health_score: number | null;
          color: string | null;
          consistency: string | null;
          shape: string | null;
          size: string | null;
          has_blood: boolean;
          has_mucus: boolean;
          urgency_level: string | null;
          health_summary: string | null;
          health_summary_en: string | null;
          analysis: Json | null;
          image_url: string | null;
          record_date: string;
          created_at: string;
        };
        Insert: {
          user_id: number;
          pet_profile_id?: number | null;
          health_score?: number | null;
          color?: string | null;
          consistency?: string | null;
          shape?: string | null;
          size?: string | null;
          has_blood?: boolean;
          has_mucus?: boolean;
          urgency_level?: string | null;
          health_summary?: string | null;
          health_summary_en?: string | null;
          analysis?: Json | null;
          image_url?: string | null;
          record_date: string;
          created_at?: string;
        };
        Update: {
          user_id?: number;
          pet_profile_id?: number | null;
          health_score?: number | null;
          color?: string | null;
          consistency?: string | null;
          shape?: string | null;
          size?: string | null;
          has_blood?: boolean;
          has_mucus?: boolean;
          urgency_level?: string | null;
          health_summary?: string | null;
          health_summary_en?: string | null;
          analysis?: Json | null;
          image_url?: string | null;
          record_date?: string;
          created_at?: string;
        };
      };
      user_walk_records: {
        Row: {
          id: number;
          user_id: number;
          pet_profile_id: number | null;
          started_at: string;
          ended_at: string;
          duration_seconds: number;
          distance_meters: number;
          steps: number;
          memo: string | null;
          image_url: string | null;
          pet_comment: string | null;
          pet_comment_en: string | null;
          created_at: string;
        };
        Insert: {
          user_id: number;
          pet_profile_id?: number | null;
          started_at: string;
          ended_at: string;
          duration_seconds?: number;
          distance_meters?: number;
          steps?: number;
          memo?: string | null;
          image_url?: string | null;
          pet_comment?: string | null;
          pet_comment_en?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: number;
          pet_profile_id?: number | null;
          started_at?: string;
          ended_at?: string;
          duration_seconds?: number;
          distance_meters?: number;
          steps?: number;
          memo?: string | null;
          image_url?: string | null;
          pet_comment?: string | null;
          pet_comment_en?: string | null;
          created_at?: string;
        };
      };
      user_weight_records: {
        Row: {
          id: number;
          user_id: number;
          pet_profile_id: number | null;
          weight_kg: number;
          record_date: string;
          created_at: string;
        };
        Insert: {
          user_id: number;
          pet_profile_id?: number | null;
          weight_kg: number;
          record_date: string;
          created_at?: string;
        };
        Update: {
          user_id?: number;
          pet_profile_id?: number | null;
          weight_kg?: number;
          record_date?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
