# Übergabe – Stand 22.10.2026 (Abend)

Für die nächste Claude-Session. Reihenfolge zum Einlesen: `CLAUDE.md` (Regeln, 2 Minuten) → diese Datei → `docs/konzept.md` (freigegebener Plan) → `data/README.md`.

> **Das Repo `nicolehahn2890/Trainingsapp` ist NUR ZUM LESEN.** Nichts ändern, nichts committen, nichts pushen. Gearbeitet wird ausschließlich in `nicolehahn2890/Gymcreator`, direkt auf `main`.

## 1. Entscheidungen (von Nicole bestätigt, 22.10.2026)

| Thema | Entscheidung |
|---|---|
| Archetypen | **V-Form, Sanduhr, Apfel** (Ziel-ID `apfel`, Label Apfel/Apple, Akzent Pink). Final. Der Apfel ist inhaltlich Nicoles Peach-Ziel, aber **"Peach" erscheint nirgends in der Gymcreator-Oberfläche** (gekauftes Fremdprogramm) |
| Stack | React 19 + Vite 8 + TypeScript 6 als PWA auf GitHub Pages; später Capacitor 8 + Codemagic (iOS ohne Mac) |
| Plan-Erzeugung | Generator aus Slot-Pools und Tagesvorlagen (`data/`), kein handgebauter Plan im Code |
| Design | Neobrutalism aus Peach, Cream-Basis `#FBF3E7`, Zielfarbe als Akzent (V-Form Sky, Sanduhr Lilac, Apfel Pink), kein Pfirsich, nur hell |
| MVP | Onboarding, Plan, geführtes Training, Progression (Peach 1:1), flexible Woche 3/4/5, eigene Übungen, Backup. Form-Tracker, Kurz-Modus, Feinjustierung, Illustrationen, Englisch, Dark Mode = Phase 2 |
| Branch | **Alles direkt auf `main`**, keine Feature-Branches, keine PRs |
| Figma | Connector darf genutzt werden (Pro-Account von Florian); eigene Datei anlegen, nichts Fremdes ändern |

## 2. Phase 0 – erledigt (22.10.2026)

