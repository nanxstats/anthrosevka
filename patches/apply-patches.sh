#!/usr/bin/env sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
iosevka_dir=${1:-$(pwd)}

if [ ! -f "$iosevka_dir/verdafile.mjs" ] || [ ! -d "$iosevka_dir/packages/font-glyphs/src" ]; then
	echo "error: run from the Iosevka source root or pass the Iosevka clone path." >&2
	echo "usage: $0 [IOSEVKA_DIR]" >&2
	exit 1
fi

patches='
001-capital-q-straight-tail.patch
002-capital-j-raised-tail.patch
003-dotted-zero-rectangular-dot.patch
'

for patch_name in $patches; do
	patch_file="$script_dir/$patch_name"
	printf 'Applying %s... ' "$patch_name"
	if git -C "$iosevka_dir" apply --check "$patch_file" >/dev/null 2>&1; then
		git -C "$iosevka_dir" apply "$patch_file"
		printf 'done\n'
	elif git -C "$iosevka_dir" apply --reverse --check "$patch_file" >/dev/null 2>&1; then
		printf 'already applied\n'
	else
		printf 'failed\n' >&2
		echo "error: $patch_name does not apply cleanly. Check the Iosevka version or rebase the patch." >&2
		exit 1
	fi
done
