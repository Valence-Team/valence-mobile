import Constants from 'expo-constants';
import { StyleSheet, Text, View } from 'react-native';

import { BarraTopo, Cartao, Logo, Tela } from '@/components/ui';
import { ambiente } from '@/config/ambiente';
import { cores, espacos, fontes, textos } from '@/theme';

const integrantes = [
  { nome: 'Henrique Martins', rm: 'RM 563620' },
  { nome: 'Guilherme Macedo', rm: 'RM 562396' },
  { nome: 'Pedro Henrique', rm: 'RM 563405' },
];

function lerHashDoCommit(): string {
  const extra = Constants.expoConfig?.extra as { commitHash?: string } | undefined;
  return extra?.commitHash ?? 'indisponível';
}

function Linha({ rotulo, valor, monoespacado = false }: {
  rotulo: string;
  valor: string;
  monoespacado?: boolean;
}) {
  return (
    <View style={styles.linha}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <Text style={[styles.valor, monoespacado && styles.monoespacado]} selectable>
        {valor}
      </Text>
    </View>
  );
}

export default function TelaSobre() {
  const versao = Constants.expoConfig?.version ?? '1.0.0';
  const hash = lerHashDoCommit();

  return (
    <Tela cabecalho={<BarraTopo titulo="Sobre o App" />}>
      <View style={styles.marca}>
        <Logo variante="escuro" altura={44} />
        <Text style={styles.descricao}>
          Rede pública e colaborativa de vigilância fitossanitária para pequenos produtores de
          milho, tomate e batata.
        </Text>
      </View>

      <Cartao estilo={styles.cartao}>
        <Linha rotulo="Versão do app" valor={versao} />
        <Linha rotulo="Commit de referência" valor={hash} monoespacado />
        <Linha rotulo="Servidor da API" valor={ambiente.apiUrl || 'não configurado'} />
      </Cartao>

      <Cartao estilo={styles.cartao}>
        <Text style={styles.titulo}>Como funciona</Text>
        <Text style={styles.texto}>
          O produtor registra o dano com foto. A IA faz a triagem, os vizinhos recebem um alerta de
          suspeita e um agrônomo confirma ou descarta o caso. Focos confirmados viram dados abertos,
          sem dados pessoais.
        </Text>
      </Cartao>

      <Cartao estilo={styles.cartao}>
        <Text style={styles.titulo}>Equipe Valence</Text>
        {integrantes.map((integrante) => (
          <View key={integrante.rm} style={styles.integrante}>
            <Text style={styles.nome}>{integrante.nome}</Text>
            <Text style={styles.rm}>{integrante.rm}</Text>
          </View>
        ))}
      </Cartao>

      <Text style={styles.rodape}>
        Global Solution FIAP 2026/2 · CitizenTech · ODS 2, 9, 10 e 13
      </Text>
    </Tela>
  );
}

const styles = StyleSheet.create({
  marca: {
    alignItems: 'center',
    gap: espacos.md,
    paddingVertical: espacos.md,
  },
  descricao: {
    ...textos.corpo,
    color: cores.textoSuave,
    textAlign: 'center',
  },
  cartao: {
    gap: espacos.sm,
    padding: espacos.lg,
  },
  linha: {
    gap: 2,
  },
  rotulo: {
    ...textos.legenda,
    color: cores.textoSuave,
  },
  valor: {
    ...textos.corpoGrande,
    color: cores.texto,
  },
  monoespacado: {
    fontFamily: fontes.seminegrito,
    letterSpacing: 1,
  },
  titulo: {
    ...textos.tituloSecao,
    color: cores.texto,
  },
  texto: {
    ...textos.corpo,
    color: cores.textoSuave,
  },
  integrante: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: espacos.sm,
  },
  nome: {
    ...textos.corpo,
    color: cores.texto,
  },
  rm: {
    ...textos.corpoForte,
    color: cores.textoSuave,
  },
  rodape: {
    ...textos.legenda,
    color: cores.textoApoio,
    textAlign: 'center',
  },
});
