# Uncertain Footnotes

**Uncertain Footnotes** is a play on words: the site builds sentences out of *notes*—handwritten word cutouts—while the results stay *uncertain*, reshuffled each time. The grammar behind it comes from a linguistics class: phrase-structure rules (S → NP VP, NP, VP, PP) drive how phrases are combined, so every sentence is syntactically valid even when the mix is new.

## What it does

- **Generates sentences** from image cutouts of words, one phrase at a time, using rules like *S → NP VP*, *NP → Det Adj N*, *VP → V NP*, and so on (see `docs/grammar_rules.txt`).
- **Click a phrase** to swap it for another option in the same grammatical slot.
- **Regenerate** to build a whole new sentence from scratch.
- Each phrase type (noun, verb, adjective, etc.) has its own sound when you interact with it.

Different parts of speech include: determiner, adjective, noun, verb, adverb, preposition, full NP, VP, and prepositional phrase.

## Project layout

- **public/** — `index.html`, `script.js`, `images/word_cutouts/` (cutouts by category), `sounds/`
- **docs/grammar_rules.txt** — phrase-structure rules used for generation
- **scripts/generate-manifest.js** — builds the manifest of available cutouts per category

## Credit

© Kira Pan, Jacobs Institute for Design Innovation
