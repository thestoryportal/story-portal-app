# Button press effect

**Created:** 2025-12-11T17:25:18.294Z
**Updated:** 2025-12-11T17:52:52.876Z
**Messages:** 6

---

### 🤖 ASSISTANT (2025-12-11T17:26:07.253Z)

Explaining how to create a "pressed" button effect in Affinity
Creating a "pressed" button effect with non-destructive Layer FX
Creating "pressed" effect with Inner Shadow and Bevel/Emboss
Steps for creating a pressed state in Affinity

---

### 🤖 ASSISTANT (2025-12-11T17:26:57.361Z)

Creating a "pressed" effect in Affinity using Bevel/Emboss
Steps for creating a "pressed" button effect
Steps to create "pressed" effect in Affinity Photo/Designer
Creating the "Pressed" effect in Affinity:

---

### 🤖 ASSISTANT (2025-12-11T17:26:57.241Z)

Short answer: make a second “pressed” version where only the inner brass plate is nudged down a bit and its lighting is flipped so it looks sunken.

Here’s a clean way to do it in Affinity (Photo or Designer):

---

### 1. Set up two states
1. Open your PNG in Affinity.  
2. Duplicate the button layer: **Cmd+J / Ctrl+J**.  
   - Name one layer `Button – Normal`.  
   - Name the copy `Button – Pressed`.

You’ll edit only `Button – Pressed`.

---

### 2. Isolate the inner brass plate

On `Button – Pressed`:

1. Choose the **Selection Brush Tool**.
2. With *Add* mode on, paint over just the inner brass area (avoid the teal/brass rim).
3. Use **Refine…** if needed to clean edges.
4. When you’re happy with the selection, press **Cmd+J / Ctrl+J** again.  

Now you have a new layer containing only the inner brass plate (call it `Brass Plate`) sitting above the full button. The underlying full button layer will act as the “housing” / rim.

---

### 3. Make it look pressed in

Select the `Brass Plate` layer and:

#### a) Nudge it down
- Use the arrow keys to move it **2–3 px down** (and optionally 1 px to the right).  
This alone gives a surprisingly convincing “pressed” feel.

#### b) Add a sunken bevel
1. Click the little **fx** icon on the `Brass Plate` layer to open **Layer Effects**.
2. Enable **Bevel / Emboss**:
   - Type: **Inner**  
   - Style: **Emboss** or **Inner Bevel**
   - Radius/Size: small (2–4 px, just enough to catch the edges)
   - Depth: ~20–40%
   - Set the light so the **top edge is darker and bottom edge lighter** (reverse of a raised button):
     - Light angle similar to your original (top-left), but choose a concave/“down” profile so the highlight sits along the **bottom** edge and shadow along the **top**.

This flips the perceived depth so the plate looks sunken.

#### c) Add an inner shadow
Still in Layer Effects:

1. Enable **Inner Shadow**.
2. Angle: from **top-left** (same direction as scene lighting).
3. Offset: ~2–3 px  
4. Radius: ~4–6 px  
5. Opacity: ~40–60%

This slightly darkens the edges near the rim and strengthens the “recessed” look.

#### d) Slight overall darkening (optional)
- Add an **Adjustment Layer → Curves** or **Brightness/Contrast** clipped to `Brass Plate`, and darken it a tiny bit.  
Pressed buttons usually look a touch less bright.

---

### 4. Export the two states

1. Turn on `Button – Normal` and hide `Button – Pressed` → **Export** as `button_default.png`.
2. Turn off `Button – Normal` and show `Button – Pressed` (with its `Brass Plate` edits) → **Export** as `button_pressed.png`.

In your app, you’ll just swap to `button_pressed.png` (or use it for `:active` state) when the user clicks.

---

If you tell me whether you’re in **Affinity Photo or Designer**, I can tweak this into exact menu names and even propose example values tailored to your specific file.

---

### 👤 USER (2025-12-11T17:51:49.175Z)

I'm wanting to create the effect that just a portion of the raised emboss button is being pressed in, like pushing on a pillow where the portion pushed depresses and the surrounding area remains raised.

---

### 🤖 ASSISTANT (2025-12-11T17:51:52.821Z)

Explaining localized depression effect in Affinity
Providing workflow for button indentation effect
Steps for creating a localized depression effect
Techniques for creating a raised ring effect
Creating pillow-style partial depression in Affinity

