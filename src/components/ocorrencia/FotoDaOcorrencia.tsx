import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Botao, Icone } from '@/components/ui';
import { useFotoProtegida } from '@/hooks/useFotoProtegida';
import { cores, espacos, raios, textos } from '@/theme';
import type { FotoOcorrencia } from '@/types/api';

interface FotoDaOcorrenciaProps {
  foto?: FotoOcorrencia | null;
  uriLocal?: string | null;
  altura?: number;
  textoVazio?: string;
  aoTocar?: () => void;
}

export function FotoDaOcorrencia({
  foto,
  uriLocal,
  altura = 200,
  textoVazio = 'Foto enviada pelo produtor',
  aoTocar,
}: FotoDaOcorrenciaProps) {
  const protegida = useFotoProtegida(uriLocal ? null : foto);
  const [uriComFalha, setUriComFalha] = useState<string | null>(null);

  const uri = uriLocal ?? protegida.uri;
  const falhouAoExibir = uri !== null && uri === uriComFalha;
  const erro =
    protegida.erro ?? (falhouAoExibir ? 'A foto chegou, mas não pôde ser exibida.' : null);

  if (protegida.carregando) {
    return (
      <View style={[styles.vazio, { height: altura }]} accessibilityLabel="Carregando a foto">
        <ActivityIndicator color={cores.acao} />
        <Text style={styles.textoVazio}>Carregando a foto...</Text>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={[styles.vazio, { height: altura }]}>
        <Icone nome="alert-circle" tamanho={28} cor={cores.textoApoio} />
        <Text style={styles.textoVazio}>Não foi possível abrir a foto</Text>
        <Text style={styles.detalhe}>{erro}</Text>
        <Botao
          titulo="Tentar de novo"
          icone="refresh-cw"
          variante="texto"
          compacto
          onPress={() => {
            setUriComFalha(null);
            protegida.tentarDeNovo();
          }}
        />
      </View>
    );
  }

  if (!uri) {
    return (
      <View style={[styles.vazio, { height: altura }]} accessibilityLabel={textoVazio}>
        <Icone nome="image" tamanho={28} cor={cores.textoApoio} />
        <Text style={styles.textoVazio}>{textoVazio}</Text>
      </View>
    );
  }

  const imagem = (
    <Image
      source={{ uri }}
      style={[styles.foto, { height: altura }]}
      resizeMode="cover"
      onError={() => setUriComFalha(uri)}
      accessibilityRole="image"
      accessibilityLabel="Foto da folha afetada"
    />
  );

  if (!aoTocar) {
    return imagem;
  }

  return (
    <Pressable
      onPress={aoTocar}
      accessibilityRole="imagebutton"
      accessibilityLabel="Ampliar a foto da folha afetada"
      style={({ pressed }) => pressed && styles.pressionado}
    >
      {imagem}
      <View style={styles.selo} pointerEvents="none">
        <Icone nome="maximize-2" tamanho={14} cor={cores.textoSobreEscuro} />
        <Text style={styles.textoSelo}>Ampliar</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  foto: {
    width: '100%',
    borderRadius: raios.lg,
    backgroundColor: cores.neutroFundo,
  },
  vazio: {
    width: '100%',
    borderRadius: raios.lg,
    backgroundColor: cores.neutroFundo,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacos.xs,
    paddingHorizontal: espacos.lg,
  },
  textoVazio: {
    ...textos.apoio,
    color: cores.textoSuave,
  },
  detalhe: {
    ...textos.legenda,
    color: cores.textoApoio,
    textAlign: 'center',
  },
  pressionado: {
    opacity: 0.85,
  },
  selo: {
    position: 'absolute',
    right: espacos.sm,
    bottom: espacos.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.xs,
    paddingHorizontal: espacos.sm,
    paddingVertical: espacos.xs,
    borderRadius: raios.pilula,
    backgroundColor: cores.sobreposicao,
  },
  textoSelo: {
    ...textos.etiqueta,
    color: cores.textoSobreEscuro,
  },
});
