import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a function to get the Supabase client
let supabaseClient: any = null;

export const supabase = (() => {
  // Only create client if environment variables are available
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  
  // If we're on the server side, return null to prevent hydration issues
  if (typeof window === 'undefined') {
    return null;
  }
  
  // Create client only once
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  
  return supabaseClient;
})();

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          password_hash: string;
          email_confirmed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          password_hash: string;
          email_confirmed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          password_hash?: string;
          email_confirmed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          date: string;
          time: string;
          location: string;
          event_type: string;
          event_details: string;
          punishment_severity: number;
          status: string;
          invited_by: string;
          participant_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          date: string;
          time: string;
          location: string;
          event_type: string;
          event_details: string;
          punishment_severity: number;
          status?: string;
          invited_by: string;
          participant_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          date?: string;
          time?: string;
          location?: string;
          event_type?: string;
          event_details?: string;
          punishment_severity?: number;
          status?: string;
          invited_by?: string;
          participant_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_rsvps: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          email: string | null;
          will_attend: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          email?: string | null;
          will_attend: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          email?: string | null;
          will_attend?: boolean;
          created_at?: string;
        };
      };
      email_confirmations: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          used: boolean;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          used?: boolean;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token?: string;
          used?: boolean;
          expires_at?: string;
          created_at?: string;
        };
      };
    };
  };
}
