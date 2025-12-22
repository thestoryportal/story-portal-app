# AI UI button generation

**Created:** 2025-12-10T03:00:30.280Z
**Updated:** 2025-12-10T19:10:32.950Z
**Messages:** 38

---

### 🤖 ASSISTANT (2025-12-10T03:00:53.638Z)

The most efficient way is to let AI do *texture + style*, and let **you** control size, layout, and states in a design tool.

Here’s a workflow that works well for an interface like your steampunk portal:

---

## 1. Use a design tool as the “hub”

Pick one:

- **Figma** (free, great for variants & exporting)
- or **Photoshop / Affinity** (since you’re already using them)

In that tool:

1. Drop in your **machine-wall + portal** image as the background.
2. Draw simple rectangles where each button will live (New Topics, Record, etc.).
3. Size them how you actually need them in the app (e.g. 260×80 px).
4. Name each one: `btn-new-topics`, `btn-record`, etc.

These rectangles define exact pixel sizes and positions so AI doesn’t guess.

---

## 2. Let AI texture each state **inside** those rectangles

### Option A – Photoshop / Affinity + Generative Fill

For each button:

1. Duplicate the rectangle layer 3 times: `default`, `hover`, `pressed`.
2. On the **default** rectangle, select its interior (no background).
3. Use **Generative Fill** with a prompt like:

> “Steampunk brass button, slightly convex, weathered copper rim, subtle teal patina, rivets, metal looks like the surrounding machine wall, blank center for text, top-down lighting, no label, transparent background.”

4. For **hover**, repeat with:

> “Same button, slightly brighter brass, subtle warm outer glow, more illuminated edge, looks active but not pressed, no label.”

5. For **pressed**, repeat with:

> “Same button, darker center, slight inner shadow, looks pushed in, rim casting a shadow, no label.”

Because you’re working in selections on separate layers, every state:

- is **exactly the same size**,  
- is perfectly aligned,  
- and already sits on top of your real UI so you can visually check integration.

---

## 3. Export clean assets for the app

From your PSD/Affinity/Figma file:

- Hide the background.
- Export each state layer as **individual transparent PNGs**:
  - `btn-new-topics-default.png`
  - `btn-new-topics-hover.png`
  - `btn-new-topics-pressed.png`
  - etc.

Or export a **sprite sheet** (rows: default / hover / pressed; columns: each button) if you prefer CSS sprites.

---

## 4. Preview them “in place” on the interface

You already have that in the same file:

- Keep one version with the background visible → this is your **mockup** for visual QA.
- Keep another with only the buttons visible → this is your **export source**.

In Figma you can turn your buttons into **components with variants**:

- Variant 1: `Default`
- Variant 2: `Hover`
- Variant 3: `Pressed`

Then you can toggle through states right on top of your steampunk background to see how they feel in context.

---

## 5. Using pure image-generation tools (DALL·E, Midjourney, Canva AI)

If you want concept options fast (before the Photoshop refinements), generate **button sheets** and then slice:

Prompt pattern:

> “Create a high-resolution sprite sheet of 6 rectangular steampunk UI buttons in 3 rows and 6 columns. Top row = default state, middle row = hover, bottom row = pressed. Style matches the attached steampunk portal machine wall: weathered brass, teal patina, rivets, gauges, warm lighting. Leave the centers blank for text. No cropping, all buttons fully visible with equal padding around the grid, transparent background.”

Then:

1. Import that sheet into Photoshop/Figma.
2. Slice each tile into `default/hover/pressed`.
3. Fine-tune with generative fill where needed so they blend *perfectly* with your specific wall.

Reuse the same prompt, tweaking only the design adjectives (“round porthole buttons,” “pill-shaped,” “gear-rimmed,” etc.) to iterate multiple distinct sets.

---

## 6. Coding side (just so you’re set)

In your app / CSS:

```css
.button {
  background-image: url('btn-new-topics-default.png');
}
.button:hover {
  background-image: url('btn-new-topics-hover.png');
}
.button:active {
  background-image: url('btn-new-topics-pressed.png');
}
```

Because every PNG is the same size and alignment, swapping the background image gives you clean state changes.

---

If you tell me which tool you want to anchor this in (Figma, Photoshop, Affinity, etc.), I can write you a super concrete, step-by-step checklist just for that tool – including exact export settings and a reusable prompt template for your different button sets.

---

### 👤 USER (2025-12-10T03:41:02.422Z)

If using the pure. image generation tools, Could I place blank shapes in place on the UI design reference and refer to them so that AI generates its images based on those shapes and sizes? Also how about more description about what the buttons are used for?

---

### 🤖 ASSISTANT (2025-12-10T03:41:04.900Z)

Explaining limitations with pure image generation tools for UI design
Guidance on image generation with DALL-E and Midjourney for UI design
Guidance on image generation for UI button design

---

### 🤖 ASSISTANT (2025-12-10T03:41:17.682Z)

Short answer: **yes, kind of – but with limits.**  
You can absolutely use blank shapes on the UI as “targets” for AI, and more detail about what each button *does* will help the model style them correctly. You just need two passes: one for **concept in-place**, one for **clean assets.**

---

## 1. Using blank shapes on the UI

**What works well**

1. Take your steampunk UI image (like the one you sent).
2. In a graphics tool, draw flat shapes where the buttons go:
   - Solid grey / light color.
   - Roughly the *exact* size and position you want.
3. Export that as a new image and send it to the image generator in **edit / inpainting** mode.

Prompt something like:

> “Turn each flat rectangle in this interface into a steampunk metal UI button. Match the colors, lighting and textures of the surrounding machine wall. Keep each button inside its current rectangle, don’t move or resize them, and don’t change anything else in the interface.”

This is great for:

- Seeing the buttons **in place** on the real UI.
- Letting the model respect shape, size, and layout.

**Limitations**

- Most “pure” image generators will output **one flattened image** (background + buttons).
- You can’t directly use that as separate PNGs for your app.

So treat this as the **concept/mockup stage**, not the production assets.

---

## 2. Generating separate button assets that still match

Once you like a concept:

1. Upload:
   - Your **approved mockup with buttons in place** (for style reference).
   - And/or the **bare machine wall + portal** (for palette/texture).

2. Ask the AI to generate **only the buttons**, with dimensions:

> “Generate six separate steampunk UI buttons that match the style of this interface. Each button should be 900×260 pixels on a transparent background. No text labels. One row of six buttons with equal spacing, nothing else in the image.”

Now you have:

- A sprite sheet or set of separate PNGs.
- All same size, ready to slice and use in code.

You can repeat the same prompt with small tweaks (“more ornate”, “simpler”, “round instead of rectangular”) to iterate multiple options.

