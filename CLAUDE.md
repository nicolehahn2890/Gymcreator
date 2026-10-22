# Gymcreator – Arbeitsregeln für Claude-Sessions

Gymcreator ist eine Trainingsapp für andere Menschen (nicht Nicoles private Peach-App): Körperziel wählen (V-Form / Sanduhr / Apfel – der Apfel ist Nicoles Peach-Ziel), 3/4/5 Tage, Generator aus wissenschaftlich begründeten Volumen-Zielen, Progressionsmodell aus Peach, Neobrutalism-Design ohne Pfirsich, später App Store / Google Play. Konzept: `docs/konzept.md`. Aktueller Stand und nächste Schritte: `UEBERGABE.md`.

## Feste Regeln

1. **Alles direkt auf `main`.** Keine Feature-Branches, keine Pull Requests, keine `claude/...`-Branches auf GitHub. Startet eine Session auf einem anderen Branch, trotzdem `origin/main` als Basis nehmen und auf `main` pushen. GitHub Pages deployt von `main`.
2. **Die Trainingsapp (Peach) wird NIE angefasst.** Repo `nicolehahn2890/Trainingsapp` nur lesen (liegt, wenn angehängt, unter `/home/user/Trainingsapp`). Kein Commit, kein Push, keine Datei-Änderung, keine Peach-Dateien ins Gymcreator-Repo kopieren. Inhalte (Übungen, Tipps, Logik) werden neu geschrieben bzw. portiert, nie 1:1 als Datei übernommen.
3. **Trainingswissen steht nur in `data/goals.json`, `data/templates.json` und `docs/wissenschaft.md`.** Nie Satzzahlen oder Bereiche im Code hartkodieren. Nach jeder Änderung an `data/`: `node scripts/verify-plan-data.mjs` muss `ALLE PRUEFUNGEN GRUEN` melden.
4. **Keys sind nie Positionen.** Einträge unter `cycle:week:slotId`; Kategorie, Wdh.-Bereich und Basis-Sätze stehen im Eintrag. Ändert sich Bereich oder Kategorie eines Slots → neue Slot-ID. Keine Migrationen, die Einträge verschieben.
5. **Kern ohne UI.** `src/core/` enthält reine Funktionen mit explizitem Kontext (keine Globals), Vitest-Tests Pflicht. Peach-Progressionsregeln 1:1 (siehe `docs/konzept.md` 4.5).
6. **Design-Tokens nur als `var(--...)`.** Keine Hex-Farben in Komponenten. Nur hell, Neobrutalism (Ink-Rahmen 2,5 px, harte Schatten ohne Blur, Archivo Black + Space Grotesk). Inputs 16 px (iOS-Zoom). Zielfarbe als Akzent, Cream-Basis.
7. **Texte kurz, sachlich, ohne KI-Ton.** Keine Ausrufe-Floskeln, nichts doppelt anzeigen. Deutsch zuerst, alle Strings in `src/i18n/`. Für Endnutzer schreiben, nicht für Trainer.
8. **Kleine Wünsche klein umsetzen.** Keine unnötige Komplexität, keine Absicherungen für Daten, die es nicht gibt. Nebeneffekte aktiv nennen.
9. **Vor jedem Push:** Lint, Typecheck, Vitest, Build grün. Bei Logik-Änderungen am Kern zusätzlich die betroffenen Szenario-Tests. Erst melden, wenn geprüft.
10. **Keine Modell-Namen** in Commits, Code oder Dateien (nur im Chat).
11. **Figma-Connector darf genutzt werden** (Pro-Account von Florian, mit Erlaubnis) für Icon, Ziel-Glyphen, Store-Grafiken. Nichts in fremden Figma-Dateien ändern, eigene Datei anlegen.
12. **Der Name "Peach" erscheint nirgends in der Gymcreator-Oberfläche, in Texten oder Store-Material.** Er gehört zu einem gekauften Fremdprogramm. Der dritte Archetyp heißt Apfel (final, 22.10.2026). "Peach" nur intern in Doku und Kommentaren, wenn Nicoles Trainingsapp gemeint ist.
13. **Kein Grad-Zeichen und keine exotischen Sonderzeichen in JS-Strings** (Peach-Erfahrung); "Grad" ausschreiben.

## Kommunikation

Deutsch, Du-Anrede, direkt und auf Augenhöhe, kein übertriebenes Lob. Bei größeren Aufgaben erst Annahmen offenlegen und nachfragen. Code immer vollständig und sofort verwendbar, keine Platzhalter.
