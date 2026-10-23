# Übergabe – Stand 23.10.2026

Für die nächste Claude-Session. Reihenfolge zum Einlesen: `CLAUDE.md` (Regeln, 2 Minuten) → diese Datei → `docs/konzept.md` (Konzept und Entscheidungen) → `data/README.md` → bei Fragen zum Volumen `docs/wissenschaft.md`.

> **Das Repo `nicolehahn2890/Trainingsapp` ist NUR ZUM LESEN.** Nichts ändern, nichts committen, nichts pushen. Gearbeitet wird ausschließlich in `nicolehahn2890/Gymcreator`, direkt auf `main`.

## 1. Entscheidungen (von Nicole bestätigt)

| Thema | Entscheidung |
|---|---|
| Name | **Rexy** (Nicole, 23.10.): Wortmarke, Seitentitel, Manifest, Backup-Dateiname. Repo, Web-Adresse `/Gymcreator/` und interne Kennungen (Datenbank `gymcreator`, `gymcreator_ui`, Backup-Feld `app`) bleiben, sonst wären gespeicherte Daten und alte Backups weg |
| Archetypen | **V-Form, Sanduhr, Apfel** (Ziel-ID `apfel`). Final. **"Peach" erscheint nirgends in der Oberfläche** (gekauftes Fremdprogramm) |
| Stack | React 19 + Vite 8 + TypeScript 6 als PWA auf GitHub Pages; später Capacitor 8 + Codemagic |
| Design | **Design System „Rexy“** (Neobrutalism, Nicole 23.10.): Farben und Schriften aus Flos Marketing-Kit (Nicole 23.10.: "alles aufs Kit umstellen"): Pink `#FF199B` / Cyan `#00DDE8` / Neongelb `#F5FF00`, dazu Lime, Violett und Koralle (noch ohne Rolle); Cream-Basis `#FFF9E5`; Bowlby One SC + Inter; Zielfarbe als Akzent (V-Form Cyan, Sanduhr Gelb, Apfel Pink); Tage A Pink, B Cyan, C Gelb, D Lime, E Violett; Stand-Pillen in der Tagesfarbe auf Ink, **auch bei Pink und Violett** (Nicole); aktuelle Woche im Fortschritt Cyan, bei V-Form Pink (nicht Schwarz, Nicole). Rexe in Zielwahl (Motiv) und Einstellungen (freigestellt, ohne Hintergrund). Kein Pfirsich, vorerst nur hell; **Dark Mode später** als eigener Token-Satz (Phase 2) |
| Branch | **Alles direkt auf `main`**. GitHub Pages: Quelle "GitHub Actions" |
| Gewicht | **pro Satz**. Für den Vergleich werden die Satzgewichte als Spanne gelesen (kleinstes–größtes = Peachs Gewichtsrahmen) |
| Volumen | Wochenziele je Muskel (anteilig) je Ziel, begründet in `docs/wissenschaft.md` (je Regel gekennzeichnet: belegt / teilweise / Festlegung; Quellen am 23.10. online geprüft). Nicht 1:1 Peach. Seit dem ACSM-Abgleich: **jede Prio-3-Muskelgruppe mindestens 10** anteilige Sätze pro Woche (`limits.minWeeklySetsPrio3`) |
| Grenzen je Einheit | **Keine feste Grenze für Sätze oder Übungen**: Die geschätzten 18 Sätze / 7 Übungen waren nicht belegt und sind entfernt (Nicole, 23.10.). Es gelten 60–90 Minuten und höchstens 10 anteilige Sätze je Muskel und Einheit (in den Plänen 15–18 Sätze, 5–7 Übungen). **Hauptmuskelgruppe max. 2× pro Tag, alle anderen 1×** |
| Tage | 3, 4 oder 5 für alle. **Keine Erfahrungsstufen** (Nicole, 23.10.: entfernt, **ohne** Hinweis auf eine Zielgruppe) |
| Peach-Abweichungen | Vorwert bevorzugt Wochen mit Wiederholungen; Gegengewicht 0 kg = Bestwert; "Übung entfernen" löscht die Werte der Woche. **Von Nicole bestätigt** |
| Logo | Wortmarke (gelbes Schild mit pinkem Versatz) im Kopf, der oben stehen bleibt; führt auf die Startseite |
| Zyklus | 12 Wochen, **kein Deload**. Der nächste Zyklus beginnt mit 5–10 % weniger Gewicht (`progression.nextCycleLighterPct`); erklärt auf der Startseite (Woche 12 und Woche 1 ab Zyklus 2 oben, sonst in der aufgeklappten Planliste) |
| Muskelmodell | Kniebeuge zählt für den Po 0,5 und bleibt so |
| Wdh.-Bereiche | 6–8 / 6–10 / 8–12 / 12–15, Hauptmuskel wellenförmig über die Woche |
| Übungen | **Frei wählbar je Muskelgruppe**, keine Vorgabe. Sterne = beste Wahl fürs Ziel. 200 Übungen |
| Namen | **Muskelgruppen behalten ihre Namen** (Glute Max, Glute & Quad …). Tage heißen nach Körperbereich („Tag A – Po & Beine“), darunter die Belastung („Schwere Grundübungen“) |
| Training | Übungen **in der Tagesliste aufklappen**. Ab Woche 2 Vorwoche je Satz, Steigerungshinweis, Bewertung (assistiert: Weniger/Mehr Hilfe) |
| Dauer | **Jede normale Einheit 60–90 Minuten** (Nicole, 23.10.), geprüft mit realistischer Zeitrechnung (Pausen 1:30–3 Min., Aufwärmsätze je Übung) |
| Kurz-Modus | Oben in der Tagesansicht "Zeit heute": Normal / **30–45 Min.** (Nicoles Vorgabe): **die 4 wichtigsten Übungen fürs Ziel, mit vollen Sätzen und normalen Pausen**, keine Supersätze. Prio 3 bleibt immer; passen 4 nicht in 45 Min., werden es weniger (nur 2 V-Form-Tage: 3). Ausgelassene Übungen unten, trotzdem machbar. Gilt nur für den Tag dieser Woche |
| Pausentimer | **Nur per Knopf** "Pause starten" in der aufgeklappten Übung, startet nie von selbst |
| Aufbau | **3 Reiter: Plan · Fortschritt · Einstellungen** (Nicole, 23.10.). "Heute" heißt jetzt "Plan"; der frühere Reiter "Plan" zeigte dasselbe und ist weg. Auf der Startseite klappt **"Übungen anzeigen"** unter jedem Tag Belastung, Dauer, Kurz-Modus und Übungen mit Sätzen auf, dazu die 3/4/5-Tage-Wahl für diese Woche (mit Rückfrage) und den Zyklus-Hinweis; bleibt aufgeklappt, bis man ausblendet. Wochenwahl mit Pfeilen auf der Startseite. **"Plan neu einrichten"** und Ziel nur noch in den Einstellungen: Einrichtung vorausgefüllt erneut, Verlauf bleibt |

