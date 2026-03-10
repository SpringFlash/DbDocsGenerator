# DocsGenerator Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static React SPA that generates GTA 5 RP Detective Bureau interrogation reports as .docx files, with optional Google Docs upload, hosted on GitHub Pages.

**Architecture:** Vite + React + TypeScript SPA. Form collects report data → `docx` library generates .docx in browser → `file-saver` triggers download. Optional Google Drive upload via OAuth2 client-side flow.

**Tech Stack:** Vite, React 19, TypeScript, docx, file-saver, @react-oauth/google, gh-pages

---

## File Structure

```
/home/vadim/Study/DocsGenerator/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── package.json
├── public/
│   └── assets/
│       ├── image1.png          # TOP SECRET stamp
│       ├── image2.png          # decorative divider
│       ├── image3.png          # SEALED stamp
│       └── image4.png          # LSPD Detective Bureau logo
├── src/
│   ├── main.tsx                # React entry point
│   ├── App.tsx                 # Main app component, renders ReportForm
│   ├── types.ts                # ReportData interface
│   ├── components/
│   │   └── ReportForm.tsx      # Form with all fields, dynamic interrogation items
│   ├── docx/
│   │   ├── generateReport.ts   # Builds Document from ReportData, returns Blob
│   │   └── loadAssets.ts       # Fetches 4 PNG files, returns ArrayBuffers
│   └── google/
│       └── uploadToDrive.ts    # OAuth2 login + Drive API upload + convert
└── docs/
    └── superpowers/
        ├── specs/
        │   └── 2026-03-10-docs-generator-design.md
        └── plans/
            └── 2026-03-10-docs-generator.md
```

---

## Chunk 1: Project Scaffold + Form

### Task 1: Initialize Vite + React + TypeScript project

**Files:**
- Create: `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`
- Modify: `package.json`

- [ ] **Step 1: Wipe existing package.json and node_modules (mammoth was temporary)**

```bash
cd /home/vadim/Study/DocsGenerator
rm -rf node_modules package.json package-lock.json
```

- [ ] **Step 2: Scaffold Vite project in-place**

```bash
cd /home/vadim/Study/DocsGenerator
npm create vite@latest . -- --template react-ts
```

Select: overwrite existing files when prompted.

- [ ] **Step 3: Install dependencies**

```bash
cd /home/vadim/Study/DocsGenerator
npm install
npm install docx file-saver
npm install -D @types/file-saver gh-pages
```

