# Übergabe – Stand 23.10.2026

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

## 2. Stand

**Phase 0 erledigt** (22.10.): Gerüst, CI/Pages, Tokens, Übungsbibliothek (180), Generator, Prüfskript.

**Phase 1 – erledigt am 23.10.:**

| Teil | Dateien | Inhalt |
|---|---|---|
| Progression | `src/core/progression/` | `weight`, `compare` (prog/rcol), `entries` (Schlüssel `cycle:week:slotId`, Index, Satzgewichte als Spanne), `history` (Vorwert), `state` (Zeilen-Zustand: Übung, Sätze, Vorwert, Badge, Steigerungs-Hinweis, Haken, Wochenbilanz), `rules` (Auto-Zusatzsatz, Gewichtsvorschlag), `inherit` (Vererbung, Übungswechsel "nur diese Woche"), `cycle` (Übernahme in neuen Zyklus), `week` (Wochenart), `position` (nächster Tag, Dauer). Peach-Szenarien als Vitest in `scenarios.test.ts` |
| Standard-Übung | `src/core/generator/assign.ts` | je Slot über den ganzen Pool: Fokus, schwer bei 4–8, keine Wiederholung in der Kategorie, Stern, Einsteiger geführt (Maschine/Kabel), Ausstattung |
| Speicher | `src/storage/` | Schnittstelle, Dexie (IndexedDB), Backup (Export/Import mit Prüfung), Sicherheitskopie vor Import, Migrations-Gerüst (Schema 1) |
| Oberfläche | `src/ui/` | Onboarding (5 Schritte), Heute, Tag, Fokusansicht (Sätze, Vorwert, Vorschlag, Badge, Pausentimer, Tausch, Notiz/Einstellung), Plan (Woche, 3/4/5 Tage), Fortschritt (Balken), Einstellungen (Profil, Mein Gym, Gewichtsschritte, eigene Übungen, Backup). Zustand: `state/store.ts` (useSyncExternalStore), `state/model.ts` (abgeleitet), `state/ui.ts` (Position in localStorage) |
| Daten | `data/goals.json` | neu: `levels`, `progression` (12 Wochen, Vergleich ab Woche 2, 3 stagnierende Vergleiche, +1 Satz), `timing` (Pausen je Bereich, Satzdauer). `data/exercises.json`: `increments` (Schrittweiten) |

**Tests:** 136 Vitest + 12 Playwright (390/430 px: Onboarding, Speichern über Neuladen, Badge und Vorschlag in Woche 2, Übungswechsel, Backup-Import, Offline-Start, kein waagerechtes Scrollen). `node scripts/verify-plan-data.mjs` → `ALLE PRUEFUNGEN GRUEN (5 Warnungen)`.

**Geänderte Regeln (dokumentiert):** Einsteiger verlieren den letzten Slot nur von einem Tag, an dem die Kategorie doppelt vorkommt. Einsteiger bekommen geführte Übungen (Maschine, Kabel) zuerst. Rudermaschine hat den V-Form-Stern.

## 3. Bewusst noch offen

- **Deload opt-in** (Konzept 3.7 Einstellungen): nicht gebaut, weil die Regel dafür nicht festgelegt ist (welche Woche, wie viel weniger). Erst mit Nicole klären.
- **Plateau-Tausch, Kurz-Modus, Feinjustierung, Form-Tracker, Englisch, Dark Mode**: Phase 2.
- **Lighthouse-PWA-Check** in CI: fehlt noch.
- **Ziel- oder Stufenwechsel mitten im Zyklus**: Plan wird sofort neu gerechnet, Einträge bleiben (Schlüssel = Slot-ID). Slots, die es im neuen Plan nicht gibt, tauchen im Verlauf dieses Zyklus nicht mehr auf. Für den MVP so gelassen.
- **Nutzertest** mit 3–5 Personen (Nicole), gleichzeitig Sammeln der 12 Play-Tester.

## 4. Nächste Schritte

1. Nicole testet auf dem iPhone (https://nicolehahn2890.github.io/Gymcreator/, zum Home-Bildschirm hinzufügen) und meldet, was hakt.
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