| Schritt | Ergebnis |
|---|---|
| 3.1 Gerüst | Vite 8, React 19, TS 6 strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`), ESLint 10 Flat Config + typescript-eslint strict + react-hooks, Vitest 5, Playwright 1.64, vite-plugin-pwa 2 (`base: '/Gymcreator/'`, `display: standalone`). Scripts: `dev`, `build`, `preview`, `test`, `test:e2e`, `lint`, `typecheck`, `verify:data`, `check` (alles außer E2E) |
| CI | `.github/workflows/ci.yml`: Lint → Typecheck → Vitest → `verify:data` → Build → Playwright-Smoke (390 + 430 px, mit dem vorinstallierten Chrome des Runners, `PW_CHANNEL=chrome`) → Pages-Deploy. Dauer ca. 1 Minute |
| 3.2 Tokens | `src/ui/theme/tokens.css` (alle Peach-Tokens neu, `--orange` statt Pfirsich-Name, `--accent` über `html[data-goal]`, Tagesfarben A–E, `--cat-<id>` wie `goals.json`, Fortschritt), `base.css` (Press, Disabled, Fokus-Ring, 16-px-Inputs, reduced motion). Test prüft Kategorie-Farben gegen `goals.json`. Schriften selbst gehostet über `@fontsource` (offline) |
| 3.3 Übungen | `data/exercises.json`: **180 Übungen**, Hersteller-Varianten zusammengeführt, Tipps neu und geräteneutral ("Einstellung: …\nAusführung: …"), Namen DE + EN, `stars[]` je Ziel, `heavy` (für 4–8), `stretch`, `unilateral`, `assisted` (nur die beiden assistierten Klimmzüge), `timed` (Planks). Reihenfolge je Kategorie = Vorzugsreihenfolge. Englische Tipps und "Warum"-Satz: Phase 2 |
| 3.4 Kern | `src/core/model/types.ts` (Datenmodell inkl. `Entry`, `Exercise`), `src/core/generator/buildPlan.ts` + `validate.ts`, `src/core/model/exerciseCheck.ts`. Einsteiger-Regeln stehen in `data/goals.json` → `levels` |
| 3.5 Seite | Platzhalter-Startseite (Wortmarke, Pixel-Hantel, drei Zielkarten mit Pixel-Glyphen, Hinweis "Im Aufbau", Version + Commit). Icons aus `scripts/make-icons.mjs` (Pixel-Hantel, Platzhalter bis Florian) |
| Extra (Phase 1 vorgezogen) | `src/core/progression/weight.ts` + `compare.ts`: `parseWeight`, `weightBounds`, `cmpWeight`, `progressStatus` (= Peach `prog`), `repZone` (= Peach `rcol`), Logik 1:1, alle Peach-Funktionsfälle als Vitest |

**Tests:** 67 Vitest (Generator alle 3 Ziele × 2 Stufen × 3/4/5 Tage ohne Fehler, deterministisch, Apfel 4/3 = Nicoles P4/P3 aus `tests/fixtures/`, Wochensummen, Einsteiger-Regel, Bibliothek, Tokens, Progression) + 6 Playwright. `node scripts/verify-plan-data.mjs` nutzt jetzt den echten TS-Generator und meldet `ALLE PRUEFUNGEN GRUEN (5 Warnungen)`.

**Geänderte Regel (bitte beachten):** Einsteiger-Stufe – der wegfallende Slot kommt nur von einem Tag, an dem die Kategorie doppelt vorkommt. Vorher fiel bei V-Form die einzige Brust-Zeile eines Tages weg (Brust nur noch 1×/Woche, Prio 3 verlangt 2×). Steht in `data/README.md`, `docs/wissenschaft.md`, `docs/konzept.md`.

## 3. Offen für Nicole

1. **GitHub Pages auf "GitHub Actions" umstellen** (Repo → Settings → Pages → Build and deployment → Source: *GitHub Actions*). Bis dahin läuft bei jedem Push zusätzlich der alte Branch-Build (`pages build and deployment`) und kann unseren Deploy überschreiben – dann zeigt die Seite eine leere Seite. Notlösung: Workflow "CI und Pages" in Actions per "Run workflow" neu starten.
2. **Gewicht pro Satz oder pro Übung?** (Entscheidung vor dem Progressions-Port, Abschnitt 4.3). Empfehlung: pro Satz (wie `docs/konzept.md` 4.3 und die Fokusansicht "Gewicht · Reps · Haken"). Peachs Vergleich bleibt 1:1, indem die Satzgewichte als Spanne gelesen werden (kleinstes–größtes = Peach `"40-45"`).
3. Remote-Branch `claude/serene-mccarthy-xx7xko` existiert auf GitHub (beim Session-Start angelegt, Stand = alter `main`). Nach Regel 1 unerwünscht; darf gelöscht werden.

## 4. Nächste Schritte – Phase 1 (`docs/konzept.md` Abschnitt 5)

1. **Storage + Backup:** `src/storage/interface.ts` (Profile, Plan-Version, Entries unter `cycle:week:slotId`, Weeks, ExerciseNote, CustomExercise), `dexie.ts` (Dexie 4), `backup.ts` (`{app:'gymcreator', schema:1, …}`, Import validiert und fragt), Migrations-Gerüst mit Sicherheitskopie. Tests mit `fake-indexeddb`.
2. **Progression fertig portieren** (Trainingsapp dafür wieder read-only anhängen): Port-Tabelle `docs/konzept.md` 4.5. Noch offen: `history.ts` (findLastExData: gleicher Bereich im aktuellen Zyklus → zuletzt trainierter Zyklus davor → Orientierung; eigener Slot zuerst; laufende Woche nie), `state.ts` (exState/exDone/weekStats), `rules.ts` (incDue, autoExtraSets ab Woche 4, max. 5 Sätze), `inherit.ts` (Übung über Lücken, "nur diese Woche" über `baseExerciseId`), `cycle.ts` (carryMap nach Kategorie + Bereich, keine Dopplung je Tag), `week.ts` (Wochen-Art, Vorauswahl = Vorwoche). Peach-Szenarien (`tests/*.test.js` in der Trainingsapp: vorwert-vorwoche, vorwert-zyklusstart, verlauf-woche1-2, verlauf-planwechsel, steigerung, uebungswechsel, flex-woche, randfaelle) als Vitest nachbauen.
3. **Standard-Übung je Slot** (Vorschlag): erste Übung der Bibliothek mit passender Kategorie und Fokus, Stern für das Ziel, bei 4–8 `heavy`, Ausstattung vorhanden, am selben Tag noch nicht vergeben; sonst ohne Stern; sonst ohne Fokus. Einsteiger: Maschinen zuerst.
4. UI: Onboarding (Ziel → Erfahrung → Tage → Mein Gym → Plan fertig) → Plan-Ansicht → Heute + Training → flexible Woche → Fortschritt → Einstellungen/Backup → PWA-Feinschliff.

## 5. Verbindliche Details

- **Entry-Key** `cycle:week:slotId`; Eintrag trägt `category`, `repRange`, `baseSets`, `exerciseId`, `sets[{w,r}]`, `extraSets`, optional `once`/`baseExerciseId`.
- **Flexible Woche:** gleiche Slot-ID in 3/4/5 Tagen = dieselbe Zeile; Slots außerhalb der Wochenvorlage pausieren; Vorwert über Übung + Bereich (eigener Slot zuerst, laufende Woche nie).
- **Texte:** kurz, sachlich, ohne KI-Ton; alles in `src/i18n/de.json`.
- **Farben nur über Tokens**; neue Kategorie = Farbe in `goals.json` **und** `--cat-<id>` in `tokens.css` (Test prüft).
- **Keine Modell-Namen** in Commits oder Dateien.

## 6. Prüfen

```
npm run check                                   # Lint, Typecheck, Vitest, verify:data, Build
PW_CHROMIUM_PATH=/opt/pw-browsers/chromium npm run test:e2e   # in der Claude-Sandbox
node scripts/verify-plan-data.mjs               # nach jeder Änderung an data/: ALLE PRUEFUNGEN GRUEN
```

Umgebung (Sandbox): Node 22.22 (TypeScript-Import in Node ohne Flag), Chromium unter `/opt/pw-browsers/chromium` (Playwright 1.64 erwartet eine neuere Revision, deshalb `PW_CHROMIUM_PATH`). `github.io` ist aus der Sandbox nicht erreichbar (Proxy 403); den Deploy über die Actions-Läufe prüfen.
