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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_date: string | null
          achievement_year: number
          archived: boolean
          category: string
          certificate_url: string | null
          created_at: string
          description: string | null
          id: string
          level: string | null
          photo_url: string | null
          related_program_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          achievement_date?: string | null
          achievement_year: number
          archived?: boolean
          category: string
          certificate_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          level?: string | null
          photo_url?: string | null
          related_program_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          achievement_date?: string | null
          achievement_year?: number
          archived?: boolean
          category?: string
          certificate_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          level?: string | null
          photo_url?: string | null
          related_program_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_related_program_id_fkey"
            columns: ["related_program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          id: string
          title: string
          updated_at: string
          wing: string | null
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          id?: string
          title: string
          updated_at?: string
          wing?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          title?: string
          updated_at?: string
          wing?: string | null
        }
        Relationships: []
      }
      audit_reports: {
        Row: {
          body: string | null
          created_at: string
          file_url: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_verifications: {
        Row: {
          attempts: number
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          verified_at: string | null
        }
        Insert: {
          attempts?: number
          code: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          verified_at?: string | null
        }
        Update: {
          attempts?: number
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          program_id: string
          user_id: string | null
          wing: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          program_id: string
          user_id?: string | null
          wing?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          program_id?: string
          user_id?: string | null
          wing?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      event_results: {
        Row: {
          additional_info: string | null
          attachments: Json
          created_at: string
          created_by: string | null
          first_place: string | null
          first_place_photo_url: string | null
          gallery_image_urls: Json
          id: string
          program_id: string
          published_at: string | null
          result_pdf_url: string | null
          second_place: string | null
          second_place_photo_url: string | null
          special_mention: string | null
          special_mention_photo_url: string | null
          status: Database["public"]["Enums"]["result_status"]
          third_place: string | null
          third_place_photo_url: string | null
          updated_at: string
        }
        Insert: {
          additional_info?: string | null
          attachments?: Json
          created_at?: string
          created_by?: string | null
          first_place?: string | null
          first_place_photo_url?: string | null
          gallery_image_urls?: Json
          id?: string
          program_id: string
          published_at?: string | null
          result_pdf_url?: string | null
          second_place?: string | null
          second_place_photo_url?: string | null
          special_mention?: string | null
          special_mention_photo_url?: string | null
          status?: Database["public"]["Enums"]["result_status"]
          third_place?: string | null
          third_place_photo_url?: string | null
          updated_at?: string
        }
        Update: {
          additional_info?: string | null
          attachments?: Json
          created_at?: string
          created_by?: string | null
          first_place?: string | null
          first_place_photo_url?: string | null
          gallery_image_urls?: Json
          id?: string
          program_id?: string
          published_at?: string | null
          result_pdf_url?: string | null
          second_place?: string | null
          second_place_photo_url?: string | null
          special_mention?: string | null
          special_mention_photo_url?: string | null
          status?: Database["public"]["Enums"]["result_status"]
          third_place?: string | null
          third_place_photo_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_results_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: true
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          admin_note: string | null
          category: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string | null
          rating: number | null
          reviewed: boolean
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          admin_note?: string | null
          category?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name?: string | null
          rating?: number | null
          reviewed?: boolean
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          admin_note?: string | null
          category?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string | null
          rating?: number | null
          reviewed?: boolean
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      gallery_photos: {
        Row: {
          caption: string | null
          category: string | null
          created_at: string
          event_year: number | null
          id: string
          image_url: string
          program_id: string | null
          updated_at: string
          uploaded_by: string | null
          wing: string | null
        }
        Insert: {
          caption?: string | null
          category?: string | null
          created_at?: string
          event_year?: number | null
          id?: string
          image_url: string
          program_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
          wing?: string | null
        }
        Update: {
          caption?: string | null
          category?: string | null
          created_at?: string
          event_year?: number | null
          id?: string
          image_url?: string
          program_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
          wing?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_photos_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string | null
          program_id: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          program_id?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          program_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string | null
          created_by_portal: string
          description: string | null
          end_time: string | null
          event_date: string
          event_time: string | null
          id: string
          name: string
          poster_url: string | null
          result_status: Database["public"]["Enums"]["result_status"]
          status: Database["public"]["Enums"]["event_status"]
          updated_at: string
          venue: string | null
          wing: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          created_by_portal?: string
          description?: string | null
          end_time?: string | null
          event_date: string
          event_time?: string | null
          id?: string
          name: string
          poster_url?: string | null
          result_status?: Database["public"]["Enums"]["result_status"]
          status?: Database["public"]["Enums"]["event_status"]
          updated_at?: string
          venue?: string | null
          wing: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          created_by_portal?: string
          description?: string | null
          end_time?: string | null
          event_date?: string
          event_time?: string | null
          id?: string
          name?: string
          poster_url?: string | null
          result_status?: Database["public"]["Enums"]["result_status"]
          status?: Database["public"]["Enums"]["event_status"]
          updated_at?: string
          venue?: string | null
          wing?: string
        }
        Relationships: []
      }
      quick_links: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_order: number
          enabled: boolean
          icon_url: string | null
          id: string
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          display_order?: number
          enabled?: boolean
          icon_url?: string | null
          id?: string
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number
          enabled?: boolean
          icon_url?: string | null
          id?: string
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      stationery_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price?: number
          quantity?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          quantity?: number
          updated_at?: string
        }
        Relationships: []
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
      wing_stats_overrides: {
        Row: {
          active_members: number | null
          notes: string | null
          total_programs: number | null
          updated_at: string
          wing: string
        }
        Insert: {
          active_members?: number | null
          notes?: string | null
          total_programs?: number | null
          updated_at?: string
          wing: string
        }
        Update: {
          active_members?: number | null
          notes?: string | null
          total_programs?: number | null
          updated_at?: string
          wing?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_complete_programs: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "auditor" | "wing_lead" | "user"
      event_status:
        | "draft"
        | "registration_open"
        | "registration_closed"
        | "completed"
        | "result_published"
        | "archived"
      result_status: "pending" | "draft" | "published"
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
      app_role: ["admin", "auditor", "wing_lead", "user"],
      event_status: [
        "draft",
        "registration_open",
        "registration_closed",
        "completed",
        "result_published",
        "archived",
      ],
      result_status: ["pending", "draft", "published"],
    },
  },
} as const