---

## 3. Yes, describe what each button is used for

Adding **functional descriptions** helps a ton. It tells the model which buttons should feel “primary” vs “secondary.”

Example prompt extension:

> “There are 6 buttons:
> - ‘Record’ – **primary action**, should be the most visually prominent, glowing brass, subtle inner light.
> - ‘New Topics’ – secondary primary, same size and style as Record but slightly less bright.
> - ‘Spin the Wheel!’ – playful, feels like a mechanical lever or plunger, suggests motion.
> - ‘How to Play’ – tertiary, smaller, calmer, more informational.
> - ‘My Stories’ and ‘About Us’ – navigation buttons, simpler, like tabs or menu plates, less visual weight.
> Style all of them to look like physical controls on the same steampunk machine.”

You can also describe **states**:

> “For each button, create three visual states in rows:
> - Row 1: Default – neutral.
> - Row 2: Hover – slightly brighter edges, a soft glow.
> - Row 3: Pressed – darker center, appears pushed in, with an inner shadow.”

Now the model knows *why* each button exists and can reflect that in visual hierarchy.

---

## 4. Putting it together as a repeatable workflow

1. **Mockup pass (over UI)**  
   - Add rectangles to the UI image.
   - Use edit/inpaint with a prompt referencing shapes & button purposes.
   - Pick 1–2 favorite concepts.

2. **Production pass (separate assets)**  
   - Feed the chosen concept + bare UI as style references.
   - Generate a button sheet: 6 buttons × 3 states on transparent background, with exact sizes.
   - Slice/export individual PNGs.

3. **Iteration**  
   - To explore variants, keep the same dimensions but change adjectives:
     - “heavier rivets and gauges”
     - “simpler, flatter, more modern”
     - “round porthole buttons for the story actions, rectangular plates for nav,” etc.

If you tell me which image generator you plan to use (DALL·E, Midjourney, Canva, etc.), I can write a copy-pasteable prompt template tailored to that tool that uses your “blank shape on UI → separate assets” flow.

---

### 👤 USER (2025-12-10T03:48:01.363Z)

What is edit/inpaint?

---

### 🤖 ASSISTANT (2025-12-10T03:48:08.627Z)

“Edit / inpaint” is just AI-speak for **changing part of an existing image instead of generating a whole new one.**

### Plain English version

- **Generate** = “Make a brand new picture from my prompt.”
- **Edit / Inpaint** = “Here’s an image. I’ll mark *this area* — please replace ONLY that area with what I describe, and blend it in.”

“Inpainting” literally means *painting inside* a selected region.

---

### How it looks in practice

Most tools call it something like:

- **DALL·E** – “Edit image”
- **Midjourney** – “Vary (Region)”
- **Photoshop / Affinity** – “Generative Fill” on a selection
- **Canva** – “Edit image” → “Magic Edit” (or similar)

Typical workflow:

1. **Start with a base image**  
   Your steampunk UI with the portal.

2. **Mark the area to change**  
   - Draw rectangles where you want buttons.
   - Select those rectangles (or mask them) so only that area is editable.

3. **Give the AI a prompt**  
   > “Turn this flat rectangle into a steampunk brass button with teal patina, rivets, and a subtle glow, matching the surrounding machine wall. Keep it inside the existing shape.”

4. **AI fills in just that region**  
   - Background stays untouched.
   - The button is generated *inside* the rectangle, blended to match.

That’s inpainting.

---

### Why it’s useful for your buttons

For your interface it lets you:

- Keep your machine wall + portal exactly as-is.
- Drop in *blank shapes* where buttons go.
- Use inpainting to turn each blank shape into a styled button that already fits the lighting, texture, and perspective of your UI.

Then you can:

- Use that “buttons in place” version as a **mockup**, and  
- Generate clean, separate PNGs of the buttons (same style, exact sizes) for coding.

If you tell me which image tool you’re using most (DALL·E, Canva, Photoshop, etc.), I can walk you through the exact clicks for doing an inpaint/edit on one of your button rectangles.

---

### 🤖 ASSISTANT (2025-12-10T04:06:56.587Z)

Providing step-by-step instructions for generating button designs
Clarifying MidJourney's capabilities for image editing
Providing step-by-step prompts for creating buttons with DALL-E and MidJourney
Step-by-step for DALL-E button concept creation
Providing step-by-step prompts for button creation and export
Clarifying approach for transparent backgrounds and output efficiency
Crafting prompts for DALL-E overlays and asset sheets

---

### 🤖 ASSISTANT (2025-12-10T04:07:32.773Z)

Nice, this mockup with the grey shapes is *exactly* what we want for guiding the models. I’ll give you two concrete workflows:

1. **DALL-E in ChatGPT** – great for precise in-place edits and button sheets.  
2. **MidJourney** – great for variations / concepts you can refine and slice.

I’ll break each into:

- A. **Overlay concept** (buttons in place on this UI)  
- B. **Clean asset sheet** (separate PNGs with states)

---

## 1. DALL-E (inside ChatGPT)

### 1A. Overlay: turn the grey shapes into real buttons

**Goal:** Get a beautiful preview of Spin / New Topics / Record sitting on the real interface.

**Steps**

1. Open a new DALL-E chat (in ChatGPT’s “Create” image mode).
2. **Upload** the UI image you just sent (with the grey shapes).
3. Choose **Edit / Inpaint**:
   - Use the brush to paint over **only the three grey shapes** (circle + two rounded rectangles).  
   - Don’t touch the rest of the wall or portal.
4. Use this prompt (you can copy-paste and tweak):

> **Prompt – DALL-E UI overlay**
>  
> “Replace each grey placeholder shape in this interface with a detailed steampunk UI button. Keep the machine wall, pipes and porthole exactly as they are.
>  
> • The circular grey shape above is the **‘Spin the Wheel!’** button. Make it a round, heavy brass porthole-style button with a gear-like rim, teal patina accents, and a slightly domed surface. It should be the most visually prominent and playful button, as if it triggers the mechanical wheel.
>  
> • The two rounded rectangles at the bottom are **‘New Topics’** and **‘Record’**. Make them matching pill-shaped brass plates with teal patina edges, small rivets, and a subtle bevel so they look slightly raised off the panel. They should feel like primary controls but not as dominant as the Spin button.
>  
> Use the same color palette and lighting as the surrounding metal: weathered copper, teal verdigris, warm rust, soft warm light from upper left. Add realistic shadows where each button meets the panel so they look physically mounted. Leave the centers blank for text; do not add any labels.”

5. Generate, pick a favorite.  
6. To explore options, keep the same prompt and:
   - change adjectives: “simpler / more ornate / with small gauges,”  
   - or add “Create 3 different design options”.

