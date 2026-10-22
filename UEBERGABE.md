# Übergabe – Stand 22.10.2026

Für die nächste Claude-Session, die die Umsetzung übernimmt. Reihenfolge zum Einlesen: `CLAUDE.md` (Regeln, 2 Minuten) → diese Datei → `docs/konzept.md` (freigegebener Plan) → `data/README.md`.

## 1. Entscheidungen (von Nicole bestätigt, 22.10.2026)

| Thema | Entscheidung |
|---|---|
| Stack | React + Vite + TypeScript als PWA auf GitHub Pages; später Capacitor 8 + Codemagic (iOS ohne Mac) |
| Plan-Erzeugung | Generator aus Slot-Pools und Tagesvorlagen (`data/`), kein handgebauter Plan im Code |
| Design | Neobrutalism aus Peach, neutrale Cream-Basis `#FBF3E7`, Zielfarbe als Akzent (V-Form Sky `#8CCBE8`, Sanduhr Lilac `#B49DF2`, Peach Peach `#F4A45E`), kein Pfirsich, nur hell |
| MVP | Onboarding, Plan, geführtes Training, Progression (Peach 1:1), flexible Woche 3/4/5, eigene Übungen, Backup. Form-Tracker, Kurz-Modus, Feinjustierung, Illustrationen, Englisch, Dark Mode = Phase 2 |
| Branch | **Alles direkt auf `main`**, keine Feature-Branches, keine PRs |
| Peach | Trainingsapp nur lesen, nie ändern, keine Dateien kopieren |
| Figma | Connector darf genutzt werden (Pro-Account von Florian) für Icon, Ziel-Glyphen, Store-Grafiken; eigene Datei anlegen |

## 2. Was in dieser Session erledigt wurde

- **Konzept** erarbeitet, kritisch geprüft, von Nicole freigegeben → `docs/konzept.md` (Produkt, Wissenschaft, Splits, flexible Woche, Übungsbibliothek, Progression, UI für Einsteiger, Design-System, Architektur, Datenmodell, Phasen, Verifikation).
- **Recherche Trainingswissenschaft 2023–2026** → `docs/wissenschaft.md` (Regeln mit Evidenz, Vorbehalte, 26 Quellen).
- **Recherche Store-Weg** → `docs/store-weg.md` (Capacitor 8 + Codemagic, Apple 4.2, Google 12-Tester-Regel, Speicher auf iOS, Pflichten ohne Server).
- **Peach-Code gelesen** (read-only, Stand `4ad13af`): 1957 Zeilen, 199 CSS / 1664 JS, 96 Funktionen. Port-Tabelle mit Zeilennummern in `docs/konzept.md` 4.5. Kernbefund: Logik sauber, hängt aber an Globals (`S`, `plan()`, `mk()`) und positionsbasierten Keys → Port mit explizitem Kontext und Slot-IDs.
- **Plan-Daten für alle drei Ziele × 3/4/5 Tage** → `data/goals.json`, `data/templates.json`, geprüft mit `scripts/verify-plan-data.mjs`: alle Grenzen eingehalten, Peach 4 Tage = P4 und 3 Tage = P3 identisch (Tagesnamen, Fokus, Kategorie, Sätze, Bereich, Reihenfolge). 5 bewusste Warnungen (3-Tage-Einheiten mit 21–23 Sätzen).
- **Umgebung geprüft:** Node 22.22.0, npm 10.9.4, pnpm und yarn vorhanden, Playwright-Chromium vorinstalliert unter `/opt/pw-browsers` (`PLAYWRIGHT_BROWSERS_PATH` gesetzt, **kein** `playwright install` nötig), npm-Registry über den Proxy erreichbar. Aktuelle Versionen laut `npm view` am 22.10.2026: vite 8.3.5, react 19.3.1, vite-plugin-pwa 2.0.0, vitest 5.0.5, @playwright/test 1.64.1, dexie 4.4.6, typescript 7.0.2. Vite 8 und TypeScript 7 sind sehr neu: Kompatibilität mit ESLint/Vitest prüfen, notfalls eine Major zurück (Vite 7, TS 5.9).
- Die Pages-Seite der Trainingsapp (`github.io`) ist aus der Sandbox nicht erreichbar (Proxy 403); `git clone` des Repos funktioniert.

