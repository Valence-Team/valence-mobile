import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Alert, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { CartaoPropriedade } from '@/components/propriedade/CartaoPropriedade';
import {
  Avatar,
  Botao,
  CabecalhoEscuro,
  Cartao,
  Carregando,
  EstadoErro,
  Etiqueta,
  Icone,
  RodapeLista,
  Tela,
  type NomeIcone,
} from '@/components/ui';
import { observatorioConfigurado } from '@/config/ambiente';
import { useAutenticacao } from '@/contexts/AutenticacaoContext';
import { useListaPaginada } from '@/hooks/useListaPaginada';
import { rotas } from '@/navigation/rotas';
import { listarPropriedades } from '@/services/propriedades';
import { cores, espacos, margemTela, textos } from '@/theme';
import { mascararTelefone } from '@/utils/mascaras';
import { rotuloPapel } from '@/utils/rotulos';

function LinhaDado({ icone, rotulo, valor }: { icone: NomeIcone; rotulo: string; valor: string }) {
  return (
    <View style={styles.linhaDado}>
      <Icone nome={icone} tamanho={20} cor={cores.textoSuave} />
      <View style={styles.textosDado}>
        <Text style={styles.rotuloDado}>{rotulo}</Text>
        <Text style={styles.valorDado}>{valor}</Text>
      </View>
    </View>
  );
}

function ItemMenu({
  icone,
  titulo,
  onPress,
}: {
  icone: NomeIcone;
  titulo: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.itemMenu, pressed && styles.itemMenuPressionado]}
    >
      <Icone nome={icone} tamanho={20} cor={cores.acao} />
      <Text style={styles.textoMenu}>{titulo}</Text>
      <Icone nome="chevron-right" tamanho={20} cor={cores.textoSuave} />
    </Pressable>
  );
}

function Secao({ titulo, descricao, children }: { titulo: string; descricao?: string; children: ReactNode }) {
  return (
    <View style={styles.secao}>
      <View style={styles.cabecalhoSecao}>
        <Text style={styles.tituloSecao} accessibilityRole="header">
          {titulo}
        </Text>
        {descricao ? <Text style={styles.descricaoSecao}>{descricao}</Text> : null}
      </View>
      {children}
    </View>
  );
}

