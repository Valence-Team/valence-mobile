import { Alert, Platform, type AlertButton } from 'react-native';

// Na web o Alert.alert não exibe diálogo
export function alertar(titulo: string, mensagem?: string, botoes?: AlertButton[]): void {
  if (Platform.OS !== 'web') {
    Alert.alert(titulo, mensagem, botoes);
    return;
  }

  const texto = mensagem ? `${titulo}\n\n${mensagem}` : titulo;
  const acoes = (botoes ?? []).filter((botao) => botao.style !== 'cancel');
  const cancelar = botoes?.find((botao) => botao.style === 'cancel');

  if (acoes.length === 0) {
    window.alert(texto);
    cancelar?.onPress?.();
    return;
  }

  if (acoes.length === 1) {
    if (window.confirm(texto)) {
      acoes[0].onPress?.();
    } else {
      cancelar?.onPress?.();
    }
    return;
  }

  for (const acao of acoes) {
    if (window.confirm(`${texto}\n\n${acao.text ?? 'Confirmar'}?`)) {
      acao.onPress?.();
      return;
    }
  }
  cancelar?.onPress?.();
}
