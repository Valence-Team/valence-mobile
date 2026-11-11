import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { alturas, cores, espacos, margemTela, raios, textos } from '@/theme';

interface ChipProps {
  rotulo: string;
  selecionado: boolean;
  onPress: () => void;
  estilo?: StyleProp<ViewStyle>;
}

export function Chip({ rotulo, selecionado, onPress, estilo }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      accessibilityState={{ selected: selecionado }}
      style={({ pressed }) => [
        styles.chip,
        selecionado ? styles.chipSelecionado : styles.chipNormal,
        pressed && !selecionado && styles.chipPressionado,
        estilo,
      ]}
    >
      <Text style={[styles.texto, selecionado && styles.textoSelecionado]} numberOfLines={1}>
        {rotulo}
      </Text>
    </Pressable>
  );
}

export interface OpcaoFiltro<T extends string> {
  valor: T;
  rotulo: string;
}

interface FiltroChipsProps<T extends string> {
  opcoes: OpcaoFiltro<T>[];
  selecionado: T;
  aoSelecionar: (valor: T) => void;
  estilo?: StyleProp<ViewStyle>;
}

export function FiltroChips<T extends string>({
  opcoes,
  selecionado,
  aoSelecionar,
  estilo,
}: FiltroChipsProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filtros}
      style={estilo}
    >
      {opcoes.map((opcao) => (
        <Chip
          key={opcao.valor}
          rotulo={opcao.rotulo}
          selecionado={opcao.valor === selecionado}
          onPress={() => aoSelecionar(opcao.valor)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: alturas.chip,
    paddingHorizontal: espacos.lg,
    borderRadius: raios.pilula,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipNormal: {
    backgroundColor: cores.superficie,
    borderColor: cores.bordaCampo,
  },
  chipSelecionado: {
    backgroundColor: cores.acao,
    borderColor: cores.acao,
  },
  chipPressionado: {
    backgroundColor: cores.acaoSuave,
  },
  texto: {
    ...textos.rotulo,
    fontSize: 15,
    color: cores.texto,
  },
  textoSelecionado: {
    color: cores.textoSobreAcao,
  },
  filtros: {
    paddingHorizontal: margemTela,
    gap: espacos.xs,
  },
});
