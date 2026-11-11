import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { converterErro } from '@/services/api';
import type { Pagina } from '@/types/api';

interface EstadoLista<T> {
  chave: string | null;
  itens: T[];
  pagina: number;
  ultima: boolean;
  erro: string | null;
}

export interface ListaPaginada<T> {
  itens: T[];
  carregando: boolean;
  atualizando: boolean;
  carregandoMais: boolean;
  erro: string | null;
  temMais: boolean;
  recarregar: () => void;
  tentarDeNovo: () => void;
  carregarMais: () => Promise<void>;
  alterarItens: (alteracao: (itens: T[]) => T[]) => void;
}

export function useListaPaginada<T>(
  chave: string,
  buscar: (pagina: number) => Promise<Pagina<T>>,
): ListaPaginada<T> {
  const [estado, setEstado] = useState<EstadoLista<T>>({
    chave: null,
    itens: [],
    pagina: 0,
    ultima: true,
    erro: null,
  });
  const [versao, setVersao] = useState(0);
  const [atualizando, setAtualizando] = useState(false);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const buscarRef = useRef(buscar);
  const jaFocouRef = useRef(false);

  useEffect(() => {
    buscarRef.current = buscar;
  });

  useEffect(() => {
    let ativo = true;
    buscarRef
      .current(0)
      .then((resultado) => {
        if (ativo) {
          setEstado({
            chave,
            itens: resultado.itens,
            pagina: resultado.pagina,
            ultima: resultado.ultima,
            erro: null,
          });
        }
      })
      .catch((erro: unknown) => {
        if (ativo) {
          setEstado({ chave, itens: [], pagina: 0, ultima: true, erro: converterErro(erro).message });
        }
      })
      .finally(() => {
        if (ativo) {
          setAtualizando(false);
        }
      });
    return () => {
      ativo = false;
    };
  }, [chave, versao]);

  useFocusEffect(
    useCallback(() => {
      if (!jaFocouRef.current) {
        jaFocouRef.current = true;
        return;
      }
      setVersao((atual) => atual + 1);
    }, []),
  );

  const recarregar = useCallback(() => {
    setAtualizando(true);
    setVersao((atual) => atual + 1);
  }, []);

  const tentarDeNovo = useCallback(() => {
    setEstado((atual) => ({ ...atual, chave: null, erro: null }));
    setVersao((atual) => atual + 1);
  }, []);

  const carregarMais = useCallback(async () => {
    if (carregandoMais || estado.ultima || estado.chave !== chave) {
      return;
    }
    setCarregandoMais(true);
    try {
      const resultado = await buscarRef.current(estado.pagina + 1);
      setEstado((atual) => ({
        ...atual,
        itens: [...atual.itens, ...resultado.itens],
        pagina: resultado.pagina,
        ultima: resultado.ultima,
      }));
    } catch (erro) {
      Alert.alert('Não foi possível carregar mais', converterErro(erro).message);
    } finally {
      setCarregandoMais(false);
    }
  }, [carregandoMais, chave, estado.chave, estado.pagina, estado.ultima]);

  const alterarItens = useCallback((alteracao: (itens: T[]) => T[]) => {
    setEstado((atual) => ({ ...atual, itens: alteracao(atual.itens) }));
  }, []);

  const carregando = estado.chave !== chave;

  return {
    itens: carregando ? [] : estado.itens,
    carregando,
    atualizando,
    carregandoMais,
    erro: carregando ? null : estado.erro,
    temMais: !carregando && !estado.ultima,
    recarregar,
    tentarDeNovo,
    carregarMais,
    alterarItens,
  };
}
