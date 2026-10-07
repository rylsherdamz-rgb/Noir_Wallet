---
format: 1920x1080
duration: 65s
message: "Tap a card to pay on Stellar — it spends only what you load, and works until you revoke it."
arc: Future Pacing — imagine → tap proof → name product → mechanism (link, load) → control (revoke) → trust → CTA
audience: Stellar community, SCF reviewers, crypto-curious mobile users
mode: collaborative
music: dark premium minimal electronic, deep pulse, confident luxury tech, builds to a lift
---


## Video direction

- **palette system** (frame.md): ground `ink-black` #0A0A0A on every frame except Frame 7 (gold register: ground `fire-orange` = Noir gold #C6A15B, text ink-black). Headlines `cream` #EDE4D0; one gold accent moment per frame (the payoff word / line); labels mono gold tracked caps; secondary copy `cream-hint` #A9A9A9; hairlines `border-dark` #3A3A3A. App-screen greens/reds live only inside the screenshots.
- **type**: display = Jost 600 (local `assets/fonts/Jost-SemiBold.ttf`, also Medium/Regular), sentence case, slight negative tracking; labels = mono uppercase tracked 0.16em; wordmark NOIR uppercase tracked 0.25em. Never heavier than 600.
- **shared phone shell (identical in every frame — handoff consistency)**: a dark device, width ≈ 365px at 1920 (19cqw) when "hero size", aspect 390/844, corner radius ≈ 50px, 9px #1c1c1c bezel + 2px #2c2c2c outer hairline, screenshot `object-fit: cover; object-position: top`; a soft contact shadow below only (no glow, no colored shadow). Screens are 1170px-wide @3x PNGs — show them as-is, never redraw UI.
- **the card prop (Frames 1, 2, 10)**: matte black NFC card, ISO ratio 85.6:54, radius ≈ 22px, subtle #1b1b1b→#0d0d0d sheen and 2px #333 edge, a tiny gold contactless glyph (three arcs) top-right. Gold ripple = 1–3 concentric thin rings (rgba gold .4→0) expanding once per tap — finite tweens only.
- **motion grammar**: long-tail settles (`power3` default, `expo.out` for fast arrivals); entrances via `fromTo`; reveal each piece on its spoken cue — never front-load; kinetic words land with `kinetic-beat-slam` / `dynamic-content-sequencing`; seams inside a frame are velocity-matched (`cut-catalog.md`). Premium = slow, confident, precise — no overshoot, no bounce.
- **rhythm / held frames**: Frame 3 (intro lockup) and Frame 10 (outro) are held reads after their reveal; Frame 6 holds its claim still in its back half as the breather before the Frame 7 gold climax. Frames 2, 4, 7, 8 carry the energy.
- **aliveness during holds**: subtle jitter (`sine-wave-loop`, low amplitude) on at most one element, or nothing. No breathing, no slow back-half push/pan.
- **negative list**: no slideshow (front-load then freeze), no screensaver (many elements floating independently), no bokeh / purple-blue AI gradients / lens flares / glow around the logo, no emoji, no fake status bars or browser chrome, no invented UI, no stats not in the screens, no "Mainnet"/"iOS" claims. Never show the Receipt screen's lower half (contains a `[DATE, TIME]` placeholder).
- **caption keep-out**: keep all important content in the top ~83% (phones may extend toward the bottom edge but key UI and type stay above the band).

## Frame 1 — Hook: your wallet, on a card

- scene: Black field. Kinetic type: "Your wallet." → "on a card." while a matte black card drifts into frame, gold NFC ripple breathes once.
- voiceover: "What if your whole wallet… fit on a card?"
- duration: 5s
- transition_in: cut
- status: built
- src: compositions/frames/01-hook.html
- type: hook
- persuasion: Future pacing
- beat: curiosity + aspiration
- asset_candidates:
- blueprint: kinetic-type-beats (Adapt)
- focal: (typography + card prop — no captured asset)
- roles: card prop = cutout (right third) · type = primary (left)
- sfx: low sub-boom on "card", soft whoosh for card glide

narrativeRole: stop the scroll with a desirable "what if" — premium, minimal, no product name yet.
keyMessage: a payment you can carry like a card.

