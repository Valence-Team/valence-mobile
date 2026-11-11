import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Aviso, Botao, CabecalhoEscuro, CampoTexto, Logo, Tela } from '@/components/ui';
import { apiConfigurada } from '@/config/ambiente';
import { useAutenticacao } from '@/contexts/AutenticacaoContext';
import { rotas } from '@/navigation/rotas';
import { converterErro } from '@/services/api';
import { cores, espacos, margemTela, textos } from '@/theme';
import { temErros, validarEmail, type Erros } from '@/utils/validacoes';

type CampoLogin = 'email' | 'senha';

export default function TelaLogin() {
  const { entrar, avisoSessao, limparAvisoSessao } = useAutenticacao();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState<Erros<CampoLogin>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function aoEntrar() {
    const novosErros: Erros<CampoLogin> = {
      email: validarEmail(email),
      senha: senha.length === 0 ? 'Informe a senha.' : undefined,
    };
    setErros(novosErros);
    setErroGeral(null);
    if (temErros(novosErros)) {
      return;
    }

    setEnviando(true);
    limparAvisoSessao();
    try {
      await entrar(email, senha);
    } catch (erro) {
      const convertido = converterErro(erro);
      setErros({
        email: convertido.erroDoCampo('email'),
        senha: convertido.erroDoCampo('senha'),
      });
      setErroGeral(
        convertido.status === 401 ? 'E-mail ou senha inválidos.' : convertido.message,
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Tela fundo={cores.superficie} semMargem>
      <CabecalhoEscuro>
        <View style={styles.marca}>
          <Logo variante="claro" altura={40} />
        </View>
        <Text style={styles.chamada}>Rede pública de vigilância fitossanitária</Text>
        <Text style={styles.destaque}>O alerta que chega{'\n'}antes da praga.</Text>
      </CabecalhoEscuro>

      <View style={styles.formulario}>
        <View style={styles.cabecalho}>
          <Text style={styles.titulo} accessibilityRole="header">
            Entrar
          </Text>
          <Text style={styles.subtitulo}>Use o e-mail e a senha cadastrados no Valence.</Text>
        </View>

        {apiConfigurada ? null : (
          <Aviso
            tom="erro"
            texto="O endereço da API não foi configurado. Defina EXPO_PUBLIC_API_URL no arquivo .env e reinicie o Expo."
          />
        )}
        {avisoSessao ? <Aviso tom="aviso" icone="clock" texto={avisoSessao} /> : null}
        {erroGeral ? <Aviso tom="erro" texto={erroGeral} /> : null}

        <CampoTexto
          rotulo="E-mail"
          icone="mail"
          valor={email}
          aoMudar={setEmail}
          placeholder="voce@exemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          erro={erros.email}
        />
        <CampoTexto
          rotulo="Senha"
          icone="lock"
          valor={senha}
          aoMudar={setSenha}
          placeholder="Digite sua senha"
          segredo
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={aoEntrar}
          erro={erros.senha}
        />

        <Botao titulo="Entrar" onPress={aoEntrar} carregando={enviando} />

        <View style={styles.linhaCadastro}>
          <Text style={styles.textoCadastro}>Ainda não tem conta?</Text>
          <Link href={rotas.cadastro} style={styles.link} accessibilityRole="link">
            Criar conta de produtor
          </Link>
        </View>

        <Text style={styles.ajuda}>Agrônomos e gestores recebem o acesso pela equipe do Valence.</Text>
      </View>
    </Tela>
  );
}

const styles = StyleSheet.create({
  marca: {
    marginBottom: espacos.xl,
  },
  chamada: {
    ...textos.rotulo,
    color: cores.marcaVerde,
    letterSpacing: 0.3,
  },
  destaque: {
    ...textos.destaque,
    color: cores.textoSobreEscuro,
  },
  formulario: {
    paddingHorizontal: margemTela,
    paddingTop: espacos.xl,
    gap: espacos.lg,
  },
  cabecalho: {
    gap: espacos.xs,
  },
  titulo: {
    ...textos.tituloTela,
    color: cores.texto,
  },
  subtitulo: {
    ...textos.corpoGrande,
    color: cores.textoSuave,
  },
  linhaCadastro: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: espacos.xxs,
  },
  textoCadastro: {
    ...textos.corpo,
    color: cores.textoSuave,
  },
  link: {
    ...textos.corpoForte,
    color: cores.acao,
    textDecorationLine: 'underline',
  },
  ajuda: {
    ...textos.apoio,
    color: cores.textoSuave,
    textAlign: 'center',
  },
});
