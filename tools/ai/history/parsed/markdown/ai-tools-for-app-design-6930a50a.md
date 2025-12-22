# AI tools for app design

**Created:** 2025-12-03T21:01:02.023Z
**Updated:** 2025-12-04T00:12:28.073Z
**Messages:** 4

---

### 👤 USER (2025-12-03T21:00:55.513Z)

I am developing The Story Portal app - an app for users to spin a wheel with story prompts and then they share a true story from their life based on the prompt. We developed this app many years ago with a look and feel that was based on the color schemes and general look and feel of the stage production during that time. We now have a different stage production with a different color scheme and look. The wheel in the stage production is the most similar looking element. I want to create potential GUIs for the new app that bring in the colors and look and feel of the new stage production as well as modernize the GUI for today's application best practices. What AI tools can I use to accomplish this and what is my workflow without having strong graphic design skills?

---

### 🤖 ASSISTANT (2025-12-03T21:01:03.198Z)

Suggesting AI tools for GUI design with minimal graphic design skills
Providing workflow for UI design and bridging with Stitch
Defining a workflow for UI design with minimal graphic skills

---

### 🤖 ASSISTANT (2025-12-03T21:01:44.674Z)

Recommending AI tools and workflow for GUI design
Simplifying design tool recommendations
Categorizing AI tools and workflow for GUI design
Step-by-step workflow:
Design workflow for non-designers:

---

### 🤖 ASSISTANT (2025-12-03T21:02:24.277Z)

You can absolutely get to a really good-looking, on-brand Story Portal app without becoming a “proper” designer first. The trick is to pick **one main design hub**, then surround it with a few AI helpers that do the heavy lifting (layout, palettes, textures) while you make the high-level calls.

I’ll lay this out as:

1. **Which AI tools to use (and what each is for)**
2. **A concrete, step-by-step workflow tailored to The Story Portal**

---

## 1. Recommended AI tool stack (no real design skills required)

### A. Your *main hub*: Figma + Figma Make (AI UI generator)

Use **Figma** as your “home base” for all screens, components, and design systems.  
Figma’s new AI tools (**Figma Make**) let you describe a screen in natural language and get **fully editable UI layouts and components**, instead of staring at a blank canvas. citeturn0search1turn0news34  

Key reasons to use it as the hub:

- **Prompt → multi-screen UI**: “Mobile home screen for The Story Portal with a spinning 20-segment wheel, big SPIN button, bottom nav, dark steampunk palette” → auto-generated screen.
- **Modern best practices baked in**: spacing, hierarchy, and component structure follow standard design patterns.
- **Plays nicely with dev tools** and code-gen tools (including Stitch, Builder.io, etc.). citeturn0search21turn0news33  
- New “Figma Weave” / Weavy integration lets you chain multiple AI image/video models for moodboards and assets inside Figma. citeturn0news32turn0news35  

> **Bottom line:** Make Figma your **one place** where the whole app lives visually. Everything else feeds into it.

---

### B. Fast “idea to UI” helpers: Uizard, Galileo, Banani, Stitch

These are great for quickly exploring directions and then importing into Figma.

1. **Uizard Autodesigner**
   - Turn **text prompts** into multi-screen app mockups in seconds. citeturn0search4turn0search5turn0search26  
   - Has a **Screenshot Scanner**: upload an existing app (or your *old* Story Portal app), and it converts it into an editable design you can restyle. citeturn0search0turn0search10  
   - Very beginner-friendly: you can tweak colors, fonts, and components without deep design knowledge.

2. **Galileo AI or Banani**
   - **Galileo AI**: text-to-UI platform that generates high-fidelity mobile/web screens from natural language prompts. citeturn0search11turn0search17turn0search20  
   - **Banani**: similar idea, with extras like image-to-UI and a color wheel; has free tiers. citeturn0search24  
   - Both integrate with or export to Figma so you can refine there.

3. **Stitch (from Google)**
   - You already know this one: Stitch generates UIs for mobile and web apps directly from prompts. citeturn0search27  
   - Great for **quick interactive prototypes or code-adjacent UI**, especially if you want to keep dev in the loop.
   - Use it when you want: “Okay, we like this screen—now show us a working layout we can play with.”

> **How to use these together:**  
> Use Uizard / Galileo / Banani / Stitch to sprint out **lots of variations**, then bring your favorites into Figma for cleanup and consolidation into a single design system.

---

### C. Visual style & assets: AI image + color tools

To capture your new stage production’s look (wood, brass, lighting, wheel):

- **AI image generators**: OpenAI image tools, Adobe Firefly, etc. for:
  - Background textures (aged wood panels, brass plates, subtle steam).
  - Iconography (small gears, rivets, badges for achievements).
- **Palette extractors / color tools**:
  - Figma & many AI tools can **pull a color palette from your stage photos** directly.
  - Tools like Banani’s **color wheel** can help you build harmonious palettes around those extracted colors. citeturn0search24  

You don’t need to hand-paint anything—just generate, pick what feels right, and drop into Figma.

---

### D. Bonus (later): animation / wheel interaction

Not required at first, but when you’re ready:

- **Rive** or **Spline** for animated wheel assets (spin, easing, highlight selected wedge).
- Export as Lottie / embedded asset for devs.

You can design the *look* of the wheel in Figma + AI, then re-implement the motion here.

---

## 2. A practical workflow for The Story Portal (step-by-step)

Here’s a concrete path you could follow *right now* without strong design skills.

