import { useEffect, useState } from 'react';

import { converterErro } from '@/services/api';
import { carregarFoto, fotoJaCarregada } from '@/services/ocorrencias';
import type { FotoOcorrencia } from '@/types/api';

interface EstadoFoto {
  chave: string;
  uri: string | null;
  erro: string | null;
}

export interface FotoProtegida {
  uri: string | null;
  carregando: boolean;
  erro: string | null;
  tentarDeNovo: () => void;
}

export function useFotoProtegida(foto: FotoOcorrencia | null | undefined): FotoProtegida {
  const [tentativa, setTentativa] = useState(0);
  const [estado, setEstado] = useState<EstadoFoto | null>(null);
  const url = foto?.url ?? null;
  const contentType = foto?.contentType;
  const chave = url ? `${url}#${tentativa}` : null;

  useEffect(() => {
    if (!url || !chave) {
      return undefined;
    }
    let ativo = true;
    carregarFoto(url, contentType).then(
      (uri) => {
        if (ativo) {
          setEstado({ chave, uri, erro: null });
        }
      },
      (erro: unknown) => {
        if (ativo) {
          setEstado({ chave, uri: null, erro: converterErro(erro).message });
        }
      },
    );
    return () => {
      ativo = false;
    };
  }, [chave, url, contentType]);

  const atual = estado?.chave === chave ? estado : null;
  const uri = (url ? fotoJaCarregada(url) : null) ?? atual?.uri ?? null;
  const erro = uri ? null : (atual?.erro ?? null);

  return {
    uri,
    carregando: url !== null && uri === null && erro === null,
    erro,
    tentarDeNovo: () => setTentativa((n) => n + 1),
  };
}
