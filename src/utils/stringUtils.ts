/**
 * Truncates a string to a specified number of words and adds an ellipsis if truncated.
 * Also strips HTML tags by default.
 *
 * @param text The string to truncate.
 * @param limit The maximum number of words to allow.
 * @param stripHtml Whether to strip HTML tags before counting words. Defaults to true.
 * @returns The truncated string.
 */
export const truncateWords = (
  text: string,
  limit: number,
  stripHtml: boolean = true,
): string => {
  if (!text) return "";

  let processedText = text;
  if (stripHtml) {
    // Replace &nbsp; with space and strip HTML tags
    processedText = text.replace(/&nbsp;/gi, " ").replace(/<[^>]*>?/gm, "");
  }

  const words = processedText
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  if (words.length <= limit) {
    return processedText;
  }

  return words.slice(0, limit).join(" ") + "...";
};

/**
 * Generates an invoice number in the format: INV-(project initials)-MM-DD-YY
 * @param projectName The name of the project.
 * @param date The invoice date (string, number, or Date).
 * @returns The formatted invoice number.
 */
export const generateInvoiceNumber = (
  projectName: string,
  date: string | number | Date = new Date(),
): string => {
  if (!projectName) return "INV-NA-MM-DD-YY";

  const words = projectName
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  // Take initials of first 2-3 words
  const initials = words
    .slice(0, 3)
    .map((word) => word[0].toUpperCase())
    .join("");

  const d = new Date(date);
  // Ensure date is valid, otherwise use today
  const finalDate = isNaN(d.getTime()) ? new Date() : d;

  const mm = String(finalDate.getMonth() + 1).padStart(2, "0");
  const dd = String(finalDate.getDate()).padStart(2, "0");
  const yy = String(finalDate.getFullYear()).slice(-2);

  return `INV-${initials}-${mm}-${dd}-${yy}`;
};
