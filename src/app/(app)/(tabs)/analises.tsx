import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { CartaoAnalise } from '@/components/analise/CartaoAnalise';
import {
  CabecalhoEscuro,
  Carregando,
  EstadoErro,
  EstadoVazio,
  FiltroChips,
  RodapeLista,
  type OpcaoFiltro,
} from '@/components/ui';
import { useListaPaginada } from '@/hooks/useListaPaginada';
import { rotas } from '@/navigation/rotas';
import { listarFilaDeAnalise } from '@/services/analises';
import { cores, espacos, margemTela } from '@/theme';

type Filtro = 'TODOS' | 'TRIADA' | 'EM_ANALISE';

const filtros: OpcaoFiltro<Filtro>[] = [
  { valor: 'TODOS', rotulo: 'Todos' },
  { valor: 'TRIADA', rotulo: 'Triados' },
  { valor: 'EM_ANALISE', rotulo: 'Em análise' },
];

function Separador() {
  return <View style={styles.separador} />;
}

export default function TelaFilaDeAnalise() {
  const router = useRouter();
  const [filtro, setFiltro] = useState<Filtro>('TODOS');

  const buscar = useCallback(
    (pagina: number) => listarFilaDeAnalise(filtro === 'TODOS' ? null : filtro, pagina),
    [filtro],
  );
  const lista = useListaPaginada(`analises-${filtro}`, buscar);

  return (
    <View style={styles.tela}>
      <FlatList
        data={lista.itens}
        keyExtractor={(ocorrencia) => String(ocorrencia.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <CartaoAnalise
              ocorrencia={item}
              onPress={() => router.push(rotas.ocorrencia(item.id))}
            />
          </View>
        )}
        ItemSeparatorComponent={Separador}
        ListHeaderComponent={
          <View style={styles.cabecalhoLista}>
            <CabecalhoEscuro
              titulo="Fila de análise"
              subtitulo="Casos da sua região, do mais grave para o menos grave."
            />
            <FiltroChips
              opcoes={filtros}
              selecionado={filtro}
              aoSelecionar={setFiltro}
              estilo={styles.filtros}
            />
          </View>
        }
        ListEmptyComponent={
          lista.carregando ? (
            <Carregando texto="Buscando casos..." />
          ) : lista.erro ? (
            <EstadoErro mensagem={lista.erro} aoTentarDeNovo={lista.tentarDeNovo} />
          ) : (
            <EstadoVazio
              icone="check-square"
              titulo="Nenhum caso na fila"
              descricao="Quando um produtor registrar uma ocorrência, ela aparece aqui para o seu laudo."
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
  filtros: {
    marginTop: espacos.lg,
  },
  item: {
    paddingHorizontal: margemTela,
  },
  separador: {
    height: espacos.sm,
  },
});
