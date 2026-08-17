/**
 * Calculates the Damerau-Levenshtein distance between two strings.
 * Accounts for insertions, deletions, substitutions, and transpositions of adjacent characters.
 * 
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} - Edit distance
 */
export function damerauLevenshteinDistance(a, b) {
  if (a === b) return 0;
  if (!a) return b ? b.length : 0;
  if (!b) return a ? a.length : 0;

  const lenA = a.length;
  const lenB = b.length;

  // Infinite distance bound
  const maxLen = lenA + lenB;
  const da = new Map();

  // Create 2D matrix (lenA + 2) x (lenB + 2)
  const d = Array.from({ length: lenA + 2 }, () => new Int32Array(lenB + 2));

  d[0][0] = maxLen;
  for (let i = 0; i <= lenA; i++) {
    d[i + 1][0] = maxLen;
    d[i + 1][1] = i;
  }
  for (let j = 0; j <= lenB; j++) {
    d[0][j + 1] = maxLen;
    d[1][j + 1] = j;
  }

  for (let i = 1; i <= lenA; i++) {
    let db = 0;
    for (let j = 1; j <= lenB; j++) {
      const k = da.get(b[j - 1]) || 0;
      const l = db;
      let cost = 0;

      if (a[i - 1] === b[j - 1]) {
        db = j;
      } else {
        cost = 1;
      }

      d[i + 1][j + 1] = Math.min(
        d[i][j] + cost, // substitution
        d[i + 1][j] + 1, // insertion
        d[i][j + 1] + 1, // deletion
        d[k][l] + (i - k - 1) + 1 + (j - l - 1) // transposition
      );
    }
    da.set(a[i - 1], i);
  }

  return d[lenA + 1][lenB + 1];
}

/**
 * Sorts an array of string names by their Damerau-Levenshtein distance relative to a target reference name.
 * 
 * @param {string} targetName - Target name to compare against
 * @param {string[]} names - Array of names to sort
 * @param {boolean} [ascending=true] - True for most similar first (lowest distance)
 * @returns {{ name: string, distance: number }[]} - Array of objects with name and distance
 */
export function sortBySimilarity(targetName, names, ascending = true) {
  if (!Array.isArray(names)) return [];

  const items = names.map(name => ({
    name,
    distance: damerauLevenshteinDistance(targetName, name)
  }));

  items.sort((a, b) => {
    return ascending ? a.distance - b.distance : b.distance - a.distance;
  });

  return items;
}
