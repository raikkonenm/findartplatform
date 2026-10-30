"""Bounded, non-executing extraction of applicant-provided material. No network."""
import hashlib
import io
import json
import re
import stat
import sys
import time
import os
import shutil
import subprocess
import warnings
import zipfile
from pathlib import Path, PurePosixPath
from xml.etree import ElementTree
from html.parser import HTMLParser
from PIL import Image
from pypdf import PdfReader

try:
    import resource
    resource.setrlimit(resource.RLIMIT_AS, (1_500_000_000, 1_500_000_000))
    resource.setrlimit(resource.RLIMIT_CPU, (35, 35))
except ImportError:
    pass
Image.MAX_IMAGE_PIXELS = 40_000_000
warnings.simplefilter('error', Image.DecompressionBombWarning)
MAX_FILE, MAX_TOTAL, MAX_FILES, MAX_TEXT = 49_000_000, 250_000_000, 200, 200_000
root = Path(sys.argv[1]).resolve()
manifest = json.loads((root / 'incoming.json').read_text(encoding='utf-8'))
images, documents, notices, seen = [], [], [], set()
total = count = text_total = 0
deadline = time.monotonic() + 35

def ocr_image(data, source):
    command = shutil.which('tesseract')
    if not command:
        note('SCANNED_DOCUMENT_OCR_UNAVAILABLE', source); return ''
    remaining = deadline - time.monotonic()
    if remaining < 2:
        note('DOCUMENT_EXTRACTION_TIME_LIMIT', source); return ''
    target = root / 'ocr-input.png'
    try:
        with Image.open(io.BytesIO(data)) as image:
            image.convert('RGB').save(target, 'PNG')
        result = subprocess.run([command, str(target), 'stdout', '-l', os.environ.get('SUBMISSIONS_OCR_LANGUAGES', 'eng')], capture_output=True, timeout=min(10, remaining), check=True)
        return result.stdout[:200000].decode('utf-8', errors='replace')
    except Exception:
        note('SCANNED_DOCUMENT_OCR_FAILED', source); return ''
    finally:
        target.unlink(missing_ok=True)

class TextOnly(HTMLParser):
    def __init__(self):
        super().__init__(); self.text = []; self.skip = 0
    def handle_starttag(self, tag, attrs):
        if tag in ('script','style'): self.skip += 1
    def handle_endtag(self, tag):
        if tag in ('script','style'): self.skip = max(0, self.skip - 1)
        if tag in ('p','div','br','li'): self.text.append('\n')
    def handle_data(self, data):
        if not self.skip: self.text.append(data)

def note(code, source):
    notices.append({'code': code, 'source': source})

def add_text(text, source):
    global text_total
    remaining = MAX_TEXT - text_total
    if remaining <= 0:
        note('DOCUMENT_TEXT_LIMIT_REACHED', source); return
    if len(text) > remaining:
        text = text[:remaining]; note('DOCUMENT_TEXT_TRUNCATED', source)
    if text.strip():
        documents.append({'id': f'document-{len(documents)+1}', 'source': source, 'text': text})
        text_total += len(text)

def safe_entries(archive):
    entries = archive.infolist()
    if len(entries) > MAX_FILES: raise ValueError('ARCHIVE_ENTRY_LIMIT')
    expanded = 0
    for entry in entries:
        name = entry.filename
        parts = PurePosixPath(name)
        if '\\' in name or parts.is_absolute() or '..' in parts.parts or re.match(r'^[A-Za-z]:', name): raise ValueError('ARCHIVE_UNSAFE_PATH')
        if stat.S_ISLNK(entry.external_attr >> 16) or entry.flag_bits & 1: raise ValueError('ARCHIVE_LINK_OR_ENCRYPTED')
        if entry.file_size > MAX_FILE or entry.file_size / max(1, entry.compress_size) > 200: raise ValueError('ARCHIVE_EXPANSION_LIMIT')
        expanded += entry.file_size
        if expanded > MAX_TOTAL: raise ValueError('ARCHIVE_EXPANSION_LIMIT')
    return [entry for entry in entries if not entry.is_dir()]

def read_entry(archive, entry):
    chunks = []; size = 0
    with archive.open(entry) as stream:
        while chunk := stream.read(65536):
            size += len(chunk)
            if size > MAX_FILE: raise ValueError('ARCHIVE_FILE_LIMIT')
            chunks.append(chunk)
    return b''.join(chunks)

