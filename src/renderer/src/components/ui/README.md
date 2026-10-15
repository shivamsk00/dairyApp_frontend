# UI kit (`components/ui`)

React versions of the dreamsCare / Dreams Core UI components. The kit uses this app's own stack:
React 19, Tailwind 3, `lucide-react` icons, `react-modal`, `react-router-dom`.

**Status: not used anywhere yet.** No existing page, layout or component imports this folder.

## Import

```jsx
import { Button, DeleteConfirmModal, KpiCard } from '../../components/ui' // relative, like the rest of the app
// or via the configured alias: import { Button } from '@renderer/components/ui'
```

Icons are passed as components: `icon={Milk}` (from `lucide-react`), not `<Milk />`.

## Contents

| Folder        | Components                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------- |
| `primitives/` | `Button`, `IconButton`, `Badge`, `IconBadge`, `Avatar`, `SurfaceCard`, `Modal`, `Dropdown`, `ActionLink`      |
| `layout/`     | `AppSidebar`, `AppHeader`, `Breadcrumb`, `AppFooter`, `CommandPalette`, `ChatDrawer`, `ScrollToTopButton`     |
| `modals/`     | `ImportModal`, `ExportModal`, `ExportStatusModal`, `DeleteConfirmModal`, `ConfirmActionModal`, `SuccessModal` |
| `dashboard/`  | `PageHero`, `KpiCard`, `SectionCard`, `InsightCard`, `BentoGrid`, `DataTable`                                 |
| `form/`       | `Field`, `Input`, `Select`, `SelectDropdown`, `Textarea`, `FileInput`, `FormSection`, `FormActions`           |
| `hooks/`      | `useDocumentTitle`                                                                                            |

Each file's JSDoc lists its props. Quick examples:

```jsx
<DeleteConfirmModal isOpen={open} onClose={close} onConfirm={remove} message="Customer #42 will be removed." />

<KpiCard label="Milk collected" value="1,240 L" icon={Milk} change={{ value: '8.2%' }}
  className="col-span-12 sm:col-span-6 lg:col-span-3" />

<AppSidebar sections={[{ title: 'Main', items: [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
  { id: 'milk', label: 'Milk Center', icon: Milk, children: [
    { label: 'Milk Collection', onClick: () => window.api?.openSecondWindow?.() },
    { label: 'Milk Dispatch', to: '/milkDispatch' }
  ] }
] }]} />
```

Navigation items take one of three targets:

- `to`: a react-router path.
- `href`: an external link. The main window opens it in the system browser.
- `onClick`: any handler, for example opening an Electron window.

## Where each dreamsCare component went

| dreamsCare                       | Here                                                                |
| -------------------------------- | ------------------------------------------------------------------- |
| `layout/sidebar.html`            | `AppSidebar`. Data-driven; the template's demo menu was not copied. |
| `layout/header.html`             | `AppHeader`. Each block appears only when you pass its props.       |
| `layout/chat-offcanvas.html`     | `ChatDrawer`                                                        |
| `layout/command-palette.html`    | `CommandPalette`. Also handles the Ctrl/⌘+K shortcut.               |
| `layout/breadcrumb.html`         | `Breadcrumb`                                                        |
| `layout/footer.html`             | `AppFooter`                                                         |
| `layout/scroll-to-top.html`      | `ScrollToTopButton`                                                 |
| `modals/*.html`                  | `modals/*`. The success toast became `SuccessModal`.                |
| `dashboards/ecommerce-dashboard` | `dashboard/*` building blocks (the demo data was not copied)        |
| `head/title-meta.html`           | `useDocumentTitle` hook                                             |
| `head/favicons.html`             | Not needed. The Electron window icon comes from `resources/`.       |
| `scripts/vendor-scripts.html`    | Not needed. Libraries are npm imports in React.                     |

Some header pieces were left out because they only held template demo content: the "Explore"
mega-menu, the notification "Mentions" tab and the profile mini-stats. Pass `children` to
`AppHeader` to add your own content.

## Styling rules

- All CSS is in `ui.css`. It is namespaced with `ui-` classes and `--ui-` variables, so it can't
  affect existing screens. It is only bundled once a component from this folder is imported.
- Colors come from tokens. In Tailwind, write them with a type hint, e.g.
  `text-[color:var(--ui-primary-600)]`, or use the helper classes (`ui-text-tertiary`,
  `ui-bg-sunken`, …).
- Component classes in `ui.css` don't set `display`. Components add it as a Tailwind class, so
  responsive utilities like `hidden sm:inline-flex` still win.
- Tailwind scans these files. Avoid bare words that are also Tailwind class names, such as
  `container`, `collapse` or `outline` in code or comments. They generate global CSS rules,
  which is why the bordered button variant is named `secondary`.
- The display font, Plus Jakarta Sans, is not bundled, because the app's CSP blocks Google Fonts.
  Headings fall back to Inter or the system font. To get it, add the font files locally.
- A dark palette exists under `[data-theme='dark']`. The app never sets it today.
- `Modal` registers `#root` as react-modal's app element, the same one `CustomerList` uses.
