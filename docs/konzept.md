# Gymcreator – Konzept & Umsetzungsplan

*Freigegeben am 22.10.2026. Lebendes Dokument: Entscheidungen in Abschnitt 7, Arbeitsstand in `UEBERGABE.md`.*

## 1. Kontext

**Ausgangslage.** Peach ist deine persönliche Trainingsapp: ein Gym (Panatta/Precor-Namen), ein Ziel, deine Intensität. Die Progressionslogik darin ist stark (Vorwert pro Übung + Wdh.-Bereich, Gewicht schlägt Reps, Auto-Zusatzsatz, flexible 3/4-Tage-Woche, Übungswechsel "nur diese Woche"). Die Oberfläche ist aber dicht: viele Kacheln, Pills, Badges, drei Schriftgrößen pro Karte. Für dich perfekt, für Einsteiger zu viel.

**Gymcreator** ist die verallgemeinerte Version für andere Menschen:
- Einstieg über ein **Körperziel** (V-Form / Sanduhr / Apfel), daraus wissenschaftlich begründete Sätze pro Muskelgruppe und Woche
- **3, 4 oder 5 Trainingstage**, mit flexibler Umrechnung pro Woche (wie in Peach)
- **breite Übungsbibliothek** ohne Gerätehersteller, Stern-Markierung der besten Übungen je Ziel, eigene Übungen
- **Progressionsmodell 1:1 aus Peach**
- **Neobrutalism-Design** aus Peach, ohne Pfirsich-Maskottchen
- Ziel: später **App Store / Google Play**, wenn es sich lohnt

**Repo:** `nicolehahn2890/Gymcreator`. Gearbeitet wird **direkt auf `main`** (Entscheidung 22.10.2026, wie bei Peach): keine Feature-Branches, keine Pull Requests. GitHub Pages deployt von `main`.

**Peach-Quellcode:** Das Trainingsapp-Repo liegt read-only unter `/home/user/Trainingsapp` (geklont 22.10.2026, Stand `4ad13af`). Gelesen: SKILL.md komplett, `index.html` (1957 Zeilen: 199 CSS, 1664 JS, 96 Funktionen), Tests-README.

**Feste Regel: Trainingsapp wird NIE angefasst.** Kein Commit, kein Push, keine Datei-Änderung, kein Kopieren von Peach-Dateien ins Gymcreator-Repo. Nur lesen, zur Orientierung. Gearbeitet wird ausschließlich in `/home/user/Gymcreator`. Der Klon lebt nur in der jeweiligen Session; für Sessions, die am Port oder an der Übungsbibliothek arbeiten, das Repo wieder anhängen.

---

## 2. Ehrliche Einschätzung (kritisch, bevor es losgeht)

1. **Der Markt ist voll.** Hevy, Strong, Fitbod, Juggernaut AI, Boostcamp, Alpha Progression (deutsch, autoreguliert). Gymcreator gewinnt nicht über "noch ein Tracker", sondern über drei Dinge, die die anderen nicht haben: (a) Einstieg über die **Körperform**, nicht über "Muskelaufbau/Abnehmen", (b) die **flexible Woche** (3/4/5 Tage pro Woche wechselbar, Verlauf bleibt), (c) deine **Peach-Progressionsregeln** mit klarer Anweisung statt Zahlenfriedhof. Deutsch zuerst, einsteigerfreundlich, kein Abo. Als Portfolio-/Hobby-Projekt sehr gut machbar. Als Business schwer. **Konsequenz:** zuerst kostenlose Web-App (PWA), echte Nutzer (Partner, Freunde, Gym-Bekannte), erst danach Store.

2. **Körperform ist nicht nur Training.** Schmale Taille ist vor allem Körperfettanteil und Ernährung. Eine V-Form sieht man ohne Definition nicht. Die App darf das nicht versprechen. **Konsequenz:** ein kurzer, ehrlicher Block im Onboarding "Was Training kann – und was nicht" (Training formt, Ernährung zeigt es). Kein Ernährungs-Tracking in der App (riesiger Scope, machen andere besser).

3. **Keine Geschlechter-Labels.** "V-Form = Männer" schreckt Frauen ab, die genau das wollen, und umgekehrt. Die drei Ziele werden als Silhouetten + Formbeschreibung angeboten, jede Person wählt frei.

4. **Peach-Architektur nicht kopieren.** Peachs Workout-Keys sind positionsbasiert (`cycle__w__d__e`). Genau das hat wiederholt Daten verschoben (migAdduktoren, repairSlots, migBBSets, migGXRange, Partnerzeilen-Tabellen `t:[...]`). Mit 9+ Plänen und einem Generator ist das nicht beherrschbar. **Konsequenz:** stabile Slot-IDs, jeder Eintrag trägt Muskelgruppe, Wdh.-Bereich und Satzzahl selbst. Plan-Änderungen können Historie dann strukturell nicht mehr beschädigen (Abschnitt 4.3).

5. **App Store von Windows aus.** iOS-Builds brauchen macOS, aber nur der Build selbst: Codemagic baut Capacitor-Apps kostenlos (500 macOS-Minuten/Monat, ein iOS-Build ≈ 10–15 min), erzeugt die Signatur-Zertifikate selbst und lädt direkt zu TestFlight hoch. Kosten: Apple Developer 99 USD/Jahr, Google Play 25 USD einmalig. Google verlangt für neue Privatkonten (seit Nov. 2023) einen geschlossenen Test mit **mindestens 12 Testern über 14 Tage** vor der Veröffentlichung – Tester früh einsammeln. Eine reine PWA nimmt Apple nicht in den Store (Regel 4.2), Google nur als TWA-Wrapper. Details in 4.6.

6. **localStorage reicht nicht.** Deine Peach-Erfahrung (iOS: jeder Öffnungsweg hat eigenen Speicher) gilt auch hier. **Konsequenz:** Speicher-Schicht mit Interface ab Tag 1 (IndexedDB in der PWA, SQLite/Filesystem im Capacitor-Wrapper), Backup-Export/-Import bleibt Pflichtfunktion.

