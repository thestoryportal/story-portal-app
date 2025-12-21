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

---

## Development History Dataset

Historical development conversations (ChatGPT and Claude) are stored in:
`./tools/ai/history/datasets/`

### Purpose
This dataset is **reference material for continuity**—not binding doctrine. Use it to:
- Recall what was discussed about specific features
- Understand why certain decisions were made
- Find prior debugging sessions for similar issues
- Surface abandoned approaches (and why they failed)
- Pull ideation threads as creative fuel

### Philosophy
Evaluate past approaches critically. Some may be:
- **Outdated** — requirements or tools have changed
- **Superseded** — replaced by better solutions
- **Unviable** — attempted and proven not to work

When referencing history, note whether the context still applies. Past decisions should inform, not constrain.

### Setup
Before first use, parse the raw dataset:
```bash
node "./tools/ai/history/parse-chats.js"
```
This generates searchable files in `./tools/ai/history/parsed/`.

Re-run after adding new chat exports.

### Available Commands

| Command                        | Purpose                                           |
| ------------------------------ | ------------------------------------------------- |
| `/recall <topic>`              | Search history for discussions about a topic      |
| `/todos`                       | Extract outstanding TODO/action items             |
| `/decisions <topic>`           | Find architectural decisions and design choices   |
| `/deprecated`                  | Surface abandoned approaches and why they failed  |
| `/debug-context <issue>`       | Find prior debugging sessions for similar issues  |
| `/history <feature>`           | Trace the evolution of a feature over time        |
| `/ideate <concept>`            | Pull brainstorming threads as creative fuel       |
| `/browse-history [topic]`      | Browse the conversation index                     |

### Direct Search
```bash
# Text search
node "./tools/ai/history/search-history.js" "authentication flow"

# Topic search
node "./tools/ai/history/search-history.js" --topic react

# Find TODOs
node "./tools/ai/history/search-history.js" --todos

# Find decisions
node "./tools/ai/history/search-history.js" --decisions "state"

# Date-filtered search
node "./tools/ai/history/search-history.js" --after 2024-06-01 "refactor"

# JSON output (for piping)
node "./tools/ai/history/search-history.js" --json "query"
```

### Adding New Conversations
1. Export conversations from ChatGPT/Claude
2. Place JSON files in `./tools/ai/history/datasets/`
3. Run `node "./tools/ai/history/parse-chats.js"` to rebuild the index

---

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
