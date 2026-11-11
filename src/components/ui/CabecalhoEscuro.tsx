import { Image, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useEstiloBarraDeStatus } from '@/hooks/useEstiloBarraDeStatus';
import { cores, espacos, imagens, margemTela, raios, textos } from '@/theme';

interface CabecalhoEscuroProps {
  titulo?: string;
  subtitulo?: string;
  children?: ReactNode;
}

export function CabecalhoEscuro({ titulo, subtitulo, children }: CabecalhoEscuroProps) {
  const insets = useSafeAreaInsets();
  useEstiloBarraDeStatus('light');

  return (
    <View style={[styles.cabecalho, { paddingTop: insets.top + espacos.xxl }]}>
      <Image
        source={imagens.simbolo}
        style={styles.simboloFundo}
        resizeMode="contain"
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
      {titulo ? (
        <Text style={styles.titulo} accessibilityRole="header">
          {titulo}
        </Text>
      ) : null}
      {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  cabecalho: {
    backgroundColor: cores.fundoEscuro,
    borderBottomLeftRadius: raios.xl,
    borderBottomRightRadius: raios.xl,
    paddingHorizontal: margemTela,
    paddingBottom: espacos.xl,
    gap: espacos.xs,
    overflow: 'hidden',
  },
  simboloFundo: {
    position: 'absolute',
    right: -56,
    top: 8,
    width: 210,
    height: 239,
    opacity: 0.08,
  },
  titulo: {
    ...textos.destaque,
    color: cores.textoSobreEscuro,
  },
  subtitulo: {
    ...textos.corpoGrande,
    color: cores.textoSobreEscuroSuave,
  },
});
