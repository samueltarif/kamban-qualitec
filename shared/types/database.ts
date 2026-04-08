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
      activity_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          meta_json: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          meta_json?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          meta_json?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      automations: {
        Row: {
          action_type: string
          board_id: string
          config_json: Json
          id: string
          is_active: boolean
          trigger_type: string
        }
        Insert: {
          action_type: string
          board_id: string
          config_json?: Json
          id?: string
          is_active?: boolean
          trigger_type: string
        }
        Update: {
          action_type?: string
          board_id?: string
          config_json?: Json
          id?: string
          is_active?: boolean
          trigger_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "automations_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      board_collection_items: {
        Row: {
          added_at: string
          board_id: string
          collection_id: string
          sort_order: number
        }
        Insert: {
          added_at?: string
          board_id: string
          collection_id: string
          sort_order?: number
        }
        Update: {
          added_at?: string
          board_id?: string
          collection_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "board_collection_items_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "board_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      board_collections: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_collections_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_collections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      board_columns: {
        Row: {
          board_id: string
          id: string
          label: string
          settings_json: Json | null
          sort_order: number
          type: Database["public"]["Enums"]["column_type"]
        }
        Insert: {
          board_id: string
          id?: string
          label: string
          settings_json?: Json | null
          sort_order?: number
          type: Database["public"]["Enums"]["column_type"]
        }
        Update: {
          board_id?: string
          id?: string
          label?: string
          settings_json?: Json | null
          sort_order?: number
          type?: Database["public"]["Enums"]["column_type"]
        }
        Relationships: [
          {
            foreignKeyName: "board_columns_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      board_members: {
        Row: {
          access_role: Database["public"]["Enums"]["board_access_role"]
          board_id: string
          user_id: string
        }
        Insert: {
          access_role?: Database["public"]["Enums"]["board_access_role"]
          board_id: string
          user_id: string
        }
        Update: {
          access_role?: Database["public"]["Enums"]["board_access_role"]
          board_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_members_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      board_templates: {
        Row: {
          board_type: Database["public"]["Enums"]["board_type"]
          cover_color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean
          name: string
          organization_id: string
          structure_json: Json
          updated_at: string
        }
        Insert: {
          board_type?: Database["public"]["Enums"]["board_type"]
          cover_color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          organization_id: string
          structure_json?: Json
          updated_at?: string
        }
        Update: {
          board_type?: Database["public"]["Enums"]["board_type"]
          cover_color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          organization_id?: string
          structure_json?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      board_views: {
        Row: {
          board_id: string
          id: string
          is_default: boolean
          name: string
          settings_json: Json | null
          view_type: Database["public"]["Enums"]["view_type"]
        }
        Insert: {
          board_id: string
          id?: string
          is_default?: boolean
          name: string
          settings_json?: Json | null
          view_type?: Database["public"]["Enums"]["view_type"]
        }
        Update: {
          board_id?: string
          id?: string
          is_default?: boolean
          name?: string
          settings_json?: Json | null
          view_type?: Database["public"]["Enums"]["view_type"]
        }
        Relationships: [
          {
            foreignKeyName: "board_views_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      boards: {
        Row: {
          board_type: Database["public"]["Enums"]["board_type"]
          cover_color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          visibility: Database["public"]["Enums"]["visibility_type"]
          workspace_id: string
        }
        Insert: {
          board_type?: Database["public"]["Enums"]["board_type"]
          cover_color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          visibility?: Database["public"]["Enums"]["visibility_type"]
          workspace_id: string
        }
        Update: {
          board_type?: Database["public"]["Enums"]["board_type"]
          cover_color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          visibility?: Database["public"]["Enums"]["visibility_type"]
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "boards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boards_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      labels: {
        Row: {
          board_id: string
          color: string
          id: string
          name: string
        }
        Insert: {
          board_id: string
          color: string
          id?: string
          name: string
        }
        Update: {
          board_id?: string
          color?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "labels_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          cnpj: string | null
          created_at: string
          id: string
          logo_url: string | null
          name: string
          slug: string
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          slug: string
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          job_title: string | null
          organization_id: string | null
          role_global: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          job_title?: string | null
          organization_id?: string | null
          role_global?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          job_title?: string | null
          organization_id?: string | null
          role_global?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_filters: {
        Row: {
          board_id: string | null
          created_at: string
          filter_json: Json
          id: string
          name: string
          user_id: string
        }
        Insert: {
          board_id?: string | null
          created_at?: string
          filter_json?: Json
          id?: string
          name: string
          user_id: string
        }
        Update: {
          board_id?: string | null
          created_at?: string
          filter_json?: Json
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_filters_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_filters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subtasks: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          is_done: boolean
          notes: string | null
          priority_id: string | null
          sort_order: number
          status_id: string | null
          task_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          is_done?: boolean
          notes?: string | null
          priority_id?: string | null
          sort_order?: number
          status_id?: string | null
          task_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          is_done?: boolean
          notes?: string | null
          priority_id?: string | null
          sort_order?: number
          status_id?: string | null
          task_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subtasks_priority_id_fkey"
            columns: ["priority_id"]
            isOneToOne: false
            referencedRelation: "task_priorities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subtasks_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "task_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subtasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_assignees: {
        Row: {
          assigned_at: string
          task_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          task_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignees_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_attachments: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          id: string
          mime_type: string | null
          size_bytes: number | null
          sort_order: number
          task_id: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          sort_order?: number
          task_id: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          sort_order?: number
          task_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_attachments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          id: string
          task_id: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          id?: string
          task_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          id?: string
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_groups: {
        Row: {
          board_id: string
          color: string | null
          id: string
          is_collapsed: boolean
          name: string
          sort_order: number
        }
        Insert: {
          board_id: string
          color?: string | null
          id?: string
          is_collapsed?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          board_id?: string
          color?: string | null
          id?: string
          is_collapsed?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "task_groups_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      task_labels: {
        Row: {
          label_id: string
          task_id: string
        }
        Insert: {
          label_id: string
          task_id: string
        }
        Update: {
          label_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_labels_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "labels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_labels_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_priorities: {
        Row: {
          board_id: string
          color: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          board_id: string
          color?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          board_id?: string
          color?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "task_priorities_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      task_statuses: {
        Row: {
          board_id: string
          color: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          board_id: string
          color?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          board_id?: string
          color?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "task_statuses_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          archived_at: string | null
          board_id: string
          budget: number | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          group_id: string | null
          id: string
          notes: string | null
          position: number
          priority_id: string | null
          start_date: string | null
          status_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          board_id: string
          budget?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          group_id?: string | null
          id?: string
          notes?: string | null
          position?: number
          priority_id?: string | null
          start_date?: string | null
          status_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          board_id?: string
          budget?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          group_id?: string | null
          id?: string
          notes?: string | null
          position?: number
          priority_id?: string | null
          start_date?: string | null
          status_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "task_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          board_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          board_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          board_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_managed_users: {
        Row: {
          created_at: string
          managed_user_id: string
          master_user_id: string
        }
        Insert: {
          created_at?: string
          managed_user_id: string
          master_user_id: string
        }
        Update: {
          created_at?: string
          managed_user_id?: string
          master_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_managed_users_managed_user_id_fkey"
            columns: ["managed_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_managed_users_master_user_id_fkey"
            columns: ["master_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_recent_boards: {
        Row: {
          board_id: string
          id: string
          last_accessed_at: string
          user_id: string
        }
        Insert: {
          board_id: string
          id?: string
          last_accessed_at?: string
          user_id: string
        }
        Update: {
          board_id?: string
          id?: string
          last_accessed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_recent_boards_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_recent_boards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          organization_id: string
          slug: string
          visibility: Database["public"]["Enums"]["visibility_type"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          organization_id: string
          slug: string
          visibility?: Database["public"]["Enums"]["visibility_type"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          organization_id?: string
          slug?: string
          visibility?: Database["public"]["Enums"]["visibility_type"]
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspaces_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_category_usage: {
        Args: { category_uuid: string }
        Returns: {
          in_use: boolean
          transaction_count: number
        }[]
      }
      create_board_with_owner: {
        Args: {
          p_board_type?: Database["public"]["Enums"]["board_type"]
          p_cover_color?: string
          p_description?: string
          p_name: string
          p_visibility?: Database["public"]["Enums"]["visibility_type"]
          p_workspace_id: string
        }
        Returns: string
      }
      get_account_history: {
        Args: { account_uuid: string }
        Returns: {
          action: string
          audit_id: string
          changed_at: string
          changed_by: string
          new_data: Json
          old_data: Json
        }[]
      }
      is_board_guest: { Args: { p_board_id: string }; Returns: boolean }
      my_board_ids: { Args: Record<PropertyKey, never>; Returns: string[] }
      my_org: { Args: Record<PropertyKey, never>; Returns: string }
      my_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      restore_account: { Args: { account_uuid: string }; Returns: boolean }
      soft_delete_account: { Args: { account_uuid: string }; Returns: boolean }
    }
    Enums: {
      board_access_role: "owner" | "editor" | "viewer" | "guest" | "observer"
      board_type: "kanban" | "scrum" | "list"
      column_type:
        | "status"
        | "priority"
        | "due_date"
        | "start_date"
        | "assignee"
        | "notes"
        | "files"
        | "budget"
        | "last_updated"
        | "timeline"
        | "custom"
      user_role: "master" | "collaborator" | "guest" | "observer"
      user_status: "active" | "inactive" | "pending"
      view_type:
        | "board"
        | "kanban"
        | "calendar"
        | "timeline"
        | "gantt"
        | "cards"
        | "table"
      visibility_type: "public" | "private" | "org"
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
      board_access_role: ["owner", "editor", "viewer", "guest", "observer"],
      board_type: ["kanban", "scrum", "list"],
      column_type: [
        "status",
        "priority",
        "due_date",
        "start_date",
        "assignee",
        "notes",
        "files",
        "budget",
        "last_updated",
        "timeline",
        "custom",
      ],
      user_role: ["master", "collaborator", "guest", "observer"],
      user_status: ["active", "inactive", "pending"],
      view_type: [
        "board",
        "kanban",
        "calendar",
        "timeline",
        "gantt",
        "cards",
        "table",
      ],
      visibility_type: ["public", "private", "org"],
    },
  },
} as const
