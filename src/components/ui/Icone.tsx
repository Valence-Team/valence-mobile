import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';

import { cores } from '@/theme';

export type NomeIcone = ComponentProps<typeof Feather>['name'];

interface IconeProps {
  nome: NomeIcone;
  tamanho?: number;
  cor?: string;
}

export function Icone({ nome, tamanho = 20, cor = cores.texto }: IconeProps) {
  return <Feather name={nome} size={tamanho} color={cor} accessibilityElementsHidden />;
}
