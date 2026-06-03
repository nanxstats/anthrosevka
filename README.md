# Anthrosevka Mono

Anthrosevka Mono is an [Iosevka](https://github.com/be5invis/Iosevka)
custom build inspired by the look and feel of Anthropic Mono.

![Anthrosevka Mono in Ghostty. With Ghostty configuration `adjust-cell-height = 8`.](assets/screenshot-brew.png)

![Anthrosevka Mono + btop.](assets/screenshot-btop.png)

## Prebuilt fonts

Prebuilt fonts are available in the
[GitHub releases](https://github.com/nanxstats/anthrosevka/releases).

The idea is to ship sensible, opinionated defaults for a better experience out of the box:

- Set spacing to "terminal". This forces special symbols such as arrows to fit
  a strict, narrow one-column layout and fixes rendering issues in terminals.
- Weights 400 and 700 as the defaults.
- Width 600 as the default; no condensed version.
- Unhinted TTF, because you deserve to use a high-resolution display.

## Build from source

Follow [building Iosevka from source](https://github.com/be5invis/Iosevka/blob/main/doc/custom-build.md)
to set up the build environment.

Next, copy `private-build-plans.toml` to the root of the Iosevka clone. Run

```bash
npm run build -- ttf-unhinted::AnthrosevkaMono
```

## Disclaimer

Anthrosevka Mono is an independent third-party project **not** endorsed by,
affiliated with, or supported by Anthropic PBC.

## License

Anthrosevka Mono is licensed under the [SIL Open Font License, Version 1.1](./LICENSE).
