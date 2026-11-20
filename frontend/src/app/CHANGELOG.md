<!--
  EMBERHOLD CHANGELOG — a note from the creator, shown to every player.
  HOW TO POST AN UPDATE:
    1. Add your new entry at the TOP of the list below (newest first).
    2. Bump the version number in the line below (1 → 2 → 3 ...).
  The popup appears once per version for each player (tracked in their
  browser), plus a 📜 Changelog button in Help and the pause menu.
-->
<!-- changelog-version: 287 -->

## v287 -- Hell grows strange, heaven grows wide

- **👽 An alien hell**: three new wild biomes beyond the familiar five — violet **fungal** mushroom forests, deep-violet **gloom** wastes, and alien-teal **verdant** flats — grown with two new choppable alien trees (violet shroom-caps, teal spire-crystals) that also seed thinly through the old wastes. Blood runs rarer and lava seeps scarcer — the red-hot fire retreats to the castle, its moats, and the war-holds where it belongs. Old saves rebuild once under the new generation.
- **🏰 Two new hell fortresses**: the bone-white **Marrow Ossuary** (ruled by the new **Marrow Sovereign** warlord, 6680 HP) and the violet **Gloomspire** (ruled by the Eventide Horror) muster even alongside the four old holds. Each family's heaviest hitters now muster ONLY in their holding's garrison — the wilds keep the weaker fiends.
- **☁️ A wider heaven**: three new wild biomes — blossom **bloom** meadows, drifting **mist** hollows, golden **pasture** grazing — plus deterministic floating grass-tree islets stamped on open cloud-fields. Orchard-wisp leaves flutter on the move, like every other winged kind's wings.

## v286 -- The big ones get bigger (and trickier)

- **🐲 Proper giants**: the Leviathan and Reservoir Leviathan are the biggest things in the deep now, with the Peak Dragon, Divine Dragon, Hydra Broodmother and Frostwyrm next and the Mire Hydra just behind — ridden mounts show their true size too. The Peak Dragon also finally looks the part: a real side-profile dragon with wings, horned head, gaping jaw and spaded hail tail.
- **🌊 Water fights back**: dungeon Leviathans periodically flood a huge disc of the floor around themselves and dive under it (blades can't reach what's submerged); hydras well up smaller pools and dive those. The great drakes answer size with sky — Peak, Divine and Frostwyrm take wing for a few seconds, strafing with breath while blades, claws and ground bursts pass harmlessly underneath (arrows, thrown arms and spells still reach). Leviathan and Broodmother floors always hold plenty of dive water, and the Reservoir Leviathan only ever rises in heaven's largest reservoirs.

## v285 -- Multiplayer rejoins remember your hero

- **🐺‍ Your race survives the trip**: rejoining a world from the host's memory used to drop your whole look (the snapshot only understood packed looks, so full hero faces vanished and you came back a default human). Looks now carry both shapes, and the rejoin restores your face explicitly — no more mystery humans.
- **🎒 Builds, beasts and boxes come back too**: host-remembered heroes used to keep only the basics (level, gold, party ids) — stats, skill points, tree ranks, techniques, inventory, full gear + upgrades, tames, lifetime taming, inn rooms, breed jobs, mounts, stable pens, home hearth, dimension and quests were wiped whenever the host's copy won. Everything now rides the snapshot (sanitized + size-capped), and the rejoin rebuilds it all with clean copies that can't corrupt the host's memory.
- **🧱 Shared builds converge**: guests now also pull the host's actual ground (nearest loaded chunks, whole) on top of the edit feed — so walls, doors and stalls raised before hosting (or across a host reload) appear on rejoin, and keep converging as you walk. Tile overrides persist on the host across restarts, and leaving a world saves your hero first, so there's less to reconstruct.

## v284 -- Avalanche Hammer falls like a cataclysm

- **🔨 Avalanche is now Avalanche Hammer**: renamed everywhere it shows (ability, Sundering tree, codex) — the internal id is unchanged, so saved heroes keep the art. And it finally hits like its hammer cousin: screen flash + shake on impact, staggered frost rings, sky-ice crashing onto every victim, frost cracks racing outward, ice shards stabbing skyward through rolling snow dust, and an AVALANCHE HAMMER! battle cry. Damage, freeze and costs untouched.

## v283 -- Multiplayer reentry keeps your oath

- **🔥 The Hearthkeeper remembers you**: rejoining a multiplayer channel used to rebuild your hero without its main-story record — oath flags, the spark quest and everything after it — so the intro dialogue nagged again every return even with a charm in hand. The full story now survives rejoining (oath, active quest, done list, sanitized), and even a host-remembered copy from another device keeps your oath decision, so the intro never auto-fires twice.

## v282 -- Hell towers and hearths stand warded

- **🗼 Quiet ground in hell**: hostile wild fiends no longer muster near hell towers (structure + 26-tile ward) or demon-hold hearths (walls + 26 past the radius) — arrivals land into quiet ground, every time. The old hold thin-out leaked 1 spawn in 10; the ward is now total. The civilized demon warden still keeps the peace inside holds, and fights you start yourself (boss adds, splits, summons) still follow you — only ambient musters are warded. Sleeping at a tower or hold is safe from the succubus night ambush too.

## v281 -- Shard dreams wear a dark silhouette

