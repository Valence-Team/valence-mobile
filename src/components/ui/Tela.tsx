import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { ReactElement, ReactNode } from 'react';
import type { RefreshControlProps, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cores, espacos, margemTela } from '@/theme';

interface TelaProps {
  children: ReactNode;
  cabecalho?: ReactNode;
  rodape?: ReactNode;
  fundo?: string;
  semMargem?: boolean;
  estiloConteudo?: StyleProp<ViewStyle>;
  controleAtualizacao?: ReactElement<RefreshControlProps>;
}

export function Tela({
  children,
  cabecalho,
  rodape,
  fundo = cores.fundo,
  semMargem = false,
  estiloConteudo,
  controleAtualizacao,
}: TelaProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tela, { backgroundColor: fundo }]}>
      {cabecalho}
      <KeyboardAvoidingView
        style={styles.tela}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          refreshControl={controleAtualizacao}
          contentContainerStyle={[
            !semMargem && styles.conteudo,
            { paddingBottom: (rodape ? espacos.md : insets.bottom + espacos.xxl) },
            estiloConteudo,
          ]}
        >
          {children}
        </ScrollView>
        {rodape}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
  },
  conteudo: {
    paddingHorizontal: margemTela,
    paddingTop: espacos.lg,
    gap: espacos.lg,
  },
});