7. **Übungsbilder.** Store-Nutzer erwarten Bilder oder Videos. Im MVP: Text-Cues wie in Peach plus ein kleines Piktogramm je Bewegungsmuster. Später: lizenzfreie Illustrationen (z. B. free-exercise-db, Public Domain) oder eigene Linien-Icons über Florian.

8. **Umfang.** Das ist ein Mehrmonatsprojekt in Sessions, kein Wochenende. Der Plan ist deshalb in Phasen geschnitten, jede Phase für sich nutzbar.

9. **Build-Schritt.** Peach ist eine Datei, die du im GitHub-Browser editieren kannst. Gymcreator braucht Module und Tests, also einen Build. GitHub Actions baut und deployt automatisch nach jedem Push – du brauchst lokal weiterhin kein Node. Der Preis: die Stift-im-Browser-Bearbeitung einer einzelnen HTML-Datei fällt weg.

---

## 3. Produktkonzept

### 3.1 Die drei Ziel-Archetypen

| Ziel | Silhouette | Priorität hoch | mittel | niedrig / Erhalt | Taille |
|---|---|---|---|---|---|
| **V-Form** | breite Schultern, breiter Lat, schmale Hüfte | Lat (vertikal + horizontal), seitliche Schulter, Brust, Arme | Bauch, Quads, Hams | Po, Glute Med, Adduktoren | keine schweren Seitbeugen |
| **Sanduhr** | trainierte Schultern, schmale Taille, runder Po, feste Beine | Glute Max + Med, seitliche Schulter | Lat, Hams, Quads, Bauch | Brust, Arme (indirekt) | keine schweren Obliques |
| **Apfel** (dein Peach-Ziel) | schlanker trainierter Oberkörper, schmale Taille, großer Po, schlanke definierte Beine | Glute Max (sehr hoch), Glute Med, Hüftbeuge (Hams), Adduktoren | Rücken, Schultern, Bauch | Brust, Arme (indirekt), Quads po-betont | Bauch als Abschluss, leicht |

**Innovation dahinter:** Ein Archetyp ist intern nur ein **Prioritäts-Profil** (jeder Muskel 0–3). Daraus rechnet der Generator die Sätze. Das macht zwei Dinge möglich, die drei starre Pläne nicht können:
- **Feinjustierung** nach der Wahl über 3–4 Schieber ("mehr Schultern", "weniger Beine", "Arme dazu") → Plan wird neu gerechnet (Phase 2, Datenmodell ab Tag 1 so angelegt).
- **Mischziele** ohne vierten Archetyp (z. B. Sanduhr mit mehr Lat).

### 3.2 Wissenschaftliche Grundlage (Regeln des Generators)

> **Neu am 23.10.2026** (Nicoles Rückmeldung: Volumen zu hoch, zu viele gleichartige Übungen, Übungen vorgegeben). Das Volumen-Modell ist neu aufgebaut, die Übungen wählt jede Person selbst. Die vollständige Begründung mit Tabellen und Quellen steht in `docs/wissenschaft.md`; die Zahlen nur in `data/goals.json` und `data/templates.json`.

Kurzfassung:

- **Wochenziele je Muskel** (`targets`, anteilig gezählt: direkt 1, Mitarbeit 0,5) je Ziel und Stufe. Fortgeschritten: Hauptmuskel 11–17 (Po bei Apfel und Sanduhr, Rücken bei V-Form), weitere Zielmuskeln 6–14, Nebenmuskeln 2–7, unerwünschte 0. Einsteiger etwa 55–65 % davon.
- **Grenzen je Einheit:** Fortgeschritten 3–7 Übungen und max. 18 Sätze, Einsteiger 3–6 Übungen und max. 12 Sätze; max. 10 anteilige Sätze je Muskel; **Hauptmuskelgruppe max. 2 Zeilen pro Tag, alle anderen 1** (Nicoles Entscheidung).
- **Mehr Tage = kürzere Einheiten**, nicht mehr Volumen: Fortgeschritten 48–51 Sätze bei 3 Tagen, 55–57 bei 4 und 5 Tagen. Einsteiger 24–32.
- **Wdh.-Bereiche** 6–8 (schwere Grundübung), 6–10 (weitere Grundübungen), 8–12 (Maschine, Kabel, Isolation), 12–15 (kleine Muskeln, Pump). 4–8 entfällt. Der Hauptmuskel bekommt **wellenförmig** verschiedene Bereiche an verschiedenen Tagen (z. B. Po 6–8 / 8–12 / 12–15).
- **Einsteiger:** 2 Sätze je Zeile, 6–8 und 6–10 werden 8–12, Zeilen mit `beginner: false` entfallen.
- Unverändert: Intensität 0–3 Wdh. in Reserve, Stretch-Bias bei den Sternen, Po/Glute-Med-Regeln, doppelte Progression, Auto-Zusatzsatz, kein Deload als Standard, 12-Wochen-Zyklus.

Die Apfel-Pläne sind nicht mehr Nicoles Peach-Plan P3/P4 (der Regressionstest dazu ist entfernt).

### 3.3 Splits je Tagesanzahl

Je Ziel und Tagesanzahl eine Vorlage in `data/templates.json`. Die Vorlage legt fest, welche Zeilen (Slots) an welchem Tag liegen, **in Trainingsreihenfolge** (schwere Grundübung zuerst, Isolation danach, Bauch zuletzt) und mit welchen Sätzen; der Generator sortiert nicht mehr um.

