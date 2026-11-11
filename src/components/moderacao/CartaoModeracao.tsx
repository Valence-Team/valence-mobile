import { StyleSheet, Text, View } from 'react-native';

import { Botao, Cartao, Etiqueta } from '@/components/ui';
import { cores, espacos, raios, textos } from '@/theme';
import type { ItemModeracao } from '@/types/api';
import type { DecisaoModeracao } from '@/types/dominio';
import { formatarTempoRelativo } from '@/utils/formatadores';
import { rotuloCategoriaDenuncia, rotuloGravidade, tomGravidade } from '@/utils/rotulos';

interface CartaoModeracaoProps {
  item: ItemModeracao;
  decidindo: DecisaoModeracao | null;
  aoDecidir: (item: ItemModeracao, decisao: DecisaoModeracao) => void;
}

export function CartaoModeracao({ item, decidindo, aoDecidir }: CartaoModeracaoProps) {
  const totalDenuncias = item.totalDenuncias === 1 ? '1 denúncia' : `${item.totalDenuncias} denúncias`;
  const situacao = item.status === 'OCULTO' ? 'oculto até a decisão' : 'visível no mural';
  const categoria = item.categoriaIa ? rotuloCategoriaDenuncia[item.categoriaIa] : 'Aguardando análise';

  return (
    <Cartao estilo={styles.cartao}>
      <View style={styles.etiquetas}>
        {item.gravidadeIa ? (
          <Etiqueta texto={rotuloGravidade[item.gravidadeIa]} tom={tomGravidade[item.gravidadeIa]} />
        ) : null}
        <Etiqueta texto={totalDenuncias} tom="neutro" />
      </View>

      <View style={styles.citacao}>
        <Text style={styles.textoPublicacao}>{item.texto}</Text>
        <Text style={styles.metaPublicacao}>
          Publicado por {item.autorNome} · {formatarTempoRelativo(item.criadoEm)} · {situacao}
        </Text>
      </View>

      <Text style={styles.analise}>Análise da IA: {categoria}</Text>
      {item.justificativaIa ? <Text style={styles.justificativa}>{item.justificativaIa}</Text> : null}

      <View style={styles.botoes}>
        <Botao
          titulo="Manter"
          variante="contorno"
          onPress={() => aoDecidir(item, 'MANTER')}
          carregando={decidindo === 'MANTER'}
          desabilitado={decidindo !== null}
          estilo={styles.botao}
          rotuloAcessivel="Manter publicação no mural"
        />
        <Botao
          titulo="Remover"
          variante="perigo"
          onPress={() => aoDecidir(item, 'REMOVER')}
          carregando={decidindo === 'REMOVER'}
          desabilitado={decidindo !== null}
          estilo={styles.botao}
          rotuloAcessivel="Remover publicação do mural"
        />
      </View>
    </Cartao>
  );
}

const styles = StyleSheet.create({
  cartao: {
    gap: espacos.md,
    padding: espacos.lg,
  },
  etiquetas: {
    flexDirection: 'row',
    gap: espacos.xs,
    flexWrap: 'wrap',
  },
  citacao: {
    backgroundColor: cores.fundo,
    borderRadius: raios.md,
    padding: espacos.md,
    gap: espacos.xs,
  },
  textoPublicacao: {
    ...textos.corpoGrande,
    color: cores.texto,
  },
  metaPublicacao: {
    ...textos.legenda,
    color: cores.textoApoio,
  },
  analise: {
    ...textos.corpoForte,
    color: cores.texto,
  },
  justificativa: {
    ...textos.corpo,
    color: cores.textoSuave,
    marginTop: -espacos.xs,
  },
  botoes: {
    flexDirection: 'row',
    gap: espacos.sm,
  },
  botao: {
    flex: 1,
  },
});
