import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar, Cartao, Etiqueta, Icone } from '@/components/ui';
import { cores, espacos, imagens, textos } from '@/theme';
import type { Publicacao } from '@/types/api';
import { dividirTituloECorpo, formatarTempoRelativo } from '@/utils/formatadores';
import { descricaoPapel, rotuloPapel } from '@/utils/rotulos';

interface CartaoPublicacaoProps {
  publicacao: Publicacao;
  usuarioId: number | null;
  onPress?: () => void;
  aoDenunciar?: () => void;
}

function rotuloComentarios(total: number | undefined): string {
  const quantidade = total ?? 0;
  if (quantidade === 0) {
    return 'Comentar';
  }
  return quantidade === 1 ? '1 comentário' : `${quantidade} comentários`;
}

export function CartaoPublicacao({
  publicacao,
  usuarioId,
  onPress,
  aoDenunciar,
}: CartaoPublicacaoProps) {
  const casoConfirmado = Boolean(publicacao.ocorrenciaId);
  const ehAutor = usuarioId !== null && publicacao.autor.id === usuarioId;
  const { titulo, corpo } = casoConfirmado
    ? dividirTituloECorpo(publicacao.texto)
    : { titulo: null, corpo: publicacao.texto };

  return (
    <Cartao
      onPress={onPress}
      rotuloAcessivel={`Publicação de ${publicacao.autor.nome}`}
      corBorda={casoConfirmado ? cores.erroBorda : undefined}
      estilo={styles.cartao}
    >
      {casoConfirmado ? (
        <View style={styles.cabecalho}>
          <Image source={imagens.simbolo} style={styles.simbolo} resizeMode="contain" />
          <Text style={styles.valence} numberOfLines={1}>
            Valence · Caso confirmado
          </Text>
          <Etiqueta texto="Confirmado" tom="perigo" />
        </View>
      ) : (
        <View style={styles.cabecalho}>
          <Avatar nome={publicacao.autor.nome} />
          <View style={styles.autor}>
            <View style={styles.linhaNome}>
              <Text style={styles.nome} numberOfLines={1}>
                {publicacao.autor.nome}
              </Text>
              {publicacao.autor.papel !== 'PRODUTOR' ? (
                <Etiqueta texto={rotuloPapel[publicacao.autor.papel]} tom="info" />
              ) : null}
            </View>
            <Text style={styles.subtitulo}>
              {descricaoPapel[publicacao.autor.papel]} · {formatarTempoRelativo(publicacao.criadoEm)}
            </Text>
          </View>
        </View>
      )}

      {titulo ? <Text style={styles.titulo}>{titulo}</Text> : null}
      <Text style={styles.texto}>{corpo}</Text>

      <View style={styles.rodape}>
        <View style={styles.acao}>
          <Icone nome="message-circle" tamanho={18} cor={cores.textoSuave} />
          <Text style={styles.textoAcao}>{rotuloComentarios(publicacao.totalComentarios)}</Text>
        </View>
        {ehAutor ? (
          <Text style={styles.textoAcao}>Sua publicação</Text>
        ) : aoDenunciar && !casoConfirmado ? (
          <Pressable
            onPress={aoDenunciar}
            accessibilityRole="button"
            accessibilityLabel={`Denunciar publicação de ${publicacao.autor.nome}`}
            hitSlop={8}
            style={styles.acao}
          >
            <Icone nome="flag" tamanho={18} cor={cores.textoSuave} />
            <Text style={styles.textoAcao}>Denunciar</Text>
          </Pressable>
        ) : null}
      </View>
    </Cartao>
  );
}

const styles = StyleSheet.create({
  cartao: {
    gap: espacos.sm,
    padding: espacos.md,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
  },
  simbolo: {
    width: 20,
    height: 23,
  },
  valence: {
    ...textos.corpoForte,
    fontSize: 14,
    color: cores.textoSuave,
    flex: 1,
  },
  autor: {
    flex: 1,
    gap: 2,
  },
  linhaNome: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.xs,
  },
  nome: {
    ...textos.corpoForte,
    color: cores.texto,
    flexShrink: 1,
  },
  subtitulo: {
    ...textos.legenda,
    color: cores.textoSuave,
  },
  titulo: {
    ...textos.tituloCartao,
    color: cores.texto,
  },
  texto: {
    ...textos.corpo,
    color: cores.texto,
  },
  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: espacos.xs,
    minHeight: 32,
  },
  acao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.xs,
    minHeight: 32,
  },
  textoAcao: {
    ...textos.apoio,
    color: cores.textoSuave,
  },
});
