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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      community_posts: {
        Row: {
          author_display_name: string
          board_type: string
          content: string
          created_at: string
          id: string
          image_url: string | null
          pet_name: string
          pet_photo_url: string | null
          summary_date: string | null
          user_id: string
        }
        Insert: {
          author_display_name?: string
          board_type: string
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          pet_name?: string
          pet_photo_url?: string | null
          summary_date?: string | null
          user_id: string
        }
        Update: {
          author_display_name?: string
          board_type?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          pet_name?: string
          pet_photo_url?: string | null
          summary_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      food_analyses: {
        Row: {
          animal_type: string | null
          calories_g: number
          created_at: string
          food_amount_g: number | null
          food_name: string | null
          food_type: string | null
          id: string
          image_storage_path: string | null
          image_url: string | null
          ingredients: Json
          nutrients: Json
          overall_rating: number | null
          product_name: string | null
          rating_summary: string | null
          raw_ai_response: Json | null
          recommendations: string | null
          updated_at: string
        }
        Insert: {
          animal_type?: string | null
          calories_g?: number
          created_at?: string
          food_amount_g?: number | null
          food_name?: string | null
          food_type?: string | null
          id?: string
          image_storage_path?: string | null
          image_url?: string | null
          ingredients?: Json
          nutrients?: Json
          overall_rating?: number | null
          product_name?: string | null
          rating_summary?: string | null
          raw_ai_response?: Json | null
          recommendations?: string | null
          updated_at?: string
        }
        Update: {
          animal_type?: string | null
          calories_g?: number
          created_at?: string
          food_amount_g?: number | null
          food_name?: string | null
          food_type?: string | null
          id?: string
          image_storage_path?: string | null
          image_url?: string | null
          ingredients?: Json
          nutrients?: Json
          overall_rating?: number | null
          product_name?: string | null
          rating_summary?: string | null
          raw_ai_response?: Json | null
          recommendations?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      mission_completions: {
        Row: {
          completed_at: string
          id: string
          mission_id: string
          period_key: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          mission_id: string
          period_key: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          mission_id?: string
          period_key?: string
          user_id?: string
        }
        Relationships: []
      }
      stool_analyses: {
        Row: {
          abnormalities: Json
          animal_type: string | null
          color: string | null
          color_assessment: string | null
          concerns: Json
          consistency: string | null
          consistency_assessment: string | null
          created_at: string
          has_blood: boolean | null
          has_foreign_objects: boolean | null
          has_mucus: boolean | null
          health_score: number | null
          health_summary: string | null
          id: string
          image_storage_path: string | null
          image_url: string | null
          raw_ai_response: Json | null
          recommendations: Json
          shape: string | null
          size: string | null
          updated_at: string
          urgency_level: string | null
        }
        Insert: {
          abnormalities?: Json
          animal_type?: string | null
          color?: string | null
          color_assessment?: string | null
          concerns?: Json
          consistency?: string | null
          consistency_assessment?: string | null
          created_at?: string
          has_blood?: boolean | null
          has_foreign_objects?: boolean | null
          has_mucus?: boolean | null
          health_score?: number | null
          health_summary?: string | null
          id?: string
          image_storage_path?: string | null
          image_url?: string | null
          raw_ai_response?: Json | null
          recommendations?: Json
          shape?: string | null
          size?: string | null
          updated_at?: string
          urgency_level?: string | null
        }
        Update: {
          abnormalities?: Json
          animal_type?: string | null
          color?: string | null
          color_assessment?: string | null
          concerns?: Json
          consistency?: string | null
          consistency_assessment?: string | null
          created_at?: string
          has_blood?: boolean | null
          has_foreign_objects?: boolean | null
          has_mucus?: boolean | null
          health_score?: number | null
          health_summary?: string | null
          id?: string
          image_storage_path?: string | null
          image_url?: string | null
          raw_ai_response?: Json | null
          recommendations?: Json
          shape?: string | null
          size?: string | null
          updated_at?: string
          urgency_level?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
