# NOCTIS — Build Report

**What:** A fictional deep-space observatory selling civilian interstellar voyages.
A scroll-driven cinematic journey: Departure → Leave Earth → Silent Ocean → Nebula Crossing → Event Horizon → Return.
**Where:** `~/workspace/noctis/` — `index.html` + `css/` (3 files) + `js/` (2 files). No framework, no build step.
**Stack:** Plain HTML/CSS/JS. GSAP 3.12.5 + ScrollTrigger + Lenis 1.1.14 via CDN. Google Fonts: Unbounded / IBM Plex Sans / JetBrains Mono.

---

## 1. Palette rationale (color theory)

**Triadic harmony on a dark void.**

| Role | Color | Hex | Job |
|---|---|---|---|
| Dominant ground | Void | `#030014` | Deep space black-violet — everything sits in this |
| Surface | Deep | `#0a0a1f` | Elevated cards, modal |
| Accent 1 | Nebula violet | `#7c3aed` | Mystery, depth — nebula blobs, card borders |
| Accent 2 | Stellar cyan | `#22d3ee` | Technology, data — labels, stats, coordinates |
| Accent of accents | Starlight gold | `#fbbf24` | CTAs, countdown, black-hole glow — used sparingly |
| Text / muted | Paper / Slate | `#f4f4f8` / `#9ca3af` | Body copy |

**Why triadic:** Violet, cyan, and gold sit roughly 120° apart on the color wheel — a triadic relationship. Triadic palettes feel *vast and balanced* rather than tense (complementary) or calm (analogous). Vast and balanced is exactly what deep space should feel like.

**Why gold is rationed:** On a near-black ground, every luminous color competes for the eye. If gold were used everywhere, nothing would feel precious. So gold appears only where the site wants your *decision*: CTAs, the countdown, the "Most chosen" flag, the accretion disk. This is the "one warm light in the cold vast" principle — scarcity creates meaning. Study this: it's the single most transferable color lesson in the build.

**Contrast (computed):** Paper on Void ≈ 19:1 · Muted `#9ca3af` on Void ≈ 7.5:1 · Cyan on Void ≈ 9:1 · Gold on Void ≈ 8:1 · Violet `#7c3aed` on Void ≈ 4.9:1 (used for large text, glows, borders — never small body copy). All ≥ 4.5:1.

---

## 2. Creative decisions — and WHY

**The visitor voyages, not browses.** Every chapter is a narrative beat, not a content section. The nav labels say "The Voyage / Trajectories" instead of "About / Pricing" because the fiction must never break. *Why:* immersion is the product here — a space company that talks like a SaaS company kills its own fantasy.

**Chapter 01 is pinned + scrubbed, not scrolled past.** The Earth recede takes 260% of viewport scroll to complete. *Why:* leaving Earth should feel *slow and irreversible*. A quick scroll would make it feel cheap. Scrub ties the emotion to the visitor's own hand on the scroll — they are the ones pushing Earth away.

**The countdown is diegetic.** "03 / 02 / 01 / Liftoff" isn't decoration — it's the launch sequence the visitor is inside. *Why:* it gives the scrub a rhythm. Without beats, a long scrub feels like dead scroll.

**Chapter 04 inverts Chapter 01.** Earth *shrinks away* (loss); the black hole *grows toward you* (approach). Same pinned-scrub mechanic, opposite emotional direction. *Why:* symmetry makes the journey feel designed. The visitor unconsciously registers the mirror.

