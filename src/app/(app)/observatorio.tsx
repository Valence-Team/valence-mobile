import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { CartaoFoco } from '@/components/observatorio/CartaoFoco';
import {
  BarraTopo,
  Cartao,
  Carregando,
  EstadoErro,
  EstadoVazio,
  FiltroChips,
  RodapeLista,
  type OpcaoFiltro,
} from '@/components/ui';
import { ambiente, observatorioConfigurado } from '@/config/ambiente';
import { useAutenticacao } from '@/contexts/AutenticacaoContext';
import { useCarregamento } from '@/hooks/useCarregamento';
import { useListaPaginada } from '@/hooks/useListaPaginada';
import { listarFocos, obterEstatisticas } from '@/services/observatorio';
import { cores, espacos, margemTela, textos } from '@/theme';
import type { EstatisticasFocos, Pagina, Foco } from '@/types/api';
import type { Cultura } from '@/types/dominio';

type Filtro = 'TODAS' | Cultura;

const filtros: OpcaoFiltro<Filtro>[] = [
  { valor: 'TODAS', rotulo: 'Todas' },
  { valor: 'MILHO', rotulo: 'Milho' },
  { valor: 'TOMATE', rotulo: 'Tomate' },
  { valor: 'BATATA', rotulo: 'Batata' },
];

const PERIODO_DIAS = 30;

function Separador() {
  return <View style={styles.separador} />;
}

function totalPorChave(estatisticas: EstatisticasFocos, chave: string): number {
  return estatisticas.porStatus.find((item) => item.chave === chave)?.total ?? 0;
}

function Resumo({ estatisticas }: { estatisticas: EstatisticasFocos }) {
  const principais = estatisticas.porPraga.slice(0, 3);
  return (
    <Cartao estilo={styles.resumo}>
      <Text style={styles.tituloResumo}>Últimos {estatisticas.periodoDias} dias</Text>
      <View style={styles.numeros}>
        <View style={styles.numero}>
          <Text style={styles.valor}>{estatisticas.totalFocos}</Text>
          <Text style={styles.legenda}>focos</Text>
        </View>
        <View style={styles.numero}>
          <Text style={styles.valor}>{totalPorChave(estatisticas, 'CONFIRMADO')}</Text>
          <Text style={styles.legenda}>confirmados</Text>
        </View>
        <View style={styles.numero}>
          <Text style={styles.valor}>{totalPorChave(estatisticas, 'SUSPEITA')}</Text>
          <Text style={styles.legenda}>suspeitas</Text>
        </View>
      </View>
      {principais.length > 0 ? (
        <View style={styles.pragas}>
          <Text style={styles.legenda}>Pragas mais registradas</Text>
          {principais.map((praga) => (
            <View key={praga.chave} style={styles.linhaPraga}>
              <Text style={styles.nomePraga}>{praga.chave}</Text>
              <Text style={styles.totalPraga}>{praga.total}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Cartao>
  );
}

export default function TelaObservatorio() {
  const { usuario } = useAutenticacao();
  const uf = usuario?.uf ?? 'SP';
  const [filtro, setFiltro] = useState<Filtro>('TODAS');

  const buscarFocos = useCallback(
    async (pagina: number): Promise<Pagina<Foco>> => {
      if (!observatorioConfigurado) {
        return { itens: [], pagina: 0, totalPaginas: 1, totalItens: 0, ultima: true };
      }
      const tamanho = ambiente.tamanhoPagina;
      const resultado = await listarFocos({
        cultura: filtro === 'TODAS' ? null : filtro,
        uf,
        deslocamento: pagina * tamanho,
        registroRetornado: tamanho,
      });
      const totalPaginas = Math.max(Math.ceil(resultado.totalRegistros / tamanho), 1);
      return {
        itens: resultado.items,
        pagina,
        totalPaginas,
        totalItens: resultado.totalRegistros,
        ultima: (pagina + 1) * tamanho >= resultado.totalRegistros,
      };
    },
    [filtro, uf],
  );
  const buscarEstatisticas = useCallback(
    async (): Promise<EstatisticasFocos | null> =>
      observatorioConfigurado ? obterEstatisticas(uf, PERIODO_DIAS) : null,
    [uf],
  );

  const focos = useListaPaginada(`focos-${uf}-${filtro}`, buscarFocos);
  const estatisticas = useCarregamento(`estatisticas-${uf}`, buscarEstatisticas, {
    recarregarAoFocar: false,
  });

  if (!observatorioConfigurado) {
    return (
      <View style={styles.tela}>
        <BarraTopo titulo="Observatório público" />
        <EstadoVazio
          icone="bar-chart-2"
          titulo="Observatório não configurado"
          descricao="Defina EXPO_PUBLIC_OBSERVATORIO_URL para ver os dados abertos de focos."
        />
      </View>
    );
  }

  return (
    <View style={styles.tela}>
      <BarraTopo titulo="Observatório público" />
      <FlatList
        data={focos.itens}
        keyExtractor={(foco) => String(foco.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <CartaoFoco foco={item} />
          </View>
        )}
        ItemSeparatorComponent={Separador}
        ListHeaderComponent={
          <View style={styles.cabecalho}>
            <Text style={styles.introducao}>
              Dados abertos de focos de pragas em {uf}, sem nome, contato ou localização exata dos
              produtores.
            </Text>
            {estatisticas.dados ? <Resumo estatisticas={estatisticas.dados} /> : null}
            <FiltroChips
              opcoes={filtros}
              selecionado={filtro}
              aoSelecionar={setFiltro}
              estilo={styles.filtros}
            />
          </View>
        }
        ListEmptyComponent={
          focos.carregando ? (
            <Carregando texto="Consultando os dados abertos..." />
          ) : focos.erro ? (
            <EstadoErro mensagem={focos.erro} aoTentarDeNovo={focos.tentarDeNovo} />
          ) : (
            <EstadoVazio
              icone="bar-chart-2"
              titulo="Nenhum foco registrado"
              descricao="Não há focos públicos para este filtro."
            />
          )
        }
        ListFooterComponent={
          <RodapeLista
            temMais={focos.temMais}
            carregandoMais={focos.carregandoMais}
            aoCarregarMais={focos.carregarMais}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={focos.atualizando}
            onRefresh={() => {
              focos.recarregar();
              estatisticas.recarregar();
            }}
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
  cabecalho: {
    paddingTop: espacos.lg,
    gap: espacos.md,
    marginBottom: espacos.md,
  },
  introducao: {
    ...textos.corpo,
    color: cores.textoSuave,
    paddingHorizontal: margemTela,
  },
  resumo: {
    marginHorizontal: margemTela,
    gap: espacos.md,
  },
  tituloResumo: {
    ...textos.rotulo,
    color: cores.textoSuave,
  },
  numeros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  numero: {
    alignItems: 'flex-start',
  },
  valor: {
    ...textos.tituloTela,
    color: cores.texto,
  },
  legenda: {
    ...textos.legenda,
    color: cores.textoSuave,
  },
  pragas: {
    gap: espacos.xs,
  },
  linhaPraga: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: espacos.sm,
  },
  nomePraga: {
    ...textos.corpo,
    color: cores.texto,
    flex: 1,
  },
  totalPraga: {
    ...textos.corpoForte,
    color: cores.texto,
  },
  filtros: {
    marginTop: espacos.xs,
  },
  item: {
    paddingHorizontal: margemTela,
  },
  separador: {
    height: espacos.sm,
  },
});
