# Docs Migration Plan: MkDocs → Fumadocs

## Recommendation: Fumadocs

**Fumadocs** is the better choice for this project. Here's why:

### Why Fumadocs over Nextra

| Factor | Fumadocs | Nextra |
|--------|----------|--------|
| **Integration model** | Library that composes into a route segment — does not take over routing or build | Opinionated framework — more self-contained, harder to deeply integrate |
| **App Router** | Built for App Router from day one | Added App Router in v4 (dropped Pages Router) |
| **Tailwind CSS** | Native Tailwind support (matches our stack) | Moved to Tailwind CSS 4 (we're on 3.x) |
| **Headless mode** | Yes — `fumadocs-core` without `fumadocs-ui`, can reuse our shadcn/ui components | No headless mode |
| **Search** | Orama (server/static), Algolia, or cloud options | Pagefind (client-side static only) |
| **Customization** | CLI ejection, headless core, full component override | Component props and theme overrides |
| **Content sources** | MDX, Content Collections, CMS via REST API | Local MDX only |

The decisive factors are:
1. **Our site uses Pages Router.** Fumadocs's library approach means we can add an `/app/docs/` route segment alongside our existing `/pages` directory (Next.js supports incremental App Router adoption) without needing to migrate the whole site first.
2. **We already use Tailwind + shadcn/ui.** Fumadocs integrates with both natively.
3. **Our docs are currently hosted separately** on GitHub Pages. Bringing them into the site eliminates the split experience.

---

## Current State

- **Site**: Next.js 16.1.1, Pages Router, Tailwind CSS 3.4.17, shadcn/ui, pnpm
- **Docs**: MkDocs with Material theme, 5 markdown files in `/docs/`, hosted at `supabase.github.io/dbdev`
- **Docs content**: `index.md`, `cli.md`, `publish-extension.md`, `install-a-package.md`, `extension_structure.md`
- **MkDocs-specific syntax to convert**: `!!! warning/note` admonitions, `=== "Tab"` tabbed content blocks

---

## Migration Plan

### Phase 1: Setup Fumadocs in the Website

**1.1 Install dependencies**

```bash
cd website
pnpm add fumadocs-core fumadocs-ui fumadocs-mdx @types/mdx
```

**1.2 Create the App Router entry point for docs**

Next.js supports having both `/pages` and `/app` directories simultaneously. Create:

```
website/
├── pages/          # existing — untouched
├── app/
│   └── docs/
│       ├── layout.tsx        # Fumadocs DocsLayout wrapper
│       └── [[...slug]]/
│           └── page.tsx      # Fumadocs DocsPage, renders MDX
├── content/
│   └── docs/                 # MDX doc files live here
│       ├── index.mdx
│       ├── cli.mdx
│       ├── publish-extension.mdx
│       ├── install-a-package.mdx
│       └── extension-structure.mdx
├── source.ts                 # Fumadocs source configuration
```

**1.3 Configure `source.ts`**

Define the content source using `fumadocs-mdx`:

```ts
import { docs } from '@/.source'
import { loader } from 'fumadocs-core/source'

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
})
```

**1.4 Update `next.config.js`**

Add the `fumadocs-mdx` plugin (wraps the Next.js config to process MDX):

```js
const { createMDX } = require('fumadocs-mdx/next')

const withMDX = createMDX()

module.exports = withMDX(nextConfig)
```

**1.5 Update CSP headers**

Add any domains needed by Fumadocs search UI or assets to the `Content-Security-Policy` header in `next.config.js`.

---

### Phase 2: Convert Documentation Content

**2.1 Convert `.md` → `.mdx` with frontmatter**

Each file needs a frontmatter block for Fumadocs:

```mdx
---
title: Using the CLI
description: Install, upgrade, and use the dbdev CLI
---
```

**2.2 Convert MkDocs admonitions to MDX callouts**

MkDocs syntax:
```md
!!! warning
    Restoring a logical backup...
```

Fumadocs MDX callout (using `<Callout>` component):
```mdx
<Callout type="warn">
  Restoring a logical backup...
</Callout>
```

Mapping: `!!! warning` → `<Callout type="warn">`, `!!! note` → `<Callout type="info">`

**2.3 Convert MkDocs tabbed content to MDX `<Tabs>`**

MkDocs syntax:
```md
=== "macOS"
    ```
    brew install supabase/tap/dbdev
    ```
=== "Linux"
    ...
```

Fumadocs MDX (using `<Tabs>` / `<Tab>` components):
```mdx
<Tabs items={['macOS', 'Linux', 'Windows']}>
  <Tab value="macOS">
    ```bash
    brew install supabase/tap/dbdev
    ```
  </Tab>
  <Tab value="Linux">
    ...
  </Tab>
</Tabs>
```

**2.4 Add `meta.json` for sidebar navigation**

Create `content/docs/meta.json`:
```json
{
  "title": "Documentation",
  "pages": [
    "index",
    "cli",
    "publish-extension",
    "install-a-package",
    "extension-structure"
  ]
}
```

---

### Phase 3: Layout & Theming

**3.1 Create the docs layout (`app/docs/layout.tsx`)**

```tsx
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { source } from '@/source'
import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout tree={source.pageTree}>
      {children}
    </DocsLayout>
  )
}
```

**3.2 Create the docs page (`app/docs/[[...slug]]/page.tsx`)**

```tsx
import { source } from '@/source'
import { DocsPage, DocsBody } from 'fumadocs-ui/page'
import { notFound } from 'next/navigation'

export default async function Page(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()

  const MDX = page.data.body

  return (
    <DocsPage toc={page.data.toc}>
      <DocsBody>
        <MDX />
      </DocsBody>
    </DocsPage>
  )
}

export function generateStaticParams() {
  return source.generateParams()
}
```

**3.3 Match theming to the existing site**

- Fumadocs uses CSS variables for theming. Map our existing Tailwind/shadcn CSS variables to Fumadocs variables so colors, fonts, and dark mode are consistent.
- Import the existing `globals.css` into the app layout, or extend it with Fumadocs's required CSS (`fumadocs-ui/style.css`).
- The docs will share the same dark mode toggle behavior (class-based via Tailwind).

**3.4 Add a shared root layout for `/app`**

Create `app/layout.tsx` that wraps with our existing providers (ThemeContext, etc.) so the docs section shares the site's theme/auth state. Be careful to avoid conflicts with the `/pages/_app.tsx` providers.

---

### Phase 4: Search

**4.1 Enable Orama search (built-in)**

Fumadocs includes Orama search out of the box. Add the API route:

```
app/api/search/route.ts
```

```ts
import { source } from '@/source'
import { createSearchAPI } from 'fumadocs-core/search/server'

export const { GET } = createSearchAPI('advanced', {
  indexes: source.getPages().map((page) => ({
    title: page.data.title,
    structuredData: page.data.structuredData,
    id: page.url,
    url: page.url,
  })),
})
```

This gives us Cmd+K / Ctrl+K search across all docs content with no external services.

---

### Phase 5: Navigation & Cross-linking

**5.1 Add "Docs" link to the main site navigation**

Update the site header/navbar component (in `/website/components/layouts/`) to include a link to `/docs`.

**5.2 Add a link back to the main site from docs**

Configure `DocsLayout` with a nav link back to `database.dev`.

**5.3 Redirect old docs URLs**

If traffic goes to `supabase.github.io/dbdev/`, add a redirect or notice pointing to the new `/docs` path on the main site.

---

### Phase 6: Cleanup

**6.1 Remove MkDocs artifacts**

- Delete `/mkdocs.yaml`
- Delete `/docs/requirements_docs.txt`
- Delete `/docs/*.md` (after content is migrated to `/website/content/docs/`)

**6.2 Update CI/CD**

- Remove any GitHub Actions workflows that build/deploy MkDocs to GitHub Pages
- Ensure the Next.js build includes the `/docs` route in its output

**6.3 Update README**

- Update the documentation link in the repo README from `supabase.github.io/dbdev` to the new `/docs` path

---

## File-by-File Content Migration Reference

| MkDocs file | New MDX file | Key conversions needed |
|---|---|---|
| `docs/index.md` | `content/docs/index.mdx` | 2x `!!! warning` → `<Callout type="warn">`, remove HTML badges (replace with MDX or keep) |
| `docs/cli.md` | `content/docs/cli.mdx` | 6x `=== "Tab"` → `<Tabs>/<Tab>` blocks (install + upgrade sections for macOS/Linux/Windows) |
| `docs/publish-extension.md` | `content/docs/publish-extension.mdx` | No special syntax — straightforward conversion, add frontmatter |
| `docs/install-a-package.md` | `content/docs/install-a-package.mdx` | 1x `!!! note`, 2x `!!! warning` → `<Callout>` components |
| `docs/extension_structure.md` | `content/docs/extension-structure.mdx` | No special syntax — straightforward conversion, add frontmatter |

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Pages Router + App Router coexistence causes conflicts | Next.js officially supports incremental adoption; keep `/app` scoped strictly to `/docs` and `/api/search` |
| Styling conflicts between Fumadocs UI and existing site styles | Use CSS variable mapping; test dark/light mode thoroughly; scope Fumadocs styles under a `.docs` class if needed |
| SEO impact from URL changes | Add 301 redirects from old GitHub Pages URLs; update sitemap |
| Build time increase from MDX processing | Only 5 doc files — negligible impact; Fumadocs supports async mode if docs grow significantly |
