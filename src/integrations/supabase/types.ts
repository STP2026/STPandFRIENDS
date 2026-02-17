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
      advertisements: {
        Row: {
          created_at: string
          created_by: string | null
          display_delay_seconds: number
          id: string
          image_url: string
          is_active: boolean
          target_url: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          display_delay_seconds?: number
          id?: string
          image_url: string
          is_active?: boolean
          target_url: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          display_delay_seconds?: number
          id?: string
          image_url?: string
          is_active?: boolean
          target_url?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      dog_change_log: {
        Row: {
          action: string
          changes: Json | null
          created_at: string
          dog_id: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string
          dog_id: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string
          dog_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dog_change_log_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dog_change_log_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs_public"
            referencedColumns: ["id"]
          },
        ]
      }
      dog_remarks: {
        Row: {
          content: string
          created_at: string
          dog_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          dog_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          dog_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dog_remarks_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dog_remarks_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs_public"
            referencedColumns: ["id"]
          },
        ]
      }
      dogs: {
        Row: {
          additional_info: string | null
          created_at: string
          ear_tag: string
          id: string
          is_approved: boolean | null
          is_vaccinated: boolean | null
          latitude: number
          location: string | null
          longitude: number
          name: string
          photo_url: string | null
          report_type: Database["public"]["Enums"]["report_type"]
          reported_by: string | null
          sponsor_name: string | null
          updated_at: string
          urgency_level: string | null
          vaccination_passport: string | null
          vaccination1_date: string | null
          vaccination2_date: string | null
        }
        Insert: {
          additional_info?: string | null
          created_at?: string
          ear_tag: string
          id?: string
          is_approved?: boolean | null
          is_vaccinated?: boolean | null
          latitude: number
          location?: string | null
          longitude: number
          name: string
          photo_url?: string | null
          report_type?: Database["public"]["Enums"]["report_type"]
          reported_by?: string | null
          sponsor_name?: string | null
          updated_at?: string
          urgency_level?: string | null
          vaccination_passport?: string | null
          vaccination1_date?: string | null
          vaccination2_date?: string | null
        }
        Update: {
          additional_info?: string | null
          created_at?: string
          ear_tag?: string
          id?: string
          is_approved?: boolean | null
          is_vaccinated?: boolean | null
          latitude?: number
          location?: string | null
          longitude?: number
          name?: string
          photo_url?: string | null
          report_type?: Database["public"]["Enums"]["report_type"]
          reported_by?: string | null
          sponsor_name?: string | null
          updated_at?: string
          urgency_level?: string | null
          vaccination_passport?: string | null
          vaccination1_date?: string | null
          vaccination2_date?: string | null
        }
        Relationships: []
      }
      facilities: {
        Row: {
          address: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          latitude: number
          longitude: number
          name: string
          phone: string | null
          photo_url: string | null
          type: Database["public"]["Enums"]["facility_type"]
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          latitude: number
          longitude: number
          name: string
          phone?: string | null
          photo_url?: string | null
          type: Database["public"]["Enums"]["facility_type"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          phone?: string | null
          photo_url?: string | null
          type?: Database["public"]["Enums"]["facility_type"]
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      helper_applications: {
        Row: {
          created_at: string
          id: string
          message: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      rehab_spots: {
        Row: {
          available_until: string
          contact_info: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          notes: string | null
          places_total: number
          updated_at: string
        }
        Insert: {
          available_until: string
          contact_info: string
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          notes?: string | null
          places_total?: number
          updated_at?: string
        }
        Update: {
          available_until?: string
          contact_info?: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          places_total?: number
          updated_at?: string
        }
        Relationships: []
      }
      team_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_messages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "team_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      dogs_public: {
        Row: {
          additional_info: string | null
          created_at: string | null
          ear_tag: string | null
          id: string | null
          is_approved: boolean | null
          is_vaccinated: boolean | null
          latitude: number | null
          location: string | null
          longitude: number | null
          name: string | null
          photo_url: string | null
          report_type: Database["public"]["Enums"]["report_type"] | null
          reporter_name: string | null
          sponsor_name: string | null
          updated_at: string | null
          urgency_level: string | null
          vaccination_passport: string | null
          vaccination1_date: string | null
          vaccination2_date: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_helper: { Args: { _user_id: string }; Returns: boolean }
      is_helper_or_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator"
      facility_type: "vet" | "friend"
      report_type: "save" | "sos" | "stray" | "vaccination_wish"
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
      app_role: ["admin", "moderator"],
      facility_type: ["vet", "friend"],
      report_type: ["save", "sos", "stray", "vaccination_wish"],
    },
  },
} as const
