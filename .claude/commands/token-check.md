# Token Check

Quick token status — one-liner cost awareness.

## Instructions

When invoked, provide a brief (3-5 line) status:

1. **Estimate current session cost** based on:
   - Approximate message count in conversation
   - Model in use (Opus/Sonnet/Haiku)
   - Rough input/output token estimate

2. **Output format:**

```
Session: ~$X.XX (est.) | Model: [Opus/Sonnet/Haiku] | Messages: ~N | Context: [ok/heavy/bloated]
```

3. **Context assessment:**
   - **ok**: Normal operation
   - **heavy**: Long session, consider `/compact` soon
   - **bloated**: Recommend immediate `/compact`

## Example Outputs

```
Session: ~$0.85 (est.) | Model: Opus | Messages: ~12 | Context: ok
```

```
Session: ~$3.20 (est.) | Model: Opus | Messages: ~45 | Context: heavy — consider /compact
```

```
Session: ~$8.50 (est.) | Model: Opus | Messages: ~100+ | Context: bloated — /compact recommended
```

## Usage

Quick check anytime:

```
/token-check
```

Or naturally:

```
"How much have I spent?"
"Token check"
"Cost so far?"
```

## Thresholds

| Messages | Context Status | Action   |
| -------- | -------------- | -------- |
| < 20     | ok             | Continue |
| 20-50    | heavy          | Monitor  |
| 50+      | bloated        | Compact  |

## Related

| Command         | Purpose                            |
| --------------- | ---------------------------------- |
| `/token-audit`  | Full analysis with recommendations |
| `/token-report` | Weekly summary                     |
| `/compact`      | Reduce context size                |
