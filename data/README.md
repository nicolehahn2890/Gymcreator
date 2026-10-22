# data/ – die einzige Stelle mit Trainingswissen

| Datei | Inhalt |
|---|---|
| `goals.json` | Kategorien (Peach-Kategorien + Bizeps/Trizeps/Waden) mit Farbe und anteiliger Muskelzählung; Grenzen (`limits`); je Ziel: Prioritäten 0–3, `categoryOrder` (Reihenfolge innerhalb eines Tages) und der **Slot-Pool** (stabile IDs, Kategorie, Wdh.-Bereich, Basis-Sätze, optionaler `focus`-Hinweis für Sterne/Dropdown) |
| `templates.json` | Je Ziel und Tagesanzahl (3/4/5) die Tage mit Name, Fokuszeile und Slot-IDs. Ein Eintrag darf `{ "id", "sets" }` sein, wenn der Slot in dieser Wochenart andere Basis-Sätze hat (Apfel: Glute Med 3 statt 2 bei 3 Tagen). Slots, die in einer Wochenart fehlen, **pausieren** dort |
| `exercises.json` | (noch offen, Phase 0 Schritt 4) Übungsbibliothek v1: `id`, `name {de,en}`, `category`, `secondary[]`, `equipment[]`, `pattern`, `stars {vform,sanduhr,apfel}`, `stretch`, `unilateral`, `assisted`, `tip {de,en}`, `why {de,en}` |

## Regeln

- **Slot-IDs sind stabil und nie Positionen.** Einträge werden unter `cycle:week:slotId` gespeichert. Eine neue Zeile im Plan verschiebt nichts (Lehre aus Peach-Regel 11).
- **Ändert sich der Wdh.-Bereich oder die Kategorie eines Slots, bekommt er eine neue ID.** Nur die Satzzahl darf sich ändern (sie steht im Eintrag als `baseSets`).
- **Gleiche Slot-ID in 3/4/5 Tagen = dieselbe Zeile.** Übung, Zusatzsätze und Verlauf wandern automatisch mit (ersetzt Peachs Partnerzeilen `t:[…]`).
- **Reihenfolge innerhalb eines Tages wird vom Generator sortiert:** `categoryOrder` des Ziels, dann schwerer Bereich zuerst (4-8 < 6-10 < 8-12 < 12-15), dann Reihenfolge im Template. Die Listen in `templates.json` sind nur Zugehörigkeit.
- **Prüfen:** `node scripts/verify-plan-data.mjs` (Slot-IDs, Sätze je Einheit, anteilige Sätze je Muskel und Einheit ≤ 11, Frequenz Prio 3 ≥ 2×, Prio 0 ohne Sätze, Bauch zuletzt, Apfel 4/3 Tage identisch mit P4/P3 aus der Trainingsapp). Vor jeder Änderung an diesen Dateien laufen lassen; am Ende muss `ALLE PRUEFUNGEN GRUEN` stehen.

## Verifizierter Stand (22.10.2026)

| Ziel | Pool | 3 Tage | 4 Tage | 5 Tage |
|---|---|---|---|---|
| Apfel | 32 Slots / 72 Sätze | 62 (23/20/19) | 70 (18/18/19/15) = P4 | 72 (16/14/15/13/14) |
| Sanduhr | 31 / 73 | 62 (20/21/21) | 71 (17/17/17/20) | 73 (14/13/16/12/18) |
| V-Form | 30 / 77 | 61 (21/19/21) | 72 (16/19/17/20) | 77 (14/14/19/14/16) |

Warnungen (bewusst): 3-Tage-Einheiten mit 21–23 Sätzen (Apfel Tag A 23 ist Nicoles eigener Peach-Plan). Apfel 5 Tage hat Glute Max 17 statt 15 (Pump-Slot `gmax_12-15_a` am leichten Tag E).
