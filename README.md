# markov-namegen-js

> Procedural Markov chain-based name and word generator in JavaScript, reproducing [Tw1ddle/markov-namegen-lib](https://github.com/Tw1ddle/markov-namegen-lib).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js CI](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)
[![TypeScript: Included](https://img.shields.io/badge/TypeScript-Included-blue.svg)](https://www.typescriptlang.org)

**markov-namegen-js** is a zero-dependency, lightweight JavaScript/TypeScript library for procedural name generation using N-th order Markov chains. It is ideal for game development, worldbuilding, fantasy/sci-fi name generators, and procedural content generation.

[Demo](https://denizkose.github.io/markov-chain) 📺

---

## Features

- 🔷 **TypeScript First-Class Support**: Fully typed declarations (`.d.ts`) included out of the box.
- 🎲 **N-th Order Markov Chains**: Configurable memory depth (order 1 to 5+).
- 📉 **Katz Back-off Model**: Seamlessly falls back to lower-order models (`order - 1` down to 1) when context runs cold, preventing premature termination.
- 🧪 **Dirichlet Prior Smoothing**: Additive smoothing parameter to control novelty vs corpus fidelity.
- 🎯 **Advanced Constraints & Filtering**:
  - `minLength` and `maxLength`
  - `startsWith` and `endsWith`
  - `includes` and `excludes` substrings
  - `regex` pattern matching
  - `maxAttempts` retry limit
- 📏 **Damerau-Levenshtein Distance**: Calculate edit distance (including character transpositions) and rank generated names by similarity (`sortBySimilarity`).
- 🌲 **PrefixTrie**: Built-in trie data structure for word storage and fast prefix lookups.
- 📚 **Built-in Presets**: Elven, Dwarven, Fantasy Places, Sci-Fi Planets, Ancient Roman, Japanese, and Old English name corpora.

---

## Installation

```bash
npm install markov-namegen-js
```

---

## Quick Start

### Node.js / ES Modules

```javascript
import { MarkovGenerator, PRESETS, sortBySimilarity } from 'markov-namegen-js';

// Instantiate generator with Elven names preset
const generator = new MarkovGenerator(PRESETS.elven, {
  order: 3,
  prior: 0.001,
  useBackoff: true
});

// Generate 10 procedural names starting with "El"
const names = generator.generateNames(10, {
  startsWith: 'El',
  minLength: 4,
  maxLength: 10
});

console.log(names);
// Output: ["Elrond", "Elrohir", "Elladan", "Elmswood", ...]

// Sort names by similarity to a target name
const sorted = sortBySimilarity('Legolas', names);
console.log(sorted);
```

### Browser (Script Tag / UMD)

```html
<script src="demo/markov-namegen.js"></script>
<script>
  const { MarkovGenerator, PRESETS } = window.MarkovNamegen;
  const generator = new MarkovGenerator(PRESETS.fantasyPlaces, { order: 3 });
  console.log(generator.generateNames(5));
</script>
```

---

## Interactive Demo

Try out the interactive web demo located in [`demo/index.html`](demo/index.html):

```bash
npm run dev
# Serves demo at http://localhost:3000/demo/index.html
```

Or open [`demo/index.html`](demo/index.html) directly in any web browser without needing a web server.

---

## API Reference

### `MarkovGenerator(corpus, options)`

- `corpus`: `string[]` - Array of sample words/names to train on.
- `options.order`: `number` (default `3`) - Maximum Markov model order.
- `options.prior`: `number` (default `0.001`) - Dirichlet prior for additive smoothing.
- `options.useBackoff`: `boolean` (default `true`) - Fall back to lower-order models when context is unobserved.
- `options.preserveCase`: `boolean` (default `false`) - Keep exact corpus letter casing.

#### Methods

- `generateName(constraints)`: Generates a single string or `null`.
  - `constraints.minLength`: `number` (default `3`)
  - `constraints.maxLength`: `number` (default `12`)
  - `constraints.startsWith`: `string`
  - `constraints.endsWith`: `string`
  - `constraints.includes`: `string | string[]`
  - `constraints.excludes`: `string | string[]`
  - `constraints.regex`: `RegExp | string`
  - `constraints.maxAttempts`: `number` (default `100`)
- `generateNames(count, constraints)`: Generates an array of `count` unique names.

### `damerauLevenshteinDistance(a, b)`

Returns the integer Damerau-Levenshtein edit distance between string `a` and string `b`.

### `sortBySimilarity(targetName, namesList, ascending = true)`

Ranks an array of strings by edit distance to `targetName`. Returns `{ name: string, distance: number }[]`.

---

## Testing

```bash
npm test
```

Runs 9 automated unit tests verifying model training, Katz backoff, constraint validation, title-casing, trie lookups, and distance sorting.

---

## License

Released under the [MIT License](LICENSE).
