import { StyleSheet, Text, View } from 'react-native';

import { cores, espacos, textos } from '@/theme';

interface BarraSeveridadeProps {
  valor?: number | null;
  mostrarTexto?: boolean;
}

export function BarraSeveridade({ valor, mostrarTexto = true }: BarraSeveridadeProps) {
  const nivel = typeof valor === 'number' ? Math.min(Math.max(Math.round(valor), 0), 5) : 0;
  const texto = nivel > 0 ? `Severidade ${nivel} de 5` : 'Sem severidade';

  return (
    <View
      style={styles.linha}
      accessible
      accessibilityRole="text"
      accessibilityLabel={texto}
    >
      <View style={styles.segmentos}>
        {[1, 2, 3, 4, 5].map((posicao) => (
          <View
            key={posicao}
            style={[
              styles.segmento,
              {
                backgroundColor:
                  posicao <= nivel ? cores.severidadeAtiva : cores.severidadeInativa,
              },
            ]}
          />
        ))}
      </View>
      {mostrarTexto ? <Text style={styles.texto}>{texto}</Text> : null}
    </View>
  );
}

interface BarraProgressoProps {
  valor: number;
  cor?: string;
}

export function BarraProgresso({ valor, cor = cores.acao }: BarraProgressoProps) {
  const fracao = valor > 1 ? valor / 100 : valor;
  const largura = `${Math.min(Math.max(fracao, 0), 1) * 100}%` as const;

  return (
    <View style={styles.trilho} accessibilityElementsHidden importantForAccessibility="no">
      <View style={[styles.preenchimento, { width: largura, backgroundColor: cor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
  },
  segmentos: {
    flexDirection: 'row',
    gap: 4,
  },
  segmento: {
    width: 16,
    height: 8,
    borderRadius: 3,
  },
  texto: {
    ...textos.apoio,
    color: cores.textoSuave,
  },
  trilho: {
    height: 6,
    borderRadius: 3,
    backgroundColor: cores.neutroFundo,
    overflow: 'hidden',
  },
  preenchimento: {
    height: 6,
    borderRadius: 3,
  },
});
