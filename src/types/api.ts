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
  StatusPublicacao,
} from './dominio';

// Paginação e erros

export interface PaginaSpring<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
  last?: boolean;
  page?: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface Pagina<T> {
  itens: T[];
  pagina: number;
  totalPaginas: number;
  totalItens: number;
  ultima: boolean;
}

export interface CampoComErro {
  campo: string;
  mensagem: string;
}

export interface RespostaErro {
  timestamp?: string;
  status: number;
  erro?: string;
  mensagem?: string;
  caminho?: string;
  campos?: CampoComErro[];
}

// Autenticação e usuário

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  papel: Papel;
  telefone?: string | null;
  municipio: string;
  uf: string;
}

export interface RespostaLogin {
  token: string;
  tipo: string;
  expiraEm: string;
  usuario: Usuario;
}

export interface DadosLogin {
  email: string;
  senha: string;
}

export interface DadosCadastro {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  municipio: string;
  uf: string;
}

export interface DadosPerfil {
  nome: string;
  telefone?: string;
  municipio: string;
  uf: string;
}

// Propriedades

export interface Propriedade {
  id: number;
  nome: string;
  municipio: string;
  uf: string;
  latitude: number;
  longitude: number;
  areaHectares: number;
  culturas: Cultura[];
  criadoEm?: string;
}

export interface DadosPropriedade {
  nome: string;
  municipio: string;
  uf: string;
  latitude: number;
  longitude: number;
  areaHectares: number;
  culturas: Cultura[];
}

// Ocorrências, triagem e laudo

export interface Hipotese {
  praga: string;
  probabilidade: number;
}

export interface FonteTriagem {
  titulo?: string | null;
  fonte?: string | null;
  url?: string | null;
}

export interface Triagem {
  hipoteses: Hipotese[];
  confianca?: number | null;
  severidade?: number | null;
  cuidadosImediatos: string[];
  textoAlerta?: string | null;
  encaminharAgronomo?: boolean;
  explicacao?: string | null;
  fontes?: FonteTriagem[] | null;
  motivoImagem?: MotivoImagem | null;
  geradaEm?: string;
}

export interface Laudo {
  id?: number;
  decisao: DecisaoLaudo;
  pragaConfirmada?: string | null;
  parecer: string;
  emitidoEm: string;
  agronomoNome?: string | null;
}

export interface FotoOcorrencia {
  id: number;
  url: string;
  contentType?: string;
}

export interface PropriedadeResumo {
  id: number;
  nome: string;
  municipio: string;
  uf: string;
}

export interface Ocorrencia {
  id: number;
  cultura: Cultura;
  descricao: string;
  status: StatusOcorrencia;
  severidade?: number | null;
  pragaProvavel?: string | null;
  dataRegistro: string;
  atualizadoEm?: string;
  propriedade: PropriedadeResumo;
  fotos?: FotoOcorrencia[];
  triagem?: Triagem | null;
  laudo?: Laudo | null;
}

export interface DadosOcorrencia {
  propriedadeId: number;
  cultura: Cultura;
  descricao: string;
}

export interface ArquivoFoto {
  uri: string;
  nome: string;
  tipo: string;
}

export interface DadosLaudo {
  decisao: DecisaoLaudo;
  pragaConfirmada?: string;
  parecer: string;
}

// Alertas

export interface Alerta {
  id: number;
  nivel: NivelAlerta;
  distanciaKm: number;
  lido: boolean;
  criadoEm: string;
  ocorrenciaId: number;
  cultura: Cultura;
  pragaProvavel?: string | null;
  textoAlerta?: string | null;
  severidade?: number | null;
  propriedadeNome?: string | null;
}

// Mural e moderação

export interface Autor {
  id: number;
  nome: string;
  papel: Papel;
}

export interface Publicacao {
  id: number;
  municipio: string;
  uf: string;
  texto: string;
  status: StatusPublicacao;
  ocorrenciaId?: number | null;
  criadoEm: string;
  autor: Autor;
  totalComentarios?: number;
}

export interface DadosPublicacao {
  texto: string;
  municipio: string;
  uf: string;
}

export interface Comentario {
  id: number;
  texto: string;
  criadoEm: string;
  autor: Autor;
}

export interface ItemModeracao {
  postId: number;
  texto: string;
  municipio: string;
  uf: string;
  status: StatusPublicacao;
  criadoEm: string;
  autorNome: string;
  totalDenuncias: number;
  categoriaIa?: CategoriaDenuncia | null;
  gravidadeIa?: GravidadeDenuncia | null;
  justificativaIa?: string | null;
}

// Observatório (dados abertos do .NET)

export interface Foco {
  id: number;
  cultura: Cultura;
  pragaProvavel?: string | null;
  severidade?: number | null;
  municipio: string;
  uf: string;
  status: StatusFoco;
  dataOcorrencia: string;
  atualizadoEm?: string;
}

export interface ListaFocos {
  items: Foco[];
  deslocamento: number;
  registroRetornado: number;
  totalRegistros: number;
}

export interface Contagem {
  chave: string;
  total: number;
}

export interface EstatisticasFocos {
  uf?: string | null;
  periodoDias: number;
  desde?: string;
  ate?: string;
  totalFocos: number;
  porStatus: Contagem[];
  porCultura: Contagem[];
  porPraga: Contagem[];
  porMunicipio: Contagem[];
}
