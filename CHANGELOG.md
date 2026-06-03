# Changelog

## Anthrosevka Mono 0.1.0

First release of Anthrosevka Mono, an Iosevka custom build inspired by the
look and feel of Anthropic Mono.

### Font configuration

- Sans-serif design with a curated set of glyph variants for digits,
  uppercase and lowercase letters, punctuation, and ligatures.
- Square dots for tittle, diacritic dot, and punctuation dot.
- Spacing set to `term` so special symbols such as arrows fit a strict,
  one-column layout and render correctly in terminals.
- Regular (400) and Bold (700) weights.
- Normal width (600); no condensed variant.
- Upright and Italic (9.4&deg;) slopes.

### Distribution

- Added `private-build-plans.toml` for building from source.
- Added HTML glyph verifier/comparison tool for sanity checking builds.
- Added `release.sh` to package the build output into a distributable zip,
  for shipping prebuilt fonts via GitHub releases.
