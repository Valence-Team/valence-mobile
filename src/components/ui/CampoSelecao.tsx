import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icone, type NomeIcone } from './Icone';
import { alturas, cores, espacos, raios, textos } from '@/theme';

export interface OpcaoSelecao {
  valor: string;
  rotulo: string;
  descricao?: string;
}

interface CampoSelecaoProps {
  rotulo: string;
  valor: string | null;
  opcoes: OpcaoSelecao[];
  aoSelecionar: (valor: string) => void;
  placeholder?: string;
  icone?: NomeIcone;
  erro?: string;
  tituloLista?: string;
  vazio?: string;
  estilo?: StyleProp<ViewStyle>;
}

export function CampoSelecao({
  rotulo,
  valor,
  opcoes,
  aoSelecionar,
  placeholder = 'Selecione',
  icone,
  erro,
  tituloLista,
  vazio = 'Nenhuma opção disponível.',
  estilo,
}: CampoSelecaoProps) {
  const [aberto, setAberto] = useState(false);
  const insets = useSafeAreaInsets();
  const selecionada = opcoes.find((opcao) => opcao.valor === valor);

  return (
    <View style={[styles.container, estilo]}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <Pressable
        onPress={() => setAberto(true)}
        accessibilityRole="button"
        accessibilityLabel={`${rotulo}: ${selecionada?.rotulo ?? placeholder}`}
        accessibilityHint="Abre a lista de opções"
        style={[styles.caixa, { borderColor: erro ? cores.erro : cores.bordaCampo }]}
      >
        {icone ? <Icone nome={icone} tamanho={20} cor={cores.textoApoio} /> : null}
        <Text
          style={[styles.valor, !selecionada && styles.placeholder]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {selecionada?.rotulo ?? placeholder}
        </Text>
        <Icone nome="chevron-down" tamanho={20} cor={cores.textoSuave} />
      </Pressable>
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      <Modal
        visible={aberto}
        transparent
        animationType="slide"
        onRequestClose={() => setAberto(false)}
      >
        <View style={styles.sobreposicao}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setAberto(false)}
            accessibilityRole="button"
            accessibilityLabel="Fechar lista"
          />
          <View style={[styles.folha, { paddingBottom: insets.bottom + espacos.md }]}>
            <View style={styles.alca} />
            <Text style={styles.tituloFolha}>{tituloLista ?? rotulo}</Text>
            <FlatList
              data={opcoes}
              keyExtractor={(item) => item.valor}
              ListEmptyComponent={<Text style={styles.vazio}>{vazio}</Text>}
              renderItem={({ item }) => {
                const marcada = item.valor === valor;
                return (
                  <Pressable
                    onPress={() => {
                      aoSelecionar(item.valor);
                      setAberto(false);
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: marcada }}
                    style={({ pressed }) => [
                      styles.opcao,
                      marcada && styles.opcaoMarcada,
                      pressed && styles.opcaoPressionada,
                    ]}
                  >
                    <View style={styles.textosOpcao}>
                      <Text style={styles.rotuloOpcao}>{item.rotulo}</Text>
                      {item.descricao ? (
                        <Text style={styles.descricaoOpcao}>{item.descricao}</Text>
                      ) : null}
                    </View>
                    {marcada ? <Icone nome="check" tamanho={20} cor={cores.acao} /> : null}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: espacos.xs,
  },
  rotulo: {
    ...textos.rotulo,
    color: cores.texto,
  },
  caixa: {
    minHeight: alturas.campo,
    borderRadius: raios.md,
    borderWidth: 1,
    backgroundColor: cores.superficie,
    paddingHorizontal: espacos.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
  },
  valor: {
    ...textos.corpoGrande,
    color: cores.texto,
    flex: 1,
  },
  placeholder: {
    color: cores.textoApoio,
  },
  erro: {
    ...textos.legenda,
    color: cores.erro,
  },
  sobreposicao: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: cores.sobreposicao,
  },
  folha: {
    maxHeight: '75%',
    backgroundColor: cores.superficie,
    borderTopLeftRadius: raios.xl,
    borderTopRightRadius: raios.xl,
    paddingHorizontal: espacos.lg,
    paddingTop: espacos.sm,
  },
  alca: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: cores.borda,
    marginBottom: espacos.md,
  },
  tituloFolha: {
    ...textos.tituloSecao,
    color: cores.texto,
    marginBottom: espacos.sm,
  },
  vazio: {
    ...textos.corpo,
    color: cores.textoSuave,
    paddingVertical: espacos.lg,
  },
  opcao: {
    minHeight: alturas.toque + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
    paddingHorizontal: espacos.sm,
    borderRadius: raios.md,
  },
  opcaoMarcada: {
    backgroundColor: cores.acaoSuave,
  },
  opcaoPressionada: {
    backgroundColor: cores.neutroFundo,
  },
  textosOpcao: {
    flex: 1,
    paddingVertical: espacos.sm,
  },
  rotuloOpcao: {
    ...textos.corpoForte,
    color: cores.texto,
  },
  descricaoOpcao: {
    ...textos.legenda,
    color: cores.textoSuave,
  },
});
