/**
 * MarkovModel
 * Represents a single N-th order Markov chain model built from a training corpus.
 */
export class MarkovModel {
  /**
   * @param {string[]} corpus - List of words to train on
   * @param {number} [order=3] - Memory order (context length)
   * @param {number} [prior=0.001] - Dirichlet prior for additive smoothing
   * @param {boolean} [preserveCase=false] - Keep exact letter casing from corpus
   */
  constructor(corpus, order = 3, prior = 0.001, preserveCase = false) {
    this.order = Math.max(1, Math.floor(order));
    this.prior = Math.max(0, prior);
    this.preserveCase = preserveCase === true;
    this.startChar = '^';
    this.endChar = '$';
    
    this.alphabet = new Set();
    this.observations = new Map(); // context (string) -> Map(nextChar -> count)
    
    if (Array.isArray(corpus) && corpus.length > 0) {
      this.train(corpus);
    }
  }

  /**
   * Train the Markov model on an array of input strings.
   * @param {string[]} corpus 
   */
  train(corpus) {
    const pad = this.startChar.repeat(this.order);

    for (let word of corpus) {
      if (!word || typeof word !== 'string') continue;
      
      let cleanWord = word.trim();
      if (cleanWord.length === 0) continue;

      if (!this.preserveCase) {
        cleanWord = cleanWord.toLowerCase();
      }

      // Track characters in alphabet
      for (let char of cleanWord) {
        this.alphabet.add(char);
      }
      this.alphabet.add(this.endChar);

      const padded = pad + cleanWord + this.endChar;
      
      for (let i = 0; i <= padded.length - this.order - 1; i++) {
        const context = padded.slice(i, i + this.order);
        const nextChar = padded[i + this.order];

        if (!this.observations.has(context)) {
          this.observations.set(context, new Map());
        }
        const transitionMap = this.observations.get(context);
        transitionMap.set(nextChar, (transitionMap.get(nextChar) || 0) + 1);
      }
    }
  }

  /**
   * Get total observations for a context.
   * @param {string} context 
   * @returns {number}
   */
  getContextCount(context) {
    const map = this.observations.get(context);
    if (!map) return 0;
    let sum = 0;
    for (let count of map.values()) {
      sum += count;
    }
    return sum;
  }

  /**
   * Returns whether a context has been observed during training.
   * @param {string} context 
   * @returns {boolean}
   */
  hasContext(context) {
    return this.observations.has(context);
  }

  /**
   * Selects the next character given a context using weighted random sampling.
   * @param {string} context - String of length equal to this.order
   * @param {function(): number} [rng=Math.random] - Random number generator (0 to 1)
   * @returns {string|null} - Selected next character, or null if context cannot produce any char
   */
  selectNextChar(context, rng = Math.random) {
    const transitionMap = this.observations.get(context);

    // If context not found and no Dirichlet prior, return null
    if (!transitionMap && this.prior <= 0) {
      return null;
    }

    const alphabetArr = Array.from(this.alphabet);
    if (alphabetArr.length === 0) return null;

    // Calculate total weight including Dirichlet prior
    let totalWeight = 0;
    const weights = new Float64Array(alphabetArr.length);

    for (let i = 0; i < alphabetArr.length; i++) {
      const char = alphabetArr[i];
      const observedCount = transitionMap ? (transitionMap.get(char) || 0) : 0;
      const weight = observedCount + this.prior;
      weights[i] = weight;
      totalWeight += weight;
    }

    if (totalWeight <= 0) return null;

    // Weighted random sample
    let threshold = rng() * totalWeight;
    for (let i = 0; i < alphabetArr.length; i++) {
      threshold -= weights[i];
      if (threshold <= 0) {
        return alphabetArr[i];
      }
    }

    return alphabetArr[alphabetArr.length - 1];
  }
}
