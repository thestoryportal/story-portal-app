# Iteration Protocol Reference

## Core Principle

**Human visual feedback is ground truth.** Claude's assumptions, predictions, and "improvements" are secondary to what the human actually sees on screen.

## The Iteration Loop

```
┌─────────────────────────────────────────────────────────┐
│                    ITERATION LOOP                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. RECEIVE REQUEST                                     │
│     └─ Understand exactly what human wants              │
│                                                         │
│  2. IMPLEMENT (Minimal Scope)                           │
│     └─ Change ONLY what was requested                   │
│     └─ No bonus improvements                            │
│     └─ No refactoring "while we're here"                │
│                                                         │
│  3. STOP & PRESENT                                      │
│     └─ Show what was changed                            │
│     └─ Explain how to test                              │
│     └─ WAIT for human response                          │
│                                                         │
│  4. RECEIVE FEEDBACK                                    │
│     └─ Human provides visual confirmation OR            │
│     └─ Human reports issues                             │
│                                                         │
│  5. RESPOND TO FEEDBACK                                 │
│     └─ If "looks good" → DONE                           │
│     └─ If issues reported → Fix EXACTLY those issues    │
│     └─ If "stop" or "check in" → HALT immediately       │
│                                                         │
│  6. REPEAT from step 3                                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Critical Rules

### Rule 1: No Autonomous Continuation

After presenting a change, **NEVER** continue to the next change without human approval.

**WRONG:**

```
I've fixed the button color. I also noticed the padding was off,
so I adjusted that too. And while I was there, I refactored
the component structure for better maintainability.
```

**RIGHT:**

```
I've fixed the button color as requested.
Here's how to test: [instructions]
Let me know if this looks correct, or if you'd like any adjustments.
```

### Rule 2: Scope Discipline

The request defines the scope. Nothing more.

| Request                | Correct Scope       | Out of Scope                    |
| ---------------------- | ------------------- | ------------------------------- |
| "Fix the button color" | Change button color | Adjust padding, refactor styles |
| "Make text larger"     | Increase font-size  | Change font-weight, line-height |
| "Center the element"   | Add centering CSS   | Restructure layout              |

### Rule 3: Visual Feedback Priority

When human reports a visual issue:

1. **Believe them** — They see something you don't
2. **Don't argue** — "That shouldn't be happening" is not helpful
3. **Fix immediately** — Their observation is the spec
4. **Verify understanding** — "You're seeing X, correct?"

### Rule 4: Stop Means Stop

These phrases mean **halt all work immediately**:

- "Stop"
- "Wait"
- "Hold on"
- "Let me check"
- "Check in with me"
- "Before you continue"
- "Pause"

Do not:

- Finish the current thought
- Make one more small fix
- Explain what you were about to do
- Suggest what comes next

Just stop. Wait for further instruction.

## Deep Thinking Protocol

For non-trivial tasks, **think before coding**:

### Step 1: State Understanding

```
I understand you want to [specific goal].
This will involve [high-level approach].
```

### Step 2: Outline Approach

```
My plan:
1. [First step]
2. [Second step]
3. [Third step]
```

### Step 3: Identify Risks

```
Potential issues:
- [Risk 1] — Mitigation: [approach]
- [Risk 2] — Mitigation: [approach]
```

### Step 4: Get Approval

```
Does this approach sound right, or would you like me to adjust?
```

### Step 5: Only Then Implement

After human confirms, proceed with implementation.

## Checkpoint Frequency

| Task Complexity        | Checkpoint Frequency    |
| ---------------------- | ----------------------- |
| Trivial (typo fix)     | After completion        |
| Simple (one component) | After each file         |
| Medium (multi-file)    | After each logical unit |
| Complex (architecture) | After each step of plan |
| Experimental (unknown) | Every 5-10 lines        |

When in doubt, checkpoint more often. Humans prefer frequent small updates over surprise large changes.

## Recovery Protocol

If you realize you've gone too far without checking in:

1. **Stop immediately**
2. **Summarize what you did** — List all changes made
3. **Acknowledge the violation** — "I should have checked in earlier"
4. **Offer to revert** — "Would you like me to undo any of these changes?"
5. **Reset to proper cadence** — Resume with proper checkpoints

## Anti-Patterns

### The Runaway Train

Making change after change without stopping.
**Fix:** Force yourself to stop after EVERY change.

### The Helpful Addition

"While I'm here, I'll also fix this unrelated thing."
**Fix:** Note it for later, don't do it now.

### The Assumption Override

"The human said X, but they probably meant Y."
**Fix:** Ask for clarification instead of assuming.

### The Explanation Dodge

Responding to "stop" with a lengthy explanation.
**Fix:** Just stop. Explain only if asked.

### The Quality Creep

Improving code quality when asked to fix a bug.
**Fix:** Separate concerns—fix bug first, propose refactor later.
