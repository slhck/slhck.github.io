#!/usr/bin/env python3
"""
Migrate Tumblr photo backup to Jekyll collection.
Parses HTML files, extracts metadata, converts images to AVIF.
"""

import os
import re
import json
import subprocess
from pathlib import Path
from datetime import datetime
from html.parser import HTMLParser
from urllib.request import urlretrieve
import tempfile

# Paths
BACKUP_DIR = Path.home() / "Downloads/b5b8028335504c845a38226699a7de76498319e5a2c610f1d4ca20a3003c0983"
HTML_DIR = BACKUP_DIR / "extracted_posts/html"
MEDIA_DIR = BACKUP_DIR / "media"
OUTPUT_DIR = Path("/Users/werner/Documents/Projects/slhck/slhck.github.io")
PHOTOS_DIR = OUTPUT_DIR / "_photos"
IMAGES_DIR = OUTPUT_DIR / "assets/images/photos"


class TumblrPostParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.data = {
            "images": [],
            "caption": "",
            "timestamp": "",
            "tags": [],
        }
        self._in_caption = False
        self._in_timestamp = False
        self._in_tag = False
        self._caption_parts = []

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == "img":
            src = attrs_dict.get("src", "")
            if src:
                self.data["images"].append(src)
        elif tag == "div":
            cls = attrs_dict.get("class", "")
            if "caption" in cls:
                self._in_caption = True
        elif tag == "span":
            cls = attrs_dict.get("class", "")
            id_ = attrs_dict.get("id", "")
            if id_ == "timestamp":
                self._in_timestamp = True
            elif cls == "tag":
                self._in_tag = True

    def handle_endtag(self, tag):
        if tag == "div" and self._in_caption:
            self._in_caption = False
            self.data["caption"] = " ".join(self._caption_parts).strip()
        elif tag == "span":
            self._in_timestamp = False
            self._in_tag = False

    def handle_data(self, data):
        data = data.strip()
        if not data:
            return
        if self._in_caption:
            self._caption_parts.append(data)
        elif self._in_timestamp:
            self.data["timestamp"] = data
        elif self._in_tag:
            self.data["tags"].append(data)


def parse_timestamp(ts_str):
    """Parse Tumblr timestamp like 'November 6th, 2014 7:44pm'"""
    # Remove ordinal suffixes
    ts_clean = re.sub(r'(\d+)(st|nd|rd|th)', r'\1', ts_str.strip())
    try:
        return datetime.strptime(ts_clean, "%B %d, %Y %I:%M%p")
    except ValueError:
        try:
            return datetime.strptime(ts_clean, "%B %d, %Y %I:%M %p")
        except ValueError:
            return None


def parse_caption(caption):
    """Extract title and location from caption."""
    # Common patterns: "Title." or "Title" followed by location in italics
    # The HTML gives us text like: "Duotone. Berlin, 2014"
    parts = caption.split()

    # Try to find location pattern (City, Year or City, Country)
    location = ""
    title = caption

    # Look for italic location pattern (was in <em> or <i> tags)
    # Often the format is "Title. Location, Year" or just "Title."
    if caption:
        # Split by common separators
        lines = [l.strip() for l in caption.replace('\n', ' ').split('.') if l.strip()]
        if len(lines) >= 1:
            title = lines[0].strip()
            if len(lines) >= 2:
                location = '. '.join(lines[1:]).strip()

    return title, location


def slugify(text):
    """Create URL-friendly slug from text."""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')[:50]


