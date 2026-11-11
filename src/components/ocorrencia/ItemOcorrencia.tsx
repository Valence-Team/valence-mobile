import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Etiqueta, Icone } from '@/components/ui';
import { cores, espacos, raios, textos } from '@/theme';
import type { TomEtiqueta } from '@/utils/rotulos';

interface ItemOcorrenciaProps {
  titulo: string;
  subtitulo: string;
  etiqueta: { texto: string; tom: TomEtiqueta };
  data: string;
  onPress?: () => void;
}

export function ItemOcorrencia({ titulo, subtitulo, etiqueta, data, onPress }: ItemOcorrenciaProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${titulo}. ${subtitulo}. ${etiqueta.texto}. ${data}`}
      style={({ pressed }) => [styles.cartao, pressed && styles.pressionado]}
    >
      <View style={styles.icone}>
        <MaterialCommunityIcons name="leaf" size={24} color={cores.sucesso} />
      </View>
      <View style={styles.conteudo}>
        <Text style={styles.titulo} numberOfLines={2}>
          {titulo}
        </Text>
        <Text style={styles.subtitulo} numberOfLines={1}>
          {subtitulo}
        </Text>
        <View style={styles.linha}>
          <Etiqueta texto={etiqueta.texto} tom={etiqueta.tom} />
          <Text style={styles.data}>{data}</Text>
        </View>
      </View>
      {onPress ? <Icone nome="chevron-right" tamanho={22} cor={cores.textoSuave} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.md,
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacos.md,
  },
  pressionado: {
    backgroundColor: cores.fundo,
  },
  icone: {
    width: 48,
    height: 48,
    borderRadius: raios.md,
    backgroundColor: cores.sucessoFundo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conteudo: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    ...textos.tituloCartao,
    color: cores.texto,
  },
  subtitulo: {
    ...textos.corpo,
    color: cores.textoSuave,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.xs,
    marginTop: espacos.xxs,
  },
  data: {
    ...textos.apoio,
    color: cores.textoSuave,
  },
});