Adapt: keep the kinetic-type signature (the key word lands alone on its beat); the swap is "wallet" → "on a card" while the card prop proves it.
Scene 1 (0.0–1.6s): pure black; "What if your whole wallet" — only "Your wallet." rises in left-third via per-word staggered reveal (`dynamic-content-sequencing`), cream display, ~7cqw. Nothing else on screen.
Scene 2 (1.6–3.2s): on "fit on a card", "on a card." slams in beneath in gold (`kinetic-beat-slam`); simultaneously the matte black card glides in from off-right with a motion-blur streak (`motion-blur-streak`) and settles at −8° in the right third. Asymmetric 60/40, 3 depth layers (type, card, faint ring).
Scene 3 (3.2–5.0s): a single gold ripple ring expands once from the card's contactless glyph (`svg-path-draw` ring + scale, finite); hold still — subtle jitter on the card at most.

## Frame 2 — The tap

- scene: Phone (Tap to pay, 12 XLM, "Ready to tap") centered; the card swipes to its back, gold rings pulse, screen resolves to the green "Sent" receipt. Kinetic "Tap." "Paid." "Settled." stamps beside it.
- voiceover: "Tap. Paid. Settled on Stellar."
- duration: 6s
- transition_in: zoom-through
- status: built
- src: compositions/frames/02-tap.html
- type: feature_showcase
- persuasion: Show-don't-tell proof
- beat: excitement + ease
- asset_candidates: assets/Tap.png — merchant Tap to pay screen, 12 XLM, gold Ready to tap; assets/Receipt.png — Sent 25.00 XLM receipt (crop to top half, avoid [DATE, TIME] row); assets/ModalProcessing.png — processing overlay
- blueprint: device-surface-showcase (Adapt)
- focal: assets/Tap.png
- roles: Tap.png = cutout (hero phone, center) · ModalProcessing.png = supporting (screen state 2) · Receipt.png = supporting (screen state 3, top half only)
- sfx: NFC tap chirp on contact, soft click, success chime on "Settled"

narrativeRole: prove the hook instantly — the core magic moment before any explanation.
keyMessage: one tap, done, on-chain.

