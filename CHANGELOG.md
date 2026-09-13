# Changelog

## Anthrosevka Mono (development version)

### Supported weights

- Besides font weights 400 and 700, add weights 100, 200, 300, 500, 600, 800,
  and 900 that Iosevka natively supports to the custom build plan (#25).

## Anthrosevka Mono 0.3.1

### Maintenance

- Rebuild fonts with Iosevka v34.8.1 (#22).

## Anthrosevka Mono 0.3.0

### Glyph design

- Reworked the `1` base variant flag so its terminal aligns with the bottom
  base and uses a straight vertical end similar to Anthropic Mono (#18).

## Anthrosevka Mono 0.2.0

### Glyph design

- Adjusted the uppercase `J` serifless hook with a higher, more balanced tail
  inspired by Anthropic Mono while preserving full glyph height (#13).
- Refined the uppercase `Q` straight tail so its terminal extends farther right,
  closer to the right stem (#13).
- Changed dotted zero from a circular dot to a rectangular dot, matching the
  Anthropic Mono style dotted zero (#13).

### Maintenance

- Added reusable patch files for the `J`, `Q`, and dotted zero glyph changes (#13).
- Added `patches/apply-patches.sh` to reapply the glyph patches after
  refreshing the upstream Iosevka source tree (#13).

## Anthrosevka Mono 0.1.0

First release of Anthrosevka Mono, an Iosevka custom build inspired by the
look and feel of Anthropic Mono.

### Font configuration

- Sans-serif design with a curated set of glyph variants for digits,
  uppercase and lowercase letters, punctuation, and ligatures (#1).
- Square dots for tittle, diacritic dot, and punctuation dot.
- Spacing set to `term` so special symbols such as arrows fit a strict,
  one-column layout and render correctly in terminals.
- Regular (400) and Bold (700) weights.
- Normal width (600); no condensed variant.
- Upright and Italic (9.4&deg;) slopes.

### Distribution

- Added `private-build-plans.toml` for building from source.
- Added HTML glyph verifier/comparison tool for sanity checking builds (#1).
- Added `release.sh` to package the build output into a distributable zip,
  for shipping prebuilt fonts via GitHub releases (#2).
