const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) {
    return '—';
  }
  return currencyFormatter.format(value);
}

export function formatNumber(value: number, fractionDigits = 2): string {
  if (!Number.isFinite(value)) {
    return '—';
  }
  const formatter = fractionDigits === 2 ? decimalFormatter : new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  return formatter.format(value);
}

export function formatPercent(value: number, fractionDigits = 2): string {
  if (!Number.isFinite(value)) {
    return '—';
  }
  return `${formatNumber(value * 100, fractionDigits)}%`;
}

export function formatMonths(value: number): string {
  if (!Number.isFinite(value)) {
    return 'Sustainable';
  }
  return `${formatNumber(value, 1)} months`;
}
