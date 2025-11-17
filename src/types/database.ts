export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          credits: number;
          subscription_tier: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          credits?: number;
          subscription_tier?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          credits?: number;
          subscription_tier?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      canvases: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          viewport_x: number;
          viewport_y: number;
          viewport_zoom: number;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          viewport_x?: number;
          viewport_y?: number;
          viewport_zoom?: number;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          viewport_x?: number;
          viewport_y?: number;
          viewport_zoom?: number;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      nodes: {
        Row: {
          id: string;
          canvas_id: string;
          position_x: number;
          position_y: number;
          width: number;
          height: number;
          topic_title: string | null;
          topic_summary: string | null;
          embedding: number[] | null;
          is_expanded: boolean;
          z_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          canvas_id: string;
          position_x: number;
          position_y: number;
          width?: number;
          height?: number;
          topic_title?: string | null;
          topic_summary?: string | null;
          embedding?: number[] | null;
          is_expanded?: boolean;
          z_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          canvas_id?: string;
          position_x?: number;
          position_y?: number;
          width?: number;
          height?: number;
          topic_title?: string | null;
          topic_summary?: string | null;
          embedding?: number[] | null;
          is_expanded?: boolean;
          z_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          node_id: string;
          role: string;
          content: string;
          tokens_used: number | null;
          media_urls: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          node_id: string;
          role: string;
          content: string;
          tokens_used?: number | null;
          media_urls?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          node_id?: string;
          role?: string;
          content?: string;
          tokens_used?: number | null;
          media_urls?: string[] | null;
          created_at?: string;
        };
      };
      node_connections: {
        Row: {
          id: string;
          source_node_id: string;
          target_node_id: string;
          similarity_score: number | null;
          connection_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          source_node_id: string;
          target_node_id: string;
          similarity_score?: number | null;
          connection_reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          source_node_id?: string;
          target_node_id?: string;
          similarity_score?: number | null;
          connection_reason?: string | null;
          created_at?: string;
        };
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          transaction_type: string;
          description: string | null;
          message_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          transaction_type: string;
          description?: string | null;
          message_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          transaction_type?: string;
          description?: string | null;
          message_id?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
