# Gymcreator – Konzept & Umsetzungsplan

*Freigegeben am 22.10.2026, zuletzt angepasst am 23.10.2026. Lebendes Dokument: Entscheidungen in Abschnitt 7, Arbeitsstand in `UEBERGABE.md`, Trainingswissen in `docs/wissenschaft.md`.*

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

**Peach-Quellcode:** Das Trainingsapp-Repo liegt, wenn angehängt, read-only unter `/home/user/Trainingsapp` (Stand beim Port: `4ad13af`).

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

**Umsetzung:** Ein Archetyp besteht aus Wochenzielen je Muskel (`targets`), einer Hauptmuskelgruppe und Prioritäten (0–3) in `data/goals.json` sowie den Tagesvorlagen in `data/templates.json`. Das Prüfskript stellt sicher, dass jeder Plan die Ziele trifft. Damit bleiben zwei Erweiterungen möglich:
- **Feinjustierung** über 3–4 Schieber ("mehr Schultern", "weniger Beine", "Arme dazu"), Phase 2.
- **Mischziele** ohne vierten Archetyp (z. B. Sanduhr mit mehr Lat).

### 3.2 Wissenschaftliche Grundlage (Regeln des Generators)

> **Neu am 23.10.2026** (Nicoles Rückmeldung: Volumen zu hoch, zu viele gleichartige Übungen, Übungen vorgegeben). Das Volumen-Modell ist neu aufgebaut, die Übungen wählt jede Person selbst. Die vollständige Begründung mit Tabellen und Quellen steht in `docs/wissenschaft.md`; die Zahlen nur in `data/goals.json` und `data/templates.json`.

Kurzfassung:

- **Wochenziele je Muskel** (`targets`, anteilig gezählt: direkt 1, Mitarbeit 0,5) je Ziel und Stufe. Fortgeschritten: Hauptmuskel 11–17 (Po bei Apfel und Sanduhr, Rücken bei V-Form), weitere Zielmuskeln 4–14, Nebenmuskeln 2–7, unerwünschte 0. Einsteiger etwa 55–65 % davon. Welche Zahlen belegt sind und welche Festlegung, steht je Regel in `docs/wissenschaft.md` (Quellen am 23.10.2026 online geprüft).
- **Grenzen je Einheit:** Fortgeschritten 3–7 Übungen und max. 18 Sätze, Einsteiger 3–6 Übungen und max. 12 Sätze; max. 10 anteilige Sätze je Muskel; **Hauptmuskelgruppe max. 2 Zeilen pro Tag, alle anderen 1** (Nicoles Entscheidung).
- **Mehr Tage = kürzere Einheiten**, nicht mehr Volumen: Fortgeschritten 48–51 Sätze bei 3 Tagen, 55–57 bei 4 und 5 Tagen. Einsteiger 24–34.
- **Wdh.-Bereiche** 6–8 (schwere Grundübung), 6–10 (weitere Grundübungen), 8–12 (Maschine, Kabel, Isolation), 12–15 (kleine Muskeln, Pump). 4–8 entfällt. Der Hauptmuskel bekommt **wellenförmig** verschiedene Bereiche an verschiedenen Tagen (z. B. Po 6–8 / 8–12 / 12–15).
- **Einsteiger:** nur 3 oder 4 Tage pro Woche, 2 Sätze je Zeile, 6–8 und 6–10 werden 8–12, Zeilen mit `beginner: false` entfallen.
- Unverändert: Intensität 0–3 Wdh. in Reserve, Stretch-Bias bei den Sternen, Po/Glute-Med-Regeln, doppelte Progression, Auto-Zusatzsatz, 12-Wochen-Zyklus. Kein Deload: Der nächste Zyklus beginnt mit 5–10 % weniger Gewicht, erklärt im Plan und auf "Heute".

Die Apfel-Pläne sind nicht mehr Nicoles Peach-Plan P3/P4 (der Regressionstest dazu ist entfernt).

### 3.3 Splits je Tagesanzahl

Je Ziel und Tagesanzahl eine Vorlage in `data/templates.json`. Die Vorlage legt fest, welche Zeilen (Slots) an welchem Tag liegen, **in Trainingsreihenfolge** (schwere Grundübung zuerst, Isolation danach, Bauch zuletzt) und mit welchen Sätzen; der Generator sortiert nicht mehr um.