Use these as **visual approvals** only; you’ll still want clean assets next.

---

### 1B. DALL-E button sheet for implementation

**Goal:** Separate graphics you can export as PNGs and swap by state.

You’ll do *two passes*: **Default** and **Pressed** (you can add Hover later).

#### Step 1 – Default state sprite sheet

1. Start a new DALL-E generation.
2. Upload the steampunk UI (or a crop) as a **style reference**, but *don’t* ask it to edit.
3. Use this prompt:

> **Prompt – DALL-E default button sheet**
>  
> “Create a high-resolution sprite sheet of **three steampunk UI buttons** on a transparent or solid neutral background.
>  
> Layout:
> • Canvas ratio about 3:1, one single row.  
> • From left to right: **New Topics**, **Record**, **Spin the Wheel!**.  
> • Each button roughly 900×260 pixels so they can be scaled down without losing detail.
>  
> Design:
> • **New Topics** and **Record**: matching pill-shaped brass plates with teal patina edges and small rivets, slightly raised with a beveled edge. They should look like solid metal buttons mounted on a machine panel.  
> • **Spin the Wheel!**: a larger circular porthole-style button with a gear-like outer rim, teal patina and brass, slightly domed. It should feel like the main trigger for the wheel and be the most visually prominent.
>  
> Style:
> • Match the colors and texture of the attached steampunk interface: weathered copper, teal verdigris, warm rust, subtle grime, and soft warm lighting from the upper left.  
> • Add realistic highlights and shadows so all three look like physical, clickable controls.  
> • Leave the centers blank for text; **do not add any labels or icons**.”

4. Download the result and, if needed, remove the background in Photoshop/Affinity so each button has transparency.
5. Slice into three PNGs: `btn-new-topics-default`, `btn-record-default`, `btn-spin-default`.

#### Step 2 – Pressed (clicked) state sheet

Repeat with a nearly identical prompt, changed to emphasize “pressed”:

> **Prompt – DALL-E pressed button sheet**
>  
> “Using the same three steampunk UI buttons as in the previous image, generate a sprite sheet that shows their **pressed state**.
>  
> • Same layout: one row, New Topics, Record, Spin the Wheel!.  
> • Same shapes, colors and materials, matching the attached reference.  
> • Each button should look **pushed in**: slightly darker center, inner shadow near the rim, reduced highlight, and a subtle shadow from the surrounding panel onto the button edge. The outer edges stay sharp but the face sits lower, as if the user is holding it down.
> • Leave the centers blank for text; no labels or icons.”

Slice those into `…-pressed` PNGs.

Later you can add a **hover** state (“slightly brighter edges, faint glow, not pressed in”) using the same pattern.

---

## 2. MidJourney

MidJourney is better for **concept variety**; you’ll still do final slicing / transparency in Photoshop.

### 2A. Overlay concept with your UI

**Steps**

1. Upload the UI-with-grey-shapes image into your MidJourney Discord channel.
2. Copy its URL (right-click → “Copy link” or open and copy).
3. Run:

```text
/imagine [paste image URL here]
steampunk user interface control panel. Keep the machine wall, pipes and circular portal identical to the reference. Replace the three grey placeholder shapes with detailed steampunk UI buttons:
– The circular shape is the “Spin the Wheel!” button: a round, heavy brass porthole-style button with a gear-like rim, teal patina accents, slightly domed, most visually prominent and playful.
– The two rounded rectangles are “New Topics” and “Record”: matching pill-shaped brass plates with teal patina edges, small rivets and a beveled, raised surface. They feel like primary controls but slightly less dominant than the Spin button.
Use the same color palette and lighting as the panel: weathered copper, teal verdigris, warm rust, soft warm light from the upper left. Leave centers blank for text, no labels or icons.
--ar 21:9 --style raw --s 150
```

4. Upscale the best option (U1–U4).
5. If MidJourney warps the background too much, try again with stronger reference weight:

```text
/describe [upload the UI] 
```

or use `--iw 1.5` to weight the image prompt more:

```text
/imagine [image URL] ...same prompt... --iw 1.5 --ar 21:9 --style raw --s 150
```

Use this mainly to get **different looks** for button shapes / ornamentation.

---

### 2B. MidJourney sprite sheet for buttons + states

MidJourney can’t do transparency, but you can export as PNG/JPG and knock out backgrounds.

**Prompt for default + pressed in one image**

```text
/imagine
sprite sheet of steampunk UI buttons on a dark neutral background.
Two rows and three columns:
Top row = default state.
Bottom row = pressed state.
Columns from left to right: “New Topics”, “Record”, “Spin the Wheel!”.
New Topics and Record are matching pill-shaped brass buttons with teal patina edges, small rivets and raised beveled surfaces.
Spin the Wheel! is a larger circular porthole-style button with a gear-like rim, teal patina and brass, the most prominent button.
Default row: buttons slightly raised with bright highlights.
Pressed row: same designs but darker centers, inner shadows, and the faces visibly pushed in, as if held down.
All buttons share the same color palette as a weathered steampunk machine: copper, teal verdigris, warm rust, soft warm lighting from upper left. Leave centers blank for text, no labels or icons.
--ar 3:2 --style raw --s 175
```

Then:

1. Upscale the cleanest version.
2. Bring it into Photoshop/Affinity.
3. Use selection tools to isolate each tile → export as PNGs.
4. Manually remove the dark neutral background per button to get transparency.

You can run variations of this prompt to explore:

- “simpler low-profile buttons”
- “with tiny gauges inset at the left edge”
- “more ornate Victorian engraving on the brass,” etc.

---

## How to iterate efficiently

- **Keep one master prompt** per model in a text doc.
- For each new “option set”, change only a few adjectives:
  - ornate vs minimal, brighter vs darker, round vs rectangular, etc.
- In DALL-E: once you have a winning style, reuse that sheet as a **reference image** in future prompts so the look stays consistent.
- In MidJourney: keep `--style raw` and moderate `--s` so it respects your structure and doesn’t over-stylize.

If you’d like, next we can design a **hover-state prompt** that keeps these exact buttons but adds just enough glow/brightness so the dev side has a clear default/hover/pressed trio.

---

### 👤 USER (2025-12-10T04:10:23.632Z)

What do you mean by the step 3 instruction? You describe a brush to paint within DALL-E.

---

### 🤖 ASSISTANT (2025-12-10T04:10:27.459Z)

Clarifying the DALL-E editing interface
Describing image editing process

---

### 🤖 ASSISTANT (2025-12-10T04:10:36.290Z)

Yeah, that was a little hand-wavy on my part—sorry about that.  
When I said “use the brush to paint,” I really just meant:

