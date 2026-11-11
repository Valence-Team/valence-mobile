import AsyncStorage from '@react-native-async-storage/async-storage';

import { apagarSegredo, lerSegredo, salvarSegredo } from './armazenamentoSeguro';
import type { Usuario } from '@/types/api';

const CHAVE_TOKEN = 'valence.token';
const CHAVE_SESSAO = 'valence.sessao';

export interface Sessao {
  token: string;
  expiraEm: string;
  usuario: Usuario;
}

interface DadosSessaoPublicos {
  expiraEm: string;
  usuario: Usuario;
}

export function sessaoExpirada(expiraEm: string): boolean {
  const limite = new Date(expiraEm).getTime();
  return Number.isNaN(limite) || limite <= Date.now();
}

export async function salvarSessao(sessao: Sessao): Promise<void> {
  const publicos: DadosSessaoPublicos = { expiraEm: sessao.expiraEm, usuario: sessao.usuario };
  await salvarSegredo(CHAVE_TOKEN, sessao.token);
  await AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify(publicos));
}

export async function atualizarUsuarioDaSessao(usuario: Usuario): Promise<void> {
  const bruto = await AsyncStorage.getItem(CHAVE_SESSAO);
  if (!bruto) {
    return;
  }
  const publicos = JSON.parse(bruto) as DadosSessaoPublicos;
  await AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify({ ...publicos, usuario }));
}

export async function carregarSessao(): Promise<Sessao | null> {
  try {
    const [token, bruto] = await Promise.all([
      lerSegredo(CHAVE_TOKEN),
      AsyncStorage.getItem(CHAVE_SESSAO),
    ]);
    if (!token || !bruto) {
      return null;
    }
    const publicos = JSON.parse(bruto) as DadosSessaoPublicos;
    if (sessaoExpirada(publicos.expiraEm)) {
      await limparSessao();
      return null;
    }
    return { token, expiraEm: publicos.expiraEm, usuario: publicos.usuario };
  } catch {
    await limparSessao();
    return null;
  }
}

export async function limparSessao(): Promise<void> {
  await Promise.all([apagarSegredo(CHAVE_TOKEN), AsyncStorage.removeItem(CHAVE_SESSAO)]);
}
