import assert from 'assert';
import {
  MarkovModel,
  MarkovGenerator,
  formatTitleCase,
  PrefixTrie,
  damerauLevenshteinDistance,
  sortBySimilarity,
  PRESETS
} from '../src/index.js';

console.log('🧪 Starting test suite for markov-namegen-js...\n');

let passedTests = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✕ ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// 1. MarkovModel Tests
test('MarkovModel trains and samples next character', () => {
  const model = new MarkovModel(['Legolas', 'Elrond', 'Arwen'], 2, 0.001);
  assert.strictEqual(model.order, 2);
  assert.ok(model.observations.size > 0);
  assert.ok(model.alphabet.has('l'));
  assert.ok(model.alphabet.has('$'));

  const next = model.selectNextChar('^^');
  assert.ok(next !== null);
});

// 2. MarkovGenerator Tests & Backoff
test('MarkovGenerator trains multiple order models and generates names', () => {
  const generator = new MarkovGenerator(PRESETS.elven, { order: 3, prior: 0.001, useBackoff: true });
  assert.strictEqual(generator.models.size, 3);

  const name = generator.generateName({ minLength: 3, maxLength: 10 });
  assert.ok(typeof name === 'string');
  assert.ok(name.length >= 3 && name.length <= 10);
});

test('MarkovGenerator respects constraints and formats Title Case without mid-word capitals', () => {
  const generator = new MarkovGenerator(PRESETS.elven, { order: 2, prior: 0.01 });

  const name = generator.generateName({
    startsWith: 'Fi',
    minLength: 4,
    maxLength: 10,
    maxAttempts: 200
  });

  assert.ok(name !== null, 'Should generate a name starting with Fi');
  assert.ok(name.startsWith('Fi'));
  // Ensure no mid-word uppercase letters like FiFingon (should be Fifingon)
  const rest = name.slice(1);
  assert.strictEqual(rest, rest.toLowerCase(), 'Rest of string should be lowercase');
});

test('MarkovGenerator respects includes and excludes constraints', () => {
  const generator = new MarkovGenerator(PRESETS.dwarven, { order: 2, prior: 0.01 });

  const name = generator.generateName({
    includes: 'in',
    excludes: 'z',
    maxAttempts: 300
  });

  if (name !== null) {
    assert.ok(name.toLowerCase().includes('in'));
    assert.ok(!name.toLowerCase().includes('z'));
  }
});

test('MarkovGenerator batch generation returns array of names', () => {
  const generator = new MarkovGenerator(PRESETS.fantasyPlaces, { order: 3 });
  const names = generator.generateNames(5, { minLength: 4, maxLength: 15 });
  
  assert.ok(Array.isArray(names));
  assert.ok(names.length > 0);
  for (let n of names) {
    assert.ok(typeof n === 'string');
  }
});

test('formatTitleCase capitalizes words properly', () => {
  assert.strictEqual(formatTitleCase('fifingon'), 'Fifingon');
  assert.strictEqual(formatTitleCase('aquila prime'), 'Aquila Prime');
  assert.strictEqual(formatTitleCase('gil-galad'), 'Gil-galad');
});

// 3. PrefixTrie Tests
test('PrefixTrie stores words and performs prefix queries', () => {
  const trie = new PrefixTrie();
  trie.insertAll(['Arwen', 'Aragorn', 'Boromir']);

  assert.strictEqual(trie.size(), 3);
  assert.ok(trie.contains('Arwen'));
  assert.ok(!trie.contains('Gimli'));
  assert.ok(trie.startsWith('Ar'));
  assert.ok(!trie.startsWith('Bo-x'));

  const arWords = trie.findWordsWithPrefix('Ar');
  assert.strictEqual(arWords.length, 2);
  assert.ok(arWords.includes('Arwen'));
  assert.ok(arWords.includes('Aragorn'));
});

// 4. Damerau-Levenshtein Distance Tests
test('damerauLevenshteinDistance calculates edit distance including transpositions', () => {
  assert.strictEqual(damerauLevenshteinDistance('gimli', 'gimli'), 0);
  assert.strictEqual(damerauLevenshteinDistance('gimli', 'giml'), 1); // Deletion
  assert.strictEqual(damerauLevenshteinDistance('gimli', 'gimlia'), 1); // Insertion
  assert.strictEqual(damerauLevenshteinDistance('gimli', 'gamli'), 1); // Substitution
  assert.strictEqual(damerauLevenshteinDistance('ab', 'ba'), 1); // Transposition
});

test('sortBySimilarity sorts names by distance to target', () => {
  const names = ['Legolas', 'Elrond', 'Elros', 'Galadriel'];
  const sorted = sortBySimilarity('Elrond', names);

  assert.strictEqual(sorted[0].name, 'Elrond');
  assert.strictEqual(sorted[0].distance, 0);
  assert.strictEqual(sorted[1].name, 'Elros');
  assert.strictEqual(sorted[1].distance, 2);
});

console.log(`\n🎉 All ${passedTests} tests passed successfully!`);