> **Tell DALL-E *which part* of the image it’s allowed to change.**

In DALL-E’s editor (inside ChatGPT) that’s done with a simple **selection / masking tool**, which *behaves* like a brush:

### How it works in practice

1. **Start an edit**
   - In ChatGPT, go to the image tab, upload your UI image (the one with the grey blobs).
   - Click **Edit** (or “Edit image”) rather than “Generate from prompt.”

2. **Select the area to edit**
   - The editor will show your image with a tool that lets you **paint over** or **highlight** areas.
   - You literally click and drag over each grey placeholder shape (circle + rectangles).
   - As you drag, that region will get a semi-transparent overlay: that’s the **mask**.
   - Anything *inside* that mask is what DALL-E is allowed to redraw; everything else is locked.

3. **Add your prompt**
   - Once those shapes are masked, you write the prompt describing the steampunk buttons.
   - DALL-E will only replace the masked bits with new button art and leave the rest of the machine wall + portal untouched.

So “use the brush to paint” = “use the masking tool in DALL-E’s edit mode to cover the grey shapes so the model knows where to draw the buttons.”

If your DALL-E UI doesn’t show an obvious “brush,” it may look like:

- “Select area to edit”
- or an **eraser/pen icon** you drag over the shapes

…but functionally it’s the same thing: define the region, then prompt.

If you’d like, I can rewrite the DALL-E instructions with zero jargon so it’s literally: “click here, then drag here, then paste this text.”

---

### 🤖 ASSISTANT (2025-12-10T04:43:22.181Z)

Planning step-by-step approach to creating button assets
Outlining a clear workflow for editing current UI buttons
Simplifying the workflow with DALL-E and Photoshop
Focusing on DALL-E without extra tools
Focusing on DALL-E steps with transparency workflow
Proposing design steps for button editing
Designing two button widths with a simple approach
Using DALL-E for hover and pressed states
Proposing a clear workflow with minimal manual steps
Simplifying the process with DALL-E and PNG transparency

---

### 🤖 ASSISTANT (2025-12-10T04:44:31.586Z)

You’re at the point where **precision matters** (pixel-aligned buttons you can wire to code), so the safest “no-error” way is:

- Let **your graphics app** (Photoshop / Affinity / etc.) control **size + cropping + transparency**  
- Let **DALL-E** only handle **styling the different states** on a cropped button image.

That keeps DALL-E from warping the whole UI or changing the proportions.

Below is a concrete recipe.

---

## Phase 0 – Isolate one pill button (and tweak height)

1. Open the image in Photoshop/Affinity.
2. Use a selection tool to select **one** pill button (including the brass rim).
3. Copy → Paste into a **new document** with a transparent background.
4. **Adjust height** here (not in DALL-E):
   - Transform / Scale vertically to make it a bit shorter (e.g. 90–95%).
   - Make sure width stays the same.
5. Save this as `button-base-default.png`.  
   This is your clean base/default state.

You’ll feed *this* cropped button to DALL-E, not the full UI.

---

## Phase 1 – Use DALL-E to make HOVER and PRESSED versions

### A. Hover state

1. In ChatGPT, go to the **image** (DALL-E) mode.
2. Upload `button-base-default.png`.
3. Choose **Edit**.
4. Use the selection brush to cover **only the central face of the button** (inside the rim). Try not to paint over the outer rim edge so DALL-E keeps it identical.
5. Use this prompt:

> **Prompt – Hover state**
>  
> “Turn this steampunk pill-shaped button into a **hover state**.  
> Keep the shape, brass rim, rivets, and overall proportions exactly the same.  
> Only adjust the lighting and subtle glow:  
> – make the button face slightly brighter,  
> – add a stronger highlight along the top edge,  
> – add a very soft teal light around the inner rim so it feels active but **not** pressed in.  
> Background must stay transparent and unchanged.  
> Do not add any text or icons.”

6. Generate; pick the cleanest result and download it as `button-hover.png`.

> If DALL-E doesn’t respect transparency in your UI, no problem: just let it render on a flat background color—you’ll strip the background out in Phase 2.

---

### B. Pressed (clicked) state

1. Start another DALL-E edit using the **same original `button-base-default.png`** as input (so geometry matches).
2. Again select only the central face.
3. Prompt:

> **Prompt – Pressed state**
>  
> “Turn this steampunk pill-shaped button into a **pressed / active click state**.  
> Keep the exact same pill shape, rim, rivets, and proportions.  
> Make the center look pushed in:
> – darken the face slightly,  
> – add a clear inner shadow around the rim,  
> – reduce the bright highlight,  
> – make it appear lower than the rim, like a physical button being held down.  
> Background must stay transparent and unchanged.  
> Do not add any text or icons.”

4. Download the best result as `button-pressed.png`.

Now you have three visual states that all started from the same base geometry.

---

## Phase 2 – Make everything truly transparent & pixel-perfect

DALL-E may give you a solid background. Clean that up once, correctly:

1. Open each of:
   - `button-base-default.png` (if you changed it)
   - `button-hover.png`
   - `button-pressed.png`
2. Use Magic Wand / Select Subject / Pen tool to select **only the button + rim**.
3. Invert selection and delete the background → you’re left with the button on full transparency.
4. Align each canvas so width/height are identical and the button sits in the exact same place (important for swapping images in code).
5. Save as:

   - `btn-pill-default.png`
   - `btn-pill-hover.png`
   - `btn-pill-pressed.png`

You can reuse this same triplet for both “NEW TOPICS” and “RECORD” by placing text in your app or overlaying text in your graphics tool.

---

## Phase 3 – Wire into your code

Example CSS:

```css
.btn-pill {
  width: 320px;         /* whatever your exported size is */
  height: 90px;
  background-image: url('btn-pill-default.png');
  background-size: cover;
}

.btn-pill:hover {
  background-image: url('btn-pill-hover.png');
}

.btn-pill:active {
  background-image: url('btn-pill-pressed.png');
}
```

(Or swap `background-image` in JS/React, etc.)

---

### Why this is the “no-error” path

- **DALL-E only edits a small, cropped button**, not the whole UI → fewer weird artifacts.
- **Height change is done manually**, so dimensions are exact.
- All three states share the original rim and geometry → they line up perfectly.
- Transparency & export are handled by your graphics app, which is precise and predictable.

If you want, next step I can give you a second pair of prompts for a *slightly* different visual style (e.g., more minimal/flat) but using the same pipeline, so you can A/B test different pill designs without changing your code.

---

### 👤 USER (2025-12-10T06:39:37.020Z)

For midjourney you have what looks like code to control it with a Run and a URL to access the reference image. SO midjourney isn't controlled through their website? With what interface do I do all of this with MidJourney?

