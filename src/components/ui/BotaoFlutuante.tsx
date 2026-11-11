import { Pressable, StyleSheet } from 'react-native';

import { Icone, type NomeIcone } from './Icone';
import { cores, margemTela, sombras } from '@/theme';

interface BotaoFlutuanteProps {
  icone?: NomeIcone;
  rotulo: string;
  onPress: () => void;
}

export function BotaoFlutuante({ icone = 'plus', rotulo, onPress }: BotaoFlutuanteProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      style={({ pressed }) => [styles.botao, pressed && styles.pressionado]}
    >
      <Icone nome={icone} tamanho={28} cor={cores.textoSobreAcao} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    position: 'absolute',
    right: margemTela,
    bottom: margemTela,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: cores.acao,
    alignItems: 'center',
    justifyContent: 'center',
    ...sombras.flutuante,
  },
  pressionado: {
    backgroundColor: cores.acaoPressionada,
  },
});
