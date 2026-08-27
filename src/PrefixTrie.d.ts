/**
 * PrefixTrie
 * Simple, efficient prefix trie data structure for word storage, fast membership testing, and prefix lookups.
 */
export class PrefixTrie {
  wordCount: number;

  constructor();

  /**
   * Insert a word into the trie.
   * @param word - Word to insert
   */
  insert(word: string): void;

  /**
   * Insert multiple words into the trie.
   * @param words - Array of words to insert
   */
  insertAll(words: string[]): void;

  /**
   * Check if a word exists in the trie.
   * @param word - Word to search for
   */
  contains(word: string): boolean;

  /**
   * Check if any word in the trie starts with prefix.
   * @param prefix - Prefix to search for
   */
  startsWith(prefix: string): boolean;

  /**
   * Find all words starting with a given prefix.
   * @param prefix - Prefix to search for
   */
  findWordsWithPrefix(prefix?: string): string[];

  /**
   * Get total number of unique words in the trie.
   */
  size(): number;

  /**
   * Returns all words stored in the trie.
   */
  getAllWords(): string[];
}
