import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { CartaoLaudo } from '@/components/ocorrencia/CartaoLaudo';
import { CartaoTriagem } from '@/components/ocorrencia/CartaoTriagem';
import { FotoDaOcorrencia } from '@/components/ocorrencia/FotoDaOcorrencia';
import { LinhaDoTempoStatus } from '@/components/ocorrencia/LinhaDoTempoStatus';
import {
  BarraTopo,
  Botao,
  Cartao,
  Carregando,
  EstadoErro,
  EstadoVazio,
  Etiqueta,
  Tela,
  type AcaoBarraTopo,
} from '@/components/ui';
import { useAutenticacao } from '@/contexts/AutenticacaoContext';
import { useCarregamento } from '@/hooks/useCarregamento';
import { rotas } from '@/navigation/rotas';
import { converterErro } from '@/services/api';
import {
  excluirOcorrencia,
  obterOcorrencia,
  podeEditarOcorrencia,
  reprocessarTriagem,
} from '@/services/ocorrencias';
import { cores, espacos, textos } from '@/theme';
import { formatarDataHora } from '@/utils/formatadores';
import { rotuloCultura, rotuloStatusOcorrencia, tomStatusOcorrencia } from '@/utils/rotulos';

function Dado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={styles.dado}>
      <Text style={styles.rotuloDado}>{rotulo}</Text>
      <Text style={styles.valorDado}>{valor}</Text>
    </View>
  );
}

export default function TelaDetalheOcorrencia() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const ocorrenciaId = Number(id);
  const { usuario } = useAutenticacao();
  const buscar = useCallback(() => obterOcorrencia(ocorrenciaId), [ocorrenciaId]);
  const carregamento = useCarregamento(`ocorrencia-${ocorrenciaId}`, buscar);
  const [excluindo, setExcluindo] = useState(false);
  const [reprocessando, setReprocessando] = useState(false);

  const ocorrencia = carregamento.dados;
  const ehProdutor = usuario?.papel === 'PRODUTOR';
  const ehAgronomo = usuario?.papel === 'AGRONOMO';
  const editavel = Boolean(ocorrencia && ehProdutor && podeEditarOcorrencia(ocorrencia));
  const podeEmitirLaudo =
    Boolean(ocorrencia) &&
    ehAgronomo &&
    (ocorrencia?.status === 'TRIADA' || ocorrencia?.status === 'EM_ANALISE');

  function confirmarExclusao() {
    Alert.alert(
      'Excluir ocorrência?',
      'O registro, a foto e a triagem serão apagados. Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => void excluir() },
      ],
    );
  }

  async function excluir() {
    setExcluindo(true);
    try {
      await excluirOcorrencia(ocorrenciaId);
      Alert.alert('Ocorrência excluída', 'O registro foi apagado.');
      router.back();
    } catch (erro) {
      Alert.alert('Não foi possível excluir', converterErro(erro).message);
    } finally {
      setExcluindo(false);
    }
  }

  async function refazerTriagem() {
    setReprocessando(true);
    try {
      const atualizada = await reprocessarTriagem(ocorrenciaId);
      carregamento.substituir(atualizada);
    } catch (erro) {
      Alert.alert('Não foi possível refazer a triagem', converterErro(erro).message);
    } finally {
      setReprocessando(false);
    }
  }

  const acoes: AcaoBarraTopo[] = editavel
    ? [
        {
          icone: 'edit-2',
          rotulo: 'Editar ocorrência',
          onPress: () => router.push(rotas.editarOcorrencia(ocorrenciaId)),
        },
      ]
    : [];

  return (
    <Tela
      cabecalho={<BarraTopo titulo={`Ocorrência #${id}`} acoes={acoes} />}
      controleAtualizacao={
        <RefreshControl
          refreshing={carregamento.atualizando}
          onRefresh={carregamento.recarregar}
          tintColor={cores.acao}
          colors={[cores.acao]}
        />
      }
    >
      {carregamento.carregando ? (
        <Carregando texto="Abrindo a ocorrência..." />
      ) : carregamento.statusErro === 404 ? (
        <EstadoVazio
          icone="search"
          titulo="Ocorrência não encontrada"
          descricao="Ela pode ter sido excluída."
        />
      ) : carregamento.erro || !ocorrencia ? (
        <EstadoErro
          mensagem={carregamento.erro ?? 'Tente de novo.'}
          aoTentarDeNovo={carregamento.tentarDeNovo}
        />
      ) : (
        <>
          <FotoDaOcorrencia foto={ocorrencia.fotos?.[0]} />

          <Cartao estilo={styles.cartaoStatus}>
            <View style={styles.linhaStatus}>
              <Etiqueta
                texto={rotuloStatusOcorrencia[ocorrencia.status]}
                tom={tomStatusOcorrencia[ocorrencia.status]}
              />
              <Text style={styles.data}>
                Registrada em {formatarDataHora(ocorrencia.dataRegistro)}
              </Text>
            </View>
            <LinhaDoTempoStatus status={ocorrencia.status} temTriagem={Boolean(ocorrencia.triagem)} />
          </Cartao>

          <CartaoTriagem triagem={ocorrencia.triagem} status={ocorrencia.status} />
          <CartaoLaudo laudo={ocorrencia.laudo} />

          <Cartao estilo={styles.cartaoDados}>
            <Dado rotulo="Cultura" valor={rotuloCultura[ocorrencia.cultura]} />
            <Dado
              rotulo="Propriedade"
              valor={`${ocorrencia.propriedade.nome} · ${ocorrencia.propriedade.municipio}/${ocorrencia.propriedade.uf}`}
            />
            <Dado rotulo="Descrição" valor={ocorrencia.descricao} />
          </Cartao>

          {podeEmitirLaudo ? (
            <Botao
              titulo="Emitir laudo"
              icone="check-circle"
              onPress={() => router.push(rotas.emitirLaudo(ocorrenciaId))}
            />
          ) : null}

          {ehProdutor && ocorrencia.status === 'RECEBIDA' && !ocorrencia.triagem ? (
            <Botao
              titulo="Refazer triagem"
              icone="refresh-cw"
              variante="contorno"
              onPress={refazerTriagem}
              carregando={reprocessando}
            />
          ) : null}

          {editavel ? (
            <View style={styles.acoes}>
              <Botao
                titulo="Editar ocorrência"
                icone="edit-2"
                variante="contorno"
                onPress={() => router.push(rotas.editarOcorrencia(ocorrenciaId))}
              />
              <Botao
                titulo="Excluir ocorrência"
                icone="trash-2"
                variante="perigo"
                onPress={confirmarExclusao}
                carregando={excluindo}
              />
              <Text style={styles.nota}>
                Você pode editar ou excluir enquanto a ocorrência não entra em análise.
              </Text>
            </View>
          ) : null}
        </>
      )}
    </Tela>
  );
}

const styles = StyleSheet.create({
  cartaoStatus: {
    gap: espacos.md,
  },
  linhaStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espacos.sm,
    flexWrap: 'wrap',
  },
  data: {
    ...textos.apoio,
    color: cores.textoSuave,
  },
  cartaoDados: {
    gap: espacos.md,
    padding: espacos.lg,
  },
  dado: {
    gap: 2,
  },
  rotuloDado: {
    ...textos.legenda,
    color: cores.textoSuave,
  },
  valorDado: {
    ...textos.corpoGrande,
    color: cores.texto,
  },
  acoes: {
    gap: espacos.sm,
  },
  nota: {
    ...textos.apoio,
    color: cores.textoSuave,
    textAlign: 'center',
  },
});
