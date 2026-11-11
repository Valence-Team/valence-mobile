import { api, paraPagina } from './api';
import { ambiente } from '@/config/ambiente';
import type { ItemModeracao, Pagina, PaginaSpring } from '@/types/api';
import type { DecisaoModeracao } from '@/types/dominio';

export async function listarFilaDeModeracao(pagina = 0): Promise<Pagina<ItemModeracao>> {
  const { data } = await api.get<PaginaSpring<ItemModeracao>>('/api/moderacao', {
    params: { page: pagina, size: ambiente.tamanhoPagina },
  });
  return paraPagina(data);
}

export async function decidirModeracao(
  publicacaoId: number,
  decisao: DecisaoModeracao,
): Promise<void> {
  await api.patch(`/api/moderacao/${publicacaoId}`, { decisao });
}