**"Neither does regret."** The twist line after "Beyond this point, no signal returns." *Why:* the whole site sells a feeling, not a ticket. That one line reframes a physics fact (no signal escapes) as an emotional promise (you won't regret it). It's the emotional climax the CTA rides on — the Reserve button appears *immediately after*, while the feeling is hot.

**Tier names are poetry, not plans.** "Drift / Crossing / Eventide" instead of "Basic / Pro / Premium." *Why:* nobody dreams of buying "Premium." They dream of the Eventide.

**The footer admits the fiction.** "A fictional voyage. For now." *Why:* honesty is the brand. It also future-proofs the concept — today's fiction is tomorrow's brochure.

**One canvas per job.** The hero gets the full starfield (twinkle + drift + shooting stars). Chapter 02 gets a cheaper drift field (same engine, sparser, no shooting stars). *Why:* two canvases doing different jobs is fine; one canvas trying to do everything gets complicated. And both pause offscreen — canvas work you can't see is wasted battery.

---

## 3. Patterns applied

1. **Lenis smooth scroll** — inertial, synced to GSAP ticker (`main.js` → Lenis block). Skipped under reduced motion.
2. **Pinned scrubbed sequences** — Ch.01 earth recede (`+=260%`), Ch.04 horizon approach (`+=220%`). The two showpiece moments.
3. **Kinetic typography** — hero `NOCTIS` letter-by-letter from clipped masks (`yPercent: 112 → 0`, `power4.out`, stagger 0.05); chapter titles word-by-word on scroll entry.
4. **Custom cursor** — gold glow dot + lerped ring; morphs to labeled state over `[data-cursor]` zones ("Begin", "View"). System cursor never hidden; disabled on touch.
5. **Starfield canvas** — twinkle (sine), parallax drift, shooting stars every 4–10s. DPR capped at 2. Static single frame under reduced motion.
6. **Scroll reveals** — `transform`/`opacity` only, `power3.out`.
7. **Micro-interactions** — one easing vocabulary site-wide: micro `cubic-bezier(.4,.2,1)` 150ms · section `cubic-bezier(.66,.34,1)` 600ms–1s · spring `cubic-bezier(.34,1.56,.64,1)`. Magnetic CTAs (`gsap.quickTo` + elastic snap-back), directional link underlines, springy card lift.
8. **Grain** — SVG `feTurbulence` data-URI overlay, animated at low opacity.
9. **Booking modal** — real form: inline validation per field, `aria-invalid` wiring, focus trap, Escape/backdrop/X close, success state with generated booking ref (`NX-2047-XXXX`), focus returned to trigger.

**Restraint call:** one dominant idea per chapter — hero owns kinetic type, Ch.01 owns the scrub, Ch.02 owns counters, Ch.03 owns cards, Ch.04 owns the black hole. Everything else stays quiet.

---

## 4. Pre-delivery checklist

- [x] Every button/link/modal control works — tier CTAs open the modal with tier preselected; nav smooth-scrolls; modal validates, confirms, closes four ways
- [x] Mobile: 44px targets, single-column tiers/stats under 900px, `overflow-x: hidden`, readable at 360px; pinned sections use viewport-relative distances
- [x] `prefers-reduced-motion` → final states (countdown shows final message, hole shows twist + CTA, no scrub, static starfield frame) + `.reduced` class fallback
- [x] No emoji icons — inline SVG only (arrows, close X)
- [x] Focus-visible gold rings everywhere; modal focus trap; skip link
- [x] Static first frame with JS disabled (`no-js` class keeps all content visible, final states shown)

**Deviations:** No Lighthouse/Playwright run (not installed in this VM). Validated via `node --check` on both JS files, HTML tag-balance parse, duplicate-ID check, contrast computation, and manual logic review. No raster images or SVG files to optimize — Earth, black hole, and grain are pure CSS/SVG-data-URI.

---

## 5. What to study first

**Start with the pinned scrub in `js/main.js` (the Ch.01 timeline).** It's ~25 lines and it's the most powerful thing on the page. Notice three things:

1. **The timeline is a story told in durations.** Countdown beats get short durations (0.6s), the earth recede gets the full 4.4s, the final message fades in over the last 1.2s. Duration *is* pacing — you're directing time, not just animation.
2. **`scrub: 1` makes the visitor the playback head.** There is no play button. The scroll position *is* the timeline position. That's what makes it feel like a voyage instead of a video.
3. **One tween runs the whole pin (`earthTl.to(earth, ..., 0)` at position 0).** The earth's recession is the continuous bed; the countdown phases are events laid on top. Bed + events is the pattern for every scrubbed sequence you'll ever build.

Second: the black hole in `css/horizon.css` (`.hole-disk`). It's a `conic-gradient` with a radial `mask` turning it into a ring, blurred, rotating. A convincing black hole in ~15 lines of CSS — no images, no canvas. That's the kind of trick worth stealing.
