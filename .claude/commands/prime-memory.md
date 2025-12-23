# Prime Memory

Initialize the Memory MCP with key project context for Story Portal.

## Instructions

When this command is invoked, use the Memory MCP tools to store the following entities and relations:

### Core Entities to Create

```
1. Entity: "story-portal"
   Type: project
   Observations:
   - "React 18 + TypeScript + Vite application"
   - "Mission: Make empathy contagious through shared storytelling"
   - "Target: Love Burn festival"
   - "Steampunk aesthetic with brass, amber, aged paper"

2. Entity: "electricity-effect"
   Type: feature
   Observations:
   - "WebGL lightning animation in portal center"
   - "Implemented with React Three Fiber (R3F)"
   - "Two-phase iteration: Phase 1 (peak quality), Phase 2 (envelope)"
   - "Target SSIM: 90% against Sora reference"

3. Entity: "r3f-stack"
   Type: technology
   Observations:
   - "three, @react-three/fiber, @react-three/drei"
   - "@react-three/postprocessing, three-stdlib"
   - "Replaced raw WebGL implementation (archived)"

4. Entity: "animation-pipeline"
   Type: tooling
   Observations:
   - "Puppeteer capture -> Sharp processing -> SSIM analysis"
   - "Scenario configs in animations/{scenario}/scenario.json"
   - "Reference images in animations/{scenario}/references/"
```

### Key Relations to Create

```
1. story-portal -> uses -> r3f-stack
2. electricity-effect -> part_of -> story-portal
3. electricity-effect -> implemented_with -> r3f-stack
4. animation-pipeline -> validates -> electricity-effect
```

### Key Decisions to Store

```
1. Decision: "Use R3F instead of raw WebGL"
   Date: 2025-12-23
   Rationale: "Simpler code, better maintainability, ecosystem benefits"

2. Decision: "Two-phase iteration approach"
   Date: 2025-12-22
   Rationale: "Sora reference shows constant peak; our spec needs envelope"

3. Decision: "Trigger-based skill loading"
   Date: 2025-12-23
   Rationale: "Reduce CLAUDE.md size, load domain knowledge on-demand"

4. Decision: "Archive old WebGL code (don't delete)"
   Date: 2025-12-23
   Rationale: "Keep for reference in src/legacy/_archived/"
```

## Verification

After priming, verify with:
```
"What do you know about story-portal?"
"What technology stack does the electricity effect use?"
"What key decisions have been made?"
```
