---
layout: post
title: "Migrating from Mendeley Desktop to BibDesk"
date: 2026-04-02
categories: software
---

Mendeley Desktop for macOS has been defunct for a while, but I still had my entire paper library in it. I wanted to move to [BibDesk](https://bibdesk.sourceforge.io/), an open-source bibliography manager for macOS that stores everything in plain `.bib` files. The catch: I needed to keep my Mendeley folder structure and link the PDFs properly.

Mendeley can export a `library.bib`, but that export is lossy. Foremost, it does not contain any actual clickable PDF links, so I would have to manually assign hundreds of PDFs. No thanks!

Here's how I got the folder structure and PDF links out of Mendeley and into BibDesk, with a Python migration script and a small Swift helper for generating macOS file bookmarks.

## Finding the Folder Data

Mendeley Desktop stores its main database as an encrypted SQLite file (SQLCipher) under `~/Library/Application Support/Mendeley Desktop/`. I couldn't decrypt it because the key seems to be hidden somwhere in the application itself, or some online on-demand service. But there's also a search index in the same directory tree that is *not* encrypted:

```
~/Library/Application Support/Mendeley Desktop/www.mendeley.com/<uuid>/search-index.sqlite
```

This SQLite database has a `Documents` table with `fieldNames` and `fieldOffsets` columns, plus a `DocumentFullText_content` table with the actual indexed text. The field offsets let you get individual fields from the full-text content:

```python
fields = field_names.split(" ")    # e.g. ["authors", "title", "citationkey", "tags", ...]
offsets = list(map(int, field_offsets.split(" ")))

tags_idx = fields.index("tags")
tags_text = content[offsets[tags_idx]:offsets[tags_idx + 1]]
```

Mendeley stores folders as tags with a "Folder - " prefix, so `Folder - HAS` and `Folder - Subjective Tests` appear in the tag text. I extracted the citation key and folder names for each document and merged that with whatever `mendeley-tags` and `keywords` fields were already in the `.bib` export.

## Cleaning the BibTeX

The exported `.bib` needed several fixes:

- Remove `mendeley-tags` fields (the data should live in BibDesk groups but I couldn't get that to work yet).
- Strip "Folder - ..." entries from `keywords`, keeping only real keywords.
- Remove the Mendeley `file` field entirely (replaced by BibDesk's bookmark format).
- Remove the auto-generated Mendeley header.

With the help of Claude Code I processed the file line by line, having Claude implement the logic to track brace depth to correctly handle multi-line field values and nested LaTeX braces (what a mess!).

## Copying and Linking PDFs

Here's the best part, in my opinion, about this conversion. Mendeley keeps PDFs in `~/Documents/Mendeley Desktop/` with descriptive filenames like `Author et al. - Year - Title.pdf`. That's the only feature I liked about Mendeley — the fact that it did proper renames and kept the folder in sync with the .bib file. I first copied all papers to a `~/Documents/Papers/` folder.

Matching the LaTeX-encoded paths from the `.bib` to actual files on disk required some care. Again, Claude Code to the rescue. macOS uses NFD Unicode normalization in filenames (decomposed form: `u` + combining diaeresis), while the LaTeX-decoded paths produce NFC (precomposed `ü`). Some filenames also had smart quotes where the decoded path had ASCII quotes. What a mess! (I am repeating myself but this is way harder than it should be.)

We (me and Claude) ended up normalizing both sides by stripping combining marks and replacing smart quotes, then comparing:

```python
def _normalize_for_compare(s):
    s = s.replace('\u2018', "'").replace('\u2019', "'")
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return s.lower()
```

This resolved all PDF links.

## Generating BibDesk File Bookmarks

BibDesk has its own way to represent file links in the .bib files. It stores them in a `bdsk-file-1` field containing a base64-encoded binary plist. The plist has two keys:

- `relativePath` (relative to the `.bib` file)
- `bookmark` (a macOS `NSURL` bookmark)

The bookmark is not something you can easily construct in Python — it requires Apple's `bookmarkData(options:)` API.
Claude wrote a small Swift helper (because I don't know Swift all that well) that reads `relativePath\tabsolutePath` lines from standard input and outputs the base64-encoded plist on standard output:

```swift
import Foundation

while let line = readLine() {
    let parts = line.split(separator: "\t", maxSplits: 1).map(String.init)
    let relativePath = parts[0]
    let url = URL(fileURLWithPath: parts[1])

    let bookmarkData = try url.bookmarkData(
        options: [],
        includingResourceValuesForKeys: nil,
        relativeTo: nil
    )

    let dict: [String: Any] = [
        "relativePath": relativePath,
        "bookmark": bookmarkData
    ]

    let plistData = try PropertyListSerialization.data(
        fromPropertyList: dict, format: .binary, options: 0
    )

    print(plistData.base64EncodedString())
}
```

The Python migration script pipes `relativePath\tabsolutePath` lines into this helper and gets back base64 strings to embed in the `.bib`. Getting this format right was the hardest part. Claude didn't know this format, of course, so I had to save a dummy file from BibDesk itself, decode its `bdsk-file-1` field, and then reverse-engineer the binary plist structure.

## The Migration Script

The [migration script and Swift helper](https://gist.github.com/slhck/7efda94c37c590b5f05b8e808560ac20) are on GitHub for your reference. It's a bit rough and tailored to my specific setup, but it should give you a good starting point if you want or need to do something similar.
