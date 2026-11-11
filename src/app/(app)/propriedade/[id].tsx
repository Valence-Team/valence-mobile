import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import {
  FormularioPropriedade,
  type CampoPropriedade,
} from '@/components/propriedade/FormularioPropriedade';
import { BarraTopo, Botao, Carregando, EstadoErro, Tela } from '@/components/ui';
import { useCarregamento } from '@/hooks/useCarregamento';
import { converterErro } from '@/services/api';
import {
  atualizarPropriedade,
  excluirPropriedade,
  obterPropriedade,
} from '@/services/propriedades';
import { cores } from '@/theme';
import type { DadosPropriedade } from '@/types/api';
import type { Erros } from '@/utils/validacoes';

function paraTexto(valor: number): string {
  return String(valor).replace('.', ',');
}

export default function TelaEditarPropriedade() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const propriedadeId = Number(id);
  const buscar = useCallback(() => obterPropriedade(propriedadeId), [propriedadeId]);
  const carregamento = useCarregamento(`propriedade-${propriedadeId}`, buscar, {
    recarregarAoFocar: false,
  });
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [errosServidor, setErrosServidor] = useState<Erros<CampoPropriedade>>({});

  async function salvar(dados: DadosPropriedade) {
    setSalvando(true);
    setErrosServidor({});
    try {
      await atualizarPropriedade(propriedadeId, dados);
      Alert.alert('Propriedade atualizada', 'As alterações foram salvas.');
      router.back();
    } catch (erro) {
      const convertido = converterErro(erro);
      setErrosServidor({
        nome: convertido.erroDoCampo('nome'),
        municipio: convertido.erroDoCampo('municipio'),
        uf: convertido.erroDoCampo('uf'),
        areaHectares: convertido.erroDoCampo('areaHectares'),
        latitude: convertido.erroDoCampo('latitude'),
        longitude: convertido.erroDoCampo('longitude'),
        culturas: convertido.erroDoCampo('culturas'),
      });
      Alert.alert('Não foi possível salvar', convertido.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    setExcluindo(true);
    try {
      await excluirPropriedade(propriedadeId);
      Alert.alert('Propriedade excluída', 'Ela não recebe mais alertas.');
      router.back();
    } catch (erro) {
      Alert.alert('Não foi possível excluir', converterErro(erro).message);
    } finally {
      setExcluindo(false);
    }
  }

  function confirmarExclusao() {
    Alert.alert(
      'Excluir propriedade?',
      'Ela deixa de receber alertas. Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => void excluir() },
      ],
    );
  }

  const propriedade = carregamento.dados;

  return (
    <Tela
      fundo={cores.superficie}
      cabecalho={
        <BarraTopo
          titulo="Editar propriedade"
          acoes={
            propriedade
              ? [
                  {
                    icone: 'trash-2',
                    rotulo: 'Excluir propriedade',
                    onPress: confirmarExclusao,
                    cor: cores.erro,
                  },
                ]
              : []
          }
        />
      }
    >
      {carregamento.carregando ? (
        <Carregando texto="Abrindo a propriedade..." />
      ) : carregamento.erro || !propriedade ? (
        <EstadoErro
          mensagem={carregamento.erro ?? 'Tente de novo.'}
          aoTentarDeNovo={carregamento.tentarDeNovo}
        />
      ) : (
        <>
          <FormularioPropriedade
            valoresIniciais={{
              nome: propriedade.nome,
              municipio: propriedade.municipio,
              uf: propriedade.uf,
              areaHectares: paraTexto(propriedade.areaHectares),
              latitude: paraTexto(propriedade.latitude),
              longitude: paraTexto(propriedade.longitude),
              culturas: propriedade.culturas,
            }}
            salvando={salvando}
            errosServidor={errosServidor}
            tituloBotao="Salvar alterações"
            aoSalvar={(dados) => void salvar(dados)}
          />
          <Botao
            titulo="Excluir propriedade"
            icone="trash-2"
            variante="perigo"
            onPress={confirmarExclusao}
            carregando={excluindo}
          />
        </>
      )}
    </Tela>
  );
}
