import markovNamegen, {
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
} from '../src/index.js';

// Test MarkovModel
const model: MarkovModel = new MarkovModel(['Legolas', 'Elrond'], 2, 0.001, false);
const order: number = model.order;
const prior: number = model.prior;
const preserveCase: boolean = model.preserveCase;
const startChar: string = model.startChar;
const endChar: string = model.endChar;
const alphabet: Set<string> = model.alphabet;
const observations: Map<string, Map<string, number>> = model.observations;
const count: number = model.getContextCount('^^');
const hasCtx: boolean = model.hasContext('^^');
const nextChar: string | null = model.selectNextChar('^^', () => 0.5);

// Test MarkovGeneratorOptions & GenerateNameConstraints
const options: MarkovGeneratorOptions = {
  order: 3,
  prior: 0.001,
  useBackoff: true,
  preserveCase: false,
  rng: () => Math.random()
};

const constraints: GenerateNameConstraints = {
  minLength: 3,
  maxLength: 12,
  startsWith: 'El',
  endsWith: 'a',
  includes: ['ro', 'on'],
  excludes: ['z'],
  regex: /^[A-Z][a-z]+$/,
  maxAttempts: 100
};

// Test MarkovGenerator
const generator: MarkovGenerator = new MarkovGenerator(PRESETS.elven, options);
generator.train(PRESETS.dwarven);
const next: string | null = generator.getNextChar('^^^');
const singleName: string | null = generator.generateName(constraints);
const names: string[] = generator.generateNames(5, constraints);

// Test formatTitleCase
const title: string = formatTitleCase('aragorn');

// Test PrefixTrie
const trie: PrefixTrie = new PrefixTrie();
trie.insert('Gimli');
trie.insertAll(['Arwen', 'Aragorn']);
const hasGimli: boolean = trie.contains('Gimli');
const startsAr: boolean = trie.startsWith('Ar');
const arWords: string[] = trie.findWordsWithPrefix('Ar');
const trieSize: number = trie.size();
const allWords: string[] = trie.getAllWords();

// Test damerauLevenshteinDistance & sortBySimilarity
const dist: number = damerauLevenshteinDistance('Legolas', 'Elrond');
const sortedResults: SimilarityResult[] = sortBySimilarity('Legolas', PRESETS.elven, true);

// Test PRESETS
const presets: Presets = PRESETS;
const elven: string[] = presets.elven;
const dwarven: string[] = presets.dwarven;
const fantasyPlaces: string[] = presets.fantasyPlaces;
const scifiPlanets: string[] = presets.scifiPlanets;
const romanNames: string[] = presets.romanNames;
const japaneseNames: string[] = presets.japaneseNames;
const oldEnglish: string[] = presets.oldEnglish;

// Test default export
const defaultGen: MarkovGenerator = new markovNamegen.MarkovGenerator(markovNamegen.PRESETS.fantasyPlaces);
const defaultSorted: SimilarityResult[] = markovNamegen.sortBySimilarity('Gondor', markovNamegen.PRESETS.fantasyPlaces);

console.log('TypeScript type checks passed.');
