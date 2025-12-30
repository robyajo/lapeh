---
title: "Release v3.0.8: Smart Blog Automation"
date: 2025-12-31
author: Lapeh Team
description: "The release.js script now intelligently reads content from CHANGELOG.md to automatically generate detailed and informative release blog posts."
tag: "Release"
---

# Release v3.0.8: Smart Blog Automation

We are proud to announce the release of **Lapeh Framework v3.0.8**! This update brings significant changes to how we (and you as a contributor) manage releases and communicate changes.

## What's New?

A classic problem in software development is release documentation that often lags behind or is too generic ("Routine maintenance"). In v3.0.8, we solve this with our **Smart Blog Automation System**.

### 1. 🤖 Smart Blog Generation (CHANGELOG Integration)

The internal release script (`release.js`) has now been upgraded with new intelligence.

- **Previously**: If you chose "Yes" to create a blog, the script would only create an empty template or generic content that had to be manually edited.
- **Now**: The script automatically reads `doc/id/CHANGELOG.md` and `doc/en/CHANGELOG.md`. It extracts the entry for the latest version and injects it directly into the blog post.
- **Result**: Blog posts that are _instant_, _detailed_, and _accurate_ according to the technical notes in the Changelog, with zero additional manual work.

### 2. 🌍 Full Bilingual Support

Lapeh is committed to being a world-class framework that remains friendly for Indonesian developers.

- This automation supports content generation in **Indonesian** and **English** simultaneously.
- The script searches for relevant content in each language file and creates two separate blog files (`website/blog/release-vX.X.X.md` and `website/en/blog/release-vX.X.X.md`).

### 3. 🛠️ Release Script Technical Improvements

Beyond the blog features, we've also strengthened the release script's resilience:

- **Better Regex**: Improved logic for detecting versions (`vX.X.X`) within varied markdown headers.
- **Error Handling**: If a changelog entry is not found, the script provides clear feedback instead of crashing or creating empty files.

## Why This Matters

This feature isn't just for the Lapeh core team. It's part of our philosophy to **Reduce Friction**.

By automating administrative tasks like writing release logs, we (and you) can focus more on what matters most: **Writing Great Code**.

## How to Update

Get the latest version of Lapeh to enjoy a more stable and well-managed framework:

```bash
npm install lapeh@latest
```

Thank you for being part of the Lapeh Framework journey! 🚀
