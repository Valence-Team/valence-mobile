import type { TextStyle } from 'react-native';

export const fontes = {
  titulo: 'Sora-SemiBold',
  regular: 'Inter-Regular',
  medio: 'Inter-Medium',
  seminegrito: 'Inter-SemiBold',
};

export const arquivosDeFonte = {
  [fontes.titulo]: require('../../assets/fonts/Sora-SemiBold.ttf'),
  [fontes.regular]: require('../../assets/fonts/Inter-Regular.ttf'),
  [fontes.medio]: require('../../assets/fonts/Inter-Medium.ttf'),
  [fontes.seminegrito]: require('../../assets/fonts/Inter-SemiBold.ttf'),
};

export const textos = {
  destaque: { fontFamily: fontes.titulo, fontSize: 28, lineHeight: 34, letterSpacing: -0.5 },
  tituloTela: { fontFamily: fontes.titulo, fontSize: 24, lineHeight: 30, letterSpacing: -0.4 },
  tituloSecao: { fontFamily: fontes.titulo, fontSize: 19, lineHeight: 26, letterSpacing: -0.2 },
  tituloBarra: { fontFamily: fontes.titulo, fontSize: 18, lineHeight: 24 },
  tituloCartao: { fontFamily: fontes.seminegrito, fontSize: 17, lineHeight: 24 },
  corpoForte: { fontFamily: fontes.seminegrito, fontSize: 15, lineHeight: 22 },
  corpo: { fontFamily: fontes.regular, fontSize: 15, lineHeight: 22 },
  corpoGrande: { fontFamily: fontes.regular, fontSize: 16, lineHeight: 24 },
  rotulo: { fontFamily: fontes.medio, fontSize: 14, lineHeight: 20 },
  apoio: { fontFamily: fontes.regular, fontSize: 14, lineHeight: 20 },
  legenda: { fontFamily: fontes.regular, fontSize: 13, lineHeight: 18 },
  etiqueta: { fontFamily: fontes.seminegrito, fontSize: 12, lineHeight: 16 },
  botao: { fontFamily: fontes.seminegrito, fontSize: 16, lineHeight: 22 },
  link: { fontFamily: fontes.seminegrito, fontSize: 14, lineHeight: 20 },
} satisfies Record<string, TextStyle>;
