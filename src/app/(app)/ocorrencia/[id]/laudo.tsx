import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { FotoDaOcorrencia } from '@/components/ocorrencia/FotoDaOcorrencia';
import {
  Aviso,
  BarraTopo,
  Botao,
  CampoTexto,
  Carregando,
  EstadoErro,
  Etiqueta,
  OpcaoRadio,
  Tela,
} from '@/components/ui';
import { useCarregamento } from '@/hooks/useCarregamento';
import { emitirLaudo } from '@/services/analises';
import { converterErro } from '@/services/api';
import { obterOcorrencia, tituloDaOcorrencia } from '@/services/ocorrencias';
import { cores, espacos, raios, textos } from '@/theme';
import type { Ocorrencia } from '@/types/api';
import type { DecisaoLaudo } from '@/types/dominio';
import { formatarDataCurta, formatarPercentual } from '@/utils/formatadores';
import { rotuloCultura, rotuloStatusOcorrencia, tomStatusOcorrencia } from '@/utils/rotulos';
import { limites, temErros, type Erros } from '@/utils/validacoes';

type CampoLaudo = 'decisao' | 'pragaConfirmada' | 'parecer';

const opcoesDecisao: { valor: DecisaoLaudo; titulo: string; descricao: string }[] = [
  {
    valor: 'CONFIRMADA',
    titulo: 'Confirmar praga',
    descricao: 'Os alertas viram Confirmado e o caso vai para o mural da região.',
  },
  {
    valor: 'DESCARTADA',
    titulo: 'Descartar caso',
    descricao: 'Os alertas são encerrados e o produtor é avisado.',
  },
  {
    valor: 'MAIS_INFORMACOES',
    titulo: 'Pedir mais informações',
    descricao: 'O caso continua em análise e o produtor recebe o pedido.',
  },
];

function resumoTriagem(ocorrencia: Ocorrencia): string | null {
  const triagem = ocorrencia.triagem;
  if (!triagem) {
    return null;
  }
  const partes = [
    typeof triagem.confianca === 'number'
      ? `${formatarPercentual(triagem.confianca)} de confiança`
      : null,
    typeof triagem.severidade === 'number' ? `severidade ${triagem.severidade} de 5` : null,
  ].filter(Boolean);
  return partes.length > 0 ? `Triagem: ${partes.join(' · ')}` : null;
}

