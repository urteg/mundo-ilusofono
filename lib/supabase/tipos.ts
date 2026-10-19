export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      apresentadores: {
        Row: {
          foto: string | null;
          id: string;
          nome: string;
          pais: string | null;
          temas: string[] | null;
        };
        ComputedFields: never;
        Insert: {
          foto?: string | null;
          id?: string;
          nome: string;
          pais?: string | null;
          temas?: string[] | null;
        };
        Update: {
          foto?: string | null;
          id?: string;
          nome?: string;
          pais?: string | null;
          temas?: string[] | null;
        };
        Relationships: [];
      };
      atividade_diaria: {
        Row: {
          dia: string;
          segundos: number;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          dia: string;
          segundos?: number;
          user_id: string;
        };
        Update: {
          dia?: string;
          segundos?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "atividade_diaria_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      conquistas: {
        Row: {
          descricao: string | null;
          nome: string | null;
          slug: string;
        };
        ComputedFields: never;
        Insert: {
          descricao?: string | null;
          nome?: string | null;
          slug: string;
        };
        Update: {
          descricao?: string | null;
          nome?: string | null;
          slug?: string;
        };
        Relationships: [];
      };
      conquistas_aluno: {
        Row: {
          obtida_em: string | null;
          slug: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          obtida_em?: string | null;
          slug: string;
          user_id: string;
        };
        Update: {
          obtida_em?: string | null;
          slug?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conquistas_aluno_slug_fkey";
            columns: ["slug"];
            isOneToOne: false;
            referencedRelation: "conquistas";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "conquistas_aluno_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      entitlements: {
        Row: {
          atualizado_em: string;
          comprado_em: string | null;
          intervalo: string | null;
          pagamento_falhou_em: string | null;
          produto: string;
          renova_em: string | null;
          status: string;
          stripe_evento_em: string | null;
          stripe_subscription_id: string | null;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          atualizado_em?: string;
          comprado_em?: string | null;
          intervalo?: string | null;
          pagamento_falhou_em?: string | null;
          produto: string;
          renova_em?: string | null;
          status: string;
          stripe_evento_em?: string | null;
          stripe_subscription_id?: string | null;
          user_id: string;
        };
        Update: {
          atualizado_em?: string;
          comprado_em?: string | null;
          intervalo?: string | null;
          pagamento_falhou_em?: string | null;
          produto?: string;
          renova_em?: string | null;
          status?: string;
          stripe_evento_em?: string | null;
          stripe_subscription_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "entitlements_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      licao_passos: {
        Row: {
          assistiu: boolean | null;
          dia: string;
          entendeu: boolean | null;
          participou: boolean | null;
          user_id: string;
          video_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          assistiu?: boolean | null;
          dia: string;
          entendeu?: boolean | null;
          participou?: boolean | null;
          user_id: string;
          video_id?: string | null;
        };
        Update: {
          assistiu?: boolean | null;
          dia?: string;
          entendeu?: boolean | null;
          participou?: boolean | null;
          user_id?: string;
          video_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "licao_passos_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "licao_passos_video_id_fkey";
            columns: ["video_id"];
            isOneToOne: false;
            referencedRelation: "v_videos_publicos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "licao_passos_video_id_fkey";
            columns: ["video_id"];
            isOneToOne: false;
            referencedRelation: "videos";
            referencedColumns: ["id"];
          },
        ];
      };
      lives: {
        Row: {
          duracao_min: number | null;
          gravacao_video_id: string | null;
          id: string;
          inicio: string;
          sala_url: string | null;
          so_participar: boolean | null;
          titulo: string;
        };
        ComputedFields: never;
        Insert: {
          duracao_min?: number | null;
          gravacao_video_id?: string | null;
          id?: string;
          inicio: string;
          sala_url?: string | null;
          so_participar?: boolean | null;
          titulo: string;
        };
        Update: {
          duracao_min?: number | null;
          gravacao_video_id?: string | null;
          id?: string;
          inicio?: string;
          sala_url?: string | null;
          so_participar?: boolean | null;
          titulo?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lives_gravacao_video_id_fkey";
            columns: ["gravacao_video_id"];
            isOneToOne: false;
            referencedRelation: "v_videos_publicos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lives_gravacao_video_id_fkey";
            columns: ["gravacao_video_id"];
            isOneToOne: false;
            referencedRelation: "videos";
            referencedColumns: ["id"];
          },
        ];
      };
      palavras: {
        Row: {
          ajuda: string | null;
          audio_url: string | null;
          definicao: string | null;
          exemplo: string | null;
          id: string;
          imagem_url: string | null;
          texto: string;
          uso: string | null;
        };
        ComputedFields: never;
        Insert: {
          ajuda?: string | null;
          audio_url?: string | null;
          definicao?: string | null;
          exemplo?: string | null;
          id?: string;
          imagem_url?: string | null;
          texto: string;
          uso?: string | null;
        };
        Update: {
          ajuda?: string | null;
          audio_url?: string | null;
          definicao?: string | null;
          exemplo?: string | null;
          id?: string;
          imagem_url?: string | null;
          texto?: string;
          uso?: string | null;
        };
        Relationships: [];
      };
      palavras_aluno: {
        Row: {
          acertos: number | null;
          estado: string;
          intervalo_dias: number | null;
          palavra_id: string;
          proxima_revisao: string | null;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          acertos?: number | null;
          estado?: string;
          intervalo_dias?: number | null;
          palavra_id: string;
          proxima_revisao?: string | null;
          user_id: string;
        };
        Update: {
          acertos?: number | null;
          estado?: string;
          intervalo_dias?: number | null;
          palavra_id?: string;
          proxima_revisao?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "palavras_aluno_palavra_id_fkey";
            columns: ["palavra_id"];
            isOneToOne: false;
            referencedRelation: "palavras";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "palavras_aluno_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          atualizado_em: string;
          conta_privada: boolean;
          criado_em: string;
          email_novidades: boolean | null;
          email_semanal: boolean | null;
          email_videos: boolean | null;
          fuso: string | null;
          fuso_escolhido: boolean;
          id: string;
          legendas: boolean;
          meta_diaria_min: number;
          nome: string | null;
          previa_video: boolean;
          pular_vistos: boolean;
          reproducao_automatica: boolean;
          stripe_customer_id: string | null;
          tema: string;
        };
        ComputedFields: never;
        Insert: {
          atualizado_em?: string;
          conta_privada?: boolean;
          criado_em?: string;
          email_novidades?: boolean | null;
          email_semanal?: boolean | null;
          email_videos?: boolean | null;
          fuso?: string | null;
          fuso_escolhido?: boolean;
          id: string;
          legendas?: boolean;
          meta_diaria_min?: number;
          nome?: string | null;
          previa_video?: boolean;
          pular_vistos?: boolean;
          reproducao_automatica?: boolean;
          stripe_customer_id?: string | null;
          tema?: string;
        };
        Update: {
          atualizado_em?: string;
          conta_privada?: boolean;
          criado_em?: string;
          email_novidades?: boolean | null;
          email_semanal?: boolean | null;
          email_videos?: boolean | null;
          fuso?: string | null;
          fuso_escolhido?: boolean;
          id?: string;
          legendas?: boolean;
          meta_diaria_min?: number;
          nome?: string | null;
          previa_video?: boolean;
          pular_vistos?: boolean;
          reproducao_automatica?: boolean;
          stripe_customer_id?: string | null;
          tema?: string;
        };
        Relationships: [];
      };
      series: {
        Row: {
          apresentador_id: string | null;
          capa: string | null;
          descricao: string | null;
          id: string;
          nivel: string;
          ordem: number | null;
          titulo: string;
        };
        ComputedFields: never;
        Insert: {
          apresentador_id?: string | null;
          capa?: string | null;
          descricao?: string | null;
          id?: string;
          nivel: string;
          ordem?: number | null;
          titulo: string;
        };
        Update: {
          apresentador_id?: string | null;
          capa?: string | null;
          descricao?: string | null;
          id?: string;
          nivel?: string;
          ordem?: number | null;
          titulo?: string;
        };
        Relationships: [
          {
            foreignKeyName: "series_apresentador_id_fkey";
            columns: ["apresentador_id"];
            isOneToOne: false;
            referencedRelation: "apresentadores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "series_apresentador_id_fkey";
            columns: ["apresentador_id"];
            isOneToOne: false;
            referencedRelation: "v_apresentadores_publicos";
            referencedColumns: ["id"];
          },
        ];
      };
      series_salvas: {
        Row: {
          serie_id: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          serie_id: string;
          user_id: string;
        };
        Update: {
          serie_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "series_salvas_serie_id_fkey";
            columns: ["serie_id"];
            isOneToOne: false;
            referencedRelation: "series";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "series_salvas_serie_id_fkey";
            columns: ["serie_id"];
            isOneToOne: false;
            referencedRelation: "v_series_publicas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "series_salvas_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      stripe_eventos: {
        Row: {
          id: string;
          recebido_em: string | null;
          tipo: string | null;
        };
        ComputedFields: never;
        Insert: {
          id: string;
          recebido_em?: string | null;
          tipo?: string | null;
        };
        Update: {
          id?: string;
          recebido_em?: string | null;
          tipo?: string | null;
        };
        Relationships: [];
      };
      temas: {
        Row: {
          id: string;
          nome: string | null;
          slug: string | null;
        };
        ComputedFields: never;
        Insert: {
          id?: string;
          nome?: string | null;
          slug?: string | null;
        };
        Update: {
          id?: string;
          nome?: string | null;
          slug?: string | null;
        };
        Relationships: [];
      };
      tempo_fora: {
        Row: {
          criado_em: string | null;
          dia: string;
          id: string;
          nota: string | null;
          segundos: number;
          tipo: string;
          user_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          criado_em?: string | null;
          dia: string;
          id?: string;
          nota?: string | null;
          segundos: number;
          tipo: string;
          user_id?: string | null;
        };
        Update: {
          criado_em?: string | null;
          dia?: string;
          id?: string;
          nota?: string | null;
          segundos?: number;
          tipo?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tempo_fora_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      video_palavras: {
        Row: {
          palavra_id: string;
          video_id: string;
        };
        ComputedFields: never;
        Insert: {
          palavra_id: string;
          video_id: string;
        };
        Update: {
          palavra_id?: string;
          video_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "video_palavras_palavra_id_fkey";
            columns: ["palavra_id"];
            isOneToOne: false;
            referencedRelation: "palavras";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "video_palavras_video_id_fkey";
            columns: ["video_id"];
            isOneToOne: false;
            referencedRelation: "v_videos_publicos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "video_palavras_video_id_fkey";
            columns: ["video_id"];
            isOneToOne: false;
            referencedRelation: "videos";
            referencedColumns: ["id"];
          },
        ];
      };
      video_temas: {
        Row: {
          tema_id: string;
          video_id: string;
        };
        ComputedFields: never;
        Insert: {
          tema_id: string;
          video_id: string;
        };
        Update: {
          tema_id?: string;
          video_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "video_temas_tema_id_fkey";
            columns: ["tema_id"];
            isOneToOne: false;
            referencedRelation: "temas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "video_temas_video_id_fkey";
            columns: ["video_id"];
            isOneToOne: false;
            referencedRelation: "v_videos_publicos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "video_temas_video_id_fkey";
            columns: ["video_id"];
            isOneToOne: false;
            referencedRelation: "videos";
            referencedColumns: ["id"];
          },
        ];
      };
      videos: {
        Row: {
          adulto: boolean | null;
          apresentador_id: string | null;
          desafio_dia: number | null;
          descricao: string | null;
          duracao_seg: number;
          id: string;
          legenda_url: string | null;
          miniatura: string | null;
          nivel: string;
          ordem: number | null;
          pais: string | null;
          plano_minimo: string;
          provedor: string;
          publicado_em: string | null;
          serie_id: string | null;
          titulo: string;
          video_ref: string | null;
        };
        ComputedFields: never;
        Insert: {
          adulto?: boolean | null;
          apresentador_id?: string | null;
          desafio_dia?: number | null;
          descricao?: string | null;
          duracao_seg: number;
          id?: string;
          legenda_url?: string | null;
          miniatura?: string | null;
          nivel: string;
          ordem?: number | null;
          pais?: string | null;
          plano_minimo?: string;
          provedor?: string;
          publicado_em?: string | null;
          serie_id?: string | null;
          titulo: string;
          video_ref?: string | null;
        };
        Update: {
          adulto?: boolean | null;
          apresentador_id?: string | null;
          desafio_dia?: number | null;
          descricao?: string | null;
          duracao_seg?: number;
          id?: string;
          legenda_url?: string | null;
          miniatura?: string | null;
          nivel?: string;
          ordem?: number | null;
          pais?: string | null;
          plano_minimo?: string;
          provedor?: string;
          publicado_em?: string | null;
          serie_id?: string | null;
          titulo?: string;
          video_ref?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "videos_apresentador_id_fkey";
            columns: ["apresentador_id"];
            isOneToOne: false;
            referencedRelation: "apresentadores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "videos_apresentador_id_fkey";
            columns: ["apresentador_id"];
            isOneToOne: false;
            referencedRelation: "v_apresentadores_publicos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "videos_serie_id_fkey";
            columns: ["serie_id"];
            isOneToOne: false;
            referencedRelation: "series";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "videos_serie_id_fkey";
            columns: ["serie_id"];
            isOneToOne: false;
            referencedRelation: "v_series_publicas";
            referencedColumns: ["id"];
          },
        ];
      };
      visualizacoes: {
        Row: {
          atualizado_em: string;
          concluido: boolean;
          curtido: boolean;
          entendimento: string | null;
          posicao_seg: number;
          salvo: boolean;
          segundos: number;
          user_id: string;
          video_id: string;
        };
        ComputedFields: never;
        Insert: {
          atualizado_em?: string;
          concluido?: boolean;
          curtido?: boolean;
          entendimento?: string | null;
          posicao_seg?: number;
          salvo?: boolean;
          segundos?: number;
          user_id: string;
          video_id: string;
        };
        Update: {
          atualizado_em?: string;
          concluido?: boolean;
          curtido?: boolean;
          entendimento?: string | null;
          posicao_seg?: number;
          salvo?: boolean;
          segundos?: number;
          user_id?: string;
          video_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "visualizacoes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "visualizacoes_video_id_fkey";
            columns: ["video_id"];
            isOneToOne: false;
            referencedRelation: "v_videos_publicos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "visualizacoes_video_id_fkey";
            columns: ["video_id"];
            isOneToOne: false;
            referencedRelation: "videos";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      v_apresentadores_publicos: {
        Row: {
          foto: string | null;
          id: string | null;
          nome: string | null;
          pais: string | null;
          temas: string[] | null;
        };
        ComputedFields: never;
        Insert: {
          foto?: string | null;
          id?: string | null;
          nome?: string | null;
          pais?: string | null;
          temas?: string[] | null;
        };
        Update: {
          foto?: string | null;
          id?: string | null;
          nome?: string | null;
          pais?: string | null;
          temas?: string[] | null;
        };
        Relationships: [];
      };
      v_lives_publicas: {
        Row: {
          duracao_min: number | null;
          gravacao_video_id: string | null;
          id: string | null;
          inicio: string | null;
          so_participar: boolean | null;
          titulo: string | null;
        };
        ComputedFields: never;
        Insert: {
          duracao_min?: number | null;
          gravacao_video_id?: string | null;
          id?: string | null;
          inicio?: string | null;
          so_participar?: boolean | null;
          titulo?: string | null;
        };
        Update: {
          duracao_min?: number | null;
          gravacao_video_id?: string | null;
          id?: string | null;
          inicio?: string | null;
          so_participar?: boolean | null;
          titulo?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "lives_gravacao_video_id_fkey";
            columns: ["gravacao_video_id"];
            isOneToOne: false;
            referencedRelation: "v_videos_publicos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lives_gravacao_video_id_fkey";
            columns: ["gravacao_video_id"];
            isOneToOne: false;
            referencedRelation: "videos";
            referencedColumns: ["id"];
          },
        ];
      };
      v_series_publicas: {
        Row: {
          apresentador_nome: string | null;
          capa: string | null;
          descricao: string | null;
          episodios: number | null;
          id: string | null;
          nivel: string | null;
          ordem: number | null;
          titulo: string | null;
        };
        ComputedFields: never;
        Relationships: [];
      };
      v_videos_publicos: {
        Row: {
          adulto: boolean | null;
          apresentador_id: string | null;
          desafio_dia: number | null;
          descricao: string | null;
          duracao_seg: number | null;
          id: string | null;
          miniatura: string | null;
          nivel: string | null;
          ordem: number | null;
          pais: string | null;
          plano_minimo: string | null;
          provedor: string | null;
          publicado_em: string | null;
          serie_id: string | null;
          temas: string[] | null;
          titulo: string | null;
        };
        ComputedFields: never;
        Insert: {
          adulto?: boolean | null;
          apresentador_id?: string | null;
          desafio_dia?: number | null;
          descricao?: string | null;
          duracao_seg?: number | null;
          id?: string | null;
          miniatura?: string | null;
          nivel?: string | null;
          ordem?: number | null;
          pais?: string | null;
          plano_minimo?: string | null;
          provedor?: string | null;
          publicado_em?: string | null;
          serie_id?: string | null;
          temas?: never;
          titulo?: string | null;
        };
        Update: {
          adulto?: boolean | null;
          apresentador_id?: string | null;
          desafio_dia?: number | null;
          descricao?: string | null;
          duracao_seg?: number | null;
          id?: string | null;
          miniatura?: string | null;
          nivel?: string | null;
          ordem?: number | null;
          pais?: string | null;
          plano_minimo?: string | null;
          provedor?: string | null;
          publicado_em?: string | null;
          serie_id?: string | null;
          temas?: never;
          titulo?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "videos_apresentador_id_fkey";
            columns: ["apresentador_id"];
            isOneToOne: false;
            referencedRelation: "apresentadores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "videos_apresentador_id_fkey";
            columns: ["apresentador_id"];
            isOneToOne: false;
            referencedRelation: "v_apresentadores_publicos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "videos_serie_id_fkey";
            columns: ["serie_id"];
            isOneToOne: false;
            referencedRelation: "series";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "videos_serie_id_fkey";
            columns: ["serie_id"];
            isOneToOne: false;
            referencedRelation: "v_series_publicas";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      registrar_progresso: {
        Args: {
          p_delta: number;
          p_dia: string;
          p_posicao: number;
          p_user: string;
          p_video: string;
        };
        Returns: {
          concluido: boolean;
          posicao_seg: number;
          recem_concluido: boolean;
          segundos: number;
        }[];
      };
      usuario_por_email: { Args: { p_email: string }; Returns: string };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
