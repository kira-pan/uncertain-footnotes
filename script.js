/**
 * Uncertainty — phrase-structure sentence generator
 * Uses word-cutout images and grammar rules from docs/grammar_rules.txt
 */

const IMAGE_BASE = 'public/images/word_cutouts';
const MAX_PPS = 2;

// Inline manifest fallback when fetch fails (e.g. file://)
const FALLBACK_MANIFEST = {
  "adjective": ["Screenshot 2026-02-02 at 8.59.42 AM.png", "Screenshot 2026-02-02 at 9.00.33 AM.png", "Screenshot 2026-02-02 at 9.02.15 AM.png", "Screenshot 2026-02-02 at 9.03.07 AM.png", "Screenshot 2026-02-02 at 9.08.44 AM.png", "Screenshot 2026-02-02 at 9.09.03 AM.png", "Screenshot 2026-02-02 at 9.55.20 AM.png", "Screenshot 2026-02-02 at 9.55.38 AM.png", "Screenshot 2026-02-02 at 9.55.54 AM.png", "Screenshot 2026-02-02 at 9.59.23 AM.png"],
  "adverb": ["Screenshot 2026-02-02 at 10.04.10 AM.png", "Screenshot 2026-02-02 at 10.05.22 AM.png", "Screenshot 2026-02-02 at 10.06.17 AM.png"],
  "determiner": ["Screenshot 2026-02-02 at 9.03.47 AM.png", "Screenshot 2026-02-02 at 9.10.28 AM.png"],
  "noun": ["Screenshot 2026-02-02 at 10.00.02 AM.png", "Screenshot 2026-02-02 at 10.01.24 AM.png", "Screenshot 2026-02-02 at 10.05.44 AM.png", "Screenshot 2026-02-02 at 9.00.02 AM.png", "Screenshot 2026-02-02 at 9.01.58 AM.png", "Screenshot 2026-02-02 at 9.03.07 AM copy.png", "Screenshot 2026-02-02 at 9.05.22 AM.png", "Screenshot 2026-02-02 at 9.06.57 AM.png", "Screenshot 2026-02-02 at 9.07.30 AM.png", "Screenshot 2026-02-02 at 9.57.01 AM.png", "Screenshot 2026-02-02 at 9.59.42 AM.png"],
  "NP": ["Screenshot 2026-02-02 at 10.03.53 AM.png", "Screenshot 2026-02-02 at 10.04.30 AM.png", "Screenshot 2026-02-02 at 10.05.06 AM.png", "Screenshot 2026-02-02 at 9.56.45 AM.png", "Screenshot 2026-02-02 at 9.57.15 AM.png"],
  "preposition": ["Screenshot 2026-02-02 at 9.02.40 AM.png", "Screenshot 2026-02-02 at 9.04.04 AM.png", "Screenshot 2026-02-02 at 9.10.12 AM.png", "Screenshot 2026-02-02 at 9.54.57 AM.png"],
  "prepositional phrase": ["Screenshot 2026-02-02 at 9.08.29 AM.png", "Screenshot 2026-02-02 at 9.09.24 AM.png", "Screenshot 2026-02-02 at 9.09.56 AM.png", "Screenshot 2026-02-02 at 9.58.54 AM.png", "Screenshot 2026-02-02 at 9.59.08 AM.png"],
  "verb": ["Screenshot 2026-02-02 at 9.01.30 AM.png", "Screenshot 2026-02-02 at 9.04.18 AM.png", "Screenshot 2026-02-02 at 9.04.39 AM.png", "Screenshot 2026-02-02 at 9.04.51 AM.png", "Screenshot 2026-02-02 at 9.10.48 AM.png", "Screenshot 2026-02-02 at 9.56.05 AM.png", "Screenshot 2026-02-02 at 9.56.25 AM.png", "Screenshot 2026-02-02 at 9.58.05 AM.png"],
  "VP": ["Screenshot 2026-02-02 at 10.00.34 AM.png", "Screenshot 2026-02-02 at 10.00.57 AM.png", "Screenshot 2026-02-02 at 9.09.40 AM.png", "Screenshot 2026-02-02 at 9.58.36 AM.png"]
};

let manifest = null;

const S_RULES = [
  ['NP', 'VP'],
  ['NP', 'VP', 'NP'],
  ['NP', 'VP', 'PP'],
  ['PP', 'NP', 'VP'],
  ['NP', 'VP', 'NP', 'PP'],
  ['NP', 'VP', 'PP', 'PP']
];

const NP_RULES = [
  ['Det', 'N'],
  ['Det', 'Adj', 'N'],
  ['Det', 'Adj', 'Adj', 'N'],
  ['Adj', 'N'],
  ['N'],
  ['N', 'PP']
];