function FormularioLaudo({ ocorrencia }: { ocorrencia: Ocorrencia }) {
  const router = useRouter();
  const [decisao, setDecisao] = useState<DecisaoLaudo>('CONFIRMADA');
  const [praga, setPraga] = useState(
    ocorrencia.pragaProvavel ?? ocorrencia.triagem?.hipoteses?.[0]?.praga ?? '',
  );
  const [parecer, setParecer] = useState('');
  const [erros, setErros] = useState<Erros<CampoLaudo>>({});
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    const novosErros: Erros<CampoLaudo> = {
      pragaConfirmada:
        decisao === 'CONFIRMADA' && praga.trim().length === 0
          ? 'Informe a praga confirmada.'
          : undefined,
      parecer:
        parecer.trim().length < 10
          ? 'Escreva o parecer técnico com pelo menos 10 caracteres.'
          : undefined,
    };
    setErros(novosErros);
    if (temErros(novosErros)) {
      return;
    }

    setEnviando(true);
    try {
      await emitirLaudo(ocorrencia.id, {
        decisao,
        pragaConfirmada: decisao === 'CONFIRMADA' ? praga.trim() : undefined,
        parecer: parecer.trim(),
      });
      Alert.alert(
        'Laudo emitido',
        decisao === 'CONFIRMADA'
          ? 'Os vizinhos recebem o alerta confirmado e o caso vai para o mural.'
          : 'O produtor já pode ver o resultado.',
      );
      router.back();
    } catch (erro) {
      const convertido = converterErro(erro);
      setErros({
        decisao: convertido.erroDoCampo('decisao'),
        pragaConfirmada: convertido.erroDoCampo('pragaConfirmada'),
        parecer: convertido.erroDoCampo('parecer'),
      });
      Alert.alert('Não foi possível emitir o laudo', convertido.message);
    } finally {
      setEnviando(false);
    }
  }

  const resumo = resumoTriagem(ocorrencia);

  return (
    <>
      <View style={styles.resumo}>
        <View style={styles.linhaResumo}>
          <Etiqueta
            texto={rotuloStatusOcorrencia[ocorrencia.status]}
            tom={tomStatusOcorrencia[ocorrencia.status]}
          />
          <Text style={styles.numero}>Ocorrência #{ocorrencia.id}</Text>
        </View>
        <Text style={styles.tituloResumo}>{tituloDaOcorrencia(ocorrencia)}</Text>
        <Text style={styles.meta}>
          {rotuloCultura[ocorrencia.cultura]} · {ocorrencia.propriedade.municipio}/
          {ocorrencia.propriedade.uf} · registrada em {formatarDataCurta(ocorrencia.dataRegistro)}
        </Text>
        <FotoDaOcorrencia foto={ocorrencia.fotos?.[0]} altura={160} textoVazio="Foto da ocorrência" />
        {resumo ? <Text style={styles.triagem}>{resumo}</Text> : null}
        <Text style={styles.descricao}>“{ocorrencia.descricao}”</Text>
      </View>

      <View style={styles.secao}>
        <Text style={styles.rotulo}>Decisão</Text>
        <View style={styles.opcoes} accessibilityRole="radiogroup">
          {opcoesDecisao.map((opcao) => (
            <OpcaoRadio
              key={opcao.valor}
              titulo={opcao.titulo}
              descricao={opcao.descricao}
              selecionado={decisao === opcao.valor}
              onPress={() => setDecisao(opcao.valor)}
            />
          ))}
        </View>
        {erros.decisao ? <Text style={styles.erro}>{erros.decisao}</Text> : null}
      </View>

      {decisao === 'CONFIRMADA' ? (
        <CampoTexto
          rotulo="Praga confirmada"
          valor={praga}
          aoMudar={setPraga}
          placeholder="Nome da praga ou doença"
          limite={limites.praga}
          erro={erros.pragaConfirmada}
        />
      ) : null}

      <CampoTexto
        rotulo="Parecer técnico"
        valor={parecer}
        aoMudar={setParecer}
        placeholder="O que você observou e o que recomenda ao produtor."
        multilinha
        limite={limites.parecer}
        erro={erros.parecer}
      />

      <Aviso
        tom="info"
        texto="O nome do produtor e a localização exata não vão para o Observatório público."
      />

      <Botao titulo="Emitir laudo" icone="check-circle" onPress={enviar} carregando={enviando} />
    </>
  );
}

export default function TelaEmitirLaudo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ocorrenciaId = Number(id);
  const buscar = useCallback(() => obterOcorrencia(ocorrenciaId), [ocorrenciaId]);
  const carregamento = useCarregamento(`laudo-${ocorrenciaId}`, buscar, {
    recarregarAoFocar: false,
  });

  return (
    <Tela fundo={cores.superficie} cabecalho={<BarraTopo titulo="Emitir laudo" />}>
      {carregamento.carregando ? (
        <Carregando texto="Abrindo a ocorrência..." />
      ) : carregamento.erro || !carregamento.dados ? (
        <EstadoErro
          mensagem={carregamento.erro ?? 'Tente de novo.'}
          aoTentarDeNovo={carregamento.tentarDeNovo}
        />
      ) : (
        <FormularioLaudo ocorrencia={carregamento.dados} />
      )}
    </Tela>
  );
}

const styles = StyleSheet.create({
  resumo: {
    backgroundColor: cores.fundo,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacos.md,
    gap: espacos.sm,
  },
  linhaResumo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
  },
  numero: {
    ...textos.apoio,
    color: cores.textoSuave,
  },
  tituloResumo: {
    ...textos.tituloCartao,
    fontSize: 18,
    color: cores.texto,
  },
  meta: {
    ...textos.corpo,
    color: cores.textoSuave,
  },
  triagem: {
    ...textos.corpoForte,
    color: cores.texto,
  },
  descricao: {
    ...textos.corpo,
    color: cores.textoSuave,
  },
  secao: {
    gap: espacos.sm,
  },
  rotulo: {
    ...textos.rotulo,
    color: cores.texto,
  },
  opcoes: {
    gap: espacos.sm,
  },
  erro: {
    ...textos.legenda,
    color: cores.erro,
  },
});
