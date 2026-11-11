import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  Aviso,
  BarraTopo,
  Botao,
  CampoSelecao,
  CampoTexto,
  Logo,
  Tela,
} from '@/components/ui';
import { useAutenticacao } from '@/contexts/AutenticacaoContext';
import { rotas } from '@/navigation/rotas';
import { converterErro } from '@/services/api';
import { cores, espacos, textos } from '@/theme';
import { mascararTelefone, somenteDigitos } from '@/utils/mascaras';
import { opcoesUf } from '@/utils/ufs';
import {
  limites,
  temErros,
  validarEmail,
  validarObrigatorio,
  validarSenha,
  validarTamanho,
  validarTelefone,
  type Erros,
} from '@/utils/validacoes';

type CampoCadastro = 'nome' | 'email' | 'telefone' | 'municipio' | 'uf' | 'senha' | 'confirmacao';

export default function TelaCadastro() {
  const { cadastrar } = useAutenticacao();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [uf, setUf] = useState<string | null>(null);
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erros, setErros] = useState<Erros<CampoCadastro>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function aoCriarConta() {
    const novosErros: Erros<CampoCadastro> = {
      nome:
        validarObrigatorio(nome, 'Informe seu nome completo.') ??
        validarTamanho(nome, limites.nome, 'O nome'),
      email: validarEmail(email),
      telefone: validarTelefone(telefone),
      municipio:
        validarObrigatorio(municipio, 'Informe o município.') ??
        validarTamanho(municipio, limites.municipio, 'O município'),
      uf: uf ? undefined : 'Escolha a UF.',
      senha: validarSenha(senha),
      confirmacao: confirmacao === senha ? undefined : 'As senhas não são iguais.',
    };
    setErros(novosErros);
    setErroGeral(null);
    if (temErros(novosErros) || !uf) {
      return;
    }

    setEnviando(true);
    try {
      const digitosTelefone = somenteDigitos(telefone);
      await cadastrar({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha,
        telefone: digitosTelefone.length > 0 ? digitosTelefone : undefined,
        municipio: municipio.trim(),
        uf,
      });
    } catch (erro) {
      const convertido = converterErro(erro);
      setErros({
        nome: convertido.erroDoCampo('nome'),
        email:
          convertido.erroDoCampo('email') ??
          (convertido.status === 409 ? 'Já existe uma conta com este e-mail.' : undefined),
        telefone: convertido.erroDoCampo('telefone'),
        municipio: convertido.erroDoCampo('municipio'),
        uf: convertido.erroDoCampo('uf'),
        senha: convertido.erroDoCampo('senha'),
      });
      setErroGeral(convertido.status === 409 ? null : convertido.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Tela fundo={cores.superficie} cabecalho={<BarraTopo titulo="Criar conta" />}>
      <View style={styles.cabecalho}>
        <View style={styles.marca}>
          <Logo variante="escuro" altura={32} />
        </View>
        <Text style={styles.titulo} accessibilityRole="header">
          Conta de produtor
        </Text>
        <Text style={styles.subtitulo}>
          Agrônomos e gestores recebem o acesso pela equipe do Valence.
        </Text>
      </View>

      {erroGeral ? <Aviso tom="erro" texto={erroGeral} /> : null}

      <CampoTexto
        rotulo="Nome completo"
        icone="user"
        valor={nome}
        aoMudar={setNome}
        placeholder="Seu nome"
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        limite={limites.nome}
        erro={erros.nome}
      />
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
        limite={limites.email}
        erro={erros.email}
      />
      <CampoTexto
        rotulo="Telefone (opcional)"
        icone="phone"
        valor={telefone}
        aoMudar={(texto) => setTelefone(mascararTelefone(texto))}
        placeholder="(16) 90000-0000"
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        ajuda="Usado só pela equipe técnica para falar com você."
        erro={erros.telefone}
      />
      <View style={styles.linha}>
        <CampoTexto
          rotulo="Município"
          icone="map-pin"
          valor={municipio}
          aoMudar={setMunicipio}
          placeholder="Ribeirão Preto"
          autoCapitalize="words"
          limite={limites.municipio}
          erro={erros.municipio}
          estilo={styles.campoLargo}
        />
        <CampoSelecao
          rotulo="UF"
          valor={uf}
          opcoes={opcoesUf}
          aoSelecionar={setUf}
          placeholder="UF"
          tituloLista="Estado"
          erro={erros.uf}
          estilo={styles.campoUf}
        />
      </View>
      <CampoTexto
        rotulo="Senha"
        icone="lock"
        valor={senha}
        aoMudar={setSenha}
        placeholder="Crie uma senha"
        segredo
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        ajuda={`Mínimo de ${limites.senhaMinima} caracteres.`}
        erro={erros.senha}
      />
      <CampoTexto
        rotulo="Confirmar senha"
        icone="lock"
        valor={confirmacao}
        aoMudar={setConfirmacao}
        placeholder="Repita a senha"
        segredo
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        erro={erros.confirmacao}
      />

      <Aviso
        tom="info"
        texto="Seu nome e seu telefone não aparecem para os vizinhos. Os alertas mostram só a distância aproximada."
      />

      <Botao titulo="Criar conta" onPress={aoCriarConta} carregando={enviando} />

      <View style={styles.linhaEntrar}>
        <Text style={styles.texto}>Já tem conta?</Text>
        <Link href={rotas.login} replace style={styles.link} accessibilityRole="link">
          Entrar
        </Link>
      </View>
    </Tela>
  );
}

const styles = StyleSheet.create({
  cabecalho: {
    gap: espacos.xs,
  },
  marca: {
    alignItems: 'flex-start',
    marginBottom: espacos.sm,
  },
  titulo: {
    ...textos.tituloTela,
    color: cores.texto,
  },
  subtitulo: {
    ...textos.corpoGrande,
    color: cores.textoSuave,
  },
  linha: {
    flexDirection: 'row',
    gap: espacos.sm,
    alignItems: 'flex-start',
  },
  campoLargo: {
    flex: 1,
  },
  campoUf: {
    width: 104,
  },
  linhaEntrar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: espacos.xxs,
  },
  texto: {
    ...textos.corpo,
    color: cores.textoSuave,
  },
  link: {
    ...textos.corpoForte,
    color: cores.acao,
    textDecorationLine: 'underline',
  },
});