- [ ] **Step 4: Move assets to public/**

```bash
mkdir -p /home/vadim/Study/DocsGenerator/public/assets
mv /home/vadim/Study/DocsGenerator/assets/*.png /home/vadim/Study/DocsGenerator/public/assets/
rmdir /home/vadim/Study/DocsGenerator/assets
```

- [ ] **Step 5: Verify dev server starts**

```bash
cd /home/vadim/Study/DocsGenerator
npm run dev
```

Expected: Vite dev server starts on localhost, default React page loads.

- [ ] **Step 6: Clean up default Vite boilerplate**

Remove `src/App.css`, `src/index.css`, `src/assets/`. Strip `App.tsx` to minimal shell. Strip `main.tsx` to just render `<App />`.

- [ ] **Step 7: Init git repo and commit**

```bash
cd /home/vadim/Study/DocsGenerator
git init
echo "node_modules\ndist\n.superpowers" > .gitignore
git add .
git commit -m "init: Vite + React + TypeScript scaffold"
```

---

### Task 2: Define types

**Files:**
- Create: `src/types.ts`

- [ ] **Step 1: Create ReportData interface**

```typescript
// src/types.ts

export interface InterrogationItem {
  text: string;
  timestampFrom: string;
  timestampTo: string;
  youtubeLink: string;
}

export interface EvidenceData {
  evidence: string;
  evidenceViolation: string;
  evidenceServers: string;
  identityPerson: string;
}

export interface ReportData {
  reportNumber: number;
  agentId: string;
  organizationName: string;
  items: InterrogationItem[];
  evidenceData: EvidenceData;
  date: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types.ts
git commit -m "feat: add ReportData types"
```

---

### Task 3: Build the report form

**Files:**
- Create: `src/components/ReportForm.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create ReportForm component**

The form should have:
- Input fields for: reportNumber (number), agentId (text), organizationName (text), date (date)
- A dynamic list of interrogation items with add/remove buttons. Each item has: text (textarea), timestampFrom (text), timestampTo (text), youtubeLink (text)
- 4 fixed evidence fields: evidence, evidenceViolation, evidenceServers, identityPerson (all text inputs)
- A "Generate DOCX" button (disabled for now, will wire in Task 5)
- Use React state (`useState`) to manage form data as `ReportData`
- Initialize with 1 empty interrogation item
- "Add item" button appends a new empty item, "Remove" button removes by index (only show if items > 1)

Style with minimal inline styles or a simple CSS file — nothing fancy, just readable.

- [ ] **Step 2: Wire App.tsx to render ReportForm**

```typescript
// src/App.tsx
import { ReportForm } from "./components/ReportForm";

export default function App() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h1>Interrogation Report Generator</h1>
      <ReportForm />
    </div>
  );
}
```

- [ ] **Step 3: Verify form renders and dynamic items work**

```bash
cd /home/vadim/Study/DocsGenerator
npm run dev
```

Expected: Form renders, can add/remove interrogation items, all fields editable.

- [ ] **Step 4: Commit**

```bash
git add src/components/ReportForm.tsx src/App.tsx
git commit -m "feat: add report form with dynamic interrogation items"
```

---

## Chunk 2: DOCX Generation

### Task 4: Asset loader

**Files:**
- Create: `src/docx/loadAssets.ts`

- [ ] **Step 1: Create loadAssets utility**

```typescript
// src/docx/loadAssets.ts

export interface ReportAssets {
  topSecret: ArrayBuffer;
  divider: ArrayBuffer;
  sealed: ArrayBuffer;
  lspdLogo: ArrayBuffer;
}

export async function loadAssets(): Promise<ReportAssets> {
  const basePath = import.meta.env.BASE_URL + "assets/";

  const [topSecret, divider, sealed, lspdLogo] = await Promise.all([
    fetch(basePath + "image1.png").then((r) => r.arrayBuffer()),
    fetch(basePath + "image2.png").then((r) => r.arrayBuffer()),
    fetch(basePath + "image3.png").then((r) => r.arrayBuffer()),
    fetch(basePath + "image4.png").then((r) => r.arrayBuffer()),
  ]);

  return { topSecret, divider, sealed, lspdLogo };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/docx/loadAssets.ts
git commit -m "feat: add asset loader for docx images"
```

---

### Task 5: DOCX generator

**Files:**
- Create: `src/docx/generateReport.ts`

- [ ] **Step 1: Implement generateReport function**

This is the core function. It builds a `docx.Document` matching the original template structure:

1. TOP SECRET image (centered, ~300px wide)
2. Divider image (centered, ~500px wide)
3. Title: "Interrogation" + "Report №{number}" (bold, centered)
4. Intro paragraph: `Я, агент {agentId}, спешу доложить вышестоящим лицам, об успешно проведенной специальной операции, в ходе которой был проведен допрос одного из членов`
5. Org paragraph: `очень странного цирка "{orgName}", в процессе которого мне удалось узнать следующую информацию:` (bold)
6. For each interrogation item: numbered paragraph with bold text + external hyperlink with timestamp as `[{from}-{to}]`
7. SEALED image (centered)
8. Evidence section: 4 lines with bold labels + hyperlinks `[Video]`/`[photo]`
9. Footer table (1 row, 4 cells): "Date:" | bold date | empty | bold agentId
10. LSPD logo image (centered, ~200px wide)

Use `docx` library: `Document`, `Paragraph`, `TextRun`, `ImageRun`, `ExternalHyperlink`, `Table`, `TableRow`, `TableCell`, `AlignmentType`.

Return: `Promise<Blob>` via `Packer.toBlob(doc)`.

Key details from original:
- All interrogation item text is **bold**
- Timestamps are hyperlinks to YouTube with bold styling
- Evidence labels are bold, link text is bold
- The intro text is NOT bold, but agentId within it IS bold
- Images should be approximately the same proportional size as in the original

- [ ] **Step 2: Commit**

```bash
git add src/docx/generateReport.ts
git commit -m "feat: add docx report generator"
```

---

### Task 6: Wire form to generator + download

**Files:**
- Modify: `src/components/ReportForm.tsx`

- [ ] **Step 1: Add generate + download handler to ReportForm**

On "Generate DOCX" button click:
1. Call `loadAssets()`
2. Call `generateReport(formData, assets)`
3. Call `saveAs(blob, "Report №{number}.docx")` from file-saver

Add loading state to disable button during generation.

- [ ] **Step 2: Test end-to-end**

```bash
cd /home/vadim/Study/DocsGenerator
npm run dev
```

Fill in the form, click generate, verify .docx downloads and opens correctly in Word/LibreOffice. Check:
- All 4 images present
- Title correct
- Intro text correct with agent ID bold
- All interrogation items numbered and bold with clickable timestamp links
- SEALED image between items and evidence
- Evidence section with 4 clickable links
- Footer table with date and agent ID
- LSPD logo at bottom

- [ ] **Step 3: Commit**

```bash
git add src/components/ReportForm.tsx
git commit -m "feat: wire form to docx generation and download"
```

---

## Chunk 3: Google Docs Upload + Deploy

### Task 7: Google Drive upload

**Files:**
- Create: `src/google/uploadToDrive.ts`
- Modify: `src/components/ReportForm.tsx`

- [ ] **Step 1: Implement Google OAuth + Drive upload**

```typescript
// src/google/uploadToDrive.ts

const SCOPES = "https://www.googleapis.com/auth/drive.file";

let tokenClient: google.accounts.oauth2.TokenClient | null = null;

export function initGoogleAuth(clientId: string): void {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: () => {}, // will be overridden per-call
  });
}

export async function uploadToDrive(
  blob: Blob,
  fileName: string
): Promise<string> {
  const accessToken = await getAccessToken();

  const metadata = {
    name: fileName,
    mimeType:
      "application/vnd.google-apps.document", // convert to Google Doc
  };

  const form = new FormData();
  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );
  form.append("file", blob);

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&convert=true",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    }
  );

  const data = await response.json();
  return `https://docs.google.com/document/d/${data.id}/edit`;
}

function getAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error("Google Auth not initialized"));
      return;
    }
    tokenClient.callback = (response) => {
      if (response.error) {
        reject(new Error(response.error));
        return;
      }
      resolve(response.access_token);
    };
    tokenClient.requestAccessToken();
  });
}
```

- [ ] **Step 2: Add Google Identity Services script to index.html**

Add to `index.html` `<head>`:

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

- [ ] **Step 3: Add Google Client ID env variable**

Create `.env` file (gitignored):

```
VITE_GOOGLE_CLIENT_ID=your-client-id-here
```

Add `.env` to `.gitignore`.

- [ ] **Step 4: Add "Upload to Google Docs" button to ReportForm**

After the download button, add a second button "Upload to Google Docs". On click:
1. Generate blob (same as download)
2. Call `initGoogleAuth(import.meta.env.VITE_GOOGLE_CLIENT_ID)`
3. Call `uploadToDrive(blob, fileName)`
4. Display returned Google Docs URL as a clickable link

If `VITE_GOOGLE_CLIENT_ID` is not set, hide the button entirely.

- [ ] **Step 5: Add type declarations for Google Identity Services**

Create `src/google/gsi.d.ts` with type declarations for `google.accounts.oauth2` (or install `@types/google.accounts` if available).

- [ ] **Step 6: Test Google Docs upload**

Requires a Google Cloud Console project with Drive API enabled and OAuth2 client ID for web app. Test with real credentials.

- [ ] **Step 7: Commit**

```bash
git add src/google/ index.html src/components/ReportForm.tsx .gitignore
git commit -m "feat: add Google Docs upload via OAuth2"
```

---

### Task 8: GitHub Pages deployment

**Files:**
- Modify: `vite.config.ts`, `package.json`

- [ ] **Step 1: Configure Vite base path for GitHub Pages**

In `vite.config.ts`, set `base` to the repo name:

```typescript
export default defineConfig({
  plugins: [react()],
  base: "/DocsGenerator/",
});
```

- [ ] **Step 2: Add deploy script to package.json**

```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

- [ ] **Step 3: Create GitHub repo and push**

```bash
cd /home/vadim/Study/DocsGenerator
gh repo create DocsGenerator --public --source=. --push
```

- [ ] **Step 4: Deploy to GitHub Pages**

```bash
cd /home/vadim/Study/DocsGenerator
npm run deploy
```

Expected: Site available at `https://<username>.github.io/DocsGenerator/`

- [ ] **Step 5: Commit deploy config**

```bash
git add vite.config.ts package.json
git commit -m "feat: add GitHub Pages deployment config"
```
