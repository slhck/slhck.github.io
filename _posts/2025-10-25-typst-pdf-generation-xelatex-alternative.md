---
layout: post
title: "Typst with Pandoc: A Modern, Fast Alternative to (Xe)LaTeX for PDF Generation"
date: 2025-10-25
categories: software
---

For years, I've been using XeLaTeX to generate professionally formatted PDFs. Either for scientific papers, or from Markdown sources using [Pandoc](https://pandoc.org/) for things like technical documentation or company-internal notes. I like XeLaTeX over “plain” LaTEx in particular for its native support of system fonts. But I've always been frustrated with LaTeX's compilation speed. Even for medium-sized documents, waiting several seconds for each rebuild adds up quickly, especially when iterating on content where visual feedback is important.

Recently, I discovered that Pandoc supports [Typst](https://typst.app/). I'd heard about Typst earlier, but never tried using it (for reasons I'll get into). Typst is a modern typesetting system written in Rust that promises LaTeX-quality output with **dramatically faster compilation times**. After testing it out, I can confirm: **if you're using Pandoc to generate PDFs, you should seriously consider switching to Typst**.

**TL;DR:** Pandoc supports [Typst](https://typst.app/) as a PDF engine. It's orders of magnitude faster than XeLaTeX while producing equivalent quality output, has better error messages, and uses a cleaner template syntax.

## The Problem with XeLaTeX

My typical workflow looked like this:

```bash
pandoc input.md \
  --output=output.pdf \
  --to=latex \
  --from=markdown \
  --template=template.tex \
  --pdf-engine=xelatex
```

This works great, but like I mentioned earlier, the biggest pain point is compilation speed. The combination of Pandoc and XeLaTeX takes several seconds, even for simple documents. Add in references and citations, and the wait time increases significantly because you need to compile twice to get references right. Also, if you've ever come across a LaTeX error, you know how cryptic and difficult they can be to debug. Lastly, a full TeX Live installation is several Gigabytes, which is a heavy dependency… just to generate PDFs?

## Welcome Typst!

[Typst](https://typst.app/) is a modern alternative to LaTeX that provides similar typographic quality while being significantly faster and more user-friendly. You can try it out here:

[**Try Typst in an online editor!**](https://typst.app/play/)

Best of all – and the reason I finally switched over to it – is that Pandoc has native Typst support. Why not just use Typst directly? Well, it's yet another default syntax, and since Markdown is second nature to me, I didn't want to learn another language. So I was initially skeptical to try it out unless I could feed it Markdown sources. But now that is possible with Pandoc!

Installing Typst is straightforward under macOS and Windows:

```bash
# macOS
brew install typst

# Windows
winget install --id=Typst.Typst
```

Linux users will have to decide whether they use:

* A [packaged source](https://repology.org/project/typst/versions) (notably it does not include Debian/Ubuntu)
* A [snap source](https://snapcraft.io/typst)
* `cargo install --locked typst-cli` (requires Rust toolchain, e.g. `apt install cargo` on Debian/Ubuntu)
* Or a standalone binary from the [GitHub release page](https://github.com/typst/typst/releases)

## Using Typst with Pandoc

The beauty of Pandoc's Typst support is how simple the migration is. Instead of generating LaTeX and compiling with XeLaTeX, Pandoc generates Typst code and compiles with Typst:

```bash
# Generate a default template
pandoc --print-default-template=typst > template.typ

# Generate PDF using Typst
pandoc input.md \
  --output=output.pdf \
  --to=typst \
  --from=markdown \
  --template=template.typ \
  --pdf-engine=typst
```

That's it. Just change `--to=latex` to `--to=typst` and `--pdf-engine=xelatex` to `--pdf-engine=typst`, and point to a Typst template (`.typ` instead of `.tex`).

Of course, you are not going to be able to use Typst's advanced features (like custom macros) directly from Markdown, but for standard documents, it works out of the box. You could build those complex features into the templates though, so let's cover that in the next section.

## Template Customization and Migration

In the above case, we've used Pandoc's built-in default Typst template, but you can customize it as needed. You can find Typst templates in [their offical GitHub repo](https://github.com/typst/templates), read their guide on [how to write one](https://typst.app/docs/tutorial/making-a-template/), or [browse their universe](https://typst.app/universe/). Because Pandoc has special variables, it's wise to start with the default template and modify it to your needs.

Note that with Typst, you might need to specify a root directory for file access (e.g., for images or includes that are part of your template):

```bash
pandoc input.md \
  --output=output.pdf \
  --to=typst \
  --from=markdown \
  --template=template.typ \
  --pdf-engine=typst \
  --pdf-engine-opt=--root=/path/to/project
```

If you have existing LaTeX templates, you'll need to manually port them to Typst. I have been using the [Eisvogel template](https://github.com/Wandmalfarbe/pandoc-latex-template) for LaTeX, and have not yet found a good alternative, partly because the Eisvogel template has been around for such a long time. But the good news is that Typst's template syntax is generally cleaner and more intuitive than LaTeX.

Typst templates use a modern scripting language with native functions, conditionals, and variables rather than LaTeX's macro system. To get started with migrating, you can also refer to their [guide for LaTeX users](https://typst.app/docs/guides/for-latex-users/).

I found Claude Code to be very helpful in assisting with the migration of my templates – once you provide it with the syntax and some example templates. It could basically one-shot a port of the Eisvogel template to Typst with minimal guidance. (I will publish this template once I've refined it a bit more.)

## Performance Comparison

I benchmarked both engines using [hyperfine](https://github.com/sharkdp/hyperfine) (yet another awesome tool!). We specify a warmup run to ensure fair timing in case the first run takes longer than usual (e.g., due to caching):

```bash
hyperfine --warmup 1 \
  'pandoc input.md --output output.pdf --pdf-engine typst' \
  'pandoc input.md --output output.pdf --pdf-engine xelatex'
```

The results are mind-blowing:

```
Benchmark 1: pandoc ... --pdf-engine typst
  Time (mean ± σ):     356.5 ms ±   3.8 ms    [User: 261.3 ms, System: 90.2 ms]
  Range (min … max):   348.5 ms … 361.7 ms    10 runs

Benchmark 2: pandoc ... --pdf-engine xelatex
  Time (mean ± σ):      9.653 s ±  0.121 s    [User: 9.146 s, System: 0.551 s]
  Range (min … max):    9.519 s …  9.810 s    10 runs

Summary
  pandoc ... --pdf-engine typst ran
    27.07 ± 0.44 times faster than pandoc ... --pdf-engine xelatex
```

27 times faster! And all using a toy document outputting just four PDF pages without citations. That's the difference between a nearly instantaneous rebuild and a noticeable pause every time you save your Markdown file.

## Limitations

Typst isn't perfect. First, LaTeX has decades of specialized packages. Typst's ecosystem is growing rapidly but still smaller. For very specialized typesetting needs (complex mathematical notation, specialized academic formatting), you might still need LaTeX. And if you're deeply invested in LaTeX, there's a mental model shift. But for new users, Typst is actually easier to learn.

For general technical documentation, reports, and most common PDF generation needs, Typst handles everything beautifully.

## Conclusion

If you're using Pandoc to generate PDFs from Markdown, switching to Typst is a no-brainer for most use cases. The speed improvement alone justifies the switch for me.

I am going to evaluate the use of Typst for more complex documents like scientific papers with heavy math  content. Here, Overleaf is still the go-to solution, especially when working with collaborators.

**Key takeaways:**

- Pandoc has native Typst support since version 3.0
- Typst compiles much faster than XeLaTeX for typical documents
- Smaller footprint (single binary vs. multi-GB TeX distribution)
