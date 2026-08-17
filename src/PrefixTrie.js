/**
 * TrieNode
 * Helper node for PrefixTrie.
 */
class TrieNode {
  constructor() {
    /** @type {Map<string, TrieNode>} */
    this.children = new Map();
    this.isEndOfWord = false;
  }
}

/**
 * PrefixTrie
 * Simple, efficient prefix trie data structure for word storage, fast membership testing, and prefix lookups.
 */
export class PrefixTrie {
  constructor() {
    this.root = new TrieNode();
    this.wordCount = 0;
  }

  /**
   * Insert a word into the trie.
   * @param {string} word 
   */
  insert(word) {
    if (!word || typeof word !== 'string') return;
    let node = this.root;
    for (let char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char);
    }
    if (!node.isEndOfWord) {
      node.isEndOfWord = true;
      this.wordCount++;
    }
  }

  /**
   * Insert multiple words into the trie.
   * @param {string[]} words 
   */
  insertAll(words) {
    if (Array.isArray(words)) {
      for (let word of words) {
        this.insert(word);
      }
    }
  }

  /**
   * Check if a word exists in the trie.
   * @param {string} word 
   * @returns {boolean}
   */
  contains(word) {
    if (!word || typeof word !== 'string') return false;
    let node = this.root;
    for (let char of word) {
      if (!node.children.has(char)) return false;
      node = node.children.get(char);
    }
    return node.isEndOfWord;
  }

  /**
   * Check if any word in the trie starts with prefix.
   * @param {string} prefix 
   * @returns {boolean}
   */
  startsWith(prefix) {
    if (typeof prefix !== 'string') return false;
    let node = this.root;
    for (let char of prefix) {
      if (!node.children.has(char)) return false;
      node = node.children.get(char);
    }
    return true;
  }

  /**
   * Find all words starting with a given prefix.
   * @param {string} prefix 
   * @returns {string[]}
   */
  findWordsWithPrefix(prefix = '') {
    const results = [];
    let node = this.root;
    
    for (let char of prefix) {
      if (!node.children.has(char)) return results;
      node = node.children.get(char);
    }

    const collect = (currNode, currStr) => {
      if (currNode.isEndOfWord) {
        results.push(currStr);
      }
      for (let [char, childNode] of currNode.children) {
        collect(childNode, currStr + char);
      }
    };

    collect(node, prefix);
    return results;
  }

  /**
   * Get total number of unique words in the trie.
   * @returns {number}
   */
  size() {
    return this.wordCount;
  }

  /**
   * Returns all words stored in the trie.
   * @returns {string[]}
   */
  getAllWords() {
    return this.findWordsWithPrefix('');
  }
}