export default function TelaPerfil() {
  const router = useRouter();
  const { usuario, sair } = useAutenticacao();
  const ehProdutor = usuario?.papel === 'PRODUTOR';
  const propriedades = useListaPaginada(
    ehProdutor ? 'propriedades' : 'sem-propriedades',
    (pagina) =>
      ehProdutor
        ? listarPropriedades(pagina)
        : Promise.resolve({ itens: [], pagina: 0, totalPaginas: 0, totalItens: 0, ultima: true }),
  );

  function confirmarSaida() {
    Alert.alert('Sair do Valence?', 'Você vai precisar entrar de novo com e-mail e senha.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => void sair() },
    ]);
  }

  if (!usuario) {
    return null;
  }

  return (
    <Tela
      semMargem
      controleAtualizacao={
        <RefreshControl
          refreshing={propriedades.atualizando}
          onRefresh={propriedades.recarregar}
          tintColor={cores.acao}
          colors={[cores.acao]}
        />
      }
    >
      <CabecalhoEscuro>
        <View style={styles.identidade}>
          <Avatar nome={usuario.nome} tamanho={64} />
          <View style={styles.textosIdentidade}>
            <Text style={styles.nome} accessibilityRole="header">
              {usuario.nome}
            </Text>
            <Etiqueta texto={rotuloPapel[usuario.papel]} tom="info" />
          </View>
        </View>
      </CabecalhoEscuro>

      <View style={styles.conteudo}>
        <Secao titulo="Meus dados">
          <Cartao estilo={styles.cartaoDados}>
            <LinhaDado icone="mail" rotulo="E-mail" valor={usuario.email} />
            <LinhaDado
              icone="phone"
              rotulo="Telefone"
              valor={usuario.telefone ? mascararTelefone(usuario.telefone) : 'Não informado'}
            />
            <LinhaDado
              icone="map-pin"
              rotulo="Município"
              valor={`${usuario.municipio} · ${usuario.uf}`}
            />
            <Botao
              titulo="Editar perfil"
              icone="edit-2"
              variante="contorno"
              compacto
              onPress={() => router.push(rotas.editarPerfil)}
            />
          </Cartao>
        </Secao>

        {ehProdutor ? (
          <Secao
            titulo="Minhas propriedades"
            descricao="Os alertas chegam para as propriedades cadastradas aqui."
          >
            {propriedades.carregando ? (
              <Carregando texto="Buscando propriedades..." />
            ) : propriedades.erro ? (
              <EstadoErro mensagem={propriedades.erro} aoTentarDeNovo={propriedades.tentarDeNovo} />
            ) : (
              <View style={styles.listaPropriedades}>
                {propriedades.itens.length === 0 ? (
                  <Text style={styles.vazio}>
                    Nenhuma propriedade ainda. Cadastre a primeira para registrar ocorrências e
                    receber alertas.
                  </Text>
                ) : (
                  propriedades.itens.map((propriedade) => (
                    <CartaoPropriedade
                      key={propriedade.id}
                      propriedade={propriedade}
                      onPress={() => router.push(rotas.propriedade(propriedade.id))}
                    />
                  ))
                )}
                {propriedades.temMais ? (
                  <RodapeLista
                    temMais={propriedades.temMais}
                    carregandoMais={propriedades.carregandoMais}
                    aoCarregarMais={propriedades.carregarMais}
                  />
                ) : null}
              </View>
            )}
            <Botao
              titulo="Nova propriedade"
              icone="plus"
              variante="contorno"
              onPress={() => router.push(rotas.novaPropriedade)}
            />
          </Secao>
        ) : null}

        <Secao titulo="Mais">
          <Cartao estilo={styles.cartaoMenu}>
            {observatorioConfigurado ? (
              <ItemMenu
                icone="bar-chart-2"
                titulo="Observatório público"
                onPress={() => router.push(rotas.observatorio)}
              />
            ) : null}
            <ItemMenu icone="info" titulo="Sobre o App" onPress={() => router.push(rotas.sobre)} />
          </Cartao>
        </Secao>

        <Botao titulo="Sair" icone="log-out" variante="perigo" onPress={confirmarSaida} />
      </View>
    </Tela>
  );
}

const styles = StyleSheet.create({
  identidade: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.md,
  },
  textosIdentidade: {
    flex: 1,
    gap: espacos.xs,
  },
  nome: {
    ...textos.tituloTela,
    color: cores.textoSobreEscuro,
  },
  conteudo: {
    paddingHorizontal: margemTela,
    paddingTop: espacos.xl,
    gap: espacos.xl,
  },
  secao: {
    gap: espacos.sm,
  },
  cabecalhoSecao: {
    gap: 2,
  },
  tituloSecao: {
    ...textos.tituloSecao,
    color: cores.texto,
  },
  descricaoSecao: {
    ...textos.apoio,
    color: cores.textoSuave,
  },
  cartaoDados: {
    gap: espacos.md,
  },
  linhaDado: {
    flexDirection: 'row',
    gap: espacos.sm,
    alignItems: 'center',
  },
  textosDado: {
    flex: 1,
  },
  rotuloDado: {
    ...textos.legenda,
    color: cores.textoSuave,
  },
  valorDado: {
    ...textos.corpoGrande,
    color: cores.texto,
  },
  listaPropriedades: {
    gap: espacos.sm,
  },
  vazio: {
    ...textos.corpo,
    color: cores.textoSuave,
  },
  cartaoMenu: {
    paddingVertical: espacos.xs,
  },
  itemMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
    minHeight: 52,
    borderRadius: 8,
  },
  itemMenuPressionado: {
    backgroundColor: cores.fundo,
  },
  textoMenu: {
    ...textos.corpoGrande,
    color: cores.texto,
    flex: 1,
  },
});
