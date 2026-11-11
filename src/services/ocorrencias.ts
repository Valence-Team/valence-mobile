import { api, paraPagina, urlAbsoluta } from './api';
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
  formulario.append('foto', { uri: foto.uri, name: foto.nome, type: foto.tipo } as unknown as Blob);

  const { data } = await api.post<FotoOcorrencia | Ocorrencia>(
    `/api/ocorrencias/${ocorrenciaId}/fotos`,
    formulario,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
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

export function enderecoDaFoto(foto: FotoOcorrencia): string {
  return urlAbsoluta(foto.url);
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
