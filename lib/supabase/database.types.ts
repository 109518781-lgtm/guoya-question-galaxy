import type { StarSource, StarStatus } from "../types";

export type Database = {
  public: {
    Tables: {
      stars: {
        Row: {
          id: string;
          content: string;
          source: StarSource;
          status: StarStatus;
          likes: number;
          featured: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          source?: StarSource;
          status?: StarStatus;
          likes?: number;
          featured?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          source?: StarSource;
          status?: StarStatus;
          likes?: number;
          featured?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_star_likes: {
        Args: { star_id: string };
        Returns: Database["public"]["Tables"]["stars"]["Row"];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
