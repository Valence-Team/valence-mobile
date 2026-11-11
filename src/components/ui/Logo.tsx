import { Image } from 'react-native';

import { imagens } from '@/theme';

interface LogoProps {
  variante?: 'claro' | 'escuro';
  altura?: number;
}

const PROPORCAO = 155 / 39;

export function Logo({ variante = 'claro', altura = 39 }: LogoProps) {
  return (
    <Image
      source={variante === 'claro' ? imagens.logoClaro : imagens.logoEscuro}
      style={{ height: altura, width: altura * PROPORCAO }}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel="Valence"
    />
  );
}
