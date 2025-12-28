---
title: Release v2.6.14 - Telemetry & Structure Fixes
date: 2025-12-29
author: Roby Ajo
---

# Release v2.6.14

We have released **Lapeh v2.6.14** focusing on user experience improvements and system monitoring.

## 🛠 Fixes

### 1. Cleaner Project Structure
We heard your feedback! Now when you create a new project using `lapeh create` or `npx lapeh create`, the documentation folder (`doc/`) **will no longer be included** in your project. This makes your initial project cleaner and lighter.

### 2. Realtime Admin Dashboard
The admin dashboard is now connected directly to the MongoDB database in realtime. You can see CLI usage statistics, Node.js versions, and user operating systems accurately.

### 3. CLI Telemetry
We fixed the telemetry sending logic in the CLI. Now the CLI version you are using will be recorded correctly in the system, helping us understand user version distribution.

## How to Update

To get these latest features, please update your Lapeh CLI globally:

```bash
npm install -g lapeh@latest
```

Or use npx directly:

```bash
npx lapeh create project-name
```
