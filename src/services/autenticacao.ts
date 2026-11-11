import { api } from './api';
import type { DadosCadastro, DadosLogin, RespostaLogin, Usuario } from '@/types/api';

export async function entrar(dados: DadosLogin): Promise<RespostaLogin> {
  const { data } = await api.post<RespostaLogin>('/api/auth/login', dados);
  return data;
}

export async function registrar(dados: DadosCadastro): Promise<RespostaLogin | Usuario> {
  const { data } = await api.post<RespostaLogin | Usuario>('/api/auth/registrar', dados);
  return data;
}

export function ehRespostaLogin(dados: RespostaLogin | Usuario): dados is RespostaLogin {
  return typeof (dados as RespostaLogin).token === 'string';
}
