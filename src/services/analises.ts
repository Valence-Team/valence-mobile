import { api, paraPagina } from './api';
import { ambiente } from '@/config/ambiente';
import type { DadosLaudo, Laudo, Ocorrencia, Pagina, PaginaSpring } from '@/types/api';
import type { StatusOcorrencia } from '@/types/dominio';

export async function listarFilaDeAnalise(
  status: Extract<StatusOcorrencia, 'TRIADA' | 'EM_ANALISE'> | null,
  pagina = 0,
): Promise<Pagina<Ocorrencia>> {
  const { data } = await api.get<PaginaSpring<Ocorrencia>>('/api/analises', {
    params: { page: pagina, size: ambiente.tamanhoPagina, ...(status ? { status } : {}) },
  });
  return paraPagina(data);
}

export async function emitirLaudo(ocorrenciaId: number, dados: DadosLaudo): Promise<Laudo> {
  const { data } = await api.post<Laudo>(`/api/ocorrencias/${ocorrenciaId}/laudo`, dados);
  return data;
}
