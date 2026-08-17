/**
 * markov-namegen-js (Browser UMD / Global Build)
 */
(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory(exports);
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } else {
    global = typeof globalThis !== 'undefined' ? globalThis : global || self;
    factory(global.MarkovNamegen = {});
  }
})(this, function (exports) {
  'use strict';

  function formatTitleCase(str) {
    if (!str) return str;
    return str.split(' ').map(word => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
  }

  // ----------------------------------------------------
  // MarkovModel
  // ----------------------------------------------------
  class MarkovModel {
    constructor(corpus, order = 3, prior = 0.001, preserveCase = false) {
      this.order = Math.max(1, Math.floor(order));
      this.prior = Math.max(0, prior);
      this.preserveCase = preserveCase === true;
      this.startChar = '^';
      this.endChar = '$';
      
      this.alphabet = new Set();
      this.observations = new Map();
      
      if (Array.isArray(corpus) && corpus.length > 0) {
        this.train(corpus);
      }
    }

    train(corpus) {
      const pad = this.startChar.repeat(this.order);

      for (let word of corpus) {
        if (!word || typeof word !== 'string') continue;
        let cleanWord = word.trim();
        if (cleanWord.length === 0) continue;

        if (!this.preserveCase) {
          cleanWord = cleanWord.toLowerCase();
        }

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

    getContextCount(context) {
      const map = this.observations.get(context);
      if (!map) return 0;
      let sum = 0;
      for (let count of map.values()) {
        sum += count;
      }
      return sum;
    }

    hasContext(context) {
      return this.observations.has(context);
    }

    selectNextChar(context, rng = Math.random) {
      const transitionMap = this.observations.get(context);

      if (!transitionMap && this.prior <= 0) {
        return null;
      }

      const alphabetArr = Array.from(this.alphabet);
      if (alphabetArr.length === 0) return null;

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

  // ----------------------------------------------------
  // MarkovGenerator
  // ----------------------------------------------------
  class MarkovGenerator {
    constructor(corpus = [], options = {}) {
      this.maxOrder = Math.max(1, Math.floor(options.order || 3));
      this.prior = options.prior !== undefined ? options.prior : 0.001;
      this.useBackoff = options.useBackoff !== false;
      this.preserveCase = options.preserveCase === true;
      this.rng = typeof options.rng === 'function' ? options.rng : Math.random;
      this.models = new Map();

      if (Array.isArray(corpus) && corpus.length > 0) {
        this.train(corpus);
      }
    }

    train(corpus) {
      this.models.clear();
      for (let o = 1; o <= this.maxOrder; o++) {
        const model = new MarkovModel(corpus, o, this.prior, this.preserveCase);
        this.models.set(o, model);
      }
    }

    getNextChar(currentPadded) {
      const startOrder = this.maxOrder;
      const minOrder = this.useBackoff ? 1 : this.maxOrder;

      for (let order = startOrder; order >= minOrder; order--) {
        const model = this.models.get(order);
        if (!model) continue;

        const context = currentPadded.slice(-order);
        if (context.length < order) continue;

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

  // ----------------------------------------------------
  // PrefixTrie
  // ----------------------------------------------------
  class TrieNode {
    constructor() {
      this.children = new Map();
      this.isEndOfWord = false;
    }
  }

  class PrefixTrie {
    constructor() {
      this.root = new TrieNode();
      this.wordCount = 0;
    }

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

    insertAll(words) {
      if (Array.isArray(words)) {
        for (let word of words) {
          this.insert(word);
        }
      }
    }

    contains(word) {
      if (!word || typeof word !== 'string') return false;
      let node = this.root;
      for (let char of word) {
        if (!node.children.has(char)) return false;
        node = node.children.get(char);
      }
      return node.isEndOfWord;
    }

    startsWith(prefix) {
      if (typeof prefix !== 'string') return false;
      let node = this.root;
      for (let char of prefix) {
        if (!node.children.has(char)) return false;
        node = node.children.get(char);
      }
      return true;
    }

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

    size() {
      return this.wordCount;
    }

    getAllWords() {
      return this.findWordsWithPrefix('');
    }
  }

  // ----------------------------------------------------
  // Damerau-Levenshtein
  // ----------------------------------------------------
  function damerauLevenshteinDistance(a, b) {
    if (a === b) return 0;
    if (!a) return b ? b.length : 0;
    if (!b) return a ? a.length : 0;

    const lenA = a.length;
    const lenB = b.length;
    const maxLen = lenA + lenB;
    const da = new Map();
    const d = Array.from({ length: lenA + 2 }, () => new Int32Array(lenB + 2));

    d[0][0] = maxLen;
    for (let i = 0; i <= lenA; i++) {
      d[i + 1][0] = maxLen;
      d[i + 1][1] = i;
    }
    for (let j = 0; j <= lenB; j++) {
      d[0][j + 1] = maxLen;
      d[1][j + 1] = j;
    }

    for (let i = 1; i <= lenA; i++) {
      let db = 0;
      for (let j = 1; j <= lenB; j++) {
        const k = da.get(b[j - 1]) || 0;
        const l = db;
        let cost = 0;

        if (a[i - 1] === b[j - 1]) {
          db = j;
        } else {
          cost = 1;
        }

        d[i + 1][j + 1] = Math.min(
          d[i][j] + cost,
          d[i + 1][j] + 1,
          d[i][j + 1] + 1,
          d[k][l] + (i - k - 1) + 1 + (j - l - 1)
        );
      }
      da.set(a[i - 1], i);
    }

    return d[lenA + 1][lenB + 1];
  }

  function sortBySimilarity(targetName, names, ascending = true) {
    if (!Array.isArray(names)) return [];

    const items = names.map(name => ({
      name,
      distance: damerauLevenshteinDistance(targetName, name)
    }));

    items.sort((a, b) => {
      return ascending ? a.distance - b.distance : b.distance - a.distance;
    });

    return items;
  }

  // ----------------------------------------------------
  // PRESETS
  // ----------------------------------------------------
  const PRESETS = {
    elven: [
      "Aegnor", "Aerandir", "Amras", "Amrod", "Anarion", "Angrod", "Arwen", "Beregond", "Celeborn",
      "Celebrimbor", "Celegorm", "Cirdan", "Curufin", "Daeron", "Elrohir", "Elrond", "Elros", "Elladan",
      "Eärendil", "Ecthelion", "Feanor", "Fingolfin", "Finarfin", "Fingon", "Finrod", "Galadriel",
      "Galdor", "Gil-galad", "Glorfindel", "Haldir", "Idril", "Legolas", "Lúthien", "Maedhros", "Maglor",
      "Maeglin", "Oropher", "Orodreth", "Thingol", "Thranduil", "Turgon", "Valandil", "Voronwë"
    ],
    dwarven: [
      "Azaghâl", "Balin", "Bifur", "Bofur", "Bombur", "Dain", "Dis", "Dori", "Durin", "Dwalin",
      "Farin", "Fili", "Flói", "Frár", "Frerin", "Frór", "Fundin", "Gimli", "Glóin", "Gróin",
      "Grór", "Gundabad", "Ibun", "Kili", "Mîm", "Náin", "Nali", "Nár", "Nori", "Óin",
      "Ori", "Telchar", "Thorin", "Thráin", "Thrór"
    ],
    fantasyPlaces: [
      "Aethelgard", "Aldoria", "Astralis", "Baelmor", "Beldora", "Castellon", "Dragonrest",
      "Eldoria", "Elmswood", "Everfrost", "Faeloria", "Frostfall", "Gryphonwatch", "Ironreach",
      "Kaelmor", "Lysandria", "Mithgard", "Neverwinter", "Oakhaven", "Ravenhold", "Shadowfen",
      "Silverfall", "Stormpeak", "Valoria", "Winterfell", "Zephyria"
    ],
    scifiPlanets: [
      "Aethelon", "Alnitak", "Aquila Prime", "Arrakis", "Balthazar", "Ceti Alpha", "Coruscant",
      "Cygnus major", "Epsilon Eridani", "Helios IV", "Hyperion", "Kepler-186f", "Kronos",
      "Krypton", "Magellan", "Nirvana", "Obsidian", "Omen Prime", "Proxima", "Ryloth",
      "Solaria", "Tatooine", "Titanus", "Vanguard", "Xandar", "Yavin", "Zephyr"
    ],
    romanNames: [
      "Agrippa", "Antony", "Augustus", "Brutus", "Caesar", "Cassius", "Claudius", "Cornelius",
      "Decimus", "Domitian", "Flavius", "Hadrian", "Julius", "Lucius", "Marcus", "Nero",
      "Octavius", "Publius", "Quintus", "Scipio", "Sergius", "Tiberius", "Titus", "Valerius"
    ],
    japaneseNames: [
      "Aoi", "Akira", "Daisuke", "Emi", "Fujiko", "Haruto", "Hayato", "Hina", "Hiroshi",
      "Isamu", "Kenji", "Kaito", "Kazuki", "Koharu", "Makoto", "Mei", "Naoki", "Ren",
      "Riku", "Ryota", "Sakura", "Sora", "Takumi", "Tatsuya", "Yuki", "Yuto"
    ],
    oldEnglish: [
      "Aethelred", "Aethelstan", "Alfred", "Beowulf", "Cerdic", "Cuthbert", "Eadward", "Egbert",
      "Godwin", "Harold", "Hrothgar", "Leofric", "Oswald", "Oswin", "Wulfric", "Wulfstan"
    ]
  };

  exports.MarkovModel = MarkovModel;
  exports.MarkovGenerator = MarkovGenerator;
  exports.formatTitleCase = formatTitleCase;
  exports.PrefixTrie = PrefixTrie;
  exports.damerauLevenshteinDistance = damerauLevenshteinDistance;
  exports.sortBySimilarity = sortBySimilarity;
  exports.PRESETS = PRESETS;
});
