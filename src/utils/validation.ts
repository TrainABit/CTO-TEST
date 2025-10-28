export type NumericOptions = {
  fieldLabel: string;
  allowZero?: boolean;
  min?: number;
};

export function toNumber(value: string | number | null | undefined): number {
  if (typeof value === 'number') {
    return value;
  }
  if (value === null || value === undefined) {
    return Number.NaN;
  }
  const normalized = String(value).replace(/,/g, '').trim();
  if (normalized.length === 0) {
    return Number.NaN;
  }
  return Number(normalized);
}

export function validateNumeric(value: number, options: NumericOptions): string | null {
  const { fieldLabel, allowZero = false, min } = options;

  if (!Number.isFinite(value)) {
    return `${fieldLabel} must be a valid number`;
  }

  if (!allowZero && value <= 0) {
    return `${fieldLabel} must be greater than 0`;
  }

  if (allowZero && value < 0) {
    return `${fieldLabel} must be greater than or equal to 0`;
  }

  if (typeof min === 'number' && value < min) {
    return `${fieldLabel} must be at least ${min}`;
  }

  return null;
}

export function collectValidationErrors(messages: Array<string | null>): string[] {
  return messages.filter((message): message is string => Boolean(message));
}
