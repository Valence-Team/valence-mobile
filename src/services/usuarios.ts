import { api } from './api';
import type { DadosPerfil, Usuario } from '@/types/api';

export async function obterPerfil(): Promise<Usuario> {
  const { data } = await api.get<Usuario>('/api/usuarios/me');
  return data;
}

export async function atualizarPerfil(dados: DadosPerfil): Promise<Usuario> {
  const { data } = await api.put<Usuario>('/api/usuarios/me', dados);
  return data;
}