| Tage | V-Form | Sanduhr | Apfel |
|---|---|---|---|
| 3 | A Drücken & Beine · B Ziehen & Schultern · C Oberkörper & Beinrückseite | A Po & Beine schwer · B Oberkörper & Po · C Po & Beinrückseite | A Po Kraft · B Po & Beinrückseite · C Po-Volumen & Oberkörper |
| 4 | A Ziehen · B Beine & Schultern · C Drücken & Rücken · D Oberkörper-Volumen | A Po & Beine schwer · B Rücken & Schultern · C Po & Beinrückseite · D Po-Pump & Oberkörper | A Po Kraft · B Oberkörper & Po · C Po & Beinrückseite · D Po-Volumen & Beine |
| 5 | Ziehen · Drücken · Beine & Bauch · Rücken & Schultern · Oberkörper-Volumen | Po schwer · Oberkörper · Beine & Po · Schultern & Rücken · Po-Pump & Schultern | Po Kraft · Oberkörper · Po & Beinrückseite · Beine & Po · Po-Pump & Rücken |

### 3.4 Flexible Woche (Verallgemeinerung der Peach-Partnerzeilen)

In Peach sind 3- und 4-Tage-Plan zwei getrennte Tabellen, verbunden über handgepflegte Partnerzeilen `t:[Tag,Zeile]` (Regel 14: fehleranfällig). In Gymcreator:
- Jeder Archetyp hat **einen Slot-Pool** (z. B. `gmax_6-8_a`, `gmax_8-12_b`, `back_6-10_a`, …). Ein Slot = Kategorie + Wdh.-Bereich + Basis-Sätze, optional ein Hinweis (`focus`, z. B. "Ziehen von oben").
- Die 3-/4-/5-Tage-Vorlagen sind nur **Verteilungen desselben Pools** auf Tage. Slots, die in beiden Vorlagen liegen, teilen automatisch Übung, Zusatzsätze und Verlauf. Slots, die es in der kleineren Vorlage nicht gibt, pausieren in der Woche.
- Wochen-Art pro Woche (`weekType: 3|4|5`), Vorauswahl = Vorwoche, Umstellen einer Woche mit Werten → Rückfrage (wie Peach).
- Vorwert-Suche läuft über **Übung + Wdh.-Bereich** (Peach `exKey`), eigener Slot zuerst, laufende Woche zählt nie (Peach-Regel 07.10.).

**Zusätzlich (neu, Phase 2):**
- **Kurz-Modus** "Heute nur 45 Minuten": die App streicht die Slots mit der niedrigsten Priorität des Tages, der Rest bleibt vergleichbar. Einsteiger-Alltag, kein anderer Tracker macht das sauber.
- **2-Tage-Notfallwoche**: zwei Ganzkörper-Einheiten nur mit Prio-3/2-Slots (Urlaub, Krankheit). Erhält den Zyklus statt ihn zu brechen.

### 3.5 Übungsbibliothek

- **Umfang v1:** ~150–180 Übungen, deutsch + englisch benannt, keine Herstellernamen. Peachs 142 Übungen sind die Basis, bereinigt (Panatta/Precor-Varianten → eine generische Übung) und ergänzt um Bizeps/Trizeps-Breite, Waden, Körpergewicht/Band-Varianten.
- **Felder je Übung:** `id`, `name {de,en}`, `category` (Peach-Kategorien + Waden; Rücken intern in vertikal/horizontal getaggt), `secondary[]`, `equipment` (Langhantel, Kurzhantel, Kabel, Maschine, Multipresse, Körpergewicht, Band), `pattern` (Hüftbeuge, Kniebeuge, horizontal/vertikal Ziehen/Drücken, Abduktion, …), `stars: {vform, sanduhr, peach}` (0–1, der Stern), `stretch: true/false` (gedehnte Position), `unilateral`, `assisted` (Gegengewicht → Logik dreht, Peach `ASSIST`), `tip {de,en}` (Format "Einstellung: … / Ausführung: …", aber geräteneutral: "Drehachse auf Kniehöhe" statt "Hebel 4 bei Panatta"), `why {de,en}` (ein Satz: warum diese Übung für dieses Ziel).
- **Mein Gym (Equipment-Profil):** Checkliste beim Onboarding (Kabelzug? Multipresse? Hip-Thrust-Maschine? nur Kurzhanteln?). In der Übungsauswahl stehen Übungen mit vorhandener Ausstattung oben, die übrigen darunter (23.10.2026: frei wählbar, nichts ausgeblendet). **Gym-Wechsel-Modus** (Phase 2): zweites Profil "Hotel-Gym", die App tauscht die Übungen der Woche automatisch auf verfügbares Equipment.
- **Eigene Übungen:** Name + Kategorie + Equipment + optional Notiz. Laufen in Progression, Vorwert und Übersicht wie jede andere Übung. Werden im Backup mitgesichert. Kein Stern, kein Tipp (außer eigener Notiz).
- **Pro Übung Notiz + Einstellung** (Peach `tip__ex__`, `set__ex__`) bleiben, übungsbasiert über alle Pläne.

### 3.6 Progressionsmodell (aus Peach, plus Einsteiger-Hilfen)

Übernommen 1:1 (als reine Funktionen mit Tests portiert):
- Vorwert = letzter Wert dieser Übung im **gleichen Wdh.-Bereich** aus einer **früheren Woche**, eigener Slot zuerst; Herkunft sichtbar ("zuletzt: Z2 W5 · Tag A")
- **Gewicht schlägt Reps**; Reps als Durchschnitt je ausgefülltem Satz; Gewichtsspannen "40-45" und Komma "27,5" (`parseWeight`, `cmpWeight` über beide Grenzen); assistierte Übungen umgekehrt
- Steigerungsregel: Obergrenze im 1. Satz → "▲ Gewicht steigern"; verschwindet live bei mehr Gewicht oder fertiger Übung
- Auto-Zusatzsatz nach 3 stagnierenden Wochenvergleichen (max. 5 Sätze), +/- manuell; Vererbung von Übung (über Lücken) und Zusatzsätzen (nur direkte Vorwoche)
- Übungswechsel ab Woche 2: "nur diese Woche" / "ab jetzt im Zyklus"
- Woche 1 = kein Vergleich; Woche 12 normal; kein Deload-Zwang
- Status-Farben: grün gesteigert / blau mehr Reps / gelb gleich / rot weniger

