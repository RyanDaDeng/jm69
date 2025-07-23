export function convertToEnglishNumber(num) {
    if (!num) return 0;
    return num >= 1000 ? (num / 1000).toFixed(2) + "k" : num;
}