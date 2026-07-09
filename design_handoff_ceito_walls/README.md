# Handoff: Ceito Walls (live wallpaper site)

## Overview
Ceito Walls is a live-wallpaper gallery site (à la moewalls-style catalogs): users browse a grid of wallpaper videos/images, filter by category/resolution, open a detail page with a video/image preview + metadata + comments, and can upload their own wallpapers. It also has a lightweight auth system (email/password + a "Continue with Google" button) and an admin mode gate for upload/delete controls.

## About the Design Files
The bundled file (`Ceito Wall.dc.html`) is a **design reference built in HTML** — a working prototype showing intended look, layout, and interaction behavior. It is **not production code to copy directly**. All "backend" behavior in the prototype (accounts, comments, uploads, download counts) is faked client-side with `localStorage`/`IndexedDB` and has no real server, database, or email delivery behind it.

The task is to **recreate this design in the target codebase's real environment** (React/Next.js, Vue, etc. — whichever the project uses, or the best modern choice if starting fresh) wired up to an actual backend. Do not literally embed or iframe the HTML file in production.

## Fidelity
**High-fidelity.** Colors, typography, spacing, and interaction details below are final — recreate pixel-close using the target codebase's component/styling conventions.

## Why this handoff exists — the backend gap
Everything below the "UI" line currently works only as a client-side illusion:
- **Accounts**: register/login stored in `localStorage` (`ceitowall_users`, `ceitowall_current_user`), plaintext passwords, no hashing, no server session.
- **"Continue with Google"**: fake — just logs in a hardcoded demo user object. Real Google Sign-In requires an OAuth client registered in Google Cloud Console, a verified domain, and server-side token verification.
- **Email verification**: fully simulated — a 6-digit code is generated client-side and shown to the user in a toast instead of being emailed. Real implementation needs a backend endpoint + an email provider (Resend/SendGrid/Postmark/SES) to actually send the code, and a server-side check (never trust a client-only code check).
- **Uploads**: stored as Blobs in the browser's IndexedDB (`ceitowall_db` / `uploads` store) — visible only in the uploader's own browser, not shared with other visitors. Real implementation needs object storage (S3/R2/Supabase Storage) + a database table for wallpaper metadata.
- **Comments**: stored in `localStorage` (`ceitowall_comments`), keyed by wallpaper id — per-browser only, not shared.
- **Download limit** (10/day for logged-out users, unlimited logged-in): tracked in `localStorage` (`ceitowall_downloads`), trivially bypassable — should be enforced server-side per account/IP if it matters.
- **Admin mode**: gated by a hardcoded password checked client-side (`ADMIN_CODE` in the JS) — not real access control. Real implementation needs a server-checked role/permission on the authenticated user.
- **AI-assisted upload naming**: on upload, a frame of the image/video is sent to Claude (vision) via the prototype's built-in `window.claude.complete` helper to suggest a title + category. This helper **does not exist outside this design tool** — the equivalent in production is a server route that calls the Anthropic API (or your provider of choice) with the image and returns a suggestion.

## Screens / Views
Single page app with three view states (all in one file, toggled via component state — recreate as real routes/pages):

### 1. Grid view (home) — default
- **Purpose**: browse wallpapers, filter by category/resolution, search, upload.
- **Layout**: full-bleed page, `background:#000`. Fixed-style header (not actually `position:fixed`, just top of flow) `padding:14px 28px`, `border-bottom:1px solid rgba(255,255,255,0.1)`, `background:rgba(0,0,0,0.9)`, `backdrop-filter:blur(4px)`.
  - Header row (flex, `gap:28px`, `align-items:center`): logo+wordmark (left) → nav pills "Categories" and "Resolutions" → spacer → search box (fixed `width:280px`) → auth/profile control (right).
  - Below header: full-width main content, `padding:26px 30px 140px`.
  - Toolbar row: "LATEST VIDEOS" label (`font-size:13px`, `font-weight:600`, `letter-spacing:1.2px`, `color:#a88888`) on the left; on the right, an admin-only "↑ SUBIR WALLPAPER" button + a gear (⚙) button that toggles admin mode.
  - Grid: CSS grid, `grid-template-columns:repeat(3,1fr)`, `gap:22px`. Each card: `background:#0d0d0d`, `border-radius:10px`, `border:1px solid rgba(255,255,255,0.08)`.
  - Pagination: 16 cards/page; page-number pills + "NEXT →" button, centered, only rendered when there is more than one page.

