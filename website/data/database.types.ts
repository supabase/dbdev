export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
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
      accounts: {
        Row: {
          avatar_id: string | null
          bio: string | null
          contact_email: string | null
          created_at: string | null
          display_name: string | null
          handle: string | null
          id: string | null
        }
        Insert: {
          avatar_id?: string | null
          bio?: string | null
          contact_email?: string | null
          created_at?: string | null
          display_name?: string | null
          handle?: string | null
          id?: string | null
        }
        Update: {
          avatar_id?: string | null
          bio?: string | null
          contact_email?: string | null
          created_at?: string | null
          display_name?: string | null
          handle?: string | null
          id?: string | null
        }
      }
      members: {
        Row: {
          account_id: string | null
          created_at: string | null
          organization_id: string | null
          role: 'maintainer' | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          organization_id?: string | null
          role?: 'maintainer' | null
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          organization_id?: string | null
          role?: 'maintainer' | null
        }
      }
      organizations: {
        Row: {
          avatar_id: string | null
          bio: string | null
          contact_email: string | null
          created_at: string | null
          display_name: string | null
          handle: string | null
          id: string | null
        }
        Insert: {
          avatar_id?: string | null
          bio?: string | null
          contact_email?: string | null
          created_at?: string | null
          display_name?: string | null
          handle?: string | null
          id?: string | null
        }
        Update: {
          avatar_id?: string | null
          bio?: string | null
          contact_email?: string | null
          created_at?: string | null
          display_name?: string | null
          handle?: string | null
          id?: string | null
        }
      }
      package_versions: {
        Row: {
          created_at: string | null
          id: string | null
          object_id: string | null
          object_key: string | null
          package_id: string | null
          package_name: string | null
          upload_metadata: Json | null
          version: string | null
        }
      }
      packages: {
        Row: {
          created_at: string | null
          handle: string | null
          id: string | null
          package_name: string | null
          partial_name: string | null
        }
      }
    }
    Functions: {
      create_organization: {
        Args: {
          handle: unknown
          display_name?: string
          bio?: string
          contact_email?: string
          avatar_id?: string
        }
        Returns: {
          avatar_id: string | null
          bio: string | null
          contact_email: string | null
          created_at: string | null
          display_name: string | null
          handle: string | null
          id: string | null
        }
      }
      is_handle_available: {
        Args: {
          handle: unknown
        }
        Returns: boolean
      }
      publish_package_version: {
        Args: {
          body: Json
          object_name: string
        }
        Returns: {
          created_at: string | null
          id: string | null
          object_id: string | null
          object_key: string | null
          package_id: string | null
          package_name: string | null
          upload_metadata: Json | null
          version: string | null
        }
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
          created_at: string | null
          id: string
          name: string
          owner: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
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
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
        Returns: string[]
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