### Step 1 – Capture the new stage’s “visual DNA”

1. Take 10–20 good photos:
   - The wheel close-up (front, slight angle).
   - Stage in full, showing lighting and color vibe.
   - Close-ups of wood, metal, fabrics, any iconic textures.
2. Upload those to:
   - Figma (for palette extraction & moodboard).
   - One AI image tool (for generating matching textures/backgrounds).

Your job: mostly **curation**—picking which images actually feel like The Story Portal.

---

### Step 2 – Let AI propose color + style

In Figma:

1. Drop 4–6 of your best stage photos into one Figma file (“Visual DNA” page).
2. Use Figma / AI plugins to:
   - **Extract palettes** from those images.
   - Create swatches: PRIMARY, SECONDARY, ACCENT, BACKGROUND, TEXT.
3. Ask AI (here or in Figma Make) something like:
   > “Define a 6-color palette inspired by these stage photos, optimized for dark-mode mobile UI, with AA contrast.”

Optionally use Banani’s color tools or similar for suggestions around that palette. citeturn0search24  

You end this step with:

- A **dark steampunk palette** tuned for readability.
- A rough **typography choice** (e.g., one modern sans for UI + one more decorative font used sparingly for headings).

---

### Step 3 – Generate first-pass screens with an AI UI tool

Pick ONE generator for the first pass (say, Figma Make or Uizard):

**Example prompts** (for The Story Portal):

- **Home / Wheel screen**  
  > “Design a mobile home screen for ‘The Story Portal’ app. Hero element is a 20-segment brass wheel with story prompts. Big circular ‘SPIN’ button in the center. Dark background inspired by steampunk wood and brass with soft spotlight lighting. Bottom navigation bar with ‘Home’, ‘My Stories’, and ‘Profile’. Modern, clean, minimal layout that still feels magical and mechanical.”

- **Prompt / Story screen**  
  > “Design a mobile screen that appears after a spin lands on a prompt. Show the selected prompt at the top in a decorative badge, a large text recording timer and waveform area, big ‘Record story’ button, and a list of past stories below. Same steampunk palette and visual language.”

- **Library / Profile screen**  
  > “Design a mobile library screen listing my past stories with titles, duration, and date, and a filter for prompts. Simple cards, minimal clutter, same theme.”

Generate several variations, then pick the **closest** to what you like.

If you use Uizard’s Autodesigner, you can have it generate multiple screens in one go. citeturn0search5turn0search26  

---

### Step 4 – Pull the winners into Figma and unify the style

Now move your favorite concepts into Figma (via export/import or plugins):

1. Create a new Figma file: `Story Portal v2 – App`.
2. Add pages:
   - `Components & Styles`
   - `Screen – Wheel`
   - `Screen – Story`
   - `Screen – Library`
   - (More later: login, onboarding, etc.)
3. In `Components & Styles`:
   - Convert buttons, inputs, cards, nav bars into **Figma components**.
   - Apply your **palette tokens** and typography consistently.
   - Use Figma’s AI editing to nudge style: “make this more minimal,” “reduce glow,” etc. citeturn0search12turn0news35  

This is where you turn “AI-generated mockups” into a **coherent design system**.

---

### Step 5 – Add the real Story Portal flavor (textures & wheel)

Using your stage imagery and AI-generated textures:

1. Generate a few brass/wood/metal textures that feel like your physical stage.
2. Bring those into Figma as:
   - Background fills for hero areas (e.g., behind the wheel).
   - Subtle overlays on cards/panels (low opacity, so it stays modern).
3. Design **one really good wheel graphic**:
   - Either:
     - Generate via AI (describe your real wheel), then clean up in Figma, or
     - Build it in Figma manually using shapes + images.
4. Wrap the wheel graphic as a **component**, with:
   - States for idle / spinning / selected.
   - A version cropped for the app’s home screen hero.

You don’t need to animate it here—just make it look right.

---

### Step 6 – Sanity-check with modern UX best practices

Run through each screen and ask:

- Are tap targets **big enough** (44px+)?
- Is text **high contrast** and readable on your textured backgrounds?
- Is navigation **obvious** (bottom nav, back buttons, clear CTAs)?
- Is there enough **breathing room** (padding, spacing)?

You can grab a Figma template or checklist for mobile UX and compare, or ask an AI assistant inside Figma to review for usability.

---

### Step 7 – Turn designs into interactive prototypes / dev-ready outputs

Once you like the visuals:

1. Add Figma **prototyping links**:
   - Tap “SPIN” → goes to “Prompt/Story” screen.
   - Tap a story card → goes to “Story detail” screen.
2. For code / implementation:
   - Use **Stitch** to generate app UIs from your now-clear design spec and flows. citeturn0search27  
   - Or use Figma → code tools (Builder.io, etc.) for production-ready front-end. citeturn0search21turn0news33  

At this point, a developer (or future you) can hook up the logic for spinning, selecting prompts, and recording stories.

---

### If you want the simplest starting recipe

If you want to start **super lean**:

1. Use **Uizard Autodesigner** or **Banani** to generate 3–4 app layouts from prompts.
2. Import your favorite into **Figma**.
3. Use **Figma Make** + your stage photos to restyle everything to your new Story Portal look.
4. Once you’re happy, use **Stitch** purely as a way to see it running quickly.

If you’d like, next step we can write **exact prompts** for Figma Make / Uizard that match your *current* stage colors and wheel design, so you can paste them in and start generating screens immediately.

---

