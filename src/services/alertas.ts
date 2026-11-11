import { api, paraPagina } from './api';
import { ambiente } from '@/config/ambiente';
import type { Alerta, Pagina, PaginaSpring } from '@/types/api';

export async function listarAlertas(pagina = 0): Promise<Pagina<Alerta>> {
  const { data } = await api.get<PaginaSpring<Alerta>>('/api/alertas', {
    params: { page: pagina, size: ambiente.tamanhoPagina, sort: 'criadoEm,desc' },
  });
  return paraPagina(data);
}

export async function marcarAlertaComoLido(id: number): Promise<void> {
  await api.patch(`/api/alertas/${id}/lido`);
}
