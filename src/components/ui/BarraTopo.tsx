import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icone, type NomeIcone } from './Icone';
import { useEstiloBarraDeStatus } from '@/hooks/useEstiloBarraDeStatus';
import { alturas, cores, espacos, margemTela, textos } from '@/theme';

export interface AcaoBarraTopo {
  icone: NomeIcone;
  rotulo: string;
  onPress: () => void;
  cor?: string;
}

interface BarraTopoProps {
  titulo: string;
  acoes?: AcaoBarraTopo[];
  aoVoltar?: () => void;
  semVoltar?: boolean;
}

export function BarraTopo({ titulo, acoes = [], aoVoltar, semVoltar = false }: BarraTopoProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  useEstiloBarraDeStatus('dark');

  function voltar() {
    if (aoVoltar) {
      aoVoltar();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  return (
    <View style={[styles.barra, { paddingTop: insets.top + espacos.xs }]}>
      {semVoltar ? null : (
        <Pressable
          onPress={voltar}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={8}
          style={styles.botao}
        >
          <Icone nome="chevron-left" tamanho={26} cor={cores.texto} />
        </Pressable>
      )}
      <Text style={styles.titulo} numberOfLines={1} accessibilityRole="header">
        {titulo}
      </Text>
      <View style={styles.acoes}>
        {acoes.map((acao) => (
          <Pressable
            key={acao.rotulo}
            onPress={acao.onPress}
            accessibilityRole="button"
            accessibilityLabel={acao.rotulo}
            hitSlop={8}
            style={styles.botao}
          >
            <Icone nome={acao.icone} tamanho={22} cor={acao.cor ?? cores.textoSuave} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.xs,
    paddingHorizontal: margemTela - espacos.xs,
    paddingBottom: espacos.xs,
    backgroundColor: cores.superficie,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  botao: {
    width: alturas.toque,
    height: alturas.toque,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    ...textos.tituloBarra,
    color: cores.texto,
    flex: 1,
  },
  acoes: {
    flexDirection: 'row',
  },
});