| Tage | V-Form | Sanduhr | Apfel |
|---|---|---|---|
| 3 | Drücken & Beine · Ziehen · Ganzkörper | Po & Beine · Oberkörper & Po · Po & Beinrückseite | Po & Beine · Po & Beinrückseite · Po & Oberkörper |
| 4 | Ziehen · Beine · Drücken · Oberkörper | Po & Beine · Oberkörper · Po & Beinrückseite · Po & Oberkörper | Po & Beine · Oberkörper & Po · Po & Beinrückseite · Po & Hüfte |
| 5 | Ziehen · Drücken · Beine · Rücken & Schultern · Oberkörper | Po & Beinrückseite · Oberkörper · Po & Beine · Schultern & Rücken · Po & Hüfte | Po & Beine · Oberkörper · Po & Beinrückseite · Po & Hüfte · Po & Rücken |

**Tagesnamen** (23.10.2026): Der Name sagt den Körperbereich, die Zeile darunter die Belastung ("Schwere Grundübungen", "Mittlere Gewichte", "Leichtere Gewichte, mehr Wiederholungen", bei gemischten Tagen z. B. "Rücken schwer, Po leicht"). Die Muskelgruppen in den Zeilen behalten ihre Namen (Glute Max, Glute & Quad usw., Nicoles Entscheidung).

### 3.4 Flexible Woche (Verallgemeinerung der Peach-Partnerzeilen)

In Peach sind 3- und 4-Tage-Plan zwei getrennte Tabellen, verbunden über handgepflegte Partnerzeilen `t:[Tag,Zeile]` (Regel 14: fehleranfällig). In Gymcreator:
- Jeder Archetyp hat **einen Slot-Pool** (z. B. `gmax_6-8_a`, `gmax_8-12_b`, `back_6-10_a`, …). Ein Slot = Kategorie + Wdh.-Bereich + Basis-Sätze, optional ein Hinweis (`focus`, z. B. "Ziehen von oben").
- Die 3-/4-/5-Tage-Vorlagen sind nur **Verteilungen desselben Pools** auf Tage. Slots, die in beiden Vorlagen liegen, teilen automatisch Übung, Zusatzsätze und Verlauf. Slots, die es in der kleineren Vorlage nicht gibt, pausieren in der Woche.
- Wochenart pro Woche (`Week.days`), Vorauswahl = Vorwoche, Umstellen einer Woche, in der dadurch Zeilen mit Werten wegfallen → Rückfrage (wie Peach).
- Vorwert-Suche läuft über **Übung + Wdh.-Bereich** (Peach `exKey`), eigener Slot zuerst, laufende Woche zählt nie (Peach-Regel 07.10.).

**Zusätzlich (neu, Phase 2):**
- **Kurz-Modus** "Heute nur 45 Minuten": die App streicht die Slots mit der niedrigsten Priorität des Tages, der Rest bleibt vergleichbar. Einsteiger-Alltag, kein anderer Tracker macht das sauber.
- **2-Tage-Notfallwoche**: zwei Ganzkörper-Einheiten nur mit Prio-3/2-Slots (Urlaub, Krankheit). Erhält den Zyklus statt ihn zu brechen.

### 3.5 Übungsbibliothek

- **Umfang:** 200 Übungen (jede Muskelgruppe mindestens 7), deutsch + englisch benannt, keine Herstellernamen. Peachs Übungsliste ist die Basis, bereinigt (Hersteller-Varianten → eine generische Übung) und ergänzt um Bizeps/Trizeps, Waden, Körpergewicht- und Band-Varianten.
- **Freie Wahl** (23.10.2026): Jede Planzeile ist eine Muskelgruppe; die Person wählt die Übung selbst aus allen Übungen dieser Gruppe. Sterne markieren die besten fürs Ziel, Übungen mit vorhandener Ausstattung stehen oben.
- **Felder je Übung:** siehe `data/README.md` (u. a. `stars` je Ziel, `heavy`, `stretch`, `assisted` für Gegengewicht, `timed` für Halteübungen, geräteneutraler Tipp "Einstellung: … / Ausführung: …"). Ein "Warum diese Übung?"-Satz ist Phase 2.
- **Mein Studio (Ausstattung):** Checkliste beim Onboarding (Kabelzug? Multipresse? Hip-Thrust-Maschine? nur Kurzhanteln?). In der Übungsauswahl stehen Übungen mit vorhandener Ausstattung oben, die übrigen darunter (23.10.2026: frei wählbar, nichts ausgeblendet). **Gym-Wechsel-Modus** (Phase 2): zweites Profil "Hotel-Gym", die App tauscht die Übungen der Woche automatisch auf verfügbares Equipment.
- **Eigene Übungen:** Name + Kategorie + Equipment + optional Notiz. Laufen in Progression, Vorwert und Übersicht wie jede andere Übung. Werden im Backup mitgesichert. Kein Stern, kein Tipp (außer eigener Notiz).
- **Pro Übung Notiz + Einstellung** (Peach `tip__ex__`, `set__ex__`) bleiben, übungsbasiert über alle Pläne.

