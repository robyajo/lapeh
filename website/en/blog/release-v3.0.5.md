---
title: "Release v3.0.5: Blog System & Release Script Fixes"
date: 2025-12-30
author: Lapeh Team
description: "Critical fix for release.js script to handle special characters in YAML frontmatter."
---

# Release v3.0.5: Blog System & Release Script Fixes

This release is a hotfix to address issues in our blog automation system.

## What's New?

We discovered a bug where special characters (like quotes) in Git commit messages could break the YAML frontmatter format in auto-generated blog files, causing build failures on the documentation website.

### 🛠️ Bug Fixes

- **Fix YAML Escaping**: Updated `release.js` to correctly escape `title` and `description` in blog frontmatter.
- **Release Script Update**: Improved release script resilience against various commit message formats.

## How to Update

```bash
npm install lapeh@latest
```

Thank you for using Lapeh Framework!
