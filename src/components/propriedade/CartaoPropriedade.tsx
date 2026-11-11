import { StyleSheet, Text, View } from 'react-native';

import { Cartao, Etiqueta, Icone } from '@/components/ui';
import { cores, espacos, textos } from '@/theme';
import type { Propriedade } from '@/types/api';
import { formatarArea } from '@/utils/formatadores';
import { rotuloCultura } from '@/utils/rotulos';

interface CartaoPropriedadeProps {
  propriedade: Propriedade;
  onPress: () => void;
}

export function CartaoPropriedade({ propriedade, onPress }: CartaoPropriedadeProps) {
  const local = `${propriedade.municipio}/${propriedade.uf}`;
  const area = formatarArea(propriedade.areaHectares);

  return (
    <Cartao
      onPress={onPress}
      rotuloAcessivel={`Propriedade ${propriedade.nome}, ${local}. Toque para editar.`}
      estilo={styles.cartao}
    >
      <View style={styles.conteudo}>
        <Text style={styles.nome}>{propriedade.nome}</Text>
        <Text style={styles.local}>
          {local}
          {area ? ` · ${area}` : ''}
        </Text>
        <View style={styles.culturas}>
          {propriedade.culturas.map((cultura) => (
            <Etiqueta key={cultura} texto={rotuloCultura[cultura]} tom="sucesso" />
          ))}
        </View>
      </View>
      <Icone nome="chevron-right" tamanho={22} cor={cores.textoSuave} />
    </Cartao>
  );
}

const styles = StyleSheet.create({
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
  },
  conteudo: {
    flex: 1,
    gap: espacos.xxs,
  },
  nome: {
    ...textos.tituloCartao,
    color: cores.texto,
  },
  local: {
    ...textos.corpo,
    color: cores.textoSuave,
  },
  culturas: {
    flexDirection: 'row',
    gap: espacos.xs,
    flexWrap: 'wrap',
    marginTop: espacos.xxs,
  },
});
