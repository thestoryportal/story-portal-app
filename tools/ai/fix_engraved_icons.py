import re
from pathlib import Path
from datetime import datetime

css_path = Path("src/legacy/legacy.css")
css = css_path.read_text(encoding="utf-8")

backup = css_path.with_suffix(css_path.suffix + f".bak_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
backup.write_text(css, encoding="utf-8")

new_base = r'''.engraved-material-icon {
  font-family: "Material Symbols Outlined" !important;
  font-variation-settings: "FILL" 1, "wght" 700, "GRAD" 0, "opsz" 24;
  font-size: clamp(20px, 4.5vw, 36px);
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  /* Engraved look (parity with monolithic) */
  background:
    radial-gradient(ellipse 150% 60% at 25% 15%, rgba(255,245,200,0.5) 0%, transparent 40%),
    radial-gradient(ellipse 80% 40% at 75% 25%, rgba(248,235,170,0.35) 0%, transparent 35%),
    radial-gradient(ellipse 60% 80% at 15% 70%, rgba(200,160,80,0.25) 0%, transparent 40%),
    radial-gradient(ellipse 100% 50% at 60% 85%, rgba(100,70,20,0.2) 0%, transparent 50%),
    radial-gradient(ellipse 70% 60% at 85% 50%, rgba(120,85,30,0.15) 0%, transparent 45%),
    linear-gradient(168deg,
      #faf0b0 0%,
      #f0e498 3%,
      #e8d888 6%,
      #f2e090 9%,
      #dcc878 12%,
      #d4c068 16%,
      #e0c870 19%,
      #cbb458 23%,
      #c4a850 27%,
      #d0b058 30%,
      #bca048 34%,
      #b49440 38%,
      #c4a448 41%,
      #a88830 45%,
      #b89038 48%,
      #a08028 52%,
      #ac8830 55%,
      #987420 59%,
      #a47c28 62%,
      #8c6818 66%,
      #987020 69%,
      #846014 73%,
      #906820 76%,
      #7a5810 80%,
      #886018 83%,
      #704c0c 87%,
      #7c5410 91%,
      #684408 95%,
      #5c3c04 100%
    );

  -webkit-background-clip: text;
  background-clip: text;

  /* CRITICAL: allow gradient to show */
  color: transparent;
  -webkit-text-fill-color: transparent;

  /* Depth (safe with clipped text) */
  text-shadow:
    0 1px 0 rgba(60, 35, 10, 0.65),
    0 2px 6px rgba(0, 0, 0, 0.35);

  /* Engraved micro-relief (requires defs in DOM) */
  filter: url(#bronze-engraved-filter);

  user-select: none;
  -webkit-user-select: none;
}
'''

# Replace ONLY the first .engraved-material-icon { ... } block
pattern_base = re.compile(r"\.engraved-material-icon\s*\{.*?\}\s*", re.DOTALL)
m = pattern_base.search(css)
if not m:
  raise SystemExit("ERROR: Could not find .engraved-material-icon { ... } block to replace.")

css2 = css[:m.start()] + new_base + "\n" + css[m.end():]

# Ensure every .engraved-material-icon.pressed block has transparent fill + filter
def fix_pressed_block(block: str) -> str:
  # must have background-clip; keep existing background
  if "color:" not in block:
    block = re.sub(r"\}\s*$", "  color: transparent;\n}\n", block)
  if "-webkit-text-fill-color" not in block:
    block = re.sub(r"\}\s*$", "  -webkit-text-fill-color: transparent;\n}\n", block)
  if "filter:" not in block:
    block = re.sub(r"\}\s*$", "  filter: url(#bronze-engraved-filter);\n}\n", block)
  # if color is present but not transparent, force it
  block = re.sub(r"color:\s*[^;]+;", "color: transparent;", block)
  return block

pattern_pressed = re.compile(r"\.engraved-material-icon\.pressed\s*\{.*?\}\s*", re.DOTALL)
pressed_blocks = list(pattern_pressed.finditer(css2))
if not pressed_blocks:
  print("WARN: No .engraved-material-icon.pressed blocks found.")
else:
  out = []
  last = 0
  for mb in pressed_blocks:
    out.append(css2[last:mb.start()])
    out.append(fix_pressed_block(mb.group(0)))
    last = mb.end()
  out.append(css2[last:])
  css2 = "".join(out)

css_path.write_text(css2, encoding="utf-8")
print("OK: Updated src/legacy/legacy.css")
print(f"Backup written: {backup}")
print(f"Pressed blocks updated: {len(pressed_blocks)}")
