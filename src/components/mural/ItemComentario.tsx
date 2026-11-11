import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui';
import { cores, espacos, textos } from '@/theme';
import type { Comentario } from '@/types/api';
import { formatarTempoRelativo } from '@/utils/formatadores';

export function ItemComentario({ comentario }: { comentario: Comentario }) {
  return (
    <View style={styles.item}>
      <Avatar nome={comentario.autor.nome} tamanho={36} />
      <View style={styles.conteudo}>
        <View style={styles.linha}>
          <Text style={styles.nome} numberOfLines={1}>
            {comentario.autor.nome}
          </Text>
          <Text style={styles.tempo}>{formatarTempoRelativo(comentario.criadoEm)}</Text>
        </View>
        <Text style={styles.texto}>{comentario.texto}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    gap: espacos.sm,
    paddingVertical: espacos.sm,
  },
  conteudo: {
    flex: 1,
    gap: 2,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.xs,
  },
  nome: {
    ...textos.corpoForte,
    fontSize: 14,
    color: cores.texto,
    flexShrink: 1,
  },
  tempo: {
    ...textos.legenda,
    color: cores.textoApoio,
  },
  texto: {
    ...textos.corpo,
    color: cores.texto,
  },
});
