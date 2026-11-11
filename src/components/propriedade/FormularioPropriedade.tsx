import * as Location from 'expo-location';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Aviso, Botao, CampoSelecao, CampoTexto, Chip } from '@/components/ui';
import { cores, espacos, textos } from '@/theme';
import type { DadosPropriedade } from '@/types/api';
import { CULTURAS, type Cultura } from '@/types/dominio';
import { mascararDecimal } from '@/utils/mascaras';
import { rotuloCultura } from '@/utils/rotulos';
import { encontrarSiglaUf, opcoesUf } from '@/utils/ufs';
import {
  converterNumero,
  limites,
  temErros,
  validarObrigatorio,
  validarTamanho,
  type Erros,
} from '@/utils/validacoes';

export interface ValoresPropriedade {
  nome: string;
  municipio: string;
  uf: string | null;
  areaHectares: string;
  latitude: string;
  longitude: string;
  culturas: Cultura[];
}

export type CampoPropriedade =
  | 'nome'
  | 'municipio'
  | 'uf'
  | 'areaHectares'
  | 'latitude'
  | 'longitude'
  | 'culturas';

interface FormularioPropriedadeProps {
  valoresIniciais: ValoresPropriedade;
  salvando: boolean;
  errosServidor?: Erros<CampoPropriedade>;
  tituloBotao: string;
  aoSalvar: (dados: DadosPropriedade) => void;
}

function formatarCoordenada(valor: number): string {
  return valor.toFixed(6).replace('.', ',');
}

