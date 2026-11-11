import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { CartaoAlerta } from '@/components/alerta/CartaoAlerta';
import {
  Aviso,
  Botao,
  CabecalhoEscuro,
  Carregando,
  EstadoErro,
  EstadoVazio,
  Icone,
  RodapeLista,
} from '@/components/ui';
import { ambiente, observatorioConfigurado } from '@/config/ambiente';
import { useAutenticacao } from '@/contexts/AutenticacaoContext';
import { useFilaOffline } from '@/contexts/FilaOfflineContext';
import { useListaPaginada } from '@/hooks/useListaPaginada';
import { rotas } from '@/navigation/rotas';
import { listarAlertas, marcarAlertaComoLido } from '@/services/alertas';
import { converterErro } from '@/services/api';
import { cores, espacos, margemTela, textos } from '@/theme';
import type { Alerta } from '@/types/api';
import { primeiroNome } from '@/utils/formatadores';

function Separador() {
  return <View style={styles.separador} />;
}

export default function TelaInicio() {
  const router = useRouter();
  const { usuario } = useAutenticacao();
  const { pendentes } = useFilaOffline();
  const lista = useListaPaginada('alertas', listarAlertas);
  const [marcandoId, setMarcandoId] = useState<number | null>(null);

  async function marcarComoLido(alerta: Alerta) {
    setMarcandoId(alerta.id);
    try {
      await marcarAlertaComoLido(alerta.id);
      lista.alterarItens((itens) =>
        itens.map((item) => (item.id === alerta.id ? { ...item, lido: true } : item)),
      );
    } catch (erro) {
      Alert.alert('Não foi possível marcar como lido', converterErro(erro).message);
    } finally {
      setMarcandoId(null);
    }
  }

  const quantidadePendente = pendentes.length;

  const cabecalho = (
    <View style={styles.cabecalhoLista}>
      <CabecalhoEscuro>
        <Text style={styles.ola} accessibilityRole="header">
          Olá, {primeiroNome(usuario?.nome)}
        </Text>
        <View style={styles.local}>
          <Icone nome="map-pin" tamanho={18} cor={cores.textoSobreEscuroSuave} />
          <Text style={styles.textoLocal}>
            {usuario?.municipio} · {usuario?.uf}
          </Text>
        </View>
        <Botao
          titulo="Registrar ocorrência"
          icone="camera"
          onPress={() => router.push(rotas.novaOcorrencia)}
          estilo={styles.botaoRegistrar}
        />
        <Text style={styles.dica}>
          Viu algo estranho na lavoura? Fotografe a folha e a IA faz a triagem.
        </Text>
      </CabecalhoEscuro>

      <View style={styles.blocos}>
        {quantidadePendente > 0 ? (
          <Aviso
            tom="aviso"
            icone="cloud-off"
            texto={
              quantidadePendente === 1
                ? '1 ocorrência aguardando conexão para ser enviada.'
                : `${quantidadePendente} ocorrências aguardando conexão para serem enviadas.`
            }
            acao={{ rotulo: 'Ver ocorrências', onPress: () => router.push(rotas.ocorrencias) }}
          />
        ) : null}

        {observatorioConfigurado ? (
          <Aviso
            tom="info"
            icone="bar-chart-2"
            texto="Veja os focos da sua região nos dados abertos do Observatório."
            acao={{ rotulo: 'Abrir Observatório', onPress: () => router.push(rotas.observatorio) }}
          />
        ) : null}

        <View style={styles.secao}>
          <Text style={styles.tituloSecao} accessibilityRole="header">
            Alertas perto de você
          </Text>
          <Text style={styles.subtituloSecao}>
            Raio de {ambiente.raioAlertaKm} km das suas propriedades
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.tela}>
      <FlatList
        data={lista.itens}
        keyExtractor={(alerta) => String(alerta.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <CartaoAlerta
              alerta={item}
              marcando={marcandoId === item.id}
              aoMarcarComoLido={marcarComoLido}
            />
          </View>
        )}
        ItemSeparatorComponent={Separador}
        ListHeaderComponent={cabecalho}
        ListEmptyComponent={
          lista.carregando ? (
            <Carregando texto="Buscando alertas..." />
          ) : lista.erro ? (
            <EstadoErro mensagem={lista.erro} aoTentarDeNovo={lista.tentarDeNovo} />
          ) : (
            <EstadoVazio
              icone="bell"
              titulo="Nenhum alerta por perto"
              descricao={`Quando um vizinho registrar uma suspeita a até ${ambiente.raioAlertaKm} km das suas propriedades, ela aparece aqui.`}
              acao={{
                rotulo: 'Minhas propriedades',
                icone: 'map-pin',
                onPress: () => router.push(rotas.perfil),
              }}
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
  ola: {
    ...textos.destaque,
    color: cores.textoSobreEscuro,
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
  botaoRegistrar: {
    marginTop: espacos.md,
  },
  dica: {
    ...textos.corpo,
    color: cores.textoSobreEscuroSuave,
    marginTop: espacos.xs,
  },
  blocos: {
    paddingHorizontal: margemTela,
    paddingTop: espacos.xl,
    gap: espacos.md,
  },
  secao: {
    gap: 2,
  },
  tituloSecao: {
    ...textos.tituloSecao,
    color: cores.texto,
  },
  subtituloSecao: {
    ...textos.apoio,
    color: cores.textoSuave,
  },
  item: {
    paddingHorizontal: margemTela,
  },
  separador: {
    height: espacos.sm,
  },
});
