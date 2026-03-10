# DocsGenerator — Interrogation Report Generator

## Overview

A static SPA (React + Vite + TypeScript) hosted on GitHub Pages that generates GTA 5 RP Detective Bureau interrogation reports as `.docx` files from a form, with optional upload to Google Docs.

## Architecture

```
React (Vite) SPA → GitHub Pages
         │
         ├── Form (dynamic fields)
         │     ├── Report Number
         │     ├── Agent ID
         │     ├── Organization Name
         │     ├── Interrogation Items (dynamic: text + timestamp + YouTube link)
         │     ├── Evidence Links (4 fixed fields)
         │     └── Date
         │
         ├── DOCX Generation (docx library)
         │     ├── Embedded images (4 assets: TOP SECRET, divider, SEALED, LSPD logo)
         │     ├── Formatting matching original template
         │     └── File download (file-saver)
         │
         └── Google Docs Upload (optional)
               ├── Google Identity Services (OAuth2)
               ├── Google Drive API v3 (upload + convert)
               └── Returns link to created Google Doc
```

## Tech Stack

- Vite + React + TypeScript
- `docx` — .docx generation in browser
- `file-saver` — file download
- `@react-oauth/google` + Google Drive API v3 — Google Docs upload
- `gh-pages` — deployment

## Form Fields

| Field | Type | Description |
|-------|------|-------------|
| Report Number | number | Report number |
| Agent ID | text | Agent ID (DB-XXXXXX) |
| Organization Name | text | Organization name |
| Interrogation Items | dynamic list | Each item: confession text + timestamp [from-to] + YouTube link |
| Evidence | text | Video link |
| Evidence of a violation | text | Video link |
| Evidence Servers | text | Video link |
| The identity of the person | text | Photo link |
| Date | date | Report date |

## Document Template Structure

1. "TOP SECRET" header image
2. Decorative divider
3. Title: "Interrogation Report №{number}"
4. Intro paragraph with Agent ID and Organization Name
5. Numbered interrogation items (bold text + YouTube-linked timestamps)
6. "SEALED" image
7. Evidence section (4 fixed items with links)
8. Footer table: Date | Agent ID
9. LSPD Detective Bureau logo

## Assets

- `assets/image1.png` — "TOP SECRET" stamp
- `assets/image2.png` — decorative divider
- `assets/image3.png` — "SEALED" stamp
- `assets/image4.png` — LSPD Detective Bureau logo

## Google Docs Integration

- Uses Google Identity Services for OAuth2 (client-side only)
- Requires Google Cloud Console project with Drive API enabled
- Uploads generated .docx to user's Google Drive with `convert=true`
- Returns direct link to the created Google Doc
