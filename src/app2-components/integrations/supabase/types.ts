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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      lead_ingests: {
        Row: {
          id: string
          payload: Json | null
          received_at: string
          request_ip: string | null
          status: string | null
          total_items: number | null
        }
        Insert: {
          id?: string
          payload?: Json | null
          received_at?: string
          request_ip?: string | null
          status?: string | null
          total_items?: number | null
        }
        Update: {
          id?: string
          payload?: Json | null
          received_at?: string
          request_ip?: string | null
          status?: string | null
          total_items?: number | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          baths: number | null
          beds: number | null
          cma_url: string | null
          created_at: string
          date_key: string
          delinquent_amount: number | null
          delinquent_installments: number | null
          dom: number | null
          emails_other_owner: string[] | null
          emails_primary_owner: string[] | null
          equity_percent: number | null
          estimated_value: number | null
          filed_for_divorce_30_days: boolean | null
          first_loan_amount: number | null
          first_loan_purpose: string | null
          first_loan_type: string | null
          foreclosure_recorded_date: string | null
          foreclosure_stage: string | null
          has_open_liens: boolean | null
          id: string
          is_foreclosure: boolean | null
          is_in_bankruptcy: boolean | null
          is_on_the_market: boolean | null
          is_tax_delinquent: boolean | null
          is_the_owner_deceased: boolean | null
          last_transfer_recording_date: string | null
          last_transfer_value: number | null
          listing_date: string | null
          listing_price: number | null
          listings_status: string | null
          lot: number | null
          mailing_address: string | null
          mailing_same_as_property: boolean | null
          number_of_loans: number | null
          other_owner: string | null
          other_owner_age: number | null
          other_owner_occupation: string | null
          ownership_type: string | null
          phones_other_owner: string[] | null
          phones_primary_owner: string[] | null
          primary_owner: string | null
          primary_owner_age: number | null
          primary_owner_occupation: string | null
          property_address: string | null
          property_type: string | null
          raw: Json | null
          row_number: number | null
          sqft: number | null
          year_built: number | null
          zoning: string | null
        }
        Insert: {
          baths?: number | null
          beds?: number | null
          cma_url?: string | null
          created_at?: string
          date_key: string
          delinquent_amount?: number | null
          delinquent_installments?: number | null
          dom?: number | null
          emails_other_owner?: string[] | null
          emails_primary_owner?: string[] | null
          equity_percent?: number | null
          estimated_value?: number | null
          filed_for_divorce_30_days?: boolean | null
          first_loan_amount?: number | null
          first_loan_purpose?: string | null
          first_loan_type?: string | null
          foreclosure_recorded_date?: string | null
          foreclosure_stage?: string | null
          has_open_liens?: boolean | null
          id: string
          is_foreclosure?: boolean | null
          is_in_bankruptcy?: boolean | null
          is_on_the_market?: boolean | null
          is_tax_delinquent?: boolean | null
          is_the_owner_deceased?: boolean | null
          last_transfer_recording_date?: string | null
          last_transfer_value?: number | null
          listing_date?: string | null
          listing_price?: number | null
          listings_status?: string | null
          lot?: number | null
          mailing_address?: string | null
          mailing_same_as_property?: boolean | null
          number_of_loans?: number | null
          other_owner?: string | null
          other_owner_age?: number | null
          other_owner_occupation?: string | null
          ownership_type?: string | null
          phones_other_owner?: string[] | null
          phones_primary_owner?: string[] | null
          primary_owner?: string | null
          primary_owner_age?: number | null
          primary_owner_occupation?: string | null
          property_address?: string | null
          property_type?: string | null
          raw?: Json | null
          row_number?: number | null
          sqft?: number | null
          year_built?: number | null
          zoning?: string | null
        }
        Update: {
          baths?: number | null
          beds?: number | null
          cma_url?: string | null
          created_at?: string
          date_key?: string
          delinquent_amount?: number | null
          delinquent_installments?: number | null
          dom?: number | null
          emails_other_owner?: string[] | null
          emails_primary_owner?: string[] | null
          equity_percent?: number | null
          estimated_value?: number | null
          filed_for_divorce_30_days?: boolean | null
          first_loan_amount?: number | null
          first_loan_purpose?: string | null
          first_loan_type?: string | null
          foreclosure_recorded_date?: string | null
          foreclosure_stage?: string | null
          has_open_liens?: boolean | null
          id?: string
          is_foreclosure?: boolean | null
          is_in_bankruptcy?: boolean | null
          is_on_the_market?: boolean | null
          is_tax_delinquent?: boolean | null
          is_the_owner_deceased?: boolean | null
          last_transfer_recording_date?: string | null
          last_transfer_value?: number | null
          listing_date?: string | null
          listing_price?: number | null
          listings_status?: string | null
          lot?: number | null
          mailing_address?: string | null
          mailing_same_as_property?: boolean | null
          number_of_loans?: number | null
          other_owner?: string | null
          other_owner_age?: number | null
          other_owner_occupation?: string | null
          ownership_type?: string | null
          phones_other_owner?: string[] | null
          phones_primary_owner?: string[] | null
          primary_owner?: string | null
          primary_owner_age?: number | null
          primary_owner_occupation?: string | null
          property_address?: string | null
          property_type?: string | null
          raw?: Json | null
          row_number?: number | null
          sqft?: number | null
          year_built?: number | null
          zoning?: string | null
        }
        Relationships: []
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
