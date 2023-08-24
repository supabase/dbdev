export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      access_tokens: {
        Row: {
          created_at: string | null
          id: string | null
          token_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          token_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          token_name?: string | null
        }
        Relationships: []
      }
      accounts: {
        Row: {
          avatar_path: string | null
          bio: string | null
          contact_email: string | null
          created_at: string | null
          display_name: string | null
          handle: string | null
          id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      download_metrics: {
        Row: {
          downloads_180_days: number | null
          downloads_30_day: number | null
          downloads_90_days: number | null
          downloads_all_time: number | null
          package_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "downloads_package_id_fkey"
            columns: ["package_id"]
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "downloads_package_id_fkey"
            columns: ["package_id"]
            referencedRelation: "packages"
            referencedColumns: ["id"]
          }
        ]
      }
      members: {
        Row: {
          account_id: string | null
          created_at: string | null
          organization_id: string | null
          role: "maintainer" | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          organization_id?: string | null
          role?: "maintainer" | null
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          organization_id?: string | null
          role?: "maintainer" | null
        }
        Relationships: [
          {
            foreignKeyName: "members_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      organizations: {
        Row: {
          avatar_path: string | null
          bio: string | null
          contact_email: string | null
          created_at: string | null
          display_name: string | null
          handle: string | null
          id: string | null
        }
        Relationships: []
      }
      package_upgrades: {
        Row: {
          created_at: string | null
          from_version: string | null
          id: string | null
          package_id: string | null
          package_name: string | null
          sql: string | null
          to_version: string | null
        }
        Relationships: [
          {
            foreignKeyName: "package_upgrades_package_id_fkey"
            columns: ["package_id"]
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_upgrades_package_id_fkey"
            columns: ["package_id"]
            referencedRelation: "packages"
            referencedColumns: ["id"]
          }
        ]
      }
      package_versions: {
        Row: {
          control_description: string | null
          control_requires: string[] | null
          created_at: string | null
          description_md: string | null
          id: string | null
          package_id: string | null
          package_name: string | null
          sql: string | null
          version: string | null
        }
        Relationships: [
          {
            foreignKeyName: "package_versions_package_id_fkey"
            columns: ["package_id"]
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_versions_package_id_fkey"
            columns: ["package_id"]
            referencedRelation: "packages"
            referencedColumns: ["id"]
          }
        ]
      }
      packages: {
        Row: {
          control_description: string | null
          control_requires: string[] | null
          created_at: string | null
          description_md: string | null
          handle: string | null
          id: string | null
          latest_version: string | null
          package_name: string | null
          partial_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "packages_handle_fkey"
            columns: ["handle"]
            referencedRelation: "handle_registry"
            referencedColumns: ["handle"]
          }
        ]
      }
    }
    Functions: {
      download_metrics: {
        Args: {
          "": unknown
        }
        Returns: unknown[]
      }
      new_access_token: {
        Args: {
          token_name: string
        }
        Returns: string
      }
      popular_packages: {
        Args: Record<PropertyKey, never>
        Returns: {
          control_description: string | null
          control_requires: string[] | null
          created_at: string | null
          description_md: string | null
          handle: string | null
          id: string | null
          latest_version: string | null
          package_name: string | null
          partial_name: string | null
        }[]
      }
      redeem_access_token: {
        Args: {
          access_token: string
        }
        Returns: string
      }
      register_download: {
        Args: {
          package_name: string
        }
        Returns: undefined
      }
      search_packages: {
        Args: {
          handle?: string
          partial_name?: string
        }
        Returns: {
          control_description: string | null
          control_requires: string[] | null
          created_at: string | null
          description_md: string | null
          handle: string | null
          id: string | null
          latest_version: string | null
          package_name: string | null
          partial_name: string | null
        }[]
      }
      update_profile: {
        Args: {
          handle: unknown
          display_name?: string
          bio?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buckets_owner_fkey"
            columns: ["owner"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: unknown
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