### 3.6 Progressionsmodell (aus Peach, plus Einsteiger-Hilfen)

Übernommen 1:1 (als reine Funktionen mit Tests portiert):
- Vorwert = letzter Wert dieser Übung im **gleichen Wdh.-Bereich** aus einer **früheren Woche**, eigener Slot zuerst; je Satz in der Spalte "Vorwoche", stammt er nicht aus der direkten Vorwoche, heißt die Spalte "Zuletzt" und die Herkunft steht darüber ("Aus Zyklus 2, Woche 5, Tag A")
- **Gewicht schlägt Reps**; Reps als Durchschnitt je ausgefülltem Satz; Gewichtsspannen "40-45" und Komma "27,5" (`parseWeight`, `cmpWeight` über beide Grenzen); assistierte Übungen umgekehrt
- Steigerungsregel: Obergrenze im 1. Satz → "Gewicht steigern: heute 42,5 kg" (assistiert: "Hilfe senken"); verschwindet live bei mehr Gewicht oder fertiger Übung
- Auto-Zusatzsatz nach 3 stagnierenden Wochenvergleichen (max. 5 Sätze), +/- manuell; Vererbung von Übung (über Lücken) und Zusatzsätzen (nur direkte Vorwoche)
- Übungswechsel ab Woche 2: "Nur diese Woche" / "Ab jetzt"
- Woche 1 = kein Vergleich; Woche 12 normal; kein Deload, stattdessen startet der nächste Zyklus 5–10 % leichter (Hinweis im Plan und auf "Heute")
- Bewertung als Text und Farbe: "Mehr Gewicht" / "Mehr Wiederholungen" / "Gleich" / "Weniger"; assistiert "Weniger Hilfe" / "Mehr Hilfe", Halteübungen "Länger gehalten"

Neu für eine breite Zielgruppe:
- **Konkreter Vorschlag statt nur Badge:** "Gewicht steigern: heute 42,5 kg", daneben die Vorwoche je Satz. Schrittweite je Ausstattung (Kurzhantel 2 kg, Langhantel 2,5 kg, Maschine "eine Stufe", Kabel 2,5 kg), in den Einstellungen änderbar.
- **Plateau-Tausch:** Wenn nach dem Auto-Zusatzsatz weitere 3 Wochen stagnieren → Vorschlag, die Übung gegen die nächstbeste Stern-Übung der Kategorie zu tauschen. Nur Vorschlag, nie automatisch.
- **Pausentimer nur auf Wunsch** (Knopf "Pause starten" in der aufgeklappten Übung, startet nie von selbst), Dauer je Bereich (6–8: 150 s, 6–10: 120 s, 8–12: 90 s, 12–15: 75 s), Vibration, läuft im Hintergrund weiter (Zeitstempel, nicht Intervall).
- **Hantelscheiben-Rechner** (klein, beliebt), Phase 2.

### 3.7 Oberfläche für Einsteiger (das ist der eigentliche Unterschied zu Peach)

Peach zeigt alles gleichzeitig. Gymcreator zeigt pro Screen eine Hauptsache; im Training sind alle Übungen des Tages in einer Liste, aufgeklappt wird jeweils eine.

