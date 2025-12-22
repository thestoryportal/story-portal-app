# The Story Portal — Claude Workflow Guide

**Purpose:** How to use session starters and skills with Claude CLI and Claude Browser  
**Created:** December 2024

---

## Table of Contents

1. [File Types & Where They Live](#1-file-types--where-they-live)
2. [Installation](#2-installation)
3. [Claude Tools Overview](#3-claude-tools-overview)
4. [Starting a Session](#4-starting-a-session)
5. [Working with Claude Browser](#5-working-with-claude-browser)
6. [Working with Claude CLI](#6-working-with-claude-cli)
7. [The Complete Workflow](#7-the-complete-workflow)
8. [Session Chaining](#8-session-chaining)
9. [Tips & Best Practices](#9-tips--best-practices)

---

## 1. File Types & Where They Live

### Three File Types

| Type | Purpose | Location | Used By |
|------|---------|----------|---------|
| **Session Starters** | Guide a Claude conversation toward a specific goal | `docs/sessions/` | Human (copy-paste to Claude) |
| **Skills** | Domain knowledge Claude references during work | `.claude/skills/story-portal/references/` | Claude CLI (auto-loaded) |
| **Specs/Docs** | Source of truth documents | `docs/` | Both (uploaded or referenced) |

### File Relationships

```
Session Starter (you provide)
       ↓
   Claude reads
       ↓
References Skill files (domain knowledge)
       ↓
References Spec docs (requirements)
       ↓
   Produces output
       ↓
Updates Skill/Spec if needed
```

---

## 2. Installation

### Step 1: Create Directory Structure

```bash
# From your project root
mkdir -p docs/sessions
mkdir -p .claude/skills/story-portal/references
```

### Step 2: Copy Session Starters

Session starters live in `docs/sessions/` for easy access:

```bash
# Copy all session starters
cp ~/Downloads/sessions/session-ux-design-audit.md docs/sessions/
cp ~/Downloads/sessions/session-audio-recording.md docs/sessions/
cp ~/Downloads/sessions/session-local-storage.md docs/sessions/
cp ~/Downloads/sessions/session-pwa-offline.md docs/sessions/
cp ~/Downloads/sessions/session-consent-flows-design.md docs/sessions/
cp ~/Downloads/sessions/session-consent-flows-implementation.md docs/sessions/
cp ~/Downloads/sessions/session-content-voice.md docs/sessions/
cp ~/Downloads/sessions/session-analytics-events.md docs/sessions/
```

### Step 3: Copy Skills

Skills live in `.claude/skills/story-portal/references/` so Claude CLI auto-loads them:

```bash
# Copy all skills
cp ~/Downloads/skills/ux-design-audit.md .claude/skills/story-portal/references/
cp ~/Downloads/skills/audio-recording.md .claude/skills/story-portal/references/
cp ~/Downloads/skills/local-storage.md .claude/skills/story-portal/references/
cp ~/Downloads/skills/pwa-offline.md .claude/skills/story-portal/references/
cp ~/Downloads/skills/consent-flows.md .claude/skills/story-portal/references/
cp ~/Downloads/skills/content-voice.md .claude/skills/story-portal/references/
cp ~/Downloads/skills/analytics-events.md .claude/skills/story-portal/references/
```

### Step 4: Copy Core Docs (if not already present)

```bash
# These should already exist, but verify:
ls docs/APP_SPECIFICATION.md
ls docs/USER_FLOWS.md
ls docs/prompts.json

# If USER_FLOWS.md is new:
cp ~/Downloads/USER_FLOWS.md docs/
```

### Step 5: Update CLAUDE.md

Add the new skills to your CLAUDE.md skill table:

```markdown
## Skill Integration

| File | When to Read |
|------|--------------|
| `references/design-system.md` | Any visual/styling work |
| `references/wheel-mechanics.md` | 3D wheel, panels, radius calculations |
| `references/animation-standards.md` | Animation, WebGL, effects |
| `references/responsive-design.md` | Device testing, breakpoints |
| `references/component-patterns.md` | React architecture, hooks |
| `references/iteration-protocol.md` | Complex multi-step work |
| `references/ux-design-audit.md` | Design status, what needs design |
| `references/audio-recording.md` | Recording implementation |
| `references/local-storage.md` | Story persistence |
| `references/pwa-offline.md` | PWA and offline |
| `references/consent-flows.md` | Consent UI and data |
| `references/content-voice.md` | Copy and content writing |
| `references/analytics-events.md` | GA4 tracking |
```

### Step 6: Commit to Repo

```bash
git add docs/sessions/ .claude/skills/story-portal/references/ docs/USER_FLOWS.md
git commit -m "docs: add session starters and Claude skills

Session starters for:
- UX design audit
- Audio recording
- Local storage
- PWA/offline
- Consent flows (design + implementation)
- Content/voice
- Analytics

Skills provide domain knowledge for Claude CLI"
git push
```

### Final Directory Structure

```
story-portal-app/
├── .claude/
│   └── skills/
│       └── story-portal/
│           └── references/
│               ├── design-system.md        # (existing)
│               ├── wheel-mechanics.md      # (existing)
│               ├── animation-standards.md  # (existing)
│               ├── ux-design-audit.md      # NEW
│               ├── audio-recording.md      # NEW
│               ├── local-storage.md        # NEW
│               ├── pwa-offline.md          # NEW
│               ├── consent-flows.md        # NEW
│               ├── content-voice.md        # NEW
│               └── analytics-events.md     # NEW
├── docs/
│   ├── APP_SPECIFICATION.md
│   ├── USER_FLOWS.md                       # NEW or updated
│   ├── prompts.json
│   └── sessions/                           # NEW folder
│       ├── session-ux-design-audit.md
│       ├── session-audio-recording.md
│       ├── session-local-storage.md
│       ├── session-pwa-offline.md
│       ├── session-consent-flows-design.md
│       ├── session-consent-flows-implementation.md
│       ├── session-content-voice.md
│       └── session-analytics-events.md
├── CLAUDE.md                               # Updated with new skills
└── ...
```

---

## 3. Claude Tools Overview

### Two Tools, Different Strengths

| Tool | Best For | Access To | How to Start |
|------|----------|-----------|--------------|
| **Claude Browser** (claude.ai) | Ideation, design, writing, strategic thinking | Uploaded files, extended thinking, artifacts | Open claude.ai in browser |
| **Claude CLI** (Claude Code) | Implementation, file editing, testing | Full file system, terminal, code execution | Run `claude` in terminal |

### Decision Matrix

| Task | Use | Why |
|------|-----|-----|
| UX Design Audit | Browser | Strategic thinking, document creation |
| Design a flow/screen | Browser | Ideation, wireframing, copy iteration |
| Write content/copy | Browser | Long-form writing, tone refinement |
| Implement React components | CLI | File creation, testing, iteration |
| Configure build tools | CLI | Edit config files, run commands |
| Debug code | CLI | Read errors, edit files, test fixes |
| Create documentation | Browser | Extended thinking, artifact creation |

---

## 4. Starting a Session

### For Claude Browser Sessions

**Step 1:** Open claude.ai

**Step 2:** Start a new conversation (or use a Project with relevant files)

**Step 3:** Open the session starter file locally:
```bash
# View the session starter
cat docs/sessions/session-ux-design-audit.md
```

**Step 4:** Copy the "Prompt to Start Session" block and paste into Claude

**Step 5:** Upload any reference files Claude needs (or add to Project):
- `docs/APP_SPECIFICATION.md`
- `docs/USER_FLOWS.md`
- Relevant skill file (optional but helpful)

**Step 6:** Follow the session flow, answering Claude's questions

---

### For Claude CLI Sessions

**Step 1:** Open terminal in your project root

**Step 2:** Start Claude CLI:
```bash
claude
```

**Step 3:** Reference the session starter in your first message:
```
Read docs/sessions/session-audio-recording.md and let's begin that session.
```

Or copy-paste the prompt:
```
# Open the session file
cat docs/sessions/session-audio-recording.md

# Copy the "Prompt to Start Session" and paste into Claude CLI
```

**Step 4:** Claude CLI will automatically have access to:
- All files in your project
- Skills in `.claude/skills/`
- Ability to run commands, edit files, test code

---

## 5. Working with Claude Browser

### Best Practices

**Starting the Session:**
1. Create a new conversation (or use a dedicated Project)
2. Upload key reference docs at the start
3. Paste the session prompt
4. Let Claude ask clarifying questions before diving in

**During the Session:**
```
You → [Paste session prompt]
Claude → [Asks clarifying questions]
You → [Answer questions, provide context]
Claude → [Proposes approach]
You → [Approve, modify, or redirect]
Claude → [Creates artifact/document]
You → [Review, request changes]
Claude → [Iterates]
... repeat until done ...
```

**Using Artifacts:**
- Claude will create documents as artifacts
- You can ask Claude to modify specific sections
- Download final artifacts when complete

**Saving Outputs:**
1. Download artifacts from Claude
2. Copy to appropriate location in repo:
   ```bash
   # Example: UX Design Audit output
   cp ~/Downloads/UX_DESIGN_AUDIT.md docs/
   ```
3. Commit to repo

### Example Browser Session Flow

```
┌─────────────────────────────────────────────────────────────┐
│ SESSION: UX Design Audit                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. Upload: APP_SPECIFICATION.md, USER_FLOWS.md              │
│                                                             │
│ 2. Paste session prompt                                     │
│                                                             │
│ 3. Claude asks about current design state                   │
│    → You describe what's built vs placeholder               │
│                                                             │
│ 4. Claude proposes inventory structure                      │
│    → You approve or adjust                                  │
│                                                             │
│ 5. Claude creates screen inventory artifact                 │
│    → You verify accuracy                                    │
│                                                             │
│ 6. Claude identifies gaps                                   │
│    → You confirm priorities                                 │
│                                                             │
│ 7. Claude creates full UX_DESIGN_AUDIT.md artifact          │
│    → You review and request changes                         │
│                                                             │
│ 8. Download final artifact                                  │
│    → Copy to docs/UX_DESIGN_AUDIT.md                        │
│    → Commit to repo                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Working with Claude CLI

### Best Practices

**Starting the Session:**
```bash
# Navigate to project root
cd ~/projects/story-portal-app

# Start Claude CLI
claude

# Option A: Ask Claude to read the session file
> Read docs/sessions/session-audio-recording.md and begin that session.

# Option B: Paste the prompt directly
> [paste prompt from session file]
```

**During the Session:**
```
You → [Session prompt or instruction]
Claude → [Reads relevant files, proposes approach]
You → [Approve or adjust]
Claude → [Implements, creates files, runs commands]
You → [Test in browser, report results]
Claude → [Fixes issues, iterates]
... repeat until done ...
```

**Claude CLI Commands:**
```
# Claude can run commands
> Run pnpm dev and check for errors

# Claude can read files
> Read src/hooks/useWheelPhysics.ts to understand the pattern

# Claude can create files
> Create the useAudioRecorder hook based on our discussion

# Claude can edit files
> Update RecordView.tsx to use the new hook

# Claude can test
> Run pnpm lint and fix any errors
```

**Iteration Protocol (from CLAUDE.md):**
```
1. Claude makes requested change
2. Claude STOPS and presents result
3. You test/review
4. You provide feedback
5. Claude fixes exactly what you report
6. Repeat until complete
```

### Example CLI Session Flow

```
┌─────────────────────────────────────────────────────────────┐
│ SESSION: Audio Recording Implementation                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ $ claude                                                    │
│                                                             │
│ > Read docs/sessions/session-audio-recording.md and begin   │
│                                                             │
│ Claude: [Reads session file and skill file]                 │
│         [Proposes implementation approach]                  │
│                                                             │
│ > Looks good, start with useAudioRecorder hook              │
│                                                             │
│ Claude: [Creates src/hooks/useAudioRecorder.ts]             │
│         [Shows code, stops for review]                      │
│                                                             │
│ > Run pnpm lint                                             │
│                                                             │
│ Claude: [Runs lint, shows results]                          │
│                                                             │
│ > Test it - I'll check in browser                           │
│                                                             │
│ You: [Open browser, test recording]                         │
│      [Report: "Recording works but no waveform"]            │
│                                                             │
│ > Recording works but waveform not showing                  │
│                                                             │
│ Claude: [Investigates, creates useWaveform hook]            │
│         ... continues ...                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. The Complete Workflow

### Phase 1: Strategic Planning (Browser)

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: UX Design Audit                                     │
│ Tool: Claude Browser                                        │
│ Session: session-ux-design-audit.md                         │
│                                                             │
│ Input:                                                      │
│   - APP_SPECIFICATION.md                                    │
│   - USER_FLOWS.md                                           │
│   - Current project status                                  │
│                                                             │
│ Output:                                                     │
│   - docs/UX_DESIGN_AUDIT.md                                 │
│   - Prioritized list of design sessions needed              │
└─────────────────────────────────────────────────────────────┘
                              ↓
```

### Phase 2: UX Design (Browser)

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Individual Design Sessions                          │
│ Tool: Claude Browser                                        │
│ Sessions: Based on audit priorities                         │
│                                                             │
│ Example - Consent Flow Design:                              │
│   Session: session-consent-flows-design.md                  │
│   Input: USER_FLOWS.md, consent-flows.md skill              │
│   Output: Wireframes, copy, transitions documented          │
│                                                             │
│ Repeat for each design priority from audit                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
```

### Phase 3: Implementation (CLI)

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Build Features                                      │
│ Tool: Claude CLI                                            │
│ Sessions: Implementation sessions                           │
│                                                             │
│ Suggested order:                                            │
│   1. session-audio-recording.md (foundation)                │
│   2. session-local-storage.md (persistence)                 │
│   3. session-consent-flows-implementation.md (uses both)    │
│   4. session-pwa-offline.md (after core works)              │
│   5. session-analytics-events.md (after flows stable)       │
│                                                             │
│ Each session:                                               │
│   - Claude reads session + skill files                      │
│   - Proposes approach                                       │
│   - Implements with your feedback                           │
│   - You test, iterate until working                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
```

### Phase 4: Content (Browser, Parallel)

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Content & Copy                                      │
│ Tool: Claude Browser                                        │
│ Session: session-content-voice.md                           │
│                                                             │
│ Can run in parallel with implementation.                    │
│                                                             │
│ Input: APP_SPECIFICATION.md, content-voice.md skill         │
│ Output: All screen copy, error messages, content            │
│                                                             │
│ Copy outputs into components during implementation.         │
└─────────────────────────────────────────────────────────────┘
```

### Visual Summary

```
         BROWSER                           CLI
         (Ideate)                       (Execute)
            │                              │
            ▼                              │
   ┌────────────────┐                      │
   │  UX Design     │                      │
   │  Audit         │                      │
   └───────┬────────┘                      │
           │                               │
           ▼                               │
   ┌────────────────┐                      │
   │  Design        │                      │
   │  Sessions      │──────────────────────┤
   │  (wireframes)  │     (handoff)        │
   └───────┬────────┘                      ▼
           │                      ┌────────────────┐
           │                      │ Implementation │
   ┌───────┴────────┐             │ Sessions       │
   │  Content       │             │ (code)         │
   │  Voice         │─────────────┤                │
   │  (copy)        │  (copy to   └────────────────┘
   └────────────────┘   components)
```

---

## 8. Session Chaining

### How Sessions Connect

Some sessions produce outputs that other sessions consume:

```
session-ux-design-audit.md
    │
    ├─→ Produces: UX_DESIGN_AUDIT.md
    │
    └─→ Identifies needed design sessions
              │
              ▼
session-consent-flows-design.md
    │
    ├─→ Produces: Wireframes, finalized copy
    │
    └─→ Input for implementation
              │
              ▼
session-consent-flows-implementation.md
    │
    └─→ Produces: Working React components
```

### Handoff Between Tools

**Browser → CLI Handoff:**
1. Complete Browser session (design)
2. Download/save artifacts
3. Commit to repo
4. Start CLI session
5. Reference design outputs: "Implement the designs from docs/consent-flow-designs.md"

**CLI → Browser Handoff:**
1. Complete CLI session (implementation)
2. Commit working code
3. Start Browser session
4. Report what's built: "Recording is implemented. Now let's design the My Stories gallery."

---

## 9. Tips & Best Practices

### General Tips

| Tip | Why |
|-----|-----|
| **One session, one goal** | Keeps focus, produces clear outputs |
| **Read the session file first** | Understand what success looks like |
| **Prepare inputs beforehand** | Sessions flow better with materials ready |
| **Commit outputs promptly** | Don't lose work, keep repo current |
| **Update skills after learning** | Codify knowledge for future sessions |

### Browser Session Tips

| Tip | Why |
|-----|-----|
| **Use Projects for ongoing work** | Keeps context between conversations |
| **Upload key docs at start** | Claude has full context immediately |
| **Ask for artifacts** | Easier to download and save |
| **Don't rush** | Strategic thinking benefits from space |

### CLI Session Tips

| Tip | Why |
|-----|-----|
| **Follow iteration protocol** | Prevents runaway changes |
| **Test frequently** | Catch issues early |
| **Use /compact for long sessions** | Preserve context as conversation grows |
| **Commit working increments** | Don't lose progress |

### Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| Starting implementation without design | Run design sessions first |
| Skipping the audit | You'll miss gaps and inconsistencies |
| Not testing Claude CLI output | Always verify in browser |
| Letting sessions run too long | Compact or start fresh |
| Forgetting to save Browser artifacts | Download before closing |

---

## Quick Reference Card

### Starting a Browser Session
```
1. Open claude.ai
2. Upload: APP_SPECIFICATION.md, USER_FLOWS.md
3. Paste prompt from docs/sessions/session-[name].md
4. Answer Claude's questions
5. Iterate on artifacts
6. Download and commit outputs
```

### Starting a CLI Session
```
1. cd to project root
2. Run: claude
3. Type: Read docs/sessions/session-[name].md and begin
4. Approve approach
5. Test changes in browser
6. Iterate until working
7. Commit code
```

### Session File Locations
```
Sessions:  docs/sessions/session-*.md
Skills:    .claude/skills/story-portal/references/*.md
Specs:     docs/*.md
Outputs:   docs/ (documents) or src/ (code)
```

---

## Checklist: Ready to Start?

```
□ Directory structure created
□ Session starters in docs/sessions/
□ Skills in .claude/skills/story-portal/references/
□ CLAUDE.md updated with new skills
□ All files committed to repo
□ Know which session to run first (UX Design Audit recommended)
□ Reference docs ready to upload (APP_SPECIFICATION.md, USER_FLOWS.md)
```

---

*This guide should be updated as you discover better workflows or create new sessions.*
