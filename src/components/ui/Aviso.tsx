import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { Icone, type NomeIcone } from './Icone';
import { cores, espacos, raios, textos } from '@/theme';

type TomAviso = 'info' | 'aviso' | 'erro' | 'sucesso';

const paletas: Record<TomAviso, { fundo: string; borda: string; texto: string; icone: NomeIcone }> = {
  info: { fundo: cores.acaoSuave, borda: cores.acaoBorda, texto: cores.acao, icone: 'info' },
  aviso: {
    fundo: cores.avisoFundo,
    borda: cores.avisoBorda,
    texto: cores.avisoTexto,
    icone: 'alert-triangle',
  },
  erro: { fundo: cores.erroFundo, borda: cores.erroBorda, texto: cores.erroTexto, icone: 'alert-circle' },
  sucesso: {
    fundo: cores.sucessoFundo,
    borda: cores.sucessoBorda,
    texto: cores.sucessoTexto,
    icone: 'check-circle',
  },
};

interface AvisoProps {
  texto: string;
  tom?: TomAviso;
  icone?: NomeIcone;
  acao?: { rotulo: string; onPress: () => void };
  estilo?: StyleProp<ViewStyle>;
}

export function Aviso({ texto, tom = 'info', icone, acao, estilo }: AvisoProps) {
  const paleta = paletas[tom];
  return (
    <View
      style={[styles.aviso, { backgroundColor: paleta.fundo, borderColor: paleta.borda }, estilo]}
      accessibilityRole={tom === 'erro' ? 'alert' : undefined}
    >
      <View style={styles.icone}>
        <Icone nome={icone ?? paleta.icone} tamanho={20} cor={paleta.texto} />
      </View>
      <View style={styles.conteudo}>
        <Text style={[styles.texto, { color: paleta.texto }]}>{texto}</Text>
        {acao ? (
          <Pressable
            onPress={acao.onPress}
            accessibilityRole="button"
            hitSlop={8}
            style={styles.acao}
          >
            <Text style={[styles.textoAcao, { color: paleta.texto }]}>{acao.rotulo}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  aviso: {
    flexDirection: 'row',
    gap: espacos.sm,
    borderWidth: 1,
    borderRadius: raios.md,
    paddingVertical: espacos.sm + 2,
    paddingHorizontal: espacos.md,
  },
  icone: {
    paddingTop: 1,
  },
  conteudo: {
    flex: 1,
    gap: espacos.xs,
  },
  texto: {
    ...textos.corpo,
  },
  acao: {
    alignSelf: 'flex-start',
  },
  textoAcao: {
    ...textos.link,
    textDecorationLine: 'underline',
  },
});
