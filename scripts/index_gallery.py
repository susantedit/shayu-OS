import os
import re

gallery_dir = r"d:\os-hackclub\public\images\gallery-new"
gallery_tsx = r"d:\os-hackclub\src\apps\Gallery.tsx"

valid_exts = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'}

files = [f for f in os.listdir(gallery_dir) if os.path.splitext(f)[1].lower() in valid_exts and not f.endswith('.part')]

def extract_num(filename):
    m = re.search(r'syau-photo-(\d+)', filename)
    return int(m.group(1)) if m else 999

files.sort(key=extract_num)

items_js = "const DEFAULT_GALLERY = [\n"
for i, f in enumerate(files, 1):
    num = extract_num(f)
    name = f"Photo {num if num != 999 else i}"
    items_js += f"  {{ id: '{i}', img: mediaUrl('/images/gallery-new/{f}'), name: '{name}' }},\n"
items_js += "]"

with open(gallery_tsx, 'r', encoding='utf-8') as file:
    content = file.read()

pattern = r"const DEFAULT_GALLERY = \[[\s\S]*?\]"
new_content = re.sub(pattern, items_js, content)

with open(gallery_tsx, 'w', encoding='utf-8') as file:
    file.write(new_content)

print("Updated Gallery.tsx successfully!")
