import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { FotoDaOcorrencia } from './FotoDaOcorrencia';
import { VisualizadorDeFotos } from './VisualizadorDeFotos';
import { Icone } from '@/components/ui';
import { useFotoProtegida } from '@/hooks/useFotoProtegida';
import { cores, espacos, raios } from '@/theme';
import type { FotoOcorrencia } from '@/types/api';

interface GaleriaDaOcorrenciaProps {
  fotos: FotoOcorrencia[];
  altura?: number;
  textoVazio?: string;
}

function Miniatura({ foto }: { foto: FotoOcorrencia }) {
  const { uri, carregando } = useFotoProtegida(foto);

  if (uri) {
    return <Image source={{ uri }} style={styles.miniatura} resizeMode="cover" />;
  }
  return (
    <View style={[styles.miniatura, styles.miniaturaVazia]}>
      {carregando ? (
        <ActivityIndicator size="small" color={cores.acao} />
      ) : (
        <Icone nome="image" tamanho={18} cor={cores.textoApoio} />
      )}
    </View>
  );
}

export function GaleriaDaOcorrencia({ fotos, altura, textoVazio }: GaleriaDaOcorrenciaProps) {
  const [aberta, setAberta] = useState<number | null>(null);
  const principal = fotos[0];

  return (
    <View style={styles.galeria}>
      <FotoDaOcorrencia
        foto={principal}
        altura={altura}
        textoVazio={textoVazio}
        aoTocar={principal ? () => setAberta(0) : undefined}
      />
      {fotos.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.miniaturas}
        >
          {fotos.map((foto, indice) => (
            <Pressable
              key={foto.id}
              onPress={() => setAberta(indice)}
              accessibilityRole="imagebutton"
              accessibilityLabel={`Abrir a foto ${indice + 1} de ${fotos.length}`}
              style={({ pressed }) => pressed && styles.pressionado}
            >
              <Miniatura foto={foto} />
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
      <VisualizadorDeFotos
        fotos={fotos}
        indiceInicial={aberta ?? 0}
        visivel={aberta !== null}
        aoFechar={() => setAberta(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  galeria: {
    gap: espacos.sm,
  },
  miniaturas: {
    gap: espacos.sm,
  },
  miniatura: {
    width: 64,
    height: 64,
    borderRadius: raios.md,
    backgroundColor: cores.neutroFundo,
  },
  miniaturaVazia: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressionado: {
    opacity: 0.8,
  },
});