Adapt: keep the signature — the product completes its core loop inside its real interface, stepwise; screens advance Tap → Processing → Sent inside one phone shell.
Scene 1 (0.0–1.2s): phone (Tap.png, "12 XLM · Ready to tap") arrives center via inverse zoom-through from the previous frame's card (`cut-catalog.md`), hero size; left column empty.
Scene 2 (1.2–2.4s): on "Tap.", the card swings in from right and touches the phone's back edge; two gold rings pulse out from the contact point; "Tap." slams in left-third (`kinetic-beat-slam`).
Scene 3 (2.4–3.8s): on "Paid.", screen crossfades to ModalProcessing.png then instantly toward the receipt; "Paid." lands under "Tap.".
Scene 4 (3.8–6.0s): on "Settled on Stellar", screen resolves to Receipt.png (cropped: only the top — check, "Sent", 25.00 XLM, To/Status rows above the Date row; mask the rest with the phone's own dark ground). "Settled." lands in gold, mono label "ON STELLAR" fades beneath. Hold.

## Frame 2b — The agent pays (no phone, no unlock, no confirm)

- scene: Kinetic "No phone." "No unlock." "No confirm." beside a lone Noir card; the card taps once, gold rings pulse, and its agent balance pays out 25.00 → 13.00 XLM ("−12.00 paid"). Subline: "The card's agent pays from its own balance — settled on Stellar in seconds."
- voiceover: (none — music bed; both cuts)
- duration: 5s (11.0–16.0; every later frame shifts +5s)
- status: built (index.html #f2b)
- narrativeRole: the core promise — the card pays by itself through its funded agent; the payer never takes out, unlocks or confirms on a phone.

## Frame 3 — Introducing Noir

- scene: Everything clears; the Noir cat mark lands flat center, NOIR wordmark tracks open beneath, gold "TAP INTO TRUST" types on.
- voiceover: "This is Noir. Tap into trust."
- duration: 4.5s
- transition_in: blur-crossfade
- status: built
- src: compositions/frames/03-intro.html
- type: product_intro
- persuasion: Authority by brand
- beat: awe + trust
- asset_candidates: assets/noir-mark.png — Noir cat mark; assets/Splash.png — splash reference for lockup proportions
- blueprint: logo-assemble-lockup (Reproduce)
- focal: assets/noir-mark.png
- roles: noir-mark.png = cutout (center) · Splash.png = reference only (lockup proportions, not shown)
- sfx: deep resonant hit on mark land, airy shimmer under tagline

narrativeRole: name the product at peak curiosity.
keyMessage: Noir = the brand behind the tap.

Scene 1 (0.0–1.2s): black; on "This is Noir", the cat mark resolves at center from slight blur + scale 0.92 to sharp (`spring-pop-entrance`, smooth settle, no overshoot) — flat, no glow. Centered, mark ~11cqw.
Scene 2 (1.2–2.6s): NOIR wordmark tracks open beneath from tight tracking to 0.25em (`dynamic-content-sequencing` per-letter), cream.
Scene 3 (2.6–4.5s): on "Tap into trust", the tagline types on in gold mono caps (`discrete-text-sequence`); hold still — held read.

## Frame 4 — Link any card

- scene: Phone walks the link flow — "Link a card" → "Hold your card to the phone" (gold rings) → green "Card linked". Kinetic labels step in sync: "Card. Sticker. Phone." "Hold." "Linked."
- voiceover: "Any NFC card or sticker. Hold it to your phone — and it's registered on Stellar."
- duration: 7s
- transition_in: push-slide LEFT
- status: built
- src: compositions/frames/04-link.html
- type: feature_showcase
- persuasion: Friction reduction
- beat: ease + clarity
- asset_candidates: assets/LinkIntro.png — Link a card, name chips, Scan card; assets/LinkScan.png — Hold your card to the phone, gold NFC rings; assets/LinkSign.png — Sign & link, "works until you revoke it"; assets/LinkSuccess.png — Card linked, green check
- blueprint: device-surface-showcase (Reproduce)
- focal: assets/LinkScan.png
- roles: LinkIntro.png = supporting (left, dimmed, smaller) · LinkScan.png = cutout (center-right hero) · LinkSign.png = supporting (brief interstitial) · LinkSuccess.png = supporting (right, becomes hero at end)
- sfx: soft whoosh per carousel step, NFC chirp at scan, success chime on "registered"

narrativeRole: show setup is trivial — the mechanism, step one.
keyMessage: any card becomes a Noir card in seconds of effort.

Scene 1 (0.0–1.8s): on "Any NFC card or sticker", the carousel enters with LinkIntro.png as hero (right 60%); label "01 · LINK" + "Any NFC card." reveal left-third (`dynamic-content-sequencing`). 
Scene 2 (1.8–3.8s): on "Hold it to your phone", carousel slides left (cut-the-curve, `cut-catalog.md`): LinkScan.png becomes hero, LinkIntro dims/shrinks to the left; gold rings in the screenshot get an overlaid finite pulse; "Hold." lands.
Scene 3 (3.8–5.4s): carousel slides again through LinkSign.png briefly to LinkSuccess.png hero; on "registered on Stellar", "Linked." lands in gold.
Scene 4 (5.4–7.0s): hold; previous screens recede as dim ghosts at left. Layered depth, 3 layers.

## Frame 5 — Its own agent

- scene: Two phones side by side: Agents tab (Black card, Keychain tag) and the Black card agent detail ("Authorized on Stellar", 25.00 XLM tap balance). Gold hairline connects card → agent. Kinetic: "Its own agent." "Its own balance."
- voiceover: "Every card pays through its own on-chain agent — with its own balance."
- duration: 6.5s
- transition_in: crossfade
- status: built
- src: compositions/frames/05-agent.html
- type: feature_showcase
- persuasion: Feature-to-benefit translation
- beat: clarity + control
- asset_candidates: assets/Agents.png — Agents tab, 2 cards; assets/AgentDetail.png — Black card agent detail, Authorized on Stellar (tall, crop top 844pt)
- blueprint: comparison-split (Adapt)
- focal: assets/AgentDetail.png
- roles: Agents.png = supporting (left phone) · AgentDetail.png = cutout (right phone, top 844pt crop)
- sfx: subtle tick on hairline connect, soft swell

narrativeRole: the differentiator — isolation by design (Soroban agent per device).
keyMessage: the card is not your wallet; it's a fenced-off agent.

Adapt: keep the split signature (two equal surfaces, paired capability), but cards are phones and they connect via a gold hairline instead of tilting apart.
Scene 1 (0.0–2.0s): on "Every card", the Agents.png phone rises into center-left (`split-tilt-cards` entrance without the tilt — straight rise, power3); "02 · AGENT" label + "Its own agent." reveal at far left.
Scene 2 (2.0–4.2s): on "its own on-chain agent", a gold hairline self-draws from the "Black card" row toward the right (`svg-path-draw`) and the AgentDetail.png phone rises into center-right; zoom-to-target emphasis on "Authorized on Stellar" via a thin gold underline (`css-marker-patterns`).
Scene 3 (4.2–6.5s): on "with its own balance", "Its own balance." lands in gold on the far right; hold. Split-screen, symmetric.

## Frame 6 — Load only what it should spend

- scene: Top-up keypad: amount counts 0 → 25 XLM, "Main wallet → Black card agent". Big gold kinetic line: "It spends only what you load."
- voiceover: "Top it up with exactly what it should spend. Nothing more."
- duration: 5.5s
- transition_in: push-slide LEFT
- status: built
- src: compositions/frames/06-load.html
- type: benefit_highlight
- persuasion: Risk reversal
- beat: control + peace of mind
- asset_candidates: assets/AgentFund.png — Top up, 25 XLM, Main wallet → Black card agent; assets/Dashboard.png — main wallet 10,000.00 XLM
- blueprint: titlecard-reveal (Adapt)
- focal: assets/AgentFund.png
- roles: AgentFund.png = cutout (right phone) · Dashboard.png = supporting (unused unless needed as a ghost behind; do not add)
- sfx: soft keypad ticks during count, low "lock" thunk on "Nothing more"

narrativeRole: translate the agent into safety the viewer feels.
keyMessage: worst case is capped at the tap balance.

Adapt: keep the calm two-line value title held still; add a count-up so the claim is earned.
Scene 1 (0.0–2.2s): on "Top it up", the AgentFund.png phone slides in to the right third; an overlaid amount counter counts 0 → 25 XLM (`counting-dynamic-scale`, subtle scale), "Main wallet → Black card agent · 25 XLM" line in hint grey fades in below the title area.
Scene 2 (2.2–4.0s): on "exactly what it should spend", "It spends only" + gold "what you load." slide up with crossfade (`dynamic-content-sequencing`), left column, display ~4.6cqw.
Scene 3 (4.0–5.5s): on "Nothing more.", hold perfectly still — the breather before the climax.

## Frame 7 — Revoke anytime (gold register)

- scene: Gold-ground declarative beat. "Works until" … "you revoke it." Then the red "Revoke Black card?" popup phone slides in; balance chip flies back to the main wallet.
- voiceover: "Lost it? Revoke it in one tap — and every last XLM sweeps back to you."
- duration: 7s
- transition_in: zoom-through
- status: built
- src: compositions/frames/07-revoke.html
- type: benefit_highlight
- persuasion: Risk reversal
- beat: anxiety → relief
- asset_candidates: assets/ModalRevoke.png — Revoke Black card? danger popup; assets/AgentDetail.png — "Works until: You revoke it" row
- blueprint: kinetic-type-beats (Reproduce)
- focal: assets/ModalRevoke.png
- roles: ModalRevoke.png = cutout (right, tilted 4°) · AgentDetail.png = supporting (optional: the "Works until · You revoke it" row as a cropped strip under the headline)
- sfx: tension riser into the gold flood, hard impact on "revoke", reverse whoosh as the balance chip returns

narrativeRole: kill the obvious objection (lost card) with the strongest emotional beat.
keyMessage: you are always in control.

Scene 1 (0.0–1.4s): ground floods gold from the zoom-through; on "Lost it?", "Works until" appears small in ink at 70% opacity, left.
Scene 2 (1.4–3.0s): on "Revoke it in one tap", "you revoke it." slams in huge ink-black (`kinetic-beat-slam`), ~8cqw; the ModalRevoke.png phone tilts in from the right edge (expo.out).
Scene 3 (3.0–5.2s): on "every last XLM sweeps back to you", a small dark pill "25.00 XLM" lifts off the phone and arcs left to the text column (`motion-blur-streak` on the arc), landing beside "Every last XLM → back to you" (ink).
Scene 4 (5.2–7.0s): hold still on the gold field.

## Frame 8 — The whole wallet

- scene: Camera glides across a fanned row of real screens (Dashboard, Send, Receive NFC, History, Cards, Lock) on black, slight 3D tilt; kinetic verb barrage: "Send. Receive. Tap. Track. Lock."
- voiceover: "And it's a full Stellar wallet. Send, receive, track — locked behind your keys."
- duration: 7s
- transition_in: blur-crossfade
- status: built
- src: compositions/frames/08-wallet.html
- type: feature_showcase
- persuasion: Value stacking
- beat: power + confidence
- asset_candidates: assets/Dashboard.png — wallet home; assets/SendAmount.png — send amount; assets/ReceiveNfc.png — receive via NFC tap; assets/History.png — activity; assets/Cards.png — cards list; assets/Lock.png — lock screen; assets/SendReview.png — send review
- blueprint: camera-journey (Adapt)
- focal: assets/ReceiveNfc.png
- roles: Dashboard.png, SendAmount.png, ReceiveNfc.png, History.png, Cards.png, Lock.png, SendReview.png = supporting row (fanned phones); ReceiveNfc.png = center hero
- sfx: continuous airy whoosh for the glide, light tick per verb

narrativeRole: breadth — it's not a gimmick, it's a real wallet.
keyMessage: everything you'd expect, plus the tap.

Adapt: keep the flying-camera signature over the artifact; the "artifact" is a fanned arc of 7 phones on a `.world` wrapper.
Scene 1 (0.0–1.6s): on "And it's a full Stellar wallet", the world arrives via blur-crossfade with the camera on the left end (Dashboard.png, SendAmount.png) — phones fanned on a gentle arc with ±3–6° tilt, center phone hero size.
Scene 2 (1.6–5.4s): one continuous camera glide left→right (`viewport-change`, a single long power2.inOut move — this is the shot, not a back-half drift); as the VO says "Send, receive, track", the verb row beneath lights word-by-word (`asr-keyword-glow`) under the matching phone: Send → SendAmount, Receive → ReceiveNfc, Tap (gold) → ReceiveNfc, Track → History, Lock → Lock.
Scene 3 (5.4–7.0s): on "locked behind your keys", camera settles on Lock.png/Cards.png end; "Lock" lights last; hold.

## Frame 9 — Built on Stellar

- scene: Typographic trust beat: three lines assemble on hairlines — "Soroban smart contracts" · "x402 tap-to-pay" · "Open source · MIT". Small "Live on Stellar Testnet" label.
- voiceover: "Built on Soroban smart contracts. Open source. Live on Stellar Testnet."
- duration: 6s
- transition_in: crossfade
- status: built
- src: compositions/frames/09-stellar.html
- type: social_proof
- persuasion: Authority by association
- beat: trust
- asset_candidates:
- blueprint: grid-card-assemble (Adapt)
- focal: (typography — no captured asset)
- roles: rows = primary · Testnet chip = supporting
- sfx: three soft ticks (one per row), faint pad swell

narrativeRole: credibility for the SCF / builder audience — honest (Testnet, open source).
keyMessage: real contracts, open code.

Adapt: keep the accumulating-list signature (rows pop into slots ~1/sec and stay); the "cards" are hairline-ruled typographic rows.
Scene 1 (0.0–1.0s): mono gold "BUILT ON STELLAR" label; four hairlines self-draw left→right (`svg-path-draw`), staggered.
Scene 2 (1.0–4.4s): rows rise into their slots on cue — "Soroban smart contracts" (on "Built on Soroban…"), "x402 tap-to-pay", then "Open source · MIT" (gold "· MIT") on "Open source" (`dynamic-content-sequencing`). Full-width strip, left-aligned.
Scene 3 (4.4–6.0s): on "Live on Stellar Testnet", the steel-blue (#7C93B5) "● LIVE ON TESTNET" chip fades in bottom-right of the rows; hold.

## Frame 10 — Outro / CTA

- scene: Cat mark + NOIR lockup returns, "TAP INTO TRUST" in gold, GitHub URL github.com/rylsherdamz-rgb/Noir_Wallet below; card silhouette taps the lockup once, final ripple, hold.
- voiceover: "Noir Wallet. Tap into trust."
- duration: 5.5s
- transition_in: zoom-through
- status: built
- src: compositions/frames/10-outro.html
- type: cta
- persuasion: Brand recall
- beat: inevitability
- asset_candidates: assets/noir-mark.png — Noir cat mark
- blueprint: logo-assemble-lockup (Reproduce)
- focal: assets/noir-mark.png
- roles: noir-mark.png = cutout (center) · card prop = supporting (taps once)
- sfx: NFC chirp on card tap, final resonant hit, tail

narrativeRole: brand recall + where to go.
keyMessage: Noir — tap into trust; find it on GitHub.

Scene 1 (0.0–1.4s): on "Noir Wallet", the cat mark + NOIR wordmark re-form at center mirroring Frame 3 (mark smooth settle, wordmark tracking open).
Scene 2 (1.4–2.8s): the card silhouette glides up from below and taps the lockup's baseline once; one gold ripple ring expands and fades (finite); card exits downward.
Scene 3 (2.8–4.2s): on "Tap into trust", gold mono tagline types on; then the URL "github.com/rylsherdamz-rgb/Noir_Wallet" fades up in hint-grey mono below.
Scene 4 (4.2–5.5s): hold; final frame exit = gentle fade to black over the last 0.6s.
