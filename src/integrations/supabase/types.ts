export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      pdfUrl: {
        Row: {
          created_at: string
          id: number
          pdf_Url: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          pdf_Url?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          pdf_Url?: string | null
        }
        Relationships: []
      }
      Prop_Info: {
        Row: {
          CallBackUrl: string | null
          created_at: string
          "Edit Fields3": Json | null
          "Edit Fields4": Json | null
          "Edit Fields5": string | null
          "For sale comparables Picture analysis": string | null
          id: number
          OpenAI6: string | null
          RadarID: string | null
          "Recent Sales comparables Picture Analysis": string | null
          report_Url: string | null
          "Subject Address": string | null
          "Subject Property": Json | null
          user_Email: string | null
          user_name: string | null
          "Users Input": string | null
          zpid: string | null
        }
        Insert: {
          CallBackUrl?: string | null
          created_at?: string
          "Edit Fields3"?: Json | null
          "Edit Fields4"?: Json | null
          "Edit Fields5"?: string | null
          "For sale comparables Picture analysis"?: string | null
          id?: number
          OpenAI6?: string | null
          RadarID?: string | null
          "Recent Sales comparables Picture Analysis"?: string | null
          report_Url?: string | null
          "Subject Address"?: string | null
          "Subject Property"?: Json | null
          user_Email?: string | null
          user_name?: string | null
          "Users Input"?: string | null
          zpid?: string | null
        }
        Update: {
          CallBackUrl?: string | null
          created_at?: string
          "Edit Fields3"?: Json | null
          "Edit Fields4"?: Json | null
          "Edit Fields5"?: string | null
          "For sale comparables Picture analysis"?: string | null
          id?: number
          OpenAI6?: string | null
          RadarID?: string | null
          "Recent Sales comparables Picture Analysis"?: string | null
          report_Url?: string | null
          "Subject Address"?: string | null
          "Subject Property"?: Json | null
          user_Email?: string | null
          user_name?: string | null
          "Users Input"?: string | null
          zpid?: string | null
        }
        Relationships: []
      }
      property_reports: {
        Row: {
          address: string
          address_data: Json | null
          created_at: string
          estimated_value: number | null
          generation_time_seconds: number | null
          id: string
          report_data: Json
          updated_at: string
          user_id: string
          user_type: string
          webhook_data: Json | null
        }
        Insert: {
          address: string
          address_data?: Json | null
          created_at?: string
          estimated_value?: number | null
          generation_time_seconds?: number | null
          id?: string
          report_data: Json
          updated_at?: string
          user_id: string
          user_type: string
          webhook_data?: Json | null
        }
        Update: {
          address?: string
          address_data?: Json | null
          created_at?: string
          estimated_value?: number | null
          generation_time_seconds?: number | null
          id?: string
          report_data?: Json
          updated_at?: string
          user_id?: string
          user_type?: string
          webhook_data?: Json | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email_notifications: boolean | null
          full_name: string | null
          id: string
          preferred_user_type: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email_notifications?: boolean | null
          full_name?: string | null
          id: string
          preferred_user_type?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email_notifications?: boolean | null
          full_name?: string | null
          id?: string
          preferred_user_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      webhook_jobs: {
        Row: {
          created_at: string
          error: string | null
          id: string
          request_data: Json
          request_type: string
          response_data: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at: string
          error?: string | null
          id?: string
          request_data: Json
          request_type: string
          response_data?: Json | null
          status: string
          updated_at: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          request_data?: Json
          request_type?: string
          response_data?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_prop_info: {
        Args: {
          row_id: number
          p_zpid?: string
          p_radarid?: string
          p_callbackurl?: string
          p_edit_fields5?: string
          p_edit_fields4?: string
          p_edit_fields3?: Json
          p_openai6?: string
          p_subject_property?: Json
          p_subject_address?: string
          p_users_input?: string
          p_recent_sales_comparables_picture_analysis?: string
          p_for_sale_comparables_picture_analysis?: string
        }
        Returns: {
          CallBackUrl: string | null
          created_at: string
          "Edit Fields3": Json | null
          "Edit Fields4": Json | null
          "Edit Fields5": string | null
          "For sale comparables Picture analysis": string | null
          id: number
          OpenAI6: string | null
          RadarID: string | null
          "Recent Sales comparables Picture Analysis": string | null
          report_Url: string | null
          "Subject Address": string | null
          "Subject Property": Json | null
          user_Email: string | null
          user_name: string | null
          "Users Input": string | null
          zpid: string | null
        }[]
      }
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
