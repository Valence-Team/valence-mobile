import type {
  CategoriaDenuncia,
  Cultura,
  DecisaoLaudo,
  GravidadeDenuncia,
  MotivoImagem,
  NivelAlerta,
  Papel,
  StatusFoco,
  StatusOcorrencia,
} from '@/types/dominio';

export type TomEtiqueta = 'info' | 'aviso' | 'perigo' | 'sucesso' | 'neutro';

export const rotuloCultura: Record<Cultura, string> = {
  MILHO: 'Milho',
  TOMATE: 'Tomate',
  BATATA: 'Batata',
};

export const rotuloPapel: Record<Papel, string> = {
  PRODUTOR: 'Produtor',
  AGRONOMO: 'Agrônomo',
  GESTOR: 'Gestor público',
};

export const descricaoPapel: Record<Papel, string> = {
  PRODUTOR: 'Produtor',
  AGRONOMO: 'Extensão rural',
  GESTOR: 'Poder público',
};

export const rotuloStatusOcorrencia: Record<StatusOcorrencia, string> = {
  RECEBIDA: 'Recebida',
  TRIADA: 'Triada',
  EM_ANALISE: 'Em análise',
  CONFIRMADA: 'Confirmada',
  DESCARTADA: 'Descartada',
};

export const tomStatusOcorrencia: Record<StatusOcorrencia, TomEtiqueta> = {
  RECEBIDA: 'neutro',
  TRIADA: 'info',
  EM_ANALISE: 'aviso',
  CONFIRMADA: 'perigo',
  DESCARTADA: 'sucesso',
};

export const rotuloNivelAlerta: Record<NivelAlerta, string> = {
  SUSPEITA: 'Suspeita',
  CONFIRMADO: 'Confirmado',
  ENCERRADO: 'Encerrado',
};

export const tomNivelAlerta: Record<NivelAlerta, TomEtiqueta> = {
  SUSPEITA: 'aviso',
  CONFIRMADO: 'perigo',
  ENCERRADO: 'neutro',
};

export const rotuloDecisaoLaudo: Record<DecisaoLaudo, string> = {
  CONFIRMADA: 'Praga confirmada',
  DESCARTADA: 'Caso descartado',
  MAIS_INFORMACOES: 'Mais informações pedidas',
};

export const tomDecisaoLaudo: Record<DecisaoLaudo, TomEtiqueta> = {
  CONFIRMADA: 'perigo',
  DESCARTADA: 'sucesso',
  MAIS_INFORMACOES: 'aviso',
};

export const rotuloCategoriaDenuncia: Record<CategoriaDenuncia, string> = {
  RECOMENDACAO_PERIGOSA: 'Recomendação perigosa',
  DESINFORMACAO: 'Informação falsa',
  OFENSA: 'Ofensa',
  DADOS_PESSOAIS: 'Dados pessoais',
  SPAM: 'Propaganda ou spam',
  SEM_PROBLEMA: 'Sem problema',
};

export const rotuloGravidade: Record<GravidadeDenuncia, string> = {
  BAIXA: 'Gravidade baixa',
  MEDIA: 'Gravidade média',
  ALTA: 'Gravidade alta',
};

export const tomGravidade: Record<GravidadeDenuncia, TomEtiqueta> = {
  BAIXA: 'neutro',
  MEDIA: 'aviso',
  ALTA: 'perigo',
};

export const mensagemMotivoImagem: Record<MotivoImagem, string> = {
  RESOLUCAO_BAIXA: 'A foto ficou pequena demais. Tire outra mais de perto da folha.',
  IMAGEM_ESCURA: 'A foto ficou escura. Tire outra com a folha bem iluminada.',
  IMAGEM_CLARA: 'A foto ficou clara demais. Evite sol direto e flash.',
  IMAGEM_BORRADA: 'A foto ficou tremida. Tire outra com a folha bem iluminada.',
  NAO_E_PLANTA: 'A foto não parece ser de uma planta. Fotografe a folha afetada.',
  CULTURA_FORA_DO_ESCOPO: 'O Valence analisa só milho, tomate e batata.',
  CULTURA_DIVERGENTE: 'A planta da foto parece de outra cultura. Confira a cultura escolhida.',
};

export const rotuloStatusFoco: Record<StatusFoco, string> = {
  SUSPEITA: 'Suspeita',
  CONFIRMADO: 'Confirmado',
  DESCARTADO: 'Descartado',
};

export const tomStatusFoco: Record<StatusFoco, TomEtiqueta> = {
  SUSPEITA: 'aviso',
  CONFIRMADO: 'perigo',
  DESCARTADO: 'sucesso',
};
