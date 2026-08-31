export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; email: string; display_name: string; avatar_url: string | null; role: 'admin' | 'editor' | 'viewer'; created_at: string; updated_at: string };
        Insert: { id: string; email: string; display_name?: string; avatar_url?: string | null; role?: 'admin' | 'editor' | 'viewer' };
        Update: { display_name?: string; avatar_url?: string | null; role?: 'admin' | 'editor' | 'viewer'; updated_at?: string };
        Relationships: [];
      };
      countries: {
        Row: { id: number; name: string; country_code: string; continent: string; economic_zones: string[]; currency: string; currency_symbol: string; currency_code: string; phone_code: string; vat: number; number_of_admin_levels: number | null; number_of_electoral_levels: number | null; number_of_economic_levels: number | null; admin_levels: Json; admin_level_names: Json; electoral_level_names: Json; currency_denominators: Json; loyalty_program: Json | null; rounding_config: Json | null; sms_local_rate: number | null; decimal_places: number | null; created_by: string | null; updated_by: string | null; created_at: string; updated_at: string };
        Insert: { id?: number; name: string; country_code: string; continent: string; economic_zones?: string[]; currency: string; currency_symbol: string; currency_code: string; phone_code: string; vat?: number; number_of_admin_levels?: number | null; number_of_electoral_levels?: number | null; number_of_economic_levels?: number | null; admin_levels?: Json; admin_level_names?: Json; electoral_level_names?: Json; currency_denominators?: Json; loyalty_program?: Json | null; rounding_config?: Json | null; sms_local_rate?: number | null; decimal_places?: number | null; created_by?: string | null; updated_by?: string | null };
        Update: Partial<Database['public']['Tables']['countries']['Insert']>;
        Relationships: [];
      };
      regional_economic_levels: {
        Row: { id: number; name: string; abbreviation: string; flag: string; description: string; countries: string[]; color: string; created_at: string; updated_at: string };
        Insert: { id: number; name: string; abbreviation: string; flag?: string; description?: string; countries?: string[]; color?: string };
        Update: Partial<Database['public']['Tables']['regional_economic_levels']['Insert']>;
        Relationships: [];
      };
      electoral_datasets: {
        Row: { id: string; country_code: string; reference_year: number; title: string; status: string; source_file: string; authoritative_for_current_use: boolean; active: boolean; summary: Json; warnings: Json; imported_at: string; imported_by: string | null };
        Insert: { id?: string; country_code: string; reference_year: number; title: string; status: string; source_file: string; authoritative_for_current_use?: boolean; active?: boolean; summary?: Json; warnings?: Json; imported_by?: string | null };
        Update: Partial<Database['public']['Tables']['electoral_datasets']['Insert']>;
        Relationships: [];
      };
      electoral_locations: {
        Row: { dataset_id: string; id: string; country_code: string; district: string; constituency: string; subcounty: string; parish: string; village: string; search_document: unknown; needs_verification: boolean; sources: string[]; created_at: string };
        Insert: { dataset_id: string; id: string; country_code?: string; district: string; constituency: string; subcounty: string; parish: string; village: string; needs_verification?: boolean; sources?: string[] };
        Update: Partial<Database['public']['Tables']['electoral_locations']['Insert']>;
        Relationships: [];
      };
      audit_log: {
        Row: { id: number; table_name: string; record_id: string; operation: string; actor_id: string | null; old_data: Json | null; new_data: Json | null; occurred_at: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      activate_electoral_dataset: { Args: { p_dataset_id: string }; Returns: undefined };
      electoral_options: { Args: { p_level: string; p_district?: string; p_constituency?: string; p_subcounty?: string }; Returns: Array<{ id: string; name: string; record_count: number; needs_verification: boolean }> };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
