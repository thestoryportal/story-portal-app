# Story Portal Editing Rules

## Always
- Prefer minimal changes that satisfy the prompt.
- Keep existing UI and styles unless explicitly asked to change them.
- If you need a new dependency, add it with pnpm and note why.
- After changes, state exactly what to test in the browser.

## Never
- Do not refactor unrelated files.
- Do not rename or delete files unless requested.
- Do not introduce new frameworks or large libraries without asking.

## Hot reload safety
- If the change breaks the dev server, revert and propose a safer patch.
