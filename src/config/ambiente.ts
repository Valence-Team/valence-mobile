function semBarraFinal(url: string | undefined): string {
  return (url ?? '').trim().replace(/\/+$/, '');
}

export const ambiente = {
  apiUrl: semBarraFinal(process.env.EXPO_PUBLIC_API_URL),
  observatorioUrl: semBarraFinal(process.env.EXPO_PUBLIC_OBSERVATORIO_URL),
  raioAlertaKm: 10,
  tamanhoPagina: 10,
  tempoLimiteMs: 20000,
  tempoLimiteEnvioFotoMs: 60000,
  intervaloFilaOfflineMs: 30000,
};

export const apiConfigurada = ambiente.apiUrl.length > 0;
export const observatorioConfigurado = ambiente.observatorioUrl.length > 0;
