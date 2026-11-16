#!/usr/bin/env bash
# Render em blocos paralelos (cada bloco abre um navegador novo, evitando acúmulo de contextos WebGL), concat sem
# recodificar e mux da trilha. Uso: bun run render <slug>   (CHUNK=220 PARALLEL=2 AUDIO_ONLY=1 opcionais)
set -euo pipefail
cd "$(dirname "$0")/.."
SLUG=${1:?Uso: bun run render <slug>}
TIMELINE=src/videos/$SLUG/timeline.json
WAV=public/$SLUG/trilha.wav
OUT=out/$SLUG.mp4
TOTAL=$(node -e "const t=require('./$TIMELINE');console.log(t.scenes.reduce((a,s)=>a+s.duration,0))")
CHUNK=${CHUNK:-220}
PARALLEL=${PARALLEL:-2}
CHUNKS=out/chunks-$SLUG
mkdir -p out
if [ -z "${AUDIO_ONLY:-}" ]; then rm -rf "$CHUNKS" && mkdir -p "$CHUNKS"; fi
node "src/videos/$SLUG/trilha.mjs"
ranges=()
for ((s = 0; s < TOTAL; s += CHUNK)); do
	e=$((s + CHUNK - 1)); ((e >= TOTAL)) && e=$((TOTAL - 1))
	ranges+=("$s-$e")
done
render_chunk() {
	local range=$1 idx=$2 tries=0
	until npx remotion render "$SLUG" "$CHUNKS/$(printf %02d "$idx").mp4" --frames="$range" --concurrency=1 --muted --log=error; do
		tries=$((tries + 1)); ((tries >= 3)) && { echo "bloco $range falhou"; return 1; }
		echo "repetindo bloco $range"
	done
	echo "bloco $range ok"
}
export -f render_chunk
export SLUG CHUNKS
if [ -z "${AUDIO_ONLY:-}" ]; then
	i=0
	for r in "${ranges[@]}"; do echo "$r $i"; i=$((i + 1)); done | xargs -P "$PARALLEL" -n 2 bash -c 'render_chunk "$0" "$1"'
fi
for f in "$CHUNKS"/*.mp4; do echo "file '$(realpath "$f")'"; done > "$CHUNKS/list.txt"
ffmpeg -v error -y -f concat -safe 0 -i "$CHUNKS/list.txt" -i "$WAV" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart "$OUT"
echo "pronto: $OUT"
