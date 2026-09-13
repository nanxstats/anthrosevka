# Source patches

## Selected variants

The relevant choices in [private-build-plans.toml](../private-build-plans.toml)
apply to both upright and italic builds:

| Glyphs | Build-plan choice | Iosevka implementation |
| --- | --- | --- |
| `Q` | `capital-q = "straight"` | `QStraightTail` in `letter/latin/upper-q.ptl` |
| `J` | `capital-j = "serifless"` | Rounded hook in `letter/latin/upper-j.ptl` |
| `0` | `zero = "dotted"` | `ZeroDotShape` in `number/0.ptl` |
| `1` | `one = "base"` | `Serifed` flag construction in `number/1.ptl` |
| `a` | `a = "double-storey-tailed"` | `a.doubleStoreyTailed`, `DoubleStorey.Tailed` in `letter/latin/lower-a.ptl` |
| `g` | `g = "double-storey"` | `g.doubleStoreyClosed` in `letter/latin/lower-g.ptl` |
| Comma, semicolon | `punctuation-dot = "square"` | `CommaShape.square`, `comma.square`, `semicolon.square` in `symbol/punctuation/small.ptl` |
| Typographic single/double quotes | Inherit the square comma | `openSingleQuote`, `closeSingleQuote` and their double/low/reversed derivatives in `symbol/punctuation/quotes-and-primes.ptl` |
| ASCII apostrophe `'` | `ascii-single-quote = "straight"` | `asciiSingleQuote/body/straight` |
| ASCII double quote `"` | Built-in straight bars; no separate selection | `asciiDoubleQuote` uses two straight single-quote bodies |

## Glyph adjustments

- **001 - Q:** extends the straight tail farther right, giving it a horizontal
  reach of 2/3 of the distance from the drawing frame's center to the
  right stem.
  The terminal stroke is 8% thicker than the stroke at the root. This brings
  the tail closer to an improved visual direction while preserving the bowl,
  tail depth and weight-dependent root position.
- **002 - J:** raises the serifless hook's left terminal with a straight
  upward extension measuring 21% of the glyph's height. The higher tail
  improves balance while preserving the full capital height and existing
  rounded hook.
- **003 - dotted zero:** replaces the circular dot with a narrow, vertically
  elongated rectangle. Its nominal width is 65% of the original dot diameter
  and its height is 120%, with the existing counter width safeguards retained.
  The zero's outer shape stays the same.
- **004 - 1:** replaces the stroked top flag with a 4 corner outline,
  aligning its terminal with the left edge of the bottom base. The end is
  vertical instead of diagonally cut. The flag retains weight-dependent
  thickness and italic compensation.
- **005 - punctuation:** replaces the curved tails of the square comma and its
  reversed form with parallelograms. The square head, original tail depth,
  weight-dependent tail width and italic compensation remain. Semicolons and
  typographic quotes inherit the angular, Franklin Gothic style construction
  seen in Geist Mono. ASCII quotes retain their selected straight bar shapes.
- **006 - a:** insets the unadorned head terminal by 8% of the drawing frame's
  inner width and raises the bowl stroke at the stem by 5.5% of x-height.
  A short Bézier transition joins the rising stroke smoothly to the left
  bowl. This gives a shorter head and a more dynamic bowl, inspired by
  Geist Mono's balance. The tailed stem and the rest of the bowl remain.
- **007 - g:** slightly narrows and deepens the upper loop to make it rounder,
  and brings the bottom of the lower loop 10% of the descender depth toward
  the baseline. The lower loop link and overlay anchor follow the new bottom.
  The ear rises outward by 6% of x-height from its original root, retaining
  a straight terminal. IBM Plex Mono informs the contrast between loops.

The adjustments use Iosevka's own dimensions and drawing primitives;
no reference font contours are imported. Patches change shared source routines:
accented and derived glyphs follow automatically. In particular, 005 also
affects square comma diacritics (`diacritic-dot = "square"`), and 006 affects
other double-storey `a` forms and the `a` component of `æ`. Patch 007 changes
the selected closed double-storey `g` and its derivatives.

## Reviewing a build

Build all 9 weights in both slopes using the command in the main README.
Inspect `QJ01ag,;''""`, low/reversed quotes, `àäæ`, and `ğǵģ`, as well as the
unchanged ASCII quotes. Check the `Q` tail's reach, the `J` terminal's height,
the zero's rectangular dot, and the alignment of the `1` flag with its base.
Compare Thin, Regular and Heavy at large sizes for contour joins and open
counters, then at text sizes for spacing and texture, including `O0I1l`.

For a before/after comparison of all seven patches, save an unpatched build
before applying them. To isolate patches 005 to 007, use a build with patches
001 to 004 as the baseline. Keep the same build plan for both builds.
