export const limites = {
  nome: 120,
  email: 150,
  senhaMinima: 8,
  senhaMaxima: 100,
  municipio: 100,
  descricaoOcorrencia: 500,
  parecer: 1000,
  praga: 120,
  publicacao: 500,
  comentario: 300,
  nomePropriedade: 100,
};

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type Erros<T extends string> = Partial<Record<T, string>>;

export function emailValido(email: string): boolean {
  return REGEX_EMAIL.test(email.trim());
}

export function validarObrigatorio(valor: string, mensagem: string): string | undefined {
  return valor.trim().length === 0 ? mensagem : undefined;
}

export function validarEmail(email: string): string | undefined {
  if (email.trim().length === 0) {
    return 'Informe o e-mail.';
  }
  if (email.trim().length > limites.email || !emailValido(email)) {
    return 'Informe um e-mail válido, como voce@exemplo.com.';
  }
  return undefined;
}

export function validarSenha(senha: string): string | undefined {
  if (senha.length === 0) {
    return 'Crie uma senha.';
  }
  if (senha.length < limites.senhaMinima) {
    return `A senha precisa ter no mínimo ${limites.senhaMinima} caracteres.`;
  }
  if (senha.length > limites.senhaMaxima) {
    return `A senha pode ter no máximo ${limites.senhaMaxima} caracteres.`;
  }
  return undefined;
}

export function validarTelefone(telefone: string): string | undefined {
  const digitos = telefone.replace(/\D/g, '');
  if (digitos.length === 0) {
    return undefined;
  }
  return digitos.length === 10 || digitos.length === 11
    ? undefined
    : 'Informe o telefone com DDD, como (16) 90000-0000.';
}

export function validarTamanho(valor: string, maximo: number, nomeCampo: string): string | undefined {
  return valor.trim().length > maximo
    ? `${nomeCampo} pode ter no máximo ${maximo} caracteres.`
    : undefined;
}

export function converterNumero(texto: string): number | null {
  const normalizado = texto.trim().replace(',', '.');
  if (normalizado.length === 0) {
    return null;
  }
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : null;
}

export function temErros<T extends string>(erros: Erros<T>): boolean {
  return Object.values(erros).some(Boolean);
}