### 2. Detail view (opened by clicking a card's title/category row)
- **Purpose**: view a single wallpaper full-size, read/write metadata, comment, share, download.
- **Layout**: 2-column grid, `grid-template-columns:1fr 340px`, `gap:24px`, `padding:26px 30px 60px`.
  - Left column: "← Back to wallpapers" link, big media preview (`aspect-ratio:16/9`, rounded `10px`, bordered), a quality-selector pill (⚙ 1080p ▾) floated top-right of the preview, "PREVIEW VIDEO" caption bar below it, then a tab strip: **Information** (tags only — description was intentionally removed per user request) / **Share** (social buttons + direct link) / **N Comments** (list + comment box, gated behind login).
  - Right column: title, full-width "DOWNLOAD WALLPAPER" button (white bg, black text), a metadata card (Date / Category / Resolution / File Size rows), and a "RELATED" list of 2 thumbnail+title rows.

### 3. Modals (overlay `position:fixed; inset:0; background:rgba(0,0,0,0.7)`, centered `320px`-wide dark card `#0d0d0d` with `1px solid rgba(255,255,255,0.12)` border, `border-radius:12px`, `padding:26px`)
- **Auth modal**: tabs "Iniciar sesión" / "Registrarse", a "Continuar con Google" button (white, Google multicolor "G" logo, full width), email + password fields (+ username on register), inline error text in `#f06a6a`.
- **Email verification step** (register only): 6-digit code input, explanatory copy that the code is shown in a toast (since no real email is sent in the prototype), "Volver" / "Verificar" buttons.
- **Profile modal**: circular avatar button (transparent `rgba(255,255,255,0.05)` bg, `backdrop-filter:blur(6px)`, dashed border, shows a "+" glyph when no photo, otherwise the photo `object-fit:cover`) that opens a file picker; username field; Cancel/Save buttons.
- **Admin unlock modal**: single password field, Cancel/Entrar buttons.
- **Delete confirm modal**: simple Cancel/Eliminar (red) buttons.
- **Upload → category/title modal**: shown right after picking a file (before it's added to the grid) — shows an "🔎 Detectando…" line while the AI suggestion call is in flight, then title + category/tag inputs (pre-filled from the AI suggestion, editable), Cancel/Agregar buttons.
- **Toast**: bottom-center, `#0d0d0d` pill, auto-dismisses after ~2.6s. Used for the simulated email code, download-limit warnings, admin mode on/off, etc.

## Interactions & Behavior
- **Card click zones split in two**: clicking the thumbnail image toggles an inline, muted preview of that card's video (plays once, no loop, shows a thin progress bar at the bottom of the thumbnail, pauses/resets on end); clicking the title/category row below navigates to the detail view. Only one card's inline preview plays at a time — starting another pauses the rest.
- **Grid card hover**: `transform: translateY(-4px) scale(1.015)`, `box-shadow: 0 12px 36px rgba(255,255,255,0.25)`, border brightens to `rgba(255,255,255,0.5)`; the thumbnail itself also gets `filter:brightness(1.35)` on hover.
- **Categories/Resolutions dropdowns**: rounded pill buttons with a chevron that rotates 180° when open; selecting an entry filters the grid (both filters combine, e.g. Anime + 1920×1080). "Inicio"/"Todas" clears the respective filter. The category list = a fixed preset (Fantasy, Anime, Vehicle, Móvil Wallpaper, Games, Movies, Abstract) plus any distinct categories present in the uploaded data; likewise resolutions = a fixed preset list plus any actual resolutions detected from uploads (so a wallpaper's real resolution is always filterable even if non-standard).
- **Search**: live substring match (case-insensitive) against title + category + tags.
- **"Inicio" (no category filter) ordering**: cards are shown in a stable-but-shuffled order (sorted by a hash of each card's id) rather than upload order, so the home view looks varied.
- **Logo/wordmark click**: returns to the grid view and resets all filters/search/detail selection (acts as a "home" link).
- **Upload flow**: pick file → read real width×height (image `naturalWidth/Height` or video `videoWidth/Height` after `loadedmetadata`) and file size → send a frame to an AI vision call for a suggested title + category → user confirms/edits in a modal → card is added to the top of the grid and persisted.
- **Download**: filename is generated as `{slugified-title}-ceitowalls-com.{ext}` (e.g. `hypnotic-eyes-ceitowalls-com.mp4`), not the original uploaded filename. Logged-out users are capped at 10 downloads/day (tracked by calendar date); logged-in users are unlimited.
- **Quality selector** (144p/360p/480p/720p/1080p/2K/4K) on the detail video: since there's only one real file, selecting a lower "quality" applies a CSS blur to *simulate* a lower-resolution look — it does not actually switch source files. A real implementation should offer actual transcoded renditions.
- **Comments**: only the logged-in user can post; each comment stores `{user, text, date}`. Tab label shows the live count ("N Comments" / "Sé el primero en comentar" empty state).
- **Related section algorithm**: scores every other card by (a) +5 for each shared category/tag, (b) +1 for each shared word (3+ letters) in the title, then shows the top 2 — favor a real "same category, similar tags/title" query server-side.
- **Admin mode**: a gear icon toggles a password prompt (rendered as an in-page modal, not a native `window.prompt`/`alert`/`confirm` — those are unreliable in sandboxed contexts and should be avoided in the recreation too). While active, the upload button and per-card delete (✕) buttons appear; deleting asks for confirmation via the delete-confirm modal, not a native `confirm()`.

## State Management
Rough shape of state needed (recreate as your framework's state/store of choice, backed by real data fetching):
- `currentUser` (id, email, username, photoUrl) — from real auth/session, not localStorage.
- `wallpapers[]` — id, title, category, tags[], mediaUrl, mediaType (image/video), resolution, fileSizeBytes, uploadedAt, uploaderId.
- `activeCategory`, `activeResolution`, `searchQuery`, `page` — grid filter/pagination state.
- `selectedWallpaperId` — drives grid vs detail view.
- `commentsByWallpaper` — fetched per wallpaper, not global localStorage blob.
- `isAdminForThisUser` — derived from the authenticated user's role, not a shared client-side password.
- Upload flow: `pendingUpload` (file + detected metadata + AI suggestion) while the category/title confirmation modal is open.
- Auth flow: `authMode` (login/register), `authStep` (form/verify-email).

## Design Tokens
- **Background**: `#000000` (page), `#0d0d0d` (cards/inputs/modals), `#181818` (input fields inside modals).
- **Borders**: `rgba(255,255,255,0.08–0.15)` depending on emphasis; hover states brighten to `rgba(255,255,255,0.4–0.5)`.
- **Text**: `#f0f0f0`/`#e8dede` primary, `#a0a0a0`/`#808080` secondary/labels, `#c0c0c0`/`#c8c8c8` body copy.
- **Accent (red, used sparingly)**: `oklch(0.55–0.6 0.2–0.22 25)` — category tag chip background, active "Resolutions" toggle color; also cycles hue via a `rgb-accent` CSS class (`@keyframes rgbCycle { hue-rotate 0→360deg }`, 6s linear infinite) on the wordmark "WALLS" and category chips as a decorative touch.
- **Error red**: `#f06a6a` / `#e0453a`.
- **Google button colors**: standard 4-color "G" logo (`#4285F4`, `#34A853`, `#FBBC05`, `#EA4335`) on white.
- **Border radius**: `7–8px` (buttons/inputs), `10px` (cards/media), `12px` (modals), `999px` (pill buttons/avatars — full round).
- **Typography**: `Poppins` (400/500/600/700) for UI text, `JetBrains Mono` (400/500) for the resolution badge overlay on thumbnails. Base UI size ~13.5–14.5px; section labels ~12–13px with `letter-spacing:1–1.2px`.
- **Shadows**: modals `0 12px 32px rgba(0,0,0,0.6)`; card hover `0 12px 36px rgba(255,255,255,0.25)`.

## Assets
- **Logo**: a user-supplied circular "Ceito" emblem image (anime character + Japanese text + "ceito"/"セイト" wordmark), composited via `mix-blend-mode:screen` over the dark header so its black background disappears, leaving just the circular badge visible.
- **Wallpaper thumbnails/media**: user uploads (images or short videos) — in the recreation these should come from real object storage URLs, not blob:/data: URIs.
- No hand-drawn SVG icons beyond simple inline glyphs (▾ ▶ ✕ ⚙ ⏻ ⌕) and the Google "G" logo SVG.

## Files
- `Ceito Wall.dc.html` — the full design reference (template + logic in one file). Search within it for the section comments (`<!-- HEADER -->`, `<!-- DETAIL VIEW -->`, `<!-- AUTH MODAL -->`, etc.) to locate each piece described above.
