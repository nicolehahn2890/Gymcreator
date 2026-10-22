# data/ – die einzige Stelle mit Trainingswissen

| Datei | Inhalt |
|---|---|
| `goals.json` | Kategorien (Peach-Kategorien + Bizeps/Trizeps/Waden) mit Farbe und anteiliger Muskelzählung; Grenzen (`limits`); Regeln je Erfahrungsstufe (`levels`); je Ziel: Prioritäten 0–3, `categoryOrder` (Reihenfolge innerhalb eines Tages) und der **Slot-Pool** (stabile IDs, Kategorie, Wdh.-Bereich, Basis-Sätze, optionaler `focus`-Hinweis für Sterne/Dropdown) |
| `templates.json` | Je Ziel und Tagesanzahl (3/4/5) die Tage mit Name, Fokuszeile und Slot-IDs. Ein Eintrag darf `{ "id", "sets" }` sein, wenn der Slot in dieser Wochenart andere Basis-Sätze hat (Apfel: Glute Med 3 statt 2 bei 3 Tagen). Slots, die in einer Wochenart fehlen, **pausieren** dort |
| `exercises.json` | Übungsbibliothek v1 (180 Übungen). Je Übung: `id`, `name {de,en}`, `category`, `secondary[]`, `equipment[]` (aus der Liste `equipment`), `pattern` (aus `patterns`), `focus[]` (passt zu Slot-Hinweisen), `stars[]` (Ziele, für die sie Top-Wahl ist), `heavy` (geeignet für 4–8), `stretch`, `unilateral`, `assisted` (Gegengewicht: weniger = schwerer), `timed` (Sekunden statt Wdh.), `tip {de}` im Format `Einstellung: …\nAusführung: …`. Reihenfolge je Kategorie = Vorzugsreihenfolge. Englische Tipps und der "Warum"-Satz folgen in Phase 2 |

## Regeln

- **Slot-IDs sind stabil und nie Positionen.** Einträge werden unter `cycle:week:slotId` gespeichert. Eine neue Zeile im Plan verschiebt nichts (Lehre aus Peach-Regel 11).
- **Ändert sich der Wdh.-Bereich oder die Kategorie eines Slots, bekommt er eine neue ID.** Nur die Satzzahl darf sich ändern (sie steht im Eintrag als `baseSets`). Ausnahme mit Absicht: die Einsteiger-Stufe ersetzt 4–8 durch 6–10, die Slot-ID bleibt (der Bereich steht im Eintrag, der Vorwert sucht über Übung + Bereich).
- **Gleiche Slot-ID in 3/4/5 Tagen = dieselbe Zeile.** Übung, Zusatzsätze und Verlauf wandern automatisch mit (ersetzt Peachs Partnerzeilen `t:[…]`).
- **Reihenfolge innerhalb eines Tages wird vom Generator sortiert:** `categoryOrder` des Ziels, dann schwerer Bereich zuerst (4-8 < 6-10 < 8-12 < 12-15), dann Reihenfolge im Template. Die Listen in `templates.json` sind nur Zugehörigkeit.
- **Einsteiger (`levels.beginner`):** alle Slots 2 Sätze, 4–8 wird 6–10, Kategorien mit mindestens 3 Slots in der Woche verlieren den letzten Slot in Pool-Reihenfolge – aber nur von einem Tag, an dem die Kategorie mehrfach vorkommt, damit die Häufigkeit pro Woche gleich bleibt.
- **Übungs-IDs sind stabil.** Nie umbenennen oder neu vergeben; eine geänderte Übung bekommt eine neue ID.
- **Prüfen:** `node scripts/verify-plan-data.mjs` erzeugt mit dem echten Generator (`src/core/generator/`) alle Ziele × Stufen × 3/4/5 Tage und prüft Sätze je Einheit, anteilige Sätze je Muskel und Einheit ≤ 11, Frequenz Prio 3 ≥ 2×, Prio 0 ohne Sätze, Apfel 4/3 Tage = Nicoles Plantabellen (`tests/fixtures/peach-p4.json`, `peach-p3.json`) und die Übungsbibliothek (Kategorien, Ausstattung, Tipp-Format, keine Herstellernamen, jeder Slot hat ≥ 3 passende Übungen und eine Stern-Übung, 4–8-Slots eine schwere Stern-Übung). Liegt die Trainingsapp read-only daneben, wird zusätzlich geprüft, dass die Fixtures noch P4/P3 entsprechen. Am Ende muss `ALLE PRUEFUNGEN GRUEN` stehen.

## Verifizierter Stand (22.10.2026)

| Ziel | Pool | 3 Tage | 4 Tage | 5 Tage | Einsteiger 3/4/5 |
|---|---|---|---|---|---|
| Apfel | 32 Slots / 72 Sätze | 62 (23/20/19) | 70 (18/18/19/15) = P4 | 72 (16/14/15/13/14) | 48 / 54 / 56 |
| Sanduhr | 31 / 73 | 62 (20/21/21) | 71 (17/17/17/20) | 73 (14/13/16/12/18) | 46 / 52 / 54 |
| V-Form | 30 / 77 | 61 (21/19/21) | 72 (16/19/17/20) | 77 (14/14/19/14/16) | 40 / 50 / 54 |

Warnungen (bewusst): 3-Tage-Einheiten mit 21–23 Sätzen (Apfel Tag A 23 ist Nicoles eigener Peach-Plan). Apfel 5 Tage hat Glute Max 17 statt 15 (Pump-Slot `gmax_12-15_a` am leichten Tag E). Einsteiger-Volumen liegt bei 0,66–0,77× des Fortgeschrittenen-Plans.
