---
layout: post
title: "Counting the Number of Color Pages in a PDF"
date: 2026-03-12
categories: software
---

I finally got to print my dissertation! But it had a lot of color pages. I wanted the color in there, but I couldn't go for an all-color print; that would have been too expensive. The print shop could not figure out which pages were color, so I needed to tell them in a specific format. Going through a 390-page PDF by hand was not an option.

Luckily — and credit goes to [this TeX StackExchange answer](https://tex.stackexchange.com/questions/53493/detecting-all-pages-which-contain-color) for the original approach — Ghostscript has a device called `inkcov` that reports the CMYK ink coverage for each page. A page that only uses the K (black) channel is black-and-white; anything with nonzero C, M, or Y values contains color.

## Getting Ink Coverage

Run Ghostscript with the `inkcov` device:

```bash
gs -o - -sDEVICE=inkcov thesis.pdf
```

The output looks something like this (with some font-loading messages mixed in):

```
Page 1
 0.00000  0.00000  0.00000  0.41520 CMYK OK
Page 2
 0.01234  0.00567  0.00890  0.38210 CMYK OK
Page 3
 0.00000  0.00000  0.00000  0.55120 CMYK OK
```

Page 1 and 3 have zero cyan, magenta, and yellow coverage, so they're black-and-white. Page 2 has nonzero values in the first three columns, so it contains color.

## Extracting Color Page Numbers

The following pipeline filters out font-loading noise, joins each page number with its ink coverage line, removes pages where C, M, and Y are all zero, and outputs the page numbers:

```bash
gs -o - -sDEVICE=inkcov thesis.pdf \
  | grep -v 'Loading font' \
  | sed '/^Page*/N;s/\n//' \
  | sed -E '/Page [0-9]+ 0.00000  0.00000  0.00000  / d' \
  | grep '^Page' \
  | cut -d ' ' -f 2
```

To get a count of how many pages contain color, just add `wc -l`.

```bash
gs -o - -sDEVICE=inkcov thesis.pdf \
  | grep -v 'Loading font' \
  | sed '/^Page*/N;s/\n//' \
  | sed -E '/Page [0-9]+ 0.00000  0.00000  0.00000  / d' \
  | grep '^Page' \
  | cut -d ' ' -f 2 \
  | wc -l
```

Or to get a comma-separated list of page numbers (useful for my particular print shop):

```bash
gs -o - -sDEVICE=inkcov thesis.pdf \
  | grep -v 'Loading font' \
  | sed '/^Page*/N;s/\n//' \
  | sed -E '/Page [0-9]+ 0.00000  0.00000  0.00000  / d' \
  | grep '^Page' \
  | cut -d ' ' -f 2 \
  | tr '\n' ',' | sed 's/,$/\n/'
```