## 2. Stand

Phase 0 und Phase 1 (MVP) sind fertig und live: https://nicolehahn2890.github.io/Gymcreator/

| Bereich | Dateien | Inhalt |
|---|---|---|
| Daten | `data/goals.json`, `templates.json`, `exercises.json` | Bereiche, Grenzen (inkl. 60–90 Min. je Einheit), Progression, Zeitmodell (Pausen, Aufwärmsätze), Kurz-Modus-Regeln; je Ziel Prioritäten, Hauptmuskelgruppe, Wochenziele, Slot-Pool; 9 Tagesvorlagen (36 Einheiten) in Trainingsreihenfolge; 200 Übungen mit Sternen und Tipps |
| Generator | `src/core/generator/` | `buildPlan` (Vorlage → Tage), `validatePlan` (alle Grenzen, Wochenziele und die Dauer je Einheit), `weeklyMuscles`, `estimateMinutes` (Dauer-Schätzung) |
| Progression | `src/core/progression/` | `weight`, `compare`, `entries`, `history` (Vorwert), `state` (Zeilen-Zustand: Übung, Sätze, Vorwert, Bewertung, Steigerungshinweis, Haken, Wochenbilanz), `rules` (Auto-Zusatzsatz, Gewichtsvorschlag), `inherit` (Vererbung, "Nur diese Woche", Übung entfernen), `cycle` (Übernahme in neuen Zyklus), `week` (Wochenart), `position` (Tagesstand, nächster Tag), `short` (Kurz-Modus, Übernahme beim Umstellen der Tage). Peach-Szenarien in `scenarios.test.ts` |
| Speicher | `src/storage/` | Dexie (IndexedDB) hinter einer Schnittstelle, Backup (Export/Import mit Prüfung), Sicherheitskopie vor Import, Migrations-Gerüst (Schema 1) |
| Oberfläche | `src/ui/` | Logo-Kopf (`components/AppHeader`), Wochenwahl (`components/WeekNav`), Kurz-Modus (Tagesansicht, Kern `core/progression/short.ts`), Onboarding (4 Schritte, auch als "Plan neu einrichten"), Startseite `Today` (Reiter "Plan", mit aufklappbarer Übungsliste und Tage-Wahl), Tagesansicht mit aufklappbaren Übungen (`DayView`, `ExerciseItem`), Fortschritt (Balken), Einstellungen (Profil, Mein Studio, Gewichtsschritte, eigene Übungen, Backup). Zustand: `state/store.ts`, `state/model.ts`, `state/ui.ts` (Position und aufgeklappte Planliste in localStorage), `state/actions.ts` (Abläufe getestet in `state/flows.test.ts`) |
| Prüfskript | `scripts/verify-plan-data.mjs` | erzeugt alle 9 Pläne, prüft Grenzen, Wochenziele, Dauer jeder Einheit und die Bibliothek, druckt alle Einheiten mit Minuten und das Wochenvolumen je Muskel |

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