| Screen | Inhalt | Peach-Unterschied |
|---|---|---|
| **Onboarding** (5 Schritte, je ein Screen) | Ziel per Pixel-Glyph → Erfahrung (Einsteiger/Fortgeschritten) → Tage pro Woche → Mein Studio → "Dein Wochenplan" mit Muskelgruppen je Tag | gibt es in Peach nicht |
| **Heute** (Startscreen) | Wochenwahl mit Pfeilen wie im Plan ("Zyklus 1 · Woche 1 von 12", Antippen öffnet das Wochenraster). Nächster Trainingstag als eine große Karte: Tagesname, Belastung, Dauer-Schätzung, "Training starten". Darunter: Tage erledigt, Wochen-Bilanz ("6 von 18 Übungen gesteigert") | ersetzt Header-Pills + Accordion-Kacheln |
| **Training** (Tagesansicht zum Aufklappen, 23.10.2026) | Alle Übungen des Tages untereinander; Kopfzeile mit Muskelgruppe, gewählter Übung (Stern), Sätze × Bereich, Bewertung (Mehr Gewicht / Mehr Wiederholungen / Gleich / Weniger, assistiert: Weniger/Mehr Hilfe) und Haken. Antippen klappt die Übung **in der Liste** auf: Steigerungshinweis mit Vorschlag ("Gewicht steigern: heute 42,5 kg"), Sätze als Zeilen (kg · Wdh. · **Vorwoche je Satz** · Haken), Satz hinzufügen/entfernen, Übung tauschen, Ausführung und Einstellung/Notiz eingeklappt, "Nächste Übung". Beim Öffnen eines Tages ist die erste offene Übung aufgeklappt. Pausentimer nur per Knopf, dann unten fest | Peach: alle Übungen eines Tages mit allen Feldern aufgeklappt |
| **Plan** | Oben "Dein Plan: Ziel · Stufe · Tage" mit "Plan neu einrichten" (Einrichtung erneut, vorausgefüllt, Verlauf bleibt). Wochenwahl wie auf Heute, Hinweis zum Zyklus, 3/4/5-Tage-Wahl für diese Woche, Tage mit Übungen | wie Peach, aber ruhiger |
| **Fortschritt** | Pro Übung Verlauf (Kapsel-Balken wie Peach), Wochen-Bilanz, Form-Tracker (Phase 2) | Peach-Übersicht + neu |
| **Einstellungen** | Profil (Ziel, Erfahrung, Trainingstage) mit "Plan neu einrichten", Mein Studio, Gewichtsschritte, eigene Übungen, Backup, Version. Später: Feinjustierung, Sprache | Peach: nur Backup unten in der Übersicht |

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

**MVP (Phase 1):** Onboarding, Generator (3 Ziele, Fortgeschrittene 3/4/5 Tage, Einsteiger 3/4 Tage), Training mit aufklappbaren Übungen, Progression komplett, flexible Woche, Zyklen unbegrenzt, Übersicht/Verlauf, eigene Übungen, Mein Studio (einfach), Pausentimer, Backup Export/Import, PWA installierbar + offline.

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
- State: eigener kleiner Store über `useSyncExternalStore` (`src/ui/state/store.ts`), keine State-Bibliothek
- Speicher: **Dexie (IndexedDB)** hinter einem `Storage`-Interface; localStorage nur für UI-Position (wie `peach_ui`)
- Tests: **Vitest** (Generator + Progression), **Playwright** (Flows, iPhone 390/430 px, wie Peach `tests/`)
- CI/CD: **GitHub Actions** → Lint, Tests, Build → Deploy auf GitHub Pages. Du brauchst lokal nichts.
- Später: **Capacitor** (iOS + Android), Cloud-Build für iOS, Speicher über `@capacitor-community/sqlite` oder Filesystem hinter demselben Interface

Warum nicht eine HTML-Datei wie Peach: 9 Pläne + Generator + Bibliothek + Tests in einer 10.000-Zeilen-Datei sind nicht wartbar, und TypeScript fängt genau die Klasse von Fehlern, die Peach Mühe gemacht hat (undefined-Keys, Datenformen). Warum nicht React Native/Expo: kein HTML/CSS, Peach-Design und -Logik nicht übertragbar, anderer Lernpfad für dich.

### 4.2 Repo-Struktur

