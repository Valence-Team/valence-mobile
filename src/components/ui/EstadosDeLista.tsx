import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Botao } from './Botao';
import { Icone, type NomeIcone } from './Icone';
import { cores, espacos, textos } from '@/theme';

export function Carregando({ texto = 'Carregando...' }: { texto?: string }) {
  return (
    <View style={styles.centro} accessibilityRole="progressbar" accessibilityLabel={texto}>
      <ActivityIndicator size="large" color={cores.acao} />
      <Text style={styles.textoApoio}>{texto}</Text>
    </View>
  );
}

interface EstadoVazioProps {
  icone?: NomeIcone;
  titulo: string;
  descricao?: string;
  acao?: { rotulo: string; onPress: () => void; icone?: NomeIcone };
}

export function EstadoVazio({ icone = 'inbox', titulo, descricao, acao }: EstadoVazioProps) {
  return (
    <View style={styles.centro}>
      <View style={styles.circulo}>
        <Icone nome={icone} tamanho={28} cor={cores.acao} />
      </View>
      <Text style={styles.titulo}>{titulo}</Text>
      {descricao ? <Text style={styles.textoApoio}>{descricao}</Text> : null}
      {acao ? (
        <Botao
          titulo={acao.rotulo}
          icone={acao.icone}
          onPress={acao.onPress}
          variante="contorno"
          compacto
          estilo={styles.botao}
        />
      ) : null}
    </View>
  );
}

interface EstadoErroProps {
  mensagem: string;
  aoTentarDeNovo: () => void;
}

export function EstadoErro({ mensagem, aoTentarDeNovo }: EstadoErroProps) {
  return (
    <View style={styles.centro} accessibilityRole="alert">
      <View style={[styles.circulo, styles.circuloErro]}>
        <Icone nome="wifi-off" tamanho={28} cor={cores.erro} />
      </View>
      <Text style={styles.titulo}>Não foi possível carregar</Text>
      <Text style={styles.textoApoio}>{mensagem}</Text>
      <Botao
        titulo="Tentar de novo"
        icone="refresh-cw"
        onPress={aoTentarDeNovo}
        variante="contorno"
        compacto
        estilo={styles.botao}
      />
    </View>
  );
}

interface RodapeListaProps {
  temMais: boolean;
  carregandoMais: boolean;
  aoCarregarMais: () => void;
}

export function RodapeLista({ temMais, carregandoMais, aoCarregarMais }: RodapeListaProps) {
  if (carregandoMais) {
    return (
      <View style={styles.rodape}>
        <ActivityIndicator color={cores.acao} />
      </View>
    );
  }
  if (!temMais) {
    return <View style={styles.espacoFinal} />;
  }
  return (
    <Pressable
      onPress={aoCarregarMais}
      accessibilityRole="button"
      style={({ pressed }) => [styles.rodape, pressed && styles.pressionado]}
    >
      <Text style={styles.carregarMais}>Carregar mais</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  centro: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: espacos.xxl,
    paddingHorizontal: espacos.xl,
    gap: espacos.sm,
  },
  circulo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: cores.acaoSuave,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espacos.xs,
  },
  circuloErro: {
    backgroundColor: cores.erroFundo,
  },
  titulo: {
    ...textos.tituloCartao,
    color: cores.texto,
    textAlign: 'center',
  },
  textoApoio: {
    ...textos.corpo,
    color: cores.textoSuave,
    textAlign: 'center',
  },
  botao: {
    marginTop: espacos.xs,
    alignSelf: 'center',
  },
  rodape: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 96,
  },
  pressionado: {
    opacity: 0.6,
  },
  carregarMais: {
    ...textos.botao,
    color: cores.acao,
  },
  espacoFinal: {
    height: 96,
  },
});
