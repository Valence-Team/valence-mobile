import { api, paraPagina } from './api';
import { ambiente } from '@/config/ambiente';
import type { DadosPropriedade, Pagina, PaginaSpring, Propriedade } from '@/types/api';

export async function listarPropriedades(
  pagina = 0,
  tamanho = ambiente.tamanhoPagina,
): Promise<Pagina<Propriedade>> {
  const { data } = await api.get<PaginaSpring<Propriedade>>('/api/propriedades', {
    params: { page: pagina, size: tamanho, sort: 'nome,asc' },
  });
  return paraPagina(data);
}

export async function listarTodasPropriedades(): Promise<Propriedade[]> {
  const pagina = await listarPropriedades(0, 100);
  return pagina.itens;
}

export async function obterPropriedade(id: number): Promise<Propriedade> {
  const { data } = await api.get<Propriedade>(`/api/propriedades/${id}`);
  return data;
}

export async function criarPropriedade(dados: DadosPropriedade): Promise<Propriedade> {
  const { data } = await api.post<Propriedade>('/api/propriedades', dados);
  return data;
}

export async function atualizarPropriedade(
  id: number,
  dados: DadosPropriedade,
): Promise<Propriedade> {
  const { data } = await api.put<Propriedade>(`/api/propriedades/${id}`, dados);
  return data;
}

export async function excluirPropriedade(id: number): Promise<void> {
  await api.delete(`/api/propriedades/${id}`);
}
