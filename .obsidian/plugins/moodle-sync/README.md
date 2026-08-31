# Moodle Sync (Obsidian plugin)

Downloads files from your HND Moodle course into your vault, sorted into
your existing module folders. Built specifically for the HND_Cyber vault
layout at West Lothian College.

## How it maps to your Moodle

West Lothian's HND Moodle is set up as **one course** ("HND CYBER SECURITY
2026-27") with each module (Server Administration, Intrusion Prevention
Systems, Wireless Device Security, etc.) as a **section** within it. This
plugin maps at the section level: each Moodle section → one of your vault's
module folders.

## What it does

- Logs into West Lothian's Moodle using the same `moodle_mobile_app` web
  service the official Moodle mobile app uses.
- Detects your HND course automatically and lists its sections.
- Downloads two kinds of content per mapped section:
  - **Resource files** — PDFs, PPTs, DOCs sitting directly on the course
    page.
  - **Assignment attachments** — files a lecturer has uploaded onto a
    submission activity itself (e.g. the tutorial document attached to a
    "Tutorial 01 - OS Research" assignment with a submission button), which
    Moodle treats as a different content type from plain resources. Some
    lecturers upload tutorials this way instead of as a plain file, and both
    are now pulled.
- Files land in: `<vault>/<modules root>/<module code>/inbox/`
- Everything lands flat in that one `inbox` folder per module — no
  automatic sorting into Presentations/Tutorials/etc. Deliberately simple:
  you sort them yourself, so nothing gets miscategorised.
- Skips files that haven't changed, so re-running sync is fast.
- Runs only when you trigger it — nothing happens automatically in the
  background.
- What's still intentionally left alone: the assignment *submission point*
  itself (you still submit your work on Moodle directly), and quizzes.

**Note on assignment attachments:** if fetching them fails for any reason
(a permissions quirk, a Moodle hiccup), the sync doesn't abort — you'll see
a notice, but your normal resource files still download. Worth noticing if
a specific module's assignment-attached tutorial never seems to show up:
check the console (Ctrl/Cmd+Shift+I) for the actual error rather than
assuming it's silently working.

## Install (manual — this isn't in the Community Plugins directory)

1. In your vault, go to `.obsidian/plugins/` and create a folder called
   `moodle-sync`.
2. Copy these three files into that folder:
   - `main.js`
   - `manifest.json`
   - `styles.css` (optional — currently empty, safe to skip)
3. Restart Obsidian, or reload plugins (Ctrl/Cmd+P → "Reload app without
   saving").
4. Go to Settings → Community plugins → enable "Moodle Sync".

## Running a sync

Three ways to trigger a sync, all equivalent:

- **Ribbon icon**: a refresh icon in the left sidebar — one click, no
  typing.
- **Command palette**: Ctrl/Cmd+P → "Sync Moodle files into vault".
- **Your own hotkey**: Settings → Hotkeys → search "Sync Moodle files into
  vault" → assign any key combo you like. Obsidian handles this natively;
  no plugin setting needed.

None of these run automatically in the background or on startup — sync
only happens when you trigger it. Re-running sync when nothing's changed
is safe and fast (it reports "0 downloaded" and does no work beyond
checking).

## Setup

1. Open Settings → Moodle Sync.
2. Enter your Moodle site URL (e.g. `https://moodle.westlothian.ac.uk` —
   check the exact address if unsure; your existing Moodle downloader
   already knows it).
3. Choose an authentication method:
   - **Token (recommended)**: enter your username and password once, click
     "Generate" — this logs in, retrieves a token, saves the token, and
     immediately discards the password from memory and from disk. Future
     syncs use the token, not your password.
   - **Username & password**: stored directly, exactly as entered. Simpler,
     but see the security note below.
4. Set "Modules root folder" to match your vault — likely `01-Modules` if
   you've adopted that structure.
5. Click "Fetch sections" — this logs in, finds your HND course, and lists
   every section that currently has files in it.
6. For each section, use "Add a section mapping" to link it to the matching
   module folder code (e.g. H17M34 for Intrusion Prevention Systems).
7. Run the sync: Command palette (Ctrl/Cmd+P) → "Sync Moodle files into
   vault".

## Security note — read this before using

**Token mode (recommended):** your Moodle *token* — not your password — is
stored in plain text in `<vault>/.obsidian/plugins/moodle-sync/data.json`.
If that token ever leaks, you can revoke it without changing your actual
Moodle password.

**Password mode:** your actual Moodle username and password are stored in
plain text in the same file.

Either way, before enabling Obsidian Git or any cloud sync on this vault:

- Add `.obsidian/plugins/moodle-sync/data.json` to your `.gitignore`, or
- Exclude the whole `.obsidian/plugins/moodle-sync/` folder from whatever
  sync tool you use.

A further hardening step (planned, not yet built) is pulling credentials
from Doppler at sync time instead of storing anything in this file at all.

## Known limitations

- Desktop only (uses Node file APIs not available on mobile Obsidian).
- Assumes a single enrolled course. If more than one is found, it uses the
  first and shows a notice — re-run "Fetch sections" after switching if
  that's ever wrong.
- Matches files by filename + Moodle's last-modified timestamp — a
  same-name re-upload with an equal-or-older timestamp won't be picked up
  as changed.
- No sorting by content type (Presentation/Tutorial/etc.) — by design,
  everything lands in one inbox folder per module for you to sort manually.
- If you had a version of this plugin installed before the course→section
  rework, old module mappings are cleared automatically on first load
  after updating — you'll see a notice reminding you to re-run "Fetch
  sections" and re-add mappings once.
