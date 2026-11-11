import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Icone } from '@/components/ui';
import { obterToken } from '@/services/api';
import { enderecoDaFoto } from '@/services/ocorrencias';
import { cores, espacos, raios, textos } from '@/theme';
import type { FotoOcorrencia } from '@/types/api';

interface FotoDaOcorrenciaProps {
  foto?: FotoOcorrencia | null;
  uriLocal?: string | null;
  altura?: number;
  textoVazio?: string;
}

export function FotoDaOcorrencia({
  foto,
  uriLocal,
  altura = 200,
  textoVazio = 'Foto enviada pelo produtor',
}: FotoDaOcorrenciaProps) {
  const [falhou, setFalhou] = useState(false);
  const token = obterToken();

  const fonte = uriLocal
    ? { uri: uriLocal }
    : foto && !falhou
      ? {
          uri: enderecoDaFoto(foto),
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      : null;

  if (!fonte) {
    return (
      <View style={[styles.vazio, { height: altura }]} accessibilityLabel={textoVazio}>
        <Icone nome="image" tamanho={28} cor={cores.textoApoio} />
        <Text style={styles.textoVazio}>{falhou ? 'Não foi possível abrir a foto' : textoVazio}</Text>
      </View>
    );
  }

  return (
    <Image
      source={fonte}
      style={[styles.foto, { height: altura }]}
      resizeMode="cover"
      onError={() => setFalhou(true)}
      accessibilityRole="image"
      accessibilityLabel="Foto da folha afetada"
    />
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
  },
  textoVazio: {
    ...textos.apoio,
    color: cores.textoSuave,
  },
});
