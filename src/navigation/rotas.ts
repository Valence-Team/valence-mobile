import type { Papel } from '@/types/dominio';

export const rotas = {
  login: '/login',
  cadastro: '/cadastro',
  inicio: '/inicio',
  ocorrencias: '/ocorrencias',
  analises: '/analises',
  moderacao: '/moderacao',
  mural: '/mural',
  perfil: '/perfil',
  novaOcorrencia: '/ocorrencia/nova',
  novaPropriedade: '/propriedade/nova',
  editarPerfil: '/editar-perfil',
  observatorio: '/observatorio',
  sobre: '/sobre',
  ocorrencia: (id: number) => `/ocorrencia/${id}`,
  editarOcorrencia: (id: number) => `/ocorrencia/${id}/editar`,
  emitirLaudo: (id: number) => `/ocorrencia/${id}/laudo`,
  publicacao: (id: number) => `/publicacao/${id}`,
  editarPublicacao: (id: number) => `/publicacao/${id}/editar`,
  denunciarPublicacao: (id: number) => `/publicacao/${id}/denunciar`,
  propriedade: (id: number) => `/propriedade/${id}`,
} as const;

export function rotaInicialDoPapel(papel: Papel): string {
  switch (papel) {
    case 'AGRONOMO':
      return rotas.analises;
    case 'GESTOR':
      return rotas.moderacao;
    default:
      return rotas.inicio;
  }
}
