import { Redirect } from 'expo-router';

import { useAutenticacao } from '@/contexts/AutenticacaoContext';
import { rotaInicialDoPapel } from '@/navigation/rotas';

export default function Entrada() {
  const { usuario } = useAutenticacao();

  if (!usuario) {
    return <Redirect href="/login" />;
  }
  return <Redirect href={rotaInicialDoPapel(usuario.papel)} />;
}
