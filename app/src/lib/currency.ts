// Currency symbol mapping based on backend CurrencyListView
export const CURRENCY_SYMBOLS: Record<string, string> = {
  'USD': '$', 'EUR': '€', 'GBP': '£', 'NPR': 'रू', 'AUD': 'A$', 'CAD': 'C$',
  'INR': '₹', 'JPY': '¥', 'CHF': 'CHF', 'CNY': '¥', 'SGD': 'S$', 'HKD': 'HK$',
  'KRW': '₩', 'THB': '฿', 'MYR': 'RM', 'IDR': 'Rp', 'PHP': '₱', 'VND': '₫',
  'BRL': 'R$', 'MXN': '$', 'ARS': '$', 'CLP': '$', 'COP': '$', 'PEN': 'S/',
  'UYU': '$', 'ZAR': 'R', 'EGP': 'E£', 'NGN': '₦', 'KES': 'KSh', 'GHS': 'GH₵',
  'UGX': 'USh', 'TZS': 'TSh', 'RUB': '₽', 'TRY': '₺', 'PLN': 'zł', 'CZK': 'Kč',
  'HUF': 'Ft', 'SEK': 'kr', 'NOK': 'kr', 'DKK': 'kr', 'ISK': 'kr', 'NZD': 'NZ$',
  'AED': 'د.إ', 'SAR': 'ر.س', 'QAR': 'ر.ق', 'KWD': 'د.ك', 'BHD': '.د.ب', 'OMR': 'ر.ع.',
  'JOD': 'د.ا', 'ILS': '₪',
};

/**
 * Get currency symbol for a given currency code
 * @param currencyCode - 3-letter currency code (e.g., 'USD', 'NPR')
 * @returns Currency symbol or currency code if symbol not found
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  return CURRENCY_SYMBOLS[currencyCode?.toUpperCase()] || currencyCode || '$';
};

/**
 * Format a monetary amount with the appropriate currency symbol
 * @param amount - The numeric amount or string amount
 * @param currencyCode - 3-letter currency code
 * @param options - Formatting options
 * @returns Formatted amount with currency symbol
 */
export const formatCurrency = (
  amount: string | number,
  currencyCode: string,
  options: {
    showSymbol?: boolean;
    symbolPosition?: 'before' | 'after';
    decimalPlaces?: number;
    useLocaleString?: boolean;
  } = {}
): string => {
  const {
    showSymbol = true,
    symbolPosition = 'before',
    decimalPlaces = 2,
    useLocaleString = true,
  } = options;

  // Convert amount to number
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(String(amount || '0'));
  
  // Format the number
  let formattedAmount = '';
  if (useLocaleString) {
    formattedAmount = numericAmount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimalPlaces,
    });
  } else {
    formattedAmount = numericAmount.toFixed(decimalPlaces);
  }

  if (!showSymbol) {
    return formattedAmount;
  }

  const symbol = getCurrencySymbol(currencyCode);
  
  return symbolPosition === 'before' 
    ? `${symbol} ${formattedAmount}`
    : `${formattedAmount} ${symbol}`;
};