## 3. Nächste Schritte – Phase 0 in dieser Reihenfolge

### 3.1 Projekt-Gerüst (⬜)
- Vite + React + TypeScript (strict), ESLint (Flat Config, typescript-eslint, react-hooks), Vitest, `@playwright/test`, `vite-plugin-pwa`.
- `vite.config.ts`: `base: '/Gymcreator/'` (GitHub Pages unter `https://nicolehahn2890.github.io/Gymcreator/`), PWA-Manifest `display: standalone`, Name "Gymcreator", `theme_color` Cream.
- Scripts: `dev`, `build`, `preview`, `test` (vitest run), `test:e2e` (playwright), `lint`, `typecheck`, `verify:data` (`node scripts/verify-plan-data.mjs`).
- `.github/workflows/ci.yml`: bei Push auf `main`: `npm ci` → lint → typecheck → vitest → `verify:data` → build → Playwright-Smoke (Chromium) → `actions/configure-pages` (`enablement: true`) → `upload-pages-artifact` (`dist`) → `deploy-pages`. Permissions `pages: write`, `id-token: write`, `contents: read`. Falls der erste Deploy scheitert: Nicole muss in den Repo-Einstellungen Pages → Source "GitHub Actions" wählen.
- `.gitignore` liegt schon bereit (node_modules, dist, Playwright-Ausgaben).
- Nicole braucht lokal nichts; alles baut in Actions.

### 3.2 Design-Tokens (⬜)
`src/ui/theme/tokens.css`: alle Tokens aus Peachs `:root` (Trainingsapp `index.html` Z. 18–51, read-only lesen) neu anlegen, mit diesen Änderungen: `--bg` = Cream `#FBF3E7` (Lavendel bleibt `--lilac`), `--accent` je Ziel über `html[data-goal="vform|sanduhr|peach"]`, Tagesfarben A–E = Peach/Pink/Lime/Sky/Yellow, Kategorie-Farben aus `data/goals.json` (`color`), Fortschrittsfarben (grün/blau/gelb/rot) wie Peach, Fokus-Ring, Disabled, Press-Interaktion, Fonts Archivo Black + Space Grotesk (Google Fonts). Kein Dark Mode.

### 3.3 Übungsbibliothek v1 (⬜, größte Inhaltsarbeit)
`data/exercises.json` nach dem Format in `data/README.md`. Basis: Peachs `EXERCISES` (Z. 292–306, 142 Übungen), `TIPS` (Z. 307–448), `REC` (Z. 691), `ASSIST` (Z. 697), `RETIRED` (Z. 786) – **nur lesen, Inhalte neu formulieren**. Regeln: Hersteller-Varianten zu je einer Übung zusammenführen ("Rudermaschine (Panatta)/(Precor)" → "Rudermaschine"); Tipps geräteneutral ("Drehachse auf Kniehöhe", keine 169-cm-Hinweise, keine Hebel-Nummern), Format "Einstellung: … / Ausführung: …", 2–3 Sätze; `stars` je Ziel nach `docs/wissenschaft.md` (Stretch-Bias; Po: Hip Thrust, tiefe Kniebeuge, direkte Abduktion; V-Form: vertikaler Zug, schweres Rudern, Seitheben, Schrägbank, Überkopf-Trizeps, Preacher Curls); `focus`-Tags passend zu den Slot-Hinweisen (`vertical`, `horizontal`, `lateral`, `rear`, `press`, `incline`, `fly`, `overhead`, `pump`); `assisted: true` für die assistierten Klimmzüge; Ergänzungen: Bizeps/Trizeps-Breite, Waden, Körpergewicht- und Band-Varianten → 150–180 Übungen, Namen DE + EN. Danach Konsistenz-Check (jede Übung hat Kategorie aus `goals.json`, keine Duplikate, jede Slot-Kategorie hat ≥ 3 Übungen, jeder Stern zeigt auf eine existierende Übung).

