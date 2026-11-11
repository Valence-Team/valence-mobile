import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { ItemOcorrencia } from '@/components/ocorrencia/ItemOcorrencia';
import {
  Aviso,
  BotaoFlutuante,
  CabecalhoEscuro,
  Carregando,
  EstadoErro,
  EstadoVazio,
  FiltroChips,
  RodapeLista,
  type OpcaoFiltro,
} from '@/components/ui';
import { useFilaOffline } from '@/contexts/FilaOfflineContext';
import { useListaPaginada } from '@/hooks/useListaPaginada';
import { rotas } from '@/navigation/rotas';
import { listarOcorrencias, tituloDaOcorrencia } from '@/services/ocorrencias';
import type { OcorrenciaPendente } from '@/storage/filaOffline';
import { cores, espacos, margemTela } from '@/theme';
import type { StatusOcorrencia } from '@/types/dominio';
import { formatarDataCurta } from '@/utils/formatadores';
import {
  rotuloCultura,
  rotuloStatusOcorrencia,
  tomStatusOcorrencia,
} from '@/utils/rotulos';

type Filtro = 'TODAS' | StatusOcorrencia;

const filtros: OpcaoFiltro<Filtro>[] = [
  { valor: 'TODAS', rotulo: 'Todas' },
  { valor: 'TRIADA', rotulo: 'Triadas' },
  { valor: 'EM_ANALISE', rotulo: 'Em análise' },
  { valor: 'CONFIRMADA', rotulo: 'Confirmadas' },
  { valor: 'DESCARTADA', rotulo: 'Descartadas' },
];

function Separador() {
  return <View style={styles.separador} />;
}

export default function TelaMinhasOcorrencias() {
  const router = useRouter();
  const { pendentes, enviando, enviarAgora, descartar } = useFilaOffline();
  const [filtro, setFiltro] = useState<Filtro>('TODAS');

  const buscar = useCallback(
    (pagina: number) => listarOcorrencias(filtro === 'TODAS' ? null : filtro, pagina),
    [filtro],
  );
  const lista = useListaPaginada(`ocorrencias-${filtro}`, buscar);

  async function enviarPendentes() {
    const enviadas = await enviarAgora();
    if (enviadas > 0) {
      lista.recarregar();
    }
  }

  function abrirPendente(pendente: OcorrenciaPendente) {
    Alert.alert(
      pendente.erro ? 'Falha no envio' : 'Aguardando conexão',
      pendente.erro ??
        'Esta ocorrência está guardada no aparelho e será enviada quando a internet voltar.',
      [
        { text: 'Fechar', style: 'cancel' },
        {
          text: 'Descartar',
          style: 'destructive',
          onPress: () => {
            void descartar(pendente.idLocal);
          },
        },
        {
          text: 'Enviar agora',
          onPress: () => {
            void enviarPendentes();
          },
        },
      ],
    );
  }

  const quantidade = pendentes.length;

  const cabecalho = (
    <View style={styles.cabecalhoLista}>
      <CabecalhoEscuro
        titulo="Minhas ocorrências"
        subtitulo="Acompanhe a triagem e o laudo de cada registro."
      />
      <FiltroChips
        opcoes={filtros}
        selecionado={filtro}
        aoSelecionar={setFiltro}
        estilo={styles.filtros}
      />
      {quantidade > 0 ? (
        <View style={styles.pendentes}>
          <Aviso
            tom="aviso"
            icone="cloud-off"
            texto={
              quantidade === 1
                ? '1 ocorrência aguardando conexão. Ela será enviada quando a internet voltar.'
                : `${quantidade} ocorrências aguardando conexão. Elas serão enviadas quando a internet voltar.`
            }
            acao={
              enviando
                ? undefined
                : { rotulo: 'Enviar agora', onPress: () => void enviarPendentes() }
            }
          />
          {pendentes.map((pendente) => (
            <ItemOcorrencia
              key={pendente.idLocal}
              titulo={pendente.erro ? 'Falha no envio' : 'Aguardando envio'}
              subtitulo={`${rotuloCultura[pendente.dados.cultura]} · ${pendente.propriedadeNome}`}
              etiqueta={
                pendente.erro
                  ? { texto: 'Não enviada', tom: 'perigo' }
                  : { texto: enviando ? 'Enviando...' : 'Aguardando conexão', tom: 'neutro' }
              }
              data={formatarDataCurta(pendente.criadaEm)}
              onPress={() => abrirPendente(pendente)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.tela}>
      <FlatList
        data={lista.itens}
        keyExtractor={(ocorrencia) => String(ocorrencia.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <ItemOcorrencia
              titulo={tituloDaOcorrencia(item)}
              subtitulo={`${rotuloCultura[item.cultura]} · ${item.propriedade.nome}`}
              etiqueta={{
                texto: rotuloStatusOcorrencia[item.status],
                tom: tomStatusOcorrencia[item.status],
              }}
              data={formatarDataCurta(item.dataRegistro)}
              onPress={() => router.push(rotas.ocorrencia(item.id))}
            />
          </View>
        )}
        ItemSeparatorComponent={Separador}
        ListHeaderComponent={cabecalho}
        ListEmptyComponent={
          lista.carregando ? (
            <Carregando texto="Buscando suas ocorrências..." />
          ) : lista.erro ? (
            <EstadoErro mensagem={lista.erro} aoTentarDeNovo={lista.tentarDeNovo} />
          ) : (
            <EstadoVazio
              icone="clipboard"
              titulo={filtro === 'TODAS' ? 'Nenhuma ocorrência ainda' : 'Nada com este filtro'}
              descricao={
                filtro === 'TODAS'
                  ? 'Registre um dano na lavoura com foto e descrição. A IA faz a triagem e avisa os vizinhos.'
                  : 'Troque o filtro para ver as outras ocorrências.'
              }
              acao={
                filtro === 'TODAS'
                  ? {
                      rotulo: 'Registrar ocorrência',
                      icone: 'camera',
                      onPress: () => router.push(rotas.novaOcorrencia),
                    }
                  : undefined
              }
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
            onRefresh={() => {
              lista.recarregar();
              void enviarAgora();
            }}
            tintColor={cores.acao}
            colors={[cores.acao]}
          />
        }
      />
      <BotaoFlutuante
        rotulo="Registrar nova ocorrência"
        onPress={() => router.push(rotas.novaOcorrencia)}
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
    gap: espacos.md,
    marginBottom: espacos.md,
  },
  filtros: {
    marginTop: espacos.md,
  },
  pendentes: {
    paddingHorizontal: margemTela,
    gap: espacos.sm,
  },
  item: {
    paddingHorizontal: margemTela,
  },
  separador: {
    height: espacos.sm,
  },
});