Neu für eine breite Zielgruppe:
- **Konkreter Vorschlag statt nur Badge:** "Letztes Mal 40 kg × 10/10/9 → heute 42,5 kg". Schrittweite je Equipment (Kurzhantel 2 kg, Langhantel 2,5 kg, Maschine "eine Stufe", Kabel 2,5 kg) – im Profil änderbar.
- **Plateau-Tausch:** Wenn nach dem Auto-Zusatzsatz weitere 3 Wochen stagnieren → Vorschlag, die Übung gegen die nächstbeste Stern-Übung der Kategorie zu tauschen. Nur Vorschlag, nie automatisch.
- **Pausentimer** mit Vorgabe je Bereich (6–8: 150 s, 6–10: 120 s, 8–12: 90 s, 12–15: 75 s), Vibration, läuft im Hintergrund weiter (Zeitstempel, nicht Intervall).
- **Hantelscheiben-Rechner** (klein, beliebt, 30 Zeilen Code).

### 3.7 Oberfläche für Einsteiger (das ist der eigentliche Unterschied zu Peach)

Peach zeigt alles gleichzeitig. Gymcreator zeigt **eine Sache pro Screen** und legt Details darunter.

| Screen | Inhalt | Peach-Unterschied |
|---|---|---|
| **Onboarding** (5 Schritte, je ein Screen) | Ziel per Silhouette → Erfahrung (Einsteiger/Fortgeschritten) → Tage pro Woche → Mein Gym → "Dein Plan ist fertig" mit Wochenübersicht | gibt es in Peach nicht |
| **Heute** (Startscreen) | Nächster Trainingstag als eine große Karte: Tagesname, Fokus, Dauer-Schätzung, "Training starten". Darunter: Woche x/12, Tage erledigt, ein Satz Wochen-Bilanz ("bei 6 von 18 Übungen gesteigert") | ersetzt Header-Pills + Accordion-Kacheln |
| **Training** (Tagesansicht zum Aufklappen, 23.10.2026) | Alle Übungen des Tages untereinander; Kopfzeile mit Muskelgruppe, gewählter Übung (Stern), Sätze × Bereich, Bewertung (Mehr Gewicht / Mehr Wiederholungen / Gleich / Weniger, assistiert: Weniger/Mehr Hilfe) und Haken. Antippen klappt die Übung **in der Liste** auf: Steigerungshinweis mit Vorschlag ("Gewicht steigern: heute 42,5 kg"), Sätze als Zeilen (kg · Wdh. · **Vorwoche je Satz** · Haken), Satz dazu/weniger, Übung tauschen, Ausführung und Einstellung/Notiz eingeklappt, "Nächste Übung". Beim Öffnen eines Tages ist die erste offene Übung aufgeklappt. Pausentimer unten fest | Peach: alle Übungen eines Tages mit allen Feldern aufgeklappt |
| **Plan** | Wochenansicht (3/4/5-Tage-Wahl für diese Woche), Tage mit Übungen, Zyklus/Woche-Auswahl (Raster wie Peach), Zyklus-Ende-Banner | wie Peach, aber ruhiger |
| **Fortschritt** | Pro Übung Verlauf (Kapsel-Balken wie Peach), Wochen-Bilanz, Form-Tracker (Phase 2) | Peach-Übersicht + neu |
| **Einstellungen** | Profil, Ziel/Feinjustierung, Mein Gym, Schrittweiten, Deload opt-in, Sprache, Backup, Version | Peach: nur Backup unten in der Übersicht |

Regeln für Übersichtlichkeit:
- **Bottom-Tab-Bar** mit 4 Tabs (Heute · Plan · Fortschritt · Einstellungen) statt Header-Pills.
- **Eine Akzentfarbe pro Screen** (Tagesfarbe im Training, Zielfarbe sonst). Muskelgruppe als kleine Zeile mit Farbpunkt über dem Übungsnamen.
- **Max. zwei Schriftgrößen pro Karte**, Body 16 px, Display nur für Zahlen und Titel.
- **Status als Text + Farbe**, nie nur Farbe (a11y).
- **Progressive Disclosure:** Vorwert-Herkunft, Tipp, Notiz, Einstellung sind eingeklappt; Badge klein, erklärender Text nur in der aufgeklappten Übung.
- Peach-Dichte bleibt als **Option** denkbar ("Kompakt-Ansicht" im Training, Phase 2) – nicht im MVP.

### 3.8 Design-System

Übernommen aus Peach: Neobrutalism, nur hell, alle Tokens in einem `:root`, Ink `#181016`, Rahmen 2,5 px, harte Schatten ohne Blur, Pills, Fonts Archivo Black (Display, Uppercase) + Space Grotesk (Body 400–700), Fokus-Ring, Disabled-Stil, Press-Interaktion, 16-px-Inputs, Tagesfarben A Peach / B Pink / C Lime / D Sky (+ E Yellow für 5 Tage), Kategorie-Farben CC, Fortschrittsfarben.

Angepasst:
- **Kein Pfirsich.** Marke: Pixel-Art-Wortmarke "GC" oder eine Pixel-Hantel im Cream-Kreis mit Ink-Rahmen (gleiche Bauweise wie das Peach-Icon). Die drei Ziele bekommen je ein abstraktes Pixel-Glyph (V, Sanduhr, Apfel) für Onboarding und Profil.
- **Zielfarbe als Akzent:** V-Form Sky `#8CCBE8`, Sanduhr Lilac `#B49DF2`, Apfel Pink `#F18FB6` (Feld `accent` in `data/goals.json`, leicht änderbar).
- **Hintergrund:** neutrale Cream-Basis `#FBF3E7` statt Lavendel für alle (Lavendel bleibt Sanduhr-Akzent). Entschieden, Abschnitt 7.
- **Dark Mode:** nicht im MVP (wie Peach). Weil alle Farben Tokens sind, bleibt er als späterer Token-Satz möglich – Store-Nutzer fragen danach.

