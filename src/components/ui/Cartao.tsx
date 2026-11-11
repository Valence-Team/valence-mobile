import { Pressable, StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { cores, espacos, raios } from '@/theme';

interface CartaoProps {
  children: ReactNode;
  onPress?: () => void;
  rotuloAcessivel?: string;
  corBorda?: string;
  estilo?: StyleProp<ViewStyle>;
}

export function Cartao({ children, onPress, rotuloAcessivel, corBorda, estilo }: CartaoProps) {
  const estiloBase = [styles.cartao, corBorda ? { borderColor: corBorda } : null, estilo];

  if (!onPress) {
    return <View style={estiloBase}>{children}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={rotuloAcessivel}
      style={({ pressed }) => [...estiloBase, pressed && styles.pressionado]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacos.md,
  },
  pressionado: {
    backgroundColor: cores.fundo,
  },
});
