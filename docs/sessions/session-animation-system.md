# Session: Animation System Design

**Platform:** Claude.ai (Browser)  
**Project:** UX Designer (see `UX_DESIGNER_PROJECT.md` for system prompt)  
**Type:** UX Design + Technical Planning  
**Priority:** Phase 2 — Core Experience  
**Estimated Sessions:** 2  
**Prerequisites:** Core flow designs (Recording UI, Consent, Review)

---

## Session Goal

Define all animations across The Story Portal — inventory what exists, design what's missing, establish timing standards, and create an implementation guide.

**Key animation to design:** Topic Reveal Animation (fire poof lifts topic off wheel, propels toward user)

---

## Context

### Current Animation Status

| Animation | Status | Notes |
|-----------|--------|-------|
| Wheel Physics | ✅ Complete | 60fps, momentum, snap-to-prompt |
| Steam Wisps | ✅ Complete | Ambient particle effect |
| Menu (blur + logo) | ✅ Complete | Open/close with blur backdrop |
| Electricity (New Topics) | 🟡 In Progress | AAA pipeline in progress |
| **Topic Reveal (fire poof)** | ⚫ Not Started | Critical ritual moment |
| WarpMotionLines | ⛔ Deprecated | Incomplete |
| DisintegrationParticles | ⛔ Deprecated | Incomplete |

### Animation Philosophy (from APP_SPECIFICATION.md §6)

> "Ritual over efficiency — Wheel animation should feel substantial"

Animations should:
- Feel mechanical and weighty (not slick/digital)
- Create ritual moments (not just transitions)
- Serve the story (not distract from it)
- Degrade gracefully on lower-powered devices

---

## Reference Materials

Upload to Claude.ai:
1. `docs/APP_SPECIFICATION.md` — §6 UX Principles
2. `docs/USER_FLOWS.md` — State transitions
3. `docs/UX_DESIGN_AUDIT.md` — Animation inventory
4. Screenshots/video of current animations (wheel, menu, electricity)

Reference skill:
- `.claude/skills/story-portal/references/animation-system.md`

---

## Session Flow

### Part 1: Animation Inventory & Topic Reveal (Session 1)

**Questions to explore:**

1. **Animation Inventory**
   - List all animated elements
   - Categorize: Ambient, Transition, Feedback, Ritual
   - Identify gaps

2. **Topic Reveal Animation (Critical)**
   - Trigger: Wheel stops on topic after spin
   - Concept: Fire poof lifts topic off wheel, propels toward user
   - Questions:
     - Where does fire originate? (Behind panel? From portal ring?)
     - Trajectory: Straight toward camera? Arc?
     - How far does topic travel? (Stops at what size/position?)
     - What happens to the wheel during/after reveal?
     - Sound design considerations?

3. **Post-Reveal State**
   - Where does the prompt settle?
   - Does it become a header? Floating card?
   - How do Record/Pass buttons enter?
   - What's visible of the wheel/environment?

4. **Fire Poof Visual Style**
   - Steampunk fire: Amber/orange? Brass sparks?
   - Smoke trail? Ember particles?
   - Duration: How long is the animation?

**Deliverables:**
- Complete animation inventory
- Topic Reveal storyboard/description
- Post-reveal state layout
- Fire poof visual direction

### Part 2: Timing Standards & Implementation Guide (Session 2)

**Questions to explore:**

1. **Timing Standards**
   - Fast transitions: 150-200ms
   - Standard transitions: 300-400ms
   - Ritual moments: 600-1000ms+
   - Easing functions: ease-out, spring, custom?

2. **Transition Animations**
   - Modal open/close
   - Screen transitions (wheel → recording → review)
   - Button press feedback
   - State changes (recording active → paused)

3. **Micro-interactions**
   - Button hover/press
   - Toggle states
   - Loading indicators
   - Success confirmations

