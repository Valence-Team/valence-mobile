import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Botao, Icone } from '@/components/ui';
import { useFotoProtegida } from '@/hooks/useFotoProtegida';
import { cores, espacos, raios, textos } from '@/theme';
import type { FotoOcorrencia } from '@/types/api';

interface VisualizadorDeFotosProps {
  fotos: FotoOcorrencia[];
  indiceInicial: number;
  visivel: boolean;
  aoFechar: () => void;
}

export function VisualizadorDeFotos({
  fotos,
  indiceInicial,
  visivel,
  aoFechar,
}: VisualizadorDeFotosProps) {
  return (
    <Modal
      visible={visivel}
      animationType="fade"
      onRequestClose={aoFechar}
      statusBarTranslucent
      supportedOrientations={['portrait', 'landscape']}
    >
      {visivel && fotos.length > 0 ? (
        <ConteudoVisualizador fotos={fotos} indiceInicial={indiceInicial} aoFechar={aoFechar} />
      ) : null}
    </Modal>
  );
}

interface PaginaDaFotoProps {
  foto: FotoOcorrencia;
  posicao: number;
  largura: number;
  altura: number;
  alturaFoto: number;
}

function PaginaDaFoto({ foto, posicao, largura, altura, alturaFoto }: PaginaDaFotoProps) {
  const { uri, carregando, erro, tentarDeNovo } = useFotoProtegida(foto);

  return (
    <View style={[styles.pagina, { width: largura, height: altura }]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: largura, height: alturaFoto }}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel={`Foto ${posicao} da folha afetada`}
        />
      ) : carregando ? (
        <ActivityIndicator size="large" color={cores.textoSobreEscuro} />
      ) : (
        <View style={styles.falha}>
          <Icone nome="alert-circle" tamanho={28} cor={cores.textoSobreEscuro} />
          <Text style={styles.textoFalha}>{erro ?? 'Não foi possível abrir a foto'}</Text>
          <Botao
            titulo="Tentar de novo"
            icone="refresh-cw"
            compacto
            onPress={tentarDeNovo}
          />
        </View>
      )}
    </View>
  );
}

function ConteudoVisualizador({
  fotos,
  indiceInicial,
  aoFechar,
}: Omit<VisualizadorDeFotosProps, 'visivel'>) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [atual, setAtual] = useState(indiceInicial);

  return (
    <View style={styles.fundo}>
      <StatusBar style="light" />
      <FlatList
        data={fotos}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(foto) => String(foto.id)}
        initialScrollIndex={indiceInicial}
        getItemLayout={(_, indice) => ({ length: width, offset: width * indice, index: indice })}
        onMomentumScrollEnd={(evento) =>
          setAtual(Math.round(evento.nativeEvent.contentOffset.x / width))
        }
        renderItem={({ item, index }) => (
          <PaginaDaFoto
            foto={item}
            posicao={index + 1}
            largura={width}
            altura={height}
            alturaFoto={height - insets.top - insets.bottom - 120}
          />
        )}
      />
      <View style={[styles.topo, { paddingTop: insets.top + espacos.sm }]}>
        <Text style={styles.contador}>
          {fotos.length > 1 ? `Foto ${atual + 1} de ${fotos.length}` : 'Foto da ocorrência'}
        </Text>
        <Pressable
          onPress={aoFechar}
          accessibilityRole="button"
          accessibilityLabel="Fechar a foto"
          hitSlop={8}
          style={({ pressed }) => [styles.fechar, pressed && styles.pressionado]}
        >
          <Icone nome="x" tamanho={24} cor={cores.textoSobreEscuro} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: cores.fundoFoto,
  },
  pagina: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  falha: {
    alignItems: 'center',
    gap: espacos.sm,
    paddingHorizontal: espacos.xl,
  },
  textoFalha: {
    ...textos.apoio,
    color: cores.textoSobreEscuro,
    textAlign: 'center',
  },
  topo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: espacos.lg,
  },
  contador: {
    ...textos.rotulo,
    color: cores.textoSobreEscuro,
  },
  fechar: {
    width: 44,
    height: 44,
    borderRadius: raios.pilula,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.sobreposicao,
  },
  pressionado: {
    opacity: 0.7,
  },
});
