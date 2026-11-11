import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CartaoPublicacao } from '@/components/mural/CartaoPublicacao';
import { ItemComentario } from '@/components/mural/ItemComentario';
import {
  BarraTopo,
  Carregando,
  EstadoErro,
  Icone,
  RodapeLista,
  type AcaoBarraTopo,
} from '@/components/ui';
import { useAutenticacao } from '@/contexts/AutenticacaoContext';
import { useCarregamento } from '@/hooks/useCarregamento';
import { useListaPaginada } from '@/hooks/useListaPaginada';
import { rotas } from '@/navigation/rotas';
import { converterErro } from '@/services/api';
import {
  comentar,
  excluirPublicacao,
  listarComentarios,
  obterPublicacao,
  publicacaoEmCache,
} from '@/services/mural';
import { cores, espacos, fontes, margemTela, raios, textos } from '@/theme';
import type { Publicacao } from '@/types/api';
import { limites } from '@/utils/validacoes';

async function buscarPublicacao(id: number): Promise<Publicacao> {
  try {
    return await obterPublicacao(id);
  } catch (erro) {
    const emCache = publicacaoEmCache(id);
    const convertido = converterErro(erro);
    if (emCache && (convertido.status === 404 || convertido.status === 405)) {
      return emCache;
    }
    throw convertido;
  }
}

