import * as Crypto from 'expo-crypto';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AppState } from 'react-native';

import { useAutenticacao } from './AutenticacaoContext';
import { ambiente } from '@/config/ambiente';
import { converterErro } from '@/services/api';
import { criarOcorrencia, enviarFotoDaOcorrencia } from '@/services/ocorrencias';
import { gravarFila, lerFila, type OcorrenciaPendente } from '@/storage/filaOffline';

type NovaPendencia = Omit<OcorrenciaPendente, 'idLocal' | 'criadaEm' | 'erro'>;

interface ValorFilaOffline {
  pendentes: OcorrenciaPendente[];
  enviando: boolean;
  guardar: (pendencia: NovaPendencia) => Promise<void>;
  enviarAgora: () => Promise<number>;
  descartar: (idLocal: string) => Promise<void>;
}

interface EstadoFila {
  donoId: number | null;
  itens: OcorrenciaPendente[];
}

const ContextoFilaOffline = createContext<ValorFilaOffline | null>(null);

async function alterarItem(
  usuarioId: number,
  idLocal: string,
  alteracao: Partial<OcorrenciaPendente>,
): Promise<void> {
  const fila = await lerFila(usuarioId);
  await gravarFila(
    usuarioId,
    fila.map((item) => (item.idLocal === idLocal ? { ...item, ...alteracao } : item)),
  );
}

async function removerItem(usuarioId: number, idLocal: string): Promise<OcorrenciaPendente[]> {
  const fila = await lerFila(usuarioId);
  const restante = fila.filter((item) => item.idLocal !== idLocal);
  await gravarFila(usuarioId, restante);
  return restante;
}

export function ProvedorFilaOffline({ children }: { children: ReactNode }) {
  const { usuario } = useAutenticacao();
  const usuarioId = usuario?.id ?? null;
  const [estado, setEstado] = useState<EstadoFila>({ donoId: null, itens: [] });
  const [enviando, setEnviando] = useState(false);
  const processandoRef = useRef(false);

  const pendentes = useMemo(
    () => (estado.donoId === usuarioId ? estado.itens : []),
    [estado, usuarioId],
  );

  const processar = useCallback(
    async (incluirComErro: boolean): Promise<number> => {
      if (usuarioId === null || processandoRef.current) {
        return 0;
      }
      processandoRef.current = true;
      setEnviando(true);
      let enviadas = 0;

      try {
        const fila = await lerFila(usuarioId);
        for (const item of fila) {
          if (item.erro && !incluirComErro) {
            continue;
          }
          try {
            let ocorrenciaId = item.ocorrenciaId;
            if (!ocorrenciaId) {
              const criada = await criarOcorrencia(item.dados, item.chaveIdempotencia);
              ocorrenciaId = criada.id;
              await alterarItem(usuarioId, item.idLocal, { ocorrenciaId, erro: undefined });
            }
            await enviarFotoDaOcorrencia(ocorrenciaId, item.foto);
            await removerItem(usuarioId, item.idLocal);
            enviadas += 1;
          } catch (erro) {
            const convertido = converterErro(erro);
            if (convertido.semConexao) {
              break;
            }
            await alterarItem(usuarioId, item.idLocal, { erro: convertido.message });
          }
        }
      } finally {
        processandoRef.current = false;
        const atualizada = await lerFila(usuarioId);
        setEstado({ donoId: usuarioId, itens: atualizada });
        setEnviando(false);
      }
      return enviadas;
    },
    [usuarioId],
  );

  useEffect(() => {
    if (usuarioId === null) {
      return;
    }
    let ativo = true;
    lerFila(usuarioId).then((fila) => {
      if (!ativo) {
        return;
      }
      setEstado({ donoId: usuarioId, itens: fila });
      if (fila.length > 0) {
        void processar(false);
      }
    });
    return () => {
      ativo = false;
    };
  }, [usuarioId, processar]);

  useEffect(() => {
    if (usuarioId === null) {
      return;
    }
    const assinatura = AppState.addEventListener('change', (estadoDoApp) => {
      if (estadoDoApp === 'active') {
        void processar(false);
      }
    });
    return () => assinatura.remove();
  }, [usuarioId, processar]);

  const quantidade = pendentes.length;
  useEffect(() => {
    if (usuarioId === null || quantidade === 0) {
      return;
    }
    const temporizador = setInterval(() => {
      void processar(false);
    }, ambiente.intervaloFilaOfflineMs);
    return () => clearInterval(temporizador);
  }, [usuarioId, quantidade, processar]);

  const guardar = useCallback(
    async (pendencia: NovaPendencia) => {
      if (usuarioId === null) {
        return;
      }
      const nova: OcorrenciaPendente = {
        ...pendencia,
        idLocal: Crypto.randomUUID(),
        criadaEm: new Date().toISOString(),
      };
      const fila = await lerFila(usuarioId);
      const atualizada = [nova, ...fila];
      await gravarFila(usuarioId, atualizada);
      setEstado({ donoId: usuarioId, itens: atualizada });
    },
    [usuarioId],
  );

  const descartar = useCallback(
    async (idLocal: string) => {
      if (usuarioId === null) {
        return;
      }
      const restante = await removerItem(usuarioId, idLocal);
      setEstado({ donoId: usuarioId, itens: restante });
    },
    [usuarioId],
  );

  const enviarAgora = useCallback(() => processar(true), [processar]);

  const valor = useMemo<ValorFilaOffline>(
    () => ({ pendentes, enviando, guardar, enviarAgora, descartar }),
    [pendentes, enviando, guardar, enviarAgora, descartar],
  );

  return <ContextoFilaOffline value={valor}>{children}</ContextoFilaOffline>;
}

export function useFilaOffline(): ValorFilaOffline {
  const contexto = useContext(ContextoFilaOffline);
  if (!contexto) {
    throw new Error('useFilaOffline precisa estar dentro de ProvedorFilaOffline.');
  }
  return contexto;
}
