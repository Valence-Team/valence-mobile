export type Papel = 'PRODUTOR' | 'AGRONOMO' | 'GESTOR';

export type Cultura = 'MILHO' | 'TOMATE' | 'BATATA';

export type StatusOcorrencia = 'RECEBIDA' | 'TRIADA' | 'EM_ANALISE' | 'CONFIRMADA' | 'DESCARTADA';

export type DecisaoLaudo = 'CONFIRMADA' | 'DESCARTADA' | 'MAIS_INFORMACOES';

export type NivelAlerta = 'SUSPEITA' | 'CONFIRMADO' | 'ENCERRADO';

export type StatusPublicacao = 'ATIVO' | 'OCULTO' | 'REMOVIDO';

export type CategoriaDenuncia =
  | 'RECOMENDACAO_PERIGOSA'
  | 'DESINFORMACAO'
  | 'OFENSA'
  | 'DADOS_PESSOAIS'
  | 'SPAM'
  | 'SEM_PROBLEMA';

export type GravidadeDenuncia = 'BAIXA' | 'MEDIA' | 'ALTA';

export type DecisaoModeracao = 'MANTER' | 'REMOVER';

export type MotivoImagem =
  | 'RESOLUCAO_BAIXA'
  | 'IMAGEM_ESCURA'
  | 'IMAGEM_CLARA'
  | 'IMAGEM_BORRADA'
  | 'NAO_E_PLANTA'
  | 'CULTURA_FORA_DO_ESCOPO'
  | 'CULTURA_DIVERGENTE';

export type StatusFoco = 'SUSPEITA' | 'CONFIRMADO' | 'DESCARTADO';

export const CULTURAS: Cultura[] = ['MILHO', 'TOMATE', 'BATATA'];
