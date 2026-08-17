import { MarkovModel } from './Model.js';
import { MarkovGenerator, formatTitleCase } from './Generator.js';
import { PrefixTrie } from './PrefixTrie.js';
import { damerauLevenshteinDistance, sortBySimilarity } from './damerauLevenshtein.js';
import { PRESETS } from './presets.js';

export {
  MarkovModel,
  MarkovGenerator,
  formatTitleCase,
  PrefixTrie,
  damerauLevenshteinDistance,
  sortBySimilarity,
  PRESETS
};

export default {
  MarkovModel,
  MarkovGenerator,
  formatTitleCase,
  PrefixTrie,
  damerauLevenshteinDistance,
  sortBySimilarity,
  PRESETS
};
