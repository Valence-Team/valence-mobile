import { StyleSheet, Text, View } from 'react-native';

import { Cartao, Etiqueta, Icone } from '@/components/ui';
import { cores, espacos, textos } from '@/theme';
import type { Laudo } from '@/types/api';
import { formatarDataHora } from '@/utils/formatadores';
import { rotuloDecisaoLaudo, tomDecisaoLaudo } from '@/utils/rotulos';

interface CartaoLaudoProps {
  laudo?: Laudo | null;
}

export function CartaoLaudo({ laudo }: CartaoLaudoProps) {
  if (!laudo) {
    return (
      <Cartao estilo={styles.cartao}>
        <Text style={styles.titulo}>Laudo do agrônomo</Text>
        <View style={styles.aguardando}>
          <Icone nome="clock" tamanho={20} cor={cores.aviso} />
          <Text style={styles.textoAguardando}>Aguardando análise</Text>
        </View>
        <Text style={styles.texto}>
          Um agrônomo da região vai analisar o caso. O resultado aparece aqui e nos alertas dos
          vizinhos.
        </Text>
      </Cartao>
    );
  }

  const assinatura = [
    `Emitido em ${formatarDataHora(laudo.emitidoEm)}`,
    laudo.agronomoNome ? `por ${laudo.agronomoNome}` : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Cartao estilo={styles.cartao}>
      <View style={styles.topo}>
        <Text style={styles.titulo}>Laudo do agrônomo</Text>
        <Etiqueta texto={rotuloDecisaoLaudo[laudo.decisao]} tom={tomDecisaoLaudo[laudo.decisao]} />
      </View>
      {laudo.pragaConfirmada ? (
        <View style={styles.campo}>
          <Text style={styles.rotulo}>Praga confirmada</Text>
          <Text style={styles.valorForte}>{laudo.pragaConfirmada}</Text>
        </View>
      ) : null}
      <View style={styles.campo}>
        <Text style={styles.rotulo}>Parecer técnico</Text>
        <Text style={styles.valor}>{laudo.parecer}</Text>
      </View>
      <Text style={styles.assinatura}>{assinatura}</Text>
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
    gap: espacos.sm,
    flexWrap: 'wrap',
  },
  titulo: {
    ...textos.tituloSecao,
    color: cores.texto,
  },
  aguardando: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.xs,
  },
  textoAguardando: {
    ...textos.corpoForte,
    fontSize: 16,
    color: cores.avisoTexto,
  },
  texto: {
    ...textos.corpo,
    color: cores.textoSuave,
  },
  campo: {
    gap: 2,
  },
  rotulo: {
    ...textos.legenda,
    color: cores.textoSuave,
  },
  valor: {
    ...textos.corpoGrande,
    color: cores.texto,
  },
  valorForte: {
    ...textos.corpoForte,
    fontSize: 16,
    color: cores.texto,
  },
  assinatura: {
    ...textos.legenda,
    color: cores.textoApoio,
  },
});
