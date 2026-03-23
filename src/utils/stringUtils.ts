/**
 * Truncates a string to a specified number of words and adds an ellipsis if truncated.
 * Also strips HTML tags by default.
 * 
 * @param text The string to truncate.
 * @param limit The maximum number of words to allow.
 * @param stripHtml Whether to strip HTML tags before counting words. Defaults to true.
 * @returns The truncated string.
 */
export const truncateWords = (text: string, limit: number, stripHtml: boolean = true): string => {
    if (!text) return "";

    let processedText = text;
    if (stripHtml) {
        // Strip HTML tags
        processedText = text.replace(/<[^>]*>?/gm, "");
    }

    const words = processedText.trim().split(/\s+/).filter((word) => word.length > 0);

    if (words.length <= limit) {
        return processedText;
    }

    return words.slice(0, limit).join(" ") + "...";
};
