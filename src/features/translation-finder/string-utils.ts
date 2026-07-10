export class StringUtils {
  static normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .trim();
  }

  static levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) {
      const row: number[] = [];
      for (let j = 0; j <= a.length; j++) {
        if (i === 0) {
          row[j] = j;
        } else if (j === 0) {
          row[j] = i;
        } else {
          const previousRow = matrix[i - 1];
          if (!previousRow) {
            row[j] = 0;
            continue;
          }
          const deletionCost = previousRow[j] ?? 0;
          const insertionCost = row[j - 1] ?? 0;
          const substitutionCost = (previousRow[j - 1] ?? 0) + (b[i - 1] === a[j - 1] ? 0 : 1);
          row[j] = Math.min(deletionCost + 1, insertionCost + 1, substitutionCost);
        }
      }
      matrix[i] = row;
    }

    return matrix[b.length]?.[a.length] ?? 0;
  }

  static calculateSimilarity(first: string, second: string): number {
    const normalizedFirst = this.normalize(first);
    const normalizedSecond = this.normalize(second);
    const maxLength = Math.max(normalizedFirst.length, normalizedSecond.length);
    if (maxLength === 0) {
      return 1;
    }
    const distance = this.levenshteinDistance(normalizedFirst, normalizedSecond);
    return distance / maxLength;
  }
}
