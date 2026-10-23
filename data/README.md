# data/ – die einzige Stelle mit Trainingswissen

Begründung aller Zahlen: `docs/wissenschaft.md`.

| Datei | Inhalt |
|---|---|
| `goals.json` | Wdh.-Bereiche (`ranges`, schwerster zuerst); Kategorien (Peach-Kategorien + Bizeps/Trizeps/Waden) mit Farbe und anteiliger Muskelzählung; Grenzen (`limits`); Regeln je Erfahrungsstufe (`levels`); Progression; `timing` (Pausen je Bereich, Satzdauer, Wechsel/Aufwärmen je Übung für die Dauer-Schätzung, Zeiten des Kurz-Modus `shortMinutes`); je Ziel: Prioritäten 0–3, `mainCategory` (Hauptmuskelgruppe), `targets` (Wochenziel je Muskel und Stufe, anteilig, `[min, max]`) und der **Slot-Pool** (stabile IDs, Kategorie, Wdh.-Bereich, Basis-Sätze, optionaler `focus`-Hinweis) |
| `templates.json` | Je Ziel und Tagesanzahl (3/4/5) die Tage mit Name, Fokuszeile und Slot-IDs **in Trainingsreihenfolge**. Ein Eintrag darf ein Objekt sein: `sets` = andere Basis-Sätze in dieser Wochenart, `beginner: false` = fällt für Einsteiger weg. Slots, die in einer Wochenart fehlen, **pausieren** dort |
| `exercises.json` | Übungsbibliothek (200 Übungen, jede Kategorie mindestens 7). Je Übung: `id`, `name {de,en}`, `category`, `secondary[]`, `equipment[]`, `pattern`, `focus[]` (passt zu Slot-Hinweisen, sortiert die Auswahl), `stars[]` (Ziele, für die sie Top-Wahl ist), `heavy` (geeignet für 6–8), `stretch`, `unilateral`, `assisted` (Gegengewicht: weniger = schwerer), `timed` (Sekunden statt Wdh.), `tip {de}` im Format `Einstellung: …\nAusführung: …`. Reihenfolge je Kategorie = Vorzugsreihenfolge |

## Regeln

- **Die Übung wählt die Person.** Eine Planzeile ist eine Muskelgruppe mit Sätzen und Bereich; die Auswahl zeigt alle Übungen der Kategorie, Sterne und vorhandene Ausstattung zuerst.
- **Slot-IDs sind stabil und nie Positionen.** Format `kategorie_bereich_buchstabe` (z. B. `gmax_6-8_a`). Einträge werden unter `cycle:week:slotId` gespeichert.
- **Ändert sich der Wdh.-Bereich oder die Kategorie eines Slots, bekommt er eine neue ID.** Nur die Satzzahl darf sich ändern (sie steht im Eintrag als `baseSets`). Ausnahme mit Absicht: die Einsteiger-Stufe ersetzt 6–8 und 6–10 durch 8–12, die Slot-ID bleibt (der Bereich steht im Eintrag, der Vorwert sucht über Übung + Bereich).
- **Gleiche Slot-ID in 3/4/5 Tagen = dieselbe Zeile.** Übung, Zusatzsätze und Verlauf wandern automatisch mit.
- **Reihenfolge innerhalb eines Tages = Reihenfolge in `templates.json`.** Schwere Grundübung zuerst, Isolation danach, Bauch zuletzt.
- **Stufen (`levels`):** `days` = wählbare Tage pro Woche (Einsteiger 3 oder 4, Fortgeschrittene 3, 4 oder 5). Einsteiger: 2 Sätze je Zeile, 6–8 und 6–10 werden 8–12, Zeilen mit `beginner: false` entfallen. Ein nicht erlaubter Wert aus alten Wochen wird zum nächstkleineren (`effectiveDays`). Fortgeschrittene: `minWeeklySetsPrio3` = Mindestvolumen (anteilige Sätze pro Woche) für jeden Muskel, den eine Prio-3-Kategorie direkt trainiert (ACSM 2026, geprüft in `validatePlan`).
- **Übungs-IDs sind stabil.** Nie umbenennen oder neu vergeben; eine geänderte Übung bekommt eine neue ID.
- **Prüfen:** `node scripts/verify-plan-data.mjs` erzeugt mit dem echten Generator (`src/core/generator/`) alle Ziele × Stufen × erlaubte Tage (15 Pläne) und prüft: Übungen und Sätze je Einheit (Stufe), Zeilen je Kategorie und Tag (Hauptmuskelgruppe 2, sonst 1), anteilige Sätze je Muskel und Einheit ≤ 10, **Wochenziel je Muskel**, Frequenz Prio 3 ≥ 2×, Prio 0 nicht im Plan, Slot-IDs passend zu Kategorie und Bereich; dazu die Übungsbibliothek (Kategorien, Ausstattung, Tipp-Format, keine Herstellernamen, jeder Slot hat ≥ 3 passende Übungen und eine Stern-Übung, 6–8-Slots eine schwere Stern-Übung). Am Ende muss `ALLE PRUEFUNGEN GRUEN` stehen.

## Verifizierter Stand (23.10.2026, abends)

| Ziel | Fortgeschritten 3 / 4 / 5 Tage | Sätze je Einheit | Einsteiger 3 / 4 Tage | Sätze je Einheit |
|---|---|---|---|---|
| Apfel | 50 / 55 / 55 | 9–18 | 30 / 34 | 8–10 |
| Sanduhr | 48 / 56 / 55 | 9–17 | 30 / 32 | 6–10 |
| V-Form | 51 / 56 / 57 | 10–18 | 24 / 26 | 6–8 |

Wochenvolumen je Muskel: Tabellen in `docs/wissenschaft.md`.
