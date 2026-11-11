import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { StyleProp, TextInputProps, ViewStyle } from 'react-native';

import { Icone, type NomeIcone } from './Icone';
import { alturas, cores, espacos, fontes, raios, textos } from '@/theme';

interface CampoTextoProps extends Omit<
  TextInputProps,
  'style' | 'value' | 'onChangeText' | 'secureTextEntry' | 'multiline' | 'maxLength'
> {
  rotulo: string;
  valor: string;
  aoMudar: (texto: string) => void;
  icone?: NomeIcone;
  erro?: string;
  ajuda?: string;
  segredo?: boolean;
  multilinha?: boolean;
  limite?: number;
  estilo?: StyleProp<ViewStyle>;
}

export function CampoTexto({
  rotulo,
  valor,
  aoMudar,
  icone,
  erro,
  ajuda,
  segredo = false,
  multilinha = false,
  limite,
  estilo,
  onFocus,
  onBlur,
  editable = true,
  ...props
}: CampoTextoProps) {
  const [focado, setFocado] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  const corBorda = erro ? cores.erro : focado ? cores.acao : cores.bordaCampo;

  return (
    <View style={[styles.container, estilo]}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <View
        style={[
          styles.caixa,
          multilinha && styles.caixaMultilinha,
          { borderColor: corBorda, borderWidth: focado || erro ? 1.5 : 1 },
          !editable && styles.caixaInativa,
        ]}
      >
        {icone && !multilinha ? <Icone nome={icone} tamanho={20} cor={cores.textoApoio} /> : null}
        <TextInput
          {...props}
          value={valor}
          onChangeText={aoMudar}
          editable={editable}
          secureTextEntry={segredo && !senhaVisivel}
          multiline={multilinha}
          maxLength={limite}
          accessibilityLabel={rotulo}
          accessibilityHint={erro ?? ajuda}
          placeholderTextColor={cores.textoApoio}
          textAlignVertical={multilinha ? 'top' : 'center'}
          onFocus={(evento) => {
            setFocado(true);
            onFocus?.(evento);
          }}
          onBlur={(evento) => {
            setFocado(false);
            onBlur?.(evento);
          }}
          style={[styles.entrada, multilinha && styles.entradaMultilinha]}
        />
        {segredo ? (
          <Pressable
            onPress={() => setSenhaVisivel((atual) => !atual)}
            accessibilityRole="button"
            accessibilityLabel={senhaVisivel ? 'Esconder senha' : 'Mostrar senha'}
            hitSlop={12}
            style={styles.botaoOlho}
          >
            <Icone nome={senhaVisivel ? 'eye-off' : 'eye'} tamanho={20} cor={cores.textoApoio} />
          </Pressable>
        ) : null}
        {multilinha && limite ? (
          <Text style={styles.contador} accessibilityElementsHidden>
            {valor.length}/{limite}
          </Text>
        ) : null}
      </View>
      {erro ? (
        <Text style={styles.erro} accessibilityLiveRegion="polite">
          {erro}
        </Text>
      ) : ajuda ? (
        <Text style={styles.ajuda}>{ajuda}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: espacos.xs,
  },
  rotulo: {
    ...textos.rotulo,
    color: cores.texto,
  },
  caixa: {
    minHeight: alturas.campo,
    borderRadius: raios.md,
    backgroundColor: cores.superficie,
    paddingHorizontal: espacos.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
  },
  caixaMultilinha: {
    minHeight: 128,
    alignItems: 'flex-start',
    paddingTop: espacos.sm,
    paddingBottom: espacos.xl,
  },
  caixaInativa: {
    backgroundColor: cores.neutroFundo,
  },
  entrada: {
    flex: 1,
    fontFamily: fontes.regular,
    fontSize: 16,
    color: cores.texto,
    paddingVertical: espacos.sm,
  },
  entradaMultilinha: {
    minHeight: 96,
    paddingVertical: 0,
    lineHeight: 22,
  },
  botaoOlho: {
    minHeight: alturas.toque,
    justifyContent: 'center',
  },
  contador: {
    ...textos.legenda,
    color: cores.textoApoio,
    position: 'absolute',
    right: espacos.md,
    bottom: espacos.xs,
  },
  erro: {
    ...textos.legenda,
    color: cores.erro,
  },
  ajuda: {
    ...textos.legenda,
    color: cores.textoSuave,
  },
});
