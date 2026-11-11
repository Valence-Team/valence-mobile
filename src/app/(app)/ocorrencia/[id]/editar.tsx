import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import {
  FormularioOcorrencia,
  type CampoOcorrencia,
  type OcorrenciaValidada,
} from '@/components/ocorrencia/FormularioOcorrencia';
import { Aviso, BarraTopo, Carregando, EstadoErro, Tela } from '@/components/ui';
import { useCarregamento } from '@/hooks/useCarregamento';
import { rotas } from '@/navigation/rotas';
import { converterErro } from '@/services/api';
import { atualizarOcorrencia, obterOcorrencia, podeEditarOcorrencia } from '@/services/ocorrencias';
import { listarTodasPropriedades } from '@/services/propriedades';
import { cores } from '@/theme';
import type { Erros } from '@/utils/validacoes';

export default function TelaEditarOcorrencia() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const ocorrenciaId = Number(id);
  const buscar = useCallback(async () => {
    const [ocorrencia, propriedades] = await Promise.all([
      obterOcorrencia(ocorrenciaId),
      listarTodasPropriedades(),
    ]);
    return { ocorrencia, propriedades };
  }, [ocorrenciaId]);
  const carregamento = useCarregamento(`editar-ocorrencia-${ocorrenciaId}`, buscar, {
    recarregarAoFocar: false,
  });
  const [salvando, setSalvando] = useState(false);
  const [errosServidor, setErrosServidor] = useState<Erros<CampoOcorrencia>>({});

  async function salvar(valores: OcorrenciaValidada) {
    setSalvando(true);
    setErrosServidor({});
    try {
      await atualizarOcorrencia(ocorrenciaId, {
        propriedadeId: valores.propriedadeId,
        cultura: valores.cultura,
        descricao: valores.descricao,
      });
      Alert.alert('Ocorrência atualizada', 'As alterações foram salvas.');
      router.back();
    } catch (erro) {
      const convertido = converterErro(erro);
      setErrosServidor({
        cultura: convertido.erroDoCampo('cultura'),
        propriedadeId: convertido.erroDoCampo('propriedadeId'),
        descricao: convertido.erroDoCampo('descricao'),
      });
      Alert.alert('Não foi possível salvar', convertido.message);
    } finally {
      setSalvando(false);
    }
  }

  const dados = carregamento.dados;

  return (
    <Tela fundo={cores.superficie} cabecalho={<BarraTopo titulo="Editar ocorrência" />}>
      {carregamento.carregando ? (
        <Carregando texto="Abrindo a ocorrência..." />
      ) : carregamento.erro || !dados ? (
        <EstadoErro
          mensagem={carregamento.erro ?? 'Tente de novo.'}
          aoTentarDeNovo={carregamento.tentarDeNovo}
        />
      ) : !podeEditarOcorrencia(dados.ocorrencia) ? (
        <Aviso
          tom="aviso"
          texto="Esta ocorrência já está em análise e não pode mais ser editada."
          acao={{ rotulo: 'Ver ocorrência', onPress: () => router.replace(rotas.ocorrencia(ocorrenciaId)) }}
        />
      ) : (
        <FormularioOcorrencia
          valoresIniciais={{
            cultura: dados.ocorrencia.cultura,
            propriedadeId: dados.ocorrencia.propriedade.id,
            descricao: dados.ocorrencia.descricao,
            foto: null,
          }}
          propriedades={dados.propriedades}
          comFoto={false}
          tituloBotao="Salvar alterações"
          iconeBotao="check"
          enviando={salvando}
          errosServidor={errosServidor}
          aoEnviar={(valores) => void salvar(valores)}
          aoCadastrarPropriedade={() => router.push(rotas.novaPropriedade)}
        />
      )}
    </Tela>
  );
}
