# Anukriti Odyssey visual system

## Purpose

Anukriti turns a one-time piece of browser or desktop work into a safe, repeatable job. The visual language treats that as an **earned route**, not an opaque automation trick: the user charts a route, inspects its log, rehearses it visibly, and keeps the proof.

The historical touch is intentionally original and generic. It draws on the ideas of an ancient sea voyage, a bronze helm, laurel, parchment, and night sea. It does not use, copy, or imply an affiliation with *Troy*, *The Odyssey*, a film, a game, a sports tournament, a club, or a real person.

## Brand mark

`public/brand/anukriti-odyssey-mark.svg` is an original vector crest:

- midnight sea — focused, safe automation;
- bronze helmet — thoughtful protection and human responsibility;
- laurel — earned evidence, not vanity metrics;
- star and horizon — a known starting point and destination.

It is a local SVG, so it adds no remote asset, cookie, runtime API key, or user-data transfer. The mark is used in the sign-in experience, navigation, and the pause assistant.

## Design principles

1. **Immersion must not hide control.** The main actions retain clear, literal labels such as “Create browser job,” “Visible browser,” “Background,” and “Download proof report.”
2. **Progress is earned from evidence.** Voyage checkpoints only advance after actual saved capture, repeatability checks, a visible rehearsal, and run history. They are not points, streaks, or time-on-screen rewards.
3. **Make safety feel first-class.** Bronze primary controls contrast with parchment surfaces; blocked and risky states remain explicit, readable, and distinct from a success state.
4. **One visual language across every route.** Browser recording, Numbers research, resume tailoring, back-office proof, run results, and library cards share navy, parchment, bronze, laurel, and gold tokens.
5. **Keep it accessible.** Keyboard focus has a high-contrast gold outline, hover lift is reduced when the operating system requests reduced motion, and the logo is decorative where visible text already names Anukriti.

## Gamified, but trustworthy

| Experience | User-facing framing | Concrete evidence required |
| --- | --- | --- |
| First-use guide | First voyage | A saved job exists |
| Job timeline | Voyage progress | Capture, safety check, visible replay, and run result |
| Wait assistant | Aegis Guide | An actual selected Playwright timeout after a specific recorded step |
| Run results | Proof | A persisted execution-proof result, mode, version fingerprint, history entry, and collapsed sanitized technical log |

The theme never suggests that a job worked when it did not. A failed job, unsafe capture, or unconfirmed risky action remains blocked and visible.

## Implementation map

- `src/achilles-theme.css` — shared tokens, responsive layout, card depth, focus handling, and overrides for all main surfaces.
- `src/main.jsx` — user-facing Odyssey language while preserving existing controls and API behavior.
- `public/brand/anukriti-odyssey-mark.svg` — original vector logo.
- `index.html` — descriptive document title and theme color for the application shell.

## Verification

The browser end-to-end test checks the new sign-in title, first-voyage labels, Aegis Guide wait controls, pause save notice, and voyage progress language while continuing through the full browser job, back-office proof, Numbers, and resume journeys.
