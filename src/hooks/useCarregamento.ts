import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { converterErro } from '@/services/api';

interface EstadoCarregamento<T> {
  chave: string | null;
  dados: T | null;
  erro: string | null;
  status: number;
}

export interface Carregamento<T> {
  dados: T | null;
  carregando: boolean;
  atualizando: boolean;
  erro: string | null;
  statusErro: number;
  recarregar: () => void;
  tentarDeNovo: () => void;
  substituir: (dados: T) => void;
}

export function useCarregamento<T>(
  chave: string,
  buscar: () => Promise<T>,
  opcoes: { recarregarAoFocar?: boolean } = {},
): Carregamento<T> {
  const { recarregarAoFocar = true } = opcoes;
  const [estado, setEstado] = useState<EstadoCarregamento<T>>({
    chave: null,
    dados: null,
    erro: null,
    status: 0,
  });
  const [versao, setVersao] = useState(0);
  const [atualizando, setAtualizando] = useState(false);
  const buscarRef = useRef(buscar);
  const jaFocouRef = useRef(false);

  useEffect(() => {
    buscarRef.current = buscar;
  });

  useEffect(() => {
    let ativo = true;
    buscarRef
      .current()
      .then((dados) => {
        if (ativo) {
          setEstado({ chave, dados, erro: null, status: 0 });
        }
      })
      .catch((erro: unknown) => {
        if (ativo) {
          const convertido = converterErro(erro);
          setEstado({ chave, dados: null, erro: convertido.message, status: convertido.status });
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
      if (recarregarAoFocar) {
        setVersao((atual) => atual + 1);
      }
    }, [recarregarAoFocar]),
  );

  const recarregar = useCallback(() => {
    setAtualizando(true);
    setVersao((atual) => atual + 1);
  }, []);

  const tentarDeNovo = useCallback(() => {
    setEstado((atual) => ({ ...atual, chave: null, erro: null }));
    setVersao((atual) => atual + 1);
  }, []);

  const substituir = useCallback(
    (dados: T) => {
      setEstado({ chave, dados, erro: null, status: 0 });
    },
    [chave],
  );

  const carregando = estado.chave !== chave;

  return {
    dados: carregando ? null : estado.dados,
    carregando,
    atualizando,
    erro: carregando ? null : estado.erro,
    statusErro: estado.status,
    recarregar,
    tentarDeNovo,
    substituir,
  };
}