Texte und Tagesnamen sind überarbeitet (kürzer, ohne Fachjargon in den Tagesnamen). Logo führt auf die Startseite. ACSM-Abgleich: jede Prio-3-Muskelgruppe mindestens 10 Sätze pro Woche.

**Neuverteilung am 23.10.** (Nicoles Rückmeldung: Kurz-Modus mit 1 Satz je Übung ist Murks, normale Einheit soll 60–90 Minuten dauern): Mit realistischer Zeitrechnung (Pausen 1:30–3 Min. nach Singer 2024 und Schoenfeld 2016, Aufwärmsätze je Übung) lagen 47 von 57 Einheiten unter 60 Minuten. Alle Vorlagen sind neu verteilt, jede Einheit liegt jetzt bei 60–70 Minuten, das prüft `validatePlan`. Folgen: Bei 4 und 5 Tagen gibt es mehr Wochenvolumen (68–70 bzw. 84–86 Sätze). Der Kurz-Modus wurde danach noch einmal neu gefasst (siehe Abschnitt 1). Neue Slots in allen drei Pools; vorhandene Slot-IDs sind unverändert. Testeinträge aus den Plänen vor dem 23.10. (Slot-IDs wie `gmax_4-8_a`) tauchen im neuen Plan nicht mehr auf; zum Testen die Website-Daten löschen.

