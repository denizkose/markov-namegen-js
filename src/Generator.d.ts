import { MarkovModel } from './Model.js';

/**
 * Format a string to Title Case.
 * @param str - Input string
 */
export function formatTitleCase(str: string): string;

/**
 * Options for configuring MarkovGenerator.
 */
export interface MarkovGeneratorOptions {
  /**
   * Maximum Markov model order.
   * @default 3
   */
  order?: number;

  /**
   * Dirichlet prior smoothing value.
   * @default 0.001
   */
  prior?: number;

  /**
   * Enable Katz backoff to lower orders when context is unobserved.
   * @default true
   */
  useBackoff?: boolean;

  /**
   * Preserve exact casing from training corpus.
   * @default false
   */
  preserveCase?: boolean;

  /**
   * Custom PRNG returning a float in [0, 1).
   * @default Math.random
   */
  rng?: () => number;
}

/**
 * Constraints for name generation.
 */
export interface GenerateNameConstraints {
  /**
   * Minimum length of the generated name.
   * @default 3
   */
  minLength?: number;

  /**
   * Maximum length of the generated name.
   * @default 12
   */
  maxLength?: number;

  /**
   * Required prefix for the generated name.
   * @default ""
   */
  startsWith?: string;

  /**
   * Required suffix for the generated name.
   * @default ""
   */
  endsWith?: string;

  /**
   * Substring or array of substrings that must be present in the generated name.
   */
  includes?: string | string[];

  /**
   * Substring or array of substrings that must NOT be present in the generated name.
   */
  excludes?: string | string[];

  /**
   * Regular expression pattern (or regex string) that the generated name must match.
   */
  regex?: RegExp | string;

  /**
   * Maximum attempts to satisfy the constraints before giving up.
   * @default 100
   */
  maxAttempts?: number;
}

/**
 * MarkovGenerator
 * Manages multiple order Markov models and generates names according to constraints and Katz backoff rules.
 */
export class MarkovGenerator {
  maxOrder: number;
  prior: number;
  useBackoff: boolean;
  preserveCase: boolean;
  rng: () => number;
  models: Map<number, MarkovModel>;

  /**
   * @param corpus - Array of sample names/words
   * @param options - Generator configuration options
   */
  constructor(corpus?: string[], options?: MarkovGeneratorOptions);

  /**
   * Trains models across all orders from 1 to maxOrder for backoff support.
   * @param corpus - Array of sample names/words
   */
  train(corpus: string[]): void;

  /**
   * Select the next character for a given string sequence using model order and backoff.
   * @param currentPadded - Full padded string so far
   */
  getNextChar(currentPadded: string): string | null;

  /**
   * Generates a single name satisfying specified constraints.
   * @param constraints - Generation constraints
   * @returns Generated name, or null if constraints could not be satisfied
   */
  generateName(constraints?: GenerateNameConstraints): string | null;

  /**
   * Generates multiple unique names according to constraints.
   * @param count - Number of names to generate, default is 10
   * @param constraints - Constraints for generateName
   */
  generateNames(count?: number, constraints?: GenerateNameConstraints): string[];
}
