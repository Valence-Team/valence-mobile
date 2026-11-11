export function mascararTelefone(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 11);
  if (digitos.length === 0) {
    return '';
  }
  if (digitos.length <= 2) {
    return `(${digitos}`;
  }
  const ddd = digitos.slice(0, 2);
  const numero = digitos.slice(2);
  if (numero.length <= 4) {
    return `(${ddd}) ${numero}`;
  }
  if (digitos.length <= 10) {
    return `(${ddd}) ${numero.slice(0, 4)}-${numero.slice(4)}`;
  }
  return `(${ddd}) ${numero.slice(0, 5)}-${numero.slice(5)}`;
}

export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

export function mascararDecimal(valor: string): string {
  const limpo = valor.replace(/[^\d,.-]/g, '').replace('.', ',');
  const [inteiro, ...resto] = limpo.split(',');
  return resto.length > 0 ? `${inteiro},${resto.join('')}` : inteiro;
}