def consume(data, filename, source, depth=0, inline=False):
    global total, count
    count += 1; total += len(data)
    if time.monotonic() >= deadline: note('DOCUMENT_EXTRACTION_TIME_LIMIT', source); return
    if count > MAX_FILES or total > MAX_TOTAL or len(data) > MAX_FILE: raise ValueError('MATERIAL_SIZE_LIMIT')
    suffix = Path(filename).suffix.lower()
    if suffix == '.docx':
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            entries = safe_entries(archive)
            xml = read_entry(archive, archive.getinfo('word/document.xml'))
            if b'<!DOCTYPE' in xml.upper() or b'<!ENTITY' in xml.upper(): raise ValueError('DOCUMENT_XML_ENTITY_BLOCKED')
            tree = ElementTree.fromstring(xml)
            add_text('\n'.join(''.join(p.itertext()) for p in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p')), source)
            for entry in entries:
                if entry.filename.startswith('word/media/'):
                    consume(read_entry(archive, entry), Path(entry.filename).name, source, depth + 1)
        return
    if data.startswith(b'PK\x03\x04') and suffix == '.zip':
        if depth >= 2: note('NESTED_ARCHIVE_LIMIT', source); return
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            for entry in safe_entries(archive):
                if not entry.filename.startswith('__MACOSX/') and not Path(entry.filename).name.startswith('.'):
                    consume(read_entry(archive, entry), Path(entry.filename).name, source + ' / ' + entry.filename, depth + 1)
        return
    if data.startswith(b'%PDF-'):
        pdf = PdfReader(io.BytesIO(data), strict=True)
        if pdf.is_encrypted: note('PDF_ENCRYPTED', source); return
        if len(pdf.pages) > 80: note('PDF_PAGE_LIMIT_REACHED', source)
        for index, page in enumerate(pdf.pages[:80]):
            if time.monotonic() >= deadline: note('DOCUMENT_EXTRACTION_TIME_LIMIT', source); break
            page_source = f'{source}, page {index+1}'
            text = page.extract_text() or ''
            add_text(text, page_source)
            for image_name in page.images.keys():
                try:
                    image = page.images[image_name]
                    if len(text.strip()) < 30:
                        scanned_text = ocr_image(image.data, page_source)
                        if len(scanned_text.split()) >= 20:
                            add_text(scanned_text, page_source + ' (OCR; review accuracy)'); continue
                        note('PDF_IMAGE_OR_SCAN_REQUIRES_REVIEW', page_source)
                    consume(image.data, image.name, page_source, depth + 1)
                except Exception:
                    note('PDF_IMAGE_EXTRACTION_FAILED', page_source)
        return
    if suffix in ('.txt','.md','.html','.htm'):
        text = data.decode('utf-8-sig', errors='replace')
        if suffix in ('.html','.htm'):
            parser = TextOnly(); parser.feed(text); text = ' '.join(parser.text)
        add_text(text, source); return
    try:
        if re.search(r'(?:^|[\W_])(cv|resume|statement|press.?release)(?:[\W_]|$)', filename, re.I):
            scanned_text = ocr_image(data, source)
            if len(scanned_text.split()) >= 20:
                add_text(scanned_text, source + ' (OCR; review accuracy)'); return
        with Image.open(io.BytesIO(data)) as image:
            if image.format not in ('JPEG','PNG','WEBP','TIFF','AVIF') or getattr(image, 'n_frames', 1) != 1:
                note('UNSUPPORTED_IMAGE_FORMAT', source); return
            width, height = image.size
            if width * height > 40_000_000: raise ValueError('IMAGE_PIXEL_LIMIT')
            technical = re.search(r'(?:^|[\W_])(logo|icon|favicon|signature|spacer|tracking|thumbnail)(?:[\W_]|$)', filename, re.I)
            if technical or (inline and min(width,height) < 500) or min(width,height) < 250 or width * height < 240_000 or max(width,height) / min(width,height) > 8:
                note('TECHNICAL_OR_SMALL_IMAGE_SKIPPED', source); return
            image.verify()
        digest = hashlib.sha256(data).hexdigest()
        if digest in seen: note('DUPLICATE_IMAGE_SKIPPED', source); return
        seen.add(digest)
        safe_name = re.sub(r'[\x00-\x1f<>:"/\\|?*]', '_', Path(filename).name)[:180] or 'image.bin'
        target = root / 'extracted' / f'{len(images)+1:03d}' / safe_name
        target.parent.mkdir(parents=True, exist_ok=True); target.write_bytes(data)
        images.append({'path': str(target), 'filename': safe_name, 'source': source, 'width': width, 'height': height, 'sha256': digest})
    except (Image.UnidentifiedImageError, OSError):
        note('UNSUPPORTED_OR_UNREADABLE_MATERIAL', source)

for material in manifest:
    try:
        source_path = Path(material['path']).resolve()
        if not source_path.is_relative_to(root): raise ValueError('MATERIAL_PATH_ESCAPE')
        consume(source_path.read_bytes(), material['filename'], material.get('source', material['filename']), inline=material.get('inline', False))
    except Exception as error:
        # Private report only. Never print applicant filenames/content to logs.
        code = str(error) if re.fullmatch(r'[A-Z_]+', str(error)) else 'MATERIAL_EXTRACTION_FAILED'
        note(code, material.get('source', 'provided material'))
(root / 'extracted.json').write_text(json.dumps({'images': images, 'documents': documents, 'warnings': notices}, ensure_ascii=False), encoding='utf-8')
