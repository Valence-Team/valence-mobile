import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Aviso, BarraProgresso, BarraSeveridade, Cartao, Etiqueta, Icone } from '@/components/ui';
import { cores, espacos, textos } from '@/theme';
import type { Triagem } from '@/types/api';
import type { StatusOcorrencia } from '@/types/dominio';
import { formatarPercentual } from '@/utils/formatadores';
import { mensagemMotivoImagem } from '@/utils/rotulos';

interface CartaoTriagemProps {
  triagem?: Triagem | null;
  status: StatusOcorrencia;
}

export function CartaoTriagem({ triagem, status }: CartaoTriagemProps) {
  if (!triagem || triagem.hipoteses.length === 0) {
    const emAndamento = status === 'RECEBIDA';
    return (
      <Cartao estilo={styles.cartao}>
        <View style={styles.topo}>
          <Text style={styles.titulo}>Triagem da IA</Text>
          <Etiqueta texto={emAndamento ? 'Em andamento' : 'Sem triagem'} tom="neutro" />
        </View>
        {triagem?.motivoImagem ? (
          <Aviso tom="aviso" icone="camera-off" texto={mensagemMotivoImagem[triagem.motivoImagem]} />
        ) : null}
        <Text style={styles.texto}>
          {emAndamento
            ? 'A IA está analisando a foto e a descrição. Puxe a tela para baixo para atualizar.'
            : 'Não houve triagem automática. Um agrônomo da região vai analisar o caso pela descrição.'}
        </Text>
      </Cartao>
    );
  }

  const fontes = (triagem.fontes ?? []).filter((fonte) => fonte.url || fonte.titulo);

  return (
    <Cartao estilo={styles.cartao}>
      <View style={styles.topo}>
        <Text style={styles.titulo}>Triagem da IA</Text>
        <Etiqueta texto="Suspeita" tom="aviso" />
      </View>

      {triagem.motivoImagem ? (
        <Aviso tom="aviso" icone="camera-off" texto={mensagemMotivoImagem[triagem.motivoImagem]} />
      ) : null}

      <Text style={styles.subtitulo}>Hipóteses</Text>
      <View style={styles.hipoteses}>
        {triagem.hipoteses.map((hipotese) => (
          <View
            key={hipotese.praga}
            style={styles.hipotese}
            accessible
            accessibilityLabel={`${hipotese.praga}, ${formatarPercentual(hipotese.probabilidade)}`}
          >
            <View style={styles.linhaHipotese}>
              <Text style={styles.nomeHipotese}>{hipotese.praga}</Text>
              <Text style={styles.percentual}>{formatarPercentual(hipotese.probabilidade)}</Text>
            </View>
            <BarraProgresso valor={hipotese.probabilidade} />
          </View>
        ))}
      </View>

      <BarraSeveridade valor={triagem.severidade} />

      {triagem.cuidadosImediatos.length > 0 ? (
        <>
          <Text style={styles.subtitulo}>Cuidados imediatos</Text>
          <View style={styles.cuidados}>
            {triagem.cuidadosImediatos.map((cuidado) => (
              <View key={cuidado} style={styles.cuidado}>
                <Icone nome="check" tamanho={18} cor={cores.sucesso} />
                <Text style={styles.textoCuidado}>{cuidado}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}

      {triagem.explicacao ? (
        <>
          <Text style={styles.subtitulo}>Por que essa suspeita</Text>
          <Text style={styles.texto}>{triagem.explicacao}</Text>
        </>
      ) : null}

      {fontes.length > 0 ? (
        <View style={styles.fontes}>
          <Text style={styles.subtitulo}>Fontes</Text>
          {fontes.map((fonte, indice) => {
            const rotulo = [fonte.titulo, fonte.fonte].filter(Boolean).join(' · ');
            const url = fonte.url;
            return url ? (
              <Pressable
                key={`${url}-${indice}`}
                onPress={() => Linking.openURL(url)}
                accessibilityRole="link"
                style={styles.fonte}
              >
                <Icone nome="external-link" tamanho={16} cor={cores.acao} />
                <Text style={styles.textoFonte}>{rotulo || url}</Text>
              </Pressable>
            ) : (
              <Text key={`${rotulo}-${indice}`} style={styles.texto}>
                {rotulo}
              </Text>
            );
          })}
        </View>
      ) : null}

      <Text style={styles.nota}>A triagem é uma suspeita. Só o agrônomo confirma o diagnóstico.</Text>
    </Cartao>
  );
}

const styles = StyleSheet.create({
  cartao: {
    gap: espacos.sm,
    padding: espacos.lg,
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espacos.sm,
  },
  titulo: {
    ...textos.tituloSecao,
    color: cores.texto,
  },
  subtitulo: {
    ...textos.rotulo,
    color: cores.textoSuave,
    marginTop: espacos.xxs,
  },
  hipoteses: {
    gap: espacos.md,
  },
  hipotese: {
    gap: espacos.xs,
  },
  linhaHipotese: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: espacos.sm,
  },
  nomeHipotese: {
    ...textos.corpo,
    color: cores.texto,
    flex: 1,
  },
  percentual: {
    ...textos.corpoForte,
    color: cores.texto,
  },
  cuidados: {
    gap: espacos.xs,
  },
  cuidado: {
    flexDirection: 'row',
    gap: espacos.sm,
    alignItems: 'flex-start',
  },
  textoCuidado: {
    ...textos.corpoGrande,
    color: cores.texto,
    flex: 1,
  },
  texto: {
    ...textos.corpo,
    color: cores.textoSuave,
  },
  fontes: {
    gap: espacos.xs,
  },
  fonte: {
    flexDirection: 'row',
    gap: espacos.xs,
    alignItems: 'center',
    minHeight: 32,
  },
  textoFonte: {
    ...textos.link,
    color: cores.acao,
    flex: 1,
  },
  nota: {
    ...textos.apoio,
    color: cores.textoSuave,
    marginTop: espacos.xxs,
  },
});
