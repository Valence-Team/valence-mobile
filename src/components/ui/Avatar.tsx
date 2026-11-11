import { StyleSheet, Text, View } from 'react-native';

import { cores, fontes } from '@/theme';
import { obterIniciais } from '@/utils/formatadores';

interface AvatarProps {
  nome: string;
  tamanho?: number;
}

export function Avatar({ nome, tamanho = 40 }: AvatarProps) {
  return (
    <View
      style={[styles.avatar, { width: tamanho, height: tamanho, borderRadius: tamanho / 2 }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Text style={[styles.iniciais, { fontSize: Math.round(tamanho * 0.36) }]}>
        {obterIniciais(nome)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: cores.acaoSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iniciais: {
    fontFamily: fontes.seminegrito,
    color: cores.acao,
  },
});
