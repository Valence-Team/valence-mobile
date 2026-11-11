import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { BarraTopo, Botao, CampoSelecao, CampoTexto, Tela } from '@/components/ui';
import { useAutenticacao } from '@/contexts/AutenticacaoContext';
import { converterErro } from '@/services/api';
import { atualizarPerfil } from '@/services/usuarios';
import { cores, espacos } from '@/theme';
import { mascararTelefone, somenteDigitos } from '@/utils/mascaras';
import { opcoesUf } from '@/utils/ufs';
import {
  limites,
  temErros,
  validarObrigatorio,
  validarTamanho,
  validarTelefone,
  type Erros,
} from '@/utils/validacoes';

type CampoPerfil = 'nome' | 'telefone' | 'municipio' | 'uf';

export default function TelaEditarPerfil() {
  const router = useRouter();
  const { usuario, atualizarUsuario } = useAutenticacao();
  const [nome, setNome] = useState(usuario?.nome ?? '');
  const [telefone, setTelefone] = useState(mascararTelefone(usuario?.telefone ?? ''));
  const [municipio, setMunicipio] = useState(usuario?.municipio ?? '');
  const [uf, setUf] = useState<string | null>(usuario?.uf ?? null);
  const [erros, setErros] = useState<Erros<CampoPerfil>>({});
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    const novosErros: Erros<CampoPerfil> = {
      nome:
        validarObrigatorio(nome, 'Informe seu nome completo.') ??
        validarTamanho(nome, limites.nome, 'O nome'),
      telefone: validarTelefone(telefone),
      municipio:
        validarObrigatorio(municipio, 'Informe o município.') ??
        validarTamanho(municipio, limites.municipio, 'O município'),
      uf: uf ? undefined : 'Escolha a UF.',
    };
    setErros(novosErros);
    if (temErros(novosErros) || !uf) {
      return;
    }

    setSalvando(true);
    try {
      const digitos = somenteDigitos(telefone);
      const atualizado = await atualizarPerfil({
        nome: nome.trim(),
        telefone: digitos.length > 0 ? digitos : undefined,
        municipio: municipio.trim(),
        uf,
      });
      await atualizarUsuario(atualizado);
      Alert.alert('Perfil atualizado', 'Seus dados foram salvos.');
      router.back();
    } catch (erro) {
      const convertido = converterErro(erro);
      setErros({
        nome: convertido.erroDoCampo('nome'),
        telefone: convertido.erroDoCampo('telefone'),
        municipio: convertido.erroDoCampo('municipio'),
        uf: convertido.erroDoCampo('uf'),
      });
      Alert.alert('Não foi possível salvar', convertido.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Tela fundo={cores.superficie} cabecalho={<BarraTopo titulo="Editar perfil" />}>
      <CampoTexto
        rotulo="E-mail"
        icone="mail"
        valor={usuario?.email ?? ''}
        aoMudar={() => undefined}
        editable={false}
        ajuda="O e-mail é usado para entrar e não pode ser alterado aqui."
      />
      <CampoTexto
        rotulo="Nome completo"
        icone="user"
        valor={nome}
        aoMudar={setNome}
        autoCapitalize="words"
        limite={limites.nome}
        erro={erros.nome}
      />
      <CampoTexto
        rotulo="Telefone (opcional)"
        icone="phone"
        valor={telefone}
        aoMudar={(texto) => setTelefone(mascararTelefone(texto))}
        placeholder="(16) 90000-0000"
        keyboardType="phone-pad"
        ajuda="Usado só pela equipe técnica para falar com você."
        erro={erros.telefone}
      />
      <View style={styles.linha}>
        <CampoTexto
          rotulo="Município"
          icone="map-pin"
          valor={municipio}
          aoMudar={setMunicipio}
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
      <Botao titulo="Salvar alterações" icone="check" onPress={salvar} carregando={salvando} />
    </Tela>
  );
}

const styles = StyleSheet.create({
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
});