export function FormularioPropriedade({
  valoresIniciais,
  salvando,
  errosServidor = {},
  tituloBotao,
  aoSalvar,
}: FormularioPropriedadeProps) {
  const [valores, setValores] = useState<ValoresPropriedade>(valoresIniciais);
  const [erros, setErros] = useState<Erros<CampoPropriedade>>({});
  const [localizando, setLocalizando] = useState(false);

  function alterar<K extends keyof ValoresPropriedade>(campo: K, valor: ValoresPropriedade[K]) {
    setValores((atuais) => ({ ...atuais, [campo]: valor }));
    setErros((atuais) => ({ ...atuais, [campo]: undefined }));
  }

  function alternarCultura(cultura: Cultura) {
    const culturas = valores.culturas.includes(cultura)
      ? valores.culturas.filter((item) => item !== cultura)
      : [...valores.culturas, cultura];
    alterar('culturas', culturas);
  }

  async function usarLocalizacaoAtual() {
    setLocalizando(true);
    try {
      const permissao = await Location.requestForegroundPermissionsAsync();
      if (!permissao.granted) {
        Alert.alert(
          'Localização sem permissão',
          'Libere a localização nas configurações do aparelho ou digite as coordenadas.',
        );
        return;
      }
      const posicao = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = posicao.coords;
      setValores((atuais) => ({
        ...atuais,
        latitude: formatarCoordenada(latitude),
        longitude: formatarCoordenada(longitude),
      }));
      setErros((atuais) => ({ ...atuais, latitude: undefined, longitude: undefined }));

      const enderecos = await Location.reverseGeocodeAsync({ latitude, longitude }).catch(() => []);
      const endereco = enderecos[0];
      if (endereco) {
        const municipio = endereco.city ?? endereco.subregion ?? '';
        const uf = encontrarSiglaUf(endereco.region);
        setValores((atuais) => ({
          ...atuais,
          municipio: atuais.municipio || municipio,
          uf: atuais.uf ?? uf,
        }));
      }
    } catch {
      Alert.alert(
        'Não foi possível obter a localização',
        'Verifique se o GPS está ligado e tente de novo, ou digite as coordenadas.',
      );
    } finally {
      setLocalizando(false);
    }
  }

  function salvar() {
    const area = converterNumero(valores.areaHectares);
    const latitude = converterNumero(valores.latitude);
    const longitude = converterNumero(valores.longitude);

    const novosErros: Erros<CampoPropriedade> = {
      nome:
        validarObrigatorio(valores.nome, 'Informe o nome da propriedade.') ??
        validarTamanho(valores.nome, limites.nomePropriedade, 'O nome'),
      municipio:
        validarObrigatorio(valores.municipio, 'Informe o município.') ??
        validarTamanho(valores.municipio, limites.municipio, 'O município'),
      uf: valores.uf ? undefined : 'Escolha a UF.',
      areaHectares: area !== null && area > 0 ? undefined : 'Informe a área em hectares.',
      latitude:
        latitude !== null && latitude >= -90 && latitude <= 90
          ? undefined
          : 'Latitude entre -90 e 90.',
      longitude:
        longitude !== null && longitude >= -180 && longitude <= 180
          ? undefined
          : 'Longitude entre -180 e 180.',
      culturas: valores.culturas.length > 0 ? undefined : 'Escolha ao menos uma cultura.',
    };
    setErros(novosErros);

    if (temErros(novosErros) || !valores.uf || area === null || latitude === null || longitude === null) {
      return;
    }

    aoSalvar({
      nome: valores.nome.trim(),
      municipio: valores.municipio.trim(),
      uf: valores.uf,
      areaHectares: area,
      latitude,
      longitude,
      culturas: valores.culturas,
    });
  }

  const erroDe = (campo: CampoPropriedade) => erros[campo] ?? errosServidor[campo];

  return (
    <View style={styles.formulario}>
      <CampoTexto
        rotulo="Nome da propriedade"
        icone="home"
        valor={valores.nome}
        aoMudar={(texto) => alterar('nome', texto)}
        placeholder="Sítio Boa Vista"
        autoCapitalize="words"
        limite={limites.nomePropriedade}
        erro={erroDe('nome')}
      />

      <View style={styles.linha}>
        <CampoTexto
          rotulo="Município"
          icone="map-pin"
          valor={valores.municipio}
          aoMudar={(texto) => alterar('municipio', texto)}
          placeholder="Ribeirão Preto"
          autoCapitalize="words"
          limite={limites.municipio}
          erro={erroDe('municipio')}
          estilo={styles.campoLargo}
        />
        <CampoSelecao
          rotulo="UF"
          valor={valores.uf}
          opcoes={opcoesUf}
          aoSelecionar={(uf) => alterar('uf', uf)}
          placeholder="UF"
          tituloLista="Estado"
          erro={erroDe('uf')}
          estilo={styles.campoUf}
        />
      </View>

      <View style={styles.secao}>
        <Text style={styles.rotulo}>Culturas plantadas</Text>
        <View style={styles.linhaChips}>
          {CULTURAS.map((cultura) => (
            <Chip
              key={cultura}
              rotulo={rotuloCultura[cultura]}
              selecionado={valores.culturas.includes(cultura)}
              onPress={() => alternarCultura(cultura)}
              estilo={styles.chip}
            />
          ))}
        </View>
        {erroDe('culturas') ? <Text style={styles.erro}>{erroDe('culturas')}</Text> : null}
      </View>

      <CampoTexto
        rotulo="Área (hectares)"
        icone="maximize"
        valor={valores.areaHectares}
        aoMudar={(texto) => alterar('areaHectares', mascararDecimal(texto))}
        placeholder="12,5"
        keyboardType="decimal-pad"
        erro={erroDe('areaHectares')}
      />

      <View style={styles.secao}>
        <Text style={styles.rotulo}>Localização da propriedade</Text>
        <Botao
          titulo="Usar minha localização"
          icone="crosshair"
          variante="contorno"
          onPress={usarLocalizacaoAtual}
          carregando={localizando}
        />
        <View style={styles.linha}>
          <CampoTexto
            rotulo="Latitude"
            valor={valores.latitude}
            aoMudar={(texto) => alterar('latitude', mascararDecimal(texto))}
            placeholder="-21,177"
            keyboardType="numbers-and-punctuation"
            erro={erroDe('latitude')}
            estilo={styles.campoMetade}
          />
          <CampoTexto
            rotulo="Longitude"
            valor={valores.longitude}
            aoMudar={(texto) => alterar('longitude', mascararDecimal(texto))}
            placeholder="-47,810"
            keyboardType="numbers-and-punctuation"
            erro={erroDe('longitude')}
            estilo={styles.campoMetade}
          />
        </View>
      </View>

      <Aviso
        tom="info"
        icone="eye-off"
        texto="A localização exata não aparece para ninguém. Os vizinhos veem só a distância aproximada até o caso."
      />

      <Botao titulo={tituloBotao} icone="check" onPress={salvar} carregando={salvando} />
    </View>
  );
}

const styles = StyleSheet.create({
  formulario: {
    gap: espacos.lg,
  },
  secao: {
    gap: espacos.sm,
  },
  rotulo: {
    ...textos.rotulo,
    color: cores.texto,
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
  campoMetade: {
    flex: 1,
  },
  linhaChips: {
    flexDirection: 'row',
    gap: espacos.sm,
  },
  chip: {
    flex: 1,
  },
  erro: {
    ...textos.legenda,
    color: cores.erro,
  },
});