```
Gymcreator/
  docs/            konzept.md, wissenschaft.md (Begründung + Quellen), store-weg.md
  data/            goals.json (Bereiche, Grenzen, Stufen, Wochenziele, Slot-Pools), templates.json (Tagesvorlagen),
                   exercises.json (200 Übungen), README.md
  scripts/         verify-plan-data.mjs (prüft alle 15 Pläne + Bibliothek), make-icons.mjs
  src/
    core/          reine Logik ohne UI, mit Vitest-Tests
      generator/   buildPlan.ts, validate.ts (Grenzen, Wochenziele, weeklyMuscles)
      progression/ weight, compare, entries, history, state, rules, inherit, cycle, week, position
      model/       types.ts, data.ts, exerciseCheck.ts
    storage/       interface.ts, dexie.ts, backup.ts, migrations.ts  (später capacitor.ts)
    ui/            App.tsx, screens/ (Onboarding, Today, DayView + ExerciseItem, PlanScreen, Progress, Settings),
                   components/, state/ (store, model, ui, actions), theme/ (tokens.css, base.css, ui.css), brand/
    i18n/          de.json, index.ts  (en.json in Phase 2)
  tests/e2e/       Playwright
  .github/workflows/ ci.yml (Lint, Typecheck, Vitest, Datenprüfung, Build, E2E, Pages)
```

### 4.3 Datenmodell (Kern, TypeScript-Interfaces)

```ts
// vollständig in src/core/model/types.ts
Profile   { goal:'vform'|'sanduhr'|'apfel', level:'beginner'|'advanced', days:3|4|5,
            equipment: string[], increments: Record<string, number|null>, lang:'de'|'en', createdAt }
SlotDef   { id:'gmax_6-8_a', cat, range:'6-8', sets:3, focus? }             // Pool in data/goals.json
PlanRow   { slotId, category, repRange, sets, priority, focus? }          // vom Generator erzeugt
Plan      { version:1, goal, level, days, dayPlans:{ index, letter, name, focus, rows }[], paused }
Week      { cycle:number, week:1..12, days:3|4|5 }                       // Wochenart (Peach wt__)
Entry     { cycle, week, slotId, day, exerciseId, sets:{w:string,r:number|null}[],   // day = Tag in dieser Woche (nur Kontext)
            extraSets:number, category, repRange, baseSets,               // Kontext IM Eintrag (Peach r0/s0 immer)
            once?:boolean, baseExerciseId?:string }                       // "nur diese Woche" (Peach base)
ExerciseNote    { exerciseId, note, setting }                             // Peach tip__ex__ / set__ex__
CustomExercise  { id:'custom_…', name, category, equipment, note }
BodyMetrics     { date, waist, hips, glutes, shoulders, chest, thigh, arm, weight }  // Phase 2, noch nicht angelegt
```

Grundsätze (Lehren aus Peach-Regel 11, 13, 14, 15):
- **Keys sind nie Positionen.** Entry-Key = `cycle:week:slotId`. Eine neue Zeile im Plan verschiebt nichts.
- **Kontext steht im Eintrag.** Ändert sich später der Wdh.-Bereich eines Slots, bekommt er eine **neue Slot-ID**; alte Einträge behalten ihren Bereich. Keine `migGXRange`-Migrationen mehr.
- **Plan-Version** (`Plan.version`): Der Plan wird aus Profil und Daten neu erzeugt. Weil jeder Eintrag Kategorie, Bereich und Sätze selbst trägt, bleibt die Historie auch nach Plan-Änderungen lesbar.
- **Schema-Version + Migrations-Liste** im Storage von Tag 1, jede Migration mit Test und Sicherheitskopie (Peach `peach_v4_pre_*`).
- **Backup-Format** `{app:'gymcreator', schema:1, date, profile, entries, weeks, notes, custom}`. Import validiert, fragt vor dem Überschreiben und sichert den alten Stand.

### 4.4 Generator (deterministisch, reine Funktionen)

```
buildPlan(data, {goal, level, days})  → Tage mit Zeilen in Vorlagen-Reihenfolge; Einsteiger: 2 Sätze,
                                         6-8/6-10 → 8-12, Zeilen mit beginner:false entfallen
validatePlan(data, plan)              → Fehlerliste: Übungen/Sätze je Einheit (Stufe), Zeilen je Kategorie
                                         und Tag (Hauptmuskelgruppe 2, sonst 1), >10 anteilige Sätze je Muskel
                                         und Einheit, Wochenziel je Muskel verfehlt, Prio 3 <2×/Woche, Prio 0 im Plan
weeklyMuscles(data, plan)             → anteilige Sätze je Muskel und Woche
```

Tests: alle 15 erlaubten Kombinationen ohne Fehler, Wochensätze wie in `docs/wissenschaft.md`, Hauptmuskel mit mindestens 3 Bereichen, Einsteiger-Regeln, Determinismus. Dasselbe prüft `scripts/verify-plan-data.mjs` in CI.

