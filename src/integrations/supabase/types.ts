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
      bookmarks: {
        Row: {
          created_at: string
          id: string
          research_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          research_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          research_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_research_id_fkey"
            columns: ["research_id"]
            isOneToOne: false
            referencedRelation: "researches"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          affiliation: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          affiliation?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          affiliation?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      qa_answers: {
        Row: {
          content: string
          created_at: string
          id: string
          is_deleted: boolean
          question_id: string
          updated_at: string
          upvotes: number
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          question_id: string
          updated_at?: string
          upvotes?: number
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          question_id?: string
          updated_at?: string
          upvotes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qa_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "qa_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      qa_questions: {
        Row: {
          content: string
          created_at: string
          id: string
          is_deleted: boolean
          research_id: string
          updated_at: string
          upvotes: number
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          research_id: string
          updated_at?: string
          upvotes?: number
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          research_id?: string
          updated_at?: string
          upvotes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qa_questions_research_id_fkey"
            columns: ["research_id"]
            isOneToOne: false
            referencedRelation: "researches"
            referencedColumns: ["id"]
          },
        ]
      }
      qa_upvotes: {
        Row: {
          answer_id: string | null
          created_at: string
          id: string
          question_id: string | null
          user_id: string
        }
        Insert: {
          answer_id?: string | null
          created_at?: string
          id?: string
          question_id?: string | null
          user_id: string
        }
        Update: {
          answer_id?: string | null
          created_at?: string
          id?: string
          question_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qa_upvotes_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "qa_answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qa_upvotes_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "qa_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      researches: {
        Row: {
          abstract: string
          abstract_visible: boolean
          academic_year: string | null
          access_level: Database["public"]["Enums"]["access_level"]
          author_id: string
          citation_apa: string | null
          citation_mla: string | null
          created_at: string
          file_name: string | null
          file_url: string | null
          id: string
          is_archived: boolean
          keywords: string[]
          label: Database["public"]["Enums"]["research_label"] | null
          strand: Database["public"]["Enums"]["research_strand"] | null
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          abstract: string
          abstract_visible?: boolean
          academic_year?: string | null
          access_level?: Database["public"]["Enums"]["access_level"]
          author_id: string
          citation_apa?: string | null
          citation_mla?: string | null
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          is_archived?: boolean
          keywords?: string[]
          label?: Database["public"]["Enums"]["research_label"] | null
          strand?: Database["public"]["Enums"]["research_strand"] | null
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          abstract?: string
          abstract_visible?: boolean
          academic_year?: string | null
          access_level?: Database["public"]["Enums"]["access_level"]
          author_id?: string
          citation_apa?: string | null
          citation_mla?: string | null
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          is_archived?: boolean
          keywords?: string[]
          label?: Database["public"]["Enums"]["research_label"] | null
          strand?: Database["public"]["Enums"]["research_strand"] | null
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
      search_history: {
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
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      access_level: "public" | "authenticated" | "restricted"
      app_role: "admin" | "researcher" | "student"
      research_label:
        | "practical_research"
        | "capstone"
        | "thesis"
        | "dissertation"
        | "other"
      research_strand: "STEM" | "HUMSS" | "ABM" | "ICT" | "GAS" | "Other"
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
      access_level: ["public", "authenticated", "restricted"],
      app_role: ["admin", "researcher", "student"],
      research_label: [
        "practical_research",
        "capstone",
        "thesis",
        "dissertation",
        "other",
      ],
      research_strand: ["STEM", "HUMSS", "ABM", "ICT", "GAS", "Other"],
    },
  },
} as const
