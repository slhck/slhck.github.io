# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Jekyll-based personal website (slhck.info) built with the Minima theme, featuring blog posts about video quality, software engineering, and multimedia topics. The site includes custom styling with dark mode support and is hosted on GitHub Pages.

## Development Commands

### Local Development
```bash
# Install dependencies
bundle install

# Serve the site locally with live reload
bundle exec jekyll serve

# Serve with live reload (using hawkins plugin)
bundle exec jekyll serve --livereload

# Build the site (output to _site/)
bundle exec jekyll build
```

### Content Management
```bash
# Create a new blog post
# Posts go in _posts/ with format: YYYY-MM-DD-title.md
touch _posts/$(date +%Y-%m-%d)-new-post-title.md
```

## Architecture and Structure

### Content Organization
- **Blog posts**: Located in `_posts/` with YAML frontmatter containing layout, title, date, and categories
- **Static pages**: Root-level `.md` files (about.md, contact.md, software.md, publications.md, etc.)
- **Posts frontmatter support**:
  - `updates`: Array of update notes displayed at the bottom of posts
  - `notes`: Single note displayed at the bottom of posts
  - `redirect_from`: Legacy URLs that redirect to the current post

### Custom Theme Implementation

The site extends the Minima theme with extensive custom styling:

- **Main stylesheet**: `assets/main.scss` imports Minima base and adds custom CSS
- **Dark mode system**:
  - Theme toggle in `assets/js/theme-toggle.js` manages light/dark/system preferences
  - Uses CSS custom properties (CSS variables) defined in `assets/main.scss`
  - Supports both explicit theme selection and system preference detection
  - Theme state stored in localStorage with key `preferred-theme`
- **Custom layouts**: `_layouts/` contains overridden versions of default, post, and page layouts
- **Custom includes**: `_includes/header.html` implements the navigation and theme toggle UI

### Styling System

The site uses a modern CSS architecture:
- CSS custom properties for theming (defined in `:root` and `[data-theme="dark"]`)
- Color system with primary, accent, surface, border, and text colors
- Spacing and border-radius variables for consistency
- Content cards with hover effects and shadows
- Responsive design with mobile breakpoints at 768px
- Font loading: Self-hosted Lato (sans-serif) and Andada Pro (serif) fonts

### Key Files
- `_config.yml`: Site configuration (title, email, theme settings, plugins)
- `Gemfile`: Ruby dependencies (github-pages, jekyll-feed, hawkins, kramdown-parser-gfm)
- `assets/main.scss`: Main stylesheet with CSS variables and theme system
- `assets/js/theme-toggle.js`: Dark mode toggle functionality
- `_layouts/post.html`: Post template that handles updates and notes sections

## Development Practices

### Blog Post Format
Posts use Jekyll frontmatter with:
```yaml
---
layout: post
title: "Post Title"
date: YYYY-MM-DD
categories: category-name
redirect_from: [optional legacy URLs]
updates: [optional array of update strings]
notes: optional single note string
---
```

### Theme Customization
When modifying styles:
- Use CSS custom properties (e.g., `var(--color-primary)`) for colors
- Define both light and dark mode values
- Include `@media (prefers-color-scheme: dark)` fallback for system preference
- Test both explicit theme selection and system preference detection

### Content Guidelines
Based on existing posts:
- Posts cover technical topics (video encoding, Docker, Python tooling, Elasticsearch, git)
- Code examples use fenced code blocks with language specifiers
- Images stored in `assets/images/`
- External links and references are common
