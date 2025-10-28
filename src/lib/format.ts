const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat("en-US", {
  style: "decimal",
  maximumFractionDigits: 1,
});

export function formatCurrency(amount: number) {
  return currencyFormatter.format(amount);
}

export function formatPercentage(value: number, options?: { maximumFractionDigits?: number }) {
  const percentage = value / 100;
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: options?.maximumFractionDigits ?? 0,
  }).format(percentage);
}

export function formatScore(value: number) {
  return decimalFormatter.format(value);
}

export function formatOptional<T>(value: T | null | undefined, formatter: (val: T) => string) {
  if (value === null || value === undefined) {
    return "—";
  }
  return formatter(value);
}
