import { useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { CartaoModeracao } from '@/components/moderacao/CartaoModeracao';
import {
  Aviso,
  CabecalhoEscuro,
  Carregando,
  EstadoErro,
  EstadoVazio,
  RodapeLista,
} from '@/components/ui';
import { useListaPaginada } from '@/hooks/useListaPaginada';
import { converterErro } from '@/services/api';
import { decidirModeracao, listarFilaDeModeracao } from '@/services/moderacao';
import { cores, espacos, margemTela } from '@/theme';
import type { ItemModeracao } from '@/types/api';
import type { DecisaoModeracao } from '@/types/dominio';

function Separador() {
  return <View style={styles.separador} />;
}

interface Decisao {
  postId: number;
  decisao: DecisaoModeracao;
}

export default function TelaModeracao() {
  const lista = useListaPaginada('moderacao', listarFilaDeModeracao);
  const [emAndamento, setEmAndamento] = useState<Decisao | null>(null);

  async function executar(item: ItemModeracao, decisao: DecisaoModeracao) {
    setEmAndamento({ postId: item.postId, decisao });
    try {
      await decidirModeracao(item.postId, decisao);
      lista.alterarItens((itens) => itens.filter((atual) => atual.postId !== item.postId));
      Alert.alert(
        decisao === 'MANTER' ? 'Publicação mantida' : 'Publicação removida',
        decisao === 'MANTER'
          ? 'A publicação voltou para o mural da região.'
          : 'A publicação saiu do mural para todos.',
      );
    } catch (erro) {
      Alert.alert('Não foi possível registrar a decisão', converterErro(erro).message);
    } finally {
      setEmAndamento(null);
    }
  }

  function decidir(item: ItemModeracao, decisao: DecisaoModeracao) {
    if (decisao === 'MANTER') {
      void executar(item, decisao);
      return;
    }
    Alert.alert('Remover publicação?', 'Ela sai do mural da região para todos os usuários.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => void executar(item, decisao) },
    ]);
  }

  return (
    <View style={styles.tela}>
      <FlatList
        data={lista.itens}
        keyExtractor={(item) => String(item.postId)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <CartaoModeracao
              item={item}
              decidindo={emAndamento?.postId === item.postId ? emAndamento.decisao : null}
              aoDecidir={decidir}
            />
          </View>
        )}
        ItemSeparatorComponent={Separador}
        ListHeaderComponent={
          <View style={styles.cabecalhoLista}>
            <CabecalhoEscuro
              titulo="Moderação"
              subtitulo="Publicações ocultas depois de denúncia. Você decide se ficam ou saem."
            />
            <View style={styles.aviso}>
              <Aviso
                tom="info"
                texto="A IA classifica a denúncia e oculta de forma provisória só os casos de gravidade alta. A decisão final é sua."
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          lista.carregando ? (
            <Carregando texto="Buscando denúncias..." />
          ) : lista.erro ? (
            <EstadoErro mensagem={lista.erro} aoTentarDeNovo={lista.tentarDeNovo} />
          ) : (
            <EstadoVazio
              icone="shield"
              titulo="Nenhuma denúncia pendente"
              descricao="Quando alguém denunciar uma publicação do mural, ela aparece aqui."
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
  aviso: {
    paddingHorizontal: margemTela,
    paddingTop: espacos.lg,
  },
  item: {
    paddingHorizontal: margemTela,
  },
  separador: {
    height: espacos.sm,
  },
});
