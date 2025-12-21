#!/usr/bin/env bash
#!/usr/bin/env bash
set -euo pipefail

IN="${1:-}"
OUT="${2:-}"
FPS="${3:-20}"
WIDTH="${4:-960}"

if [[ -z "$IN" ]]; then
  echo "Usage: video_to_gif.sh <input_video> [output_gif] [fps] [width]"
  exit 1
fi

if [[ ! -f "$IN" ]]; then
  echo "Input not found: $IN"
  exit 1
fi

if [[ -z "$OUT" ]]; then
  OUT="${IN%.*}.gif"
fi

# High-quality GIF via palettegen/paletteuse
ffmpeg -y -i "$IN" \
  -vf "fps=${FPS},scale=${WIDTH}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=256:reserve_transparent=0[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5" \
  "$OUT"

echo "✅ GIF written: $OUT"
SH

chmod +x tools/ai/video_to_gif.sh