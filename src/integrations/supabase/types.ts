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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      access_logs: {
        Row: {
          id: string
          logged_at: string
          role: Database["public"]["Enums"]["user_role"]
          username: string
        }
        Insert: {
          id?: string
          logged_at?: string
          role: Database["public"]["Enums"]["user_role"]
          username: string
        }
        Update: {
          id?: string
          logged_at?: string
          role?: Database["public"]["Enums"]["user_role"]
          username?: string
        }
        Relationships: []
      }
      app_users: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          password: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          password: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          password?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      candidate_data: {
        Row: {
          anio_nacimiento: number
          carta_en: string | null
          carta_no: string | null
          carta_resumen_en: string | null
          carta_resumen_no: string | null
          correo: string
          created_at: string
          estado: string
          experiencia_medica_en: string | null
          experiencia_medica_no: string | null
          experiencia_no_medica_en: string | null
          experiencia_no_medica_no: string | null
          formacion_en: string | null
          formacion_no: string | null
          id: string
          idiomas_en: string
          idiomas_no: string
          nacionalidad_en: string
          nacionalidad_no: string
          nombre: string
          profesion_en: string | null
          profesion_no: string | null
          updated_at: string
        }
        Insert: {
          anio_nacimiento: number
          carta_en?: string | null
          carta_no?: string | null
          carta_resumen_en?: string | null
          carta_resumen_no?: string | null
          correo: string
          created_at?: string
          estado?: string
          experiencia_medica_en?: string | null
          experiencia_medica_no?: string | null
          experiencia_no_medica_en?: string | null
          experiencia_no_medica_no?: string | null
          formacion_en?: string | null
          formacion_no?: string | null
          id?: string
          idiomas_en?: string
          idiomas_no?: string
          nacionalidad_en?: string
          nacionalidad_no?: string
          nombre: string
          profesion_en?: string | null
          profesion_no?: string | null
          updated_at?: string
        }
        Update: {
          anio_nacimiento?: number
          carta_en?: string | null
          carta_no?: string | null
          carta_resumen_en?: string | null
          carta_resumen_no?: string | null
          correo?: string
          created_at?: string
          estado?: string
          experiencia_medica_en?: string | null
          experiencia_medica_no?: string | null
          experiencia_no_medica_en?: string | null
          experiencia_no_medica_no?: string | null
          formacion_en?: string | null
          formacion_no?: string | null
          id?: string
          idiomas_en?: string
          idiomas_no?: string
          nacionalidad_en?: string
          nacionalidad_no?: string
          nombre?: string
          profesion_en?: string | null
          profesion_no?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      candidate_view_logs: {
        Row: {
          candidate_id: string
          candidate_name: string
          employer_username: string
          id: string
          viewed_at: string
        }
        Insert: {
          candidate_id: string
          candidate_name: string
          employer_username: string
          id?: string
          viewed_at?: string
        }
        Update: {
          candidate_id?: string
          candidate_name?: string
          employer_username?: string
          id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_view_logs_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_data"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_search_logs: {
        Row: {
          candidate_names: string[]
          employer_username: string
          id: string
          query: string
          searched_at: string
          updated_at: string
        }
        Insert: {
          candidate_names?: string[]
          employer_username: string
          id?: string
          query: string
          searched_at?: string
          updated_at?: string
        }
        Update: {
          candidate_names?: string[]
          employer_username?: string
          id?: string
          query?: string
          searched_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      schedule_requests: {
        Row: {
          availability: string
          candidate_email: string
          candidate_id: string
          candidate_name: string
          employer_email: string
          employer_name: string | null
          employer_username: string
          id: string
          requested_at: string
        }
        Insert: {
          availability: string
          candidate_email: string
          candidate_id: string
          candidate_name: string
          employer_email: string
          employer_name?: string | null
          employer_username: string
          id?: string
          requested_at?: string
        }
        Update: {
          availability?: string
          candidate_email?: string
          candidate_id?: string
          candidate_name?: string
          employer_email?: string
          employer_name?: string | null
          employer_username?: string
          id?: string
          requested_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_requests_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_data"
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
      [_ in never]: never
    }
    Functions: {
      admin_create_app_user: {
        Args: {
          p_email?: string
          p_full_name?: string
          p_password: string
          p_username: string
        }
        Returns: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          password: string
          updated_at: string
          username: string
        }
      }
      admin_list_access_logs: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          logged_at: string
          role: Database["public"]["Enums"]["user_role"]
          username: string
        }[]
      }
      admin_list_app_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          password: string
          updated_at: string
          username: string
        }[]
      }
      admin_list_candidate_view_logs: {
        Args: Record<PropertyKey, never>
        Returns: {
          candidate_id: string
          candidate_name: string
          employer_username: string
          id: string
          viewed_at: string
        }[]
      }
      admin_list_employer_search_logs: {
        Args: Record<PropertyKey, never>
        Returns: {
          candidate_names: string[]
          employer_username: string
          id: string
          query: string
          searched_at: string
          updated_at: string
        }[]
      }
      admin_list_schedule_requests: {
        Args: Record<PropertyKey, never>
        Returns: {
          availability: string
          candidate_email: string
          candidate_id: string
          candidate_name: string
          employer_email: string
          employer_name: string | null
          employer_username: string
          id: string
          requested_at: string
        }[]
      }
      admin_toggle_app_user_status: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          password: string
          updated_at: string
          username: string
        }
      }
      authenticate_app_user: {
        Args: { p_identifier: string; p_password: string }
        Returns: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          password: string
          updated_at: string
          username: string
        }
      }
      get_current_username: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_employer_search: {
        Args: {
          p_candidate_names?: string[]
          p_employer_username: string
          p_query: string
        }
        Returns: {
          candidate_names: string[]
          employer_username: string
          id: string
          query: string
          searched_at: string
          updated_at: string
        }
      }
    }
    Enums: {
      app_role: "admin" | "user"
      care_setting:
        | "domicilio_geriatrico"
        | "hospitalario"
        | "urgencias"
        | "domilio"
        | "domicilio"
      user_role: "admin" | "user"
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
      care_setting: [
        "domicilio_geriatrico",
        "hospitalario",
        "urgencias",
        "domilio",
        "domicilio",
      ],
      user_role: ["admin", "user"],
    },
  },
} as const