### 4.5 Progressions-Engine (Port aus Peach, Quelle `/home/user/Trainingsapp/index.html`)

Befund aus dem Code: Die Logik ist sauber, hängt aber überall an Globals (`S`, `S.data`, `S.week`, `S.cy`, `plan()`, `mk()`, `slotEntry()`) und am positionsbasierten Key-Schema. Der Port übernimmt **denselben Algorithmus**, bekommt aber einen expliziten Kontext `{entries, plan, cycle, week, slotId}` und arbeitet auf Slot-IDs – nur so ist der Kern ohne Browser testbar und frei von Partnerzeilen-Sonderfällen (`twinOf`, `canon`, `TWIN4`, `flexCy` entfallen, weil gleiche Slot-ID = gleiche Zeile).

| Peach-Funktion (Zeile) | Gymcreator `src/core/progression/` | Änderung beim Port |
|---|---|---|
| `parseWeight` (1200), `weightBounds` (1212), `cmpWeight` (1224) | `weight.ts` ✅ | 1:1, inklusive assistierter Richtung (`inv`); einzige Abweichung: bei Gegengewicht zählt 0 kg Hilfe als Bestwert statt als leer (23.10.2026, von Nicole bestätigt) |
| `prog` (1234), `rcol` (1196) | `compare.ts` ✅ (`progressStatus`, `repZone`) | 1:1: Gewicht zuerst, Reps als Durchschnitt; `isAssist` kommt aus dem Übungsdatensatz (`assisted: true`) statt aus dem Set `ASSIST` |
| `exOrd` (1339), `exKey` (1351), `exIndex` (1352), `findLastExData` (1394) | `entries.ts` + `history.ts` ✅ | Index über `exerciseId + repRange` aus den Einträgen (Bereich steht im Eintrag, kein `repRange(plan)`-Lookup, kein `r0`). Regeln bleiben: gleicher Bereich im aktuellen Zyklus → sonst gleicher Bereich im zuletzt trainierten Zyklus davor → sonst Orientierung; eigener Slot zuerst; laufende Woche zählt nie. Abweichung (23.10.2026, von Nicole bestätigt): Einträge mit Wiederholungen gehen vor, weil Gewichte hier in die Folgesätze wandern und eine Woche mit nur Gewicht sonst den Vorwert verdeckt |
| `exState` (1513), `exDone` (1446), `weekStats` (1462) | `state.ts` ✅ (`rowState`, `weekStats`) | eine Zustandsquelle für Badge, Vorschlag, Haken, Wochenbilanz (wie Peach); `s0`/`r0` entfallen, weil `baseSets`/`repRange` immer im Eintrag stehen |
| `incCand`/`incDue` (1557/1565) | `state.ts` ✅ (`increaseDue`), `rules.ts` ✅ (`suggestWeight`) | 1:1 (Obergrenze im 1. Satz, nur Vorwert aus dieser/Vorwoche desselben Zyklus, weg bei mehr Gewicht oder fertig). Neu dazu: `suggestWeight()` mit Schrittweite je Equipment |
| `autoExtraSets` (1314) | `rules.ts` ✅ | 1:1 (3 stagnierende Wochenvergleiche, gleiche Übung, max. 5 Sätze) |
| `inhEx` (1188), `exBase` (1091), `selEx`-Abfrage (1846) | `inherit.ts` ✅ | Vererbung über Lücken, "nur diese Woche" über `baseExerciseId` |
| `carryMap` (1107) | `cycle.ts` ✅ | Übernahme in den neuen Zyklus nach Kategorie, gleicher Bereich zuerst, keine Dopplung pro Tag; ohne `RETIRED`/`ALIAS`-Sonderfälle |
| `weekPt`/`syncPt`/`setPlan` (1059–1071) | `week.ts` ✅ | Wochen-Art als Feld `Week.days`, Vorauswahl = Vorwoche |
| `repairSlots`, `mig*`, `markLegacy`, `V2_REORDER` | **entfällt** | gab es nur wegen positionsbasierter Keys |

