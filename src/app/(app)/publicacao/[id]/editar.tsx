import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { Aviso, BarraTopo, Botao, CampoTexto, Carregando, EstadoErro, Tela } from '@/components/ui';
import { useAutenticacao } from '@/contexts/AutenticacaoContext';
import { useCarregamento } from '@/hooks/useCarregamento';
import { converterErro } from '@/services/api';
import { atualizarPublicacao, obterPublicacao, publicacaoEmCache } from '@/services/mural';
import { cores } from '@/theme';
import type { Publicacao } from '@/types/api';
import { limites } from '@/utils/validacoes';

function FormularioPublicacao({ publicacao }: { publicacao: Publicacao }) {
  const router = useRouter();
  const [texto, setTexto] = useState(publicacao.texto);
  const [erro, setErro] = useState<string | undefined>();
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    const conteudo = texto.trim();
    if (conteudo.length < 3) {
      setErro('Escreva pelo menos 3 caracteres.');
      return;
    }
    setSalvando(true);
    try {
      await atualizarPublicacao(publicacao.id, conteudo);
      Alert.alert('Publicação atualizada', 'A nova versão já aparece no mural.');
      router.back();
    } catch (falha) {
      const convertido = converterErro(falha);
      setErro(convertido.erroDoCampo('texto'));
      Alert.alert('Não foi possível salvar', convertido.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <CampoTexto
        rotulo="Texto da publicação"
        valor={texto}
        aoMudar={(valor) => {
          setTexto(valor);
          setErro(undefined);
        }}
        multilinha
        limite={limites.publicacao}
        erro={erro}
      />
      <Botao titulo="Salvar alterações" icone="check" onPress={salvar} carregando={salvando} />
    </>
  );
}

export default function TelaEditarPublicacao() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const publicacaoId = Number(id);
  const { usuario } = useAutenticacao();
  const buscar = useCallback(async () => {
    try {
      return await obterPublicacao(publicacaoId);
    } catch (erro) {
      const emCache = publicacaoEmCache(publicacaoId);
      if (emCache) {
        return emCache;
      }
      throw erro;
    }
  }, [publicacaoId]);
  const carregamento = useCarregamento(`editar-publicacao-${publicacaoId}`, buscar, {
    recarregarAoFocar: false,
  });
  const publicacao = carregamento.dados;

  return (
    <Tela fundo={cores.superficie} cabecalho={<BarraTopo titulo="Editar publicação" />}>
      {carregamento.carregando ? (
        <Carregando />
      ) : carregamento.erro || !publicacao ? (
        <EstadoErro
          mensagem={carregamento.erro ?? 'Tente de novo.'}
          aoTentarDeNovo={carregamento.tentarDeNovo}
        />
      ) : publicacao.autor.id !== usuario?.id ? (
        <Aviso tom="aviso" texto="Só quem publicou pode editar esta publicação." />
      ) : (
        <FormularioPublicacao publicacao={publicacao} />
      )}
    </Tela>
  );
}
