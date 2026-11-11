import type { ViewStyle } from 'react-native';

export const espacos = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const margemTela = 20;

export const raios = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pilula: 999,
};

export const alturas = {
  campo: 52,
  botao: 52,
  botaoPequeno: 44,
  chip: 40,
  toque: 44,
};

export const sombras = {
  cartao: {
    shadowColor: '#0A1018',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  flutuante: {
    shadowColor: '#1F5FD6',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
} satisfies Record<string, ViewStyle>;
