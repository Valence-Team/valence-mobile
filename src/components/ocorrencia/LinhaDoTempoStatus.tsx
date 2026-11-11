import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icone } from '@/components/ui';
import { cores, espacos, fontes } from '@/theme';
import type { StatusOcorrencia } from '@/types/dominio';

type EstadoEtapa = 'concluida' | 'atual' | 'pendente';

interface Etapa {
  rotulo: string;
  estado: EstadoEtapa;
}

function montarEtapas(status: StatusOcorrencia, temTriagem: boolean): Etapa[] {
  const triada: EstadoEtapa = temTriagem ? 'concluida' : 'pendente';
  switch (status) {
    case 'RECEBIDA':
      return [
        { rotulo: 'Recebida', estado: 'concluida' },
        { rotulo: 'Triada', estado: 'atual' },
        { rotulo: 'Em análise', estado: 'pendente' },
        { rotulo: 'Laudo', estado: 'pendente' },
      ];
    case 'TRIADA':
      return [
        { rotulo: 'Recebida', estado: 'concluida' },
        { rotulo: 'Triada', estado: 'concluida' },
        { rotulo: 'Em análise', estado: 'atual' },
        { rotulo: 'Laudo', estado: 'pendente' },
      ];
    case 'EM_ANALISE':
      return [
        { rotulo: 'Recebida', estado: 'concluida' },
        { rotulo: 'Triada', estado: triada },
        { rotulo: 'Em análise', estado: 'atual' },
        { rotulo: 'Laudo', estado: 'pendente' },
      ];
    default:
      return [
        { rotulo: 'Recebida', estado: 'concluida' },
        { rotulo: 'Triada', estado: triada },
        { rotulo: 'Em análise', estado: 'concluida' },
        { rotulo: 'Laudo', estado: 'concluida' },
      ];
  }
}

interface LinhaDoTempoStatusProps {
  status: StatusOcorrencia;
  temTriagem: boolean;
}

export function LinhaDoTempoStatus({ status, temTriagem }: LinhaDoTempoStatusProps) {
  const etapas = montarEtapas(status, temTriagem);
  const descricao = etapas.map((etapa) => `${etapa.rotulo}: ${etapa.estado}`).join(', ');

  return (
    <View style={styles.linha} accessible accessibilityLabel={`Andamento. ${descricao}`}>
      {etapas.map((etapa, indice) => (
        <Fragment key={etapa.rotulo}>
          {indice > 0 ? (
            <View
              style={[
                styles.conector,
                {
                  backgroundColor:
                    etapa.estado === 'concluida' ? cores.sucesso : cores.severidadeInativa,
                },
              ]}
            />
          ) : null}
          <View style={styles.etapa}>
            <View
              style={[
                styles.circulo,
                etapa.estado === 'concluida' && styles.circuloConcluido,
                etapa.estado === 'atual' && styles.circuloAtual,
              ]}
            >
              {etapa.estado === 'concluida' ? (
                <Icone nome="check" tamanho={16} cor={cores.textoSobreAcao} />
              ) : null}
            </View>
            <Text
              style={[
                styles.rotulo,
                etapa.estado === 'atual' && styles.rotuloAtual,
                etapa.estado === 'pendente' && styles.rotuloPendente,
              ]}
              numberOfLines={1}
            >
              {etapa.rotulo}
            </Text>
          </View>
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  etapa: {
    alignItems: 'center',
    gap: espacos.xs,
    width: 72,
  },
  circulo: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: cores.severidadeInativa,
    backgroundColor: cores.superficie,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circuloConcluido: {
    backgroundColor: cores.sucesso,
    borderColor: cores.sucesso,
  },
  circuloAtual: {
    borderColor: cores.acao,
  },
  conector: {
    flex: 1,
    height: 2,
    marginTop: 14,
    marginHorizontal: -17,
  },
  rotulo: {
    fontFamily: fontes.medio,
    fontSize: 13,
    color: cores.texto,
  },
  rotuloAtual: {
    color: cores.acao,
  },
  rotuloPendente: {
    color: cores.textoApoio,
  },
});
