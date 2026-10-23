# data/ – die einzige Stelle mit Trainingswissen

Begründung aller Zahlen: `docs/wissenschaft.md`.

| Datei | Inhalt |
|---|---|
| `goals.json` | Wdh.-Bereiche (`ranges`, schwerster zuerst); Kategorien (Peach-Kategorien + Bizeps/Trizeps/Waden) mit Farbe und anteiliger Muskelzählung; Grenzen (`limits`, u. a. `sessionMinutes` = Dauer jeder Einheit 60–90 Min., `maxFractionalSetsPerMusclePerSession` = höchstens 10 anteilige Sätze je Muskel und Einheit, `minWeeklySetsPrio3` = Mindestvolumen je Prio-3-Muskel und Woche); Progression; `timing` (Satzdauer, Pause je Bereich, Aufwärmsätze und Wechsel je Übung nach Bereich, für Dauer-Schätzung und Pausentimer); `short` (Kurz-Modus: `exercises` = 4 wichtigste Übungen fürs Ziel mit allen Sätzen, angezeigt als `minutes` = "30–45 Min."; die Auswahl steht in `core/progression/short.ts`); je Ziel: Prioritäten 0–3, `mainCategory` (Hauptmuskelgruppe), `targets` (Wochenziel je Muskel, anteilig, `[min, max]`) und der **Slot-Pool** (stabile IDs, Kategorie, Wdh.-Bereich, Basis-Sätze, optionaler `focus`-Hinweis) |
| `templates.json` | Je Ziel und Tagesanzahl (3/4/5) die Tage mit Name, Fokuszeile und Slot-IDs **in Trainingsreihenfolge**. Ein Eintrag darf ein Objekt sein: `sets` = andere Basis-Sätze in dieser Wochenart. Slots, die in einer Wochenart fehlen, **pausieren** dort |
| `exercises.json` | Übungsbibliothek (200 Übungen, jede Kategorie mindestens 7). Je Übung: `id`, `name {de,en}`, `category`, `secondary[]`, `equipment[]`, `pattern`, `focus[]` (passt zu Slot-Hinweisen, sortiert die Auswahl), `stars[]` (Ziele, für die sie Top-Wahl ist), `heavy` (geeignet für 6–8), `stretch`, `unilateral`, `assisted` (Gegengewicht: weniger = schwerer), `timed` (Sekunden statt Wdh.), `tip {de}` im Format `Einstellung: …\nAusführung: …`. Reihenfolge je Kategorie = Vorzugsreihenfolge |

## Regeln

- **Die Übung wählt die Person.** Eine Planzeile ist eine Muskelgruppe mit Sätzen und Bereich; die Auswahl zeigt alle Übungen der Kategorie, Sterne und vorhandene Ausstattung zuerst.
- **Slot-IDs sind stabil und nie Positionen.** Format `kategorie_bereich_buchstabe` (z. B. `gmax_6-8_a`). Einträge werden unter `cycle:week:slotId` gespeichert.
- **Ändert sich der Wdh.-Bereich oder die Kategorie eines Slots, bekommt er eine neue ID.** Nur die Satzzahl darf sich ändern (sie steht im Eintrag als `baseSets`).
- **Gleiche Slot-ID in 3/4/5 Tagen = dieselbe Zeile.** Übung, Zusatzsätze und Verlauf wandern automatisch mit.
- **Reihenfolge innerhalb eines Tages = Reihenfolge in `templates.json`.** Schwere Grundübung zuerst, Isolation danach, Bauch zuletzt.
- **Ein Plan je Ziel und Tagesanzahl für alle**, es gibt keine Erfahrungsstufen (23.10.2026). Eine feste Grenze für Sätze oder Übungen je Einheit gibt es nicht; die Dauer begrenzt beides.
- **Übungs-IDs sind stabil.** Nie umbenennen oder neu vergeben; eine geänderte Übung bekommt eine neue ID.
- **Prüfen:** `node scripts/verify-plan-data.mjs` erzeugt mit dem echten Generator (`src/core/generator/`) alle Ziele × 3/4/5 Tage (9 Pläne) und prüft: Dauer jeder Einheit 60–90 Minuten, Zeilen je Kategorie und Tag (Hauptmuskelgruppe 2, sonst 1), anteilige Sätze je Muskel und Einheit ≤ 10, **Wochenziel je Muskel**, Frequenz Prio 3 ≥ 2× und mindestens 10 anteilige Sätze pro Woche, Prio 0 nicht im Plan, Slot-IDs passend zu Kategorie und Bereich; dazu die Übungsbibliothek (Kategorien, Ausstattung, Tipp-Format, keine Herstellernamen, jeder Slot hat ≥ 3 passende Übungen und eine Stern-Übung, 6–8-Slots eine schwere Stern-Übung). Am Ende muss `ALLE PRUEFUNGEN GRUEN` stehen.

## Verifizierter Stand (23.10.2026)

| Ziel | Sätze pro Woche bei 3 / 4 / 5 Tagen | Sätze je Einheit | Übungen je Einheit | Minuten je Einheit |
|---|---|---|---|---|
| Apfel | 53 / 69 / 86 | 16–18 | 6–7 | 60–70 |
| Sanduhr | 52 / 70 / 85 | 15–18 | 6–7 | 60–65 |
| V-Form | 52 / 68 / 84 | 15–18 | 5–7 | 60–70 |

Wochenvolumen je Muskel: Tabellen in `docs/wissenschaft.md`.
