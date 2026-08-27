/**
 * MarkovModel
 * Represents a single N-th order Markov chain model built from a training corpus.
 */
export class MarkovModel {
  order: number;
  prior: number;
  preserveCase: boolean;
  startChar: string;
  endChar: string;
  alphabet: Set<string>;
  observations: Map<string, Map<string, number>>;

  /**
   * @param corpus - List of words to train on
   * @param order - Memory order (context length), default is 3
   * @param prior - Dirichlet prior for additive smoothing, default is 0.001
   * @param preserveCase - Keep exact letter casing from corpus, default is false
   */
  constructor(corpus?: string[], order?: number, prior?: number, preserveCase?: boolean);

  /**
   * Train the Markov model on an array of input strings.
   * @param corpus - List of words to train on
   */
  train(corpus: string[]): void;

  /**
   * Get total observations for a context.
   * @param context - The context string
   */
  getContextCount(context: string): number;

  /**
   * Returns whether a context has been observed during training.
   * @param context - The context string
   */
  hasContext(context: string): boolean;

  /**
   * Selects the next character given a context using weighted random sampling.
   * @param context - String of length equal to this.order
   * @param rng - Random number generator returning [0, 1)
   * @returns Selected next character, or null if context cannot produce any char
   */
  selectNextChar(context: string, rng?: () => number): string | null;
}