---

### 🤖 ASSISTANT (2025-12-10T06:39:43.537Z)

Explaining MidJourney user interface

---

### 🔧 TOOL: web.run (2025-12-10T06:39:51.249Z)

```
【turn0calculator0】 2+2 = 4
```

---

### 🤖 ASSISTANT (2025-12-10T06:40:11.826Z)

Clarifying MidJourney's interface
Clarifying Slash-Commands and MJ operations
Step-by-step guide for using MidJourney

---

### 🤖 ASSISTANT (2025-12-10T06:40:24.666Z)

Totally fair question — those `/imagine` lines **aren’t code**, they’re just the text commands you type to the **MidJourney bot in Discord**.

Here’s how the whole thing actually works, step-by-step, in plain language.

---

## 1. Where MidJourney actually lives

MidJourney is used primarily through **Discord**, not a standalone website like DALL-E in ChatGPT.

You can use any of these:

- Discord in a browser: `discord.com/app`
- Discord desktop app (Mac/Windows)
- Discord mobile app

Once you’ve:

1. Created a Discord account  
2. Joined the **MidJourney server** (via invite link from their site)  
3. Have a plan that allows generations  

…you’ll see channels like `#newbies-###` or you can invite the MidJourney bot to your own private server.

That’s where you type the `/imagine` commands I wrote.

---

## 2. Using your reference image in MidJourney

Let’s anchor this on your current UI image (with the “Spin / New Topics / Record” layout).

### Step-by-step

1. **Open a MidJourney channel**  
   e.g. `#newbies-1` or a private channel with the MidJourney bot.

2. **Upload your image**
   - Drag the UI PNG/JPG into the channel and send it.
   - Discord will show it as a message with your image.

3. **Get the image into your prompt (two easy options)**

   **Option A – use the URL in the text (old-school but clear):**
   - Right-click the uploaded image → “Copy link.”
   - Start a new message:

     ```text
     /imagine
     ```

   - Discord pops up a little form with a **“prompt”** field.
   - Paste the image link at the start of the prompt field, then type your text after it.

   **Option B – use the image attachment field (newer flow):**
   - Type `/imagine` and in the slash-command UI you’ll see a field for **“image”**.
   - Click it and attach your UI image.
   - Then fill in the “prompt” field with text only (no URL needed).

4. **Add the rest of the prompt**

   Example for a button sprite sheet:

   ```text
   sprite sheet of steampunk UI buttons on a dark neutral background.
   Two rows and three columns: top row default state, bottom row pressed state.
   Columns left to right: New Topics, Record, Spin the Wheel.
   New Topics and Record are matching pill-shaped brass buttons with teal patina edges, rivets, and raised beveled faces.
   Spin the Wheel is a larger circular gear-rimmed button, most prominent.
   Colors and textures match the attached steampunk interface: weathered copper, teal verdigris, warm rust, soft warm light.
   Centers blank for text, no labels or icons.
   --ar 3:2 --style raw --s 175
   ```

   The `--ar 3:2` etc. at the end are **MidJourney parameters**, not code:
   - `--ar 3:2` → aspect ratio
   - `--style raw` → less stylized, more prompt-literal
   - `--s 175` → how “strongly” it follows the prompt

5. **Send the message**  
   MidJourney replies with a 2×2 grid of options.

6. **Upscale / vary**

   - `U1–U4` buttons under the image → upscale the corresponding option.
   - `V1–V4` → generate variations of that option.
   - On newer versions you may also see **“Vary (Region)”** → lets you select part of the upscaled image and re-render that area (similar to inpainting).

You’ll do all your MidJourney work inside this Discord chat flow.

---

## 3. How this connects to your buttons & states

Very concretely, for your pill buttons:

- **Concept art / multiple options**
  - Use `/imagine` + your UI image as style reference to generate different pill button designs & state sheets.
  - Download the one you like best.

- **Production**
  - Bring the chosen result into Photoshop/Affinity.
  - Crop / align each button.
  - Remove backgrounds and export as transparent PNGs for:
    - default
    - hover
    - pressed

MidJourney gives you the **art**, your graphics app gives you the **precision** (same size, same position, true transparency), and your **code** swaps those PNGs on hover/click.

---

If you tell me, “I’m on a Mac using Discord in the browser,” I can literally write: “click here, then here, then paste this exact text…” for one concrete MidJourney run, so you can follow it like a recipe the first time.

---

### 👤 USER (2025-12-10T06:42:59.095Z)

Is their advantage to doing it through discord VS on the MidJourney website?

---

### 🤖 ASSISTANT (2025-12-10T06:43:04.104Z)

Clarifying MidJourney platforms

---

### 🔧 TOOL: web.run (2025-12-10T06:43:07.653Z)

```
【turn1calculator0】 1+1 = 2
```

---

### 🤖 ASSISTANT (2025-12-10T06:43:07.813Z)

Short version: **functionally they’re almost the same now**, but there are some trade-offs. If you’re already comfy in Discord, staying there is fine; the web app can feel cleaner for focused work.

Here’s the breakdown.

---

## How MidJourney actually works now

- **The “engine” is the same** whether you use Discord or the MidJourney website.
- Prompts, parameters (`--ar`, `--style raw`, etc.), models, and quality are identical.
- Your generations sync between both: what you make in Discord shows up on the website gallery and vice versa (as long as it’s the same account).

---

## Advantages of Discord

1. **Lower friction once you’re used to it**
   - Quick `/imagine` commands.
   - Easy to paste image URLs, reuse prompts, etc.
2. **Interactive buttons**
   - U1–U4, V1–V4, “Vary (Region)” are right under the image; fast to explore variations.
3. **Community & discovery**
   - See other people’s prompts/results in real time.
   - Great for learning new prompt tricks and parameters.
4. **Works everywhere Discord does**
   - Same experience on desktop, browser, and mobile.

---

## Advantages of the MidJourney website

1. **Cleaner, less noisy**
   - No chat stream flying by while you’re trying to work.
   - Feels more like a design tool / gallery than a chatroom.
2. **Better gallery management**
   - Easier to browse your own images, search, and organize.
   - Nice for reviewing sets of button variations or UI concepts side-by-side.
3. **Nicer for client-facing / presentation**
   - If you’re screen-sharing or reviewing art with someone, the website looks more “app-like” and less chaotic than Discord.

---

## For your specific use case (UI buttons + multiple states)

You care about:

- Consistency of style with your existing UI
- Iterating variants quickly
- Being able to download and crop precisely in Photoshop/Affinity

For that, the **differences are mostly UX, not capability**:

- **Discord** is slightly faster for:
  - Rapid fire prompt tweaks.
  - Using “Vary (Region)” on specific button areas.

