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
      ai_usage_limits: {
        Row: {
          limit_exhausted_at: string | null
          updated_at: string
          used_count: number
          user_id: string
          window_started_at: string
        }
        Insert: {
          limit_exhausted_at?: string | null
          updated_at?: string
          used_count?: number
          user_id: string
          window_started_at?: string
        }
        Update: {
          limit_exhausted_at?: string | null
          updated_at?: string
          used_count?: number
          user_id?: string
          window_started_at?: string
        }
        Relationships: []
      }
      auth_audit_log: {
        Row: {
          created_at: string | null
          email: string | null
          error_message: string | null
          event_type: string
          id: string
          is_relay_email: boolean | null
          provider: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          is_relay_email?: boolean | null
          provider?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          is_relay_email?: boolean | null
          provider?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          ai_response: string | null
          created_at: string
          id: string
          mode: string
          user_id: string
          user_message: string
        }
        Insert: {
          ai_response?: string | null
          created_at?: string
          id?: string
          mode?: string
          user_id: string
          user_message: string
        }
        Update: {
          ai_response?: string | null
          created_at?: string
          id?: string
          mode?: string
          user_id?: string
          user_message?: string
        }
        Relationships: []
      }
      medicine_searches: {
        Row: {
          created_at: string
          id: string
          query: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          query: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          query?: string
          user_id?: string
        }
        Relationships: []
      }
      oauth_identities: {
        Row: {
          created_at: string | null
          id: string
          provider: string
          provider_email: string | null
          provider_user_id: string
          raw_data: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          provider: string
          provider_email?: string | null
          provider_user_id: string
          raw_data?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          provider?: string
          provider_email?: string | null
          provider_user_id?: string
          raw_data?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      phone_verifications: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: string
          phone: string
          verified: boolean
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string
          id?: string
          phone: string
          verified?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          phone?: string
          verified?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          allergies: string[]
          auth_providers: string[] | null
          avatar_url: string | null
          blood_pressure: string
          created_at: string
          full_name: string | null
          id: string
          is_relay_email: boolean | null
          phone: string | null
          pro_expires_at: string | null
          pro_payment_provider: string | null
          pro_payment_reference: string | null
          relay_email: string | null
          subscription_plan: string
          terms_accepted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allergies?: string[]
          auth_providers?: string[] | null
          avatar_url?: string | null
          blood_pressure?: string
          created_at?: string
          full_name?: string | null
          id?: string
          is_relay_email?: boolean | null
          phone?: string | null
          pro_expires_at?: string | null
          pro_payment_provider?: string | null
          pro_payment_reference?: string | null
          relay_email?: string | null
          subscription_plan?: string
          terms_accepted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allergies?: string[]
          auth_providers?: string[] | null
          avatar_url?: string | null
          blood_pressure?: string
          created_at?: string
          full_name?: string | null
          id?: string
          is_relay_email?: boolean | null
          phone?: string | null
          pro_expires_at?: string | null
          pro_payment_provider?: string | null
          pro_payment_reference?: string | null
          relay_email?: string | null
          subscription_plan?: string
          terms_accepted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          ai_feedback: string | null
          completed_at: string
          created_at: string
          goal_id: string | null
          id: string
          meals_done: boolean
          mood_score: number | null
          sleep_done: boolean
          updated_at: string
          user_id: string
          water_done: boolean
          workout_done: boolean
        }
        Insert: {
          ai_feedback?: string | null
          completed_at?: string
          created_at?: string
          goal_id?: string | null
          id?: string
          meals_done?: boolean
          mood_score?: number | null
          sleep_done?: boolean
          updated_at?: string
          user_id: string
          water_done?: boolean
          workout_done?: boolean
        }
        Update: {
          ai_feedback?: string | null
          completed_at?: string
          created_at?: string
          goal_id?: string | null
          id?: string
          meals_done?: boolean
          mood_score?: number | null
          sleep_done?: boolean
          updated_at?: string
          user_id?: string
          water_done?: boolean
          workout_done?: boolean
        }
        Relationships: []
      }
      lifestyle_reminders: {
        Row: {
          channel: string
          created_at: string
          goal_id: string | null
          id: string
          is_enabled: boolean
          message_template: string
          reminder_type: string
          scheduled_time: string
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          channel: string
          created_at?: string
          goal_id?: string | null
          id?: string
          is_enabled?: boolean
          message_template: string
          reminder_type: string
          scheduled_time: string
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          goal_id?: string | null
          id?: string
          is_enabled?: boolean
          message_template?: string
          reminder_type?: string
          scheduled_time?: string
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          content: string
          created_at: string
          id: string
          rating: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          rating?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          rating?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          activity_level: string
          age: number
          created_at: string
          gender: string
          goal_type: string
          height_cm: number
          id: string
          notification_channels: Json
          plan_data: Json
          start_weight_kg: number
          status: string
          target_calories: number
          target_carbs_g: number
          target_fat_g: number
          target_protein_g: number
          telegram_chat_id: string | null
          telegram_link_code: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_level: string
          age: number
          created_at?: string
          gender: string
          goal_type: string
          height_cm: number
          id?: string
          notification_channels?: Json
          plan_data?: Json
          start_weight_kg: number
          status?: string
          target_calories: number
          target_carbs_g: number
          target_fat_g: number
          target_protein_g: number
          telegram_chat_id?: string | null
          telegram_link_code?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_level?: string
          age?: number
          created_at?: string
          gender?: string
          goal_type?: string
          height_cm?: number
          id?: string
          notification_channels?: Json
          plan_data?: Json
          start_weight_kg?: number
          status?: string
          target_calories?: number
          target_carbs_g?: number
          target_fat_g?: number
          target_protein_g?: number
          telegram_chat_id?: string | null
          telegram_link_code?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weight_history: {
        Row: {
          created_at: string
          goal_id: string | null
          id: string
          recorded_at: string
          user_id: string
          weight_kg: number
        }
        Insert: {
          created_at?: string
          goal_id?: string | null
          id?: string
          recorded_at?: string
          user_id: string
          weight_kg: number
        }
        Update: {
          created_at?: string
          goal_id?: string | null
          id?: string
          recorded_at?: string
          user_id?: string
          weight_kg?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          channel: string
          created_at: string
          id: string
          metadata: Json
          reminder_id: string | null
          scheduled_for: string
          sent_at: string | null
          status: string
          title: string
          user_id: string
        }
        Insert: {
          body: string
          channel: string
          created_at?: string
          id?: string
          metadata?: Json
          reminder_id?: string | null
          scheduled_for: string
          sent_at?: string | null
          status?: string
          title: string
          user_id: string
        }
        Update: {
          body?: string
          channel?: string
          created_at?: string
          id?: string
          metadata?: Json
          reminder_id?: string | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_by_oauth: {
        Args: { _provider: string; _provider_user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      link_oauth_provider: {
        Args: {
          _provider: string
          _provider_email: string
          _provider_user_id: string
          _raw_data: Json
          _user_id: string
        }
        Returns: boolean
      }
      log_auth_event: {
        Args: {
          _email: string
          _error_message?: string
          _event_type: string
          _is_relay_email?: boolean
          _provider: string
          _status?: string
          _user_id: string
        }
        Returns: boolean
      }
      update_relay_email: {
        Args: { _email: string; _is_relay: boolean; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
