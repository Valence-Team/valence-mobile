import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { CartaoPublicacao } from '@/components/mural/CartaoPublicacao';
import {
  Avatar,
  Botao,
  CabecalhoEscuro,
  Carregando,
  EstadoErro,
  EstadoVazio,
  Icone,
  RodapeLista,
} from '@/components/ui';
import { useAutenticacao } from '@/contexts/AutenticacaoContext';
import { useListaPaginada } from '@/hooks/useListaPaginada';
import { rotas } from '@/navigation/rotas';
import { converterErro } from '@/services/api';
import { criarPublicacao, listarPublicacoes } from '@/services/mural';
import { cores, espacos, fontes, margemTela, raios, textos } from '@/theme';
import { limites } from '@/utils/validacoes';

function Separador() {
  return <View style={styles.separador} />;
}

export default function TelaMural() {
  const router = useRouter();
  const { usuario } = useAutenticacao();
  const municipio = usuario?.municipio ?? '';
  const uf = usuario?.uf ?? '';
  const [texto, setTexto] = useState('');
  const [publicando, setPublicando] = useState(false);

  const buscar = useCallback(
    (pagina: number) => listarPublicacoes(municipio, uf, pagina),
    [municipio, uf],
  );
  const lista = useListaPaginada(`mural-${municipio}-${uf}`, buscar);

  async function publicar() {
    const conteudo = texto.trim();
    if (conteudo.length < 3) {
      Alert.alert('Publicação vazia', 'Escreva o que você está vendo na lavoura antes de publicar.');
      return;
    }
    setPublicando(true);
    try {
      const nova = await criarPublicacao({ texto: conteudo, municipio, uf });
      lista.alterarItens((itens) => [nova, ...itens]);
      setTexto('');
    } catch (erro) {
      const convertido = converterErro(erro);
      Alert.alert(
        'Não foi possível publicar',
        convertido.erroDoCampo('texto') ?? convertido.message,
      );
    } finally {
      setPublicando(false);
    }
  }

  const cabecalho = (
    <View style={styles.cabecalhoLista}>
      <CabecalhoEscuro titulo="Mural da região">
        <View style={styles.local}>
          <Icone nome="map-pin" tamanho={18} cor={cores.textoSobreEscuroSuave} />
          <Text style={styles.textoLocal}>
            {municipio} · {uf}
          </Text>
        </View>
      </CabecalhoEscuro>

      <View style={styles.compositor}>
        <View style={styles.linhaCompositor}>
          <Avatar nome={usuario?.nome ?? ''} />
          <TextInput
            value={texto}
            onChangeText={setTexto}
            placeholder="Compartilhe o que você está vendo na lavoura."
            placeholderTextColor={cores.textoApoio}
            multiline
            maxLength={limites.publicacao}
            accessibilityLabel="Nova publicação no mural"
            style={styles.entrada}
          />
        </View>
        <View style={styles.divisor} />
        <View style={styles.rodapeCompositor}>
          <Text style={styles.visibilidade}>
            Visível para produtores de {municipio} · {uf}
          </Text>
          <Botao titulo="Publicar" onPress={publicar} carregando={publicando} compacto />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.tela}>
      <FlatList
        data={lista.itens}
        keyExtractor={(publicacao) => String(publicacao.id)}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <View style={styles.item}>
            <CartaoPublicacao
              publicacao={item}
              usuarioId={usuario?.id ?? null}
              onPress={() => router.push(rotas.publicacao(item.id))}
              aoDenunciar={() => router.push(rotas.denunciarPublicacao(item.id))}
            />
          </View>
        )}
        ItemSeparatorComponent={Separador}
        ListHeaderComponent={cabecalho}
        ListEmptyComponent={
          lista.carregando ? (
            <Carregando texto="Carregando o mural..." />
          ) : lista.erro ? (
            <EstadoErro mensagem={lista.erro} aoTentarDeNovo={lista.tentarDeNovo} />
          ) : (
            <EstadoVazio
              icone="message-square"
              titulo="O mural da região está vazio"
              descricao="Seja o primeiro a contar o que está vendo na lavoura."
            />
          )
        }
        ListFooterComponent={
          <RodapeLista
            temMais={lista.temMais}
            carregandoMais={lista.carregandoMais}
            aoCarregarMais={lista.carregarMais}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={lista.atualizando}
            onRefresh={lista.recarregar}
            tintColor={cores.acao}
            colors={[cores.acao]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  cabecalhoLista: {
    marginBottom: espacos.md,
  },
  local: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.xs,
  },
  textoLocal: {
    ...textos.corpoGrande,
    color: cores.textoSobreEscuroSuave,
  },
  compositor: {
    marginHorizontal: margemTela,
    marginTop: espacos.lg,
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacos.md,
    gap: espacos.sm,
  },
  linhaCompositor: {
    flexDirection: 'row',
    gap: espacos.sm,
    alignItems: 'flex-start',
  },
  entrada: {
    flex: 1,
    minHeight: 44,
    maxHeight: 140,
    fontFamily: fontes.regular,
    fontSize: 16,
    lineHeight: 22,
    color: cores.texto,
    paddingTop: espacos.xs,
    textAlignVertical: 'top',
  },
  divisor: {
    height: 1,
    backgroundColor: cores.borda,
  },
  rodapeCompositor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
  },
  visibilidade: {
    ...textos.legenda,
    color: cores.textoSuave,
    flex: 1,
  },
  item: {
    paddingHorizontal: margemTela,
  },
  separador: {
    height: espacos.sm,
  },
});
