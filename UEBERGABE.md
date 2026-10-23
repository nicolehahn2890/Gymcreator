# Übergabe – Stand 23.10.2026

Für die nächste Claude-Session. Reihenfolge zum Einlesen: `CLAUDE.md` (Regeln, 2 Minuten) → diese Datei → `docs/konzept.md` (Konzept und Entscheidungen) → `data/README.md` → bei Fragen zum Volumen `docs/wissenschaft.md`.

> **Das Repo `nicolehahn2890/Trainingsapp` ist NUR ZUM LESEN.** Nichts ändern, nichts committen, nichts pushen. Gearbeitet wird ausschließlich in `nicolehahn2890/Gymcreator`, direkt auf `main`.

## 1. Entscheidungen (von Nicole bestätigt)

| Thema | Entscheidung |
|---|---|
| Archetypen | **V-Form, Sanduhr, Apfel** (Ziel-ID `apfel`). Final. **"Peach" erscheint nirgends in der Oberfläche** (gekauftes Fremdprogramm) |
| Stack | React 19 + Vite 8 + TypeScript 6 als PWA auf GitHub Pages; später Capacitor 8 + Codemagic |
| Design | Neobrutalism, Cream-Basis, Zielfarbe als Akzent, kein Pfirsich, nur hell |
| Branch | **Alles direkt auf `main`**. GitHub Pages: Quelle "GitHub Actions" |
| Gewicht | **pro Satz**. Für den Vergleich werden die Satzgewichte als Spanne gelesen (kleinstes–größtes = Peachs Gewichtsrahmen) |
| Volumen | Wochenziele je Muskel (anteilig) je Ziel und Stufe, begründet in `docs/wissenschaft.md` (je Regel gekennzeichnet: belegt / teilweise / Festlegung; Quellen am 23.10. online geprüft). Nicht 1:1 Peach |
| Grenzen je Einheit | Fortgeschritten **max. 7 Übungen / 18 Sätze** (alle Ziele), Einsteiger max. 6 / 12. **Hauptmuskelgruppe max. 2× pro Tag, alle anderen 1×** |
| Tage | Fortgeschrittene 3/4/5, **Einsteiger nur 3/4** |
| Peach-Abweichungen | Vorwert bevorzugt Wochen mit Wiederholungen; Gegengewicht 0 kg = Bestwert. **Von Nicole bestätigt** |
| Logo | Logo oben auf jeder Seite führt auf „Heute“ |
| Zyklus | 12 Wochen, **kein Deload**. Der nächste Zyklus beginnt mit 5–10 % weniger Gewicht (`progression.nextCycleLighterPct`); erklärt im Plan und auf „Heute“ (Woche 12 und Woche 1 ab Zyklus 2) |
| Muskelmodell | Kniebeuge zählt für den Po 0,5 und bleibt so |
| Wdh.-Bereiche | 6–8 / 6–10 / 8–12 / 12–15, Hauptmuskel wellenförmig über die Woche |
| Übungen | **Frei wählbar je Muskelgruppe**, keine Vorgabe. Sterne = beste Wahl fürs Ziel. 200 Übungen |
| Namen | **Muskelgruppen behalten ihre Namen** (Glute Max, Glute & Quad …). Tage heißen nach Körperbereich („Tag A – Po & Beine“), darunter die Belastung („Schwere Grundübungen“) |
| Training | Übungen **in der Tagesliste aufklappen**. Ab Woche 2 Vorwoche je Satz, Steigerungshinweis, Bewertung (assistiert: Weniger/Mehr Hilfe) |
| Pausentimer | **Nur per Knopf** "Pause starten" in der aufgeklappten Übung, startet nie von selbst |
| Aufbau | Wochenwahl mit Pfeilen auf **Heute und Plan** (gleiches Raster). **"Plan neu einrichten"** im Plan und in den Einstellungen: Einrichtung vorausgefüllt erneut, Verlauf bleibt |

## 2. Stand

Phase 0 und Phase 1 (MVP) sind fertig und live: https://nicolehahn2890.github.io/Gymcreator/