### 3.4 Datenmodell + Generator in TypeScript (⬜)
- `src/core/model/types.ts` nach `docs/konzept.md` 4.3.
- `src/core/generator/`: `buildPlan(goal, level, days)` = Logik aus `scripts/verify-plan-data.mjs` (Pool laden → Template anwenden, `{id, sets}`-Override beachten → sortieren nach `categoryOrder`, dann Bereich schwer zuerst, dann Template-Reihenfolge → `validate()` mit `limits`: Fehler vs. Warnung). Einsteiger-Regel: alle Slots 2 Sätze, `4-8` → `6-10`, Kategorien mit ≥ 3 Slots verlieren den letzten Slot. Slot-IDs bleiben dabei stabil (Bereich ist ein Feld).
- Tests (Vitest): alle 3 Ziele × 3/4/5 Tage × 2 Stufen ohne Fehler; deterministisch; **Peach-Regression als Fixture im Repo** (die P4/P3-Tabellen aus `docs/konzept.md` bzw. Peach-Skill als `tests/fixtures/peach-p4.json` / `peach-p3.json` – das sind Nicoles eigene Plan-Tabellen, keine Peach-Dateien), weil CI die Trainingsapp nicht hat.

### 3.5 Platzhalter-Seite live (⬜)
Startseite im Design-System: Wortmarke, die drei Ziele als Karten mit Zielfarbe, Hinweis "im Aufbau". Zweck: Deploy-Weg steht, Nicole sieht das Design auf dem iPhone.

Danach Phase 1 (`docs/konzept.md` Abschnitt 5): Storage + Backup → Generator → Progressions-Port → Onboarding → Training → flexible Woche → Fortschritt → PWA-Feinschliff.

## 4. Verbindliche Details für die Umsetzung

- **Entry-Key** `cycle:week:slotId`; Eintrag trägt `category`, `repRange`, `baseSets`, `exerciseId`, `sets[{w,r}]`, `extraSets`, optional `once`/`baseExerciseId`.
- **Flexible Woche:** gleiche Slot-ID in 3/4/5 Tagen = dieselbe Zeile; Slots außerhalb der Wochenvorlage pausieren; Vorwert über Übung + Bereich (eigener Slot zuerst, laufende Woche nie).
- **Progression:** Port-Tabelle in `docs/konzept.md` 4.5 (Peach-Funktion → Datei → Änderung). Peach-Szenario-Tests als Vitest nachbauen.
- **Texte:** kurz, sachlich, ohne KI-Ton; alles in `src/i18n/de.json`, Englisch später.
- **Keine Modell-Namen** in Commits oder Dateien.

## 5. Offene Punkte und Risiken

- **GitHub Pages aktivieren**: Source "GitHub Actions" in den Repo-Einstellungen, falls `configure-pages` es nicht selbst kann.
- **Google Play**: 12 Tester über 14 Tage – Tester (Partner, Freunde, Gym) früh sammeln; die Nutzertester aus Phase 1 sind dafür gedacht.
- **Figma**: In dieser Session war der Figma-Plugin-Server nicht verbunden (Proxy 403); die direkten `Figma`-Tools waren gelistet, aber ungetestet. Vor der Nutzung Session-Hinweis `create_session` beachten, eigene Datei anlegen, nichts von Florian ändern.
- **Peach und iOS 26**: Safari öffnet Home-Screen-Seiten jetzt standardmäßig als Web-App. Betrifft nur die Trainingsapp (`display: browser`), nicht Gymcreator – Nicole prüft das selbst.
- **Versionen**: Vite 8 / TS 7 sehr neu (siehe 2.).

## 6. Prüfen

```
node scripts/verify-plan-data.mjs
```
Mit der Trainingsapp read-only unter `../Trainingsapp` läuft zusätzlich die Peach-Regression; ohne sie wird sie übersprungen. Am Ende muss `ALLE PRUEFUNGEN GRUEN` stehen.
