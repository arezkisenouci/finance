import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCurrencySymbol(currency: string = "USD"): string {
  switch (currency.toUpperCase()) {
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    case "JPY":
      return "¥";
    case "CAD":
      return "CA$";
    case "DZD":
      return "DA ";
    case "MAD":
      return "DH ";
    case "EGP":
      return "E£ ";
    case "USD":
    default:
      return "$";
  }
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  const symbol = getCurrencySymbol(currency);
  const formattedNumber = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (["DZD", "MAD", "EGP"].includes(currency.toUpperCase())) {
    return `${formattedNumber} ${symbol.trim()}`;
  }

  return `${symbol}${formattedNumber}`;
}
