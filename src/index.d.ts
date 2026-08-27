import { MarkovModel } from './Model.js';
import { MarkovGenerator, MarkovGeneratorOptions, GenerateNameConstraints, formatTitleCase } from './Generator.js';
import { PrefixTrie } from './PrefixTrie.js';
import { damerauLevenshteinDistance, sortBySimilarity, SimilarityResult } from './damerauLevenshtein.js';
import { PRESETS, Presets } from './presets.js';

export {
  MarkovModel,
  MarkovGenerator,
  MarkovGeneratorOptions,
  GenerateNameConstraints,
  formatTitleCase,
  PrefixTrie,
  damerauLevenshteinDistance,
  sortBySimilarity,
  SimilarityResult,
  PRESETS,
  Presets
};

export interface MarkovNamegenModule {
  MarkovModel: typeof MarkovModel;
  MarkovGenerator: typeof MarkovGenerator;
  formatTitleCase: typeof formatTitleCase;
  PrefixTrie: typeof PrefixTrie;
  damerauLevenshteinDistance: typeof damerauLevenshteinDistance;
  sortBySimilarity: typeof sortBySimilarity;
  PRESETS: Presets;
}

declare const _default: MarkovNamegenModule;
export default _default;