4. **Technical Implementation**
   - CSS animations vs JavaScript vs WebGL
   - Performance targets (60fps on 2018+ phones)
   - Fallback for reduced-motion preference
   - Canvas vs DOM for particle effects

5. **Deprecated Animation Replacement**
   - What was WarpMotionLines trying to do?
   - What was DisintegrationParticles trying to do?
   - Do we need replacements, or does Topic Reveal cover it?

**Deliverables:**
- Timing standards document
- Transition animation specs
- Micro-interaction specs
- Technical implementation guide
- Performance requirements

---

## Prompt to Start Session

Copy and paste this into Claude.ai:

```
I'm designing the animation system for The Story Portal, a steampunk storytelling app. I need to inventory all animations, design missing ones (especially the Topic Reveal), and establish standards.

**Current state:**
- Wheel physics: ✅ Complete (60fps, momentum, snap)
- Steam wisps: ✅ Complete (ambient particles)
- Menu animations: ✅ Complete (blur + open/close)
- Electricity effect: 🟡 In progress (triggers on New Topics)
- Topic Reveal: ⚫ Not started (CRITICAL)
- Deprecated: WarpMotionLines, DisintegrationParticles (incomplete)

**Topic Reveal Animation Concept:**
When the wheel stops on a topic, a "fire poof" lifts the topic panel off the wheel and propels it toward the user. This is the key ritual moment — the transition from spinning to storytelling.

**Questions I need to answer:**
1. Where does the fire originate? How does it look (steampunk fire)?
2. What's the trajectory of the topic as it flies toward user?
3. Where does the topic settle? What's the post-reveal screen layout?
4. What happens to the wheel during/after the reveal?

**Animation philosophy:** "Ritual over efficiency" — animations should feel substantial and mechanical, creating meaningful moments, not just slick transitions.

Let's start by storyboarding the Topic Reveal animation — walk me through what the user sees frame by frame.
```

---

## Success Criteria

Session is complete when we have:
- [ ] Complete animation inventory
- [ ] Topic Reveal animation storyboard
- [ ] Fire poof visual direction
- [ ] Post-reveal state layout
- [ ] Timing standards (fast/standard/ritual)
- [ ] Easing function recommendations
- [ ] Transition animation specs
- [ ] Micro-interaction specs
- [ ] Technical implementation recommendations
- [ ] Performance requirements
- [ ] Reduced-motion fallback strategy
- [ ] All documentation in skill file

---

## Handoff to Implementation

After design is complete:
1. Update skill file: `.claude/skills/story-portal/references/animation-system.md`
2. Create implementation sessions for Claude CLI:
   - Topic Reveal animation (CSS/Canvas/WebGL TBD)
   - Modal transitions
   - Recording state transitions
   - Micro-interactions

---

## Animation Categories

### Ambient (Always Running)
- Steam wisps
- Subtle gear rotation (if any)
- Electricity crackling (during New Topics)

### Ritual (Key Moments)
- Wheel spin → stop
- Topic Reveal (fire poof)
- Story saved confirmation

### Transition (State Changes)
- Modal open/close
- Screen to screen
- Recording states

### Feedback (Micro-interactions)
- Button press
- Toggle change
- Error appearance
- Loading states

---

## Technical Considerations

### CSS Animations
- Good for: Transforms, opacity, simple transitions
- Used for: Button press, modal open/close, fades

### JavaScript + requestAnimationFrame
- Good for: Coordinated multi-element animations
- Used for: Wheel physics, complex state transitions

### Canvas 2D
- Good for: Particle effects, custom graphics
- Used for: Steam wisps, fire poof particles

### WebGL
- Good for: Complex shaders, high-performance effects
- Used for: Electricity effect
- Caution: Battery drain, device compatibility

### Performance Targets
- 60fps on iPhone X / Samsung Galaxy S9 (2017-2018)
- Graceful degradation on older devices
- Respect `prefers-reduced-motion` media query
