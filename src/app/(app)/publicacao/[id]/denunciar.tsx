import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Aviso, Botao, OpcaoRadio } from '@/components/ui';
import { converterErro } from '@/services/api';
import { denunciarPublicacao } from '@/services/mural';
import { cores, espacos, margemTela, raios, textos } from '@/theme';

const motivos = [
  {
    titulo: 'Recomendação perigosa',
    descricao: 'Indica produto ou dose sem orientação técnica.',
  },
  { titulo: 'Informação falsa', descricao: 'Espalha boato ou dado errado sobre pragas.' },
  { titulo: 'Ofensa', descricao: 'Ataca ou humilha outra pessoa.' },
  { titulo: 'Dados pessoais', descricao: 'Expõe nome, telefone ou endereço de alguém.' },
  { titulo: 'Propaganda ou spam', descricao: 'Vende produto ou repete a mesma mensagem.' },
];

export default function TelaDenunciarPublicacao() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [motivo, setMotivo] = useState(motivos[0].titulo);
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    setEnviando(true);
    try {
      await denunciarPublicacao(Number(id), motivo);
      Alert.alert(
        'Denúncia enviada',
        'Obrigado. A moderação vai revisar a publicação.',
      );
      router.back();
    } catch (erro) {
      const convertido = converterErro(erro);
      if (convertido.status === 409) {
        Alert.alert('Denúncia já registrada', 'Você já denunciou esta publicação.');
        router.back();
        return;
      }
      Alert.alert('Não foi possível denunciar', convertido.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View style={styles.sobreposicao}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Fechar denúncia"
      />
      <View style={[styles.folha, { paddingBottom: insets.bottom + espacos.md }]}>
        <View style={styles.alca} />
        <ScrollView contentContainerStyle={styles.conteudo}>
          <View style={styles.cabecalho}>
            <Text style={styles.titulo} accessibilityRole="header">
              Denunciar publicação
            </Text>
            <Text style={styles.subtitulo}>Por que esta publicação não deveria estar no mural?</Text>
          </View>

          <View style={styles.opcoes} accessibilityRole="radiogroup">
            {motivos.map((item) => (
              <OpcaoRadio
                key={item.titulo}
                titulo={item.titulo}
                descricao={motivo === item.titulo ? item.descricao : undefined}
                selecionado={motivo === item.titulo}
                onPress={() => setMotivo(item.titulo)}
              />
            ))}
          </View>

          <Aviso
            tom="info"
            texto="Uma pessoa da moderação revisa toda denúncia. A IA ajuda a priorizar e nunca remove sozinha."
          />

          <Botao titulo="Enviar denúncia" onPress={enviar} carregando={enviando} />
          <Botao titulo="Cancelar" variante="texto" onPress={() => router.back()} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sobreposicao: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: cores.sobreposicao,
  },
  folha: {
    maxHeight: '90%',
    backgroundColor: cores.superficie,
    borderTopLeftRadius: raios.xl,
    borderTopRightRadius: raios.xl,
    paddingTop: espacos.sm,
  },
  alca: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: cores.borda,
  },
  conteudo: {
    paddingHorizontal: margemTela,
    paddingTop: espacos.md,
    gap: espacos.md,
  },
  cabecalho: {
    gap: espacos.xxs,
  },
  titulo: {
    ...textos.tituloSecao,
    fontSize: 20,
    color: cores.texto,
  },
  subtitulo: {
    ...textos.corpoGrande,
    color: cores.textoSuave,
  },
  opcoes: {
    gap: espacos.sm,
  },
});
