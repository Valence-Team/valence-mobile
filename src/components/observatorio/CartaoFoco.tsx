import { StyleSheet, Text, View } from 'react-native';

import { BarraSeveridade, Cartao, Etiqueta, Icone } from '@/components/ui';
import { cores, espacos, textos } from '@/theme';
import type { Foco } from '@/types/api';
import { formatarDataCurta } from '@/utils/formatadores';
import { rotuloCultura, rotuloStatusFoco, tomStatusFoco } from '@/utils/rotulos';

export function CartaoFoco({ foco }: { foco: Foco }) {
  return (
    <Cartao estilo={styles.cartao}>
      <View style={styles.topo}>
        <BarraSeveridade valor={foco.severidade} mostrarTexto={false} />
        <Etiqueta texto={rotuloStatusFoco[foco.status]} tom={tomStatusFoco[foco.status]} />
      </View>
      <Text style={styles.titulo}>{foco.pragaProvavel ?? 'Praga não informada'}</Text>
      <View style={styles.meta}>
        <Icone nome="map-pin" tamanho={16} cor={cores.textoSuave} />
        <Text style={styles.textoMeta}>
          {rotuloCultura[foco.cultura]} · {foco.municipio}/{foco.uf} ·{' '}
          {formatarDataCurta(foco.dataOcorrencia)}
        </Text>
      </View>
    </Cartao>
  );
}

const styles = StyleSheet.create({
  cartao: {
    gap: espacos.xs,
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titulo: {
    ...textos.tituloCartao,
    color: cores.texto,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.xs,
  },
  textoMeta: {
    ...textos.apoio,
    color: cores.textoSuave,
    flex: 1,
  },
});
