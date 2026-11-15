# AerynOS Package Explorer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Svelte](https://img.shields.io/badge/Svelte-5-FF3E00?logo=svelte&logoColor=white)](https://svelte.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![CI / CD](https://img.shields.io/badge/GitHub_Actions-Automated_Index_%26_Deploy-2088FF?logo=github-actions&logoColor=white)](https://github.com/aerynOS/recipes)

> **AerynOS Package Explorer** is a fast, modern web application for searching, discovering, and inspecting packages in the [AerynOS](https://aerynos.com) ecosystem. Powered by client-side fuzzy search, pre-indexed metadata from official recipe trees, and native AerynOS styling.

---

## 📸 Preview

```
┌────────────────────────────────────────────────────────────────────────┐
│  ◈ AERYNOS PACKAGE EXPLORER              [ Search packages (/) ]   ⚙  │
├────────────────────────────────────────────────────────────────────────┤
│  Showing 1,248 packages across 14 categories                           │
│                                                                        │
│  ┌─────────────────────────┐  ┌──────────────────────────────────────┐ │
│  │ curl          v8.11.0-1 │  │ fastfetch                  v2.30.1-1 │ │
│  │ Command line tool and   │  │ An actively maintained, fast, highly │ │
│  │ library for transferring│  │ customizable system information tool │ │
│  │ data with URLs          │  │                                      │ │
│  │ [Networking] [x86_64]   │  │ [Utilities] [x86_64] [CMake]         │ │
│  └─────────────────────────┘  └──────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

- **⚡ Fast Client-Side Search**: Instant fuzzy search across package names, summaries, descriptions, and binaries using [Fuse.js](https://www.fusejs.io/).
- **🔍 Comprehensive Package Inspection**:
  - Detailed metadata (name, version, release number, homepage, license, category).
  - Upstream source archives with SHA256 integrity verification.
  - Build-time dependencies (`builddeps`) and run-time dependencies (`rundeps`).
  - Subpackage breakdowns (`packages:`) with designated file paths and component summaries.
  - Direct links to upstream recipe files (`stone.yaml`) and upstream source repositories.
- **💻 Copy-to-Clipboard moss Commands**: One-click installation command helper using AerynOS's next-generation package manager:
  ```bash
  sudo moss package add <package-name>
  ```
- **🎨 AerynOS Design System**: Dark-mode-first aesthetic matching official AerynOS guidelines (`#0d0f14` dark midnight slate, `#f97316` warm orange accent, structured typography using Inter & JetBrains Mono).
- **📱 Responsive & Accessible**: Optimized for mobile devices, tablets, and desktop displays with keyboard navigation shortcuts (`/` to search, `Esc` to dismiss).
- **🤖 Automated Daily Indexing**: GitHub Actions workflow that synchronizes package manifests directly from the official [`aerynOS/recipes`](https://github.com/aerynOS/recipes) repository.

---

## 📦 How Package Indexing Works

AerynOS builds its packages using `boulder`, a rootless container-based build tool. Every package in the distribution is defined by a `stone.yaml` recipe file located in the official recipes tree:

```
aerynOS/recipes/
└── recipes/
    ├── a/
    │   └── aom/
    │       └── stone.yaml
    ├── c/
    │   └── curl/
    │       ├── stone.yaml
    │       └── monitoring.yaml
    └── ...
```

### The `stone.yaml` Schema

Each recipe defines declarative metadata and build instructions:

```yaml
name: curl
version: "8.11.0"
release: 1
homepage: https://curl.se/
upstreams:
  - https://curl.se/download/curl-8.11.0.tar.xz : 7f830a631165...
summary: Command line tool for transferring data with URLs
description: |
  curl is used in command lines or scripts to transfer data.
license:
  - curl
builddeps:
  - pkgconfig(libpsl)
  - pkgconfig(openssl)
  - pkgconfig(zlib)
packages:
  - curl-docs:
      summary: Documentation for curl
      paths:
        - /usr/share/man
```

### Automated Indexing Pipeline

1. **Tree Traversal**: The indexer queries GitHub's API for the contents of the `recipes/` directory (`a/` through `z/`).
2. **Parser & Normalizer**: Downloads and parses each `stone.yaml` file into structured JSON:
   - Normalizes single-item vs. list licenses.
   - Parses upstream tarball/git URLs and cryptographic checksums.
   - Categorizes packages into functional domains (Development, Networking, Utilities, System, etc.).
   - Extracts subpackages and dependency trees.
3. **Optimized Artifact**: Emits `static/data/packages.json`, consumed at runtime by the Svelte 5 frontend with zero server dependencies.

---

## 🛠️ Architecture Overview

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [Svelte 5](https://svelte.dev) | Next-generation reactive UI using runes (`$state`, `$derived`) |
| **Build Tool** | [Vite 6](https://vitejs.dev) | Lightning-fast HMR and optimized production bundling |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) | Theme-based utility CSS with `@theme` token definitions |
| **Routing** | [svelte-spa-router](https://github.com/ItalyPaleAle/svelte-spa-router) | Hash-based client routing compatible with static hosting |
| **Search Engine**| [Fuse.js](https://www.fusejs.io) | Lightweight client-side fuzzy search across indexed packages |
| **Icons** | [Lucide Svelte](https://lucide.dev) | Crisp, modern UI icons |
| **Automation** | GitHub Actions | Scheduled daily indexing, delta detection, and GitHub Pages deployment |

---

## 🚀 Local Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or newer recommended)
- [pnpm](https://pnpm.io/) (v9 recommended)

```bash
# Verify versions
node -v
pnpm -v
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/aerynos-package-explorer.git
   cd aerynos-package-explorer
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the local development server:
   ```bash
   pnpm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

---

## 🔄 Running the Package Indexer

To update the local package database against the live `aerynOS/recipes` repository:

### Test the Recipe Parser
Verify the YAML parser against canonical test fixtures:
```bash
pnpm run test-parser
```

### Generate a Fresh Package Index
Run the indexing script (optionally providing a `GITHUB_TOKEN` to increase API rate limits):
```bash
# Without token (rate-limited to 60 req/hr):
pnpm run generate-index

# With personal access token:
GITHUB_TOKEN=ghp_yourTokenHere pnpm run generate-index
```
The generated output will be saved directly to `static/data/packages.json`.

---

## 🚢 GitHub Pages Deployment

The repository is configured for zero-maintenance automated deployment using GitHub Actions.

### Deployment Workflow (`.github/workflows/update-index.yml`)
- **Schedule**: Automatically runs daily at **02:00 UTC**.
- **Manual Trigger**: Can be invoked on-demand via the **Actions** tab (`workflow_dispatch`).
- **Push Trigger**: Automatically deploys when changes are pushed to `main`.
- **Change Detection**: Runs `generate-index.ts`, checks if `packages.json` changed, commits updates with `[skip ci]`, and deploys the static build to GitHub Pages.

### Setup Instructions for GitHub Pages
1. Go to your GitHub repository: **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. Trigger the workflow manually under **Actions** > **Update Package Index & Deploy** > **Run workflow**.

---

## ⚠️ Known Limitations

- **GitHub API Rate Limits**: Unauthenticated indexing runs are limited to 60 API requests per hour. For full repository indexing, a `GITHUB_TOKEN` secret must be provided.
- **Binary Packages**: The explorer reflects recipes defined in source git trees. Binary build status and moss binary repository package availability may vary based on architecture build farm status.

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository and create your branch from `main`.
2. Ensure code formatting and type checks pass:
   ```bash
   pnpm run check
   ```
3. Test any parser changes:
   ```bash
   pnpm run test-parser
   ```
4. Submit a clear and detailed Pull Request.

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
AerynOS, moss, and boulder are trademarks or projects of the AerynOS organization.
