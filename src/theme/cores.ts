export const cores = {
  marcaAzul: '#2F7DFF',
  marcaVerde: '#2BD37B',

  fundoEscuro: '#0A1018',
  fundoEscuroElevado: '#121B27',
  fundo: '#F5F7FA',
  superficie: '#FFFFFF',

  texto: '#111A24',
  textoSuave: '#4A5868',
  textoApoio: '#6B7889',
  textoSobreEscuro: '#EEF3FA',
  textoSobreEscuroSuave: '#A9B6C6',
  textoSobreAcao: '#FFFFFF',

  borda: '#E1E7EF',
  bordaCampo: '#7E8B9C',
  bordaSobreEscuro: '#223044',

  acao: '#1F5FD6',
  acaoPressionada: '#1A50B5',
  acaoSuave: '#E8F0FD',
  acaoBorda: '#B9CEF5',

  erro: '#C62828',
  erroTexto: '#8A1C1C',
  erroFundo: '#FDECEC',
  erroBorda: '#E5A3A3',

  sucesso: '#12804A',
  sucessoTexto: '#0F5E36',
  sucessoFundo: '#E7F7EE',
  sucessoBorda: '#9FD9B8',

  aviso: '#B26A00',
  avisoTexto: '#7A4E00',
  avisoFundo: '#FFF4DB',
  avisoBorda: '#F2C96B',

  neutroFundo: '#EEF1F5',
  neutroTexto: '#4A5868',

  severidadeAtiva: '#C62828',
  severidadeInativa: '#D5DCE5',

  sobreposicao: 'rgba(10, 16, 24, 0.55)',
};

export type NomeCor = keyof typeof cores;
