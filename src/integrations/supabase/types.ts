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
      agents: {
        Row: {
          bio: string | null
          company: string | null
          created_at: string
          id: string
          languages: string[] | null
          license_number: string | null
          rating: number | null
          response_time_hours: number | null
          review_count: number | null
          verification: Database["public"]["Enums"]["verification_status"]
          years_experience: number | null
        }
        Insert: {
          bio?: string | null
          company?: string | null
          created_at?: string
          id: string
          languages?: string[] | null
          license_number?: string | null
          rating?: number | null
          response_time_hours?: number | null
          review_count?: number | null
          verification?: Database["public"]["Enums"]["verification_status"]
          years_experience?: number | null
        }
        Update: {
          bio?: string | null
          company?: string | null
          created_at?: string
          id?: string
          languages?: string[] | null
          license_number?: string | null
          rating?: number | null
          response_time_hours?: number | null
          review_count?: number | null
          verification?: Database["public"]["Enums"]["verification_status"]
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          active: boolean
          audience: string
          body: string
          created_at: string
          created_by: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          audience?: string
          body: string
          created_at?: string
          created_by?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          audience?: string
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
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
          author_id?: string | null
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
          author_id?: string | null
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
      developer_team: {
        Row: {
          created_at: string
          developer_id: string
          full_name: string | null
          id: string
          invite_email: string | null
          role: Database["public"]["Enums"]["team_role"]
          user_id: string | null
        }
        Insert: {
          created_at?: string
          developer_id: string
          full_name?: string | null
          id?: string
          invite_email?: string | null
          role?: Database["public"]["Enums"]["team_role"]
          user_id?: string | null
        }
        Update: {
          created_at?: string
          developer_id?: string
          full_name?: string | null
          id?: string
          invite_email?: string | null
          role?: Database["public"]["Enums"]["team_role"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "developer_team_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
        ]
      }
      developers: {
        Row: {
          company_name: string
          cover_url: string | null
          created_at: string
          description: string | null
          email: string | null
          established_year: number | null
          featured: boolean
          headquarters: string | null
          id: string
          logo_url: string | null
          phone: string | null
          slug: string | null
          updated_at: string
          verification: Database["public"]["Enums"]["verification_status"]
          website: string | null
        }
        Insert: {
          company_name: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          established_year?: number | null
          featured?: boolean
          headquarters?: string | null
          id: string
          logo_url?: string | null
          phone?: string | null
          slug?: string | null
          updated_at?: string
          verification?: Database["public"]["Enums"]["verification_status"]
          website?: string | null
        }
        Update: {
          company_name?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          established_year?: number | null
          featured?: boolean
          headquarters?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          slug?: string | null
          updated_at?: string
          verification?: Database["public"]["Enums"]["verification_status"]
          website?: string | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          active: boolean
          answer: string
          category: string | null
          created_at: string
          id: string
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          answer: string
          category?: string | null
          created_at?: string
          id?: string
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          answer?: string
          category?: string | null
          created_at?: string
          id?: string
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_suspended: boolean
          location: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_suspended?: boolean
          location?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_suspended?: boolean
          location?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          address: string | null
          amenities: string[] | null
          area: string | null
          brochure_url: string | null
          city: string | null
          completion_date: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          developer_id: string
          featured: boolean
          gallery: string[] | null
          id: string
          launch_date: string | null
          layout_image: string | null
          name: string
          published: boolean
          slug: string | null
          starting_price: number | null
          state: string
          status: Database["public"]["Enums"]["project_status"]
          total_units: number | null
          updated_at: string
          views: number
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          area?: string | null
          brochure_url?: string | null
          city?: string | null
          completion_date?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          developer_id: string
          featured?: boolean
          gallery?: string[] | null
          id?: string
          launch_date?: string | null
          layout_image?: string | null
          name: string
          published?: boolean
          slug?: string | null
          starting_price?: number | null
          state: string
          status?: Database["public"]["Enums"]["project_status"]
          total_units?: number | null
          updated_at?: string
          views?: number
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          area?: string | null
          brochure_url?: string | null
          city?: string | null
          completion_date?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          developer_id?: string
          featured?: boolean
          gallery?: string[] | null
          id?: string
          launch_date?: string | null
          layout_image?: string | null
          name?: string
          published?: boolean
          slug?: string | null
          starting_price?: number | null
          state?: string
          status?: Database["public"]["Enums"]["project_status"]
          total_units?: number | null
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "projects_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string | null
          agent_id: string | null
          amenities: string[] | null
          area: string | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          featured: boolean
          gallery: string[] | null
          id: string
          latitude: number | null
          listing_type: Database["public"]["Enums"]["listing_type"]
          longitude: number | null
          nearby: string[] | null
          parking: number | null
          price: number
          property_type: Database["public"]["Enums"]["property_type"]
          sqm: number | null
          state: string
          status: Database["public"]["Enums"]["property_status"]
          title: string
          toilets: number | null
          updated_at: string
          views: number
          year_built: number | null
        }
        Insert: {
          address?: string | null
          agent_id?: string | null
          amenities?: string[] | null
          area?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          gallery?: string[] | null
          id?: string
          latitude?: number | null
          listing_type?: Database["public"]["Enums"]["listing_type"]
          longitude?: number | null
          nearby?: string[] | null
          parking?: number | null
          price: number
          property_type?: Database["public"]["Enums"]["property_type"]
          sqm?: number | null
          state: string
          status?: Database["public"]["Enums"]["property_status"]
          title: string
          toilets?: number | null
          updated_at?: string
          views?: number
          year_built?: number | null
        }
        Update: {
          address?: string | null
          agent_id?: string | null
          amenities?: string[] | null
          area?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          gallery?: string[] | null
          id?: string
          latitude?: number | null
          listing_type?: Database["public"]["Enums"]["listing_type"]
          longitude?: number | null
          nearby?: string[] | null
          parking?: number | null
          price?: number
          property_type?: Database["public"]["Enums"]["property_type"]
          sqm?: number | null
          state?: string
          status?: Database["public"]["Enums"]["property_status"]
          title?: string
          toilets?: number | null
          updated_at?: string
          views?: number
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          property_id: string | null
          reason: string
          reporter_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          property_id?: string | null
          reason: string
          reporter_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          property_id?: string | null
          reason?: string
          reporter_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_sales: {
        Row: {
          buyer_email: string | null
          buyer_name: string
          buyer_phone: string | null
          created_at: string
          deposit: number | null
          developer_id: string
          id: string
          notes: string | null
          project_id: string
          recorded_by: string | null
          sale_date: string
          sale_price: number
          unit_id: string
        }
        Insert: {
          buyer_email?: string | null
          buyer_name: string
          buyer_phone?: string | null
          created_at?: string
          deposit?: number | null
          developer_id: string
          id?: string
          notes?: string | null
          project_id: string
          recorded_by?: string | null
          sale_date?: string
          sale_price: number
          unit_id: string
        }
        Update: {
          buyer_email?: string | null
          buyer_name?: string
          buyer_phone?: string | null
          created_at?: string
          deposit?: number | null
          developer_id?: string
          id?: string
          notes?: string | null
          project_id?: string
          recorded_by?: string | null
          sale_date?: string
          sale_price?: number
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_sales_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_sales_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_sales_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          bathrooms: number | null
          bedrooms: number | null
          created_at: string
          developer_id: string
          floor_plan_url: string | null
          id: string
          notes: string | null
          price: number
          project_id: string
          sqm: number | null
          status: Database["public"]["Enums"]["unit_status"]
          unit_number: string
          unit_type: string | null
          updated_at: string
        }
        Insert: {
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          developer_id: string
          floor_plan_url?: string | null
          id?: string
          notes?: string | null
          price: number
          project_id: string
          sqm?: number | null
          status?: Database["public"]["Enums"]["unit_status"]
          unit_number: string
          unit_type?: string | null
          updated_at?: string
        }
        Update: {
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          developer_id?: string
          floor_plan_url?: string | null
          id?: string
          notes?: string | null
          price?: number
          project_id?: string
          sqm?: number | null
          status?: Database["public"]["Enums"]["unit_status"]
          unit_number?: string
          unit_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_developer_manager: {
        Args: { _developer_id: string; _user_id: string }
        Returns: boolean
      }
      is_developer_member: {
        Args: { _developer_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      listing_type: "sale" | "rent" | "shortlet"
      project_status:
        | "planning"
        | "pre_launch"
        | "selling"
        | "sold_out"
        | "completed"
      property_status: "available" | "reserved" | "sold" | "rented" | "draft"
      property_type:
        | "house"
        | "duplex"
        | "apartment"
        | "land"
        | "commercial"
        | "office"
        | "warehouse"
        | "estate"
      team_role: "admin" | "manager" | "agent" | "viewer"
      unit_status: "available" | "reserved" | "sold"
      user_role: "buyer" | "agent" | "developer" | "admin"
      verification_status: "unverified" | "pending" | "verified" | "rejected"
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
      app_role: ["admin", "moderator", "user"],
      listing_type: ["sale", "rent", "shortlet"],
      project_status: [
        "planning",
        "pre_launch",
        "selling",
        "sold_out",
        "completed",
      ],
      property_status: ["available", "reserved", "sold", "rented", "draft"],
      property_type: [
        "house",
        "duplex",
        "apartment",
        "land",
        "commercial",
        "office",
        "warehouse",
        "estate",
      ],
      team_role: ["admin", "manager", "agent", "viewer"],
      unit_status: ["available", "reserved", "sold"],
      user_role: ["buyer", "agent", "developer", "admin"],
      verification_status: ["unverified", "pending", "verified", "rejected"],
    },
  },
} as const
