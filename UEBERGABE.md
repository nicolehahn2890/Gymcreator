# Übergabe – Stand 23.10.2026 (abends)

Für die nächste Claude-Session. Reihenfolge zum Einlesen: `CLAUDE.md` (Regeln, 2 Minuten) → diese Datei → `docs/konzept.md` (freigegebener Plan) → `data/README.md`.

> **Das Repo `nicolehahn2890/Trainingsapp` ist NUR ZUM LESEN.** Nichts ändern, nichts committen, nichts pushen. Gearbeitet wird ausschließlich in `nicolehahn2890/Gymcreator`, direkt auf `main`.

## 1. Entscheidungen (von Nicole bestätigt)

| Thema | Entscheidung |
|---|---|
| Archetypen | **V-Form, Sanduhr, Apfel** (Ziel-ID `apfel`). Final. **"Peach" erscheint nirgends in der Oberfläche** (gekauftes Fremdprogramm) |
| Stack | React 19 + Vite 8 + TypeScript 6 als PWA auf GitHub Pages; später Capacitor 8 + Codemagic |
| Plan-Erzeugung | Generator aus Slot-Pools und Tagesvorlagen (`data/`) |
| Design | Neobrutalism, Cream-Basis, Zielfarbe als Akzent, kein Pfirsich, nur hell |
| Branch | **Alles direkt auf `main`** |
| GitHub Pages | Quelle "GitHub Actions" (umgestellt 23.10.2026); der alte Branch-Build läuft nicht mehr |
| Gewicht | **pro Satz** (23.10.2026). Für den Vergleich werden die Satzgewichte als Spanne gelesen (kleinstes–größtes = Peachs Gewichtsrahmen) |
| Volumen | **Neu (23.10.2026):** Wochenziele je Muskel (anteilig) je Ziel und Stufe, wissenschaftlich begründet in `docs/wissenschaft.md`. Peachs P3/P4 sind nicht mehr Vorlage |
| Grenzen je Einheit | Fortgeschritten **max. 7 Übungen / 18 Sätze** (alle Ziele, auch Apfel), Einsteiger max. 6 / 12. **Hauptmuskelgruppe max. 2× pro Tag, alle anderen 1×** |
| Wdh.-Bereiche | 6–8 / 6–10 / 8–12 / 12–15, Hauptmuskel wellenförmig über die Woche. 4–8 entfällt |
| Übungen | **Frei wählbar je Muskelgruppe**, keine Vorgabe. Sterne = beste Wahl fürs Ziel. 200 Übungen |
| Training | Übungen **in der Tagesliste aufklappen** (keine eigene Übungsseite). Ab Woche 2 Vorwoche je Satz, Steigerungshinweis, Bewertung (assistiert: Weniger/Mehr Hilfe) |

## 2. Stand

**Phase 0 erledigt** (22.10.): Gerüst, CI/Pages, Tokens, Übungsbibliothek (180), Generator, Prüfskript.

**Phase 1 – erledigt am 23.10.:**

| Teil | Dateien | Inhalt |
|---|---|---|
| Progression | `src/core/progression/` | `weight`, `compare` (prog/rcol), `entries` (Schlüssel `cycle:week:slotId`, Index, Satzgewichte als Spanne), `history` (Vorwert), `state` (Zeilen-Zustand: Übung, Sätze, Vorwert, Badge, Steigerungs-Hinweis, Haken, Wochenbilanz), `rules` (Auto-Zusatzsatz, Gewichtsvorschlag), `inherit` (Vererbung, Übungswechsel "nur diese Woche"), `cycle` (Übernahme in neuen Zyklus), `week` (Wochenart), `position` (nächster Tag, Dauer). Peach-Szenarien als Vitest in `scenarios.test.ts` |
| Speicher | `src/storage/` | Schnittstelle, Dexie (IndexedDB), Backup (Export/Import mit Prüfung), Sicherheitskopie vor Import, Migrations-Gerüst (Schema 1) |
| Oberfläche | `src/ui/` | Onboarding (5 Schritte), Heute, Tag (seit 23.10. abends mit aufklappbaren Übungen), Plan (Woche, 3/4/5 Tage), Fortschritt (Balken), Einstellungen (Profil, Mein Gym, Gewichtsschritte, eigene Übungen, Backup). Zustand: `state/store.ts` (useSyncExternalStore), `state/model.ts` (abgeleitet), `state/ui.ts` (Position in localStorage) |
| Daten | `data/goals.json` | neu: `levels`, `progression` (12 Wochen, Vergleich ab Woche 2, 3 stagnierende Vergleiche, +1 Satz), `timing` (Pausen je Bereich, Satzdauer). `data/exercises.json`: `increments` (Schrittweiten) |

**Umbau am 23.10. (abends) nach Nicoles Rückmeldung** („Volumen viel zu hoch, zu viele gleichartige Übungen, Übungen vorgegeben, Übung einzeln aufrufen zu umständlich“):