### 3.9 Weitere Funktionen – priorisiert

**MVP (Phase 1):** Onboarding, Generator (3 Ziele × 3/4/5 Tage, 2 Erfahrungsstufen), geführtes Training, Progression komplett, flexible Woche, Zyklen unbegrenzt, Übersicht/Verlauf, eigene Übungen, Mein Gym (einfach), Pausentimer, Backup Export/Import, PWA installierbar + offline.

**Phase 2 (Einsteiger-Polish + Differenzierung):**
- **Form-Tracker:** Umfänge (Schulter, Brust, Taille, Hüfte, Po, Oberschenkel, Arm) monatlich eintragen; die App zeigt die **Kennzahl des gewählten Ziels** (V-Form: Schulter/Taille, Sanduhr: Hüfte/Taille, Apfel: Po/Taille) als Verlauf. Passt exakt zur Positionierung, 1 Screen.
- Kurz-Modus, 2-Tage-Notfallwoche, Feinjustierungs-Schieber, Plateau-Tausch, Gym-Wechsel-Modus
- Übungs-Piktogramme/Illustrationen, "Warum diese Übung?"-Satz
- Englisch komplett, Hantelscheiben-Rechner, Körpergewicht-Log, Plan als PDF/Bild teilen
- Dark Mode

**Später (nur wenn Store läuft):** Cloud-Backup/Account (DSGVO-Aufwand!), Apple Health/Google Fit, Trainer-Modus (Plan an jemanden schicken), Spanisch, Watch/Widgets.

**Bewusst nicht:** Ernährungs-Tracking, Social Feed, Streak-Druck/Schuld-Mechaniken, KI-Chat-Coach (API-Kosten, Datenschutz, Haftung), Supersätze als Standard.

---

## 4. Technische Architektur

### 4.1 Stack (entschieden, Abschnitt 7)

- **React 19 + Vite 8 + TypeScript 6** (strict), PWA über `vite-plugin-pwa` 2 (Service Worker, Manifest, Offline). TypeScript 7 wird von typescript-eslint noch nicht unterstützt (Stand 22.10.2026), deshalb 6.0. Schriften selbst gehostet über `@fontsource` (offline, kein Google-Abruf)
- State: leichtgewichtig (Zustand), keine schwere Bibliothek
- Speicher: **Dexie (IndexedDB)** hinter einem `Storage`-Interface; localStorage nur für UI-Position (wie `peach_ui`)
- Tests: **Vitest** (Generator + Progression), **Playwright** (Flows, iPhone 390/430 px, wie Peach `tests/`)
- CI/CD: **GitHub Actions** → Lint, Tests, Build → Deploy auf GitHub Pages. Du brauchst lokal nichts.
- Später: **Capacitor** (iOS + Android), Cloud-Build für iOS, Speicher über `@capacitor-community/sqlite` oder Filesystem hinter demselben Interface

Warum nicht eine HTML-Datei wie Peach: 9 Pläne + Generator + Bibliothek + Tests in einer 10.000-Zeilen-Datei sind nicht wartbar, und TypeScript fängt genau die Klasse von Fehlern, die Peach Mühe gemacht hat (undefined-Keys, Datenformen). Warum nicht React Native/Expo: kein HTML/CSS, Peach-Design und -Logik nicht übertragbar, anderer Lernpfad für dich.

### 4.2 Repo-Struktur

```
Gymcreator/
  docs/            konzept.md, wissenschaft.md (Quellen), design-system.md, entscheidungen.md
  data/            exercises.json, goals.json (Prioritäten + Volumen), templates.json (Splits)
  src/
    core/          REINE LOGIK, keine UI, 100 % getestet
      generator/   targets.ts, slots.ts, distribute.ts, validate.ts
      progression/ weight.ts (parseWeight, cmpWeight), compare.ts (prog), history.ts (findLast), rules.ts (incDue, autoExtraSets), stats.ts
      model/       types.ts, keys.ts, migrations.ts
    storage/       interface.ts, dexie.ts, backup.ts  (später capacitor.ts)
    ui/            screens/ (Onboarding, Today, Workout, Plan, Progress, Settings), components/, theme/tokens.css
    i18n/          de.json, en.json
  tests/           e2e Playwright
  .github/workflows/ ci.yml (Test + Build + Pages)
```

### 4.3 Datenmodell (Kern, TypeScript-Interfaces)

```ts
Profile   { goal:'vform'|'sanduhr'|'apfel', level:'beginner'|'advanced', days:3|4|5,
            priorities: Record<Category,0|1|2|3>, equipment: Equipment[], increments: {...},
            deload:boolean, lang:'de'|'en' }
Slot      { id:'gmax_4-8_a', category, repRange:'4-8', baseSets:3, priority:1..3, order }
Template  { days:3|4|5, dayPlan: { name, focus, color, slotIds:string[] }[] }
Plan      { version:1, goal, slots:Slot[], templates:Template[] }        // vom Generator erzeugt
Week      { cycle:number, week:1..12, days:3|4|5 }                       // Wochen-Art (Peach wt__)
Entry     { cycle, week, slotId, day, exerciseId, sets:{w:string,r:number|null}[],   // day = Tag in dieser Woche (nur Kontext)
            extraSets:number, category, repRange, baseSets,               // Kontext IM Eintrag (Peach r0/s0 immer)
            once?:boolean, baseExerciseId?:string }                       // "nur diese Woche" (Peach base)
ExerciseNote    { exerciseId, note, setting }                             // Peach tip__ex__ / set__ex__
CustomExercise  { id:'custom_…', name, category, equipment, note }
BodyMetrics     { date, waist, hips, glutes, shoulders, chest, thigh, arm, weight }  // Phase 2
```

