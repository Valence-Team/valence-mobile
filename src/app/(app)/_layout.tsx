import { Stack } from 'expo-router';

import { useAutenticacao } from '@/contexts/AutenticacaoContext';
import { cores } from '@/theme';

export default function LayoutAplicativo() {
  const { usuario } = useAutenticacao();
  const papel = usuario?.papel;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.fundo } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="ocorrencia/[id]/index" />
      <Stack.Protected guard={papel === 'PRODUTOR'}>
        <Stack.Screen name="ocorrencia/nova" />
        <Stack.Screen name="ocorrencia/[id]/editar" />
        <Stack.Screen name="propriedade/nova" />
        <Stack.Screen name="propriedade/[id]" />
      </Stack.Protected>
      <Stack.Protected guard={papel === 'AGRONOMO'}>
        <Stack.Screen name="ocorrencia/[id]/laudo" />
      </Stack.Protected>
      <Stack.Screen name="publicacao/[id]/index" />
      <Stack.Screen name="publicacao/[id]/editar" />
      <Stack.Screen
        name="publicacao/[id]/denunciar"
        options={{
          presentation: 'transparentModal',
          animation: 'fade',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Stack.Screen name="editar-perfil" />
      <Stack.Screen name="observatorio" />
      <Stack.Screen name="sobre" />
    </Stack>
  );
}
