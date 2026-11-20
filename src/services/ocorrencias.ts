import { Platform } from 'react-native';

import { ErroApi, api, obterToken, paraPagina, urlAbsoluta } from './api';
import { ambiente } from '@/config/ambiente';
import type {
  ArquivoFoto,
  DadosOcorrencia,
  FotoOcorrencia,
  Ocorrencia,
  Pagina,
  PaginaSpring,
} from '@/types/api';
import type { StatusOcorrencia } from '@/types/dominio';

export async function listarOcorrencias(
  status: StatusOcorrencia | null,
  pagina = 0,
): Promise<Pagina<Ocorrencia>> {
  const { data } = await api.get<PaginaSpring<Ocorrencia>>('/api/ocorrencias', {
    params: {
      page: pagina,
      size: ambiente.tamanhoPagina,
      sort: 'dataRegistro,desc',
      ...(status ? { status } : {}),
    },
  });
  return paraPagina(data);
}

export async function obterOcorrencia(id: number): Promise<Ocorrencia> {
  const { data } = await api.get<Ocorrencia>(`/api/ocorrencias/${id}`);
  return data;
}

export async function criarOcorrencia(
  dados: DadosOcorrencia,
  chaveIdempotencia: string,
): Promise<Ocorrencia> {
  const { data } = await api.post<Ocorrencia>('/api/ocorrencias', dados, {
    headers: { 'Idempotency-Key': chaveIdempotencia },
  });
  return data;
}

export async function enviarFotoDaOcorrencia(
  ocorrenciaId: number,
  foto: ArquivoFoto,
): Promise<FotoOcorrencia | Ocorrencia> {
  const formulario = new FormData();
  const naWeb = Platform.OS === 'web';
  if (naWeb) {
    const arquivo = await (await fetch(foto.uri)).blob();
    formulario.append('foto', arquivo, foto.nome);
  } else {
    formulario.append('foto', {
      uri: foto.uri,
      name: foto.nome,
      type: foto.tipo,
    } as unknown as Blob);
  }

  const { data } = await api.post<FotoOcorrencia | Ocorrencia>(
    `/api/ocorrencias/${ocorrenciaId}/fotos`,
    formulario,
    {
      headers: naWeb ? undefined : { 'Content-Type': 'multipart/form-data' },
      transformRequest: (corpo) => corpo,
      timeout: ambiente.tempoLimiteEnvioFotoMs,
    },
  );
  return data;
}

export async function atualizarOcorrencia(id: number, dados: DadosOcorrencia): Promise<Ocorrencia> {
  const { data } = await api.put<Ocorrencia>(`/api/ocorrencias/${id}`, dados);
  return data;
}

export async function excluirOcorrencia(id: number): Promise<void> {
  await api.delete(`/api/ocorrencias/${id}`);
}

export async function reprocessarTriagem(id: number): Promise<Ocorrencia> {
  const { data } = await api.post<Ocorrencia>(`/api/ocorrencias/${id}/triagem`, null, {
    timeout: ambiente.tempoLimiteEnvioFotoMs,
  });
  return data;
}

interface FotoEmCache {
  promessa: Promise<string>;
  uri?: string;
}

const LIMITE_FOTOS_EM_CACHE = 12;
const fotosEmCache = new Map<string, FotoEmCache>();
let tokenDoCache: string | null = null;

function cacheDaSessao(): Map<string, FotoEmCache> {
  const token = obterToken();
  if (token !== tokenDoCache) {
    fotosEmCache.clear();
    tokenDoCache = token;
  }
  return fotosEmCache;
}

function servidaPelaApi(endereco: string): boolean {
  return endereco.startsWith(`${ambiente.apiUrl}/`);
}

function paraDataUri(conteudo: Blob, tipo: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => {
      const resultado = typeof leitor.result === 'string' ? leitor.result : '';
      const inicio = resultado.indexOf(',');
      if (inicio < 0) {
        reject(new ErroApi('Não foi possível ler a foto.'));
        return;
      }
      resolve(`data:${tipo};base64,${resultado.slice(inicio + 1)}`);
    };
    leitor.onerror = () => reject(new ErroApi('Não foi possível ler a foto.'));
    leitor.readAsDataURL(conteudo);
  });
}

export function enderecoDaFoto(url: string): string {
  return urlAbsoluta(url);
}

export function fotoJaCarregada(url: string): string | null {
  const endereco = enderecoDaFoto(url);
  if (!servidaPelaApi(endereco)) {
    return endereco;
  }
  return cacheDaSessao().get(endereco)?.uri ?? null;
}

export function carregarFoto(url: string, contentType?: string): Promise<string> {
  const endereco = enderecoDaFoto(url);
  if (!servidaPelaApi(endereco)) {
    return Promise.resolve(endereco);
  }

  const cache = cacheDaSessao();
  const existente = cache.get(endereco);
  if (existente) {
    return existente.promessa;
  }

  const promessa = api
    .get<Blob>(endereco, {
      responseType: 'blob',
      headers: { Accept: 'image/*' },
      timeout: ambiente.tempoLimiteEnvioFotoMs,
    })
    .then(({ data }) => paraDataUri(data, contentType ?? 'image/jpeg'));
  const item: FotoEmCache = { promessa };

  promessa.then(
    (uri) => {
      item.uri = uri;
    },
    () => {
      if (cache.get(endereco) === item) {
        cache.delete(endereco);
      }
    },
  );

  cache.set(endereco, item);
  while (cache.size > LIMITE_FOTOS_EM_CACHE) {
    const maisAntiga = cache.keys().next().value;
    if (maisAntiga === undefined) {
      break;
    }
    cache.delete(maisAntiga);
  }
  return promessa;
}

export function tituloDaOcorrencia(ocorrencia: Ocorrencia): string {
  if (ocorrencia.laudo?.pragaConfirmada) {
    return ocorrencia.laudo.pragaConfirmada;
  }
  if (ocorrencia.status === 'DESCARTADA') {
    return 'Sem praga identificada';
  }
  const hipotese = ocorrencia.pragaProvavel ?? ocorrencia.triagem?.hipoteses?.[0]?.praga;
  if (hipotese) {
    return hipotese;
  }
  return ocorrencia.status === 'RECEBIDA' ? 'Aguardando triagem' : 'Sem triagem automática';
}

export function podeEditarOcorrencia(ocorrencia: Ocorrencia): boolean {
  return ocorrencia.status === 'RECEBIDA' || ocorrencia.status === 'TRIADA';
}