Grundsätze (Lehren aus Peach-Regel 11, 13, 14, 15):
- **Keys sind nie Positionen.** Entry-Key = `cycle:week:slotId`. Eine neue Zeile im Plan verschiebt nichts.
- **Kontext steht im Eintrag.** Ändert sich später der Wdh.-Bereich eines Slots, bekommt er eine **neue Slot-ID**; alte Einträge behalten ihren Bereich. Keine `migGXRange`-Migrationen mehr.
- **Plan-Version im Profil**, alte Zyklen zeigen den Plan, mit dem sie trainiert wurden (Peach `pv__`, aber als Feld, nicht als Marker-Key).
- **Schema-Version + Migrations-Liste** im Storage von Tag 1, jede Migration mit Test und Sicherheitskopie (Peach `peach_v4_pre_*`).
- **Backup-Format** `{app:'gymcreator', schema:1, date, profile, plan, entries, notes, custom, metrics}`. Import validiert, fragt vor Überschreiben.

### 4.4 Generator (deterministisch, reine Funktionen)

```
targets(goal, level, days)      → Sätze je Kategorie (Tabelle 3.2 × Faktoren)
slotPool(targets)               → Slots mit Bereich-Mix je Kategorie (Prio 3: 4-8 + 6-10 + 8-12; Prio 1: nur 8-12)
distribute(slotPool, template)  → Tage mit Slots in Reihenfolge (Prio zuerst, Grund vor Isolation, Bauch zuletzt)
validate(plan)                  → Fehlerliste: >10 anteilige Sätze je Muskel/Einheit, >20 Sätze/Einheit,
                                  Prio-Muskel <2×/Woche, gleiche Übung 2× am Tag, Abweichung vom Ziel >1 Satz
```

Tests: für alle 3 × 3 × 2 Kombinationen `validate` leer, Summen innerhalb ±2 Sätze der Tabelle, Determinismus (gleiche Eingabe → gleicher Plan), (Der Peach-P4-Regressionstest ist seit 23.10.2026 entfernt; stattdessen Wochenziele je Muskel.)

### 4.5 Progressions-Engine (Port aus Peach, Quelle `/home/user/Trainingsapp/index.html`)

Befund aus dem Code: Die Logik ist sauber, hängt aber überall an Globals (`S`, `S.data`, `S.week`, `S.cy`, `plan()`, `mk()`, `slotEntry()`) und am positionsbasierten Key-Schema. Der Port übernimmt **denselben Algorithmus**, bekommt aber einen expliziten Kontext `{entries, plan, cycle, week, slotId}` und arbeitet auf Slot-IDs – nur so ist der Kern ohne Browser testbar und frei von Partnerzeilen-Sonderfällen (`twinOf`, `canon`, `TWIN4`, `flexCy` entfallen, weil gleiche Slot-ID = gleiche Zeile).

| Peach-Funktion (Zeile) | Gymcreator `src/core/progression/` | Änderung beim Port |
|---|---|---|
| `parseWeight` (1200), `weightBounds` (1212), `cmpWeight` (1224) | `weight.ts` ✅ | 1:1, inklusive assistierter Richtung (`inv`) |
| `prog` (1234), `rcol` (1196) | `compare.ts` ✅ (`progressStatus`, `repZone`) | 1:1: Gewicht zuerst, Reps als Durchschnitt; `isAssist` kommt aus dem Übungsdatensatz (`assisted: true`) statt aus dem Set `ASSIST` |
| `exOrd` (1339), `exKey` (1351), `exIndex` (1352), `findLastExData` (1394) | `entries.ts` + `history.ts` ✅ | Index über `exerciseId + repRange` aus den Einträgen (Bereich steht im Eintrag, kein `repRange(plan)`-Lookup, kein `r0`). Regeln bleiben: gleicher Bereich im aktuellen Zyklus → sonst gleicher Bereich im zuletzt trainierten Zyklus davor → sonst Orientierung; eigener Slot zuerst; laufende Woche zählt nie |
| `exState` (1513), `exDone` (1446), `weekStats` (1462) | `state.ts` ✅ (`rowState`, `weekStats`) | eine Zustandsquelle für Badge, Vorschlag, Haken, Wochenbilanz (wie Peach); `s0`/`r0` entfallen, weil `baseSets`/`repRange` immer im Eintrag stehen |
| `incCand`/`incDue` (1557/1565) | `state.ts` ✅ (`increaseDue`), `rules.ts` ✅ (`suggestWeight`) | 1:1 (Obergrenze im 1. Satz, nur Vorwert aus dieser/Vorwoche desselben Zyklus, weg bei mehr Gewicht oder fertig). Neu dazu: `suggestWeight()` mit Schrittweite je Equipment |
| `autoExtraSets` (1314) | `rules.ts` ✅ | 1:1 (3 stagnierende Wochenvergleiche, gleiche Übung, max. 5 Sätze) |
| `inhEx` (1188), `exBase` (1091), `selEx`-Abfrage (1846) | `inherit.ts` ✅ | Vererbung über Lücken, "nur diese Woche" über `baseExerciseId` |
| `carryMap` (1107) | `cycle.ts` ✅ | Übernahme in den neuen Zyklus nach Kategorie, gleicher Bereich zuerst, keine Dopplung pro Tag; ohne `RETIRED`/`ALIAS`-Sonderfälle |
| `weekPt`/`syncPt`/`setPlan` (1059–1071) | `week.ts` ✅ | Wochen-Art als Feld `Week.days`, Vorauswahl = Vorwoche |
| `repairSlots`, `mig*`, `markLegacy`, `V2_REORDER` | **entfällt** | gab es nur wegen positionsbasierter Keys |

**Gewicht pro Satz** (entschieden 23.10.2026): Für den Vergleich werden die Satzgewichte als Spanne gelesen (kleinstes–größtes = Peachs Gewichtsrahmen "40-45"), dadurch gelten `cmpWeight`/`prog` unverändert. Zahlen der Progression (Zykluslänge, Vergleich ab Woche, stagnierende Vergleiche, Auto-Zusatzsatz) stehen in `data/goals.json` → `progression`, Schrittweiten je Ausstattung in `data/exercises.json` → `increments`.

