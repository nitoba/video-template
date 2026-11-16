#!/usr/bin/env bash
# Folha de quadros parados por tempo da música (3 colunas, 960 px): bun run folha <slug> 5 22 90 150
# Gera out/folha-<slug>.jpg. REBUNDLE=1 refaz o bundle (sempre que o código mudar).
set -e
cd "$(dirname "$0")/.."
SLUG=${1:?Uso: bun run folha <slug> <tempo>...}; shift
BEAT=$(node -e "console.log(require('./src/videos/$SLUG/timeline.json').beat)")
out=out/folha-$SLUG.jpg; tmp=out/_folha; rm -rf "$tmp"; mkdir -p "$tmp"
if [ -n "${REBUNDLE:-}" ] || [ ! -d out/_bundle ]; then npx remotion bundle src/index.ts --out-dir=out/_bundle --log=error >/dev/null 2>&1; fi
frames=(); for t in "$@"; do frames+=("$(python3 -c "print(round($t*$BEAT))")"); done
printf '%s\n' "${frames[@]}" | xargs -P 3 -I{} npx remotion still out/_bundle "$SLUG" "$tmp/{}.jpg" --frame={} --image-format=jpeg --scale=0.5 --log=error
n=${#frames[@]}; args=(); for q in "${frames[@]}"; do args+=(-i "$tmp/$q.jpg"); done
ffmpeg -v error -y "${args[@]}" -filter_complex "$(for ((i=0;i<n;i++)); do printf '[%d]' $i; done)xstack=inputs=$n:layout=$(python3 -c "
n=$n
print('|'.join(f'{(i%3)*960}_{(i//3)*540}' for i in range(n)))"):fill=black[v]" -map '[v]' -q:v 4 "$out"
rm -rf "$tmp"; echo "$out"
