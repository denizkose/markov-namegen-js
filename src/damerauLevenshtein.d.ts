/**
 * Similarity result item with name and Damerau-Levenshtein edit distance.
 */
export interface SimilarityResult {
  name: string;
  distance: number;
}

/**
 * Calculates the Damerau-Levenshtein distance between two strings.
 * Accounts for insertions, deletions, substitutions, and transpositions of adjacent characters.
 *
 * @param a - First string
 * @param b - Second string
 * @returns Edit distance
 */
export function damerauLevenshteinDistance(a: string, b: string): number;

/**
 * Sorts an array of string names by their Damerau-Levenshtein distance relative to a target reference name.
 *
 * @param targetName - Target name to compare against
 * @param names - Array of names to sort
 * @param ascending - True for most similar first (lowest distance), default is true
 * @returns Array of objects with name and distance
 */
export function sortBySimilarity(
  targetName: string,
  names: string[],
  ascending?: boolean
): SimilarityResult[];