**Gewicht pro Satz** (entschieden 23.10.2026): Für den Vergleich werden die Satzgewichte als Spanne gelesen (kleinstes–größtes = Peachs Gewichtsrahmen "40-45"), dadurch gelten `cmpWeight`/`prog` unverändert. Zahlen der Progression (Zykluslänge, Vergleich ab Woche, stagnierende Vergleiche, Auto-Zusatzsatz) stehen in `data/goals.json` → `progression`, Schrittweiten je Ausstattung in `data/exercises.json` → `increments`.

Tests (✅ `src/core/progression/scenarios.test.ts`): Peachs Browser-Tests `vorwert-vorwoche`, `vorwert-zyklusstart`, `verlauf-woche1-2`, `verlauf-planwechsel`, `steigerung`, `uebungswechsel`, `flex-woche` und `randfaelle` werden als **Vitest-Unit-Tests auf dem Kern** nachgebaut (gleiche Szenarien, gleiche erwarteten Vorwerte/Badges), plus die Funktionsfälle für `cmpWeight`/`prog`/`parseWeight` aus der Skill-Doku (Spannen, Komma, assistiert, leeres Feld).

**Datenport (nur Inhalte, keine Dateien kopieren):** `EXERCISES` (Z. 292), `TIPS` (Z. 307–448), `REC` (Z. 691), `ASSIST` (Z. 697), `CC` (Z. 449), `P4`/`P3` (Z. 468–553) → `data/exercises.json` (Hersteller-Varianten zu je einer generischen Übung zusammengeführt, Tipps geräteneutral umformuliert, Sterne je Ziel neu vergeben). P4/P3 dienten anfangs als Vorlage für Apfel; seit 23.10.2026 gilt das eigene Volumen-Modell.

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
1. `docs/konzept.md` (dieses Konzept), `docs/wissenschaft.md` (Quellen + Volumen-Tabelle), `docs/store-weg.md`
2. `data/exercises.json` v1 (Peach-Liste bereinigt + Sterne je Ziel + Equipment + Stretch-Flag), `data/goals.json`, `data/templates.json`
3. Projekt-Setup (Vite, TS, Vitest, Playwright, ESLint), CI-Workflow, Pages-Deploy mit Platzhalter-Seite, Design-Tokens aus Peach als `tokens.css` (Quelle: `:root` in `index.html` Z. 18–51, `--bg` auf Cream, Zielakzente neu)

**Phase 1 – MVP Web (mehrere Sessions, jede für sich testbar)**
1. ✅ Core: Datenmodell, Storage (Dexie) + Backup, Migrations-Gerüst
2. ✅ Core: Generator + Tests (23.10.: Wochenziele je Muskel statt P4/P3-Regression; Standard-Übung je Slot wieder entfernt, freie Wahl)
3. ✅ Core: Progressions-Engine portiert + Peach-Testfälle grün
4. ✅ UI: Onboarding → Plan-Ansicht
5. ✅ UI: Heute + Training (23.10.: aufklappbare Übungen in der Tagesansicht statt Fokusansicht, Vorwoche je Satz, Timer, Badge, Vorschlag)
6. ✅ UI: flexible Woche, Zyklen, Übungswechsel-Abfrage, eigene Übungen, Mein Gym
7. ✅ UI: Fortschritt/Verlauf, Einstellungen, Backup
8. 🟡 PWA-Feinschliff: Icon ✅, Manifest `display: standalone` ✅ (anders als Peach, weil der Speicher in der App lebt), Installationshinweis ✅, Playwright-Flows ✅, Offline-Start ✅. Offen: Lighthouse-Check in CI, Nutzertest mit 3–5 Personen (später auch die 12 Play-Tester)

**Phase 2 – Polish + Differenzierung** (Form-Tracker, Kurz-Modus, Feinjustierung, Plateau-Tausch, Illustrationen, EN, Dark Mode)

**Phase 3 – Store** (Capacitor, Icons/Splash, Datenschutzseite, TestFlight + Play Closed Test, Release)

---

## 6. Verifikation

