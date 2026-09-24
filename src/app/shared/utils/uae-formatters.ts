import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Format Emirates ID into 784-YYYY-XXXXXXX-X
 */
export function formatEmiratesId(value: string | null | undefined): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '').slice(0, 15);
  if (!digits) return '';

  let res = digits.slice(0, 3);
  if (digits.length > 3) {
    res += '-' + digits.slice(3, 7);
  }
  if (digits.length > 7) {
    res += '-' + digits.slice(7, 14);
  }
  if (digits.length > 14) {
    res += '-' + digits.slice(14, 15);
  }
  return res;
}

/**
 * Validator for Emirates ID (Format: 784-YYYY-XXXXXXX-X)
 */
export function emiratesIdValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const val = control.value;
    if (!val || val.trim() === '') return null; // Optional unless required
    const eidRegex = /^784-\d{4}-\d{7}-\d{1}$/;
    if (!eidRegex.test(val)) {
      return { invalidEmiratesId: 'Emirates ID must match format 784-YYYY-XXXXXXX-X' };
    }
    return null;
  };
}

/**
 * Format UAE Phone Number with default +971 prefix
 */
export function formatUaePhone(value: string | null | undefined): string {
  if (!value || value.trim() === '') return '+971 ';
  let cleaned = value.trim();

  // Handle local 05x or 5x prefix
  if (cleaned.startsWith('05')) {
    cleaned = '+971 ' + cleaned.slice(1);
  } else if (cleaned.startsWith('5') && !cleaned.startsWith('+')) {
    cleaned = '+971 ' + cleaned;
  } else if (!cleaned.startsWith('+971')) {
    const digitsOnly = cleaned.replace(/\D/g, '');
    if (digitsOnly.startsWith('971')) {
      cleaned = '+' + digitsOnly;
    } else if (digitsOnly.length > 0) {
      cleaned = '+971 ' + digitsOnly;
    } else {
      cleaned = '+971 ';
    }
  }

  // Format spacing for +971 5x xxx xxxx
  const digits = cleaned.replace(/\D/g, '');
  if (digits.startsWith('971')) {
    const body = digits.slice(3, 12);
    let formatted = '+971';
    if (body.length > 0) {
      formatted += ' ' + body.slice(0, 2);
    }
    if (body.length > 2) {
      formatted += ' ' + body.slice(2, 5);
    }
    if (body.length > 5) {
      formatted += ' ' + body.slice(5, 9);
    }
    return formatted;
  }

  return cleaned;
}

/**
 * Validator for UAE Phone Number
 */
export function uaePhoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const val = control.value;
    if (!val || val.trim() === '' || val.trim() === '+971') return null; // Optional unless required
    const digits = val.replace(/\D/g, '');
    // Standard UAE number has 971 + 9 digits (total 12 digits) e.g., 971501234567 or 97141234567 (11 digits for landline)
    if (!digits.startsWith('971') || digits.length < 11 || digits.length > 12) {
      return { invalidPhone: 'Please enter a valid UAE phone number (e.g. +971 50 123 4567)' };
    }
    return null;
  };
}
/**
 * Convert numeric amount into English words (e.g. 15800.00 -> Fifteen Thousand Eight Hundred Dirhams Only)
 */
export function numberToWords(amountStr: string | number | null | undefined): string {
  if (amountStr === null || amountStr === undefined || amountStr === '') return 'Zero Dirhams Only';
  const num = typeof amountStr === 'number' ? amountStr : parseFloat(String(amountStr));
  if (isNaN(num) || num === 0) return 'Zero Dirhams Only';

  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  function convertChunk(n: number): string {
    if (n === 0) return '';
    if (n < 20) return ones[n] + ' ';
    if (n < 100) return tens[Math.floor(n / 10)] + ' ' + convertChunk(n % 10);
    return ones[Math.floor(n / 100)] + ' Hundred ' + convertChunk(n % 100);
  }

  const dirhams = Math.floor(Math.abs(num));
  const fils = Math.round((Math.abs(num) - dirhams) * 100);

  let result = '';
  if (dirhams >= 1000000) {
    result += convertChunk(Math.floor(dirhams / 1000000)) + 'Million ';
  }
  const thousands = Math.floor((dirhams % 1000000) / 1000);
  if (thousands > 0) {
    result += convertChunk(thousands) + 'Thousand ';
  }
  const remainder = dirhams % 1000;
  if (remainder > 0) {
    result += convertChunk(remainder);
  }

  result = result.trim() + ' Dirhams';
  if (fils > 0) {
    result += ' and ' + convertChunk(fils).trim() + ' Fils';
  }
  return result + ' Only';
}
