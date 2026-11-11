const MINUTO = 60 * 1000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

function doisDigitos(valor: number): string {
  return String(valor).padStart(2, '0');
}

function paraData(iso: string | undefined | null): Date | null {
  if (!iso) {
    return null;
  }
  const data = new Date(iso);
  return Number.isNaN(data.getTime()) ? null : data;
}

function mesmoDia(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

export function formatarHora(data: Date): string {
  return `${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`;
}

export function formatarDataHora(iso: string | undefined | null): string {
  const data = paraData(iso);
  if (!data) {
    return '';
  }
  return `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}/${data.getFullYear()}, ${formatarHora(data)}`;
}

export function formatarDataCurta(iso: string | undefined | null): string {
  const data = paraData(iso);
  if (!data) {
    return '';
  }
  const agora = new Date();
  if (mesmoDia(data, agora)) {
    return `hoje, ${formatarHora(data)}`;
  }
  const ontem = new Date(agora.getTime() - DIA);
  if (mesmoDia(data, ontem)) {
    return `ontem, ${formatarHora(data)}`;
  }
  return `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}, ${formatarHora(data)}`;
}

export function formatarTempoRelativo(iso: string | undefined | null): string {
  const data = paraData(iso);
  if (!data) {
    return '';
  }
  const diferenca = Date.now() - data.getTime();
  if (diferenca < MINUTO) {
    return 'agora';
  }
  if (diferenca < HORA) {
    return `há ${Math.floor(diferenca / MINUTO)} min`;
  }
  if (diferenca < DIA) {
    return `há ${Math.floor(diferenca / HORA)} h`;
  }
  const dias = Math.floor(diferenca / DIA);
  if (dias === 1) {
    return 'ontem';
  }
  if (dias < 7) {
    return `há ${dias} dias`;
  }
  return `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}/${data.getFullYear()}`;
}

export function formatarDistancia(km: number | undefined | null): string {
  if (km === undefined || km === null || Number.isNaN(km)) {
    return 'distância não informada';
  }
  if (km < 1) {
    return 'a menos de 1 km';
  }
  return `a cerca de ${Math.round(km)} km`;
}

export function formatarPercentual(valor: number | undefined | null): string {
  if (valor === undefined || valor === null || Number.isNaN(valor)) {
    return '';
  }
  const fracao = valor > 1 ? valor / 100 : valor;
  return `${Math.round(fracao * 100)}%`;
}

export function formatarArea(hectares: number | undefined | null): string {
  if (hectares === undefined || hectares === null || Number.isNaN(hectares)) {
    return '';
  }
  const texto = Number.isInteger(hectares)
    ? String(hectares)
    : hectares.toFixed(1).replace('.', ',');
  return `${texto} ha`;
}

export function obterIniciais(nome: string | undefined | null): string {
  if (!nome) {
    return '?';
  }
  const partes = nome
    .replace(/^(eng\.|dr\.|dra\.|sr\.|sra\.)\s+/i, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (partes.length === 0) {
    return '?';
  }
  const primeira = partes[0].charAt(0);
  const ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0) : '';
  return `${primeira}${ultima}`.toUpperCase();
}

export function primeiroNome(nome: string | undefined | null): string {
  if (!nome) {
    return '';
  }
  return nome.trim().split(/\s+/)[0] ?? '';
}

export function dividirTituloECorpo(texto: string): { titulo: string | null; corpo: string } {
  const quebra = texto.indexOf('\n');
  if (quebra <= 0) {
    return { titulo: null, corpo: texto };
  }
  return { titulo: texto.slice(0, quebra).trim(), corpo: texto.slice(quebra + 1).trim() };
}