- **🖤 Peter's memories hide their face**: the 3/6/9-fragment dream dialogues no longer show the Goddess (or Peter) — a black-robed silhouette on a bruised-violet backdrop instead. The voice could be anyone's. (There's no separate 12th dream: twelve is the forge toast, then the sphere and the towers.)

## v280 -- Title: one New game button per selection

- **✨ Singleplayer simplified**: the separate ✨ New journey / 📂 Continue buttons are gone. One **✨ New game — Slot N** button starts a fresh hero in the selected slot (still asks before overwriting); each save row's **Load** button is the way back into an existing hero. Default selection is the first empty slot.

## v279 -- Hearthkeeper intro stops repeating

- **🔥 Oath taken = intro over**: picking an oath (or refusing one) now counts as resolving the intro even if you close the dialogue before the last page — it no longer pops up again on every world entry. The charm was granted mid-conversation while "listened" only saved at the very end, so early closers nagged forever. Manual 🌟 Main → 🔥 Listen and descending into a dungeon both still finish the quest properly.

## v278 -- Shallows lie still and clear

- **🌊 Calm, clear shallows**: the animated shallow-water layer is a whisper now (soft 0.38 layer, lazy half-speed drift, barely a bob or morph) — the static bake's depth fields and sky sheen carry the look, with twinkling sun-catches for life. Waves read as faint glass, not weather. Deep water unchanged.

## v277 -- Bigger mirrors, bridges layer over reflections

- **🪞 Full-body reflections**: shore and shallow-water mirrors are near-full-size now (0.9 squash, gentler fade, 8 shimmer slices) and markedly more opaque — shallow water mirrors bright, the deeps dimmer but still readable. Feet-in-water mirrors clip to nearby water so they never spill onto dry land.
- **🌉 Water → reflection → bridge**: bridge tiles count as water for mirrors, so reflections continue under the bridge, and the opaque plank band repaints over the mirror (bodies stay on top of the deck) — the planks visibly cut the reflection where they cover it.

## v276 -- Shore reflections removed (take two)

- **🪞 No more mirrors on the water**: the re-added shoreline reflection pass (bodies, trees and lanterns mirroring south onto water) is out again — it never read reliably in real play (banks, bridges and night light all conspired against it), so nothing mirrors onto water anymore. Water keeps its textured animated look (4 shallow + 3 deep variants, drifting shimmer, sun-catches, shore foam) and submerged divers keep their faint silhouette + surface bubbles.

## v275 -- Bridge water visibly flows now

- **🌊 The current has substance**: the animated motif layer was so sparse (strokes clustered mid-tile, thin bands caught only fringe pixels) that bridge bands looked static. Strokes now span the full tile height with pinned edge-strokes top and bottom on every variant, shallow and deep — roughly 2x the strokes, same horizontal current-stroke style, no curls. Bridge bands (and open water) visibly drift; verified 90–160 band pixels changing frame-to-frame with planks untouched.

## v274 -- Tree shores shade too, bridges are seamless

- **🌲 Top shores shade like bottom shores**: the inset shadow is now drawn from the water side, and any solid shore counts — grass, sand, trees, walls — so a tree-lined bank shades exactly like an open one. Bridges are the one exception: no shadow, no foam lip, no lines of any kind against a bridge tile.
- **🌉 Bridge = water tile + planks on top**: bridge tiles now render the exact same water as everywhere else (same base variant, motifs, glints, phase — verified pixel-identical) with the plank band redrawn over the middle, instead of thin separate strips. No more thin lines under the bridge; the current just runs under it.

## v273 -- No more brown banks, bridges visibly flow

- **🏞️ Brown outline removed**: the earth banks are gone entirely — shores now read as water-sunk-by-shading alone. The water takes a soft two-step inner shadow along the shoreline (darkest right at the edge) and the land takes a thin light lip on the water-facing edge. Dark-inside + light-rim is the concave cue: the old bright lip bulged the water upward (convex), the inverted shading sets it down INTO the land instead.
- **🌉 Bridge water you can actually see**: the bands only caught sparse fragments of the full-tile motif slices, so the flow was technically there but near-invisible. Now each band gets a second offset strip pass plus short current-dashes scrolling eastward right inside the bands (with twinkling glints), so the water under the planks visibly moves. Planks untouched, structure shadows kept.

## v272 -- Shores drop into the water, bridges flow

- **🏞️ Water sits BELOW the land now**: every land|water border bakes an exposed earth bank on the land side with a soft drop-shadow on the water — shores read as banks dropping to the water, not water lapping over grass. Foam is quieter to match (thin wet line instead of a bright rim).
- **🌉 Bridges flow too**: bridge plank-bands replay the live current (same scrolling strips + morph, clipped to the two water slivers, with a structure shadow where planks meet water) instead of sitting on painted-static blue.

## v271 -- Flow lines sit in the water

- **🌊 Motif layer at 60% opacity**: the scrolling strokes now draw translucent over the bake instead of full-bright, so the blue leads and the current reads as movement *in* the water rather than white lines *on* it. One constant (`MOTIF_ALPHA` in `sprites.js`) — say the word if you want it fainter still or stronger.

## v270 -- Thin lights, deep shadows

- **🌊 White reads thin, dark does the work**: crests now light only ~70% of each stroke (broken highlights), the halo is fainter, and every stroke carries a wide two-tone shadow foot — dark outweighs bright, so the water stays blue-first. Verified on renders: no worms, no birds, no squares.

## v269 -- Water with volume

- **🌊 Shading, not just lines**: every wave-stroke is 4-tone now (halo, hot crest, lit face, falling shadow) so swells read as volume and water stays blue-first; depth fields are grain-dithered instead of hard squares; bird-like curls/rings are gone, replaced by horizontal current-laps and foam dabs. Still the same current (eastward scroll + morph + twinkles + foam).

## v268 -- Water flows instead of swaying

- **🌊 Real current, changing shapes**: the motifs no longer just glide ±1px back and forth — each tile's motif strip now scrolls steadily eastward like a current (deep water drifts lazier, neighbours run async so nothing syncs), seamless by construction so the flow never pops at tile edges, while crossfading between two motif sets so the shapes genuinely change as they flow. Glints still twinkle in place, foam still pulses at shores.

## v267 -- Water moves as one thing now

- **🌊 Motifs are the animation**: the old overlay slid shimmer bands across the baked wavelets so the two disagreed. Now the ground bakes only flat blue + depth patches, and each frame replays the tile's OWN wavelets/curls/arcs gliding ±1px with its glints twinkling in place — sprite and motion are the same art, so they always agree. Shore foam still pulses where water meets land.

## v266 -- Shore reflections removed outright

- **🪞 No more mirror blobs**: the shoreline reflection pass (`drawWaterReflection`, plus the lava ember glow) is deleted — it never stopped looking like a smear no matter the grading. Water keeps its textured animated look (4 shallow + 3 deep variants, drifting shimmer, sun-catches, shore foam) and submerged divers keep their faint silhouette + surface bubbles; just nothing mirrors onto it anymore.

## v265 -- Close reads full, far reads faint, water moves again

- **🪞 Reflections are distance-graded now**: the mirror renders FULL when pressed against the waterline and shrinks + fades with every step back (nothing from 2+ tiles out) — no more bigger-shadow-from-farther-away. Standing in the water reads whole; a step back reads a stub. The grade is per whole tile, so your stance *within* a tile can never change it — top-of-tile and bottom-of-tile give a pixel-identical mirror.
- **🌊 Water is animated again**: the textured static base tiles (4 shallow + 3 deep variants) stay as the bake, and a per-frame overlay pass brings back the motion — drifting shimmer bands, blinking sun-catches, pulsing shore foam — under entities, water tiles only.

## v264 -- Water with variety, reflections that hold still

- **🌊 Water texture, redone properly**: shallow water now ships 4 variants and deep water 3 — soft depth patches plus a real motif mix (sine wavelets, comma curls, calm dashes, ripple arcs, glints) instead of uniform straight lines. Still fully static (no animation), same blues, tile rims kept clean so neighbours blend.
- **🪞 Reflections stop changing size**: the mirror is now compact enough (~0.65x) to land fully inside a single water row with a stronger depth fade, so it reads the same at every shoreline instead of shrinking or growing with depth and stance.

## v263 -- Water reads as water, reflections read as you

- **🌊 Water has texture again — static, no animation**: shallow and deep water ship 2 deterministic variants each (soft depth patches + staggered ripple crests + sparse glints, kept clear of tile rims so neighbours blend instead of striping). Same blues as before, so bridges and shores blend.
- **🪞 Shore reflections are unmissable**: the mirror was double-squashed into a stub — it now renders ~0.8x tall with stronger depth fade, clipped across two water rows, so standing right at the waterline shows a clear body mirror. Nothing draws from 2+ tiles out (dive silhouettes + surface bubbles on open water are divers gliding below, not your reflection).

## v262 -- Houses keep their distance, doors stay clear

- **🏠 Buildings keep a 1-tile spare ring**: no building touches another — every house, shop, stable and lodge keeps a full one-tile perimeter, and every door front opens onto open ground, never into a neighbour's wall (a packed hamlet may skip its stable/lodge rather than crowd).
- **🚪 Doors never sit on corners, lanterns move aside**: door tiles are validated true shape edges (never corner-pinched shut), and street lamps carve like trees in front of doors — town + watergate sweeps (300+ fronts) bake fully walkable.
- **🌍 Old worlds rebuild once**: saves below v24 regenerate terrain under your hero (party, progress and explored places carry over).

## v261 -- Codex text + race portraits

- **📖 Codex list text is readable again**: row names, stats and the search box now stay white instead of inheriting near-black button text.
- **🧑 Races show a random NPC example**: every race row and detail page pictures one of its people (rolled once per session, drawn live from game art) — humans, werewolves, grenouille, kinnatma, quansalbar and usaghito.

## v260 -- Delve lords by floor, the Threshold's teeth walk beside them

- **👹 Surface warlords are floor-locked now**: floors 1-3 wake tier 1, 4-5 tier 2, 6-8 tier 3, 9-11 tier 4, 12 tier 5, 13+ tier 6 — whatever the delve mouth's remoteness (depth still feeds the warlord's level, never its tier; a theme with no lord of the floor's tier falls back to the nearest tier). Leviathan rules drowned water 13+ only — shallower leviathan floors wake lesser water lords of the floor's tier.
- **🌀 The Threshold Devourer walks as a second boss**: ~15% of surface floors wake it beside the delve lord (any floor; same pair every revisit). Never in hell/god delves, never beside Peter — and the lying-gate portal mimic is untouched.

## v259 -- Boss dims locked, the goddess herself duels you

- **👹 Dungeon warlords stay in their dimension**: surface delves wake tiers 1-6 on every floor (1-15) — deep floors roll hell themes, so theme-matching alone couldn't hold them out; tier-7+ hell/heaven warlords, Peter and the goddess are now hard-excluded there. Hell delves muster hell warlords on every theme, and heaven (no delves) is untouched. Tier-8 rows keep their held-down power — they just never leave hell/heaven.
- **🌅 The mock battle is no mirror match**: the Goddess of Dawn duels you as herself — the real tier-12 goddess warlord at your level, rendered at player scale (1x, like Peter; no boss bulk-up). First to fall still yields, defeat still revives you on the spot, and quests still unlock win or lose.

## v258 -- Codex moves in-tab, bow math folds once

- **📖 Codex opens in the same tab now**: a movable panel instead of a popup-window (no more blocked popups), with live sprites, a 🔗 button that copies a shareable `#codex=<section>/<entry>` link, and hash deep-links that open the panel straight at an entry. Any game UI can link to an entry via `Codex.openPanel(cat, id)`.
- **🏹 Bow damage, same numbers, one fold**: bow power + family + rings arrive together through `bowMult` (verified identical across 2304 bow/arrow/attacker combos, max drift 7e-12) — the old multiply-then-divide-back round-trip and the discarded `spellPowerMult` line are gone.

## v257 -- Mock duel: the heart marker steps aside

- **🌅 No more double goddess**: the pantheon-heart floor marker used to paint her sprite at (0,0) even mid-duel, standing next to the combatant in the ring (plus a "BLESSED!" buff banner overlapping her name tag, which read as a second nameplate). During the duel the heart now shows only its dawn glow — she is in the ring, not at the marker.

## v256 -- Mock duel: one goddess, her true size, a cleared ring

- **🌅 The mock duel is a duel now**: the Goddess fights at player scale (1x, like Peter) instead of looming at 2.3x boss bulk — and she fights alone. Bystanders file out of the pantheon before the seal closes (angels gather outside the walls to watch, as before) and return to their exact spots when it lifts. No more white-robed lookalikes in the ring beside her.

## v255 -- Practice button moves to the HUD

- **🛠️ Practice setup sits by 📜/🔔 now**: the Practice button left the pause menu and joined the top-left HUD row next to quests and notifications (practice worlds only) — one tap to respec, gear up, or summon a sparring dummy.

## v254 -- Boss stats move to a commented YAML file

- **📄 `src/data/bosses.yaml` is now the boss bible**: all 73 warlords (stats, abilities, tiers, themes, bulwark, trims, tricks, cries) plus the per-tier bulk live in one well-commented file. The game reads it once at launch into the same fast tables — zero cost while playing. To rebalance, edit the YAML and reload; no JavaScript needed.

## v253 -- Practice sparring: summon anything to test it

- **👹 Sparring dummy in the Practice setup**: pick any mob or boss (bosses grouped by tier, goddess included) + a level and Summon it beside you, ready to fight — no more relying on delve RNG to playtest. Bosses arrive with full tricks + enrage, Peter skips his intro and opens straight to steel, passive kinds stay calm. At most a dozen live summons, 🧹 Clear dismisses them, and summons never count as the delve lord.

## v252 -- Boss distribution pass: honest templates, Peter heals again

- **👹 Boss stats refit to the distribution table**: every warlord template now carries honest HP (surface t2–t6 up, hell/heaven rows way up, Peter 8225, goddess 8260) and the per-tier bulk (CFG.BOSS_TIER_BULK, read by both the spawner and the codex) lands spawns on the table — low tiers pool up (~15k/35k), mids climb (~75k/130k/260k/550k), hell hits ~1M/1.4M then runs lean-and-mean (~500–980k), Peter tops at ~1.34M. ATK/MATK/DEF templates untouched; DEF bulk unchanged.
- **👹 Peter fields everything again**: heal + panacea are back in his spawned kit — the whole pool, no exceptions. His menace is the tier-12 body + full arsenal now, not a custom stat block (the old ensureBoss multipliers are gone).
- **👹 Ancient ground is always max**: eff 8+ delves wake their lords at 125 (the old 109–113 eff-8 band undershot the table).

## v251 -- Tiered boss growth, high tiers reined in (experiment)

- **👹 Growth now scales with tier**: low-tier warlords barely compound with level, mid tiers climb, high tiers climb harder, hell tiers harder still, and Peter + the goddess climb steepest. Flat bulk carries boss identity instead (low x12.5, mid x40–48, high x55–60, hell x20–22, Peter/goddess x50) — the old 100x band and runaway compounding that made high-tier pools mathematically unkillable are gone. Hell + heaven boss templates halved in the same pass.
- **👹 Low-tier coin-flip gone**: warlords roll near-template stats (±3%, exact DEF) instead of the old ±8%/±1 swing.
- **🌅 The goddess meets you at your scale**: the mock duel builds her body 1:1 off your level and stats (plus dawn's kit + heals) instead of a fixed 3200-HP body — and her wild template joins Peter's tier-12 curve.
- Balance experiments welcome — this is a first pass, not the final tuning.

## v250 -- Bosses double armor, top tier reined in, Peter killable

- **👹 Low/mid warlord templates doubled**: surface bosses (tiers 1–4) get twice the DEF value (2→4, 3→6) — back toward real resistance without the old immunity.
- **👹 Highest tier held down**: tier 5–6 warlords, all hell/heaven bosses and the goddess keep the cut values while everything below doubles — and Peter himself drops to template DEF 1 / HP 12 with no self-heal (he kept every offensive spell): his 17k defence and 35%-per-cast heals made even the strongest hits deal 1 damage forever. Still the deadliest thing in the vale — now a fight you can actually finish.

## v248 -- Practice level uncapped

- **🥋 Practice level has no cap now**: the practice menu level box takes any level (was 100) — heroes were already uncapped through real XP, the menu just refused to type it.

## v247 -- E in hell finally leaves hell

- **🗼 Fixed: E on a hell tower stranded you in hell**: the tower lookup matched the surface list first, and since twins share coordinates every hell tower read as surf-side — so E "travelled" to the tower it started from. The side now comes from the dimension you're standing in, so E crosses to the twin both ways.

## v246 -- Tower E always lands on its twin

- **🗼 E on a tower takes you to the same tower, every time**: the remembered-spot override is gone — touching a tower heart lands on the paired tower in the other dimension (same coordinates), never on old ground. Your hell hearths and portals still remember their own spots; only towers are tower-to-tower now.

## v245 -- Tower pins reach both worlds

- **🗼 Teleport to either side of any discovered tower**: a charted tower's map pin now offers the surface heart and the hell heart — pick a side and the miles (and the veil) fold away. Crossing sides needs the woken network, same as walking the red portal; E on an unlocked tower heart still hops you to its twin. No more map-then-portal two-step.

## v244 -- First hell entry lands in the tower

- **🗼 Hell entry lands you in the tower now**: E on a surface tower's red portal with the sphere puts you inside its hell twin (same coordinates, same tower — the pair is one place in two worlds), stamped as your hell spawn. Practice dimension-hop first entry lands in the nearest hell tower too. No more waking alone in the 2200–2800 wilds.

## v243 -- Cave bat flaps properly

- **🦇 The cave bat's whole wing beats now**: the membrane was rotating on the stride while the wing fingers stayed frozen mid-air. Fingers, tips and shading now ride inside the same shoulder rotation, so f0–f3 reads as a real flap.

## v242 -- Smooth dungeon levels, tiered boss bulk

- **📈 Dungeon levels climb smoothly now**: delve mob means rise in even ~15-level steps per depth (7/13/28/43/58/73/88/103/118) instead of jumping +21/+20 mid-curve, and delve-lord levels run continuous with trash (no more +20 jump at eff 8).
- **👹 Boss bulk by tier**: low-tier warlords drop to 1/4 HP (x12.5, DEF x3); mid tiers rise (HP x75, DEF x4); high tiers rise most (HP x100, DEF x5). SDEF follows DEF per bulwark. XP unchanged.

## v241 -- Bosses bulk up again

- **👹 Warlords are raid bosses now**: 50x HP (was 10x) and 3x DEF/SDEF on every boss kind, on top of tier bulk. DoTs were already capped against them (poison/bleed tick at most 1% max HP/s and burn out after ~12s on bosses, ancients and apexes) — still the case. XP rewards unchanged.

## v240 -- Bosses have 10x HP

- **👹 Warlords are damage sponges again**: every boss kind rolls 10x its previous max HP (on top of the usual tier bulk). No more one-shot dullahan lords — bring potions. XP rewards unchanged.

## v239 -- Boss ward removed

- **👹 Bosses take full hits now**: the 30%/9%/3.5% single-hit damage caps are gone — a big enough blow lands all of it, on every warlord. Bulk, spell defence, weak-element bonus (+10%), enrages and tricks all unchanged. (Warlord/apex %HP venom resistance still applies to poison/bleed ticks.)

## v238 -- Cheaper Deep Arts

- **⚔️ Deep Arts cost half the stamina**: techniques now pay 1.5x their base cost (was 3x), after Efficiency and wand discounts. The Codex, hotbar, Inventory and skill trees all show the new live numbers automatically.

## v237 -- Mobs and bosses walk now

- **🚶 Every mob and boss animates while moving**: legs march, wings beat, tails lash, serpent coils travel and hovering ghosts glide — no more sliding-static sprites. Root cause was a pose/state key mismatch in `drawEntity` (stride clock never reached the painters); fixed, plus stride motion threaded through all weak painters (Maw Primogenitor sway, Siege Queen heave, Scorpion Emperor leg ripple, utukku march, ghosts/mimics/serpents/coils). Verified frame-by-frame through the real render path.

## v236 -- Bench work hits five times harder

- **⬆️ Gear upgrades are +50% per level now** (was +10%): each bench level adds half the piece's base flat stats again, 5 levels max (+250% total). Costs are unchanged — first level half price, then full price, doubling each level. Old saves keep their levels; every worked piece is simply worth much more now.

## v235 -- Name your blades, split your copies

- **✏️ Rename gear at its own bench**: every upgrade bench (smithy ⬆️, arcane ⬆️, dojo kasaya counter, holy altar workbench) now has a naming field — dub one copy free ("My Blade"), clear it the same way. The custom name shows everywhere: inventory rows, hotbar binds, upgrade benches, gift and trade toasts.
- **⬆️ Work is per copy now**: upgrading one iron sword out of a x5 stack splits it off (+17 plain next to +19 worked, each on its own row). Any worked or enchanted piece always lists separately, renamed or not. Enchanting carries a copy's levels and name onto the new edge.
- Old saves keep everything earned: per-type levels stamp onto every copy you own, then retire.

## v234 -- Hone your gear at its home counter

- **⬆️ Gear upgrades, one bench per craft**: smithies hone melee weapons, bows, armor and shields; the arcane shop hones robes, staves and wands (new ⬆️ Upgrade tabs, next to ✨ Enchant); dojo counters hone kasaya (below the refunds); chapel/cathedral/tide-temple/shrine altars hone habitus (E opens the altar: blessing + workbench). Each level adds +10% of the piece's base flat stats (ATK/MATK/DEF/SDEF/HP/MP/ST/SPD only — never resists or procs), 5 levels max (+50%). First level costs half the item's price, then full price, doubling each level.
- Levels were per gear type in v234 (riding everything you owned of it); v235 reworks them per copy — see above. The 🎒 Inventory sidebar shows your boosted totals live.

## v233 -- Practice hands out story items

- **🔮 Story items in the Practice setup**: +1 🩸 Fragment and Full set (12) buttons grant hell fragments with real distinct delve-marks (so 🎒 Inventory joins them into a Hell Sphere for forging/tower tests), plus one-tap 🔮 Hell Sphere and 🌅 Heavenly Sphere grants with a live Fragment x/12 + sphere checklist. Practice worlds only, like everything else in the setup.

## v232 -- Your dialogue rewrite is live

- **Your story-dialogue edits are in the game**: every line you rewrote in the dialogues file — the Hearthkeeper's welcome, the Hermit's directions, the Goddess's visions, Peter's dreams and audience, the trial answers, the final confrontation — now plays word-for-word in-game. Nothing else changed: all choices, branches, rewards and quest logic work exactly as before.

## v231 -- Purged the machine-voice from the lore

- **Lorebooks rewritten for human voices**: swept every in-world volume for AI speech patterns — "not merely X but Y," "it is not X, it is Y," "testament to," "nestled," "embarking on voyages" — and replaced them with lines the faiths would actually write. (The runtime NPC prompt already bans these patterns; now the printed books obey them too.)

## v230 -- Story voices, not billboards

- **Main-story dialogues rewritten**: the Goddess, the Hearthkeeper, the Hermit and the Ashen Guide speak like people now — no more rallying slogans ("Twelve delves, one sphere") and no more button-press instructions inside their lines. Mechanics (where to join the sphere, which key wakes a tower, where the tally lives, how delves pay) live in the 🌟 Main quest descriptions instead, where they belong.

## v229 -- Tails sway and blobs waddle

- **Nine-tails ripple as she moves**: each tail bends on its own stride phase, so the fan visibly sways side to side while walking and settles to a gentle two-frame ripple at rest. The dead stay still.
- **Blob mobs walk now**: coagulus, hemorrhage, flesh mound, bile spitter and pulse mass had identical sprites for every stride and idle frame — now all four walk frames differ (side waddle + bounce) and idle frames pulse, so they read alive. Corpses are still the only frozen sprites.
- **Standing mobs breathe a little deeper**: idle scale/bob amplitudes raised ~1.6x across humanoid/beast/default body plans, so guards and grazers no longer look parked.

## v228 -- Nine-tails goes orange with a full ukiyo-e fan

- **Nine-Tailed Kitsune rebuilt**: nine thick orange plumes with cream tips fanning wide behind her like the print, dark rims so each tail reads separately; her hair and fox ears are orange now instead of pink. Her kimono is a real wrap now: white-and-green V collar left-over-right, diagonal front overlap down the skirt, and a wider obi with a pink cord knot.
- **Dungeon minimap no longer leaks surface markers**: quest/contract gold dots and portal pins are surface-only, so the yellow dots in delves are gone (moss and grove trees growing inside are real dungeon decor and stay).

## v227 -- Custom pixel icons everywhere, no more emoji

- **Every item, spell, tree and buff has its own pixel icon**: weapons, armor, shields and torches reuse the live in-game sprites (item only, cropped), rafts reuse the boat sprite, and everything else (potions, materials, rings, tomes, quest goods, spells, Deep Arts, skill trees, stats, buffs) is bespoke pixel art drawn in the new `src/sprites/icons.js` engine.
- **Hotbar, inventory, shops, loot cards and the Codex all render the new icons**; toasts, titles, dropdowns and map labels use plain names instead of emoji.

## v226 -- Kasaya and habitus join the war-gear
- 🥻 **Mobs and bosses wear the new shells**: chanters whose rite leans restorative (heal/panacea at least matching their attack magic) march in habitus, and martial-form fighters (a whirlwind or Iron Palm form — warlords whatever their bulk) march in kasaya, tiered by band exactly like plate and robes (low patched/novice, high dragonhide/seraph). The 📖 Codex Wields lines name the new tracks.
- ⛏️ **Shells obey the delve floors**: Sunsilk Kasaya and Vesper Habit are mythril-band (floor 5+) finds and Dragonhide Kasaya and Seraph Habit dragon-band (floor 11+) — codex where-to-find rows, shelf filters and merchant pools match plate and robes, so nothing surfaces early or in shops.

## v225 -- One fall ends it for every hero
- 👑 **Peter's fall closes every hero's story**: in multiplayer the dungeon sim broadcasts the kill — witnesses standing in his dungeon get the full ending (goddess epilogue + Heavenly Sphere + carried to their own first dawn), while everyone else's Main quests complete silently (no teleport, no sphere). He never returns for anyone who closed him.
- 🌅 **The sphere itself is the key to heaven**: hearth portals lift only a hero carrying a Heavenly Sphere (an unlocked hero without one stays grounded); the way back down is always open. Fallen heaven bosses sometimes loose a spare sphere (25%) — 🎁 Give / ⚖️ Trade it to a hero who missed the fall.
- 🐛 **The ending can no longer skip itself**: the kill branch used to stamp the slain flags before the epilogue ran, tripping its never-twice guard — no epilogue, no teleport, no sphere. The flags now belong to the ending.

## v224 -- Shield sprites in the popup Codex
- 🛡️ **Shields visible in the popup too**: the separate Codex window used its own picture painter, which the v223 fix missed — it dropped the shield and showed a bare hero. Now it paints shields on the left arm exactly like the in-game view.
- 🌌🌟 **The two endgame aegis get their own looks**: Oblivion Aegis (void-violet slab, star sparks) and Dawnstone Aegis (sunrise gold) no longer share the generic fallback.

## v223 -- Codex shows every shell and shield
- 🛡️ **Shield sprites fixed**: shields in the 📖 Codex gear list showed a bare hero — now each shield renders worn on the left arm, with its own caption.
- 📖 **Armor entries name their shell**: every armor piece now lists its guard-shell class (armor / robe / kasaya / habitus) plus which skill tree it feeds and the earn rate — new shells document themselves.

## v222 -- Full tiers for every shell
- 🐲 **Robes get their dragon tier**: the new Wyrmshroud Robe (+95 MATK, 45% magical resist) completes the robe ladder the way Dragonbone Plate completes heavy — surface delve floor 11+ loot, boss hoards, or forged from dragon bone, horn and bright herbs. Top caster mobs wear it into battle.
- 🌌 **Endgame wraps and tunics**: kasaya and habitus now reach past dragon like plate and robes do — Oblivion Kasaya (+105 ATK) and Void Habit (+130 MATK) forge only in hell from deep-hell spoils, while Dawnsilk Kasaya (+85 ATK) and Dawnchoir Habit (+100 MATK) drop from heaven overworld bosses and forge from dawnstone shards. All four feed Ascetic/Devotion exactly like their lesser kin, with matching pixel looks.

## v221 -- Title byline
- ✒️ **A name under the name**: the title screen now reads Emberhold, *by thevoidis999* — the byline in a smaller line beneath the logo.

## v220 -- The clock holds still through notifications
- 🕰️ **No more clock jiggle**: the day/night clock now sits permanently below the notification-ticker slot, so toasts slide in above it without ever shoving it up and down mid-fight.

## v219 -- Corpses lie still
- 💀 **The dead don't fidget**: slain mobs, NPCs, tames and heroes now hold one frozen rest pose — no wing sway, breathing, segment drift or idle shimmer on bodies. Old corpses loaded from a save arrive already lying flat instead of replaying the fall, and a corpse caught mid-whirl no longer corkscrews.

## v218 -- Winged fiends beat their wings on the move
- 🪽 **Every winged mob and boss flaps while moving**: gloom fiend arrives with a real ghost template (no more static fallback), razor choir wings beat with the stride, ash/bleed mothers pump their torn wings, shiver owl spreads its wings in flight (branch only when perched), and all demon + generic winged painters flap on the walk cycle.

## v217 -- The Hearthkeeper speaks the moment you arrive
- 🔥 **No more "go press Listen" errand**: the first main quest now opens its Hearthkeeper dialogue automatically as soon as you enter a world for the first time — swear your origin oath and take its charm right there. Practice grounds included. 🌟 Main → 🔥 Listen stays as a fallback if you close it early (it retries on your next entry until heard).

## v216 -- Fair swings: slow weapons hit their weight, spears thrust, daggers look sharp
- ⚖️ **Same-tier DPS ladder**: daggers no longer win damage-per-second by default. Slower melee now hits harder per swing to match — whips/swords ≈ dagger, axes ~+6%, spears ~+8%, hammers ~+10% (converges from a touch higher at the rusty tier). Weapon ATK numbers show it.
- 🏹 **Bows capped at dagger parity**: bow damage is now linear in bow ATK (was quadratic — high-tier bows dealt many times dagger DPS), and every bow is retuned so plain iron arrows match the same-tier dagger. Better arrows still hit harder; the legendary Oathbow keeps its twin-arrow crown.
- 🔱 **Spears thrust**: spears no longer sweep — they strike a narrow thrusting line (the spear swing FX is a long thrust), and at 3.0 reach they are the longest melee in the game.
- 🔪 **Daggers look like daggers**: the old wide tanto read as a broadsword. Daggers are slim stilettos now (main hand + off-hand), unmistakable next to a sword.

## v215 -- The Main story begins at the hearth
- 🔥 **A real starting quest**: the 🌟 Main tab now opens with *Spark of the Hearth* from the moment your world begins — no more empty log, no more placeholder history. Listen to the Hearthkeeper, swear an Ember/Dawn/Gloam/Wanderer oath for its blessing charm, then descend.
- 📖 **A deeper campaign**: the shard grind now dreams back at 3/6/9 fragments (your answers steer Peter and the trial), the Tower Hermit counsels which compass to walk, a hell-born deserter offers a soft or loud road to the castle, Peter's audience answers your origin/reading/dreams, and the dawn's return offers three endings plus a throne keepsake.
- 🌅 **Dawn Embers**: morning you can hold — quaff to heal and burn away every ailment. Visions, dreams and the final march all press them on you.
- 🧹 **Old placeholders purged**: any *Remembered from before the Main tab kept records* history is gone for good; veteran progress re-routes to the correct live chapter with no fabricated past.

## v214 -- Delves end, fragments move to the bottom
- 🕳️ **Every delve has a bottom**: ordinary delves end at a fixed 12-15 floors (deterministic per delve), the Supreme Overlord's Dungeon still ends at 5. No portals past the bottom, no floor lists beyond it.
- 🩸 **Fragments come from full clears**: boss kills no longer drop Hell Fragments. Clear a surface delve to its bottom, slay the final delve lord, and step through the final portal to daylight — the way out pays the delve's one distinct shard (repeat clears pay once, hell delves never pay, stairs/Eject exits pay nothing). The goddess vision still finds you the moment the first shard lands in your pack.
- 📦 **Old saves**: charted depths past the bottom truncate, and heroes saved deeper than the bottom wake back at the delve entrance (level 1).
- 🧭 **Near-spawn delves pay again**: the old hell check used raw coordinates, and delves share coordinates across dimensions — so every surface delve inside the hell disc (nearly all of them) silently paid nothing. Dimension now decides: surface delves pay, hell delves don't.

## v213 -- Party faces stay human
- 🧑 **Party members never morph into demons**: remote allies and roster members with lost flags count as travelers too (were rendering as hell demons via the resident remap), surf villagers near 16000,0 no longer misread as hell (retired disc removed — surf/hell share coords), and mis-stamped dims defer to chunkKey. True demons you recruit keep their demon faces.


## v212 -- Party faces + richer townsfolk
- 🧑 **Your party always looks like themselves**: hell-born friends no longer morph into demons while traveling with you, and old surface villagers near the world's heart can no longer be mistaken for hell residents (a coordinate mix-up that sometimes turned them demonic after a save).
- 🎨 **Richer townsfolk sprites**: human faces gain brows, noses, ears and finer shading, outfits gain buckles, clasps, stitches and glints, and beastfolk read cleaner — portraits, overworld and chat all share the upgrade.

## v211 -- Chat scroll fix
- 💬 **Dialogue starts at the top**: Peter's intro and the goddess outro opened scrolled to the bottom, cutting the question's first line whenever the log ran short (plus leftover scroll from your previous chat). Both now open at the top. Chat bubbles also switched to a sturdier layout so wrapped text can never escape its box.

## v210 -- Readable NPC dialogue
- 💬 **Bigger dialogue bar**: the NPC chat log grows from a squished 84px to a proper visual-novel pane (up to ~360px), with 16px message text, larger answer buttons and input, and a bigger portrait — Peter's intro question and answers included. Short screens get a scaled-down-but-still-roomy version instead of the old sliver.

## v209 -- Peter waves every minute, court infight fixed
- 😈 **A wave every minute**: Peter musters one fresh wave every 60s of the engaged fight (was: every ~10s off his trick timer) — 3-4 adds, each with its usual 5% boss roll.
- 🤝 **No more traitors in the court**: hell hounds whelped by Peter's own doom fiends, and grave-hunger splits risen from his summons, now stay on his team — before, they arrived wild and brawled with the court via infighting, so his summons took damage and died with the hero standing idle.

## v208 -- Peter fights at your scale
- 😈 **Smaller final boss, same menace**: Peter now renders at hero scale (1x) instead of the 2.3x boss scale — a smaller target on screen with his new void-tyrant look reading razor-sharp. Other warlords still loom large.

## v207 -- Peter the Fallen, void tyrant + true portraits
- 😈 **Peter looks the part now**: the Fallen is rebuilt as a void tyrant — black demon mask with a blazing violet eye, long swept bone horns, a floating broken halo, torn violet-rimmed wings, a chest maw with a hot heart, and a glowing voidglass shard-blade.
- 🖼️ **Portraits finally match**: dialogue, bestiary and HUD portraits now render each kind's bespoke painter (they silently used the generic fallback before) — Peter's new face shows everywhere, along with every other boss's true look.

## v206 -- Taming vs Peter the Fallen
- 💛 **Your beasts fight Peter**: tames target and damage Peter exactly like any other foe — the one-team rule covers only Peter and the beasts he musters.
- 💛 **Tame his summons**: Peter's non-boss summons submit under the normal beast rules (right training, level and 5% apex roll — bosses never kneel), and a tamed ex-summon leaves his team and turns on him. Wild beasts of the same kinds are never on his side.

## v205 -- Peter's court: elite summons, one team, a final-boss look
- 😈 **Elite summons only**: Peter's waves muster hell fiends plus the highest tier of surface wilds (apex ancients, mimic horrors, wyvern kin, phoenix, yeti and the great hunters) — never trash goblins, slimes or bats.
- 👑 **5% a high boss**: every summoned add rolls 5% to arrive as a boss — a hell warlord or a high-tier surface boss (min-eff 4+: oni, tengu, kitsune, naga, rakshasa, scorpion, dullahan, baba, wyvern, jotunn, hydra, fenrir, voidstalker) — never starter-crypt tier, never the lying gate, always floor-standable.
- 🤝 **One team, no friendly fire**: Peter and everything he musters (waves, boss adds, splits, brood-children) share one team — they cannot damage each other or Peter, and Peter cannot damage them. Damage to heroes, party and tames is unchanged.
- 😈 **Peter looks the part**: the Fallen is repainted as a wingspan tyrant — shattered halo above long ringed horns, layered feathered wings, spiked black-gold and stained-bone pauldrons, lava-crack plate with a glowing chest wound, tattered cape and a long flame-edged greatsword (portrait included).

## v204 -- Hell delves get their own names
- 🔥 **No more Mossy Grottos in hell**: hell delves weave names from their own pool (Ashen Pit, Bloodied Charnel, Obsidian Furnace…) with hell lore — the overworld weaver never runs on hell ground. The god-delve and drowned mouths keep their fixed names.
- 🔥 **Old delves renamed once**: hell delves already enriched under the overworld pool are re-woven deterministically on load (deeper floors inherit from level 1 as before); bake-named ones ("Inferno Halls") rename on their next natural enrichment, like the surface. The god-delve is always the Supreme Overlord's Dungeon — records that enrichment renamed (e.g. "Mossy Grotto") heal back on load.

## v203 -- Enter the Dark Castle
- 🏰 **The god-delve mouth wins**: E at the castle heart now enters the Supreme Overlord's Dungeon — the delve mouth beats the war-sign on an exact tie (both share the heart tile), so reading the sign can never block entry again.
- 🏰 **The castle has its name**: hell-heart chunks are named Dark Castle (not a pastoral weaver roll) with dark castle lore — discovery, signs and map all agree. Existing saves heal on stream (same pass as the portal backfill).

## v202 -- Practice invincibility toggle
- 🛡️ **Invincible builds**: the 🛠️ Practice setup's Utilities gain an Invincible toggle — take no damage at all (hits show IMMUNE) for testing builds against anything. Practice worlds only; mortality is one tap away.

## v201 -- Hell deaths wake on safe ground
- 🏠 **No more waking at your corpse**: unbound hell deaths wake at your last SAFE ground (alive, outdoors, nothing hunting you, no lava — refreshed on saves and stamped on every tower/portal/teleport arrival), then the old last-ground fallback, then the tower. The death button names it ("Wake up at safe ground").
- 🗺️ Reloading a save written while dead in hell uses the same order.

## v200 -- Full demon class names + bigger chat portrait
- 🖼️ **Bigger portrait**: the NPC side card portrait grows 88→120px (mobile 64→88px) with a wider column, so demons read clearly.
- 😈 **Full class names, never cut**: the portrait role banner now shrinks to fit instead of truncating — `civilized_succubus` shows in full, not `civilized_su`. Applies to every portrait size (party tabs, bestiary, chat).

## v199 -- Hell residents are demons
- 😈 **Demonic townsfolk**: every hell-hold and castle resident now renders as a civilized demon — even the healers, scholars and guards (stable per-NPC demon look; roles, chat, trade and schedules untouched).
- 💪 **Tougher than surface townsfolk**: hell births carry demonic bodies (+60% HP, +50% MP, +35% attack, +30% defence); old saves toughen once, keeping wounds as they were.
- 🩸 **They know an outsider when they see one**: hell residents remember that non-demons are seldom seen here — and the traveler before them is NOT a demon.

## v198 -- Hell hearth portals
- 😈 **Demon holds join the hearth network**: every demon village/town/city now bakes a ✨ hearth portal like a surface town — E to travel the Known world or bind it as respawn, map teleport included. The castle stays out (its god-delve mouth is not a hearth) and the origin spawn hearth stays surface-only.
- 🏠 **Dim-aware respawn**: the bound hearth stamps its dimension — deaths wake at the bound hearth of the dimension they died in. Hell falls back to last hell ground, then the hell tower; old binds count as surface.
- 🗺️ **No world wipe**: old stored hell chunks gain their portals when streamed or landed on (backfill), so existing saves keep everything.

## v197 -- Hell and surface: true parallel universes
- 🔥 **Same coordinates, different worlds**: hell now mirrors the surface number-for-number — every hell tower stands on the SAME coordinates as its surface twin (tower E is 1000,0 in both worlds), and the castle stands at hell's own (0, 0), right where the surface has its starter town. Same numbers, separate ground, separate storage — the far-off continent at (16000,0) is retired.
- 🗺️ **Old saves rebuild once**: terrain redraws around the new layout (hero, gear, party, fragments, sphere and tower charts kept); heroes wake on the surface and re-enter hell through the towers.

## v196 -- Hell towers teleport like hearths
- 🗼 **Charted towers stay on the map**: a touched tower keeps its pin even after its chunk streams out of RAM (same static coords as the bake), so clicking a glowing tower dot teleports you onto its heart exactly like a visited hearth — search "✨ go" works too. Uncharted towers show but only center the map until E charts them.

## v195 -- Supreme Overlord's Castle: elite garrison, god-delve, Peter the Fallen
- 👑 **One castle, hell's heart**: a single Supreme Overlord's Castle stands at the hell-dimension center (lava moat + double ring, bone/blood/crystal courts) with an elite garrison — high-level hell fiends plus hell warlords, mustered only near the heart. Its portal-room heart opens the one **Supreme Overlord's Dungeon** (always 60x60, inferno/abyss/flesh rotating per floor, fixed depth 8, never a lying gate).
- 😈 **Peter the Fallen waits at the end**: level 5 (eff 12) wakes Peter the Fallen, Supreme Overlord of Hell — highest stats in the game, EVERY spell + technique in one pool, periodic summon waves (each add a 5% boss roll) and every mob/boss quirk (blink, leech, thorns, warcry, charm, fire aura, frenzy, split, burrow dive, voidstalker stalk). Earlier floors muster other hell warlords; the delve ends at level 5.
- 💬 **No input, no trade**: approaching Peter opens the NPC dialogue modal with input bar and trade hidden — he asks why you are there, and any answer begins the fight (striking him first does the same). Slaying him brings the **Goddess of Dawn**, who congratulates you and carries you home to your initial overworld spawn.


## v194 -- Hell is its own dimension: tower transit only, no walking between
- 🔥 **Separate worlds, same numbers**: hell is now a full dimension — the surface never rolls hell ground (the old disc is ordinary wilds there) and hell is hell ground inside the disc, impassable void outside it. Chunks, delves and names persist per dimension; the map, teleport and quests only ever show the hero's current side.
- 🗼 **Towers only**: E on a surface tower hops to hell (first entry lands 2200–2800 from the dark castle, later returns to the recorded side); E on a hell tower hops back. Each side remembers its own position, death wakes on the side it happened, and dungeons persist per side.
- 👥 **Same-side co-op**: multiplayer positions, entity snapshots, tile breaks and chest loot all carry the dimension — cross-dimension remotes never shape bubbles, fights, sims or shares.
- 🗺️ Old saves rebuild terrain once so the split bakes in; hero progression kept.


## v193 -- Holding-mates hold fire, hell grows its own four holdings
- 🕊️ **No more friendly fire in enemy holdings**: garrison-mates are allies (shared baseId) — orcs no longer maul orcs or their own warchief (and vice versa). Melee, arrows, spells, splashes and auras all skip holding-mates, retaliation never starts a feud between them, and the "hungry mob infighting" fallback only ever picks wild outsiders. Taming offers still hold AI fire as before.
- 🔥 **Hell holds its own four**: the Cinder Warren (ash fiends + Ash Tyrant), Gorehold (blood fiends + Gore Patriarch), Obsidian Citadel (obsidian fiends + Gloom Sovereign) and Fleshpit (flesh fiends + Maw Primogenitor) — mustered at lv60–80 with lv74–80 warlords, each with its own walls, buildings, palettes and war-sign. Hell ground never rolls a surface holding (no more goblin villages in hell) and the surface never rolls a hell one — the existing 60-fiend hell bestiary already held far more than four bases need, so no new mobs were required. Surface war parties stay home (hell is a solo endgame).
- 🗺️ Old saves redraw the world so the hell holdings bake in; hero progression kept.


## v192 -- Hell phase 2: red portals, 90 new fiends, Oblivion tier, demon faces
- 🗼 **Red portals, map teleport**: each tower's heart burns a red portal — E works only standing on it. First touch charts the tower, then teleport back anytime from the map (visited hearths travel too).
- 👹 **86 new fiends**: 60 wild kinds across ash/blood/obsidian/bone/flesh wastes (leeches, blinkers, thorn-hides, splitters, warcriers, broodmothers, charmers — each family fights differently) + 26 delve warlords with their own tricks. Wild wastes cap at lv69; deeper horrors live in the delves (boss codex entries included).
- 🧱 **Hell delves look like hell**: inferno halls in black stone, abyss vaults in crystal, flesh warrens in living blood — walls, floors, decor and set pieces all differ from surface crypts.
- 😈 **Demons look like demons**: civilized succubi/infernals/doom lords render with horns, wings, tails, fel cracks and glow eyes (each class distinct) — and a passive boss-tier **Demon Warden** guards each hold (it won't attack unless struck). Wild fiends spawn away from hold walls.
- 💬 **Chat role fixed**: the NPC class/profession now wraps under their portrait instead of truncating on the right.
- 🌌 **Oblivion tier**: new top gear for every weapon, bow, focus, armor, robe and shield (+ arrows/shurikens) — hell delve chests pay 3x gold and always drop gear (mythril floor), deep hell delves + warlords drop Oblivion. New **Oblivion adventurer rank** (200 contracts) with hell cull postings.
- 🗺️ Old saves redraw the world (v17) so tower-heart portals and new delves bake in; hero progression kept.


## v191 -- Hell continent: fragments, sphere, towers, demon holds, Peter the Fallen
- 🩸 **12 Hell Fragments**: every surface delve lord pays one DISTINCT shard (repeats of the same delve pay once). Track them in 🎒 Inventory + Hell.
- 🔮 **Hell Sphere**: join 12/12 in 🎒 Inventory — the sealed far towers (1000 out: E/W/S/N) wake at your touch. E on a surface tower → hell (first entry lands 2200–2800 from the dark castle); E on a hell tower (2500 ring) → back.
- 🔥 **Far continent**: ash/blood/obsidian/bone/flesh wilds with hell beasts (frenzy), succubi (charm drain + night sleep ambush), doom lords (hound call), infernals (fire aura, lava walk), hell hounds — levels 60–110.
- 😈 **Demon holds**: villages/towns/cities with civilized demons (trade/chat/recruit) in alien obsidian/bone/flesh builds; hell delves run inferno/abyss/flesh only with warlord bosses.
- 👑 **Center castle (16000,0)**: lava moat + double ring, portal room → **Peter the Fallen** (meteor + beam + tide + court adds). Old saves redraw the world (towers, holds, castle bake in; hero progression kept).


## v190 -- Reliable effect tooltips, teeth rot away, party tabs split
- 🛠️ **Status tooltips always show**: effect chips keep stable hover targets while their countdowns tick, so the description (e.g. ☠️ Poisoned — loses % max HP per second until cured) reliably appears on hover instead of sometimes vanishing.
- 🦷 **Doppelganger corpses rot**: revealed teeth now decay on the mob-corpse clock (~2 min) instead of lingering for days, and corpses killed mid-freeze/stun no longer get stuck frozen forever — all dead townsfolk bury properly again.
- ⚔️ **Party menu tabs split**: the You tab's camp sections are now 🧑‍🤝‍🧑 Friends / 💛 Beasts / 🛏️ Rooms tabs, so tamed beasts and inn guests stop cluttering the friend list.


## v189 -- Title slots click-to-select
- 🖱️ **Slots pick themselves**: the "Save to slot" dropdown is gone — clicking a save-file row selects it (blue highlight), and ✨ New journey / 📂 Continue act on the selected slot (first empty picked by default; starting over an occupied slot still asks before overwriting).


## v188 -- Practice level reset wipes stats clean
- ↩️ **Resetting to level 1 starts clean**: in the 🛠️ Practice setup, setting the level back to 1 now strips attributes to base + racial with no refund and zeroes unspent stat points — a fresh build instead of a pumped level-1. Level-ups and partial step-downs behave as before.


## v187 -- Never Ending Drive lifesteal for bare fists
- 🥋 **Never Ending Drive**: new advanced ♾️ Martial Arts node (needs Flurry of Blows 1 + Palm Strike 2) — unarmed attacks, bare-handed strikes and Iron Palm alike, restore 10%/20%/30% of the damage dealt as HP, with a 1s cooldown per trigger. Shadow-clone fists feed their owner too.


## v186 -- Guild contracts get their own quest tab + profile rank
- 🏛️ **Guild tab in the quest log**: guild contracts (Noticeboard postings and commissioned copies) now live under their own 🏛️ Guild tab in 📜 Quests — with progress bars, 🧭 Track, 🛎️ Turn in and Abandon — instead of hiding behind the Counter. Taking or turning in work refreshes the log while it is open. Contract grounds also show their gold markers on the world map, minimap and overworld (🏛️ glyph), and count toward the HUD 📜 button.
- 🎯 **Contract grounds restock as you close in**: arriving at a hunt/haunt with nothing there now mints creditable mobs near the grounds (bounded by the remaining need, simulator-only in multiplayer) — daylight/terrain substitutes included, same as villager quests.
- 📦 **Fetch contracts lead somewhere real too**: every retrieval posting now names gathering grounds (source-beast habitat or matching biome — herbs/wood where they grow, ore/hides/beads where the carriers roam) with the same 🏛️ markers + 🧭 Track, source beasts restock near the grounds, and raiding a tagged source beast always pays one of the contracted goods. Market/craft goods (clay, torches) say so outright, and boss-gated goods never post before you can obtain them (mythril, which only surfaces in deep delve chests, left the pool).
- 🏅 **Adventurer rank on your profile**: the player profile (V) shows a guild strip with your current adventurer rank (Rusty → Dragonbone), contracts completed, progress to the next rank and the payout multiplier.


## v185 -- Important services move to towns and cities
- 🏙️ **Tiered building generation**: SMALL hamlets (village/desert souk/steppe ger/mesa pueblo/frost hold) keep homes + small holy + small culture basics (smithy shed, souk stall, turquoise shop) + inn/stable only — no libraries, bookstores, dojos, black markets, arcane shops, guild halls or civic seats. Every MID town (town/watergate/sakura/fortress) and LARGE metro (city/trade/port/capital) carries the full service set (market, smithy, library, bookstore, dojo, black market, arcane shop) + guild halls + inns. 🏰 **Castles are capital-only** (Grand Castle + all eight culture keeps + palace seats, enforced by a placement guard as well as the layouts).
- 🗺️ **Terrain v15 regen**: loading a pre-v15 save rebuilds its world once via the terrain regen path (chunks + delves wiped, hero kept — stats, gear, spells, tames, quests, gold, party, inn rooms and known places all survive) so older saves port cleanly to the new generation.


## v184 -- Multiplayer without the middleman
- 🌐 **Host-to-host multiplayer**: the channel server is gone — the public PeerJS cloud just introduces your browser to the host's, then every byte flows directly between players (host at the center, same as before). Same codes, same worlds, same 12-player cap; the host's machine IS the world, so they need to stay online. ⚙️ Server settings are now ⚙️ Settings → Channel settings, nothing else moves.


## v183 -- Status tints hug the sprite
- ✨ **No more status boxes**: poison, burn, bleed, sunder, paralyze and the damage-tick flash now tint only the sprite's own pixels (clipped mask, same pulse and colors) instead of filling the whole tile box. Freeze keeps its ice block — the block is the effect.


## v182 -- Mobs and bosses learn the new water tiers
- 🌊 **Weak water mobs splash, strong ones burst**: kappa, nøkk, rusalka, tide turtles, kelpies, wreck eels and the other weak (XP under 100) water kinds now open with Water Jet instead of a channeled war-spell; Tideburst stays on seasoned killers, warlords and apex horrors, and 🐋 Leviathan + the Hydra Broodmother ride the Tidal Wave itself. 🌪️ **Storm kinds spin up**: the Tengu Stormlord and the Tempest Roc field Tornado (apex horrors still draw Hurricane thematically). The Codex movepools and fallback pools match.


## v181 -- Skill trees cap their points
- 🌟 **Trees stop at max**: a skill tree stops earning points once its unspent points could buy every remaining rank (bought + unspent >= max) — no more grinding a finished tree. Old saves trim any surplus past that cap on load (unknown-tree pools go too), and the Character tab says so instead of showing phantom progress.


## v180 -- Water chain, war-rank Tideburst/Tornado, Hurricane goes cataclysm
- 💧 **New beginner spell: Water Jet**: a thin high-pressure jet (mp 8) that opens the water chain — Water Jet → Tideburst → Tidal Wave — so water matches fire/ice/lightning rank for rank. Tomes in libraries and merchant packs.
- 🌊 **Tideburst joins the war rank**: now a channeled war-spell like Immolate (mp 18, power 1.8, 1.5s channel) instead of a starter. 🌪️ **Tornado rises with it** (mp 18, power 2.6). Seasoned killers now field tornado as their war-magic.
- 🌀 **Hurricane is a cataclysm now**: channel 2s, then become the storm's eye — the widest nova in the game (6 tiles, 7.5 mastered) that hurls every foe outward, slows them, and levels the built world, with staggered shock rings, spiral wind arcs, flung debris and a rolling dust wall. Sealed lore only: depth 5+ chests and deep boss hoards, never shops. Wind-apex horrors inherit it thematically.

## v179 -- Real limb animation + boss/mob redesigns
- 🎬 **Limbs actually move now**: legs march, wings beat, tails lash, fins paddle — 22 kinds (all five hated bosses, every serpent, the frostwyrm, plus oni imp, orc shaman, kappa, kobold, yuki-onna and troll whelp) re-render real walk cycles, hit-braces and attack poses instead of just shaking. Serpent coils ripple down the body, the wyvern matriarch's sails beat, the tidecaller's crest waves, magma cracks pulse with each stride.
- 🎨 **Bosses rebuilt from scratch**: the Goblin King is a crowned war-monarch with mantle and bone sceptre, the Oni Daimyō a kabuto-helmed warlord with war-banner and kanabo, the Wyvern Matriarch a broad-sailed draconic queen, Fenrir Alpha a real spectral wolf (long legs, high head, brush tail, ice-rune slashes), and the Leviathan a coiled deep-sea serpent king with paddling fins, lure and gaping maw — no more blue box.
- 🎨 **Mobs rebuilt too**: kappa gets its beak, shell and shimmering head-dish; kobold its snout and spear; yuki-onna floats with billowing sleeves and drifting snow; troll whelp its great nose and mossy hide; hydra heads widen with fanged jaws; sandmaw gets a proper maw ring.

## v178 -- Mobs move: idle, walk, attack, hurt, death animations
- 🎬 **Everything animates now**: every mob, NPC, hero, tame and boss idles (breathing, hovering, slithering, slime squash), walks with a motion-tracked gait, lunges on swings, rears up on casts, flashes white with a directional jolt when hit, and tips over on death. Winged kinds hover and flap, ghosts float, swarms jitter — all transform-based, so it costs nothing and never re-renders a sprite. Remote players' swings and casts replay as lunges on your screen too.


## v177 -- Every sprite redrawn in high detail
- 🎨 **No more blocky mobs**: all mob, boss and outlaw sprites redrawn at max detail — separated limbs, shaded faces, fangs and claws, glowing eyes, bark plates, jeweled crowns, fanged hydra jaws, faceted crystal golems and glacier-serpent fins. Winged kinds fly on broad feathered or membrane sails (harpy, phoenix, wyverns, roc, siren, stymphalian), every horse got a flowing mane and blanket, and bosses carry their regalia (egg mounds, coral crowns, Gleipnir chains, foxfire orbs, brood eggs).


## v176 -- Codex shows every mob's real weapons
- 🗡️ **True Wields lines**: every mob entry now mirrors the actual spawn fitting — art wielders show their family's steel per band (low · mid · high, with the mythril floor for apex horrors), everyone else shows the war-gear draw (sword/spear/bow examples per band plus the full random pool and bow odds), bosses show steel below lv20 and dragonbone above, and every line names the worn plate on its armor track. All names resolve live, so balance edits appear automatically.


## v175 -- Service pins on both maps
- 🗺️ **Find every service at a glance**: the minimap and the Known World map now pin special buildings with the same glyphs — 🪙 markets, 🛏️ inns, ⚒️ forges, 📖 libraries/bookstores, ✨ arcane shops, 🌑 black markets, ⚔️ dojos, 🍵 tea houses, 🛁 baths, ⛪ chapels, 🌊 tide temples, ⛩️ shrines, 🔮 rune circles, 🐴 stables, 🧬 beast lodges. Regular houses never pin, collapsed buildings drop off, and the minimap keeps one pin per tile so rows of shops stay readable. Legend lives under the Known World map.


## v174 -- Move while casting
- 🚶 **Channels no longer root**: higher-tier spells and cataclysms charge on the move — hero, mobs, bosses, allies, clones and tames can all reposition mid-channel. Weapon attacks and further casts stay held until release (bows, strikes, smashes, bombs and new spells wait), and tidal-wave riders are still carried by the water.
- 🗡️🛡️ **War-gear check**: low mobs rusty / low bosses steel, mid mobs steel-or-mythril / mid bosses dragonbone, high mobs and bosses dragonbone with the top of their armor track (holy vestments, shadowweave, dragonbone plate) — verified and kept.



## v173 -- Ditto clones + band war-gear with plate
- 🌑 **Only you see the shadows**: Disciples of Shadow clones are perfect dittos to everyone else — fellow travelers render pixel-identical copies of your hero (same sprite, name, level, HP bar; positions sync over multiplayer), your maps mark them purple but theirs mark them like you, and mobs/bosses can never identify the real one (shuffled target ties, random-copy retaliation, scripted spawns open on the nearest copy — voidstalkers included). Host-simulated mobs hunt and wound your clones through routed clone-indexed hits.
- 🗡️🛡️ **Band war-gear with plate**: low mobs draw rusty, low bosses steel; mid mobs draw steel or mythril, mid bosses dragonbone; high mobs and bosses all draw dragonbone plus the top of their armor track (holy vestments for casters, shadowweave for speedsters, dragonbone plate for the rest). Worn armor counts in combat (DEF/SDEF + resists); tames keep caught plate and old saves backfill.



## v172 -- Mobs draw steel, learn per player, mix by odds
- 🗡️ **Every mob and boss spawns armed**: template archers always take the bow, everyone else draws randomly — a bow ~22% of the time, otherwise a level-tiered melee weapon (swords and spears weighted, axes/hammers/daggers/whips in the mix; art-wielders keep their art's matching steel, bosses draw too — their cast gate stays exempt but their strikes ride the blade). Wild bows fire **infinite arrows** (no quiver), with an arrow tier fit to level. Old-save mobs draw theirs on the next tick.
- 🧠 **Per-player, per-move memory**: each mob remembers what each of YOUR heroes actually took, move by move — trained on every landed blow and updated continuously, so a mid-fight respec shifts the mix within a few hits. In multiplayer every player teaches their own lesson: routed wounds train host-side, and your machine reports the true post-armor wound back (throttled) so the sim learns reality.
- 🎲 **Probability picks, cooldowns included**: each tick filters what's actually ready (a cooling best move yields to the next-best), then draws by expected damage — all moves start equal, the best earns ~1.8x the worst's weight, and a 15% roll fires something else entirely so the mix never goes stale. Boss signature tricks are untouched.



## v171 -- Mobs learn what hurts you
- 🧠 **Adaptive offense**: every landed blow teaches your enemies — they track whether steel or spells actually hurt you, then lean into what works (a fortitude wall of SDEF eats fewer spells and more claws; a glass cannon eats the reverse). No data yet means a true even mix, and a 15% floor keeps every fight mixed so nothing ever locks onto one answer.
- ⚔️ **Ranged mobs press in**: beasts that used to sit at range and spam bolts now close to melee on their physical ticks instead of casting into resistance — and finish with point-blank bolts in close when you're soft to magic.



## v170 -- Sexes you can see + pick your hero's
- ♂♀ **Males and females look different now**: every mob, boss and NPC renders its sex — males run darker and bulkier, females lighter and slightly smaller, and women (heroines, villagers, huntresses...) get lashes, a pinched waist and sexed hairstyles (long hair and buns for them, short cuts and beards for the men). Genderless horrors and mimics stay exactly as they were.
- 🧑‍🤝‍🧑 **Choose your hero's sex**: the creator has a ♂ Male / ♀ Female picker (preview included, 🎲 mixes it too) — heroines render with the feminine touches above. Existing heroes default to male, so every current save looks pixel-identical until reincarnation.



## v169 -- Genders: males, females, and the genderless
- ♂♀ **Everyone has a sex now**: every NPC, mob, boss, tame and slave is Male, Female, or Genderless — shown with ♂/♀/⚲ in chat, the lodge breed board, the black-market stalls and the Bestiary. Fixed by name: Harpy Matriarchs, Rusalka Queens, Medusas, Baba Yagas and Yuki-onna are always female; Kobold Kings, warlords, jarls, rajas, emperors and alphas always male; mimics, constructs and horrors are genderless. Everyone else rolls per individual from their name (kings read male, queens female), stable across reloads — old saves backfill automatically.
- 🧬 **Breeding needs ♂ + ♀**: beast lodges only pair one male with one female of the same kin (same for bound slaves) — same-sex pairs and genderless kin are refused up front. Newborns roll their own sex and count as tamed as before.



## v168 -- Luck dodges to 95, warlords fight dirtier
- 🍀 **Luck dodge caps at 95%**: the LUK dodge (+0.5%/pt) now climbs all the way to a 95% total dodge cap (was 40–50%) — visible in the Luck stat line and the Codex mitigation order.
- 👹 **Warlords go to 12 moves**: boss loadouts grow from 9 to 12 slots — at least 3 of their highest-tier spells plus at least 2 techniques (a thin technique pool substitutes another high-tier spell). Codex boss + arsenal entries teach the new kit.



## v167 -- Guild Update
- 🧭 **Culls point at real grounds**: kill contracts no longer say "anywhere" — each names a hunting ground where the mark naturally lives (biome + direction + distance), and kills only credit near those grounds. House jobs name a real nearby house: low ranks clear bat infestations, high ranks only haunts (banshees and fellow horrors). No beasts spawn in the guild.
- 🐲 **Peak dragons stay peak**: apex culls (Peak Dragon et al) only ever post at Dragonbone rank, and point at true highland lairs — hailstorm, whiteout, miasma, stormwall, soul-glare, voidchill — or at a live ancient scouts already see denning. Never a dragon in a random field.
- 📌 **Boards rotate, pins are exclusive**: every guildhall's Noticeboard refreshes every few minutes even if nobody takes anything, and each pin goes to ONE hand — accepted pins vanish for everyone (shared across multiplayer travelers).
- 🏅 **Rank gates severity**: posting pools widen with adventurer rank (simple fetch/kill + vermin early, silver/haunt work mid, mythril trouble late, apex at the top), and payouts keep scaling with rank as before.
- 📜 **Player commissions**: the guild Counter now has Commissions + ➕ Commission tabs — post ⚔️ kill work (pick beast, level, count) or 📦 fetch work (pick goods, count); the price follows the mark and the haul. Commissions never rotate away, live in their own section, and stay open until settled. Commissioners collect the fetched goods (or the extermination confirmation) at any Counter afterwards.
- 🧭 **Adventurers work your postings**: adventurer-class NPCs pick up open commissions, walk out to the grounds, fight the marks (and can die trying), then haul back to a Counter to turn in. Follow them if you like. Fellow multiplayer travelers can take and turn in the same commissions — whoever turns in first wins the bounty.



## v166 -- Apex ancients demand a fully maxed Taming tree
- 👑 **Peak-dragon-tier taming**: all six lv-70 apex ancients (Peak Dragon, Frostwyrm, Mire Hydra, Tempest Roc, Prism Colossus, Umbral Wyrm) now CAN submit — but only for a hero with a **fully maxed 🐾 Taming tree** (every node at max), and even then each beaten ancient rolls **once (5%)** for whether it ever asks (submit 0–25% HP, E within 45s). The rest never yield, whatever the beating. Warlords still never submit.
- 📖 Codex + Taming tab + Apex Bond text now teach the rule (per-mob Special lines, traits row, Highlands guide).



## v165 -- Five new highlands, five new ancients, lairs push back
- 🗺️ **Five new high-level wilds**: frostcrown glaciers, blightmire bogs, stormcrag cliffs, crystal scars and umbral wastes join mountains and volcanoes (all ~lv40-46, cap 50) — and every highland blob is much bigger, so these read as regions, not speckles.
- 👑 **Five new apex ancients**: the Frostwyrm, Mire Hydra, Tempest Roc, Prism Colossus and Umbral Wyrm roost at **lv70 with mid-tier-boss bodies** beside the Peak Dragon — one signature ancient per highland (65% of its rare rolls).
- 🌪️ **Lairs push back**: each ancient wears its weather as a ~18-tile warning ring — hail, whiteout, miasma, stormwall, soul-glare, voidchill (cinderwind in calderas) — draining HP, shoving you outward and clouding your vision. The toast on entry is the choice: turn back or press on. Frostcrown pines chop frostwood; mire hydras dive their bog pools.
- 🌍 **Old ground redrawn**: pre-v165 saves keep the hero and wipe the terrain (chunks + delves), so the new highlands bake in clean. Codex gains a Highlands guide + per-mob lair lines.


## v164 -- Mountains and volcanoes hit 50; apex ancients hit 70
- 🏔️ **Frontier danger up**: mountain/volcano mobs now run ~lv40 all the way to a **lv50 cap** (was ~26/30) — the far wilds finally hit like the deep delves' front porch.
- 🐉 **Apex ancients go boss-tier**: peak dragons and the other peak/caldera horrors (lesser wyverns, velociraptors, wyvern fledglings, kitsune tricksters) roost at **lv70 with mid-tier-boss bodies** (peak dragon ~22k HP) — no boss flags, so taming still works if you dare.







## v163 -- Castles gather in the capitals; old worlds rebuild once
- 👑 **Castles move to the capitals**: the eight culture keeps now stand only in capitals (kept in their home-culture styles), so villages, towns and metros bake fresh ground without them. Religious and other buildings are untouched.
- 🌍 **Old saves rebuild once, heroes intact**: loading a pre-v163 save remakes the world — new terrain, towns, NPCs and delves, with the starting town rising anew — while your hero keeps everything that matters: stats, gear, spells, techniques, tames, quests, kills and gold.



## v162 -- Full house? Taming fails, recruits room at the inn
- ⛔ **No pen, no taming**: whip-taming (and black-market beast buying) with a full alongside share now needs an unlocked open stable pen — with nowhere to sleep, the beast won't submit and the offer stands (nothing is taken, the wild mob stays). Unlock a pen slot or raise a box (🐴 Stable) first.
- 🛏️ **Party full? Recruits room at the inn**: buying a slave, collecting a bred slave-child, or recruiting a friend with a full party files them straight into a vacant paid inn room (already bought — no extra gold, retrievable at any inn). Only when the party AND the inn are both full do purchases/recruits fail, with your gold untouched.



## v161 -- Inns room your retired party
- 🛏️ **Retire at any inn**: E at an inn counter opens the inn roster — retire party members AND slaves into paid rooms (first 2 free, further rooms 600g+ and dearer each time, like stable pens), then retrieve them from ANY inn worldwide. Guests mend while they rest, keep their levels, and never rot away. Slaves room at inns only — never in stable pens (beasts only there). The Party menu (P) lists your roomed guests with a Find Inn compass.
- ⛓️ **Slaves get proper names in the ledgers**: newly bought and newborn bound NPCs now carry unique ids, so inn rooms, breeding jobs and party tabs never mix them up.



## v160 -- Furniture breaks, and you can build your own
- 🪑 **Hearth furniture now smashes**: beds, bookshelves, tables, altars, anvils, hearths, troughs — everything inside a house, shop or hall (except the stable/lodge service anchors) breaks under attacks, mobs and bombs, with material-based HP (fragile 40, wood 120, stone 250). Smash a shelf and its lorebook goes with it; smash every nexus counter and the shop still trades from the bare floor. E hints, sleep, books and shop menus all skip the rubble.
- 🛏️ **Craft your own furniture**: 10 new base kits (bed, bookshelf, table, chair, crate, barrel, hearth, altar, anvil, trough — wood/stone/iron costs in Inventory → Crafting). Use a kit, click walkable ground, and it stands there permanently: sleep in your bedroll, heal at your altar, drink at your trough. The only way to remove one is to break it — yours smash exactly like the hearths'.



## v159 -- Shops get counters, kings sell charters, walls go up brick by brick
- 🏪 **Settlement shops open trade menus**: E at a market, smithy, tea house, library/bookstore, dojo, black market, arcane circle or stable pen opens a two-pane menu (shop stock left, your pack right) with per-kind tabs and price/name sorting. Markets sell low-tier mats/meds cheaper with unlimited supply and buy fairer (no weapons/armor); smithies sell low-tier arms/armor and pay fairly for high-tier gear; tea houses and libraries run the same menu for food/drink and low-mid tomes.
- 🥋🥀✨ **Dojo, black market, arcane**: dojos refund stat points (1000g each); the new 🌑 Black Market sells temp-buff drugs (HP/MP/stamina costs), low-level tamable non-horse beasts (stat/level pricing, sellable, counts as tamed) and low-level bound NPCs (no loyalty, breedable in Beast Lodges, never counts for taming skills); arcane shops enchant plain weapons (tier x enchant pricing).
- 🧱👑 **Build your own**: craft brick walls/doors/glass windows + a 12-quartz home portal in Inventory, Use then click walkable ground to place (destroy-only removal; portals bind respawn). Capital Kings (lv80, seated in the throne room of the huge village-sized Grand Castle at each capital's heart) sell consumable Market/Smith/Dojo/Arcane/Stable charters — placed stalls work like real shops and break like real walls. Old saves rebuild terrain once under v12 with stats intact.



## v158 -- The Beast Lodge breeds, the Stable stores
- 🧬 **Breeding moves to its own building**: the old Bestiary is now the **Beast Lodge** — towns, cities and metros always keep one beside the Stable (small hamlets sometimes do). E at its gene-cradle nexus opens the lodge modal on its 🧬 Breed tab: hand over two living same-kin beasts for a few real minutes, then return to the SAME lodge to collect both parents + one newborn. The 📖 Bestiary archive lives there too.
- 🐴 **Stables only stable**: the stable modal is now just 📦 Boxes (paid pen grids) + 🐴 Horse Market (buy stable-bred horses, sell yours) — no more breeding or browsing at the pens. Old lodges and in-progress pairings keep working: legacy Bestiary buildings are recognised, and old "Bestiary" titles display as Beast Lodge.



## v157 -- Low tiers join the same curve
- ⚔️ **Bottom tiers pulled up**: rusty/iron/steel/silver flats raised (swords now 8 → 17 → 36 → 48 → 83 → 175; daggers 6 → 14 → 33 → 45 → 79 → 169), bows 8 → 18 → 34 → 58 → 66 → 150, foci quartz/ruby/sapphire up (wands 5/16/36, staves 12/34/74 MATK with 15/50/100 MP), armor lifted across the bottom (cloth +4/+6/+5 SDEF/+20 MP, leather +10/+26, iron +18/+55, wayfarer +20/+70/+40 MP, steel +32/+120, shadowweave +40/+150, mage +22/+100 MP, archmage +55/+200 MP), shields 5/15/30/36 (+10/+50/+120/+150 HP), iron/steel/silver hybrids +7–8 each (ember 20, venom 24, cinder/tide 40, frost 42, storm 45, smite 44, sanctified 48, spark 68, tide 66), emberplate +40/+160 and tideward +54, trinkets up (hunter +20, scholar +24/+80 MP, mercy +100, lucky +60/60). Mythril/dragon anchors and all prices untouched.
- 📖 Codex reads live bonuses, so every table already shows the new numbers. Early game hits noticeably harder — say the word if mobs should be retuned to match.



## v156 -- Smoother gear curve, mythril at ~+75
- ⚔️ **No more 30→100 cliff**: flat boosts now climb smoothly every tier instead of jumping. Swords go 4 → 12 → 30 → 34 → 83 → 175 ATK (iron +7, steel +24, silver +28, mythril +75, dragonbone +163); staves/wands, bows (3 → 10 → 22 → 55 → 62 → 150), armor, shields, hybrids and legendaries all follow the same curve (e.g. mythril plate +55 DEF/+220 HP, dragonbone plate +115/+480; oathbow +182, wyrmfang +170, stormcall +86, dawnbreaker +96). Starters untouched.
- 📖 Codex gear entries already read live bonuses, so every table shows the new numbers. Expect mid-tier heroes to hit noticeably harder — the curve finally matches the mob scaling from v152–v154.



## v155 -- High-tier gear costs a fortune
- 💰 **Top tiers run tens of thousands**: weapons, armor and clothing repriced on a ~10x curve — mythril sword 5,200g, dragonbone sword 16,000g / hammer 24,000g / shield 22,000g, dragonbone plate 18,500g, and legendaries from 42,000g (Dawnbreaker) to 48,000g (Oathbow). Starters stay cheap (rusted sword 80g, old bow 120g, cloth robe 90g), so the opening plays as before.
- ⚖️ **The gold loop keeps up**: chests, corpses, boss hoards, deep-vault caches, quest rewards and NPC purses all pay ~10x more, so high-end shelves and selling boss loot stay reachable. Stables (pens, boxes, horse market 1,500–9,500g), breeding fees and party field-care (100g heal / 500g revive) scale the same way; starting purse is 300g. Gift/healing loyalty rates and consumable prices are untouched.



## v154 -- NPCs and tames scale with level
- 🛡️ **Frontier folk are tougher**: NPC bodies now grow with their level (same accelerating curve family as mobs, gentler rates, caps bind at 100) instead of every guard sharing the lv1 body. Level 1 is byte-identical to before — only higher levels climb (lv30 guard ~122 HP / ~20 ATK vs 54 / 10 before, before gear). Party members grow through the same curve on level-up, with worn gear re-applied on top so nothing is lost.
- 🐾 **Raised beasts track the wild**: tames now anchor to their kind's wild growth curve when caught, bred or bought, and every level re-applies those ratios — a wolf raised from lv5 reaches the same neighborhood as a wild lv60 wolf (its own ± variation and breeding mutations ride along). Old saves backfill the anchor at the current level, so growth resumes from the next level with no retroactive jump. Stable-bred horses and bestiary newborns anchor the same way.
- 📖 Codex mob curves already climb to each kind's ceiling (v153) — raised tames finally match what the tables promise.



## v153 -- Every mob scales to its ceiling
- 🐺 **Ordinary beasts keep growing to 100**: normal mob stat ceilings were binding around lv45-55, so a lv100 wyvern wore the same body as its lv60 self. Per-stat ceilings are now tuned to bind exactly at each kind's level ceiling (100 ordinary, 125 bosses) — identical stats at every level below the old plateau, climbing after (e.g. wyvern HP ~2.3k@60 → ~5.5k@100, peak dragon ~7.8k → ~18k). Ordinary SPD gets +1.0 headroom and stamina caps scale to 100, so ancients stay quick and tireless without turn order running away.
- 📖 Codex tables already show the new curves live (slider + milestones to 100) — ancient beasts finally look ancient.



## v152 -- Bosses scale to 125
- 👹 **Warlords keep growing past 60**: boss stat ceilings were binding around lv35-45, so every boss wore the same body from 60 to 125. Boss growth curves now climb all the way to the 125 ceiling (per-stat ceilings tuned to bind exactly at 125), with extra SPD headroom and stamina for long fights. Identical stats at every level below the old plateau — only 60+ gets stronger, matching the buffed high-tier gear. Ordinary beasts are untouched.
- 📖 Codex boss tables already show the new curves live (slider + milestones) — ancient warlords finally look ancient.
- 📖 **Mob stats at every level**: every beast and boss entry now has a level slider that computes its stats live at each level (HP/MP/ATK/MATK/DEF/SDEF/SPD/XP with the same +- variation wild spawns roll), plus a milestone table (1/10/20/.../100/125) — all calculated in realtime, nothing stored. Works in the popup window too.
- 🗡️ **Gear shows its world look**: every weapon and armor entry now previews the actual in-game hero sprite wearing/wielding it (bows, staves, dragonbone blades and all), rendered from the same art the overworld uses. Shields note their off-hand role.
- 💪 **High-tier gear buff**: flat bonuses now scale with tier (multipliers unchanged) — steel around +10, mythril around +30, dragonbone around +100 (e.g. dragonbone sword +102 ATK, dragonbone plate +100 DEF/+400 HP, dragonhorn staff +101 ATK/+202 MATK/+250 MP). Wands, staffs and robes scale the same way (sapphire ~+10/+20, holy bead/emerald ~+30/+60, archmage robe +20 MATK, holy vestments +30 MATK; staff MP 15→250 by tier). Late-game gear stays relevant at high levels.



## v150 -- Codex moves to its own window
- 📖 **Codex opens in a separate window**: the title-screen 📖 Codex button now pops the reference out into its own browser window (all six tabs, search, portraits, details) instead of rendering inside the title menu. It's a self-contained snapshot of live game data — reopen it anytime to refresh after balance edits. If your browser blocks it, allow popups for the site and click again.



## v149 -- The Bestiary building keeps your monster archive
- 📖 **Bestiary archive**: every 🐴 Stable and 🧬 Bestiary lodge now has a 📖 Bestiary tab — the in-game monster compendium. Everything you meet is recorded automatically (nearby beasts register as seen, kills tally per kind), and the tab shows each known beast's portrait, stats, abilities and slain count. Unseen kinds stay ??? until you encounter them — go meet everything.
- 🧬 **Bestiary E hint says it**: the floating hint now reads "browse beasts & breed tames".



## v148 -- Bestiaries breed beasts, and no two wilds alike
- 🧬 **Bestiaries**: towns, cities and metros always keep a second lodge beside the Stable (small hamlets sometimes do) — press E at its gene-cradle nexus to open the lodge modal on its 🧬 Breed tab. Hand over two living beasts for a few real minutes (several pairs at once), then return to the SAME bestiary to collect both parents + one newborn. The fee scales with both parents' levels, stats and attacks; lodging parents can't fight, ride, or stable meanwhile.
- 🐺 **Every wild beast rolls its own body**: overworld and dungeon spawns now vary slightly around their template (HP/MP/ATK ±8%, DEF/SDEF ±1, SPD ±0.2, XP ±10%) — same kind and level are siblings, not clones. Tames keep the body they were caught with, which is what makes same-kind breeding worth doing: combine a high-HP wolf with a high-ATK one.
- 🐾 **Breeding is kinship-based, newborns count as tamed**: steeds (any horse × any horse, incl. cinder steeds), hounds (wolves, pups, tanuki, jackals, foxes, gnolls), shellbacks (tide + magma turtles), coils (serpents/eels), skyborn (flyers) and swarms (giant insects) interbreed; anything else breeds same-kind only. Each newborn inherits a random mix of its parents' stats and attacks, sometimes mutates (±stats and/or a bonus beast attack), and counts toward Beastmastery, Locust Swarm and lifetime taming history exactly like a whip-tamed beast.



## v147 -- Horse market, paid pens, lifetime tames
- 🐴 **Horse Market**: the stable's second tab buys stable-bred horses — Meadow Pony 150g, Gallant Courser 300g, Bulwark Destrier 375g, Silverwind Charger 575g, Royal Aegis 950g (more HP, faster, tougher hides than any wild horse — but no attack training). It also buys YOUR horses for level-based gold (train one up, sell it on). Only horses ever trade — no other mount or beast.
- 📦 **Pens cost gold now**: the first row of each 6x6 box is free, every further pen cell costs gold, and each new box costs more than the last. Old saves keep every pen their beasts already sleep in — nobody pays for what's grandfathered in.
- 🐾 **Taming history never fades**: bought horses count as tamed (Beastmastery points, Locust Swarm deed), and the 50-tame / 10-insect counters track your lifetime total — selling or releasing a beast never un-earns skill points or techniques.




## v146 -- No more sealed doors
- 🚪 **Houses you can always enter**: a load-time backfill heals legacy chunks whose doors baked shut (a neighbour wall directly on the door front becomes walkable rubble with a broken-fence gap, trees/water/lava take the normal path) — plus the same soft-ground approach fix fresh chunks get. Fresh bakes now also repair boundary-chunk doors whose settlement does not own the chunk center. Verified live: 4244 doors across 147 settlements/holdings audited, every front clear of building shapes.

## v145 -- Smaller boxes, beast sidebar
- 🐴 **Stable boxes are 6x6 now**: tighter grids (36 slots each, still unlimited boxes — old 9x9 saves re-pack automatically, no beast left behind). Selecting a beast opens a **sidebar with its portrait plus full stats** (HP/MP, ATK/DEF/SDEF/SPD, ride status) alongside the Retrieve/Ride/Revive/Rename/Move/Release buttons.

## v144 -- Boxes and swarms
- 🐴 **Stable box grids**: the lodge now files rested beasts into unlimited 9x9 BOX grids (one box per page, + New Box free) — the With-you roster Stores into the open box, and clicking a cell offers Retrieve/Ride/Revive-50g/Rename/Move-to-box/Release. Every mid and large city is guaranteed its lodge (strict pass, then a road/plaza-relaxed pass with a 5x4 last resort — terrain and other buildings are never stamped over).
- 🦗 **Locust Swarm needs a real swarm now**: tame 50 beasts including at least 10 insects (roster insects count once each; progress shows in the Taming tab).

## v143 -- Small freezes, charmed beasts
- ❄️ **Low-tier freezes are brief now**: Frostbolt holds foes 0.5s (was 1.2s), Frostbite 0.9s (was 1.5s), Tideburst 0.5s (was 1s) — Glacier keeps the full 2.5s, and Whiteout/Tidal Wave stay the deep-freeze payoff. Spell descs state their freeze time.
- 😊 **Charm hardens your tamed beasts**: on top of the party's +10/+10 damage per point, tames hit +5 harder per Charm point (melee, spells, bows and thrown arms). The Attributes tab says so on the Charm row.

## v142 -- Lighter-footed, less so
- 🤸 **Agility gives +0.1 move speed per point** (was +0.2). Weapon & flurry speed unchanged.

## v141 -- Armor works on spells again
- 🛡️ **Projectiles mitigated correctly**: every projectile hit (spells, arrows, mob bolts, wave rides, splashes, chains) was adding 40% of the *victim's* DEF as bonus damage on top of skipping mitigation — armor made spells hit harder, so tanks died to lv3 mobs while glass cannons barely noticed. All projectile-originated hits now mitigate with DEF/SDEF exactly like direct blows. Your 566-damage Yuki-onna frostbolt now lands for 1.

## v140 -- Routed hits respect armor now
- 🛡️ **Multiplayer joiners take mitigated damage**: wounds routed from the host/simulator used to land nearly raw (only armor % resisted) because the sender simulates victims as statless proxies — your DEF/SDEF never applied. A tank could melt in seconds to trash mobs as a joiner. Routed hits now subtract the owner's real DEF/SDEF (same two layers as local blows, combined), so a 2253-SDEF hero takes 1s from the same tidebursts that hit for ~122 before. Routed hits also join the incoming-hit log, so they show in the death audit.

## v139 -- Deaths keep their receipts
- 🪦 **Falls are audited now**: the death screen names your level, DEF/SDEF and max HP and lists the last blows that put you down (attacker + level + spell/strike + damage each) — no more guessing which mob in the gang actually killed you. Your last fall's spot is marked on the minimap (grey dot) while it is nearby, and the details persist on the hero (`lastDeath`) for later inspection.

## v138 -- Doubled stat boosts
- 💪 **Every stat point does double**: STR +10 ATK (+1% melee/flurry, +4 bomb, +8% arrow status), END +10 DEF (+10 stamina, +1% regen), FOR +10 HP (+10 spell defence, +1% regen), INT +10 MP (+10 spell damage, +1% regen), CHA +10/+10 party damage (+4% loyalty, +6% party XP, better taming/stealth), LUK +2% crit (+10% crit damage, +0.5% dodge), AGI +0.2 speed (+0.5% attack speed). Same 3 points per level — each one just goes twice as far. Mob growth was tuned against the old rates, so the wilds will feel easier until it is re-tuned to match.

## v137 -- Every mob grows its own way
- 🐗 **Per-kind accelerating growth**: every mob kind now scales differently — the template is its level-1 body and each stat grows on its own curve that gets steeper with level (a 32→33 bump grants ~3x what 2→3 did, same proportions throughout). **Casters** pour growth into mana + spell power (a new `matk` stat their spells cast off — physical hits still use ATK), **bruisers** into attack + health, **tanks** into defence, **speedsters** into speed, and stamina pools grow too (bosses go through theirs). Canonically stronger kinds scale harder and **bosses scale hardest**, with their kind-tier bulk stacked on top. Growth plateaus at ancient levels so deep horrors stay killable. Tames inherit the body they were caught with (matk included).

## v136 -- Mobs scale with level again
- 🐗 **Mob stats match their level**: a kind's template is its level-1 body — higher-level spawns scale up (HP/MP +10%/level, ATK +6%/level, DEF/SDEF +5%/level, SPD +0.02/level capped +1.2). A lv30 goblin hits much harder and takes much longer to drop than a lv3 one; deep-delve horrors (lv100+) are true walls of HP. Boss kind-tier bulk still applies on top, and XP rewards still scale so the stat points keep flowing. Players, NPCs and tames stay pure-stats (levels grant points, never numbers) — this is the only level term left in combat.

## v135 -- Pure stats, no level scaling
- 📊 **Combat runs on stats, not levels**: HP/MP/ATK/DEF/SDEF/SPD no longer grow with level — only your 7 attributes + gear move them (levels still grant 3 stat points each, plus XP, unlocks and gates). Mobs and NPCs likewise fight with flat per-kind bodies (boss kinds keep their kind-tier bulk); XP rewards still scale so points keep flowing. Bombs hit with STR, not level; NPC/tame level-ups heal but add no stats; bosses halve Backstab and the boss ward still caps fight-ending hits — the old level-based shrugs are gone.

## v134 -- Disciples demand practiced escapes
- 🌑 **Disciples of Shadow need 20 Ejects**: the unarmed clone-art now also requires 20 successful ⏏️ Eject escapes (bare-handed damage + 35 kills as before) — slip away to learn to multiply. Progress shows in the latent-technique list, and the Eject description says so.

## v133 -- Practice setup resets stats too
- ↩️ **Reset stats in the practice grounds**: the 🛠️ Practice setup's utilities gain a Reset stats button — all seven attributes return to base + racial bonus and every spent stat point is refunded, so builds can be re-specced freely without touching level, spells or gear.

## v132 -- Nights belong to the undead
- 🌙 **More undead after dark, far fewer living**: night overworld spawns now pick undead ~85% of the time (skeletons, wraiths, draugr, mummies, banshees and every undead-flagged kind), with room for extra bodies per chunk and a faster spawn tick — so the risen truly multiply while beasts and brigands thin to ~15% of night spawns. Daytime gloom (deep forest) keeps its old even mix.

## v131 -- Legacy cleanup reaches practice + multiplayer
- 🧹 **The old-world rebuild now covers every door**: practice grounds (slot P) run the exact same pre-v11 world rebuild as slots 1-5 on entry, and hosting a pre-v11 multiplayer channel wipes its stale channel world on the host's machine (same reset — position, party, torches, explored fog — hero records kept, starting town rises anew). Individual chunks already self-healed on read; stale NPCs, old delves and stranded hero state no longer slip through.

## v130 -- The grave hungers more
- 💀 **Undead split rate 2% → 10%**: every landed direct hit on a non-boss undead mob now has a 1-in-10 chance to tear another of the same kind out of the dark (±1 level, aggroed on the attacker, splits chain).

## v129 -- Grenouille go lucky
- 🐸 **Grenouille racials shift from agility to luck**: frog-folk now get +4 Luck / +3 Intellect (was +4 Agility / +3 Intellect). Existing grenouille heroes migrate automatically — the 4 old agility points move to luck, nothing stacks or duplicates.

## v128 -- Techniques get their own inventory tab
- ⚔️ **No more double-listed techniques**: the 🎒 Inventory's ✨ Spells tab used to render every active art twice (once as a castable ability, once as a known deed). Techniques now have their own ⚔️ Techniques tab — actives (bindable, castable) + learnt passives (always on) + latent deed progress each appear exactly once, and ✨ Spells is spells again.

## v127 -- The grave answers back
- 💀 **Undead multiply if you dawdle**: every landed direct hit on an undead mob (skeletons, wraiths, draugr, mummies, banshees…) has a 2% chance to tear another of the same kind out of the dark — about the same level (±1), crawling out beside its victim and already furious at you. Summoned ones split too, so slow kills snowball: burn them down fast or bring silver. Undead bosses never split.

## v126 -- Portals ask: travel on, or bind your respawn
- 🌀 **Hearth portals now ask first**: pressing E at a portal opens a choice — ✨ Travel to another town (the Known-world map, as before) or 🏠 Set as respawn. Binding one wakes you at that hearth's portal when you fall instead of always trekking back to your starting town. The dialog shows your current bind, the death screen's button names it ("🏠 Wake up at Thornshire"), and old saves simply start unbound — starting town, exactly like before.

## v125 -- Skill tabs flag spendable points
- ✨ **Never hunt for points again**: the Character menu's tabs now show exactly where points wait — 📊 Attributes keeps its count, and 🗡️ Weapons / ✨ Spells / ⚔️ Techniques tabs each show (+N) with a pulsing gold ring whenever anything inside them (or the legacy anywhere-pool) is spendable. Every tree button does the same, so the tree with your point lights up before you even open it.

## v124 -- You pick the autosave pace
- 💾 **Autosave on your schedule**: the game used to save every 12 seconds with no say in the matter. Now both the title-screen ⚙️ Options sidebar and the pause menu (☰ → 💾 Autosave) offer Off (manual saves only), 15s, 30s, 1 min, 2 min or 5 min — one shared setting for all worlds, starting at every minute. Manual saves (💾 Save now, Save & title, slot switches) and event saves (death, discoveries) always still happen.

## v123 -- Phantom guard fix
- 🛡️ **No more phantom parries**: a save written with a guard window open could reload it as a near-permanent invisible guard — every frontal hit showed 🛡️ PARRY with no Q pressed (and blocked real Q guards, so it never cleared). Guard and mirror timers are now wiped on every save and every load, so parries only ever come from your own timed Q guards, Fighter's Instinct rolls, or Stalwart Reflector. Already-affected characters are repaired automatically the next time they load.

## v122 -- Server settings move to the title screen
- ⚙️ **Channel settings live pre-game now**: every Created World on the title screen has a ⚙️ Server button next to ▶️ Host. The host can change 👥 companions/player (0–8) there — but only while no one is playing. The dialog reads the live value straight from the server, and the change takes effect the next time the world is hosted. Mid-game changes are gone (the in-game host controls are removed; the live cap still shows in the presence line), and the server itself rejects setting changes while anyone is online.

## v121 -- Old worlds rebuild once under the new construction (read this first)
- ⚠️ **Loading an old save rebuilds its world — once, on purpose**: the whole world-building layer was rewritten from scratch (v11), so the first time you load a pre-v121 save, its map, towns, NPCs and dungeons are wiped and regenerated cleanly in the new world. Your **hero keeps everything that matters** — stats, gear, spells, techniques, tames, quests, kills and gold — but wakes up at the starting town's portal with a cleared party and fresh fog of war. If your old town had broken or ghost buildings, this is the fix: they can't survive the rebuild.

## v120 -- Techniques tab + practice-makes-perfect skill points
- ⚔️ **Techniques get their own room**: the Character menu (C) now has four tabs — 📊 Attributes | 🗡️ Weapons | ✨ Spells | ⚔️ Techniques. Active arts and learnt passive arts moved out of Spells into Techniques, with their own tree buttons, point balances and progress lines.
- 🌟 **Skills grow by doing, not by leveling**: level-ups grant stat points only. Every skill tree earns its OWN points by practice — 25 landed hits per weapon-tree point (swords by sword hits, thrown arms feed Hurling, a wielded wand/staff also drinks from your casts), 15 casts per spell point, 10 casts per active-technique point, 12 triggered openings per passive-technique point, 8 casts per cataclysm point, 6 parries per Parrying point and 6 shield parries per Shieldwork point. Points never cross trees, full trees stop counting, and each tree shows its balance plus progress to the next point (e.g. 🌟 2 Swordplay points · 17/25 landed hits). Leftover generic points on old saves still spend anywhere as a legacy pool, but nothing new ever fills it.

## v119 -- Off-hand, parry, shields
- 🛡️ **A second hand for your hero**: pick any hotbar slot as your 🛡️ off-hand in 🎒 Inventory (cyan ring on the bar, default slot 4) and press **Q** (or the new 🛡️ button) to use it — spells, torches and throwables (bombs, shurikens, smoke, potions) fire as normal, but a weapon, a shield, or an empty slot **parries** instead (off-hand steel never swings). A timed parry cuts the blow to **1/5** bare-handed, **1/10** with a weapon, **1/20 × shield tier** with a shield — wood 1.0, iron 0.9, steel 0.8, silver 0.65, **mythril 0.3** (only 0.015 of head-on), dragonbone 0.2. The 📜 quest log moved to **J** to free Q.
- 🛡️ **Six shields to hide behind**: wooden buckler → iron → steel → silver → mythril → dragonbone shield (forge them, loot them by tier, smiths stock iron from day one). Worn shields guard passively (+DEF and +SDEF by tier), and every armor now adds explicit magical defence (SDEF) by tier on top of its HP/physical bulk — robes guard the mind, plate barely does.
- 🤺 **Guard arts to master**: new 🤺 Parrying tree (Open Window +0.15s window/rank, Quick Recovery −0.12s cooldown/rank, Fighter's Instinct 4% auto-parry/rank, Perfect Guard capstone halves parry fractions) and 🛡️ Shieldwork tree (Shield Guard +1 DEF/SDEF per rank while a shield is worn, Rebound 8%/rank chance to hurl half the parried blow back, Bulwark ×0.9 parried damage/rank, Aegis capstone: full-power rebounds +25% chance). Parry your way to the 🛡️ **Stalwart Reflector** technique (deed: parry blows + 10 kills) — a 2s mirror guard (Mastery 3s) that hurls every attack back while you take nothing. Requires a shield equipped.

## v118 -- Pick your default weapon
- ⚔️ **The default weapon is yours to pick**: the gold ⚔️ Attack Slot is no longer stuck on slot 1 — choose any slot in 🎒 Inventory via ⚔️ Default weapon, or just press a weapon's hotkey in-world and that slot becomes the default on the spot (first press selects + equips, second swings). The attack button, mouse click and empty Space all follow your pick, techniques check the wielded default, and the gold highlight + ⚔️N label move with it.

## v117 -- Smoke, shurikens and tiered shafts
- 💨 **Smoke bombs, shurikens and arrow tiers**: 💨 smoke bombs blind everyone caught (until cured) — craft ×3, hunters/ninjas stock them, chests sometimes hide them. ✴️ Shurikens hurl from the hand in five tiers (iron 1.0x → dragonbone 2.6x, cast ×20 per ore — a single ore makes 20), one spent per throw, with their own 🌀 Hurling skill tree (Sharp Edges, Fan Toss free second star, Long Arm range, Smoke Veil longer/wider blindness, Storm of Stars capstone). Arrows gain steel/silver/mythril/dragonbone tiers (1.3/1.5/1.8/2.2x), all fletched ×20 for ore — iron is 1 ore per 20 now. Two thrown techniques: 💥 Exploding Shuriken (6x + burn + splash, Mastery 7x) and 🟢 Slime Shuriken (slow + light poison, Mastery crueler) — both hurl your finest star and spend it, no weapon required.

## v116 -- Overlapping hearths stop sharing walls
- 🏘️ **Yes — buildings from different hearths were overlapping**: settlement rolls are independent, so neighbouring hearths occasionally land closer than the sum of their radii (verified live: two fortresses 50 tiles apart, a sakura/town pair 48 apart). Each placed buildings knowing only its own radius, so both claimed the same ground — the bake drew one hearth's ground through the other's walls while facades and backfills stamped both. Placement is neighbour-aware now: a lodge is only placed where its own hearth wins every footprint + door-front tile (strictly nearest, ties lose), and never inside a neighbour's ring/moat/canal/pond/road band. The tile backfills (and door-front repair) only touch tiles their building's hearth owns, so old overlap zones settle into one coherent hearth instead of fighting every 8s. Isolated hearths are byte-identical to before.

## v115 -- Wall-less buildings heal, leaner session caches
- 🧱 **The glitched-manor deadlock is fixed**: a building whose walls went missing without player damage (stale bake, drifted layout, cleared ghost) read as collapsed — and the tile backfill skipped collapsed buildings, so it could NEVER heal, across saves and reloads. The stamp now runs heal-first: bare footprints (no rubble, no damage marks) re-stamp walls/doors/windows/floors on contact, while smashed holes and fully demolished rubble buildings stay exactly as you left them. Ring walls and holding rings are never overwritten, and backfills invalidate the ground cache when they change tiles, so healed walls paint immediately.
- 🧠 **Session caches stay bounded**: World memory maps (chunks/npcs/dungeons) and mob paint caches are LRU-capped now — marathon sessions can't grow them for the whole tab lifetime. All are write-through caches, so eviction just re-reads from storage.

## v114 -- Old cities rebuild themselves
- 🧱 **No more glitched manors on old saves**: towns baked before the v113 scale-up kept their small-layout tiles, so new bigger-layout buildings read as collapsed (bare ground + furniture, no house). Stale chunks now re-bake on load when they hold building tiles or sit inside a current settlement — walls line up again, and hearths keep their names, lore and enrichment. One-time, on contact.

## v113 -- Bigger hearths, one-of-every-culture looks
- 🏙️ **Three settlement tiers, each ~10x the last**: hamlets stay small (r11-13, a handful of plots), mid-size towns grow to r32-36 (~65-95 plots), and trade/port/capital metros sprawl to r75-95 (150-300 plots) — building counts scale with the walls. Metros refuse to spawn on top of neighbours (crowded rolls downgrade to towns), and port bays, piers and the capital citadel ring all scale with the bigger radii.
- 🏠 **Every culture reads at a glance**: round felt gers with crown rings and guy ropes, open horse-pen corrals (dirt, rails, hay, trough — no flower beds), flat adobe roofs with parapets and viga beams, stepped pueblo tiers with ladders, steep snow-capped frost gables with icicles, per-culture awning stripes (red souk, teal turquoise, blue fish, purple bazaar), brass harbor portholes, a glowing beacon lamp on a narrowed lighthouse shaft, and matching lawn scatter (clay pots, yucca and red rock, snowdrifts, steppe tufts). Every new-culture exterior now rates 8+/10 (ger, palace and keep 9).

## v112 -- Practice mode opens for first-timers
- 🥋 **Practice grounds no longer strand new visitors**: entering practice with no practice world yet asked you to name your hero *behind* the loading screen — an invisible dialog, so it sat on "Raking the sand..." forever. The hero creator now opens first (title visible, no loader), and the loading screen only appears once your hero is named.

## v111 -- New cultures, trade cities, ports and a capital
- 🌍 **Seven new hearths**: desert souks with an oasis, steppe ger camps, mesa pueblos, frost holds with a frozen pond — all four can found your starting town — plus far-off **trade cities** (grand bazaars), **port cities** (harbor bay, piers, lighthouse) and the **capital** (double walls, inner citadel, castle keep + palace).
- 🏛️ **Authority & culture roles**: monarch, noble, knight, chancellor, high priest, marshal, guildmaster, magistrate, harbormaster, dockworker, desert nomad, steppe rider, mesa shaman and frost skald — new pixel outfits you can also borrow in the hero creator, with themed names, voices, workplaces and guards that intervene.
- 🏠 **Thirty new buildings**: adobe houses, souk stalls, caravanserais, sun temples, gers, horse pens, sky shrines, khan halls, pueblos, kivas, turquoise shops, snow cottages, ice halls, saunas, grand bazaars, counting houses, merchant villas, lighthouses, harbor offices, fish markets, palaces, castle keeps (structural, like the great hall), noble villas, chanceries, high temples and more — same fenced-plot, X-ray, collapse and door-gate rules throughout.

## v110 -- Practice setup can't leak into real games
- 🛠️ **The build lab stays in the grounds**: mashing T during a pause-menu world switch used to strand the Practice setup open over the incoming world — leaving level-ups, learn-everything and free gear live on real singleplayer/multiplayer heroes. World entry now sweeps it shut, it refuses to open mid-load, any stranded copy closes itself (and swallows clicks), and every setup action re-checks the practice flag. The pause-menu button also starts hidden until a practice world earns it.

## v109 -- One card style everywhere, Forest Vale from the first pixel
- 🎨 **Every menu wears the profile flair**: modal cards now share the profile card's chunky 3D border, rounded corners and gradient header band in all six themes, with matching section titles — inventory, character, party, chat, shops, title screen and the rest finally look like they belong together.
- 🌲 **No more Emberhold flash on load**: the saved (or default Forest Vale) theme is applied synchronously before first paint, so fresh visits open straight into Forest Vale instead of showing Emberhold first.

## v108 -- Dungeon bosses are bulwarks now
- 🛡️ **Bosses take a beating like bosses**: every warlord carries tier-scaled bulk (more HP, more physical DEF, and its own spell defence) plus a damage ward — no single hit can deal more than 30% (low tier) / 9% (mid) / 3.5% (high tier) of its max HP. Maxed-out cataclysms now need a few hits on early warlords, ~a dozen mid-way, and many on deep horrors. Small level-appropriate hits never reach the ward, so early delves play exactly as before. Capped hits flash a 🛡️.
- 🎯 **No two warlords resist alike**: each boss runs one defence a little lower (blade-frail or spell-frail) and nurses one thematic elemental weakness (~+10% from that element — burn the troll, shock the drowned, blind the crypt-lords with holy light).

## v107 -- Practice re-entry, link-proof joining, spear icons
- 🛠️ **Practice grounds no longer freeze on re-entry**: coming back to an existing practice world used to strand you on a blank screen (title hidden, world never loading). Re-entry now loads the grounds directly — set your level, learn arts, grab gear, fight.
- 🌐 **Joining takes the whole invite link**: the code box accepts a bare code OR a full link — even a mangled doubled one (`https://…https://…`) — and pulls the channel code out of it instead of failing. Pasting a link that points nowhere still tells you plainly.
- 🔱 **Spears look like spears**: every spear-family weapon (Rusted through Dragon's Bone, Venom, Tempest, Stormwyrm Halberd) now shows 🔱 instead of a sword, bow, or storm cloud.

## v106 -- Fullscreen/display feature removed
- 🧹 **The ⛶ fullscreen saga is gone**: the whole Display experiment (v101–v104: full-tab, fullscreen-over-the-ad-bar, and its follow-ups) never shipped as loaded code and only generated changelog noise — removed the module, its dead UI hooks and its patch notes. The game just fills its frame; no behavior change.

## v105 -- Threads actually on + cheaper frames
- 🧵 **Worldgen finally uses your cores**: the worker pool existed but was never loaded — now wired in (before `world.js`) and sized to the machine (cores − 1, up to 8 workers instead of max 3). New wild chunks build in parallel across cores with idle ring-prefetch warming the cache; settlement/base chunks still build on the main thread, and everything falls back to sync gen if workers are unavailable.
- 🎨 **One texture for all tiles**: every tile sprite is packed into a single atlas canvas, so the ground layer binds one GPU texture instead of ~35 tiny ones.
- ⚡ **No more per-frame tile re-scan**: the visible-tile checksum that guards the ground cache re-runs only when its inputs move (new chunks, camera crossing a tile, zoom/dungeon/resize) plus a 30-frame safety net — walking pans reuse the cache instead of doing hundreds of chunk lookups a frame (~96% of scans eliminated in testing, steady 60fps).
- 🌙 **Half-res darkness**: the night/dungeon lighting overlay renders at half resolution and upscales — 1/4 the fill cost, identical look. `Game.perfStats()` now also reports checksum runs/skips, atlas cells and the thread pool.

## v100 -- Delve floor travel, Eject spell, deep dragonbone
- 🕳️ **Delves remember your depths**: every floor you reach is charted (per hero, per delve). Re-entering a delve offers a floor-select menu, the 🌀 way-down portal offers every charted floor plus one push deeper, and the entry stairs offer the surface plus any charted floor — no more one-way trips down. Each traveler can only pick floors THEY earned (multiplayer-safe).
- ⏏️ **Eject, the escape every hero knows**: instantly flings you a short distance to nearby open ground (no line-of-sight needed) — for when shifting walls seal over your tile. Free to cast, 50s cooldown, pre-bound in your spellbook. The dungeon itself also spits wall-embedded heroes back onto open ground now.
- 🦴 **Dragonbone runs deep**: dragon-kind mobs (and dragon bosses) in delves drop bone/horn only at effective depth 6+ — no more dragon bones off level-1 fledglings. Overworld dragons still pay.

## v99 -- Spacebar hotbar slot + attack-slot authority
- ⌨️ **Space is a 10th hotbar slot**: bind anything to it in 🎒 inventory (I) — abilities/items fire on Space, and empty Space is an extra ⚔️ attack button using your Attack Slot weapon (or bare fists).
- 🗡️ **Slot 1 owns your attack**: the normal attack (button/click/Space) now uses ONLY hotbar slot 1 for damage (empty = bare fists, so Martial Arts works). Side weapon slots swing their own blade for one hit without re-wielding, and wands/staves elsewhere still boost spells without hijacking melee.

## v98 -- Seen parties + host companion cap
- 👀 **Travelers' parties walk truly**: companions ride the pos channel with real positions, looks (role/tint/appearance), names + HP — on the world canvas, Known World map, minimap and 🌐 presence rosters (dungeons included; old senders fall back to ring formation).
- 👥 **Host decides the companion cap (0–8)**: pick it at channel creation, change it later from 🌐 presence → Channel settings (host only). Every client enforces the same cap; rosters above a lowered cap stay, only new recruits block.

## v97 -- Obscure mechanics in multiplayer
- 👁️ **The Voidstalker stalks whoever is actually down there**: in a shared delve it hunts the nearest living occupant — not just the simulator's own hero — and its backstab opener lands on a co-delver through the normal wound route (dodge/armor/death resolve on their screen).
- 🌊 **Divers stay sunk on every screen**: shared-delve replicas now adopt the submerged flag both ways, so kelpies/moles hold their dive on peers' screens (and can't be farmed with phantom hits while hidden).
- 👑 **Bosses + mimic teeth converge in delves**: boss / portal-mimic / tricked / exposed flags now ride onto existing delve replicas (they already rode new materializations), and overworld bosses publish their crown through every snapshot channel.

## v96 -- Multiplayer taming + riding
- 💛 **Yielded beasts show their offer on every screen**: the sim's tame flag now rides snapshots, so non-hosts see the 💛 yield and can press E to tame it too.
- 🐴 **Tames claim the wild mob everywhere**: pressing E on a shared beast sends a tame claim that deletes it on every screen — no more duplicate twin popping back, and the sim can't execute it a tick later. Riding works the moment the beast is yours.

## v95 -- Allies, player trading + MP fixes
- 🤝 **Allies**: ask any traveler to ally (chat or 🌐 presence) — allies deal NO damage to each other, and glow green with names on the Known World map, minimap and in the world.
- ⚖️ **Player trade menu**: talking to a traveler now opens an in-game trade menu (tabbed pockets, no popups) — 🎁 Give instantly, or ⚖️ Offer so they can give something back and YOU approve the swap.
- 🐛 **MP fixes**: shared-delve kills now leave lootable corpses on every screen; overworld loot races say "already claimed" instead of failing silently; you can see fellow travelers' party members; Revive/Heal on NPCs and mobs now sticks in multiplayer.

## v94 -- Sealed world-tree branches
- 🌳 **Yggdrasil branches stop falling for lumberjacks**: chopping old-forest pines could drop world-tree branches at any level — now, like chests and mob drops, they only fall once a level-50+ dungeon boss has fallen. Same seal, every source. (Also: tide pearls no longer show up in low-level fisher shops — level 35+, matching their boss gate.)

## v93 -- Dash follow-through flurries
- 💨 **Hold attack through a dash and keep swinging**: Feint Attack dashes, Dragon Coil surges, Shadowsteps and Hook Snare yanks now land a bonus weapon swing on arrival while you hold attack (Shadowstep + held attack is an instant backstab) — and holding attack while riding a Tidal Wave hurls swings down the foam line at flurry speed. Every bonus swing costs stamina like any other.

## v92 -- Weapon swing speeds + DPS ladder
- ⚔️ **Normal swings now ride the weapon too**: daggers cycle fastest, then swords, axes, hammers and bows slowest (same tier) — and better tiers quicken every family. Slower families hit slightly harder per swing, so they still win damage-per-second by a hair (~1% per rung: sword over dagger, axe over sword, hammer over axe). The ⚔️ button and hotbar swings respect the same rhythm now — no more mashing past it.

## v91 -- Weapon-driven flurry speed
- 🌀 **Flurry speed now rides your weapon**: lighter families flurry faster — dagger > sword > axe > hammer (bows flurry like same-tier hammers) — and higher tiers flurry faster too. Strength still quickens every swing. Faster bursts burn stamina faster, so pick your burst.

## v90 -- Faster, Strength-driven flurry
- 🌀 **Flurry got faster and scales with Strength**: sprint flurry now swings at a 0.18s cadence (up from 0.24s), and every Strength point over 5 quickens it further (−0.004s per point, down to a 0.10s floor). Stamina costs still cap each burst.

## v89 -- Space unbound, sprint flurries
- ⌨️ **Spacebar is fully unbound**: Space no longer swings your weapon — attacking is click / ⚔️ button and the 1-9 hotbar keys. This also kills the old hold-Space flurry-of-slashes glitch (it bypassed the swing cooldown entirely).
- 🌀 **Sprint flurry**: hold attack while sprinting (Shift + move) and your swings come out much faster — a real, balanced version of the glitch. Every swing still costs stamina on top of sprint drain, so bursts burn out in a few seconds.

## v88 -- Stamina, sharper stats, ninjas & thieves
- ⚡ **Stamina bar**: sprinting, sword swings, chopping and bow shots tire you out now (Endurance raises your max by +5 per point). It refills fast when you ease off — but an exhausted hero can't sprint.
- 💪 **Stats hit harder and clearer**: Strength adds +5 physical damage (+0.5% melee/chop per point), Endurance +5 physical defence, Agility +0.1 speed and +0.25% dodge, Intellect +5 mana, +5 spell damage and cheaper spells (−0.5% cost), Luck gives +1% crits that hit +5% harder plus +5% gold and rarer finds, and Charm leads your party (+0.5% companion damage, −0.5% damage taken, +2% loyalty, cheaper shops).
- ❤️‍🩹 **Fortitude, the 7th stat**: +5 max HP and +5 spell defence per point — spells now test against spell defence instead of armor, so battle-mages want both.
- 🧬 **Racial bonuses reworked**: Humans +1 to everything; Werewolves +4 Strength/+3 Speed; Grenouilles +4 Speed/+3 Intellect; Kinnatma +4 Strength/+3 Fortitude. The hero creator is roomier with bigger race cards, and the picked race now glows gold with a ✓ SELECTED badge — no more guessing.
- 🥷 **Ninjas & thieves move in**: two new occupations wander towns and cities (ninjas favor sakura towns and fortresses, thieves haunt cities and docks) — with their own looks, talk, shops (daggers vs. suspiciously cheap odds and ends), and tricks (ninjas blind and poison before they spin). Both are playable styles too: pick Ninja or Thief as your hero's outfit in the creator.

## v87 -- See every buff & debuff
- ✨ **Your hero panel shows active effects**: every buff (Shieldwall, Warcry, Ember/Blessed Weapon, Unseen, Honed, Roused) and every debuff (poison, burn, freeze, paralyze, blind, bleed, sunder, stun, slowed) now appears as a chip on the top-right hero panel and the full profile card (V) — with seconds left, ticking down live, tooltips included.
- ⚔️ **Teammate tabs too**: open any friend's Party tab (P) and their own buffs and debuffs sit right under their health and mana. Empty means clean — no chips, no clutter.

## v86 -- One saddle: your mount travels, the rest lodge
- 🐴 **No more trailing pack**: ONE beast travels with you now (R to ride / dismount — it stands by when you hop off). Every other beast rests in a 🐴 Stable or carries a lent friend — never roaming loose. Taming mid-ride, switching saddles and old herd-follow saves all lodge the extras safely (levels kept; loads say what got put away).
- 🐴 **Ride from anywhere**: the Party menu (P) lists stabled beasts with their own Ride buttons, and the Stable modal rides too — switching rests whoever you were riding. Friends accept lodge beasts directly from their 🐴 Their mount tab (no fetch trip); taking one back keeps it with you if your saddle is empty, else lodges it.
- ⚔️ **Mounts die with their riders**: your ridden mount falls with you (and a lent one falls with its friend) — bodies rest at the Stable and mend. Delves are still party-only ground: your beast waits at the entrance while you're down there.

## v85 -- Mounts stop hijacking E
- 🐴 **Pressing E while mounted talks to the world again**: ridden (and lent) beasts could leak into the villager records, so the horse under you counted as the nearest "NPC" and stole every E press into its own chatbox. Beasts now persist only in your herd — never as villagers — and old leaked entries are evicted on load. Your mount also stops double-dipping party XP and drawing a duplicate name tag.

## v84 -- Lend mounts to your party
- 🐴 **Beasts get their own slots**: tames no longer eat friend slots — 4 NPC companions + 5 active beasts, each tracked separately (overflow tames stable as before).
- 🐴 **Lend a mount to any companion**: open their Party tab → 🐴 Their mount → Lend. They ride your beast at full mount speed (water/lava crossings included), it sticks to them instead of wandering, and their own beast waits for them when you Take it back. Leaving, stabling, releasing or losing the beast hands everything back cleanly.

## v83 -- Mounted riders sit astride
- 🐴 **The beast is visible again**: the mount draws at full size under the rider as before, but the rider now sits lifted astride instead of covering the horse entirely — for NPC mounts, your own hero, and remote heroes alike.
- 🐴 **Mounts face their heading**: beast and rider mirror left/right with travel direction (faceAng), so westbound riders no longer moonwalk their horses.

## v82 -- Crafting lesson + Spells tab
- 🎓 **Wayfarer Training gains a crafting lesson**: after gathering herbs, trainees brew or whittle something in 🎒 Inventory → 🔨 Crafting (torches take a single 🪵 wood) — with the same golden-arrow spotlight as the other menu lessons. Older saves get the new step appended, still to do.
- ✨ **Spells get their own tab**: spells, known techniques and latent-technique progress moved out of the bottom of 🎒 Inventory into a dedicated ✨ Spells tab (with counts and search) — Weapons is weapons again.

## v81 -- Lorebooks, full chapters
- 📖 **Every volume is 4+ paragraphs now**: all 224 volumes across the 56 sagas were expanded in-voice (same faith, same facts, same quarrels) — witnesses, rituals, marginalia, torn pages. Nothing else changed: same books, same shelves, same modal.

## v80 -- Quest-givers read (half-remembered) lorebooks
- 📜 **Lore-colored quests**: most quest stories are now tainted INDIRECTLY by 1–4 random lorebook fragments — a rumor the giver heard, a torn page they kept, a small related detail to check (never the lore retold). Very rarely, a dungeon-entry quest names its boss straight from a matching book's pages.

## v79 -- Lorebooks: read the world's quarrels in place
- 📖 **Books you read, never take**: shelves in chapels, churches, cathedrals, shrines, tide temples, homes, halls and shops hold readable lorebooks (gold glint + "📖 read" chip, E to read in place) — and delve floors hide them too (libraries hold whole stacks).
- ⚔️ **56 sagas × 4 volumes (224 fragments)** about bosses, the drowned city, the delves, the four peoples — told by six quarreling faiths (☀️ Sun Throne, 🌊 Tide Covenant, 💀 Pale Liturgy, 🔥 Ember Creed, 🌿 Rootcircle, 🕳️ Gloam Witnesses) who agree on what happened and call each other liars about what it means. One faith's god is another's utmost evil.
- 🧩 **Piece it together**: every volume is fragmentary (torn pages, washed ink, cross-refs to volumes you may never find); the 📖 modal tracks found/missing volumes per saga and keeps every fragment re-readable.

## v78 -- Procedural names for every settlement (no more Sakura-everything)
- 🗾 **Sakura towns sound Japanese now**: seeded mora weaving with rendaku compounds (Hanagawa, Tsukiyama, Nishitsukiyama, Sakuranuma) instead of 8 fixed names on endless repeat — and only ~2% even contain "sakura".
- 🏰 **Every culture weaves its own**: Norse-dwarven holds (Kazthol, Runedor), nautical ports (Sluicewater, Saltquay), pastoral hamlets/towns/cities (Barleywick, Thornburgh, Eldermere), wild regions (Gloamwood-style mood+landform).
- 👥 **Villagers get woven first+last names too** (Ren Yamaguchi, Haruto Takajima, Bromm Ironhelm, Marlow Tidewater) — same-seed stable, collision-free within each place, so no more "Gretas with numbers".
- 🌱 Spawn hearths (new games + MP channels) draw from the same weaver.

## v77 -- Mana costs by tier (cheap starters, pricey finishers)
- 💧 **Tier 1 stays cheap (≤10 MP)**: Fireball, Frostbite, Frostbolt, Heal, Whirlwind, Shieldwall, Venom, Dazzle, Tideburst, Cleanse, Shadowstep, Hook Snare, Ember Weapon, Viper Flurry, Iron Palm, Feint Attack — untouched.
- 🔷 **Tier 2 rises (11–25 MP)**: Lightning/Smite/Immolate 18, Glacier/Thunder Hex 17, Revive/Panacea 22, Warcry/Blessed Weapon 20, Cinder Edge/Tempest Lance/Dragon Coil 20, Skullsplitter/Avalanche/Spiral Pike/Thorn Reign 22, Comet Shot/Hammerfell 24, Holy Sword 25.
- 🌊 **Tier 3 cataclysms (35–40 MP)**: Whiteout 35, Tidal Wave 36, Meteorfall 38, Energy Beam 40.

## v76 -- Technique animations pass (from 3/10 to 7-8/10)
- 🌀 **Spiral Pike**: the hero corkscrews through a full spin while steel arcs fly, a spark vortex drags inward, and the guard stance lands in two late shimmer rings + boot dust.
- 🐉 **Dragon Coil Rush**: embers converge as the coil gathers, the surge slithers(side-to-side weave), twin forked beams mark the line, and venom pools linger on the ground where it passed.
- 🌧️ **Thorn Reign**: bow-bloom arcs + leaf burst on cast, bigger alternating darts, and the earth grows teeth — delayed thorn spikes erupt through the fan zone in two waves.
- ☄️ **Comet Shot**: embers inhale before launch, screen flash + shake, a thicker launch pillar, a bigger comet — and every landing craters (rings, ember smoke, scorch, thump).
- 💥 **Hammerfell Impact**: white flash + heavy shake on impact, four staggered rings, then 8 glowing ground cracks race outward, rock shards stab skyward, a dust wall rolls and rubble rains.
- ✨ **Engine**: particles support delays (choreographed beats), new puff (dust) + crack (fissure) shapes, screen shake, hit-flash, and caster spin. Passives flash too — Sentinel pings "tip!", Skirmisher "close!".

## v75 -- Hammerfell Impact: the earth answers
- 💥 **New hammer technique: Hammerfell Impact** (deeds, not tomes — hammer damage + 30 kills): slam the ground for a 7x shockwave across a huge ring (radius 4, Mastery: 5) that stuns everyone caught for 1.5s (Mastery: 2.5s, 8x). Staggered triple shock rings, dust arcs and rubble spray sell the slam. Potency/Surge sharpen it like every art.

## v74 -- Spear + bow technique catch-up (6 new deeds)
- 🔱 **Spear learns 3 arts**: 🌪️ Spiral Pike (5x whirling sweep all around + 4s guard stance that hardens DEF like Shieldwall; Mastery 6x + 6s) — learnt with spear damage + 20 kills; 🐉 Dragon Coil Rush (coil toward a foe, then surge ~4.5 tiles through the line for a 7x venomed skewer + poison; Mastery 8.5x, longer surge) — nature + spear damage; 📏 Sentinel's Reach (passive: spear tip strikes past 2.2 tiles hit 2x, Mastery 2.5x, Opening widens to 1.6).
- 🏹 **Bow learns 3 arts (its first actives!)**: 🌧️ Thorn Reign (fan of 7 piercing thorn arrows, each 2.2x nature — Mastery 9 arrows + venom, no arrows spent); ☄️ Comet Shot (one huge piercing fire comet, 9x + burn + splash — Mastery 11x, wider splash); 🦅 Skirmisher (passive, Deadeye's mirror: bow shots inside 3.5 tiles hit 2x, Mastery 2.5x, Opening widens to 5).
- ✨ Each art has its own weather: spiral steel arcs + twin rings + guard bubble, dragon coil beam trail + venom motes, thorn fan spokes + green rings, comet sky-beam + fire rings. Progress shows greyed-out in 🎒 Inventory like every deed.

## v73 -- Quest log Ok button + spotlight stays in the game
- ✓ **Every quest gets an Ok button**: each quest entry now leads with a highlighted gold ✓ Ok that closes the log and refocuses that quest (tutorial: jumps the spotlight back to the current lesson) — Abandon stays last as a quiet ghost, so it is never the button that looks like it should be pressed.
- 🎓 **The training spotlight can't escape the game**: quitting to the title (or sitting on loading) now always kills the tutorial dim + arrow immediately, and the guide itself refuses to render outside active gameplay — no more lesson tips floating over the title screen.
- 🎓 **The tome lesson points at the Read button**: with the pack open, the training spotlight now sits on the ❄️ Tome row itself (tap it), then moves onto the real 📖 Read button once selected — the tip parks beside the button instead of covering it. Esc-closing any modal also re-anchors the spotlight immediately rather than leaving a stale glow behind.

## v72 -- Training lives in the pause menu too
- 🎓 **Wayfarer Training, anytime**: the guided tutorial quest now has a 🎓 Training button right in the ☰ pause menu (next to ❓ How to play), alongside the existing one in ❓ Help. Rejoin mid-training to jump back to the quest log, start fresh if you skipped it, or reclaim the iron-forged reward choice if every lesson is done.

## v71 -- No more ghost NPCs/mobs in multiplayer
- Everyone sees the same villagers and monsters: joiners used to keep showing fighters the host had already dropped (killed mobs whose corpses ride no snapshot, capped-out or despawned entries) - frozen copies the host never saw, sometimes even at the wrong level. Replicas whose entry goes quiet while the host streams are now reaped within seconds instead of forking ghosts, and takeovers only happen when the whole stream goes quiet (host actually gone).
- Shared mobs carry their real identity: replicas adopt the host's level, name, max HP and tint, so the same Kobold can't be lv3 on one screen and lv1 on the other. The full snapshot now covers 32 NPCs + 28 mobs (relay cap raised to match), so everything position-tracked also gets its identity a moment later.
- Quest summons stop flickering: slay-quest mobs only spawn on a world simulator now - near-host joiners no longer mint doomed copies that got wiped a tick later (their kills on the host's shared wilds still count toward the quest).

## v70 -- Shared loot + calmer multiplayer battles
- 🧰 **Loot stays looted for everyone**: opened chests, taken quest caches and raided corpses now sync across the channel — no more unopened-looking husks, and no double-dipping the same corpse. Late joiners and walk-ins converge via the host's snapshots.
- 🏘️ **Joiners land in a living town**: the loading screen now holds until villagers around you stream in (with progress text), instead of dropping you into an empty square that pops full seconds later.
- ⚔️ **Enemies fight fair on every screen**: only the world simulator (usually the host) spawns holdings and war parties now — no more flickering almost-enemies — and mob/NPC swings, arrows and spells relay as visuals, so you see the attack that hits you instead of a teleport kill. Shared fighters also carry facing, so pursuit reads clearly.

## v69 -- Channel chat shows each message once
- 💬 **No more double messages**: every channel chat and whisper now carries a unique id, so a retried or double-fired send renders exactly once for everyone — and the Send button/Enter lock while a message is in flight, so double-clicks can't post twice. As a bonus, your own whispers no longer echo back a second copy.

## v68 -- Furniture you can use + twenty dungeon mouths
- ✨ **The furniture works now**: beds, altars, anvils, hearths, bath pools, tea tables, war drums, thrones, feast tables, offering bowls, rune circles and troughs each do something on E — altars and baths cleanse, anvils hone (+10% melee 5 min), drums rouse (+5% damage 5 min), hearths warm, tea restores mana, thrones and feasts mend, offerings (10g) bless, rune circles recharge, troughs slake. Floating chips above them say what E does (beds: "💤 press E to sleep", altars: "✨ press E to heal"), glowing gold in range. The stable's 🐴 is untouched.
- 🕳️ **Every delve gets its own mouth**: ruined towers, cave mouths, mushroom rings, scorched vents, sunken stairs, dark arches, ice arches, lava vents, void rifts, sunken doors, thorn arches, hive mounds, broken hulls, crystal gates, storm spires, desert tombs, gear vaults, fleshy maws, hollow trunks — and whirlpools. Drowned chunks now hide **water delves** (always Leviathan Deep) behind a spinning whirlpool that drags slow swimmers and slow sails toward it — come in fast or come in swimming.

## v67 -- Title lands on Singleplayer + real torch sprites
- ⚔️ **The title opens on Singleplayer**: the old sticky tab memory used to strand returning players on Multiplayer — now Singleplayer is always the landing tab (Multiplayer still takes over for actual `#channel=` invite links, and both tabs still switch by hand).
- 🔥 **Torches look like torches**: planted torches are no longer a floating 🔥 — a wooden haft with a rope-bound head and a three-tongue flickering flame (plus the same warm halo). Dungeon sconce tiles got the same haft-and-flame treatment.

## v66 -- Loot cards for every pickup
- 🎁 **Every gain gets a card**: herbs, quest rewards, recovered caches, entrusted parcels, crafted gear, shop buys and recovered torches now post the same small card under the minimap as chests and corpses — gold + each item, lingering ~5 seconds (hover to hold it). The fast top-line ticker stays as-is; the card is the record that doesn't scroll away.

## v65 -- Loot pops up under the minimap
- 🎁 **Loot cards under the minimap**: chests and looted corpses now also post a small card listing exactly what you got (gold + each item), stacked newest-on-top below the minimap — it lingers ~5 seconds (hover to hold it) so crowded top-line notifications can't whisk your loot away. Follows the minimap at any size, never overlaps it.

## v64 -- Kelpies stay in the water + Burrow Moles dig under it
- 🌊 **Kelpies can only submerge underwater**: beached on dry land they stay surfaced (and breach at once if chased ashore) — no more invisible horses gliding across dry plains. They still dive and ambush in lakes, seas and drowned delves. Wild kelpies no longer roam plains at all.
- 🕳️ **New beast: the Burrow Mole**: a star-nosed digger that roams forests, plains and wilds, tunnels underground where you can't hit it (watch for the fresh diggings mound), then bursts out under its prey with a spinning whirlwind. It can't burrow through water or magma — lured into the shallows it stays up. Corpses sometimes carry dug-up iron, stone and hides.

## v63 -- Mimics can be exposed
- 🦷 **You can strike mimics first**: swinging, shooting, AoE or bombing a false chest tears the disguise off — no 30% bite, no stun, and your hit carries through to the teeth. Only getting tricked (E to open) stuns (3s) and wakes a hungry mimic that keeps chewing percentages (10% max HP per landed hit); exposed mimics fight with plain normal damage.
- 📕 SPEC updated to match.

## v62 -- Feint Attack: three dashes, one cooldown
- 💨 **New active technique: Feint Attack** (deeds, not tomes — dagger damage + 15 kills): a short chained dash, N=3 times in quick succession (Mastery: 4). Each dash carves everyone in your path for a heavy 8x blow; follow-up dashes ride free inside the 5s chain window, and the 18s cooldown only starts when the last dash lands (or the window lapses). Potency/Surge sharpen it like every art.
- 🌊 **Tidal Wave now hurls what it crushes**: the ride shoves survivors ~2 tiles down the facing line, so the wave separates from Feint Attack properly — one throws the crowd, the other threads through it.
- 🗡️ Potency fix, finished: instant arts (Cinder/Skull/Avalanche/Viper/Iron Palm/Holy Sword) finally multiply their own tree's Potency/Surge into the strike — the v60 tree header promised it, the damage sites didn't.
- 📕 Ability, technique and tree text updated to match.

## v61 -- Ride the Tidal Wave
- 🌊 **Tidal Wave is now a ride, not a fireball**: channel 1.5s, then a huge breaking wave carries YOU 13 tiles (16 with Mastery) down the facing line at 6.5 tiles/s — gliding over open water, stopping at walls and lava with a crash. Everything caught in the foam takes the full 7x hit once each plus the soaking freeze (2.5s with Mastery). Attacks and casts hold while you surf; the wave renders as a directional crescent with a white breaking lip, foam rings and spray.
- 📕 Tome and tree text updated to match (ride, don't loose).

## v60 -- Technique skill trees + Cataclysm tier (deep-delve magic)
- ⚔️ **Techniques have their OWN skill trees**: the 7 active techniques ride the familiar Potency/Efficiency/Mastery/Surge shape right in the Spells tab (Potency now truly sharpens each art — Strength-hearted, never Intelligence), and the 3 passives get a bespoke Might/Opening/Mastery/Apex tree — Might +12%/rank, Opening widens the condition (Backstab crits distracted victims, Deadeye's threshold shrinks 6→3 tiles, Executioner's 30%→45% HP), Mastery deepens the cut (2.5x→3x, 2x→2.5x), Apex caps it +25%. Technique masteries: wider Holy dawn (half mana back), crueler Cinder burn, deeper Skull sunder, longer Avalanche freeze, a forking Tempest lance, 8-hit Viper flurry, 12x Iron Palm.
- 🌪️ **Cataclysms — a new spell tier from the deep**: Tidal Wave (crushing rolling wavefront), Energy Beam (channeled storm lance down a line), Meteorfall (skyfire on the crowded ground), Whiteout (freezing nova that also blinds). All channel 1.5–2s rooted while the elements lean in, then release fight-ending power. Their tomes NEVER shelve in shops or overworld chests — they surface only in dungeon chests at effective depth 5+ (better at 8+) and deep boss hoards.
- 🗡️ Potency fix: active technique trees now scale the art itself (was: header-only).

## v59 -- Weapon techniques learnt by deeds + war-spells + distinct steel
- ⚔️ **Techniques (deeds, not tomes)**: every point of player damage is tracked by element + weapon family (+ kills) in `p.techXp`. Hit the thresholds and the technique is learnt automatically with a level-up-style gold banner: Holy Sword (root 3s, then a 50x holy cone + pillar of dawn), Backstab (2.5x from behind / unseen — combo with Shadowstep), Cinder Edge (6x burning arc), Skullsplitter (8x + sunder), Avalanche (6x frozen ring), Tempest Lance (6x piercing storm lance + paralyze), Deadeye (2x arrows past 6 tiles), Viper Flurry (6 x 1.2x + poison), Iron Palm (10x + 2s stun), Executioner (2x melee vs wounded). Passives stack (5x backstab-execute). Progress is listed greyed-out in 🎒 Inventory so the grind has a face.
- 📕 **Five war-spell tomes** (loot + shops, like all spells): Shadowstep (blink behind a foe, blind + unseen), Hook Snare (yank a foe to you), Warcry (+30% melee for you + nearby allies), Ember Weapon (strikes ignite + count as fire), Blessed Weapon (strikes +25% + count as holy) — the blessings are the fast track to Holy Sword / Cinder Edge.
- 🗡️ **Every weapon redrawn**: swords grow rescue-short to dawn-long with guards + pommel gems, axes go single to bearded to double bit, hammers swell to mauls with storm coils, daggers broaden to fangs, spears gain wings + halberd blades, bows recurve tall, foci grow claws + cages — and each element kisses an edge. Swings are element-tinted too.

## v58 -- Every spell looks like its description: waves, spears, bursts
- New SPELL_FX table (game.js): all 10 projectile spells fly their own shape — spears point-first (frostbolt/glacier/smite), venom a dart, dazzle a flash, fire/ice/holy/purple/water orbs for the rest — each with its own speed, elemental trail, impact ring and burst. Exploding bolts (fireball/immolate/glacier) deal half-damage splash around the direct hit (no status on the splash) and pop where they die, including walls and max range; lightning pierces straight through with a sky-strike flash on cast (mastery chains half damage to a second foe over a visible arc); tideburst rolls as a wavefront that hurts everything along its path once each.
- Support spells read too: whirlwind sweeps three dust arcs, heals/cleanses/panacea rise as cross motes, shieldwall holds a lingering bubble shell, revive calls down a pillar of light. Verified live: contact-sheet review scores every spell 8+/10, and damage audited on real mobs (direct 103–112, splash exactly half at 56, wavefront kill along path; submerged divers correctly untargetable).

## v57 -- Stables actually appear: compact paddock fallback + stamped tiles
- Dense hearths (verified live: Throneshire fits zero 7x5 holes) silently got no Stable at all — the lodge is functional, not decoration, so ensureStablePlaced now falls back to a compact 6x5 paddock with the same classKey, notch rules and furnishings (hay/trough/hitches/pen/nexus). Nexus, Find-Stable guidance, map pins, E prompts and the store/retrieve modal all work unchanged.
- Runtime backfill stamps the lodge into pre-fix baked chunks too, clearing only nature (trees are not player property) while still respecting walls-in-progress, rubble, POIs and player torches. Verified live: lodge tiles baked, exterior + plaque + horseshoe sign render, modal opens, overlap audit clean (1147 checks).

## v56 -- NPC schedules fixed: one town, one roster, staffed workplaces
- Fixed the split-brain that kept villagers out of their jobs: center-born NPCs kept sticky key "spawn" while their chunk (and the assign roster) said e.g. "city:0,0", so most villagers were invisible to every bed/workplace rebalance and wandered jobless. Position lookup now checks baked chunk settlement metadata first, the hearth folds into the spawn-city when origin chunks carry a settlement, chunk and position keys derive one way, and old saves migrate on contact (sticky "spawn"/null adopt the real key and get re-dealt).
- No more double-booking: pre-claims are first-claim-wins and capacity-capped, and refreshNpcCache rebalances settlements with unassigned villagers (throttled per key). Verified live in Throneshire: 37/40 nearby on one key, Market 2/2 merchants, Guildhall 2/2 guards, all 4 beds filled with sleepers at night, no shared beds, wilds/party/corpses correctly untouched.

## v55 -- Breached walls now break the lawn fence on the same tile
- The estate fence body was built but never drawn (only gates appeared), so breaches had nothing to break: the full palisade / hedge / parapet ring now draws with door gaps AND breach gaps. A smashed wall or window (RUBBLE) on the plot edge breaks the fence and curb over that exact tile, with a dirt-and-stone rubble spill and snapped fence stubs marking the hole, so the outside shows precisely where the interior wall came down. Unloaded chunks never count as breached; collapse and X-ray unchanged.
- Self-rating: breach signaling 9/10 (tile-exact, all four sides, all fence styles).

## v54 -- Estate exteriors rebuilt: compound houses, real gardens
- Compound estate houses (never one box: stepped wings, sheds, towers, dormers on a centered main so doors stay aligned) with style roofs (thatched straw, shingle rows, slate courses, teal canal seams, curved sakura eaves with ridge horns, riveted iron, stitched hide, bleached slabs, glowing cowl runes), ashlar / timber / hide walls, rafter tails, eave shadows, brick chimneys with smoke, paneled doors with pilasters + lantern sconces, shuttered windows with flower boxes, shoji screens and holy lancets with tracery, rose windows, round attic lights, upper-floor rows, steeples and twin pinnacles, shields along hall eaves, striped awnings, noren curtains, shield-backed class emblems, carved plaque signs, side props (quench barrels, crates, hay, stone lanterns, shrubs) and tent ridge poles with fangs and war paint.
- Lawns read as gardens: mow patches + speckle + grass tufts + pebbles clipped to the plot, cobbled walks with moss joints, raised flower beds with petal rings, corner shrubs, per-style palettes including all enemy holdings, style fences (iron palisades with lantern posts, hedges, stone parapets) and gate pillars with lantern glow. Gates still exactly on real door tiles; smashed walls still break the fence; X-ray and collapse unchanged.
- Self-rated 8-9/10 across the roster (tiny 4x4 lookouts ~7, everything else 8+).

## v53 — Normal mobs rebuilt: 91 bespoke sprites, all 8+/10
- 🐗 **Every normal mob redesigned, none a tint-swap**: classics polished (slime gloss, bat fangs, goblin dagger, wolf highlight, mushroom spots, skeleton ember, cultist amulet, wraith hollow), mounts read at a glance (horse blanket + mane, turtle shell rings, cinder flames, magma shell vents), Greek juveniles never boss clones (lesser wyvern bright wings, fledgling downy cap + huge eyes, minotaur calf small horns, harpy bright hair, cyclops single eye, satyr pipes, siren veil + song, centaur foal spots + bow, stymphalian steel feathers, gorgon 5-snake halo, hydra spawn 3-head + shell, chimera goat + snake tail), Norse/Egypt/Japan all bespoke (kobold candle, draugr ribs, troll whelp warts, fenrir pup fluffy + collar, hulder veil, nøkk fiddle, lindworm fins, valkyrie wings, anubite jackal ears, scarab trio, mummy wraps, sphinx nemes, sobek armor, khepri sun disc, kappa dish, oni horns, tengu nose, kitsune tail-tip, yuki kimono, gasha flames, nurikabe wall joints, tanuki hat + bottle), Celtic/Slavic/wider/garrisons distinct troops (banshee wail, redcap cap, kelpie mane, tidecaller spout, deepmaw teeth, herald sword, púca horns + sparks, leshy bark, vodyanoy pond, rusalka lilies, striga wings, domovoi broom, naga single hood + spear, cub stripes, lamassu wings, utukku horns, jiangshi hat, shamans/grunts/brutes/hunters each with own gear), wilds/lake/apex/human foes distinct (empress diadem, gloomspinner legs, stag antlers, sandmaw dunes, rime frost, owl ears, crab claws, abyss glow, lurker lure, wreck planks, magma vents, maw fire, tentacle suckers, mimic teeth, phoenix crest, yeti fur, peak dragon horns + fire, bandit mask, outlaw hat, murderer cowl).
- 🖼️ New `src/mobs.js` + `src/mobs2.js` override layers (after `bosses.js`): juveniles vs bosses differ by size + gear + silhouette, never just scale. Second pass fixed the 15 borderline clones (lesser wyvern, centaur, gorgon, chimera, pup, nøkk, tanuki, púca, domovoi, naga, cub, gnoll, fledgling, lurker, wreck eel).
- 📊 Rated on silhouette / theme / detail / palette / props / composition: all 91 score 8–9.5.

## v52 — Bosses rebuilt: no more crowns on clones
- 👑 **All 28 bosses redesigned, all score 8+/10**: Dungeon Lord (obsidian + lava veins, flaming greatsword), Goblin King (sword-shard mohawk, banner poles), Kobold King (candle crown, lantern shield), Orc Warchief (jaw pauldrons, tusks), Bandit Warlord (duster, coin hat, crossbow), Gnoll Alpha (bone mohawk, tail club), Troll King (tree shoulder, root crown), Slime Sovereign (swallowed treasure, ooze crown), Skeleton Warlord (4 splayed arms, skull pauldrons, death mask), Draugr King (kelp mane, crab familiar), Cursed Pharaoh (half-jackal mask, crook + flail), Dullahan Lord (big glowing head, wheel shield), Wraith Sovereign (wide cowl, orbiting shards, scythe), Hierophant (tower mitre, tentacles), Baba Yaga (hut-on-legs staff), Rakshasa Maharaja (tiger stripes, peacock turban), Wyvern Matriarch (egg mound, torn sails), Harpy Matriarch (nest crown, cage staff), Tengu Stormlord (gunbai fan, windbag), Minotaur Warlord (crossed axes, nose-chain), Oni Daimyō (crescent helm, belly face), Jötunn Jarl (crystal shoulders), Medusa Queen (snake halo, mirror shield), Nāga Rājā (5-head hood, 4 weapons), Hydra Broodmother (mound nest, 7-head fan, bone lotus), Leviathan (coral antlers, harpoons), Nine-Tailed Kitsune (tail fan, foxfire), Fenrir Alpha (Gleipnir chain, lava maw). No lazy gold-sticker crowns, no larger-version clones.
- 🖼️ New `src/bosses.js` override layer (loaded after `sprites.js`) so future bosses stay bespoke.

## v51 — Twelve holdings, each its own horrors
- 🏴 **Nine new enemy holdings join the wilds**: kobold warrens (shored burrows, scrap workshops, a King's Nook), gnoll dens (bone-hide tents around the Alpha's Mound), skeleton crypts (bone chapels, ossuaries, the Wight Throne Room), cultist sanctums (dark cells, rite circles and a Pit Chapel behind a lava moat), haunted barrows (mounds and spirit shrines in a bog moat), minotaur mazes (double-thick labyrinth walls, bronze forge, Bull Throne Hall), serpent temples (coil dens, egg vaults and a Sunken Chapel in a drowned moat), harpy roosts (nest platforms, rookeries, the Matriarch's Perch) and troll dens (hovels around a Mossy Feast Hall) — each with its own palette, buildings and garrison (kobold shamans, gnoll hunters, draugr, striga, minotaur calves, nagas, sirens, troll whelps…) plus its own lv30–35 warlord (Kobold King, Gnoll Alpha, Skeleton Warlord, Hierophant of the Pit, Wraith Sovereign, Minotaur Warlord, Nāga Rājā, Harpy Matriarch, Troll King). Fort data now lives in one table, so walls, moats and ring strength follow each type automatically.
- 👹 **Garrisons scale with grounds**: the biggest walled grounds (maze, temple, stronghold) muster eleven defenders instead of nine. Everything else holds: all defenders cap at lv35, master chests guarantee a mid-tier prize, war parties march and ask for help, and the warlord's death breaks the holding.

## v50 — Enemy holdings, war parties, siege quests
- 🏴 **Enemy bases rise in the far wilds**: goblin villages, orc strongholds and brigand camps — each with its own war-huts and halls, a water or lava moat (goblins/orcs), and **fortified ring walls so thick (6000 HP) you'll want the gates, not a pick**. They spawn VERY far from any hearth, village or town, and every one hides a **master chest that always holds at least one mid-tier prize** (steel blades, sapphire wands, plate…).
- 👹 **Garrisons with warlords**: each holding musters its own defenders (orc grunts, shamans, goblin brutes…) plus a lv30–35 warlord — Goblin King, Orc Warchief or Bandit Warlord. All defenders cap at lv35. Slay the warlord and the holding **breaks** (mustering stops, skull-marker stays as a warning).
- ⚔️ **Marching armies**: war parties of guards and warriors (some mounted 🐴) march on the holdings and fight their defenders at the gates. Cross one's path and they'll call out — speak (E) to join the assault and take a new **📜 siege quest** (marked on the world map, minimap and quest list). No report-back: the warlord's death completes it, whoever strikes the blow.

## v49 — Shifting delves: the deep dark moves
- 🌀 **Dungeons now shift while you're inside**: walls grind open and shut in realtime (watch them — routes change mid-fight). Below effective depth 3 it's just slow breathing walls; deeper floors fight back, harder every floor down (faster, wider, double events at 8+).
- 🌊 Every theme has its own hazard: water delves surge and recede, shove you, and tug the shallows with a veering current (boats would feel it too); caverns drop rocks and tear the ground open; magma/blood well up; lightning arcs; blizzards gust; spores, curses, honey, shelves, gears and thorns all take their turn. All telegraphed (⚠ markers, rumbles, toasts), all temporary — and diving dodges every blast.
- 🛟 Soft-lock proof: entry/boss/portal/chest ground never shifts, occupied tiles are never sealed, and anything stranded in surge liquid is put ashore.

## v48 — Leviathan Deep + dungeon mimics
- 🐋 **New water dungeon: Leviathan Deep** (delve level 5+): a drowned sunken lake where every mob dodges by diving. The diving **Leviathan** boss breeds 🐙 tentacles in nearby water (~every 10s, up to 4) and lashes tidebursts at a random nearby foe (~every 5s, even mid-prowl) — then dives again.
- 🦷 **Mimics**: some dungeon chests are teeth. Touching one bites for a flat −30% max HP, stuns you 3s, and reveals a hungry floor-scaled mimic (no loot — there never was any).

## v47 — City gates stand open
- 🧱 **Walled cities no longer seal shut**: the wall ring baked solid across all four avenues, trapping spawn-city and outlying-city hearths (roads only pave soft ground, so they never cut through either). Avenues now cut gate gaps at bake time; already-visited cities get theirs opened by a runtime backfill (player-smashed rubble and POIs untouched).

## v46 — Named mounts, true-size mounts
- ✏️ **Name your mounts**: every tamed beast has a ✏️ Name button in the party tab (and in the Stable modal) — up to 24 characters, saved with your game.
- 🐴 **Mounts stay their own size**: ridden beasts (yours and NPCs') now draw at exactly the same size as the standing beast sprite — no more growing in the saddle.

## v45 — Mounted patrols + findable Stables
- 🐴 **Some NPCs ride now**: guards, samurai, warriors, tidewardens patrol mounted; hunters, adventurers and merchants travel in the saddle (🐴 nameplates). They move at mount speed, swim/wade on aquatic/lava beasts, and keep their mount when recruited — it stays with them outdoors and waits while they sleep or delve.
- 🐴 **Stables are signposted**: every hearth keeps one beast lodge — floating 🐴 over its hay pen in view (glows in E range), 🐴 on hearth labels + pins on the world map, a 🐴 note on the first-visit toast, and a compass ("24 tiles north-east") behind the party tab's Find Stable → button. Press E at the pen nexus to store/retrieve/ride/release.

## v44 — Loot rebalance: steel overworld, dragons in the deep
- 🗺️ **Overworld caps at steel**: overworld chests and wild drops never roll above tier 2 (steel/silver), whatever your level. Mythril waits at effective depth 3+, tier-4 gear at 6+, and dragon caches only on the last floors of the hardest delves (depth 10+, 5% chance; legends from 7+). Lesser bosses obey the same delve cap — only lv110+ ancient horrors drop dragon.
- 🔒 **Rare mats are war-spoils**: gems need a lv10+ dungeon boss slain, mythril + elemental hearts (rime/ember/storm/tide/holy) lv35+, unicorn hair + yggdrasil lv50+ — in chests, corpse loot AND shops (locked lines show 🔒 with the requirement). Each first unlock toasts what opened up. Dragon bone/horn still come only from dragons.

## v43 — Live minimap
- 🗺️ **The corner map tracks you in real time**: it repaints at 15Hz on its own timer instead of jumping in long steps whenever the HUD refreshes. Dots (you, party, mobs, quests) glide smoothly too.

## v42 — Martial Arts: an unarmed skill tree
- 🥋 **Bare fists get their own tree**: unequip your weapon and open Character (C) → Weapons → Martial Arts. Iron Stance (+8% unarmed damage/rank), Flurry of Blows (extra strikes), Palm Strike (stuns), Inner Focus (+crit, +dodge) and the Grandmaster capstone (+25% damage, better echoes and stuns).
- 🥊 **Fists still punch like fists**: blunt damage (mean to skeletons and wraiths) with no weapon bonuses or procs — the tree is what makes them scary.

## v41 — The Attack Slot is unmissable
- ⚔️ **Slot 1 is the Attack Slot now**: bigger, gold-bordered, and labeled right on the hotbar — the attack button and mouse clicks always use whatever sits there.
- 🗡️ **"Default weapon" button**: open 🎒 Inventory, click any weapon, hit ⚔️ Default weapon — it drops straight into slot 1 and wields at once. The slot-1 choice in every bind dropdown carries a ⚔️ mark too.

## v40 — Slash and Quick Shot are gone
- 🗡️ **No weapon spells left**: melee is a real weapon swing for everyone (internal Strike vehicle — same damage as before), and archers loose real arrows. NPC hunters, rogues, samurai and adventurers get a level-fit bow + quiver; goblin, skeleton, kobold, harpy and other beast-archers shoot back with real volleys.
- 📕 **Tome gone too**: the Quick Shot tome no longer drops or sells — leftover copies in old saves turn into iron arrows. Quick Shot ranks vanish with it; everything else in the trees is untouched.
- 🥊 **Bare hands**: unequipped means fists — base-ATK swings with no weapon bonuses, procs or skill-tree riders (until v42's Martial Arts tree).

## v39 — Unequip clears the hotbar
- 🗡️ **Unequip unbinds**: pulling a weapon (or any gear) off in the inventory also clears its hotbar slot — the key goes quiet instead of re-wielding what you just took off.

## v38 — Skill trees for every weapon (and gated spell trees)
- 🗡️ **Weapon trees**: Character (C) has tabs now — Attributes, Weapons, Spells. Each family (sword/axe/hammer/dagger/spear/bow/wand/staff) grows its own gated tree: damage roots, branch riders, capstones. Swords strike twice (Twin Fangs), loose moonlit waves (Crescent Arc) and execute the weak; axes open Bleeding wounds; hammers Sunder armor and Stun; daggers crit and envenom; spears reach/impale/phalanx; bows volley, splinter and deadeye; wands channel cheaper, quicker spells; staves overcharge, widen and echo.
- ✨ **Spell trees, gated**: Potency → Efficiency (needs Potency 1) → Mastery (needs Potency 3) → new Surge capstone (+8% power, −8% cooldown/rank). Old ranks carry over untouched.
- 🩸 **New afflictions**: Bleed, Sunder (−DEF) and Stun (locks control like freeze). Cleanse handles bleed; Panacea handles all three.
- 🐛 **Enchanted melee fixed**: hybrid-weapon procs were wired but never fired — they bite on contact now.

## v37 — Binding a weapon wields it
- 🗡️ **Slot 1 means wielded**: picking a hotbar slot for a sword (or bow, wand, staff) in the inventory equips it on the spot — the "(equipped)" mark jumps to the new blade at once. Pressing its key then fights with it, as before.
- **Marks stay live**: wielding with the inventory open repaints the list immediately, so the old blade never keeps a stale "(equipped)".

## v36 — Tabbed packs, search & single-hull rafts
- 🎒 **Inventory tabs + search**: All, Weapons, Armor, Medicine, Materials, Ammo, Books, Utilities — plus a 🔨 Crafting tab holding every Fieldcraft/Forge/Enchant recipe. A search box filters by name, and clicking a thing opens its properties in a sidebar (stats, resists, procs, value) with its buttons.
- **Equip is wearables-only**: armor and trinkets keep Equip/Unequip; weapons, ammo, books and consumables work through hotkey-slot binds or their Use buttons instead.
- **Drop the clutter**: Drop (1) or Drop all clears unwanted goods (equipped pieces unequip first, emptied hotbar slots clear too). Sealed quest parcels can’t be dropped.
- **Party packs match**: each companion’s backpack and your give-list get the same tabs, search and sidebar (Put on / Teach / Use now / Take back / Drop).
- 🛶 **Raft from the pack**: the sidebar shows Launch raft / Haul ashore right in the inventory — no hotbar needed — and launching a boat while another sails hauls the old hull first, so two hulls are never afloat at once.
- **Roomier menus**: inventory, party, quests and world-map popups all take much more of the screen now that the overworld pauses behind them.

## v35 — Gather, forge & enchant: raw materials into every blade
- ⛏️ **18 raw materials**: chop tundra pines for ❄️ frostwood, volcano growths for 🔥 emberwood, old forests rarely for 🌳 yggdrasil; raid dragons for bone + horn, winter packs for rime, phoenixes for ember cores, sky hunters for storm feathers, deep waters for tide pearls, crypts for silver + holy beads, beasts for hides, the fey-shy for unicorn hair — plus ores and gems in chests and from miners/smiths/scholars.
- ⚒️ **Forge every weapon & armor**: all 30 melee weapons (e.g. dragonbone sword = 2 bone + 1 horn), 11 armors, 6 bows and 12 wands/staves now craft from gathered mats — Inventory → Crafting groups them under 🌿 Fieldcraft / ⚒️ Forge / ✨ Enchant.
- ✨ **23 enchanted hybrids**: frost-enchanted mythril sword Rimebrand (mythril + frostwood + sapphire + Rime: 45% freeze 2s, 10s cooldown) and kin across every tier — ember/venom irons, frost/tide/storm/sanctified steels, rime/inferno/tempest mythrils, five wyrm-blades, spark/tide bows, four elemental armors. Every bite states its chance + cooldown and fires at most once per window.
- 🎓 **Wayfarer Training widens**: the tutorial reward now also offers cloth robe, leather armor, old/oak bows and quartz wand/staff — pick the starter that fits.

## v34 — Gear you can see: Profile button + visible weapons & armor
- 👤 **Profile button**: the hero panel has a Profile button right under "available stat points" — one tap opens the full profile card (same as clicking the panel or pressing V).
- 🗡️ **Your weapon shows**: the hero sprite (overworld + portraits) now holds whatever is equipped — bows stay shouldered with an arrow nocked, daggers/swords/axes/hammers/spears all read differently, staves and wands glow with their focus gem, and bare hands are bare. Blade color follows the material (rusty iron through mythril to dragonbone).
- 🛡️ **Your armor shows**: heavy plate (iron → dragonbone) plates the torso with pauldrons, enchanted robes fall to the floor with glowing trim, light garb dyes the belt.
- 💥 **Swings match**: blades sweep a wide arc, spears and daggers thrust, hammers and staves fall heavy and gold — and bows never swing at all (they loose arrows instead).
- 🐛 **Card portraits carry gear too**: the right-side profile portrait initially dropped your loadout (overworld only) — now it shows every weapon and armor, verified across all 58 weapons and 11 armors.

## v33 — Proper biomes: seas, tundra, dark forests + biome mobs
- 🌍 **New frontiers**: seas (sandy islets), oceans (deep water), tundra (ice sheets, snow pines) and dark forests (moss, wall-to-wall canopy, gloom) join the vale — each gated on its own terrain so regions stay separate, and towns never found in the open ocean.
- 🐲 **Locals with teeth**: phoenixes on volcanoes, yetis on mountains, rime wolves + shiver owls in the tundra, gloomspinners + umbral stags in the dark, sandmaws in the desert, coral crabs in the sea, abyss serpents in the ocean. Forests 8–15 (deep woods into the 20s), villages stay ~5, nothing overworld passes 30 — except lv-50 dragons roosting at mountain peaks and volcano calderas.

## v32 — Quest menu obeys Esc
- 📜 The quests window now closes with <span class="kbd">Esc</span> like every other panel (it was the odd one out).

## v30 — Minimap zoomed to loaded ground
- 🔍 **No more black rim**: the minimap now frames just the 32×32 tiles around you — everything it shows is loaded and sampled, so there's no wasted black periphery to mistake for anything.

## v29 — Minimap honesty: unloaded land reads black
- 🗺️ **No more phantom plains**: the minimap used to paint far-off, not-yet-loaded ground green — easy to mistake for explored plains. Only sampled, loaded chunks draw terrain now; everything unloaded (and dungeon bounds) stays black, so black always means "not loaded yet".
- Markers (you, party, townsfolk, foes, quests, portals) still draw on top, wherever they are.

## v28 — Known world: search it, click it, travel it
- 🔍 **Search the map**: type a few letters to find any discovered place — results center the map on click, with a ✨ go button for hearths you've been remembered at.
- 👆 **Click a hearth dot to teleport**: no more scrolling a dropdown through dozens of towns. Clicking asks once ("Travel to X?"), then folds the miles away. Delves and unvisited places just center the map instead.
- ✨ **Portals open the same map**: stepping on a hearth portal brings up the Known world — search or tap a dot, confirm, arrive. The map closes itself after portal travel.
- 🐛 **Fixed a crash hum**: portal ripples at far-west coordinates threw a canvas error every frame — wrapped the phase properly.

## v27 — Smarter E: priorities + standing your ground
- 🎯 **Interactions have priorities now**: loot (chests, corpses, caches), world objects (herbs, beds, stairs, portals, signs) and townsfolk all outrank party-member chat — no more opening a companion's dialogue when a crowd presses in. Party chat still works (and stays in the party menu too).
- 📍 **What you're standing on wins**: distances are measured to tile centers, so the chest under your feet beats the portal next door. Closeness still decides between far-apart things; priority settles neighbours.
- Nothing unpickable: anything new falls back to a middle priority, and E with only a party member nearby still talks to them.

## v26 — Home-town houses stand whole again
- 🏠 **Fixed invisible + mismatched houses**: new journeys that start in a village, sakura town, city, fortress or canal-city baked one kind of hearth but drew the old town's houses over it — masks landed on empty grass (or nowhere) while furniture haunted the lawns. The origin hearth now uses one layout everywhere: masks, walls, doors, interiors, NPC beds and collapse checks all agree.
- No change for older saves — legacy home towns render exactly as before.

## v25 — Hearth portals, roads between towns, any-town starts
- ✨ **Every hearth holds a portal**: step onto the 🌀 stones at any settlement (or your home town) and travel straight to any other hearth that already knows your name. No more long walks home.
- 🗺️ **Teleport from the Known world**: the 🏠 journey-home button is gone — pick any visited hearth in the dropdown and hit **teleport** instead.
- 🛤️ **Roads join the hearths**: straight ways now run between neighbouring settlements (and out of your home town), paved through the wilds — follow one and you'll likely walk into somewhere lived-in.
- 🎲 **Every journey starts somewhere new**: a cleared slot founds its starting town as a random kind of hearth — stone town, canal-city, walled city, dwarven fortress, sakura town or farming village — with its own fitting name.
- 🏷️ **Emberhold is the game, not the town**: the starting town now bears its own generated name (old saves keep their names and layouts exactly as they were).

## v24 — Ten more delves: libraries, hives, clockwork vaults
- 📚 **Four mid-depth grounds (level 5+)**: Sunken Library (shelf stacks with reading aisles + scattered scrolls), Briar Grotto (living thorn-trunks, tall grass, wildflowers), Wax Hive (amber comb floors, propolis columns, pollen flecks), Drowned Hulk (ship decks with sandy rims, bilge pools, frequent flood-lakes) — joining glacier in the mid pool. Shallow floors 1–4 still rotate only the classic six.
- 🩸 **Six deep grounds (level 8+)**: Mirror Halls (ice + gapped crystal vanities, bright lanterns), Storm Spire (great halls, lightning pillars, blazing light), Sunscorched Tomb (sand + royal sarcophagi in nearly every hall), Clockwork Vault (braided maze with a regular brass gear-grid), Flesh Warren (meaty floors, blood lakes with stone spines — plus blood flood-lakes), Deepcap Grove (towering mushroom stalks over moss). New walkable wax/flesh floors + solid blood hazard, all with art and minimap colors; ice still glides, even in the Mirror Halls.
- 🧭 **Theme-native layouts + mob flavor**: libraries and storm spires read as great halls, clockwork as maze, groves/hives/briar as caverns, tombs/mirrors/flesh as crypts — and every new ground gets its own mob flavor (scarabs in the hive, mummies in the tomb, wraiths in the mirrors).

## v23 — Dungeons with a sense of place + depth
- 🧊 **Three new grounds, depth-gated**: glacier (ice sheets you glide on, frozen pools) from level 5+, inferno (lava lakes with black-stone spines to hop) and abyss (glow-crystal void) from 8+. Shallow floors keep the classic six-theme rotation, so early delves feel familiar.
- 🌉 **Sunken-lake layout**: flooded/ember/inferno/glacier delves can flood their middle — a hazard lake ringed by rooms, crossed only by 2-wide bridges (stone over lava, planks over water, treacherous ice over frozen lakes).
- 🏛️ **Every theme got set pieces**: bone pits + sarcophagi + collapse rubble in crypts, moss carpets and spore clusters in fungal, sandy shores in flooded, stalagmite pillars and streams in caverns, ash + ember veins in fire ground, spaced glow-crystals in shadow/abyss. New walkable floor tiles (ice/ash/moss/bone) + solid crystal, all with art and minimap colors.
- 📈 **Depth shows**: decor, pools, lakes, torches, rubble and crystals all scale with level, past 8 every theme gets ancient crystal detail plus a sealed deep-vault chest (fat gold + supplies) in the boss room.

## v22 — Smarter spell arsenals + self-preservation
- 🎲 **Monsters roll bonus spells**: every mob spawns with 1–2 extra thematic attacks from its body pool (ooze tides, wyvern lightning, serpent venom, ghost hexes…) — 3–5 attacks each, varying per spawn, so the same species fights differently each delve. MP pools grew to cover the new kits.
- 👑 **Bosses mend and purge**: all 21 bosses now carry Heal + Panacea — they cure their statuses and heal at 55% HP (before, most bosses couldn't recover at all).
- 💚 **Everyone self-cares**: mobs heal/cleanse while roaming too (not just mid-fight); townsfolk and guards cure their own statuses via Cleanse/Panacea; party medics patch themselves before others.

## v21 — Monster sprite audit: every design now passes
- 🎨 **All 84 monster sprites re-scored 1–10, all now ≥6**: bespoke classics (slime, goblin, skeleton, cultist, wraith…) hold 7–9; the generic families were rebuilt with 2+ diagnostic traits each — biped raptors, horse-bodied centaurs, multi-head hydras, jackal-eared anubites, croc-backed sobeks, fox-tailed kitsune, crow-beaked tengu, dish-headed kappa, red-capped reapers, skull-faced gasha, living-wall nurikabe, readable beetle swarms, veiled yuki-onna/banshee/rusalka, head-holding dullahans, crowned boss regalia. Previous clones (tiny swarm squares, white pillar ghosts, tint-swap dogs) are gone.

## v20 — Varied delves + mythic bestiary
- 🌀 **Dungeons go procedural**: every delve now carves a bounded 52–60-tile interior in one of four rotating layouts (crypt rooms, winding caverns, braided maze, great halls) with a theme that shifts each floor (crypt, cavern, fungal, ember, flooded, shadow — lava pockets, flood pools, moss, pillars, vault caches). Same seed + floor always rebuilds the same delve, so saves and revisits stay consistent.
- 👹 **50 new mobs, 20 new bosses**: Greek minotaurs/harpies/hydras, Norse draugr/lindworms/valkyries, Egyptian anubites/mummies, Japanese oni/tengu/kitsune, Celtic banshees/kelpies, Slavic leshys/rusalkas, nagas, rakshasas — plus Goblin King, Slime Sovereign and other evolved versions of the classics instead of repeats. Each delve's boss is picked deterministically (Medusa Queen, Baba Yaga, Fenrir Alpha…; eldest horrors past depth 8). Wilderness, dungeon and quest pools all know the newcomers, and smite still bites every undead.

## v19 — Craftable rafts sail the waters
- 🛶 **Lash a Raft, sail anywhere**: 6 🪵 wood at 🎒 Inventory → 🔨 Crafting builds a reusable raft — Use it (or bind it to the hotbar) to launch, sail rivers, lakes and seas with WASD, and Use it again on dry land to haul ashore. Spells and arrows fly over water now, so raft fights work both ways; E-grabs work from the hull.
- 📜 **Quest caches stay reachable**: fetch caches now land on the chunk's largest connected landmass, away from the water's edge — no more marooned-on-a-sandbar pickups. And when water still lies between, the raft crosses it (accepting a fetch quest without one points at the recipe).

## v18 — Saves can't pile up anymore
- 💾 **Fixed saves freezing after a while**: the autosaver could start a new save every frame while one was still writing, piling thousands of queued writes onto storage until nothing could save. Concurrent saves now share a single in-flight write, so the freeze can't recur.

## v17 — Quest banners, training + stocked shelves
- 📜 **Quests get their moment**: accepting or finishing a quest now pops a violet splash banner (like the level-up one) showing the objective and the rewards — expected on accept, received on completion.
- 🎓 **Wayfarer Training**: entering a world with no training yet asks if you want guided first steps — moving, fighting, gear, spells, herbs and recruiting, tracked live in 📜 Quests. Finish all 7 lessons and pick your reward: iron sword, dagger, axe, hammer, spear or armor. (Find it later via ❓ Help → 🎓 Tutorial.)
- 🏪 **Basics always on the shelves**: blacksmiths always carry an iron melee weapon + iron armor, scholars always carry quartz wand + staff, hunters always carry the wood-and-flax bow + iron arrows — whatever their level. Rings, charms, hybrids and legendaries never appear in shops: they're loot-only now.

## v16 — Closer camera, smarter E
- 🔍 **Zoomed in**: tiles are much bigger now (2.5x on desktop, 1.7x on touch) — the hero is easy to see and the view holds ~24 tiles across instead of a tiny ant farm. (Note: this doesn't change AI/terrain requests — chunks stream in a fixed 3×3 ring regardless of zoom — but fewer on-screen tiles are cheaper to draw.)
- 📱 **Interact joins the mobile cluster**: the 💬 button is now a bold **E**, grouped with attack + joystick, and all three only appear on touch devices (desktop keeps the keyboard E).
- 🌿 **Herbs get their own prompt** ("wild Bright Herb — press E to gather"), and **E now picks what you point at**: the cursor's tile wins when something interactable is there, otherwise the closest thing wins — all with strict range limits, so pointing at a herb between two chests gathers the herb, and stairs can't trigger from across the room anymore.

## v15 — Honest saves + storage protection
- 💾 **The save button tells the truth now**: it verifies every write actually landed and says so — and if storage is blocked, full, or unavailable it says THAT instead of a cheerful "Saved." with nothing persisted. (Previously a failed write looked identical to a success.)
- 🛡️ **New Storage section in the pause menu (☰)**: shows whether the browser will keep your saves, how much space is used, and a **Protect saves** button that explicitly asks the browser for persistent-storage permission. The game also requests it quietly on boot.
- 🧹 **Saves no longer smuggle live combat targets**: target cross-pointers are stripped before writing (they used to embed whole mobs/NPCs into saves and wake up as stale snapshots — the game already rebuilds them from the saved target id).

## v14 — Clean drags, keys that can't stick
- 🖱️ **Menus never highlight when dragged**: all game text is unselectable now (chat/reply fields still select and copy normally), and native drags are suppressed — sweeping the mouse across the minimap, hero panel or hotbar leaves no blue selection behind.
- ⌨️ **Stuck keys can't survive the right-click menu**: if the browser menu does open, held movement is dropped on the spot (a key still held down re-engages by itself when the menu closes), and a watchdog in the game loop releases any direction that goes quiet with no key events for 2 seconds — the exact fingerprint of a swallowed key release. Right-clicks also never attack or plant torches anymore.

## v13 — Steady keys, calmer dreams
- 🖱️ **Right-click no longer hijacks movement**: right-clicks never open the browser menu over the game (and never attack or plant torches), and losing focus (alt-tab, task switch) can't leave a key "held down" anymore — focus loss clears all held input, so the hero always stops when you let go.
- ✨ **Fewer "too many requests" storms**: exploring fast used to fire one AI request per new region all at once. Region/delve dreams now go one at a time with breathing room, places you've already left behind are skipped, and after a server refusal all background dreaming naps for a bit — meanwhile chat, summaries and quest offers answer from local memory instead of firing doomed requests.

## v12 — Vale by default, deaths with causes
- 🌲 **Forest Vale is the default theme** now (your saved pick still wins — change anytime via 🎨 in the title-screen Options or the pause menu's Appearance section).
- 💀 **Deaths name their cause**: the "You fell" screen says what finished you — the beast or villager by name and level, or the affliction (burned alive, poison) when nothing stands over you. Your last death is kept on the hero too.

## v11 — Day, night & torchlight
- 🌓 **A full day lasts 24 minutes**: the clock sits **top-center** (phase icon + time + day count), and the world shifts with it — pink dawns, orange evenings, purple dusks and dark-blue nights. Dungeons stay torchlit-dark.
- 🧟 **The wilds keep ecologies now**: skeletons and wraiths rise only at night or in dark places (dungeons, deep-forest gloom); dire wolves den only in forests; goblins and slimes roam forests, plains and dungeons. Quest summons obey the same rules (stand-ins still credit the kill).
- 🔥 **Placeable torches**: bind one to a hotbar slot, press its key, then click a nearby spot to plant it — it lights the ground around it until you pick it back up with E. New journeys start with 3; whittle more from 🪵 wood (Inventory → Crafting), or loot them from chests and goblins.

## v10 — Quests: work boards itself
- 📜 **Preset quest types, AI-chosen details**: `fetch` (recover N× item at a place), `slay` (kill N of a mob kind), `clear` (slay a delve's boss), `deliver` (carry a parcel to an NPC). The AI only fills parameters (names, counts, flavor) via one strict-JSON call; all compute — place lookup/creation, spawning, progress, rewards — is plain code.
- 🗺️ **Places found or founded**: a quest place reuses the existing location by exact name; otherwise a new overworld site is settled near you (named, revealed with a toast, shown on the map) or the nearest delve is marked. Fetch caches glow gold (E to recover), slay zones get ❗ beacons + quest mobs spawn as you close in, delve entrances are tracked.
- ⚔️ **Triggers everywhere**: villagers offer work when you talk (E) — ask with 📜 Quest in chat or "got work?"; boss spawns auto-start a clear quest; legendary relics (hybrids, legendaries, dragonbone) thirst for battle and issue slay quests. Some quests report back (✅ Report in chat or the quest tab), others end on the deed (boss kill).
- 🎁 **Scaled rewards** (gold + XP + supplies, tomes at high difficulty) and the **📜 Quests tab (Q)**: objectives with progress bars, target place + direction + distance, rewards, 🗺️ Track (centers the world map), turn-ins, abandon, recent deeds. HUD 📜 button counts active quests and glows when a report is due.

## v9 — Forgiven friendly fire
- 🏹 **Stray shots no longer start feuds**: when a hunter (or any townsfolk) is fighting a mob and an arrow, blast or blade-arc nicks you or a bystander, it still stings — but nobody turns hostile, no guards pile on, and your party stands down. Civilians turn on you only when you attack them directly.

## v8 — Brigands & civil hunters
- 🏹 **Hunters are civilians now**: the town hunter no longer plays guard — no more joining fights, challenging stray mobs, or turning on you over a witnessed scuffle. Hunters still defend themselves with bow and heal when actually hurt, like any villager.
- 🗡️ **Bandits, outlaws and murderers stalk the far wilds**: new human foes, hostile on sight to you, your party AND villagers (guards will step in). Bandits past ~60 tiles out, outlaws past ~100, murderers past ~140 — and never in or near towns. They carry fat purses (3x corpse gold), and archers drop arrows (poisoned ones, for murderers).

## v7 — Truly separate worlds
- 🗂️ **Save slots are fully isolated now**: switching slots, deleting a world, or starting fresh bumps a generation counter that cancels any in-flight dreams from the old world — a late AI arrival can no longer scribble its names into your new game or resurrect a deleted save.
- 🏷️ Every cached villager, chunk and dungeon is stamped with its home slot, and saves route by that stamp — so a fresh "Asha Ashford" in a new world stays clean instead of arriving as "Asha Ashford 2" because the deleted world still lingered in memory.
- 🧹 Fresh worlds wipe only their own slot's stores (neighbors untouched), and name checks only ever count the world you're standing in.

## v6 — Fewer double-Gretas
- 🎲 **NPC letter dice widened**: name constraints roll 2–10 letters per first/last name (was 1–6), so the dreamer strays further from its pet names.
- 👥 **Fallback names stay fresh**: offline pools grew from 20 to 60 first/last names (themed pools grew too), and new villagers now avoid reusing a first name already living in the same place.
- 🗂️ **Uniqueness sees the whole save**: name checks now merge stored-but-unvisited villagers before deciding, and they only ever look inside your current slot — deleted worlds are wiped (chunks, NPCs, dungeons) and never counted.

## v5 — Dungeons go deeper
- 🌀 **Multi-level delves**: every dungeon now has more floors. The boss room hides a shimmering portal — press **E** and choose: descend to the next generated level, or climb back to daylight with your loot (entry stairs always lead out).
- 📈 **Deeper pays**: each floor down raises the effective depth, so enemies hit harder AND chests, drops and bosses pay better — including the ancient horrors waiting at depth 8+.
- 🧭 **Your level, remembered**: the HUD shows `🕳️ name · level N` in the dark, and your floor persists across saves — reload and you're still down there.

## v4 — Danger has an address
- 🏔️ **New frontier biomes**: deserts (~lv20) past 120 tiles out, mountains (~lv30) past 200, volcanoes (~lv30) past 250 — each rarer and deadlier than the last, with oasis pools, alpine tarns, lava seeps and ember vents.
- 🎲 **Levels are bell curves now**: towns average ~lv3 (a lv1 or lv6 is a 1-in-50 sighting), forest interiors ~10, deserts ~20, mountains/volcanoes ~30. Almost everything past 30 lives in dungeons — though the odd dungeon-grade beast (31-45) wanders the far wilds, and, very very rarely, a lv50 lesser wyvern or velociraptor.
- 🐉 **Dragon tier is endgame**: a new gear tier unlocks about every 20 levels, and dragon gear (Dragon's Bone, Dragon's Horn, legends) drops ONLY from level 110+ bosses and ancient depth-8+ dungeon caches — never shops, never chests, never lowbies. Mobs and NPCs cap at lv100 (bosses excepted).
- 🗡️ **Shops were leaking**: fixed high-tier stock (frostwood bows, holy gear, smite blades) appearing on low-level merchants — stock now follows the same 20-level gates.

## v3 — Arsenal, region names & HUD polish
- ⚔️ **115-weapon arsenal**: Rusty → Iron → Steel → Silver (5x vs undead) → Mythril → Dragon's Bone melee sets in a blade / pierce / blunt triangle; 6 bows with speed + power; 6 wands (mana) + 6 staves (power, first-in-hotbar-order focus); 6 elemental rings at 1.5x; light / heavy physical armor plus enchanted anti-magic robes; hybrids (Smite Blade, Frostfang Bow, Cinderbrand) and legendaries (Dawnbreaker, Wyrmfang, Stormcall, Oathbow). New Smite / Tideburst spells and tomes, tiered loot by level, distance and depth, and matching trade prices and stocks.
- 🗺️ **Region names use letter dice**: the dreamer rolls two dice (2–7) for letter groups, and the AI name must contain every letter. Collisions retry with wider dice (3–8, 4–9, 5–10) before a suffix fallback keeps every region unique — settlement siblings still share names, offline names get uniquified too.
- 🧭 **Top-left buttons reordered**: ☰ menu, 💾 save, 🔔 notifications, ❓ help, then the 📍 location box (click it, or M, for the world map).
- 🔍 **Resizable minimap**: drag the ⤡ corner (84–320px, remembered) to make the corner map bigger or smaller.
- 👤 **Collapsible hero panel**: the top-right panel starts expanded and now has a ▾/▸ header — collapse it for a clean view, expand it for HP / mana / gold at a glance.

## v2 — Summon your party
- 📯 **Summon party button** in the party menu (P, team banner): teleports all living friends to your side. Stuck in a wall? Left three screens back? One tap regroups them.
- 🩹 **Dungeon deaths no longer strand followers.** If you fall in a crypt while a friend stands, they regroup at your respawn with a clean slate — no more chasing phantom dungeon mobs or vanishing.
- 🧭 Followers also **unstick themselves**: pushing into terrain for a few seconds pops them to your follow slot, and NaN/stale positions snap to you instead of freezing their AI.
- The party menu now warns you when a friend is far away — with a nudge to summon them.

## v1 — Bows, afflictions & kind clerics
- 🏹 **Bows are real bows now.** Equip one, bind arrows to hotbar slots in 🎒 Inventory, and fire — arrows are spent in **slot order**, so the earliest slot's stack goes first. No arrows, no shots.
- 🐍🔥🧊 **New arrows**: venom (poison), cinder (burn) and frost (freeze) heads, plus sturdy iron.
- ☠️ **Five status effects** — they cut both ways, you and monsters alike:
  - **Poison** drains % max HP per second until cured. **Burn** deals flat damage per second and lowers END (DEF) until cured.
  - **Freeze** stops you moving or acting. **Paralyze** lowers AGI + STR until cured.
  - **Blindness** shrinks sight to a few tiles — a blinded hero's screen edges go black (HUD stays readable).
- ✨ **Seven new spells**: Venom Sting, Immolate, Glacier, Thunder Hex, Dazzle — plus **Cleanse** (poison + burn) and **Panacea** (cures everything + heals). Learn them from tomes.
- 🧼 **Cures everywhere**: brew antidotes, salves, teas and panacea (Inventory → 🔨 Crafting), or use them straight from your pack.
- 🌿 **Wild herbs** glimmer in forests and meadows — press **E** to gather sage, cinder, calm and bright herbs (they regrow after a few minutes). **Herbalists** sell them by the armful.
- 💚 **Clerics walk among you** — healers, priests and clerics mend and cleanse you as you pass by. Party members who know Heal, Cleanse or Panacea now patch you up mid-fight, all on their own.
- ⚖️ Poison and burn kills credit the attacker, so your venom arrows earn their XP.