**Zweite Prüfung am 23.10.** (Nicoles Auftrag: kompletter Bug-Test, nichts Veraltetes, 18-Sätze-Grenze und Erfahrungsstufen ehrlich prüfen):
- Die Grenze von 18 Sätzen / 7 Übungen je Einheit war geschätzt; für eine Satzgrenze je Einheit über alle Muskeln gibt es keine Studie. Ersetzt durch 60–90 Minuten plus höchstens 10 anteilige Sätze je Muskel und Einheit (Begründung und Quellen in `docs/wissenschaft.md`). Die Pläne erfüllen das unverändert.
- Erfahrungsstufen entfernt (Daten, Kern, Oberfläche, Tests). Onboarding hat 4 Schritte, die Einstellungen keine Erfahrung mehr. Gespeicherte Profile und Backups mit `level` werden weiter gelesen und bekommen den vollen Plan.
- Behoben (unabhängiger Review mit nachgestellten Abläufen):
  - Kurz-Modus überlebte einen Zielwechsel und ließ an anderen Tagen Prio-3-Übungen weg. Ein neues Ziel hebt ihn jetzt auf.
  - Umstellen der Wochenart verwarf den Kurz-Modus der ganzen Woche. Jetzt bleibt er für Tage, die gleich bleiben.
  - Trainingstage in den Einstellungen:
    - Bei angezeigter älterer Woche griffen sie rückwirkend, und spätere Wochen überschrieben sie wieder.
    - Den bisherigen Standard zu wählen, während die Woche anders lief, tat nichts.
    - Jetzt gelten sie ab der jüngsten Woche. Fallen dort Übungen mit Werten weg, gelten sie ab der nächsten Woche, mit Hinweis.
    - Eine im Plan umgestellte aktuelle Woche wird auch Standard, damit Plan, Einstellungen und Zusammenfassung übereinstimmen.
  - "Übung entfernen" behielt die Werte. Sie zählten als trainiert und landeten bei der nächsten gewählten Übung. Jetzt werden sie gelöscht (Abweichung von Peach).
  - "Satz hinzufügen" im Kurz-Modus ergab nur einen freiwilligen Satz.
  - Der Plan zeigte Halteübungen als Wiederholungen.
  - Der Pausentimer wurde jede Sekunde vorgelesen.
  - Der Logo-Knopf hieß für Screenreader anders als sein sichtbarer Text.
  - "Drei Wochen ohne Steigerung" stand fest im Text statt aus `data/goals.json`.

**Kurz-Modus, vierte Fassung (23.10.)**: Die dritte (45 Min. mit kürzeren Pausen und Wochenblick) zeigte Einheiten, bei denen eine gestrichene Übung scheinbar 15 Minuten sparte; die Ersparnis kam aus versteckt kürzeren Pausen. Nicoles Vorgabe: 4 Übungen, die anhand des Ziels Sinn ergeben, volle Sätze, Name "30–45 Min.", normale Einheit 60–90 Min. Umgesetzt mit normalen Pausen; 34 von 36 Einheiten haben 4 Übungen, 2 V-Form-Tage 3; alle 35–45 Minuten (Test).

