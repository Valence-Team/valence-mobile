import * as Crypto from 'expo-crypto';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import {
  FormularioOcorrencia,
  type CampoOcorrencia,
  type OcorrenciaValidada,
} from '@/components/ocorrencia/FormularioOcorrencia';
import { BarraTopo, Carregando, EstadoErro, Tela } from '@/components/ui';
import { useFilaOffline } from '@/contexts/FilaOfflineContext';
import { useCarregamento } from '@/hooks/useCarregamento';
import { rotas } from '@/navigation/rotas';
import { converterErro, type ErroApi } from '@/services/api';
import { criarOcorrencia, enviarFotoDaOcorrencia } from '@/services/ocorrencias';
import { listarTodasPropriedades } from '@/services/propriedades';
import { cores } from '@/theme';
import type { ArquivoFoto, Propriedade } from '@/types/api';
import type { Erros } from '@/utils/validacoes';

function errosDoServidor(erro: ErroApi): Erros<CampoOcorrencia> {
  return {
    cultura: erro.erroDoCampo('cultura'),
    propriedadeId: erro.erroDoCampo('propriedadeId'),
    descricao: erro.erroDoCampo('descricao'),
    foto: erro.erroDoCampo('foto'),
  };
}

export default function TelaNovaOcorrencia() {
  const router = useRouter();
  const { guardar } = useFilaOffline();
  const propriedades = useCarregamento('propriedades-todas', listarTodasPropriedades);
  const [enviando, setEnviando] = useState(false);
  const [errosServidor, setErrosServidor] = useState<Erros<CampoOcorrencia>>({});

  async function guardarParaDepois(
    valores: OcorrenciaValidada,
    foto: ArquivoFoto,
    chave: string,
    lista: Propriedade[],
    ocorrenciaId?: number,
  ) {
    const propriedade = lista.find((item) => item.id === valores.propriedadeId);
    await guardar({
      chaveIdempotencia: chave,
      dados: {
        propriedadeId: valores.propriedadeId,
        cultura: valores.cultura,
        descricao: valores.descricao,
      },
      foto,
      propriedadeNome: propriedade?.nome ?? 'Propriedade',
      ocorrenciaId,
    });
    Alert.alert(
      'Sem conexão agora',
      'A ocorrência ficou guardada no aparelho e será enviada quando a internet voltar.',
    );
    router.replace(rotas.ocorrencias);
  }

  async function enviar(valores: OcorrenciaValidada, lista: Propriedade[]) {
    if (!valores.foto) {
      return;
    }
    const foto = valores.foto;
    const chave = Crypto.randomUUID();
    setEnviando(true);
    setErrosServidor({});

    try {
      const criada = await criarOcorrencia(
        {
          propriedadeId: valores.propriedadeId,
          cultura: valores.cultura,
          descricao: valores.descricao,
        },
        chave,
      );

      try {
        await enviarFotoDaOcorrencia(criada.id, foto);
      } catch (erroFoto) {
        const convertido = converterErro(erroFoto);
        if (convertido.semConexao) {
          await guardarParaDepois(valores, foto, chave, lista, criada.id);
          return;
        }
        Alert.alert(
          'Ocorrência registrada sem foto',
          `${convertido.message} Você pode acompanhar o caso, e um agrônomo vai analisar pela descrição.`,
        );
      }

      router.replace(rotas.ocorrencia(criada.id));
    } catch (erro) {
      const convertido = converterErro(erro);
      if (convertido.semConexao) {
        await guardarParaDepois(valores, foto, chave, lista);
        return;
      }
      setErrosServidor(errosDoServidor(convertido));
      Alert.alert('Não foi possível registrar', convertido.message);
    } finally {
      setEnviando(false);
    }
  }

  const lista = propriedades.dados ?? [];

  return (
    <Tela fundo={cores.superficie} cabecalho={<BarraTopo titulo="Nova ocorrência" />}>
      {propriedades.carregando ? (
        <Carregando texto="Carregando suas propriedades..." />
      ) : propriedades.erro ? (
        <EstadoErro mensagem={propriedades.erro} aoTentarDeNovo={propriedades.tentarDeNovo} />
      ) : (
        <FormularioOcorrencia
          valoresIniciais={{
            cultura: lista.length === 1 && lista[0].culturas.length === 1 ? lista[0].culturas[0] : null,
            propriedadeId: lista.length === 1 ? lista[0].id : null,
            descricao: '',
            foto: null,
          }}
          propriedades={lista}
          comFoto
          mostrarAvisoOffline
          tituloBotao="Enviar para triagem"
          iconeBotao="send"
          enviando={enviando}
          errosServidor={errosServidor}
          aoEnviar={(valores) => void enviar(valores, lista)}
          aoCadastrarPropriedade={() => router.push(rotas.novaPropriedade)}
        />
      )}
    </Tela>
  );
}
