import axios, { isAxiosError, type AxiosError } from 'axios';

import { ambiente } from '@/config/ambiente';
import type { CampoComErro, Pagina, PaginaSpring, RespostaErro } from '@/types/api';

interface OpcoesErro {
  status?: number;
  campos?: CampoComErro[];
  semConexao?: boolean;
  tentarAposSegundos?: number;
}

export class ErroApi extends Error {
  readonly status: number;
  readonly campos: CampoComErro[];
  readonly semConexao: boolean;
  readonly tentarAposSegundos?: number;

  // Método construtor
  constructor(mensagem: string, opcoes: OpcoesErro = {}) {
    super(mensagem);
    this.name = 'ErroApi';
    this.status = opcoes.status ?? 0;
    this.campos = opcoes.campos ?? [];
    this.semConexao = opcoes.semConexao ?? false;
    this.tentarAposSegundos = opcoes.tentarAposSegundos;
  }

  erroDoCampo(campo: string): string | undefined {
    return this.campos.find((item) => item.campo === campo)?.mensagem;
  }
}

const mensagensPorStatus: Record<number, string> = {
  400: 'Confira os dados informados.',
  401: 'Sua sessão expirou. Entre de novo.',
  403: 'Você não tem permissão para esta ação.',
  404: 'Não encontramos o que você procurou.',
  409: 'Esta ação já foi registrada.',
  413: 'O arquivo é grande demais.',
  415: 'Formato de arquivo não aceito. Use JPEG ou PNG.',
  422: 'Não foi possível concluir por uma regra do sistema.',
  429: 'Muitas tentativas seguidas. Aguarde um pouco e tente de novo.',
  500: 'O servidor teve um problema. Tente de novo em instantes.',
  503: 'Serviço indisponível no momento. Tente de novo em instantes.',
};

let tokenAtual: string | null = null;
let aoExpirarSessao: (() => void) | null = null;

export function definirToken(token: string | null): void {
  tokenAtual = token;
}

export function obterToken(): string | null {
  return tokenAtual;
}

export function registrarAoExpirarSessao(callback: (() => void) | null): void {
  aoExpirarSessao = callback;
}

export const api = axios.create({
  baseURL: ambiente.apiUrl,
  timeout: ambiente.tempoLimiteMs,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  if (tokenAtual) {
    config.headers.Authorization = `Bearer ${tokenAtual}`;
  }
  return config;
});

api.interceptors.response.use(
  (resposta) => resposta,
  (erro: unknown) => {
    const convertido = converterErro(erro);
    const rotaDeAutenticacao = isAxiosError(erro) && erro.config?.url?.includes('/api/auth/');
    if (convertido.status === 401 && tokenAtual && !rotaDeAutenticacao) {
      aoExpirarSessao?.();
    }
    return Promise.reject(convertido);
  },
);

export function converterErro(erro: unknown): ErroApi {
  if (erro instanceof ErroApi) {
    return erro;
  }

  if (isAxiosError(erro)) {
    const erroAxios = erro as AxiosError<RespostaErro>;

    if (!erroAxios.response) {
      const tempoEsgotado = erroAxios.code === 'ECONNABORTED' || erroAxios.code === 'ETIMEDOUT';
      return new ErroApi(
        tempoEsgotado
          ? 'O servidor demorou para responder. Tente de novo.'
          : 'Sem conexão com o servidor. Verifique a internet e tente de novo.',
        { semConexao: true },
      );
    }

    const { status, data, headers } = erroAxios.response;
    const cabecalhoTentarApos = Number(headers?.['retry-after']);
    const tentarApos = Number.isFinite(cabecalhoTentarApos) ? cabecalhoTentarApos : undefined;
    const mensagemDoServidor = typeof data === 'object' && data?.mensagem ? data.mensagem : null;
    const mensagem =
      status === 429 && tentarApos !== undefined
        ? `Muitas tentativas seguidas. Tente de novo em ${tentarApos} s.`
        : (mensagemDoServidor ?? mensagensPorStatus[status] ?? 'Algo deu errado. Tente de novo.');

    return new ErroApi(mensagem, {
      status,
      campos: typeof data === 'object' && Array.isArray(data?.campos) ? data.campos : [],
      tentarAposSegundos: tentarApos,
    });
  }

  if (erro instanceof Error) {
    return new ErroApi(erro.message);
  }

  return new ErroApi('Algo deu errado. Tente de novo.');
}

export function paraPagina<T>(dados: PaginaSpring<T>): Pagina<T> {
  const itens = Array.isArray(dados?.content) ? dados.content : [];
  const numero = dados?.page?.number ?? dados?.number ?? 0;
  const totalPaginas = dados?.page?.totalPages ?? dados?.totalPages ?? 1;
  const totalItens = dados?.page?.totalElements ?? dados?.totalElements ?? itens.length;
  const ultima = dados?.last ?? numero + 1 >= totalPaginas;

  return { itens, pagina: numero, totalPaginas, totalItens, ultima };
}

export function urlAbsoluta(caminho: string): string {
  if (/^https?:\/\//i.test(caminho)) {
    return caminho;
  }
  return `${ambiente.apiUrl}${caminho.startsWith('/') ? '' : '/'}${caminho}`;
}
