import { Tabs } from 'expo-router/js-tabs';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icone, type NomeIcone } from '@/components/ui';
import { useAutenticacao } from '@/contexts/AutenticacaoContext';
import { cores, fontes } from '@/theme';

interface PropsIconeDaAba {
  nome: NomeIcone;
  cor: string;
  ativo: boolean;
}

function IconeDaAba({ nome, cor, ativo }: PropsIconeDaAba) {
  return (
    <View style={[styles.pilula, ativo && styles.pilulaAtiva]}>
      <Icone nome={nome} tamanho={22} cor={cor} />
    </View>
  );
}

export default function LayoutAbas() {
  const { usuario } = useAutenticacao();
  const insets = useSafeAreaInsets();
  const papel = usuario?.papel;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: cores.acao,
        tabBarInactiveTintColor: cores.textoSuave,
        tabBarLabelStyle: styles.rotulo,
        tabBarStyle: [
          styles.barra,
          { height: 68 + insets.bottom, paddingBottom: insets.bottom + 8 },
        ],
      }}
    >
      <Tabs.Protected guard={papel === 'PRODUTOR'}>
        <Tabs.Screen
          name="inicio"
          options={{
            title: 'Início',
            tabBarIcon: ({ color, focused }) => (
              <IconeDaAba nome="home" cor={color} ativo={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="ocorrencias"
          options={{
            title: 'Ocorrências',
            tabBarIcon: ({ color, focused }) => (
              <IconeDaAba nome="clipboard" cor={color} ativo={focused} />
            ),
          }}
        />
      </Tabs.Protected>
      <Tabs.Protected guard={papel === 'AGRONOMO'}>
        <Tabs.Screen
          name="analises"
          options={{
            title: 'Análises',
            tabBarIcon: ({ color, focused }) => (
              <IconeDaAba nome="check-square" cor={color} ativo={focused} />
            ),
          }}
        />
      </Tabs.Protected>
      <Tabs.Protected guard={papel === 'AGRONOMO' || papel === 'GESTOR'}>
        <Tabs.Screen
          name="moderacao"
          options={{
            title: 'Moderação',
            tabBarIcon: ({ color, focused }) => (
              <IconeDaAba nome="shield" cor={color} ativo={focused} />
            ),
          }}
        />
      </Tabs.Protected>
      <Tabs.Screen
        name="mural"
        options={{
          title: 'Mural',
          tabBarIcon: ({ color, focused }) => (
            <IconeDaAba nome="message-square" cor={color} ativo={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <IconeDaAba nome="user" cor={color} ativo={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  barra: {
    paddingTop: 8,
    backgroundColor: cores.superficie,
    borderTopColor: cores.borda,
  },
  rotulo: {
    fontFamily: fontes.medio,
    fontSize: 12,
    marginTop: 2,
  },
  pilula: {
    width: 56,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pilulaAtiva: {
    backgroundColor: cores.acaoSuave,
  },
});
