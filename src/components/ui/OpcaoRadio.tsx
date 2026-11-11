import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores, espacos, raios, textos } from '@/theme';

interface OpcaoRadioProps {
  titulo: string;
  descricao?: string;
  selecionado: boolean;
  onPress: () => void;
}

export function OpcaoRadio({ titulo, descricao, selecionado, onPress }: OpcaoRadioProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selecionado }}
      accessibilityLabel={descricao ? `${titulo}. ${descricao}` : titulo}
      style={({ pressed }) => [
        styles.opcao,
        selecionado ? styles.opcaoSelecionada : null,
        pressed && !selecionado ? styles.opcaoPressionada : null,
      ]}
    >
      <View style={[styles.radio, selecionado && styles.radioSelecionado]}>
        {selecionado ? <View style={styles.ponto} /> : null}
      </View>
      <View style={styles.textos}>
        <Text style={styles.titulo}>{titulo}</Text>
        {descricao ? <Text style={styles.descricao}>{descricao}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.md,
    padding: espacos.md,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.bordaCampo,
    backgroundColor: cores.superficie,
  },
  opcaoSelecionada: {
    borderColor: cores.acao,
    borderWidth: 1.5,
    backgroundColor: cores.acaoSuave,
  },
  opcaoPressionada: {
    backgroundColor: cores.fundo,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: cores.bordaCampo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelecionado: {
    borderColor: cores.acao,
  },
  ponto: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: cores.acao,
  },
  textos: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    ...textos.corpoForte,
    fontSize: 16,
    color: cores.texto,
  },
  descricao: {
    ...textos.apoio,
    color: cores.textoSuave,
  },
});
