import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { Icone, type NomeIcone } from './Icone';
import { alturas, cores, espacos, raios, textos } from '@/theme';

type Variante = 'primario' | 'contorno' | 'perigo' | 'texto';

interface BotaoProps {
  titulo: string;
  onPress?: () => void;
  variante?: Variante;
  icone?: NomeIcone;
  carregando?: boolean;
  desabilitado?: boolean;
  compacto?: boolean;
  estilo?: StyleProp<ViewStyle>;
  rotuloAcessivel?: string;
}

const paletas: Record<Variante, { fundo: string; pressionado: string; borda: string; texto: string }> =
  {
    primario: {
      fundo: cores.acao,
      pressionado: cores.acaoPressionada,
      borda: cores.acao,
      texto: cores.textoSobreAcao,
    },
    contorno: {
      fundo: cores.superficie,
      pressionado: cores.acaoSuave,
      borda: cores.acao,
      texto: cores.acao,
    },
    perigo: {
      fundo: cores.superficie,
      pressionado: cores.erroFundo,
      borda: cores.erroBorda,
      texto: cores.erro,
    },
    texto: {
      fundo: 'transparent',
      pressionado: cores.acaoSuave,
      borda: 'transparent',
      texto: cores.acao,
    },
  };

export function Botao({
  titulo,
  onPress,
  variante = 'primario',
  icone,
  carregando = false,
  desabilitado = false,
  compacto = false,
  estilo,
  rotuloAcessivel,
}: BotaoProps) {
  const paleta = paletas[variante];
  const inativo = desabilitado || carregando;

  return (
    <Pressable
      onPress={onPress}
      disabled={inativo}
      accessibilityRole="button"
      accessibilityLabel={rotuloAcessivel ?? titulo}
      accessibilityState={{ disabled: inativo, busy: carregando }}
      style={({ pressed }) => [
        styles.base,
        compacto && styles.compacto,
        {
          backgroundColor: pressed ? paleta.pressionado : paleta.fundo,
          borderColor: paleta.borda,
        },
        variante === 'texto' && styles.semBorda,
        inativo && !carregando && styles.inativo,
        estilo,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={paleta.texto} />
      ) : (
        <>
          {icone ? <Icone nome={icone} tamanho={18} cor={paleta.texto} /> : null}
          <Text style={[styles.texto, { color: paleta.texto }]} numberOfLines={1}>
            {titulo}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: alturas.botao,
    borderRadius: raios.md,
    borderWidth: 1.5,
    paddingHorizontal: espacos.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacos.xs,
  },
  compacto: {
    minHeight: alturas.botaoPequeno,
    paddingHorizontal: espacos.md,
  },
  semBorda: {
    borderWidth: 0,
  },
  inativo: {
    opacity: 0.5,
  },
  texto: {
    ...textos.botao,
  },
});