Tests (✅ `src/core/progression/scenarios.test.ts`): Peachs Browser-Tests `vorwert-vorwoche`, `vorwert-zyklusstart`, `verlauf-woche1-2`, `verlauf-planwechsel`, `steigerung`, `uebungswechsel`, `flex-woche` und `randfaelle` werden als **Vitest-Unit-Tests auf dem Kern** nachgebaut (gleiche Szenarien, gleiche erwarteten Vorwerte/Badges), plus die Funktionsfälle für `cmpWeight`/`prog`/`parseWeight` aus der Skill-Doku (Spannen, Komma, assistiert, leeres Feld).

**Datenport (nur Inhalte, keine Dateien kopieren):** `EXERCISES` (Z. 292), `TIPS` (Z. 307–448), `REC` (Z. 691), `ASSIST` (Z. 697), `CC` (Z. 449), `P4`/`P3` (Z. 468–553) → `data/exercises.json` (Hersteller-Varianten zu je einer generischen Übung zusammengeführt, Tipps geräteneutral umformuliert, Sterne je Ziel neu vergeben) und `data/goals.json` (Peach-Spalte = dein P4/P3 als Regressionsziel).

### 4.6 Weg in die Stores (Phase 3, Stand Recherche 22.10.2026)

**Empfohlener Weg: Capacitor 8 + Codemagic (iOS) + Android Studio lokal oder dieselbe CI (Android).**

| Option | Kosten | Mac nötig | Aufwand | Anmerkung |
|---|---|---|---|---|
| Capacitor + Codemagic | 0 € CI (500 macOS-min/Monat) + 99 USD Apple + 25 USD Google | nein | niedrig–mittel | Capacitor-Vorlage, Signatur automatisch über App-Store-Connect-API-Key, TestFlight-Upload eingebaut |
| Capacitor + GitHub Actions | öffentliches Repo kostenlos, privat ~200 macOS-min/Monat, dann 0,062 USD/min | nein | mittel–hoch | fastlane/xcodebuild-YAML selbst schreiben, Zertifikate als Secrets |
| Expo EAS (React Native) | 15 iOS-Builds/Monat frei | nein | hoch | kompletter Neubau ohne HTML/CSS |
| Nur TWA (Android) | 25 USD | nein | minimal | kein iOS; 12-Tester-Regel gilt trotzdem |

Fakten, die den Plan beeinflussen:
- Capacitor 8 (Dez. 2025): iOS 15+, Android minSdk 24, Target-SDK 36 – Google verlangt Target 36 ab 31.08.2026 für neue Apps, Capacitor 8 erfüllt das. Ionic Appflow wird eingestellt (keine Neukunden seit Feb. 2025).
- **Apple 4.2 (Mindestfunktionalität):** Besteht, wenn die App ein *Werkzeug* ist, komplett offline läuft (Reviewer testen Flugmodus), native Plugins nutzt (Haptik, lokale Benachrichtigung für den Pausentimer, Teilen/Export, Splash, Safe Areas) und **nie** auf die Web-Version verlinkt. Vorlagen-Apps (4.2.6) sind die zweite Falle – unser Design ist eigen genug.
- TestFlight: 100 interne, 10.000 externe Tester (erster externer Build braucht Beta-Review), Builds laufen nach 90 Tagen ab.
- **Google Play, privates Konto:** 25 USD, Ausweis-Prüfung, dann geschlossener Test mit ≥ 12 Testern über 14 Tage am Stück, erst danach Produktion. Tester (Partner, Freunde, Gym) früh sammeln – das ist die größte praktische Hürde.
- **Speicher:** Für die Home-Screen-PWA gilt Safaris 7-Tage-Löschregel nicht. Im Capacitor-WebView nennt Capacitor localStorage/IndexedDB aber "transient" (iOS räumt bei wenig Speicher auf) → dort `@capacitor-community/sqlite` für die Historie, `@capacitor/preferences` für Kleinkram, `@capacitor/filesystem` für Backups. Deshalb das Storage-Interface ab Tag 1.
- **Store-Pflichten auch ohne Server:** öffentliche Datenschutz-URL bei beiden (GitHub-Pages-Seite, kein PDF), Apple-Label "Keine Daten erhoben", Google Data-Safety-Formular + Health-Apps-Erklärung ("Activity and fitness"), kurzer Gesundheits-Disclaimer ("vor dem Training ärztlich abklären"), keine medizinischen oder Genauigkeits-Versprechen, Impressum (DE). Konto-Löschpflicht greift nur, wenn es Konten gibt – gibt es nicht.
- Kein Store nimmt eine PWA direkt. Apple braucht ein natives Binary.

---

## 5. Phasenplan

**Phase 0 – Fundament (1–2 Sessions)**
1. `docs/konzept.md` (dieses Konzept), `docs/wissenschaft.md` (Quellen + Volumen-Tabelle), `docs/entscheidungen.md`
2. `data/exercises.json` v1 (Peach-Liste bereinigt + Sterne je Ziel + Equipment + Stretch-Flag), `data/goals.json`, `data/templates.json`
3. Projekt-Setup (Vite, TS, Vitest, Playwright, ESLint), CI-Workflow, Pages-Deploy mit Platzhalter-Seite, Design-Tokens aus Peach als `tokens.css` (Quelle: `:root` in `index.html` Z. 18–51, `--bg` auf Cream, Zielakzente neu)