| Bereich | Dateien | Inhalt |
|---|---|---|
| Daten | `data/goals.json`, `templates.json`, `exercises.json` | Bereiche, Grenzen, Stufen, Progression, Pausen; je Ziel Prioritäten, Hauptmuskelgruppe, Wochenziele, Slot-Pool; 9 Tagesvorlagen in Trainingsreihenfolge; 200 Übungen mit Sternen und Tipps |
| Generator | `src/core/generator/` | `buildPlan` (Vorlage + Stufe → Tage), `validatePlan` (alle Grenzen und Wochenziele), `weeklyMuscles` |
| Progression | `src/core/progression/` | `weight`, `compare`, `entries`, `history` (Vorwert), `state` (Zeilen-Zustand: Übung, Sätze, Vorwert, Bewertung, Steigerungshinweis, Haken, Wochenbilanz), `rules` (Auto-Zusatzsatz, Gewichtsvorschlag), `inherit` (Vererbung, "Nur diese Woche"), `cycle` (Übernahme in neuen Zyklus), `week` (Wochenart), `position` (nächster Tag, Dauer). Peach-Szenarien in `scenarios.test.ts` |
| Speicher | `src/storage/` | Dexie (IndexedDB) hinter einer Schnittstelle, Backup (Export/Import mit Prüfung), Sicherheitskopie vor Import, Migrations-Gerüst (Schema 1) |
| Oberfläche | `src/ui/` | Logo-Kopf (`components/AppHeader`), Wochenwahl (`components/WeekNav`, Heute und Plan), Onboarding (5 Schritte, auch als "Plan neu einrichten"), Heute, Tagesansicht mit aufklappbaren Übungen (`DayView`, `ExerciseItem`), Plan (Profilzeile, Woche, Tage je Woche), Fortschritt (Balken), Einstellungen (Profil, Mein Studio, Gewichtsschritte, eigene Übungen, Backup). Zustand: `state/store.ts`, `state/model.ts`, `state/ui.ts` (Position in localStorage), `state/actions.ts` |
| Prüfskript | `scripts/verify-plan-data.mjs` | erzeugt alle 15 Pläne (Einsteiger ohne 5 Tage), prüft Grenzen, Wochenziele und die Bibliothek, druckt Pläne und Wochenvolumen je Muskel |

**Selbsttest am 23.10.** (Browser-Durchläufe aller Pläne und Abläufe, unabhängiger Code-Review). Behoben:
- Gewicht tippen ("27,5") kam in den Folgesätzen nur als "2" an.
- Halteübungen zeigten "2 × 8–12 Sek."; jetzt "2 Sätze halten", Bewertung "Länger gehalten".
- Ein entfernter Zusatzsatz zählte in späteren Wochen weiter (falsche Bewertung "Weniger").
- Gegengewicht: 0 kg Hilfe galt als "kein Wert"; jetzt Bestleistung, kein "Hilfe senken" mehr bei 0.
- Eine Woche mit nur eingetipptem Gewicht verdeckte den echten Vorwert (bewusste Abweichung von Peach, steht in `history.ts`).
- Alter Pausentimer tauchte am nächsten Trainingstag wieder auf.
- "Trainingstage pro Woche" in den Einstellungen wirkte erst im nächsten Zyklus; gilt jetzt ab der aktuellen Woche.
- Zeilen mit gewählter Übung, aber ohne Werte, behielten nach dem Umstellen der Wochenart die alten Sätze.
- Kleineres: Backup-Download auf iOS, Gewichtsschritte nach Import, Prüfung der Backup-Werte, Speicherfehler-Hinweis, Löschen eigener Übungen.

Texte und Tagesnamen sind überarbeitet (kürzer, ohne Fachjargon in den Tagesnamen). Danach: Einsteiger nur 3/4 Tage, Apfel Oberschenkel vorne 3 → 5, Sanduhr-Einsteiger Glute Med 2 → 4, Logo führt auf „Heute“. Testeinträge aus den Plänen vor dem 23.10. (Slot-IDs wie `gmax_4-8_a`) tauchen im neuen Plan nicht mehr auf; zum Testen die Website-Daten löschen.