---

### 🤖 ASSISTANT (2025-12-11T17:52:26.107Z)

Nice, you’re talking about a **local press** instead of the whole plate moving—totally doable, you just have to fake the “pillow dent” with a mask + inverted lighting.

I’ll describe a way that works in **Affinity Photo or Designer**.

---

## Concept

- The existing brass plate = raised.
- You create a **second brass layer** that only exists in a soft oval where the press happens.
- On that oval you flip the shading (concave bevel + inner shadow), so it looks like it’s pushed in.
- The outer brass and rim stay exactly as they are.

---

## Step-by-step: “pillow press” in Affinity

### 1. Isolate the brass plate (once)

1. Open the button in Affinity.
2. Duplicate the layer (**Cmd/Ctrl + J**) → name it `Button – Base`.
3. On `Button – Base`, use the **Selection Brush Tool** (or Pen Tool) to select ONLY the inner brass area.
4. With the selection active, press **Cmd/Ctrl + J** again.  
   - Rename this new layer `Brass – Full`.
   - This is the full inner brass plate, separated from the teal rim.

You’ll use `Brass – Full` for both normal and pressed states.

---

### 2. Create a “pressed zone” layer

1. Duplicate `Brass – Full` → name the copy `Brass – PressedZone`.
2. On `Brass – PressedZone`, make an **elliptical selection** where the finger press should be (roughly central, or wherever you want).
3. **Feather** the selection heavily so it blends nicely:  
   - `Select → Feather…` (try 20–50 px depending on your image size).
4. With that soft selection active, choose  
   `Layer → New Mask Layer`.  

Now `Brass – PressedZone` only shows up inside that soft oval.

You should have:

- `Brass – Full` (whole plate, still raised)
- above it, `Brass – PressedZone` (same texture, but only in a soft oval where the dent will be)

---

### 3. Make that zone look pressed in

Select **`Brass – PressedZone`** and click the **fx** icon for Layer Effects:

#### a) Invert the bevel (make it concave)

1. Enable **Bevel / Emboss**:
   - Type: **Inner**
   - Style: **Emboss** or **Inner Bevel**
   - Radius: smallish (2–5 px)
   - Depth: ~20–40%
2. Under **Profile** / **Contour**, choose a concave / “pillow” shape if available, or tweak so:
   - **Top edge is slightly darker**,  
   - **Bottom edge slightly lighter**,  
   matching the original light (which is roughly from above/above-left).

This flips the shading inside the oval so it reads as **sunken**, while `Brass – Full` still reads as raised.

#### b) Add an inner shadow

1. Still in Layer Effects, enable **Inner Shadow**:
   - Angle: from the light direction (likely top-left, so ~135° or so)
   - Offset: 2–4 px
   - Radius: 4–8 px
   - Opacity: ~40–60%

This darkens the “upper” rim of the dent, enhancing the impression that the surface dips inward.

#### c) Slight positional nudge (tiny but effective)

With `Brass – PressedZone` still selected:

- Nudge it **1–2 px downward** (and optionally 1 px toward the light direction).  

It’s subtle, but it sells the idea that the material actually moved.

---

### 4. Option: add a tiny raised ring around the dent

If you want that extra “pillow edge”:

1. Duplicate `Brass – PressedZone` → name it `Press Rim`.
2. On `Press Rim`, **expand** the mask slightly:
   - Select the mask thumbnail,  
   - `Select → Select Object`, then  
   - `Select → Grow/Shrink…` (+2–3 px), then  
   - `Layer → New Mask Layer` (to update).
3. Slightly **brighten** `Press Rim` (Curves or Brightness/Contrast) so it’s just a hair lighter than the surrounding plate.

Now you’ve got a soft, slightly raised halo around the depressed area—exactly like a thumb pushed into a padded surface.

---

### 5. Build your states

- **Normal state:** show only `Brass – Full` + rim.
- **Pressed state:** show `Brass – Full` + `Brass – PressedZone` (and optional `Press Rim`).

Export those as separate PNGs and swap them in your app on `:active`/mousedown.

---

If you’d like, you can send another screenshot after you try this and I can suggest exact bevel/inner-shadow values to tweak the depth until it feels perfectly “pillow-y.”

---