export default function TelaPublicacao() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const publicacaoId = Number(id);
  const { usuario } = useAutenticacao();
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);

  const buscar = useCallback(() => buscarPublicacao(publicacaoId), [publicacaoId]);
  const carregamento = useCarregamento(`publicacao-${publicacaoId}`, buscar);
  const buscarComentarios = useCallback(
    (pagina: number) => listarComentarios(publicacaoId, pagina),
    [publicacaoId],
  );
  const comentarios = useListaPaginada(`comentarios-${publicacaoId}`, buscarComentarios);

  const publicacao = carregamento.dados;
  const ehAutor = Boolean(publicacao && usuario && publicacao.autor.id === usuario.id);
  const ehModerador = usuario?.papel === 'AGRONOMO' || usuario?.papel === 'GESTOR';
  const casoConfirmado = Boolean(publicacao?.ocorrenciaId);

  async function enviarComentario() {
    const conteudo = texto.trim();
    if (conteudo.length === 0 || !publicacao) {
      return;
    }
    setEnviando(true);
    try {
      const novo = await comentar(publicacaoId, conteudo);
      comentarios.alterarItens((itens) => [...itens, novo]);
      carregamento.substituir({
        ...publicacao,
        totalComentarios: (publicacao.totalComentarios ?? 0) + 1,
      });
      setTexto('');
    } catch (erro) {
      const convertido = converterErro(erro);
      Alert.alert(
        'Não foi possível comentar',
        convertido.erroDoCampo('texto') ?? convertido.message,
      );
    } finally {
      setEnviando(false);
    }
  }

  function confirmarExclusao() {
    Alert.alert(
      'Excluir publicação?',
      'A publicação e os comentários saem do mural para todos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluirPublicacao(publicacaoId);
              router.back();
            } catch (erro) {
              Alert.alert('Não foi possível excluir', converterErro(erro).message);
            }
          },
        },
      ],
    );
  }

  const acoes: AcaoBarraTopo[] = [];
  if (publicacao && ehAutor) {
    acoes.push({
      icone: 'edit-2',
      rotulo: 'Editar publicação',
      onPress: () => router.push(rotas.editarPublicacao(publicacaoId)),
    });
  }
  if (publicacao && !ehAutor && !casoConfirmado) {
    acoes.push({
      icone: 'flag',
      rotulo: 'Denunciar publicação',
      onPress: () => router.push(rotas.denunciarPublicacao(publicacaoId)),
    });
  }
  if (publicacao && (ehAutor || ehModerador)) {
    acoes.push({
      icone: 'trash-2',
      rotulo: 'Excluir publicação',
      onPress: confirmarExclusao,
      cor: cores.erro,
    });
  }

  const total = comentarios.itens.length;

  return (
    <View style={styles.tela}>
      <BarraTopo titulo="Publicação" acoes={acoes} />
      {carregamento.carregando ? (
        <Carregando texto="Abrindo a publicação..." />
      ) : carregamento.erro || !publicacao ? (
        <EstadoErro
          mensagem={carregamento.erro ?? 'Tente de novo.'}
          aoTentarDeNovo={carregamento.tentarDeNovo}
        />
      ) : (
        <KeyboardAvoidingView
          style={styles.tela}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <FlatList
            data={comentarios.itens}
            keyExtractor={(comentario) => String(comentario.id)}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.lista}
            ListHeaderComponent={
              <View style={styles.cabecalhoLista}>
                <CartaoPublicacao
                  publicacao={publicacao}
                  usuarioId={usuario?.id ?? null}
                  aoDenunciar={
                    ehAutor
                      ? undefined
                      : () => router.push(rotas.denunciarPublicacao(publicacaoId))
                  }
                />
                <Text style={styles.tituloSecao} accessibilityRole="header">
                  Comentários
                </Text>
              </View>
            }
            renderItem={({ item, index }) => (
              <View
                style={[
                  styles.itemComentario,
                  index === 0 && styles.primeiro,
                  index === total - 1 && styles.ultimo,
                  index > 0 && styles.comDivisor,
                ]}
              >
                <ItemComentario comentario={item} />
              </View>
            )}
            ListEmptyComponent={
              comentarios.carregando ? (
                <ActivityIndicator color={cores.acao} style={styles.carregandoComentarios} />
              ) : comentarios.erro ? (
                <EstadoErro mensagem={comentarios.erro} aoTentarDeNovo={comentarios.tentarDeNovo} />
              ) : (
                <Text style={styles.semComentarios}>
                  Ninguém comentou ainda. Conte o que você está vendo na sua lavoura.
                </Text>
              )
            }
            ListFooterComponent={
              comentarios.temMais ? (
                <RodapeLista
                  temMais={comentarios.temMais}
                  carregandoMais={comentarios.carregandoMais}
                  aoCarregarMais={comentarios.carregarMais}
                />
              ) : null
            }
          />

          <View style={[styles.barraComentario, { paddingBottom: insets.bottom + espacos.sm }]}>
            <TextInput
              value={texto}
              onChangeText={setTexto}
              placeholder="Escreva um comentário"
              placeholderTextColor={cores.textoApoio}
              maxLength={limites.comentario}
              multiline
              accessibilityLabel="Escreva um comentário"
              style={styles.entrada}
            />
            <Pressable
              onPress={enviarComentario}
              disabled={enviando || texto.trim().length === 0}
              accessibilityRole="button"
              accessibilityLabel="Enviar comentário"
              accessibilityState={{ disabled: enviando || texto.trim().length === 0, busy: enviando }}
              style={({ pressed }) => [
                styles.botaoEnviar,
                (pressed || texto.trim().length === 0) && styles.botaoEnviarInativo,
              ]}
            >
              {enviando ? (
                <ActivityIndicator color={cores.textoSobreAcao} />
              ) : (
                <Icone nome="send" tamanho={20} cor={cores.textoSobreAcao} />
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  lista: {
    paddingHorizontal: margemTela,
    paddingTop: espacos.lg,
    paddingBottom: espacos.xl,
  },
  cabecalhoLista: {
    gap: espacos.lg,
    marginBottom: espacos.sm,
  },
  tituloSecao: {
    ...textos.tituloSecao,
    color: cores.texto,
  },
  itemComentario: {
    backgroundColor: cores.superficie,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: cores.borda,
    paddingHorizontal: espacos.md,
  },
  primeiro: {
    borderTopWidth: 1,
    borderTopLeftRadius: raios.lg,
    borderTopRightRadius: raios.lg,
    paddingTop: espacos.xs,
  },
  ultimo: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: raios.lg,
    borderBottomRightRadius: raios.lg,
    paddingBottom: espacos.xs,
  },
  comDivisor: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: cores.borda,
  },
  carregandoComentarios: {
    marginVertical: espacos.xl,
  },
  semComentarios: {
    ...textos.corpo,
    color: cores.textoSuave,
    textAlign: 'center',
    paddingVertical: espacos.lg,
  },
  barraComentario: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: espacos.sm,
    paddingHorizontal: margemTela,
    paddingTop: espacos.sm,
    backgroundColor: cores.superficie,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
  entrada: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: cores.bordaCampo,
    paddingHorizontal: espacos.md,
    paddingTop: 13,
    paddingBottom: 13,
    fontFamily: fontes.regular,
    fontSize: 16,
    color: cores.texto,
  },
  botaoEnviar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: cores.acao,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoEnviarInativo: {
    opacity: 0.6,
  },
});
