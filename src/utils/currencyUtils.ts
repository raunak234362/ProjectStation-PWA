export const formatInvoiceCurrency = (
  amount: number,
  currencyType?: string,
): string => {
  const currencyCode = String(currencyType || "USD").toUpperCase();
  if (currencyCode === "CAD") {
    const formattedAmount = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `CAD ${formattedAmount}`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
};