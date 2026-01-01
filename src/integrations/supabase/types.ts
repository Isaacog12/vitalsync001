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
      alerts: {
        Row: {
          acknowledged_by: string | null
          alert_type: string
          created_at: string | null
          id: string
          is_acknowledged: boolean | null
          message: string
          patient_id: string
          severity: string
          vital_id: string | null
        }
        Insert: {
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string | null
          id?: string
          is_acknowledged?: boolean | null
          message: string
          patient_id: string
          severity: string
          vital_id?: string | null
        }
        Update: {
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string | null
          id?: string
          is_acknowledged?: boolean | null
          message?: string
          patient_id?: string
          severity?: string
          vital_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_vital_id_fkey"
            columns: ["vital_id"]
            isOneToOne: false
            referencedRelation: "vitals"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_type: string
          created_at: string | null
          doctor_id: string
          duration_minutes: number | null
          id: string
          notes: string | null
          patient_id: string
          scheduled_at: string
          status: string
          updated_at: string | null
        }
        Insert: {
          appointment_type: string
          created_at?: string | null
          doctor_id: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          patient_id: string
          scheduled_at: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          appointment_type?: string
          created_at?: string | null
          doctor_id?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          patient_id?: string
          scheduled_at?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      billing: {
        Row: {
          amount: number
          appointment_id: string | null
          consultation_id: string | null
          created_at: string | null
          description: string | null
          id: string
          paid_at: string | null
          patient_id: string
          status: string
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          consultation_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          paid_at?: string | null
          patient_id: string
          status?: string
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          consultation_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          paid_at?: string | null
          patient_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          appointment_id: string | null
          consultation_notes: string | null
          created_at: string | null
          doctor_id: string
          ended_at: string | null
          id: string
          patient_id: string
          price: number | null
          started_at: string | null
          status: string
        }
        Insert: {
          appointment_id?: string | null
          consultation_notes?: string | null
          created_at?: string | null
          doctor_id: string
          ended_at?: string | null
          id?: string
          patient_id: string
          price?: number | null
          started_at?: string | null
          status?: string
        }
        Update: {
          appointment_id?: string | null
          consultation_notes?: string | null
          created_at?: string | null
          doctor_id?: string
          ended_at?: string | null
          id?: string
          patient_id?: string
          price?: number | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_profiles: {
        Row: {
          availability: Json | null
          consultation_price: number | null
          created_at: string | null
          doctor_type: string
          hospital_affiliation: string | null
          id: string
          is_verified: boolean | null
          license_number: string | null
          profile_id: string | null
          specializations: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          availability?: Json | null
          consultation_price?: number | null
          created_at?: string | null
          doctor_type: string
          hospital_affiliation?: string | null
          id?: string
          is_verified?: boolean | null
          license_number?: string | null
          profile_id?: string | null
          specializations?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          availability?: Json | null
          consultation_price?: number | null
          created_at?: string | null
          doctor_type?: string
          hospital_affiliation?: string | null
          id?: string
          is_verified?: boolean | null
          license_number?: string | null
          profile_id?: string | null
          specializations?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      emr_records: {
        Row: {
          attachments: Json | null
          content: string | null
          created_at: string | null
          doctor_id: string | null
          id: string
          is_inpatient: boolean | null
          patient_id: string
          record_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          content?: string | null
          created_at?: string | null
          doctor_id?: string | null
          id?: string
          is_inpatient?: boolean | null
          patient_id: string
          record_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          content?: string | null
          created_at?: string | null
          doctor_id?: string | null
          id?: string
          is_inpatient?: boolean | null
          patient_id?: string
          record_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emr_records_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emr_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nursing_notes: {
        Row: {
          content: string
          created_at: string | null
          id: string
          note_type: string
          nurse_id: string
          patient_id: string
          vital_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          note_type?: string
          nurse_id: string
          patient_id: string
          vital_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          note_type?: string
          nurse_id?: string
          patient_id?: string
          vital_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nursing_notes_nurse_id_fkey"
            columns: ["nurse_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nursing_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nursing_notes_vital_id_fkey"
            columns: ["vital_id"]
            isOneToOne: false
            referencedRelation: "vitals"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          admission_date: string | null
          allergies: string[] | null
          assigned_doctor_id: string | null
          blood_type: string | null
          created_at: string | null
          date_of_birth: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          id: string
          profile_id: string | null
          room_number: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admission_date?: string | null
          allergies?: string[] | null
          assigned_doctor_id?: string | null
          blood_type?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          id?: string
          profile_id?: string | null
          room_number?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admission_date?: string | null
          allergies?: string[] | null
          assigned_doctor_id?: string | null
          blood_type?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          id?: string
          profile_id?: string | null
          room_number?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_assigned_doctor_id_fkey"
            columns: ["assigned_doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_orders: {
        Row: {
          created_at: string | null
          dispensed_at: string | null
          id: string
          notes: string | null
          pharmacist_id: string | null
          prescription_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dispensed_at?: string | null
          id?: string
          notes?: string | null
          pharmacist_id?: string | null
          prescription_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dispensed_at?: string | null
          id?: string
          notes?: string | null
          pharmacist_id?: string | null
          prescription_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_orders_pharmacist_id_fkey"
            columns: ["pharmacist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_orders_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          consultation_id: string | null
          created_at: string | null
          diagnosis: string | null
          doctor_id: string
          id: string
          instructions: string | null
          medications: Json
          patient_id: string
          status: string
          valid_until: string | null
        }
        Insert: {
          consultation_id?: string | null
          created_at?: string | null
          diagnosis?: string | null
          doctor_id: string
          id?: string
          instructions?: string | null
          medications?: Json
          patient_id: string
          status?: string
          valid_until?: string | null
        }
        Update: {
          consultation_id?: string | null
          created_at?: string | null
          diagnosis?: string | null
          doctor_id?: string
          id?: string
          instructions?: string | null
          medications?: Json
          patient_id?: string
          status?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          specialization: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          full_name: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          specialization?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          specialization?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sos_alerts: {
        Row: {
          acknowledged_by: string | null
          created_at: string | null
          id: string
          location: Json | null
          patient_id: string
          resolved_at: string | null
          status: string
        }
        Insert: {
          acknowledged_by?: string | null
          created_at?: string | null
          id?: string
          location?: Json | null
          patient_id: string
          resolved_at?: string | null
          status?: string
        }
        Update: {
          acknowledged_by?: string | null
          created_at?: string | null
          id?: string
          location?: Json | null
          patient_id?: string
          resolved_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sos_alerts_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sos_alerts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vitals: {
        Row: {
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          device_id: string | null
          heart_rate: number | null
          id: string
          is_alert: boolean | null
          oxygen_saturation: number | null
          patient_id: string
          recorded_at: string | null
          respiratory_rate: number | null
          temperature: number | null
        }
        Insert: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          device_id?: string | null
          heart_rate?: number | null
          id?: string
          is_alert?: boolean | null
          oxygen_saturation?: number | null
          patient_id: string
          recorded_at?: string | null
          respiratory_rate?: number | null
          temperature?: number | null
        }
        Update: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          device_id?: string | null
          heart_rate?: number | null
          id?: string
          is_alert?: boolean | null
          oxygen_saturation?: number | null
          patient_id?: string
          recorded_at?: string | null
          respiratory_rate?: number | null
          temperature?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vitals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_available_doctor: { Args: never; Returns: string }
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
      app_role:
        | "admin"
        | "doctor"
        | "patient"
        | "hospital_doctor"
        | "online_doctor"
        | "nurse"
        | "pharmacist"
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
      app_role: [
        "admin",
        "doctor",
        "patient",
        "hospital_doctor",
        "online_doctor",
        "nurse",
        "pharmacist",
      ],
    },
  },
} as const
