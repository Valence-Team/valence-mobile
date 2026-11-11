import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  Aviso,
  Botao,
  CampoSelecao,
  CampoTexto,
  Chip,
  Icone,
  type NomeIcone,
} from '@/components/ui';
import { cores, espacos, raios, textos } from '@/theme';
import type { ArquivoFoto, Propriedade } from '@/types/api';
import { CULTURAS, type Cultura } from '@/types/dominio';
import { rotuloCultura } from '@/utils/rotulos';
import { limites, temErros, type Erros } from '@/utils/validacoes';

export interface ValoresOcorrencia {
  cultura: Cultura | null;
  propriedadeId: number | null;
  descricao: string;
  foto: ArquivoFoto | null;
}

export interface OcorrenciaValidada {
  cultura: Cultura;
  propriedadeId: number;
  descricao: string;
  foto: ArquivoFoto | null;
}

export type CampoOcorrencia = 'foto' | 'cultura' | 'propriedadeId' | 'descricao';

interface FormularioOcorrenciaProps {
  valoresIniciais: ValoresOcorrencia;
  propriedades: Propriedade[];
  comFoto: boolean;
  mostrarAvisoOffline?: boolean;
  tituloBotao: string;
  iconeBotao: NomeIcone;
  enviando: boolean;
  errosServidor?: Erros<CampoOcorrencia>;
  aoEnviar: (valores: OcorrenciaValidada) => void;
  aoCadastrarPropriedade: () => void;
}

function paraArquivoFoto(asset: ImagePicker.ImagePickerAsset): ArquivoFoto {
  const extensao = asset.mimeType === 'image/png' ? 'png' : 'jpg';
  return {
    uri: asset.uri,
    nome: asset.fileName ?? `folha-${Date.now()}.${extensao}`,
    tipo: asset.mimeType ?? 'image/jpeg',
  };
}

