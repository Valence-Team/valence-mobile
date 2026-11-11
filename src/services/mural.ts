import { api, paraPagina } from './api';
import { ambiente } from '@/config/ambiente';
import type {
  Comentario,
  DadosPublicacao,
  Pagina,
  PaginaSpring,
  Publicacao,
} from '@/types/api';

const publicacoesEmCache = new Map<number, Publicacao>();

export function guardarPublicacaoEmCache(publicacao: Publicacao): void {
  publicacoesEmCache.set(publicacao.id, publicacao);
}

export function publicacaoEmCache(id: number): Publicacao | undefined {
  return publicacoesEmCache.get(id);
}

export async function listarPublicacoes(
  municipio: string,
  uf: string,
  pagina = 0,
): Promise<Pagina<Publicacao>> {
  const { data } = await api.get<PaginaSpring<Publicacao>>('/api/mural', {
    params: { municipio, uf, page: pagina, size: ambiente.tamanhoPagina, sort: 'criadoEm,desc' },
  });
  const resultado = paraPagina(data);
  resultado.itens.forEach(guardarPublicacaoEmCache);
  return resultado;
}

export async function obterPublicacao(id: number): Promise<Publicacao> {
  const { data } = await api.get<Publicacao>(`/api/mural/${id}`);
  guardarPublicacaoEmCache(data);
  return data;
}

export async function criarPublicacao(dados: DadosPublicacao): Promise<Publicacao> {
  const { data } = await api.post<Publicacao>('/api/mural', dados);
  guardarPublicacaoEmCache(data);
  return data;
}

export async function atualizarPublicacao(id: number, texto: string): Promise<Publicacao> {
  const { data } = await api.put<Publicacao>(`/api/mural/${id}`, { texto });
  guardarPublicacaoEmCache(data);
  return data;
}

export async function excluirPublicacao(id: number): Promise<void> {
  await api.delete(`/api/mural/${id}`);
  publicacoesEmCache.delete(id);
}

export async function listarComentarios(
  publicacaoId: number,
  pagina = 0,
): Promise<Pagina<Comentario>> {
  const { data } = await api.get<PaginaSpring<Comentario>>(
    `/api/mural/${publicacaoId}/comentarios`,
    { params: { page: pagina, size: 20, sort: 'criadoEm,asc' } },
  );
  return paraPagina(data);
}

export async function comentar(publicacaoId: number, texto: string): Promise<Comentario> {
  const { data } = await api.post<Comentario>(`/api/mural/${publicacaoId}/comentarios`, {
    texto,
  });
  return data;
}

export async function denunciarPublicacao(publicacaoId: number, motivo: string): Promise<void> {
  await api.post(`/api/mural/${publicacaoId}/denuncias`, { motivo });
}
