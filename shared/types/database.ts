export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_logs: {
        Row: { action: string; actor_id: string | null; created_at: string; entity_id: string; entity_type: string; id: string; meta_json: Json | null }
        Insert: { action: string; actor_id?: string | null; created_at?: string; entity_id: string; entity_type: string; id?: string; meta_json?: Json | null }
        Update: { action?: string; actor_id?: string | null; created_at?: string; entity_id?: string; entity_type?: string; id?: string; meta_json?: Json | null }
        Relationships: [{ foreignKeyName: "activity_logs_actor_id_fkey"; columns: ["actor_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }]
      }
      automations: {
        Row: { action_type: string; board_id: string; config_json: Json; id: string; is_active: boolean; trigger_type: string }
        Insert: { action_type: string; board_id: string; config_json?: Json; id?: string; is_active?: boolean; trigger_type: string }
        Update: { action_type?: string; board_id?: string; config_json?: Json; id?: string; is_active?: boolean; trigger_type?: string }
        Relationships: [{ foreignKeyName: "automations_board_id_fkey"; columns: ["board_id"]; isOneToOne: false; referencedRelation: "boards"; referencedColumns: ["id"] }]
      }
      board_columns: {
        Row: { board_id: string; id: string; label: string; settings_json: Json | null; sort_order: number; type: Database["public"]["Enums"]["column_type"] }
        Insert: { board_id: string; id?: string; label: string; settings_json?: Json | null; sort_order?: number; type: Database["public"]["Enums"]["column_type"] }
        Update: { board_id?: string; id?: string; label?: string; settings_json?: Json | null; sort_order?: number; type?: Database["public"]["Enums"]["column_type"] }
        Relationships: [{ foreignKeyName: "board_columns_board_id_fkey"; columns: ["board_id"]; isOneToOne: false; referencedRelation: "boards"; referencedColumns: ["id"] }]
      }
      board_members: {
        Row: { access_role: Database["public"]["Enums"]["board_access_role"]; board_id: string; user_id: string }
        Insert: { access_role?: Database["public"]["Enums"]["board_access_role"]; board_id: string; user_id: string }
        Update: { access_role?: Database["public"]["Enums"]["board_access_role"]; board_id?: string; user_id?: string }
        Relationships: [{ foreignKeyName: "board_members_board_id_fkey"; columns: ["board_id"]; isOneToOne: false; referencedRelation: "boards"; referencedColumns: ["id"] }, { foreignKeyName: "board_members_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }]
      }
      board_views: {
        Row: { board_id: string; id: string; is_default: boolean; name: string; settings_json: Json | null; view_type: Database["public"]["Enums"]["view_type"] }
        Insert: { board_id: string; id?: string; is_default?: boolean; name: string; settings_json?: Json | null; view_type?: Database["public"]["Enums"]["view_type"] }
        Update: { board_id?: string; id?: string; is_default?: boolean; name?: string; settings_json?: Json | null; view_type?: Database["public"]["Enums"]["view_type"] }
        Relationships: [{ foreignKeyName: "board_views_board_id_fkey"; columns: ["board_id"]; isOneToOne: false; referencedRelation: "boards"; referencedColumns: ["id"] }]
      }
      boards: {
        Row: { board_type: Database["public"]["Enums"]["board_type"]; cover_color: string | null; created_at: string; created_by: string | null; description: string | null; id: string; name: string; visibility: Database["public"]["Enums"]["visibility_type"]; workspace_id: string }
        Insert: { board_type?: Database["public"]["Enums"]["board_type"]; cover_color?: string | null; created_at?: string; created_by?: string | null; description?: string | null; id?: string; name: string; visibility?: Database["public"]["Enums"]["visibility_type"]; workspace_id: string }
        Update: { board_type?: Database["public"]["Enums"]["board_type"]; cover_color?: string | null; created_at?: string; created_by?: string | null; description?: string | null; id?: string; name?: string; visibility?: Database["public"]["Enums"]["visibility_type"]; workspace_id?: string }
        Relationships: [{ foreignKeyName: "boards_created_by_fkey"; columns: ["created_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }, { foreignKeyName: "boards_workspace_id_fkey"; columns: ["workspace_id"]; isOneToOne: false; referencedRelation: "workspaces"; referencedColumns: ["id"] }]
      }
      labels: {
        Row: { board_id: string; color: string; id: string; name: string }
        Insert: { board_id: string; color: string; id?: string; name: string }
        Update: { board_id?: string; color?: string; id?: string; name?: string }
        Relationships: [{ foreignKeyName: "labels_board_id_fkey"; columns: ["board_id"]; isOneToOne: false; referencedRelation: "boards"; referencedColumns: ["id"] }]
      }
      notifications: {
        Row: { body: string | null; created_at: string; id: string; link: string | null; read_at: string | null; title: string; type: string; user_id: string }
        Insert: { body?: string | null; created_at?: string; id?: string; link?: string | null; read_at?: string | null; title: string; type: string; user_id: string }
        Update: { body?: string | null; created_at?: string; id?: string; link?: string | null; read_at?: string | null; title?: string; type?: string; user_id?: string }
        Relationships: [{ foreignKeyName: "notifications_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }]
      }
      organizations: {
        Row: { created_at: string; id: string; logo_url: string | null; name: string; slug: string }
        Insert: { created_at?: string; id?: string; logo_url?: string | null; name: string; slug: string }
        Update: { created_at?: string; id?: string; logo_url?: string | null; name?: string; slug?: string }
        Relationships: []
      }
      profiles: {
        Row: { avatar_url: string | null; created_at: string; email: string; full_name: string | null; id: string; organization_id: string | null; role_global: Database["public"]["Enums"]["user_role"]; status: Database["public"]["Enums"]["user_status"] }
        Insert: { avatar_url?: string | null; created_at?: string; email: string; full_name?: string | null; id: string; organization_id?: string | null; role_global?: Database["public"]["Enums"]["user_role"]; status?: Database["public"]["Enums"]["user_status"] }
        Update: { avatar_url?: string | null; created_at?: string; email?: string; full_name?: string | null; id?: string; organization_id?: string | null; role_global?: Database["public"]["Enums"]["user_role"]; status?: Database["public"]["Enums"]["user_status"] }
        Relationships: [{ foreignKeyName: "profiles_organization_id_fkey"; columns: ["organization_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] }]
      }
      saved_filters: {
        Row: { board_id: string | null; created_at: string; filter_json: Json; id: string; name: string; user_id: string }
        Insert: { board_id?: string | null; created_at?: string; filter_json?: Json; id?: string; name: string; user_id: string }
        Update: { board_id?: string | null; created_at?: string; filter_json?: Json; id?: string; name?: string; user_id?: string }
        Relationships: [{ foreignKeyName: "saved_filters_board_id_fkey"; columns: ["board_id"]; isOneToOne: false; referencedRelation: "boards"; referencedColumns: ["id"] }, { foreignKeyName: "saved_filters_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }]
      }
      subtasks: {
        Row: { created_at: string; id: string; is_done: boolean; sort_order: number; task_id: string; title: string }
        Insert: { created_at?: string; id?: string; is_done?: boolean; sort_order?: number; task_id: string; title: string }
        Update: { created_at?: string; id?: string; is_done?: boolean; sort_order?: number; task_id?: string; title?: string }
        Relationships: [{ foreignKeyName: "subtasks_task_id_fkey"; columns: ["task_id"]; isOneToOne: false; referencedRelation: "tasks"; referencedColumns: ["id"] }]
      }
      task_assignees: {
        Row: { assigned_at: string; task_id: string; user_id: string }
        Insert: { assigned_at?: string; task_id: string; user_id: string }
        Update: { assigned_at?: string; task_id?: string; user_id?: string }
        Relationships: [{ foreignKeyName: "task_assignees_task_id_fkey"; columns: ["task_id"]; isOneToOne: false; referencedRelation: "tasks"; referencedColumns: ["id"] }, { foreignKeyName: "task_assignees_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }]
      }
      task_attachments: {
        Row: { created_at: string; file_name: string; file_path: string; id: string; mime_type: string | null; size_bytes: number | null; task_id: string; uploaded_by: string | null }
        Insert: { created_at?: string; file_name: string; file_path: string; id?: string; mime_type?: string | null; size_bytes?: number | null; task_id: string; uploaded_by?: string | null }
        Update: { created_at?: string; file_name?: string; file_path?: string; id?: string; mime_type?: string | null; size_bytes?: number | null; task_id?: string; uploaded_by?: string | null }
        Relationships: [{ foreignKeyName: "task_attachments_task_id_fkey"; columns: ["task_id"]; isOneToOne: false; referencedRelation: "tasks"; referencedColumns: ["id"] }, { foreignKeyName: "task_attachments_uploaded_by_fkey"; columns: ["uploaded_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }]
      }
      task_comments: {
        Row: { author_id: string | null; content: string; created_at: string; id: string; task_id: string; updated_at: string }
        Insert: { author_id?: string | null; content: string; created_at?: string; id?: string; task_id: string; updated_at?: string }
        Update: { author_id?: string | null; content?: string; created_at?: string; id?: string; task_id?: string; updated_at?: string }
        Relationships: [{ foreignKeyName: "task_comments_author_id_fkey"; columns: ["author_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }, { foreignKeyName: "task_comments_task_id_fkey"; columns: ["task_id"]; isOneToOne: false; referencedRelation: "tasks"; referencedColumns: ["id"] }]
      }
      task_groups: {
        Row: { board_id: string; color: string | null; id: string; is_collapsed: boolean; name: string; sort_order: number }
        Insert: { board_id: string; color?: string | null; id?: string; is_collapsed?: boolean; name: string; sort_order?: number }
        Update: { board_id?: string; color?: string | null; id?: string; is_collapsed?: boolean; name?: string; sort_order?: number }
        Relationships: [{ foreignKeyName: "task_groups_board_id_fkey"; columns: ["board_id"]; isOneToOne: false; referencedRelation: "boards"; referencedColumns: ["id"] }]
      }
      task_labels: {
        Row: { label_id: string; task_id: string }
        Insert: { label_id: string; task_id: string }
        Update: { label_id?: string; task_id?: string }
        Relationships: [{ foreignKeyName: "task_labels_label_id_fkey"; columns: ["label_id"]; isOneToOne: false; referencedRelation: "labels"; referencedColumns: ["id"] }, { foreignKeyName: "task_labels_task_id_fkey"; columns: ["task_id"]; isOneToOne: false; referencedRelation: "tasks"; referencedColumns: ["id"] }]
      }
      tasks: {
        Row: { archived_at: string | null; board_id: string; created_at: string; created_by: string | null; description: string | null; due_date: string | null; group_id: string | null; id: string; position: number; priority_id: string | null; start_date: string | null; status_id: string | null; title: string; updated_at: string }
        Insert: { archived_at?: string | null; board_id: string; created_at?: string; created_by?: string | null; description?: string | null; due_date?: string | null; group_id?: string | null; id?: string; position?: number; priority_id?: string | null; start_date?: string | null; status_id?: string | null; title: string; updated_at?: string }
        Update: { archived_at?: string | null; board_id?: string; created_at?: string; created_by?: string | null; description?: string | null; due_date?: string | null; group_id?: string | null; id?: string; position?: number; priority_id?: string | null; start_date?: string | null; status_id?: string | null; title?: string; updated_at?: string }
        Relationships: [{ foreignKeyName: "tasks_board_id_fkey"; columns: ["board_id"]; isOneToOne: false; referencedRelation: "boards"; referencedColumns: ["id"] }, { foreignKeyName: "tasks_created_by_fkey"; columns: ["created_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }, { foreignKeyName: "tasks_group_id_fkey"; columns: ["group_id"]; isOneToOne: false; referencedRelation: "task_groups"; referencedColumns: ["id"] }]
      }
      user_favorites: {
        Row: { board_id: string; created_at: string; id: string; user_id: string }
        Insert: { board_id: string; created_at?: string; id?: string; user_id: string }
        Update: { board_id?: string; created_at?: string; id?: string; user_id?: string }
        Relationships: [{ foreignKeyName: "user_favorites_board_id_fkey"; columns: ["board_id"]; isOneToOne: false; referencedRelation: "boards"; referencedColumns: ["id"] }, { foreignKeyName: "user_favorites_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }]
      }
      user_managed_users: {
        Row: { created_at: string; managed_user_id: string; master_user_id: string }
        Insert: { created_at?: string; managed_user_id: string; master_user_id: string }
        Update: { created_at?: string; managed_user_id?: string; master_user_id?: string }
        Relationships: [{ foreignKeyName: "user_managed_users_managed_user_id_fkey"; columns: ["managed_user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }, { foreignKeyName: "user_managed_users_master_user_id_fkey"; columns: ["master_user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }]
      }
      user_recent_boards: {
        Row: { board_id: string; id: string; last_accessed_at: string; user_id: string }
        Insert: { board_id: string; id?: string; last_accessed_at?: string; user_id: string }
        Update: { board_id?: string; id?: string; last_accessed_at?: string; user_id?: string }
        Relationships: [{ foreignKeyName: "user_recent_boards_board_id_fkey"; columns: ["board_id"]; isOneToOne: false; referencedRelation: "boards"; referencedColumns: ["id"] }, { foreignKeyName: "user_recent_boards_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }]
      }
      workspaces: {
        Row: { created_at: string; created_by: string | null; id: string; name: string; organization_id: string; slug: string; visibility: Database["public"]["Enums"]["visibility_type"] }
        Insert: { created_at?: string; created_by?: string | null; id?: string; name: string; organization_id: string; slug: string; visibility?: Database["public"]["Enums"]["visibility_type"] }
        Update: { created_at?: string; created_by?: string | null; id?: string; name?: string; organization_id?: string; slug?: string; visibility?: Database["public"]["Enums"]["visibility_type"] }
        Relationships: [{ foreignKeyName: "workspaces_created_by_fkey"; columns: ["created_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }, { foreignKeyName: "workspaces_organization_id_fkey"; columns: ["organization_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] }]
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      my_org: { Args: Record<PropertyKey, never>; Returns: string }
      my_role: { Args: Record<PropertyKey, never>; Returns: Database["public"]["Enums"]["user_role"] }
    }
    Enums: {
      board_access_role: "owner" | "editor" | "viewer" | "guest"
      board_type: "kanban" | "scrum" | "list"
      column_type: "status" | "priority" | "due_date" | "start_date" | "assignee" | "notes" | "files" | "budget" | "last_updated" | "timeline" | "custom"
      user_role: "master" | "collaborator" | "guest" | "observer"
      user_status: "active" | "inactive" | "pending"
      view_type: "board" | "kanban" | "calendar" | "timeline" | "gantt" | "cards" | "table"
      visibility_type: "public" | "private" | "org"
    }
    CompositeTypes: { [_ in never]: never }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T]