**Design Rexy übernommen (23.10.)**, nach Freigabe der Entwürfe durch Nicole:
- Quelle: Design System „Rexy – Neobrutalism“ (claude.ai, https://claude.ai/code/artifact/b1f6a245-8459-4a08-b0c6-a193dbe59410), Entwürfe der Screens: https://claude.ai/artifact/DZu1nQ6RuNUkCM15YnZ821 (**veraltet**: zeigen Farben und Schriften vor dem Marketing-Kit; maßgeblich sind App und Design System, Nicole 23.10.). Rexy liefert nur `tokens.json`, die Werte stehen jetzt in `src/ui/theme/tokens.css` (inkl. Schriftgrößen `--fs-*`); Kategorie-Farben und Zielakzente auch in `data/goals.json`.
- Bausteine wie in Rexy: Wortmarke im klebenden Kopf, Tab-Leiste als Pillen, Wochenwahl mit runden Cyan-Pfeilen, Muskelgruppe als farbiges Badge, Stand-Pille (`.count-pill`) auf der Startseite und im Tageskopf, Satz hinzufügen/entfernen als runde +/−-Knöpfe, Stern auf goldener Scheibe, Zurück/Schließen/Abbrechen als umrandete Knöpfe ohne Schatten, Disabled = halbe Deckkraft, Fokus-Ring Ink.
- Hauptknopf auf einer Tageskarte in der Zielfarbe nimmt die Flächenfarbe (Regel in `ui.css`).
- Rex-Bilder in `src/ui/brand/rex/` (Zuordnung in `brand/rex.ts`): volle Motive 252×363 für die Zielwahl (aus dem Design System, nur verkleinert), freigestellte Rexe von Nicole als Icons in den Einstellungen (`GoalChip` im Plan-Kopf ist mit dem Reiter Plan entfallen). `webp` ist im Offline-Cache.
- Pixel-Glyphen der Ziele und `PixelGlyph.tsx` sind entfernt; `brand/pixels.ts` (Hantel) ist mit dem neuen App-Icon entfallen.
- Das Design System ist auf dem Stand der App (23.10.): Stand-Pille immer in der Tagesfarbe, `GoalChip` mit freigestelltem Rex (`rex-*-icon.webp`, Quelle `rexe-freigestellt.webp` in der Gruppe Rexe), Token `bar-current` für die aktuelle Woche. Seit Version 13: Wortmarke „Rexy“, drei Reiter, Beispiel „Plan“ mit aufklappbarer Übungsliste; `GoalChip` bleibt als Baustein, die App nutzt ihn derzeit nicht. Seit Version 14: Marketing-Kit (unten); die App ist damit wieder auf dem Stand des Design Systems.

**Rexy und drei Reiter (23.10.)**, Nicoles Wunsch: App heißt Rexy; Reiter "Heute" heißt "Plan", der doppelte Reiter "Plan" ist weg (`PlanScreen`, `Plan.css`, `GoalChip` gelöscht). Die Planliste ist auf der Startseite aufklappbar (Abschnitt 1, Aufbau). Ein gemerkter Reiter "plan" aus älteren Ständen öffnet die Startseite. Bereits installierte Home-Bildschirm-Apps behalten auf dem iPhone den alten Namen, bis man sie neu hinzufügt.

**Marketing-Kit übernommen (23.10.)**, Nicoles Wunsch: Florians Rexy-Marketing-Kit ist zuerst ins Design System gegangen (Version 14: Kit-Farben und -Schriften, Gruppen App-Icon, Posen, Reaktionen, Hintergründe, Marketing-Layouts, Kapitel Marketing, Baustein `RexMoment`), dann in die App. Das Kit selbst liegt bei Nicole lokal (`Projekt Rexy/rexy-marketing-kit`), nicht im Repo.
- Farben und Schriften: `tokens.css` mit den Kit-Werten, Tokennamen unverändert. Bowlby One SC über `@fontsource`, Inter als variable Schrift in einer Datei (nur latin) über `theme/fonts.css`; vier statische Inter-Dateien hatten die Startseite messbar langsamer gemacht. Den verringerten Buchstabenabstand der Titel gibt es nicht mehr (Bowlby wirkt sonst gequetscht); Bildschirmtitel haben 40 px Zeilenabstand, weil die Umlaut-Punkte sonst an die Zeile darüber stoßen.
- App-Icon: Quelle `src/ui/brand/rexy-app-icon-1024.png`; `scripts/make-icons.mjs` verkleinert daraus `favicon.png`, Apple-Icon, 192/512 und das maskierbare Icon (Rex auf 80 % auf der Randfarbe). Installierte Home-Bildschirm-Apps zeigen es erst nach erneutem Hinzufügen.
- `RexMoment` (`components/RexMoment.tsx`, Stil in `ui.css`): fertige Woche mit dem ganzen Rex "Kleiner Sieg" über Titel und Knopf; Woche 12 mit Rex-Kopf "Wow" am Zyklus-Hinweis (ist Woche 12 schon fertig, bleibt der Hinweis ohne Rex, einer pro Ansicht); Fortschritt ohne Werte mit "Let's go". Bilder verkleinert in `brand/rex/` (5–21 KB), Texte unverändert.
- **Training geschafft (23.10.)**, Nicoles Wunsch: Sind alle Übungen eines Tages eingetragen, steht unter der letzten Übung ein `RexMoment` mit Rex-Kopf, Titel "Training geschafft" und "x von y Übungen eingetragen" (ab Woche 2 mit "z davon gesteigert", wenn welche gesteigert sind). Der Rex wechselt der Reihe nach Puh, Happy, Love, Zwinker (`dayDoneRex` in `brand/rex.ts`: von Tag zu Tag und Woche zu Woche, derselbe Tag behält seinen Rex). Bilder aus der Gruppe Reaktionen des Design Systems, freigestellt beschnitten auf 128 px (6–7 KB). Titel neben dem Rex-Kopf in 16 px wie im Design System, damit er in eine Zeile passt.

**Tests:** 131 Vitest + 18 Playwright-Abläufe auf 390 und 430 px. Die Abläufe:
- Onboarding, freie Übungswahl, Pause nur per Knopf
- Kurz-Modus ("30–45 Min.", 4 Übungen mit allen Sätzen, normale Pause im Timer, ausgelassene Übungen unten, auch bei 60-Minuten-Einheiten)
- Speichern über Neuladen, Auf-/Zuklappen, Wochenwahl auf der Startseite, Planliste bei Bedarf aufklappen
- Vorwoche je Satz, Steigerungshinweis und Bewertung, Übungswechsel, Satz entfernen
- Trainingstage aus den Einstellungen (auch erst ab nächster Woche), Übung entfernen, Halteübung im Plan
- Logo, Umstellen in der Planliste mit Rückfrage, eigene Übung über zwei Wochen, Fortschritt, langer Name, Namen für Screenreader
- Zyklus-Hinweise ohne Deload, Plan neu einrichten aus den Einstellungen mit Abbrechen und erhaltenem Verlauf
- Backup-Import, Manifest, Installierbarkeit laut Chrome, Offline-Start, kein waagerechtes Scrollen

Lighthouse: Barrierefreiheit und Best Practices 1,0. Performance auf Nicoles PC im Median aus 5 Läufen 0,95, der Stand vor dem Marketing-Kit in derselben Messreihe 0,97 (die Werte schwanken je Lauf um bis zu 0,04; in der Sandbox früher 0,94). `node scripts/verify-plan-data.mjs` → `ALLE PRUEFUNGEN GRUEN (0 Warnungen)`.

## 3. Bewusst noch offen

- **Sicherheitskopie und Migrationen**: Die Kopie vor einem Import trägt keine Schema-Version. Sobald es eine Migration (Schema 2) gibt, muss "Wiederherstellen" sie durch `migrate` schicken.
- **Zielwechsel mitten im Zyklus**: Der Plan wird sofort neu gerechnet, Einträge bleiben (Schlüssel = Slot-ID), ein Kurz-Modus wird aufgehoben. Slots, die es im neuen Plan nicht gibt, tauchen in diesem Zyklus nicht mehr auf.
- **Lighthouse** prüft nur die Startseite (Einrichtung). Plan-Startseite und Training deckt nur der E2E-Test "Namen für Screenreader" ab.
- **Wissenschaft**: ACSM Position Stand 2026 eingearbeitet, aber nur über Abstract, Pressemitteilung und Sekundärquellen (Volltext aus der Sandbox gesperrt). Die Tabelle mit den genauen Empfehlungen bei Gelegenheit im Volltext prüfen.
- **Phase 2**: Plateau-Tausch, Form-Tracker, Feinjustierung, Englisch, Dark Mode (eigener Token-Satz), Hantelscheiben-Rechner.
- **Zeitmodell**: Die Schätzung (Satz 45 s, Pausen, Aufwärmsätze) ist eine Festlegung; im Nutzertest mit echten Trainingszeiten vergleichen.
- **Nutzertest** mit 3–5 Personen, gleichzeitig die 12 Play-Tester sammeln.
- **Pausentimer bei 360 px:** „Pause 2:30“ bricht in zwei Zeilen um, funktioniert aber.

## 4. Nächste Schritte

1. Phase 2: Plateau-Tausch oder Form-Tracker (vorher Nicole fragen, welches zuerst).
2. Nutzertest vorbereiten und die 12 Play-Tester sammeln.
3. Store-Vorbereitung (Capacitor, Datenschutzseite; das App-Icon steht seit 23.10.). Store-Grafiken aus dem Kapitel Marketing des Design Systems bauen.

## 5. Verbindliche Details

- **Bestätigt so (Nicole, 23.10.)**: Zusatzsätze erben nur von der direkten Vorwoche (Peach), auch wenn der Kurz-Modus die Übung eine Woche ausgelassen hat. Fällt ein Auto-Zusatzsatz nachträglich weg (eine frühere Woche wird korrigiert), bleibt der schon eingetragene Satz gespeichert und zählt im Vergleich der Folgewoche mit.
- **Entry-Key** `cycle:week:slotId`; Eintrag trägt `day`, `category`, `repRange`, `baseSets`, `exerciseId`, `sets[{w,r}]`, `extraSets`, optional `once`/`baseExerciseId`.
- **Flexible Woche:** gleiche Slot-ID in 3/4/5 Tagen = dieselbe Zeile; die Wochenart wird beim ersten Eintrag einer Woche gespeichert (`Week`), spätere Wochen erben sie. Ab der aktuellen Woche umgestellt (Plan oder Einstellungen), wird sie auch der Standard im Profil (`Profile.days`) für folgende Wochen und Zyklen; frühere Wochen behalten ihre Wochenart (`saveWeekDays`, `saveProfile` in `state/actions.ts`).
- **Texte:** alles in `src/i18n/de.json`, kurz, sachlich. Keine Sonderzeichen wie Grad oder Häkchen im Code (`–` für den Halbgeviertstrich; Häkchen, Pfeile, Plus/Minus und Stern als SVG in `components/`).
- **Farben nur über Tokens**; Kategorie-Farbe in `goals.json` **und** `--cat-<id>` in `tokens.css` (Test prüft).
- **Vor jedem Push:** `npm run check` muss mit Exit-Code 0 enden (nicht über `grep` prüfen). E2E in der Sandbox: `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium npm run test:e2e` nach `npm run build`.
- **Commits ohne Modellnamen** (CLAUDE.md Regel 10). Ältere Commits bis 23.10. enthalten noch eine Co-Author-Zeile mit Modellnamen; die Historie auf `main` wird nicht umgeschrieben.

## 6. Prüfen

```
npm run check                                   # Lint, Typecheck, Vitest, verify:data, Build
npm run build && PW_CHROMIUM_PATH=/opt/pw-browsers/chromium npm run test:e2e
CHROME_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome npm run lighthouse   # nach dem Build
node scripts/verify-plan-data.mjs               # nach jeder Änderung an data/
```

`github.io` ist aus der Sandbox nicht erreichbar (Proxy 403); den Deploy über die Actions-Läufe prüfen.

Auf Nicoles Windows-PC (`C:\Users\nicol\.claude\Projekt Gymcreator`): Chrome statt Sandbox-Chromium, also `PW_CHROMIUM_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe"` für E2E und `make-icons.mjs`. `npm run lighthouse` startet dort nicht (das Skript ruft `node_modules/.bin/vite` ohne `.cmd` auf); dann `npx vite preview` laufen lassen und `npx lighthouse` direkt aufrufen. Gepusht wird mit dem Privatkonto `nicolehahn2890`; die Windows-Anmeldung nimmt sonst das Firmenkonto und bekommt 403.
