# Kontak tabakası: python3 test/kontak.py çıktı.png x y w h dosya1 dosya2 ...
import sys
from PIL import Image, ImageDraw
out, x, y, w, h = sys.argv[1], *map(int, sys.argv[2:6])
files = sys.argv[6:]
cols = min(5, len(files)); rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w, rows * (h + 18)), (20, 20, 20))
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').crop((x, y, x + w, y + h))
    cx, cy = (i % cols) * w, (i // cols) * (h + 18)
    sheet.paste(im, (cx, cy + 18))
    d.text((cx + 4, cy + 3), f.split('/')[-1], fill=(230, 220, 200))
sheet.save(out)