**Phase 1 – MVP Web (mehrere Sessions, jede für sich testbar)**
1. ✅ Core: Datenmodell, Storage (Dexie) + Backup, Migrations-Gerüst
2. ✅ Core: Generator + Tests (23.10.: Wochenziele je Muskel statt P4/P3-Regression; Standard-Übung je Slot wieder entfernt, freie Wahl)
3. ✅ Core: Progressions-Engine portiert + Peach-Testfälle grün
4. ✅ UI: Onboarding → Plan-Ansicht
5. ✅ UI: Heute + Training (23.10.: aufklappbare Übungen in der Tagesansicht statt Fokusansicht, Vorwoche je Satz, Timer, Badge, Vorschlag)
6. ✅ UI: flexible Woche, Zyklen, Übungswechsel-Abfrage, eigene Übungen, Mein Gym
7. ✅ UI: Fortschritt/Verlauf, Einstellungen, Backup (Deload opt-in offen, Regel nicht festgelegt)
8. 🟡 PWA-Feinschliff (Icon ✅, Manifest ✅, Installationshinweis ✅, Playwright-Flows ✅, Offline-Start ✅; offen: Lighthouse, Nutzertest) (Icon, Manifest `display: standalone` – anders als Peach, weil der Speicher hier in der App lebt und das Backup Pflicht ist; dazu ein Hinweis beim ersten Start "Installiere die App auf dem Home-Screen", damit die Daten von Anfang an in einem Container liegen), Playwright-Flows, Nutzertest mit 3–5 Personen (die werden später auch die 12 Play-Tester)

**Phase 2 – Polish + Differenzierung** (Form-Tracker, Kurz-Modus, Feinjustierung, Plateau-Tausch, Illustrationen, EN, Dark Mode)

**Phase 3 – Store** (Capacitor, Icons/Splash, Datenschutzseite, TestFlight + Play Closed Test, Release)

---

## 6. Verifikation

- **Unit (Vitest):** Generator (alle 18 Kombinationen valide, Summen ±2, deterministisch, Peach-Regression), Progression (Peach-Fälle 1:1: Spannen, Komma, assistiert, Gewicht schlägt Reps, Durchschnitts-Reps, Vorwert eigener Slot zuerst, laufende Woche nie, Woche 1 kein Vergleich, Auto-Zusatzsatz frühestens Woche 5), Storage-Migrationen (Vorher/Nachher-Daten, Idempotenz), Backup-Rundreise.
- **E2E (Playwright, 390 + 430 px):** Onboarding → Plan steht; Training eintragen → Badge/Vorschlag live; Woche 3 ↔ 4 ↔ 5 Tage umstellen → Übungen/Verlauf bleiben; eigene Übung anlegen und trainieren; Backup Export/Import; Offline-Start.
- **CI:** alles grün vor Deploy; Lighthouse-PWA-Check.
- **Manuell:** auf deinem iPhone installieren, einen echten Trainingstag mit dem Peach-Plan parallel eintragen und Vorwerte/Badges vergleichen.

---

## 7. Entscheidungen (22.10.2026, von dir bestätigt)

1. **Stack:** React + Vite + TypeScript als PWA, später Capacitor + Codemagic
2. **Plan-Erzeugung:** Generator aus Volumen-Zielen (Tabelle 3.2 als einzige Wissensquelle)
3. **Design-Basis:** neutrale Cream-Basis `#FBF3E7` + Zielfarbe als Akzent (Sky / Lilac / Pink)
4. **MVP-Umfang:** Kern – Onboarding, Plan, geführtes Training, Progression, flexible Woche, eigene Übungen, Backup

## 7a. Noch offen (blockiert nichts in Phase 0)

5. ~~Peach-Quellcode~~ erledigt: liegt read-only in der Session (Abschnitt 1). In späteren Sessions, die am Port arbeiten (Phase 1, Schritt 2–3), das Trainingsapp-Repo wieder anhängen.
6. ~~Branch~~ entschieden: **alles direkt auf `main`** (22.10.2026), wie bei Peach.

## 7b. Phase 0 – Stand und Reihenfolge (Details in `UEBERGABE.md`)

1. ✅ Projekt-Gerüst: Vite + React + TypeScript, ESLint, Vitest, Playwright, `vite-plugin-pwa`, GitHub-Actions-Workflow (Test → Build → Pages)
2. ✅ `src/ui/theme/tokens.css` mit allen Peach-Tokens (Cream-Basis, Zielakzente, Tagesfarben A–E, Kategorie- und Fortschrittsfarben, Schatten, Radien, Fonts)
3. ✅ `docs/konzept.md` (dieses Dokument), `docs/wissenschaft.md` (Tabelle 3.2 mit 26 Quellen), `docs/store-weg.md`; Entscheidungen stehen in Abschnitt 7 (keine eigene Datei)
4. ✅ `data/goals.json` (Prioritäten + Slot-Pools), `data/templates.json` (Splits 3.3), `scripts/verify-plan-data.mjs` (grün, Peach 4/3 = P4/P3) · ✅ `data/exercises.json` v1 (180 Übungen, Peach-Liste bereinigt, Sterne je Ziel, Equipment, Stretch-Flag, geräteneutrale Tipps)
5. ✅ `src/core/model/types.ts` (Datenmodell 4.3) + `src/core/generator/` mit Tests, inklusive Regressionstest: `apfel`, 4 Tage, Fortgeschritten ⇒ exakt dein Peach-P4 (Kategorien, Bereiche, Sätze, Reihenfolge je Tag)
6. ✅ Platzhalter-Startseite live auf Pages, damit der Deploy-Weg von Anfang an steht

## 8. Annahmen, solange nichts anderes gesagt ist

- Sprache: Deutsch zuerst, Texte von Tag 1 in i18n-Dateien, Englisch in Phase 2
- Kein Account, keine Cloud, keine Datenerhebung (DSGVO-minimal), Backup lokal
- 12-Wochen-Zyklen, kein Deload-Standard, Woche 1 ohne Vergleich – wie Peach
- Peach bleibt unverändert deine private App; Gymcreator ist ein eigenes Produkt mit eigenem Speicher
- Design-Kür (Glyphen, Icon) kann Florian später veredeln; im MVP mache ich Pixel-Art-Platzhalter in der Peach-Bauweise
