Analyze this Vite + Node.js project and provide a comprehensive tech stack summary.

## IMPORTANT: Save Output to File

After generating the analysis, you MUST save the output:

1. **Create the directory if it doesn't exist:**

   ```bash
   mkdir -p docs/tools/dev
   ```

2. **Save the analysis to a file with today's date:**
   - Filename format: `development-stack-tools-summary-M-D-Y.md`
   - Example: `development-stack-tools-summary-12-25-2024.md`
   - Full path: `docs/tools/dev/development-stack-tools-summary-[DATE].md`

3. **Confirm to the user** that the file was saved and provide the path.

Note: Use dashes instead of slashes in the date (M-D-Y not M/D/Y) since slashes are not valid in filenames.

---

## Files to Examine

Automatically scan and analyze these files (if they exist):

### Package & Dependencies

- `package.json` - Dependencies, scripts, engines
- `package-lock.json` / `yarn.lock` / `pnpm-lock.yaml` - Lock files for exact versions
- `.nvmrc` / `.node-version` - Node version requirements

### Vite Configuration

- `vite.config.ts` / `vite.config.js` - Build config, plugins, aliases
- `index.html` - Entry point configuration

### TypeScript/JavaScript

- `tsconfig.json` / `tsconfig.node.json` - TypeScript configuration
- `jsconfig.json` - JavaScript project config

### Framework-Specific (check which applies)

- React: Look for `jsx`/`tsx` files, React dependencies
- Vue: `*.vue` files, Vue dependencies
- Svelte: `*.svelte` files, `svelte.config.js`
- Solid: Solid.js dependencies and patterns

### Styling

- `tailwind.config.js` / `tailwind.config.ts` - Tailwind CSS
- `postcss.config.js` - PostCSS plugins
- `*.css` / `*.scss` / `*.less` files in src
- CSS-in-JS libraries in dependencies

### State Management & Data Fetching

- Look for: Redux, Zustand, Jotai, Pinia, TanStack Query, SWR, Apollo

### Testing

- `vitest.config.ts` - Vitest configuration
- `jest.config.js` - Jest configuration
- `playwright.config.ts` - E2E testing
- `cypress.config.ts` / `cypress/` - Cypress E2E
- `*.test.ts` / `*.spec.ts` patterns

### Code Quality

- `.eslintrc.*` / `eslint.config.js` - ESLint configuration
- `.prettierrc` / `prettier.config.js` - Prettier configuration
- `biome.json` - Biome (Prettier + ESLint alternative)
- `.stylelintrc` - CSS linting

### Backend/API (if full-stack)

- `server/` or `api/` directories
- Express, Fastify, Hono, or other Node frameworks
- `prisma/schema.prisma` - Prisma ORM
- `drizzle.config.ts` - Drizzle ORM
- Database connection configs

### Infrastructure & Deployment

- `Dockerfile` / `docker-compose.yml`
- `vercel.json` / `netlify.toml` / `railway.json`
- `.github/workflows/*.yml` - GitHub Actions
- `Procfile` - Heroku

### Environment & Configuration

- `.env.example` - Environment variable template
- `env.d.ts` - Environment type definitions

---

## Output Format

Provide a structured summary in this format:

### 🏗️ Project Overview

- Project name and description (from package.json)
- Node.js version requirement
- Package manager detected (npm/yarn/pnpm)

### ⚡ Vite Configuration

- Vite version
- Configured plugins (list each with brief purpose)
- Build target and output settings
- Dev server configuration
- Path aliases configured

### 🎨 Frontend Framework

- Framework and version (React/Vue/Svelte/Solid/Vanilla)
- Key framework-specific dependencies
- Component patterns observed

### 🎭 Styling Solution

- CSS approach (Tailwind/CSS Modules/Styled Components/etc.)
- PostCSS plugins configured
- Theme/design system if present

### 📦 Key Dependencies

List top dependencies grouped by purpose:

- **UI Components**: (component libraries)
- **State Management**: (state solutions)
- **Data Fetching**: (API/query libraries)
- **Routing**: (router packages)
- **Forms**: (form libraries)
- **Utilities**: (lodash, date-fns, etc.)

### 🧪 Testing Stack

- Unit testing: (Vitest/Jest)
- Component testing: (Testing Library)
- E2E testing: (Playwright/Cypress)
- Coverage configuration

### 🔧 Developer Experience

- TypeScript: version and strictness level
- Linting: ESLint config and key rules/plugins
- Formatting: Prettier/Biome configuration
- Git hooks: Husky/lint-staged setup
- Editor config: VSCode settings/extensions recommended

### 🖥️ Backend/API (if applicable)

- Server framework
- Database and ORM
- Authentication approach
- API patterns (REST/GraphQL/tRPC)

### 🚀 Build & Deployment

- Build scripts and their purposes
- CI/CD pipeline summary
- Deployment target(s)
- Environment management

### 📊 npm Scripts Reference

List all scripts from package.json with brief explanations:

```
dev      - [explanation]
build    - [explanation]
preview  - [explanation]
...etc
```

### ⚠️ Observations & Recommendations

- Outdated dependencies (if any major versions behind)
- Missing common configs (if applicable)
- Potential improvements or modernization opportunities
- Security considerations

---

Keep the summary comprehensive but scannable. Use bullet points and keep descriptions concise.

---

## Final Step: Save the Output

After generating the complete analysis above:

1. Run: `mkdir -p docs/tools/dev`
2. Save this entire analysis to: `docs/tools/dev/development-stack-tools-summary-[M-D-Y].md`
   - Replace `[M-D-Y]` with today's date (e.g., `12-25-2024`)
3. Confirm: "✅ Analysis saved to `docs/tools/dev/development-stack-tools-summary-[DATE].md`"
