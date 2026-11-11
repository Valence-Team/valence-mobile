import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import {
  FormularioPropriedade,
  type CampoPropriedade,
} from '@/components/propriedade/FormularioPropriedade';
import { BarraTopo, Tela } from '@/components/ui';
import { useAutenticacao } from '@/contexts/AutenticacaoContext';
import { converterErro } from '@/services/api';
import { criarPropriedade } from '@/services/propriedades';
import { cores } from '@/theme';
import type { DadosPropriedade } from '@/types/api';
import type { Erros } from '@/utils/validacoes';

export default function TelaNovaPropriedade() {
  const router = useRouter();
  const { usuario } = useAutenticacao();
  const [salvando, setSalvando] = useState(false);
  const [errosServidor, setErrosServidor] = useState<Erros<CampoPropriedade>>({});

  async function salvar(dados: DadosPropriedade) {
    setSalvando(true);
    setErrosServidor({});
    try {
      await criarPropriedade(dados);
      Alert.alert('Propriedade cadastrada', 'Agora você recebe alertas de casos perto dela.');
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
      Alert.alert('Não foi possível cadastrar', convertido.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Tela fundo={cores.superficie} cabecalho={<BarraTopo titulo="Nova propriedade" />}>
      <FormularioPropriedade
        valoresIniciais={{
          nome: '',
          municipio: usuario?.municipio ?? '',
          uf: usuario?.uf ?? null,
          areaHectares: '',
          latitude: '',
          longitude: '',
          culturas: [],
        }}
        salvando={salvando}
        errosServidor={errosServidor}
        tituloBotao="Cadastrar propriedade"
        aoSalvar={(dados) => void salvar(dados)}
      />
    </Tela>
  );
}
