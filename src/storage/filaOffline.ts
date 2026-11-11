import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ArquivoFoto, DadosOcorrencia } from '@/types/api';

export interface OcorrenciaPendente {
  idLocal: string;
  chaveIdempotencia: string;
  dados: DadosOcorrencia;
  foto: ArquivoFoto;
  propriedadeNome: string;
  criadaEm: string;
  ocorrenciaId?: number;
  erro?: string;
}

function chaveDoUsuario(usuarioId: number): string {
  return `valence.fila-ocorrencias.${usuarioId}`;
}

export async function lerFila(usuarioId: number): Promise<OcorrenciaPendente[]> {
  try {
    const bruto = await AsyncStorage.getItem(chaveDoUsuario(usuarioId));
    return bruto ? (JSON.parse(bruto) as OcorrenciaPendente[]) : [];
  } catch {
    return [];
  }
}

export async function gravarFila(usuarioId: number, fila: OcorrenciaPendente[]): Promise<void> {
  if (fila.length === 0) {
    await AsyncStorage.removeItem(chaveDoUsuario(usuarioId));
    return;
  }
  await AsyncStorage.setItem(chaveDoUsuario(usuarioId), JSON.stringify(fila));
}
