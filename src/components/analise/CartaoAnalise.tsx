import { StyleSheet, Text, View } from 'react-native';

import { BarraSeveridade, Cartao, Etiqueta, Icone } from '@/components/ui';
import { tituloDaOcorrencia } from '@/services/ocorrencias';
import { cores, espacos, textos } from '@/theme';
import type { Ocorrencia } from '@/types/api';
import { formatarPercentual, formatarTempoRelativo } from '@/utils/formatadores';
import {
  mensagemMotivoImagem,
  rotuloCultura,
  rotuloStatusOcorrencia,
  tomStatusOcorrencia,
} from '@/utils/rotulos';

interface CartaoAnaliseProps {
  ocorrencia: Ocorrencia;
  onPress: () => void;
}

function resumoDaTriagem(ocorrencia: Ocorrencia): string {
  const triagem = ocorrencia.triagem;
  if (triagem?.motivoImagem) {
    return `${mensagemMotivoImagem[triagem.motivoImagem]} Analise pela descrição.`;
  }
  if (typeof triagem?.confianca === 'number') {
    return `Confiança da IA: ${formatarPercentual(triagem.confianca)}`;
  }
  return 'Sem triagem automática. Analise pela descrição.';
}

export function CartaoAnalise({ ocorrencia, onPress }: CartaoAnaliseProps) {
  const titulo = tituloDaOcorrencia(ocorrencia);
  const severidade = ocorrencia.severidade ?? ocorrencia.triagem?.severidade;
  const local = `${rotuloCultura[ocorrencia.cultura]} · ${ocorrencia.propriedade.municipio}/${ocorrencia.propriedade.uf} · ${formatarTempoRelativo(ocorrencia.dataRegistro)}`;

  return (
    <Cartao onPress={onPress} rotuloAcessivel={`${titulo}. ${local}`} estilo={styles.cartao}>
      <View style={styles.topo}>
        <BarraSeveridade valor={severidade} />
        <Etiqueta
          texto={rotuloStatusOcorrencia[ocorrencia.status]}
          tom={tomStatusOcorrencia[ocorrencia.status]}
        />
      </View>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.resumo}>{resumoDaTriagem(ocorrencia)}</Text>
      <View style={styles.meta}>
        <Icone nome="map-pin" tamanho={16} cor={cores.textoSuave} />
        <Text style={styles.textoMeta}>{local}</Text>
      </View>
    </Cartao>
  );
}

const styles = StyleSheet.create({
  cartao: {
    gap: espacos.xs,
    padding: espacos.lg,
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espacos.sm,
    marginBottom: espacos.xxs,
  },
  titulo: {
    ...textos.tituloCartao,
    fontSize: 18,
    color: cores.texto,
  },
  resumo: {
    ...textos.corpo,
    color: cores.textoSuave,
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
});