def convert_to_avif(input_path, output_path, quality=70):
    """Convert image to AVIF using ImageMagick."""
    cmd = [
        "magick",
        str(input_path),
        "-quality", str(quality),
        str(output_path)
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  Error converting {input_path}: {result.stderr}")
        return False
    return True


def download_image(url, dest_path):
    """Download image from URL."""
    try:
        urlretrieve(url, dest_path)
        return True
    except Exception as e:
        print(f"  Error downloading {url}: {e}")
        return False


def process_post(html_path):
    """Process a single Tumblr post HTML file."""
    post_id = html_path.stem

    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    parser = TumblrPostParser()
    parser.feed(content)
    data = parser.data

    # Parse timestamp
    dt = parse_timestamp(data["timestamp"])
    if not dt:
        print(f"  Warning: Could not parse timestamp '{data['timestamp']}' for {post_id}")
        dt = datetime.now()

    # Parse caption
    title, location = parse_caption(data["caption"])
    if not title:
        title = f"Photo {post_id}"

    # Find/download image
    image_filename = None
    for img_src in data["images"]:
        if img_src.startswith("../../media/"):
            # Local image
            local_name = img_src.split("/")[-1]
            local_path = MEDIA_DIR / local_name
            if local_path.exists():
                image_filename = local_name
                break
        elif "tumblr.com" in img_src:
            # External Tumblr image - need to download
            # Get highest resolution from srcset if available
            ext = ".jpg"
            if ".png" in img_src:
                ext = ".png"
            temp_name = f"{post_id}_0{ext}"
            temp_path = MEDIA_DIR / temp_name
            if not temp_path.exists():
                print(f"  Downloading {img_src[:60]}...")
                if download_image(img_src, temp_path):
                    image_filename = temp_name
                    break
            else:
                image_filename = temp_name
                break

    return {
        "post_id": post_id,
        "date": dt,
        "title": title,
        "location": location,
        "tags": data["tags"],
        "image_filename": image_filename,
        "raw_caption": data["caption"],
    }


def create_jekyll_entry(post_data, avif_filename):
    """Create Jekyll collection entry for a photo."""
    date_str = post_data["date"].strftime("%Y-%m-%d")
    slug = slugify(post_data["title"]) or post_data["post_id"]
    filename = f"{date_str}-{slug}.md"

    # Escape quotes in title
    title_escaped = post_data["title"].replace('"', '\\"')
    location_escaped = post_data["location"].replace('"', '\\"') if post_data["location"] else ""

    frontmatter = f'''---
title: "{title_escaped}"
date: {post_data["date"].strftime("%Y-%m-%d %H:%M:%S")} +0000
image: {avif_filename}
tumblr_id: {post_data["post_id"]}
'''
    if location_escaped:
        frontmatter += f'location: "{location_escaped}"\n'
    if post_data["tags"]:
        frontmatter += f'tags: {json.dumps(post_data["tags"])}\n'
    frontmatter += "---\n"

    return filename, frontmatter


def main():
    print("Migrating Tumblr photos to Jekyll...\n")

    # Ensure directories exist
    PHOTOS_DIR.mkdir(exist_ok=True)
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    # Get all HTML files
    html_files = sorted(HTML_DIR.glob("*.html"))
    print(f"Found {len(html_files)} posts to process\n")

    processed = []
    skipped = []

    for html_path in html_files:
        print(f"Processing {html_path.name}...")
        post_data = process_post(html_path)

        if not post_data["image_filename"]:
            print(f"  Skipping: No image found")
            skipped.append(post_data["post_id"])
            continue

        # Convert image to AVIF
        src_image = MEDIA_DIR / post_data["image_filename"]
        avif_name = Path(post_data["image_filename"]).stem + ".avif"
        dest_image = IMAGES_DIR / avif_name

        if not dest_image.exists():
            print(f"  Converting to AVIF: {avif_name}")
            if not convert_to_avif(src_image, dest_image):
                print(f"  Skipping: Conversion failed")
                skipped.append(post_data["post_id"])
                continue
        else:
            print(f"  AVIF exists: {avif_name}")

        # Create Jekyll entry
        filename, content = create_jekyll_entry(post_data, avif_name)
        entry_path = PHOTOS_DIR / filename

        with open(entry_path, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"  Created: {filename}")
        processed.append(post_data)

    print(f"\n{'='*50}")
    print(f"Migration complete!")
    print(f"  Processed: {len(processed)} photos")
    print(f"  Skipped: {len(skipped)} posts (no image)")
    print(f"\nImages saved to: {IMAGES_DIR}")
    print(f"Jekyll entries saved to: {PHOTOS_DIR}")


if __name__ == "__main__":
    main()
