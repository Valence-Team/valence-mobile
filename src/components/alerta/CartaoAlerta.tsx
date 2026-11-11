import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Cartao, Etiqueta, Icone } from '@/components/ui';
import { cores, espacos, textos } from '@/theme';
import type { Alerta } from '@/types/api';
import { formatarDistancia, formatarTempoRelativo } from '@/utils/formatadores';
import { rotuloCultura, rotuloNivelAlerta, tomNivelAlerta } from '@/utils/rotulos';

interface CartaoAlertaProps {
  alerta: Alerta;
  marcando: boolean;
  aoMarcarComoLido: (alerta: Alerta) => void;
}

export function CartaoAlerta({ alerta, marcando, aoMarcarComoLido }: CartaoAlertaProps) {
  const titulo = alerta.pragaProvavel ?? 'Possível praga na região';
  const meta = `${formatarDistancia(alerta.distanciaKm)} · ${rotuloCultura[alerta.cultura]}`;

  return (
    <Cartao estilo={styles.cartao}>
      <View style={styles.topo}>
        <Etiqueta texto={rotuloNivelAlerta[alerta.nivel]} tom={tomNivelAlerta[alerta.nivel]} />
        <Text style={styles.tempo}>{formatarTempoRelativo(alerta.criadoEm)}</Text>
      </View>
      <Text style={styles.titulo}>{titulo}</Text>
      <View style={styles.meta}>
        <Icone nome="map-pin" tamanho={16} cor={cores.textoSuave} />
        <Text style={styles.textoMeta}>
          {meta}
          {alerta.propriedadeNome ? ` · perto de ${alerta.propriedadeNome}` : ''}
        </Text>
      </View>
      {alerta.textoAlerta ? <Text style={styles.texto}>{alerta.textoAlerta}</Text> : null}
      {alerta.lido ? null : (
        <Pressable
          onPress={() => aoMarcarComoLido(alerta)}
          disabled={marcando}
          accessibilityRole="button"
          accessibilityLabel={`Marcar alerta de ${titulo} como lido`}
          style={({ pressed }) => [styles.acao, pressed && styles.acaoPressionada]}
        >
          {marcando ? (
            <ActivityIndicator size="small" color={cores.acao} />
          ) : (
            <Icone nome="check" tamanho={18} cor={cores.acao} />
          )}
          <Text style={styles.textoAcao}>Marcar como lido</Text>
        </Pressable>
      )}
    </Cartao>
  );
}

const styles = StyleSheet.create({
  cartao: {
    gap: espacos.sm,
    padding: espacos.lg,
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tempo: {
    ...textos.apoio,
    color: cores.textoSuave,
  },
  titulo: {
    ...textos.tituloCartao,
    fontSize: 18,
    color: cores.texto,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.xs,
  },
  textoMeta: {
    ...textos.corpo,
    color: cores.textoSuave,
    flex: 1,
  },
  texto: {
    ...textos.corpoGrande,
    color: cores.texto,
  },
  acao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.xs,
    alignSelf: 'flex-start',
    minHeight: 44,
    paddingHorizontal: espacos.xs,
    marginLeft: -espacos.xs,
    borderRadius: 8,
  },
  acaoPressionada: {
    backgroundColor: cores.acaoSuave,
  },
  textoAcao: {
    ...textos.botao,
    color: cores.acao,
  },
});
