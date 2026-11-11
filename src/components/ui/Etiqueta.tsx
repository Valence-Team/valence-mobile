import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { cores, espacos, raios, textos } from '@/theme';
import type { TomEtiqueta } from '@/utils/rotulos';

const paletas: Record<TomEtiqueta, { fundo: string; texto: string }> = {
  info: { fundo: cores.acaoSuave, texto: cores.acao },
  aviso: { fundo: cores.avisoFundo, texto: cores.avisoTexto },
  perigo: { fundo: cores.erroFundo, texto: cores.erroTexto },
  sucesso: { fundo: cores.sucessoFundo, texto: cores.sucessoTexto },
  neutro: { fundo: cores.neutroFundo, texto: cores.neutroTexto },
};

interface EtiquetaProps {
  texto: string;
  tom?: TomEtiqueta;
  estilo?: StyleProp<ViewStyle>;
}

export function Etiqueta({ texto, tom = 'neutro', estilo }: EtiquetaProps) {
  const paleta = paletas[tom];
  return (
    <View style={[styles.etiqueta, { backgroundColor: paleta.fundo }, estilo]}>
      <Text style={[styles.texto, { color: paleta.texto }]} numberOfLines={1}>
        {texto}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  etiqueta: {
    alignSelf: 'flex-start',
    borderRadius: raios.pilula,
    paddingHorizontal: espacos.sm,
    paddingVertical: espacos.xxs,
  },
  texto: {
    ...textos.etiqueta,
    fontSize: 13,
  },
});