const VP_RULES = [
  ['V'],
  ['V', 'NP'],
  ['Adv', 'V'],
  ['V', 'Adv'],
  ['Adv', 'V', 'NP'],
  ['V', 'NP', 'Adv'],
  ['V', 'PP'],
  ['Adv', 'V', 'NP', 'PP']
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function chance(p) {
  return Math.random() < p;
}

function oneImage(folder) {
  const files = manifest[folder];
  if (!files || files.length === 0) return null;
  return { folder, filename: pick(files) };
}

function imageUrl(folder, filename) {
  const encodedFolder = encodeURIComponent(folder);
  const encodedFile = encodeURIComponent(filename);
  return `${IMAGE_BASE}/${encodedFolder}/${encodedFile}`;
}

function expandPP(ppUsed) {
  if (ppUsed >= MAX_PPS) {
    return { tokens: [], ppUsed };
  }
  if (chance(0.2) && manifest['prepositional phrase']?.length) {
    const img = oneImage('prepositional phrase');
    if (img) return { tokens: [img], ppUsed: ppUsed + 1 };
  }
  const prep = oneImage('preposition');
  const npResult = expandNP(ppUsed + 1);
  if (!prep || !npResult.tokens.length) return { tokens: [], ppUsed };
  return {
    tokens: [prep, ...npResult.tokens],
    ppUsed: npResult.ppUsed
  };
}

function expandNP(ppUsed) {
  if (chance(0.25) && manifest.NP?.length) {
    const img = oneImage('NP');
    if (img) return { tokens: [img], ppUsed };
  }
  const canPP = ppUsed < MAX_PPS;
  const rules = canPP ? NP_RULES : NP_RULES.filter(r => !r.includes('PP'));
  if (rules.length === 0) return { tokens: [], ppUsed };
  const rule = pick(rules);
  const out = [];
  let currentPp = ppUsed;
  for (const sym of rule) {
    if (sym === 'Det') {
      const t = oneImage('determiner');
      if (t) out.push(t);
    } else if (sym === 'Adj') {
      const t = oneImage('adjective');
      if (t) out.push(t);
    } else if (sym === 'N') {
      const t = oneImage('noun');
      if (t) out.push(t);
    } else if (sym === 'PP') {
      const res = expandPP(currentPp);
      currentPp = res.ppUsed;
      out.push(...res.tokens);
    }
  }
  return { tokens: out, ppUsed: currentPp };
}

function expandVP(ppUsed) {
  if (chance(0.2) && manifest.VP?.length) {
    const img = oneImage('VP');
    if (img) return { tokens: [img], ppUsed };
  }
  const canPP = ppUsed < MAX_PPS;
  const rules = canPP ? VP_RULES : VP_RULES.filter(r => !r.includes('PP'));
  if (rules.length === 0) return { tokens: [], ppUsed };
  const rule = pick(rules);
  const out = [];
  let currentPp = ppUsed;
  for (const sym of rule) {
    if (sym === 'V') {
      const t = oneImage('verb');
      if (t) out.push(t);
    } else if (sym === 'Adv') {
      const t = oneImage('adverb');
      if (t) out.push(t);
    } else if (sym === 'NP') {
      const res = expandNP(currentPp);
      currentPp = res.ppUsed;
      out.push(...res.tokens);
    } else if (sym === 'PP') {
      const res = expandPP(currentPp);
      currentPp = res.ppUsed;
      out.push(...res.tokens);
    }
  }
  return { tokens: out, ppUsed: currentPp };
}

function expandS() {
  const rule = pick(S_RULES);
  const all = [];
  let ppUsed = 0;
  for (const sym of rule) {
    if (sym === 'NP') {
      const res = expandNP(ppUsed);
      ppUsed = res.ppUsed;
      all.push(...res.tokens);
    } else if (sym === 'VP') {
      const res = expandVP(ppUsed);
      ppUsed = res.ppUsed;
      all.push(...res.tokens);
    } else if (sym === 'PP') {
      const res = expandPP(ppUsed);
      ppUsed = res.ppUsed;
      all.push(...res.tokens);
    }
  }
  return all;
}

function generateSentence() {
  const tokens = expandS();
  if (tokens.length > 18) return tokens.slice(0, 18);
  return tokens;
}

function pickOtherFromFolder(folder, currentFilename) {
  const files = manifest[folder];
  if (!files || files.length === 0) return null;
  const others = files.length > 1 ? files.filter(f => f !== currentFilename) : files;
  return pick(others);
}

function renderSentence(container, tokens) {
  container.innerHTML = '';
  for (const { folder, filename } of tokens) {
    const img = document.createElement('img');
    img.src = imageUrl(folder, filename);
    img.alt = '';
    img.className = 'word-image';
    img.dataset.folder = folder;
    img.dataset.filename = filename;
    img.title = 'Click to replace with another ' + folder;
    img.addEventListener('click', () => {
      const newFilename = pickOtherFromFolder(folder, img.dataset.filename);
      if (newFilename) {
        img.dataset.filename = newFilename;
        img.src = imageUrl(folder, newFilename);
      }
    });
    container.appendChild(img);
  }
}

async function loadManifest() {
  if (manifest) return manifest;
  try {
    const res = await fetch(`${IMAGE_BASE}/manifest.json`);
    if (res.ok) manifest = await res.json();
  } catch (_) {}
  if (!manifest) manifest = FALLBACK_MANIFEST;
  return manifest;
}

async function regenerate() {
  const container = document.getElementById('sentence');
  const btn = document.getElementById('regenerate-btn');
  if (!container || !btn) return;
  btn.disabled = true;
  await loadManifest();
  const numSentences = chance(0.5) ? 1 : 2;
  container.innerHTML = '';
  for (let i = 0; i < numSentences; i++) {
    const row = document.createElement('div');
    row.className = 'sentence-row';
    const tokens = generateSentence();
    if (tokens.length) renderSentence(row, tokens);
    container.appendChild(row);
  }
  btn.disabled = false;
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('regenerate-btn');
  if (btn) btn.addEventListener('click', regenerate);
});