- **Website** is slightly better for:
  - Reviewing multiple button sets and picking a winner.
  - Keeping a clean visual history of “Set 1 / Set 2 / Set 3”.

Most people who do UI work end up doing this:

- **Prompt and iterate in Discord** (fast).
- **Curate and download from the website gallery** (organized, easy to find).

You don’t *have* to pick one or the other permanently; they’re really two doors into the same room.

If you tell me which one you feel more drawn to right now, I can tailor the “button-state sprite sheet” instructions specifically for that interface so you can follow a single, concrete workflow.

---

### 👤 USER (2025-12-10T06:44:20.898Z)

I'm going to use the website then. Please write me a perfect prompt to feed midjourney in that interface.

---

### 🤖 ASSISTANT (2025-12-10T06:44:26.700Z)

Clarifying perfect prompt for MidJourney
Creating a perfect prompt for MidJourney
Designing the perfect prompt for sprite sheet creation
Creating prompt for sprite sheet generation
Designing the sprite sheet prompt

---

### 🤖 ASSISTANT (2025-12-10T06:45:07.096Z)

Great, using the website makes this pretty straightforward.  
Here’s exactly how to do it **and** the prompt you can paste.

---

## How to set it up on the MidJourney website

1. Go to the **MidJourney web app** and make sure you’re logged in.
2. Click **Create** (or the prompt bar).
3. Click the little **image icon** and **upload a crop of one pill button** you like  
   (just the button + rim on a bit of background, not the whole UI).  
   > This image becomes the style & material reference.
4. In the text prompt field, paste the prompt below (after the image is attached).
5. Hit **Generate**.

You’ll get a wide image with a row of three states you can later crop & clean in Photoshop/Affinity.

---

## Prompt to paste into MidJourney

```text
sprite sheet for a single steampunk UI button with three interaction states, matching the attached reference button exactly in material and style.

Layout:
one horizontal row of three frames on a dark neutral background. Each frame shows the same pill-shaped brass button from the front, centered, same size and proportions, slightly shorter and more streamlined in height than the reference. Left frame = default, middle frame = hover, right frame = pressed.

Style:
weathered brass with teal verdigris patina, small rivets along the edge, subtle bevel, soft warm light from above, realistic metal reflections and shadows. The button should look like it belongs on the same machine wall as the reference UI.

States:
• Default (left): neutral lighting, raised slightly above the panel, clear highlight along the top edge, no glow.  
• Hover (middle): same geometry, but slightly brighter overall; stronger highlight along the top edge; a very soft teal inner glow near the rim so it feels active but not pressed in.  
• Pressed (right): same geometry, but the face appears pushed in; darker center; a clear inner shadow around the rim; reduced highlight, like a physical button being held down.

Centers must be blank, with no text or icons. Keep all three buttons perfectly aligned and identical in size so they can be sliced into separate UI assets later.

--ar 3:1 --style raw --stylize 175
```

---

### What to do after generation

1. Download the best image.
2. In Photoshop/Affinity:
   - Crop each frame into its own file (left/middle/right).
   - Remove the dark background so only the button is fully transparent.
   - Make sure all three canvases are the **same width & height** with the button in the same position.
3. Export as:
   - `btn-pill-default.png`
   - `btn-pill-hover.png`
   - `btn-pill-pressed.png`

Those three PNGs can now be swapped in your app for the bottom pill-shaped buttons (`New Topics`, `Record`) just by changing the image on hover/click.

---

### 👤 USER (2025-12-10T06:48:24.817Z)

I can't upload the full interface with the blank button areas and have it generate on top of that in place of the placeholder grey blank no style buttons?

---

### 🤖 ASSISTANT (2025-12-10T06:48:29.952Z)

Explaining MidJourney web capabilities

---

### 🔧 TOOL: web.run (2025-12-10T06:48:35.761Z)

```
【turn2calculator0】 1+1 = 2
```

---

### 🤖 ASSISTANT (2025-12-10T06:48:48.931Z)

Clarifying MJ web and user request
Explaining MJ limitations for UI editing
Clarifying MJ vs DALL-E for UI integration

---

### 🤖 ASSISTANT (2025-12-10T06:49:05.892Z)

Great question, and this is exactly the subtle place where MidJourney and DALL-E behave differently.

### Short answer  
- **DALL-E** = yes, true *edit-in-place* on your exact interface (what you just did with the bottom pills).  
- **MidJourney (even on the website)** = **not reliably**. You can *influence* it with your full UI image, but you can’t tell it “only change these grey areas, leave literally every other pixel untouched” the way you can with DALL-E or Photoshop.

So if you need a **no-surprises, drop-it-right-on-top** version of your existing UI, MidJourney is *not* the right tool. Use:

- DALL-E “Edit” (what you already did), or  
- Photoshop / Affinity “Generative Fill” on the grey shapes.

---

### What MidJourney *can* do with the full interface

On the MidJourney **website**:

1. You can upload the **entire UI with grey placeholders** as an image prompt.
2. Then you prompt something like:
   > “Make the grey placeholder bars into steampunk brass pill buttons with teal patina, leave the rest of the interface very similar.”
3. MJ will generate **a new image inspired by that UI** – but:
   - It may slightly change textures, screws, contrast, proportions, etc.
   - There’s no hard boundary that says “only touch these grey areas.”
4. If you upscale one result, you can use **Vary (Region)** to redraw just the bottom area again – but that’s still editing MJ’s version of your UI, not your original pixel-perfect file.

And whatever comes out is **one flattened image**, not separate button assets.

So MidJourney is great here for:

- Exploring *different design ideas* for how those pill buttons might look.
- Getting inspiration you then match more precisely in DALL-E or Photoshop.

But it’s not the no-error “fill the grey shapes on my production UI file and give me clean PNGs” tool. That’s exactly where DALL-E + your graphics app shines.

---

### Recommended pipeline for what you want

Given your goals:

1. **Use DALL-E (or Photoshop Generative Fill)** on the **full interface**  
   - Upload full UI with blank pills.  
   - Mask only the pill areas → generate hover/pressed states in-place.  
   - This keeps the machine wall and portal 100% unchanged.

2. **Crop each button from that edited UI** in Photoshop/Affinity  
   - Adjust height if needed.  
   - Put each state on transparent background.  
   - Export as `default / hover / pressed` PNGs for code.

3. **Use MidJourney only for experimentation**  
   - Upload the same full UI as style reference.  
   - Generate alternative button looks (more ornate, simpler, etc.).  
   - When you like a concept, replicate it with DALL-E/Photoshop on the real UI.

That way you get the **creative variety of MidJourney** without risking your production-ready layout and pixel alignment.

