import axios from 'axios';

import { converterErro } from './api';
import { ambiente } from '@/config/ambiente';
import type { EstatisticasFocos, ListaFocos } from '@/types/api';
import type { Cultura } from '@/types/dominio';

const observatorio = axios.create({
  baseURL: ambiente.observatorioUrl,
  timeout: ambiente.tempoLimiteMs,
  headers: { Accept: 'application/json' },
});

observatorio.interceptors.response.use(
  (resposta) => resposta,
  (erro: unknown) => Promise.reject(converterErro(erro)),
);

interface FiltroFocos {
  cultura: Cultura | null;
  uf: string;
  deslocamento: number;
  registroRetornado: number;
}

export async function listarFocos(filtro: FiltroFocos): Promise<ListaFocos> {
  const resposta = await observatorio.get<ListaFocos | ''>('/api/publico/focos', {
    params: {
      uf: filtro.uf,
      deslocamento: filtro.deslocamento,
      registroRetornado: filtro.registroRetornado,
      ...(filtro.cultura ? { cultura: filtro.cultura } : {}),
    },
  });

  if (resposta.status === 204 || !resposta.data) {
    return {
      items: [],
      deslocamento: filtro.deslocamento,
      registroRetornado: filtro.registroRetornado,
      totalRegistros: 0,
    };
  }
  return resposta.data;
}

export async function obterEstatisticas(uf: string, periodoDias = 30): Promise<EstatisticasFocos> {
  const { data } = await observatorio.get<EstatisticasFocos>('/api/publico/estatisticas', {
    params: { uf, periodo: periodoDias },
  });
  return data;
}
