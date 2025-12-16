# Claude Code Rules for The Story Portal

## Development Standards

### Minimal Diffs

- Make small, targeted edits; avoid full-file rewrites unless necessary.
- Keep changes focused on the task at hand.

### Dependency Management

- Always use `pnpm add <package>` to add dependencies.
- Always use `pnpm remove <package>` to remove dependencies.
- Never manually edit `pnpm-lock.yaml`.

### Code Quality

- Always run `pnpm lint` before committing changes.
- Run `pnpm format` to auto-format code when needed.

### Screenshots & Documentation

- Run `pnpm shots` after UI changes to capture updated screenshots.
- Do NOT manually modify files in `docs/screenshots/` — use `pnpm shots` instead.
- Do NOT manually edit `docs/timeline.jsonl` — it is auto-generated.

### Asset Management

- Run `pnpm assets:catalog` after adding/removing assets.
- Do NOT manually edit `docs/ASSET_CATALOG.md` — it is auto-generated.

## Available Scripts

| Command               | Purpose                                           |
| --------------------- | ------------------------------------------------- |
| `pnpm dev`            | Start development server                          |
| `pnpm build`          | Build for production                              |
| `pnpm lint`           | Run ESLint                                        |
| `pnpm format`         | Format code with Prettier                         |
| `pnpm format:check`   | Check formatting without changes                  |
| `pnpm test`           | Run unit tests                                    |
| `pnpm shots`          | Capture screenshots (requires dev server running) |
| `pnpm assets:catalog` | Generate asset catalog                            |
| `pnpm prompt:server`  | Start prompt inbox server on 127.0.0.1:8787       |