If you’d like, I can write you one MidJourney web prompt specifically for *concepting alternate pill styles* using the full interface as reference, and a separate DALL-E prompt for “apply that style to my real UI in place.”

---

### 👤 USER (2025-12-10T06:50:16.394Z)

Yes please

---

### 🤖 ASSISTANT (2025-12-10T06:50:18.733Z)

Helping create UI prompts for MidJourney and DALL-E
Clarifying MidJourney and DALL-E prompts for UI buttons
Drafting clear prompts for MidJourney and DALL-E
Creating MidJourney prompt for UI concept

---

### 🤖 ASSISTANT (2025-12-10T06:50:40.929Z)

Perfect, let’s lock in a clean, repeatable flow:

- **MidJourney web** → explore different pill button looks on the *full* interface (for ideas).
- **DALL-E** → apply your chosen style **in place** on the actual production UI file.

I’ll give you one copy-pasteable prompt for each, plus exactly how to use them.

---

## A. MidJourney (website) – concept alternate pill styles on full UI

### How to use this in the MidJourney web app

1. Go to the **MidJourney website** → **Create**.
2. Click the **image icon** and upload your **full UI image**  
   (the one with the portal + grey placeholder pills at the bottom).
3. In the prompt box, paste the text below.
4. Hit **Generate**.

### Prompt for MidJourney

```text
highly detailed steampunk user interface for an interactive story app, using the attached image as a style and layout reference. Keep the circular portal, machine wall, pipes and overall composition almost identical to the reference, but redesign the two large grey pill-shaped placeholder bars at the bottom into finished steampunk buttons.

The top circular control should remain a circular “Spin the Wheel!” style button in roughly the same position and size as the reference.

Transform the two bottom grey pills into fully rendered brass and copper buttons that feel like primary controls for “New Topics” and “Record”. They must:

• Stay in the same positions and sizes as the grey placeholders.
• Be pill-shaped with a streamlined height, slightly shorter than the placeholders.
• Look like real metal hardware: weathered brass with teal verdigris patina, small rivets along the edges, beveled and slightly raised off the panel.
• Match the lighting and palette of the existing panel: warm highlights, soft shadows, weathered copper, teal patina, warm rust tones.
• Have blank centers with no text or icons, so labels can be added later in code.

Create four clearly different visual treatments for these bottom buttons while keeping the rest of the interface very close to the reference: for example more ornate engraving, simpler modern plates, subtle glowing edges, or small inset gauges. The buttons should always look like they belong on the same steampunk machine.

--ar 16:9 --style raw --stylize 150
```

💡 What you do with the results:

- Use them as **style references**, not as production files.
- Pick one you love (e.g. “thin rim + teal glow + engraved face”) and **describe that look in words** for DALL-E.

---

## B. DALL-E – apply that chosen style in place on your real UI

Now you’ll use DALL-E (inside ChatGPT) to **edit only the bottom grey placeholders** on your actual UI image.

### How to run this in DALL-E

1. Open a ChatGPT image (DALL-E) chat.
2. **Upload your real UI file** (full interface with grey pill placeholders).
3. Choose **Edit**.
4. Use the brush/mask tool to paint over **only the two bottom grey pill areas**.  
   - Don’t touch the portal or machine wall.
5. Paste the prompt below and customize the bracketed part to match the MidJourney style you liked.
6. Generate and choose the cleanest result.

### Prompt for DALL-E (edit-in-place)

```text
Replace ONLY the two large grey pill-shaped placeholder bars at the bottom of this interface with finished steampunk buttons. Do not change the circular portal, the pipes, the machine wall, or any other part of the image.

The two bottom controls are the primary buttons for “New Topics” and “Record”. They must:

• Stay exactly where the grey placeholders are, with almost the same width and slightly shorter height for a more streamlined pill shape.
• Remain pill-shaped and horizontally oriented.
• Match the materials and lighting of the surrounding interface: weathered brass and copper with teal verdigris patina, subtle grime, warm highlights from above, and realistic shadows where they meet the panel.
• Look like solid metal hardware mounted on the machine: beveled edges, small rivets or screws along the rim.

Style them to match this design direction:
[briefly describe the MidJourney style you liked, e.g.
“thin polished brass rim, darker etched center with delicate steampunk engraving, faint teal glow around the inner edge, minimal but elegant.”]

Leave the centers of both buttons blank, with no text or icons, so labels can be added in the app. Keep all other parts of the interface perfectly unchanged.
```

Just replace the bracketed part with 1–2 descriptive sentences pulled from your favorite MidJourney variation.

---

### After DALL-E: extracting usable assets

Once DALL-E gives you a version with the new pill buttons:

1. Download that edited UI.
2. In Photoshop / Affinity:
   - **Duplicate** the file so you keep a master.
   - Carefully **crop each button** into its own document.
   - Put each button on a transparent background (remove any machine-wall pixels).
   - Ensure width/height are the same for both buttons and aligned consistently.
3. Export as transparent PNGs:
   - `btn-pill-default-new-topics.png`
   - `btn-pill-default-record.png`

Then you can use the earlier DALL-E “hover/pressed” workflow on these cropped buttons to generate the interaction states, all while keeping this new MidJourney-inspired style.

If you’d like, next I can help you write a tiny “style note” sentence to reuse across *all* your prompts so every new asset (hover, pressed, future buttons) stays visually consistent with the pill design you end up choosing.

---

### 👤 USER (2025-12-10T06:59:12.517Z)

How about working with DALL-E to generate options for additional button styles based on cropped out buttons I like so far? How should I go about that?

---

### 🤖 ASSISTANT (2025-12-10T06:59:14.219Z)

Providing button style workflow with DALL-E
Proposing two tracks for button style exploration
Recommending simple approaches for button style generation

---

### 🤖 ASSISTANT (2025-12-10T06:59:33.566Z)

Totally doable, and DALL-E is actually really good at “remix this thing I already like.”

Think of your cropped buttons as a **style seed**. You’ll feed that seed back into DALL-E to:

- Explore **new finishes / ornamentation**  
- Create **new shapes (still steampunk, still matching the app)**  
- Keep sizes and perspective sane so you can slice them into assets

Here’s a clean way to work.

---

## 1. Prep your “seed” button(s)

Do this in Photoshop / Affinity / etc.:

1. **Crop tightly** around a button you like (one pill at a time for now).
2. Put it on a **transparent background** if you can (or at least a solid dark neutral).
3. Save as something like `pill-style-01.png`.

Optional but powerful:  
Make a **mini style board**: a wide canvas with 2–4 of your favorite buttons (even if they’re slightly different) side-by-side. This gives DALL-E a richer sense of your palette, texture, and vibe.

---

