# Upgrade Plan: Next.js 16 & shadcn/ui Updates

## Overview

This plan outlines the steps to upgrade the dbdev website from Next.js 15.4.10 to Next.js 16.x and update shadcn/ui components to follow the latest patterns.

---

## Current State

| Component | Current | Target |
|-----------|---------|--------|
| Next.js | 15.4.10 | 16.1.x |
| React | 19.1.0 | 19.x (compatible) |
| shadcn/ui | Installed components | Latest patterns |
| Turbopack | Not default | Default (Next.js 16) |

---

## Phase 1: Next.js 16 Upgrade

### 1.1 Update Core Dependencies

```bash
cd website
npm install next@latest react@latest react-dom@latest
```

### 1.2 Address Breaking Changes

Based on Next.js 16 upgrade guide:

- [ ] **Turbopack is now default** - Remove any `--turbo` flags, now automatic
- [ ] **Middleware renamed to proxy** - Check if any middleware needs updates
- [ ] **React Compiler** - Consider enabling for automatic memoization
- [ ] **Cache Components** - Evaluate `"use cache"` directive for applicable pages

### 1.3 Configuration Updates

Update `next.config.js` if needed:
- Review experimental flags that may now be stable
- Enable React Compiler if desired

### 1.4 Test the Upgrade

```bash
npm run dev
npm run build
npm run lint
```

---

## Phase 2: shadcn/ui Configuration Updates

### 2.1 Update components.json

Current configuration has `"rsc": false`. For App Router, consider enabling RSC:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "styles/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "~/components",
    "utils": "~/lib/utils"
  }
}
```

### 2.2 Update Radix UI Dependencies

Current versions to update:

| Package | Current | Action |
|---------|---------|--------|
| @radix-ui/react-avatar | ^1.1.10 | Check for updates |
| @radix-ui/react-dialog | ^1.1.14 | Check for updates |
| @radix-ui/react-dropdown-menu | ^2.1.15 | Check for updates |
| @radix-ui/react-label | ^2.1.7 | Check for updates |
| @radix-ui/react-separator | ^1.1.7 | Check for updates |
| @radix-ui/react-slot | ^1.2.3 | Check for updates |
| @radix-ui/react-tabs | ^1.1.12 | Check for updates |
| @radix-ui/react-toast | ^1.2.14 | Check for updates |

```bash
npm update @radix-ui/react-avatar @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-tabs @radix-ui/react-toast
```

### 2.3 Update Utility Dependencies

```bash
npm update class-variance-authority clsx tailwind-merge lucide-react
```

---

## Phase 3: Component Pattern Updates

### 3.1 Review Existing Components

Components in `website/components/ui/`:
- [ ] avatar.tsx
- [ ] badge.tsx
- [ ] button.tsx
- [ ] card.tsx
- [ ] dropdown-menu.tsx
- [ ] input.tsx
- [ ] label.tsx
- [ ] separator.tsx
- [ ] tabs.tsx
- [ ] toast.tsx

### 3.2 Consider Adding New Components

shadcn/ui has added new components. Evaluate if any would benefit the project:
- Sonner (modern toast alternative)
- Drawer
- Resizable
- Carousel
- Chart

---

## Phase 4: Testing & Validation

### 4.1 Development Testing

```bash
npm run dev
```

- [ ] Verify all pages load correctly
- [ ] Test component functionality
- [ ] Check dark mode theming
- [ ] Verify form submissions

### 4.2 Build Testing

```bash
npm run build
npm run start
```

- [ ] Ensure production build succeeds
- [ ] No TypeScript errors
- [ ] No ESLint errors

### 4.3 Visual Regression

- [ ] Compare UI before/after upgrade
- [ ] Verify styling consistency

---

## Rollback Plan

If issues arise:

1. Revert `package.json` changes
2. Delete `node_modules` and `package-lock.json`
3. Run `npm install`
4. Verify application works on previous versions

---

## Files to Modify

| File | Changes |
|------|---------|
| `website/package.json` | Update Next.js, React, Radix UI versions |
| `website/components.json` | Enable RSC support |
| `website/next.config.js` | Review for deprecated options |
| `website/components/ui/*` | Update component patterns if needed |

---

## Timeline Considerations

- Phase 1 (Next.js upgrade): Core dependency update
- Phase 2 (shadcn config): Configuration alignment
- Phase 3 (Components): Pattern updates as needed
- Phase 4 (Testing): Validation before merge

---

## References

- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16)
- [Next.js 16.1 Release Notes](https://nextjs.org/blog/next-16-1)
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [shadcn/ui Changelog](https://github.com/shadcn-ui/ui/releases)
