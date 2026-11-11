import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { definirToken, registrarAoExpirarSessao } from '@/services/api';
import { ehRespostaLogin, entrar as entrarNaApi, registrar } from '@/services/autenticacao';
import {
  atualizarUsuarioDaSessao,
  carregarSessao,
  limparSessao,
  salvarSessao,
  type Sessao,
} from '@/storage/sessao';
import type { DadosCadastro, RespostaLogin, Usuario } from '@/types/api';

interface ValorAutenticacao {
  usuario: Usuario | null;
  autenticado: boolean;
  restaurando: boolean;
  avisoSessao: string | null;
  entrar: (email: string, senha: string) => Promise<void>;
  cadastrar: (dados: DadosCadastro) => Promise<void>;
  sair: (aviso?: string) => Promise<void>;
  atualizarUsuario: (usuario: Usuario) => Promise<void>;
  limparAvisoSessao: () => void;
}

const ContextoAutenticacao = createContext<ValorAutenticacao | null>(null);

const AVISO_SESSAO_EXPIRADA = 'Sua sessão expirou. Entre de novo.';

export function ProvedorAutenticacao({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [restaurando, setRestaurando] = useState(true);
  const [avisoSessao, setAvisoSessao] = useState<string | null>(null);

  const sair = useCallback(async (aviso?: string) => {
    definirToken(null);
    setSessao(null);
    setAvisoSessao(aviso ?? null);
    await limparSessao();
  }, []);

  useEffect(() => {
    let ativo = true;
    carregarSessao().then((salva) => {
      if (!ativo) {
        return;
      }
      if (salva) {
        definirToken(salva.token);
        setSessao(salva);
      }
      setRestaurando(false);
    });
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    registrarAoExpirarSessao(() => {
      void sair(AVISO_SESSAO_EXPIRADA);
    });
    return () => registrarAoExpirarSessao(null);
  }, [sair]);

  useEffect(() => {
    if (!sessao) {
      return;
    }
    const restante = new Date(sessao.expiraEm).getTime() - Date.now();
    if (Number.isNaN(restante)) {
      return;
    }
    const temporizador = setTimeout(
      () => {
        void sair(AVISO_SESSAO_EXPIRADA);
      },
      Math.max(restante, 0),
    );
    return () => clearTimeout(temporizador);
  }, [sessao, sair]);

  const iniciarSessao = useCallback(async (resposta: RespostaLogin) => {
    const nova: Sessao = {
      token: resposta.token,
      expiraEm: resposta.expiraEm,
      usuario: resposta.usuario,
    };
    definirToken(nova.token);
    await salvarSessao(nova);
    setAvisoSessao(null);
    setSessao(nova);
  }, []);

  const entrar = useCallback(
    async (email: string, senha: string) => {
      const resposta = await entrarNaApi({ email: email.trim().toLowerCase(), senha });
      await iniciarSessao(resposta);
    },
    [iniciarSessao],
  );

  const cadastrar = useCallback(
    async (dados: DadosCadastro) => {
      const resposta = await registrar(dados);
      if (ehRespostaLogin(resposta)) {
        await iniciarSessao(resposta);
        return;
      }
      const login = await entrarNaApi({ email: dados.email, senha: dados.senha });
      await iniciarSessao(login);
    },
    [iniciarSessao],
  );

  const atualizarUsuario = useCallback(async (usuario: Usuario) => {
    setSessao((atual) => (atual ? { ...atual, usuario } : atual));
    await atualizarUsuarioDaSessao(usuario);
  }, []);

  const limparAvisoSessao = useCallback(() => setAvisoSessao(null), []);

  const valor = useMemo<ValorAutenticacao>(
    () => ({
      usuario: sessao?.usuario ?? null,
      autenticado: sessao !== null,
      restaurando,
      avisoSessao,
      entrar,
      cadastrar,
      sair,
      atualizarUsuario,
      limparAvisoSessao,
    }),
    [sessao, restaurando, avisoSessao, entrar, cadastrar, sair, atualizarUsuario, limparAvisoSessao],
  );

  return <ContextoAutenticacao value={valor}>{children}</ContextoAutenticacao>;
}

export function useAutenticacao(): ValorAutenticacao {
  const contexto = useContext(ContextoAutenticacao);
  if (!contexto) {
    throw new Error('useAutenticacao precisa estar dentro de ProvedorAutenticacao.');
  }
  return contexto;
}
