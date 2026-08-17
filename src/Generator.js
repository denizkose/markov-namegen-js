import { MarkovModel } from './Model.js';

/**
 * Format a string to Title Case.
 * @param {string} str 
 * @returns {string}
 */
export function formatTitleCase(str) {
  if (!str) return str;
  return str.split(' ').map(word => {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}

/**
 * MarkovGenerator
 * Manages multiple order Markov models and generates names according to constraints and Katz backoff rules.
 */
export class MarkovGenerator {
  /**
   * @param {string[]} corpus - Array of sample names/words
   * @param {Object} [options={}]
   * @param {number} [options.order=3] - Maximum Markov model order
   * @param {number} [options.prior=0.001] - Dirichlet prior smoothing value
   * @param {boolean} [options.useBackoff=true] - Enable Katz backoff to lower orders
   * @param {boolean} [options.preserveCase=false] - Preserve exact casing from training corpus
   * @param {function(): number} [options.rng=Math.random] - Custom PRNG
   */
  constructor(corpus = [], options = {}) {
    this.maxOrder = Math.max(1, Math.floor(options.order || 3));
    this.prior = options.prior !== undefined ? options.prior : 0.001;
    this.useBackoff = options.useBackoff !== false;
    this.preserveCase = options.preserveCase === true;
    this.rng = typeof options.rng === 'function' ? options.rng : Math.random;

    /** @type {Map<number, MarkovModel>} */
    this.models = new Map();

    if (Array.isArray(corpus) && corpus.length > 0) {
      this.train(corpus);
    }
  }

  /**
   * Trains models across all orders from 1 to maxOrder for backoff support.
   * @param {string[]} corpus 
   */
  train(corpus) {
    this.models.clear();
    for (let o = 1; o <= this.maxOrder; o++) {
      const model = new MarkovModel(corpus, o, this.prior, this.preserveCase);
      this.models.set(o, model);
    }
  }

  /**
   * Select the next character for a given string sequence using model order and backoff.
   * @param {string} currentPadded - Full padded string so far
   * @returns {string|null}
   */
  getNextChar(currentPadded) {
    const startOrder = this.maxOrder;
    const minOrder = this.useBackoff ? 1 : this.maxOrder;

    for (let order = startOrder; order >= minOrder; order--) {
      const model = this.models.get(order);
      if (!model) continue;

      const context = currentPadded.slice(-order);
      if (context.length < order) continue;

      // If backoff is active and context was never observed, fall back to lower order
      if (this.useBackoff && !model.hasContext(context) && order > 1) {
        continue;
      }

      const nextChar = model.selectNextChar(context, this.rng);
      if (nextChar !== null) {
        return nextChar;
      }
    }

    return null;
  }

  /**
   * Generates a single name satisfying specified constraints.
   * @param {Object} [constraints={}]
   * @param {number} [constraints.minLength=3]
   * @param {number} [constraints.maxLength=12]
   * @param {string} [constraints.startsWith=""]
   * @param {string} [constraints.endsWith=""]
   * @param {string|string[]} [constraints.includes]
   * @param {string|string[]} [constraints.excludes]
   * @param {RegExp|string} [constraints.regex]
   * @param {number} [constraints.maxAttempts=100]
   * @returns {string|null} Generated name, or null if constraints could not be satisfied
   */
  generateName(constraints = {}) {
    const minLength = constraints.minLength !== undefined ? constraints.minLength : 3;
    const maxLength = constraints.maxLength !== undefined ? constraints.maxLength : 12;
    let startsWith = constraints.startsWith || '';
    let endsWith = constraints.endsWith || '';
    const maxAttempts = constraints.maxAttempts || 100;

    let includesArr = constraints.includes
      ? (Array.isArray(constraints.includes) ? constraints.includes : [constraints.includes])
      : [];
    let excludesArr = constraints.excludes
      ? (Array.isArray(constraints.excludes) ? constraints.excludes : [constraints.excludes])
      : [];
    const regexPattern = constraints.regex
      ? (constraints.regex instanceof RegExp ? constraints.regex : new RegExp(constraints.regex))
      : null;

    if (!this.preserveCase) {
      startsWith = startsWith.toLowerCase();
      endsWith = endsWith.toLowerCase();
      includesArr = includesArr.map(s => typeof s === 'string' ? s.toLowerCase() : s);
      excludesArr = excludesArr.map(s => typeof s === 'string' ? s.toLowerCase() : s);
    }

    const topModel = this.models.get(this.maxOrder);
    if (!topModel) return null;

    const padChar = topModel.startChar;
    const endChar = topModel.endChar;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      let padded = padChar.repeat(this.maxOrder) + startsWith;
      let word = startsWith;
      let terminated = false;

      while (word.length < maxLength * 2) {
        const nextChar = this.getNextChar(padded);
        if (nextChar === null || nextChar === endChar) {
          terminated = true;
          break;
        }
        word += nextChar;
        padded += nextChar;
      }

      if (!terminated && word.length > maxLength) {
        continue;
      }

      // Check constraints
      if (word.length < minLength || word.length > maxLength) {
        continue;
      }

      if (startsWith && !word.startsWith(startsWith)) {
        continue;
      }

      if (endsWith && !word.endsWith(endsWith)) {
        continue;
      }

      let includesValid = true;
      for (let inc of includesArr) {
        if (inc && !word.includes(inc)) {
          includesValid = false;
          break;
        }
      }
      if (!includesValid) continue;

      let excludesValid = true;
      for (let exc of excludesArr) {
        if (exc && word.includes(exc)) {
          excludesValid = false;
          break;
        }
      }
      if (!excludesValid) continue;

      if (regexPattern && !regexPattern.test(word)) {
        continue;
      }

      return this.preserveCase ? word : formatTitleCase(word);
    }

    return null;
  }

  /**
   * Generates multiple unique names according to constraints.
   * @param {number} [count=10] - Number of names to generate
   * @param {Object} [constraints={}] - Constraints for generateName
   * @returns {string[]}
   */
  generateNames(count = 10, constraints = {}) {
    const results = new Set();
    const maxRetries = count * (constraints.maxAttempts || 100);
    let totalAttempts = 0;

    while (results.size < count && totalAttempts < maxRetries) {
      totalAttempts++;
      const name = this.generateName(constraints);
      if (name) {
        results.add(name);
      }
    }

    return Array.from(results);
  }
}
