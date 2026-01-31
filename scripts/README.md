# Scripts

CLI tools for cleaning code, converting assets, and managing `.perky` bundles. Not part of the engine — these are development and pipeline utilities you run from the terminal.

---

## How it fits together

```
yarn clean ──→ cleaner.js ──→ cleaner/ (auditors, fixers, config)
                                 ├── auditors/eslint/
                                 ├── auditors/tests/
                                 ├── auditors/coverage/
                                 ├── auditors/filescore/
                                 └── auditors/docs/

yarn perky-import ──→ perky_import.js ──→ io/pack.js (unpack .perky)

perky_packer.js ──→ io/pack.js (pack / unpack)

psd_exporter.js ──→ psd_exporter/ (PSD → PNG)
```

The cleaner is the one you'll use most. The others are asset pipeline tools.

---

## The files that matter

### [cleaner.js](cleaner.js)

Entry point for the code quality tool. Audits and fixes style, imports, whitespace, ESLint rules, test coverage, and more.

```sh
yarn clean                  # audit + fix everything
yarn clean core/            # audit + fix a specific folder
yarn cleaner --audit        # audit only (no changes)
yarn cleaner --fix          # fix only
yarn cleaner --coverage     # check test coverage
yarn cleaner --filescore    # score files by health
yarn cleaner --flop         # 10 worst-scored files
yarn cleaner --imports      # rank files by import count
yarn cleaner --filelength   # sort files by line count
yarn cleaner --help         # full usage
```

The actual auditors and fixers live in [cleaner/](cleaner/). Each auditor is a class with an `audit()` method and optionally a `fix()` method.

---

### [format.js](format.js)

Terminal color helpers used by the cleaner output. `bold`, `dim`, `green`, `yellow`, `cyan`, `gray`, plus layout functions like `header`, `subHeader`, `success`, `warning`.

---

### [perky_import.js](perky_import.js)

Imports a `.perky` file into a project. Extracts spritesheets and animators, places them according to the project's `perky.config.js`, and updates the manifest.

```sh
yarn perky-import den blue.perky
```

Reads `<target>/perky.config.js` for asset paths. Updates `manifest.json` with the new entries and bumps the patch version.

---

### [perky_packer.js](perky_packer.js)

Packs and unpacks `.perky` bundles — a simple multi-file format built on `io/pack.js`.

```sh
# Pack files into a bundle
node scripts/perky_packer.js sprite.json sprite.png -o character.perky

# Unpack a bundle
node scripts/perky_packer.js -u character.perky -o output/
```

---

### [psd_exporter.js](psd_exporter.js)

Exports PSD files to PNG. Supports resizing and nearest-neighbor interpolation for pixel art.

```sh
node scripts/psd_exporter.js character.psd --width 256
node scripts/psd_exporter.js pixel_art.psd -w 128 --nearest
```

---

## Subfolders

### [cleaner/](cleaner/)

The cleaner's internals. Auditors are grouped by concern:

- **auditors/** — code style (whitespace, comments, imports, console, privacy, function order, multiple classes)
- **auditors/eslint/** — ESLint integration (errors, directives, disables, switches)
- **auditors/tests/** — test quality (missing tests, deep nesting, `it` usage, single describes)
- **auditors/coverage/** — coverage indicators (stale files, missing coverage, missing docs, import usage)
- **auditors/filescore/** — health scoring with weighted scorers (age, stability, maturity, coverage, balance, size, usage)
- **auditors/docs/** — documentation checks (broken links)

### [psd_exporter/](psd_exporter/)

PSD parsing and PNG export implementation.

---

## Going further

The cleaner has extensive tests — each auditor has a `.test.js`. Run `yarn cleaner --help` for the full option list.