export function FormularioOcorrencia({
  valoresIniciais,
  propriedades,
  comFoto,
  mostrarAvisoOffline = false,
  tituloBotao,
  iconeBotao,
  enviando,
  errosServidor = {},
  aoEnviar,
  aoCadastrarPropriedade,
}: FormularioOcorrenciaProps) {
  const [valores, setValores] = useState<ValoresOcorrencia>(valoresIniciais);
  const [erros, setErros] = useState<Erros<CampoOcorrencia>>({});

  function alterar<K extends keyof ValoresOcorrencia>(campo: K, valor: ValoresOcorrencia[K]) {
    setValores((atuais) => ({ ...atuais, [campo]: valor }));
    setErros((atuais) => ({ ...atuais, [campo]: undefined }));
  }

  async function tirarFoto() {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert(
        'Câmera sem permissão',
        'Libere o acesso à câmera nas configurações do aparelho ou escolha uma foto da galeria.',
      );
      return;
    }
    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      exif: false,
    });
    if (!resultado.canceled && resultado.assets[0]) {
      alterar('foto', paraArquivoFoto(resultado.assets[0]));
    }
  }

  async function escolherDaGaleria() {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      exif: false,
    });
    if (!resultado.canceled && resultado.assets[0]) {
      alterar('foto', paraArquivoFoto(resultado.assets[0]));
    }
  }

  function enviar() {
    const descricao = valores.descricao.trim();
    const novosErros: Erros<CampoOcorrencia> = {
      foto: comFoto && !valores.foto ? 'Adicione uma foto da folha afetada.' : undefined,
      cultura: valores.cultura ? undefined : 'Escolha a cultura.',
      propriedadeId: valores.propriedadeId ? undefined : 'Escolha a propriedade.',
      descricao:
        descricao.length < 10
          ? 'Conte o que você viu com pelo menos 10 caracteres.'
          : descricao.length > limites.descricaoOcorrencia
            ? `Use no máximo ${limites.descricaoOcorrencia} caracteres.`
            : undefined,
    };
    setErros(novosErros);
    if (temErros(novosErros) || !valores.cultura || !valores.propriedadeId) {
      return;
    }
    aoEnviar({
      cultura: valores.cultura,
      propriedadeId: valores.propriedadeId,
      descricao,
      foto: valores.foto,
    });
  }

  const erroDe = (campo: CampoOcorrencia) => erros[campo] ?? errosServidor[campo];
  const opcoesPropriedade = propriedades.map((propriedade) => ({
    valor: String(propriedade.id),
    rotulo: propriedade.nome,
    descricao: `${propriedade.municipio}/${propriedade.uf}`,
  }));

  return (
    <View style={styles.formulario}>
      {comFoto ? (
        <View style={styles.secao}>
          <Text style={styles.rotulo}>Foto da folha</Text>
          {valores.foto ? (
            <View style={styles.previa}>
              <Image
                source={{ uri: valores.foto.uri }}
                style={styles.imagemPrevia}
                resizeMode="cover"
                accessibilityLabel="Foto escolhida da folha"
              />
              <Pressable
                onPress={() => alterar('foto', null)}
                accessibilityRole="button"
                accessibilityLabel="Remover foto"
                style={styles.removerFoto}
              >
                <Icone nome="x" tamanho={18} cor={cores.textoSobreAcao} />
              </Pressable>
            </View>
          ) : (
            <View style={[styles.areaFoto, erroDe('foto') ? styles.areaFotoErro : null]}>
              <Icone nome="camera" tamanho={30} cor={cores.acao} />
              <Text style={styles.tituloAreaFoto}>Tire uma foto da folha afetada</Text>
              <Text style={styles.textoAreaFoto}>De perto, com boa luz e sem flash.</Text>
            </View>
          )}
          <View style={styles.linhaBotoes}>
            <Botao
              titulo={valores.foto ? 'Nova foto' : 'Tirar foto'}
              icone="camera"
              variante="contorno"
              onPress={tirarFoto}
              estilo={styles.botaoMetade}
            />
            <Botao
              titulo="Galeria"
              icone="image"
              variante="contorno"
              onPress={escolherDaGaleria}
              estilo={styles.botaoMetade}
            />
          </View>
          {erroDe('foto') ? <Text style={styles.erro}>{erroDe('foto')}</Text> : null}
        </View>
      ) : null}

      <View style={styles.secao}>
        <Text style={styles.rotulo}>Cultura</Text>
        <View style={styles.linhaBotoes} accessibilityRole="radiogroup">
          {CULTURAS.map((cultura) => (
            <Chip
              key={cultura}
              rotulo={rotuloCultura[cultura]}
              selecionado={valores.cultura === cultura}
              onPress={() => alterar('cultura', cultura)}
              estilo={styles.botaoTerco}
            />
          ))}
        </View>
        {erroDe('cultura') ? <Text style={styles.erro}>{erroDe('cultura')}</Text> : null}
      </View>

      {propriedades.length === 0 ? (
        <Aviso
          tom="aviso"
          icone="map-pin"
          texto="Cadastre uma propriedade antes de registrar uma ocorrência. É por ela que os vizinhos recebem os alertas."
          acao={{ rotulo: 'Cadastrar propriedade', onPress: aoCadastrarPropriedade }}
        />
      ) : (
        <CampoSelecao
          rotulo="Propriedade"
          icone="map-pin"
          valor={valores.propriedadeId ? String(valores.propriedadeId) : null}
          opcoes={opcoesPropriedade}
          aoSelecionar={(valor) => alterar('propriedadeId', Number(valor))}
          placeholder="Escolha a propriedade"
          tituloLista="Suas propriedades"
          erro={erroDe('propriedadeId')}
        />
      )}

      <CampoTexto
        rotulo="Descrição"
        valor={valores.descricao}
        aoMudar={(texto) => alterar('descricao', texto)}
        placeholder="Conte o que você viu: cor das folhas, manchas, insetos."
        multilinha
        limite={limites.descricaoOcorrencia}
        erro={erroDe('descricao')}
      />

      {mostrarAvisoOffline ? (
        <Aviso
          tom="info"
          icone="cloud-off"
          texto="Sem internet? A ocorrência fica guardada no aparelho e é enviada quando a conexão voltar."
        />
      ) : null}

      <Botao titulo={tituloBotao} icone={iconeBotao} onPress={enviar} carregando={enviando} />

      <Text style={styles.nota}>A IA faz a triagem inicial. Só um agrônomo confirma a praga.</Text>
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
  areaFoto: {
    height: 180,
    borderRadius: raios.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: cores.bordaCampo,
    backgroundColor: cores.fundo,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacos.xs,
    paddingHorizontal: espacos.lg,
  },
  areaFotoErro: {
    borderColor: cores.erro,
  },
  tituloAreaFoto: {
    ...textos.corpoForte,
    fontSize: 16,
    color: cores.texto,
    textAlign: 'center',
  },
  textoAreaFoto: {
    ...textos.apoio,
    color: cores.textoSuave,
    textAlign: 'center',
  },
  previa: {
    borderRadius: raios.lg,
    overflow: 'hidden',
  },
  imagemPrevia: {
    width: '100%',
    height: 220,
  },
  removerFoto: {
    position: 'absolute',
    top: espacos.sm,
    right: espacos.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: cores.sobreposicao,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linhaBotoes: {
    flexDirection: 'row',
    gap: espacos.sm,
  },
  botaoMetade: {
    flex: 1,
  },
  botaoTerco: {
    flex: 1,
  },
  erro: {
    ...textos.legenda,
    color: cores.erro,
  },
  nota: {
    ...textos.apoio,
    color: cores.textoSuave,
    textAlign: 'center',
  },
});
