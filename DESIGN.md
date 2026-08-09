# Design System Strategy: The Monochromatic Gallery

## 1. Overview & Creative North Star: "The Digital Curator"
The Creative North Star for this design system is **The Digital Curator**. This is not a template; it is a high-end editorial experience designed to showcase work through the lens of a premium art gallery. It leverages the "Power of Absence"—where the absence of color and the abundance of negative space command the user’s focus toward the content itself.

The system breaks the "generic web" look by utilizing intentional asymmetry and a rigid adherence to monochromatic tonal depth. By stripping away hue, we rely on contrast, sophisticated layering, and the Manrope typeface to provide an authoritative, professional voice. The goal is a UI that feels "quiet" but "heavy," using bold blacks and ethereal grays to create a sense of permanence and prestige.

---

## 2. Colors: Tonal Architecture
We move beyond flat hex codes to an architectural approach. The palette is strictly monochromatic, using light and shadow to define boundaries.

### The "No-Line" Rule
Traditional 1px solid borders are strictly prohibited for sectioning. Use **Surface Hierarchy** to define transition. To separate a hero from a project grid, transition from `surface` (#f9f9f9) to `surface_container_low` (#f3f3f3). Contrast is our divider, not a stroke.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, fine-art papers.
*   **Base:** `surface` (#f9f9f9).
*   **Sectioning:** `surface_container` (#eeeeee).
*   **Interaction Cards:** `surface_container_lowest` (#ffffff) to provide a "pop" against the off-white backgrounds.
*   **Emphasis:** `primary` (#000000) for high-impact calls to action.

### The "Glass & Gradient" Rule
While the palette is flat, the execution should not be. Use semi-transparent variants of `surface_container_highest` (#e2e2e2) with a `backdrop-blur` of 20px for navigation bars or floating overlays. For main CTAs, use a subtle linear gradient from `primary` (#000000) to `primary_container` (#3b3b3b) at a 45-degree angle to add "soul" and depth to the black.

---

## 3. Typography: Editorial Authority
We utilize **Manrope** exclusively. Its geometric yet humanist qualities provide the "Modern Professional" look required.

*   **Display (lg/md):** Use `display-lg` (3.5rem) for portfolio project titles. Letter-spacing should be set to `-0.02em` to create a tight, editorial feel.
*   **Headlines:** `headline-lg` (2rem) serves as the primary anchor for section headers. Always pair these with generous top margin (Space `16` or `20`) to let the typography breathe.
*   **Titles:** `title-lg` (1.375rem) should be used for card headings and sub-sections.
*   **Body:** `body-lg` (1rem) is the workhorse. Ensure a line-height of 1.6 to maintain readability against high-contrast backgrounds.
*   **Labels:** `label-sm` (0.6875rem) in `all-caps` with `+0.05em` letter-spacing. Use these for metadata (e.g., "YEAR / 2024") to create a technical, curated aesthetic.

---

## 4. Elevation & Depth: Tonal Layering
In this design system, "elevation" is a feeling, not a drop-shadow effect.

### The Layering Principle
Depth is achieved by stacking. A `surface_container_lowest` (#ffffff) card sitting on a `surface_container_low` (#f3f3f3) background creates a sophisticated "lift" that feels integrated into the page rather than floating above it.

### Ambient Shadows
Shadows must be invisible until noticed.
*   **Token:** Use `on_surface` (#1b1b1b) at 4% opacity.
*   **Setting:** `0px 20px 40px`. The large blur ensures a soft, natural diffusion of light, mimicking a high-end gallery spotlight.

### The "Ghost Border" Fallback
If a container requires a border for accessibility (e.g., input fields), use a **Ghost Border**.
*   **Token:** `outline_variant` (#c6c6c6) at 20% opacity.
*   **Rule:** Never use 100% opaque borders; they interrupt the flow of negative space.

---

## 5. Components: Minimalist Primitives

### Buttons
*   **Primary:** Solid `primary` (#000000) with `on_primary` (#e2e2e2) text. Square-ish corners (`sm`: 0.125rem) to maintain a professional edge.
*   **Secondary:** `surface_container_highest` (#e2e2e2) background with `on_surface` text. No border.
*   **Tertiary:** Ghost style. Underlined text using `body-md`, where the underline is the `outline` (#777777) token with 2px offset.

### Cards & Project Items
*   **Rule:** No dividers. Use Spacing `8` (2.75rem) to separate content blocks.
*   **Hover State:** Shift background from `surface_container_lowest` to `surface_container_high` (#e8e8e8) with a 300ms ease-out transition.

### Input Fields
*   **Style:** Minimalist underline style. Use `outline_variant` (#c6c6c6) for the bottom border only. On focus, transition the border color to `primary` (#000000) and animate the label to `label-sm`.

### Portfolio Chips
*   **Selection:** Small, pill-shaped (`full` roundedness) using `secondary_container` (#d4d4d4). These should be tiny and unobtrusive, acting as footnotes to the content.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace Asymmetry:** Align text to the left but place images with varying offsets to create a dynamic, editorial rhythm.
*   **Use Massive Negative Space:** If you think there is enough space, add 20% more. Space `24` (8.5rem) is your friend for separating major portfolio case studies.
*   **High Contrast:** Use `primary` (#000000) text on `surface` (#f9f9f9) for maximum "ink-on-paper" impact.

### Don't:
*   **No Dividers:** Never use a horizontal rule `<hr>` to separate content. Use a background color shift or a large jump in the Spacing Scale.
*   **No Generic Grays:** Avoid middle-of-the-road grays. Stick to the extremes (very light or very dark) to maintain the high-contrast professional aesthetic.
*   **No Default Radii:** Avoid the "bubbly" look. Use `sm` (0.125rem) or `none` (0px) for a sharp, architectural feel. Reserve `full` only for functional chips.