## 2. Use DALL-E to generate *new style options* from the cropped button

### A. “Same geometry, different skins” (fast concept sheet)

Goal: one image with **several new variations** of that button.

In ChatGPT:

1. Start an image (DALL-E) chat.
2. Upload your cropped button (`pill-style-01.png`).
3. Choose **Generate** (not Edit this time).
4. Use a prompt like this:

```text
Create a high-resolution concept sheet of 4 steampunk UI button styles based on the attached pill-shaped button.

Layout:
One horizontal row of 4 buttons on a dark neutral background. Each button should have the same pill shape, proportions, and front-facing angle as the reference, and be centered in its own “slot” with a bit of spacing.

Style:
All 4 buttons must feel like they belong to the same app and match the materials of the reference: weathered brass and copper with teal verdigris patina, soft warm lighting from above, realistic metal reflections and shadows. No text or icons.

Variation:
Make each of the 4 buttons a distinct visual treatment:
• Option 1: simple, clean brass rim, subtle patina, minimal engraving.  
• Option 2: more ornate rim with extra rivets and light steampunk engraving on the face.  
• Option 3: darker, more industrial, with small inset bolts and a faint teal inner glow.  
• Option 4: thin polished rim, brighter center plate with a brushed-metal texture.

Centers must be blank so labels can be added later. Keep all buttons the same size and alignment so they can be sliced into separate assets.
```

Result: you get 4 design ideas in one go.  
You can regenerate with different adjectives (“more minimal,” “more Victorian,” etc.) to explore a bunch of looks.

---

### B. Turn one “seed” into a specific new style (controlled remix)

If you want a **single, very controlled variation** of a button you already like:

1. Upload the cropped button.
2. Choose **Edit**.
3. Mask **just the face** (not the rim, unless you *want* the rim to change).
4. Prompt something like:

```text
Restyle this button face while keeping the same pill shape, size, and perspective.

Keep:
– overall pill geometry, rim, and rivets in the same positions  
– lighting direction from above  
– steampunk brass and teal patina palette

Change:
– give the center a brushed brass texture with subtle circular grain  
– add very fine engraved steampunk patterns in the center plate  
– slightly brighter highlight along the top edge  
– keep the background transparent and do not add any text or icons
```

This is great when you like 80% of what you have and just want “more fancy rim,” “flatter center,” “darker pressed version,” etc.

---

## 3. Use your favorite variants as new style references

Once DALL-E gives you something you love:

1. Crop the winning button(s).
2. Clean the background to **true transparency**.
3. Now those become **new seeds**.

You can then:

- Use them in the **hover/pressed** prompts we’ve already outlined  
  (e.g. “Using this exact button, make a hover state with brighter edges…”)
- Or ask DALL-E for **other shapes** (tabs, square nav buttons) that “match the style of this pill button.”

Example prompt for a new shape:

```text
Using the attached pill-shaped steampunk button as a style reference, create a set of 3 matching steampunk navigation buttons in a row: one pill-shaped, one rounded rectangle, and one circular. All should share the same brass and patina materials, lighting, and general detailing style as the reference, but with slightly simpler faces for secondary navigation. Blank centers, no text or icons.
```

---

## 4. Practical workflow summary

1. **Crop & clean** a button you like → PNG (transparent if possible).
2. **Feed it to DALL-E** in Generate mode → get a **row of 3–4 new styles**.
3. Repeat until you see a few that make you go “Yes, that one.”
4. **Crop and clean** those winners.
5. Use **Edit** mode on those winners to:
   - generate hover and pressed states, or  
   - do subtle refinements (less patina, more glow, etc.).

If you tell me which specific cropped button you want to start from (e.g. “the new bottom pills we just made with DALL-E”), I can write one hyper-specific prompt that says “keep exactly this rim, change only the center to 3 different style options,” tailored to that asset.

---

### 🤖 ASSISTANT (2025-12-10T07:24:56.884Z)

Giving step-by-step DALL-E instructions for hover and click states

---

### 🤖 ASSISTANT (2025-12-10T07:25:10.855Z)

Nice choice—that pill looks great.  
Here’s exactly how to turn **that** PNG into hover + click states with DALL-E, with copy-pasteable prompts.

---

## 1. Prep (one-time)

1. Open a new **ChatGPT → Create → Image (DALL-E)** chat.
2. Upload this pill button PNG.
3. Click **Edit** on the uploaded image.
4. In the editor, use the brush to paint over **only the inner brass face** of the button  
   (avoid the outer teal/brass rim if you want it unchanged).

You’ll do this twice: once for **hover**, once for **pressed**.

---

## 2. Hover state prompt

With the inner face masked:

```text
Turn this button into a HOVER state while keeping the same shape, size, rim and rivets.

Keep:
– overall pill geometry and proportions
– the outer teal and brass rim exactly as it is
– the same lighting direction from above

Change only the inner brass face:
– make it slightly brighter overall
– add a stronger highlight along the top edge
– add a very soft, subtle teal glow just inside the rim so it feels active but not pressed in
– keep texture as brushed / slightly weathered metal

Do not add any text, icons, or symbols. Background should remain transparent or a flat solid color behind the button only; do not change the canvas size.
```

Generate, pick the cleanest one, and download as e.g. `button-hover.png`.

> If DALL-E doesn’t respect transparency and gives a flat background color, no worries—you can magic-wand that out in Photoshop/Affinity later.

---

## 3. Click / pressed state prompt

Start another **Edit** using the **original** default button again (not the hover version), mask the inner face the same way, and paste:

```text
Turn this button into a PRESSED / CLICKED state while keeping the same shape, size, rim and rivets.

Keep:
– overall pill geometry and proportions
– the outer teal and brass rim in the exact same position
– the same lighting direction from above

Change only the inner brass face so it looks physically pushed in:
– darken the center slightly
– add a clear inner shadow all around the rim so the face appears lower than the rim
– soften and reduce the bright highlight
– add a subtle shadow cast from the rim onto the inner face

The button should feel like it is being held down, but still clearly readable and not too dark.

Do not add any text, icons, or symbols. Background should remain transparent or a flat solid color behind the button only; do not change the canvas size.
```

Download the best result as `button-pressed.png`.

---

## 4. Quick cleanup checklist

In Photoshop/Affinity for all three:

- Ensure **all canvases are the same width/height**.
- The button is in **exactly the same position** in each file.
- Remove any solid background so each is a true transparent PNG.

Then you can wire them up:

- default → `btn-pill-default.png`
- hover → `btn-pill-hover.png`
- active/click → `btn-pill-pressed.png`

If you want, I can now give you a second set of prompts that generate **three states at once** (in a single horizontal strip) from this same button, so you get a ready-made sprite sheet too.

---