- **Unit (Vitest):** Generator (alle 15 erlaubten Kombinationen valide, Wochenziele je Muskel, deterministisch), Progression (Peach-Fälle 1:1: Spannen, Komma, assistiert, Gewicht schlägt Reps, Durchschnitts-Reps, Vorwert eigener Slot zuerst, laufende Woche nie, Woche 1 kein Vergleich, Auto-Zusatzsatz frühestens Woche 5), Storage-Migrationen (Vorher/Nachher-Daten, Idempotenz), Backup-Rundreise.
- **E2E (Playwright, 390 + 430 px):** Onboarding → Wochenplan; Übung wählen, eintragen, Neuladen; Woche 2 mit Vorwoche je Satz, Steigerungshinweis und Bewertung; Übungswechsel "Nur diese Woche"; Satz entfernen; Trainingstage aus den Einstellungen; Backup-Import; Manifest; Offline-Start. Offen: Umstellen im Plan mit Rückfrage und eigene Übung als E2E.
- **CI:** alles grün vor Deploy. Offen: Lighthouse-PWA-Check.
- **Manuell:** auf dem iPhone installieren, einen echten Trainingstag eintragen und Vorwerte, Hinweis und Bewertung mit Peach vergleichen (Logik ist gleich, Pläne sind verschieden).

---

## 7. Entscheidungen (von dir bestätigt)

1. **Stack:** React + Vite + TypeScript als PWA, später Capacitor + Codemagic (22.10.2026)
2. **Plan-Erzeugung:** Generator aus `data/` (Wochenziele je Muskel + Tagesvorlagen) als einzige Wissensquelle (22.10., Volumen-Modell neu am 23.10.2026)
3. **Design-Basis:** neutrale Cream-Basis `#FBF3E7` + Zielfarbe als Akzent (Sky / Lilac / Pink) (22.10.)
4. **MVP-Umfang:** Onboarding, Plan, Training, Progression, flexible Woche, eigene Übungen, Backup (22.10.)
5. **Branch:** alles direkt auf `main` (22.10.)
6. **Archetypen:** V-Form, Sanduhr, Apfel; "Peach" erscheint nirgends in der Oberfläche (22.10.)
7. **Gewicht pro Satz** (23.10.)
8. **Volumen:** Fortgeschritten max. 7 Übungen / 18 Sätze pro Einheit für alle Ziele, Hauptmuskelgruppe max. 2× pro Tag, alle anderen 1×; Volumen wissenschaftlich begründet, nicht 1:1 Peach (23.10.)
9. **Übungen frei wählbar** je Muskelgruppe, Sterne für das Ziel (23.10.)
10. **Training:** Übungen in der Tagesliste aufklappen statt eigener Seite; ab Woche 2 Vorwoche je Satz, Steigerungshinweis und Bewertung sichtbar (23.10.)
11. **Muskelgruppen-Namen bleiben** (Glute Max, Glute & Quad usw.), keine Benennung nach Übungen (23.10.)
12. **Einsteiger nur 3 oder 4 Tage**; 5 Tage mit 6 Sätzen pro Einheit ergeben keinen Sinn (23.10.)
13. **Zwei Abweichungen von der Peach-Logik bestätigt:** Vorwert bevorzugt Wochen mit Wiederholungen; bei Gegengewicht zählt 0 kg Hilfe als Bestwert (23.10.)
14. **Logo oben auf jeder Seite** führt zurück auf "Heute" (23.10.)
15. **Kein Deload.** Der nächste Zyklus beginnt mit 5–10 % weniger Gewicht; das erklärt der Plan (23.10.)
16. **Kniebeuge zählt für den Po weiter 0,5** im Muskelmodell (23.10.)
17. **Pausentimer nur per Knopf** in der aufgeklappten Übung, kein automatischer Start (23.10.)
18. **Wochenwahl auch auf "Heute"**, gleiche Pfeile und gleiches Raster wie im Plan (23.10.)
19. **"Plan neu einrichten"** im Plan und in den Einstellungen: Einrichtung erneut durchgehen, vorausgefüllt; der Verlauf bleibt (23.10.)

## 8. Annahmen, solange nichts anderes gesagt ist

- Sprache: Deutsch zuerst, Texte von Tag 1 in i18n-Dateien, Englisch in Phase 2
- Kein Account, keine Cloud, keine Datenerhebung (DSGVO-minimal), Backup lokal
- 12-Wochen-Zyklen, kein Deload, Woche 1 ohne Vergleich – wie Peach; der nächste Zyklus startet 5–10 % leichter
- Peach bleibt unverändert deine private App; Gymcreator ist ein eigenes Produkt mit eigenem Speicher
- Design-Kür (Glyphen, Icon) kann Florian später veredeln; im MVP mache ich Pixel-Art-Platzhalter in der Peach-Bauweise