**Tests:** 126 Vitest + 14 Playwright-Abläufe auf 390 und 430 px (Onboarding, freie Übungswahl, Pause nur per Knopf, Speichern über Neuladen, Auf-/Zuklappen, Wochenwahl auf Heute, Vorwoche je Satz, Steigerungshinweis und Bewertung, Übungswechsel, Satz entfernen, Trainingstage aus den Einstellungen, Logo, Einsteiger-Tage, Umstellen im Plan mit Rückfrage, eigene Übung über drei Wochen, Fortschritt, langer Name, Namen für Screenreader, Zyklus-Hinweise ohne Deload, Plan neu einrichten aus Plan und Einstellungen mit Abbrechen und erhaltenem Verlauf, Backup-Import, Manifest, Offline-Start, kein waagerechtes Scrollen). `node scripts/verify-plan-data.mjs` → `ALLE PRUEFUNGEN GRUEN (0 Warnungen)`.

## 3. Bewusst noch offen

- **Sicherheitskopie und Migrationen**: Die Kopie vor einem Import trägt keine Schema-Version. Sobald es eine Migration (Schema 2) gibt, muss "Wiederherstellen" sie durch `migrate` schicken.
- **Ziel- oder Stufenwechsel mitten im Zyklus**: Plan wird sofort neu gerechnet, Einträge bleiben (Schlüssel = Slot-ID). Slots, die es im neuen Plan nicht gibt, tauchen in diesem Zyklus nicht mehr auf.
- **Lighthouse-PWA-Check** in CI fehlt.
- **Wissenschaft**: Neuer ACSM Position Stand 2026 (Nachfolger von 2009) noch nicht gelesen.
- **Phase 2**: Kurz-Modus, Plateau-Tausch, Form-Tracker, Feinjustierung, Englisch, Dark Mode, Hantelscheiben-Rechner.
- **Nutzertest** mit 3–5 Personen, gleichzeitig die 12 Play-Tester sammeln.

## 4. Nächste Schritte

1. Lighthouse-PWA-Check in CI.
2. Phase 2 nach Priorität: Kurz-Modus, Plateau-Tausch, Form-Tracker.
3. Nutzertest, wenn Nicole Zeit hat.

## 5. Verbindliche Details

- **Entry-Key** `cycle:week:slotId`; Eintrag trägt `day`, `category`, `repRange`, `baseSets`, `exerciseId`, `sets[{w,r}]`, `extraSets`, optional `once`/`baseExerciseId`.
- **Flexible Woche:** gleiche Slot-ID in 3/4/5 Tagen = dieselbe Zeile; die Wochenart wird beim ersten Eintrag einer Woche gespeichert (`Week`), spätere Wochen erben sie.
- **Texte:** alles in `src/i18n/de.json`, kurz, sachlich. Keine Sonderzeichen wie Grad oder Häkchen im Code (`–` für den Halbgeviertstrich, Häkchen als SVG `components/Check.tsx`).
- **Farben nur über Tokens**; Kategorie-Farbe in `goals.json` **und** `--cat-<id>` in `tokens.css` (Test prüft).
- **Vor jedem Push:** `npm run check` muss mit Exit-Code 0 enden (nicht über `grep` prüfen). E2E in der Sandbox: `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium npm run test:e2e` nach `npm run build`.
- **Commits ohne Modellnamen** (CLAUDE.md Regel 10). Ältere Commits bis 23.10. enthalten noch eine Co-Author-Zeile mit Modellnamen; die Historie auf `main` wird nicht umgeschrieben.

## 6. Prüfen

```
npm run check                                   # Lint, Typecheck, Vitest, verify:data, Build
npm run build && PW_CHROMIUM_PATH=/opt/pw-browsers/chromium npm run test:e2e
node scripts/verify-plan-data.mjs               # nach jeder Änderung an data/
```

`github.io` ist aus der Sandbox nicht erreichbar (Proxy 403); den Deploy über die Actions-Läufe prüfen.
