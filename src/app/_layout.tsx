import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { ProvedorAutenticacao, useAutenticacao } from '@/contexts/AutenticacaoContext';
import { ProvedorFilaOffline } from '@/contexts/FilaOfflineContext';
import { arquivosDeFonte, cores } from '@/theme';

SplashScreen.preventAutoHideAsync();

function Navegacao({ fontesProntas }: { fontesProntas: boolean }) {
  const { autenticado, restaurando } = useAutenticacao();
  const pronto = fontesProntas && !restaurando;

  useEffect(() => {
    if (pronto) {
      SplashScreen.hideAsync();
    }
  }, [pronto]);

  if (!pronto) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.fundo } }}
      >
        <Stack.Screen name="index" />
        <Stack.Protected guard={!autenticado}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={autenticado}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function LayoutRaiz() {
  const [fontesCarregadas, erroFontes] = useFonts(arquivosDeFonte);

  return (
    <ProvedorAutenticacao>
      <ProvedorFilaOffline>
        <Navegacao fontesProntas={fontesCarregadas || Boolean(erroFontes)} />
      </ProvedorFilaOffline>
    </ProvedorAutenticacao>
  );
}