| Teil | Dateien | Inhalt |
|---|---|---|
| Volumen | `data/goals.json`, `data/templates.json`, `docs/wissenschaft.md` | Wochenziele je Muskel (`targets`), `mainCategory`, Grenzen je Stufe (`levels.*.min/maxExercisesPerSession`, `maxSetsPerSession`), Zeilen je Kategorie und Tag (`limits`). 9 Vorlagen neu, Reihenfolge = Trainingsreihenfolge, `beginner: false` je Zeile. Fortgeschritten 48–57 Sätze/Woche, Einsteiger 24–32 |
| Generator | `src/core/generator/buildPlan.ts`, `validate.ts` | ohne Sortierung und ohne Einsteiger-Streichregel; Prüfung auf Wochenziele, Übungen/Sätze je Einheit, Kategorie je Tag. `assign.ts` (Standard-Übung) entfernt |
| Prüfskript | `scripts/verify-plan-data.mjs` | Peach-P3/P4-Abgleich und `tests/fixtures/` entfernt; druckt alle 18 Pläne mit Wochenvolumen je Muskel |
| Übungen | `data/exercises.json` | +20 (Beinbeuger, Beinstrecker, Waden, Adduktoren, Hüfte, Kniebeuge-Varianten, Po), jede Kategorie ≥ 7 |
| Oberfläche | `src/ui/screens/DayView.tsx`, `ExerciseItem.tsx` | Tagesliste mit aufklappbaren Übungen (ersetzt `ExerciseView`): Muskelgruppe + Hinweis, Übung (Stern), Sätze × Bereich, Bewertung, Haken; aufgeklappt Steigerungshinweis, Sätze mit Spalte **Vorwoche/Zuletzt**, Satz dazu/weniger, Tauschen, Ausführung, Einstellung/Notiz, „Nächste Übung“. Tag öffnen klappt die erste offene Übung auf. Leere Info-Karte behoben |
| Texte | `src/i18n/de.json` | `focus`-Hinweise („Ziehen von oben“ …), neue Vorschlagstexte, Onboarding-Hinweis zur freien Wahl |

Testeinträge aus den alten Plänen (Slot-IDs wie `gmax_4-8_a`) bleiben gespeichert, tauchen im neuen Plan aber nicht mehr auf. Zum Testen am besten die Website-Daten löschen und neu einrichten.

**Tests:** 125 Vitest + 12 Playwright (390/430 px: Onboarding, freie Übungswahl, Speichern über Neuladen, Auf-/Zuklappen, Vorwoche je Satz, Steigerungshinweis und Bewertung in Woche 2, Übungswechsel, Backup-Import, Offline-Start, kein waagerechtes Scrollen). `node scripts/verify-plan-data.mjs` → `ALLE PRUEFUNGEN GRUEN (0 Warnungen)`.

## 3. Bewusst noch offen

- **Deload opt-in** (Konzept 3.7 Einstellungen): nicht gebaut, weil die Regel dafür nicht festgelegt ist (welche Woche, wie viel weniger). Erst mit Nicole klären.
- **Plateau-Tausch, Kurz-Modus, Feinjustierung, Form-Tracker, Englisch, Dark Mode**: Phase 2.
- **Lighthouse-PWA-Check** in CI: fehlt noch.
- **Ziel- oder Stufenwechsel mitten im Zyklus**: Plan wird sofort neu gerechnet, Einträge bleiben (Schlüssel = Slot-ID). Slots, die es im neuen Plan nicht gibt, tauchen im Verlauf dieses Zyklus nicht mehr auf. Für den MVP so gelassen.
- **Nutzertest** mit 3–5 Personen (Nicole), gleichzeitig Sammeln der 12 Play-Tester.

## 4. Nächste Schritte

1. Nicole testet die neuen Pläne und die aufklappbare Tagesansicht auf dem iPhone (https://nicolehahn2890.github.io/Gymcreator/, vorher Website-Daten löschen) und meldet, was hakt.
2. Lighthouse-PWA-Check in CI.
3. Danach Phase 2 nach Priorität (Konzept 3.9): Form-Tracker, Kurz-Modus, Plateau-Tausch.

## 5. Verbindliche Details

- **Entry-Key** `cycle:week:slotId`; Eintrag trägt `day`, `category`, `repRange`, `baseSets`, `exerciseId`, `sets[{w,r}]`, `extraSets`, optional `once`/`baseExerciseId`.
- **Flexible Woche:** gleiche Slot-ID in 3/4/5 Tagen = dieselbe Zeile; die Wochenart wird beim ersten Eintrag einer Woche gespeichert (`Week`).
- **Texte:** alles in `src/i18n/de.json`, kurz, sachlich. Keine Sonderzeichen wie Grad oder Häkchen im Code (`–` für den Halbgeviertstrich, Häkchen als SVG `components/Check.tsx`).
- **Farben nur über Tokens**; Kategorie-Farbe in `goals.json` **und** `--cat-<id>` in `tokens.css` (Test prüft).
- **Vor jedem Push:** `npm run check` muss mit Exit-Code 0 enden (nicht über `grep` prüfen). E2E in der Sandbox: `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium npm run test:e2e` nach `npm run build`.

## 6. Prüfen

```
npm run check                                   # Lint, Typecheck, Vitest, verify:data, Build
npm run build && PW_CHROMIUM_PATH=/opt/pw-browsers/chromium npm run test:e2e
node scripts/verify-plan-data.mjs               # nach jeder Änderung an data/
```

`github.io` ist aus der Sandbox nicht erreichbar (Proxy 403); den Deploy über die Actions-Läufe prüfen.
