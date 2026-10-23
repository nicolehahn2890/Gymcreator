# Trainingswissenschaftliche Grundlage

Stand: 23.10.2026 (Volumen-Modell neu, Quellen online geprüft, mit dem ACSM Position Stand 2026 abgeglichen). Diese Datei begründet die Zahlen in `data/goals.json` (Wochenziele je Muskel, Grenzen, Wdh.-Bereiche, Stufen) und `data/templates.json` (Tagesvorlagen). Wo die Evidenz dünn ist, steht das dabei – die App verspricht nichts, was die Studienlage nicht hergibt.

## Grundsatz

Ziel ist Muskelaufbau mit **so viel Volumen wie nötig, nicht so viel wie möglich**. Jeder Plan (3 Ziele, Fortgeschrittene 3/4/5 Tage, Einsteiger 3/4 Tage = 15 Pläne) muss im Prüfskript `scripts/verify-plan-data.mjs` die Wochenziele je Muskel, die Grenzen je Einheit und die Stufen-Regeln einhalten. Die Übungen wählt die Person selbst, je Zeile aus der passenden Muskelgruppe; ein Stern markiert die besten Übungen für ihr Ziel.

## Regeln und ihre Evidenz

Spalte **Art**: **belegt** = von Studien gestützt; **teilweise** = die Richtung ist belegt, die konkreten Zahlen sind eigene Festlegung; **Festlegung** = Praxiswert oder Entscheidung, keine Studie. Quellen am 23.10.2026 online geprüft (Status in der Quellenliste).

| Parameter | Regel in Gymcreator | Art | Evidenz (Kurzform) |
|---|---|---|---|
| Wochenvolumen je Muskel | Je Ziel und Stufe eine **Zielspanne pro Muskel** (`targets`), anteilig gezählt (direkte Übung 1, Mitarbeit 0,5, z. B. Kniebeuge = Oberschenkel 1 + Po 0,5). Fortgeschritten: Hauptmuskel 11–17 (Po bei Apfel/Sanduhr, Rücken bei V-Form), weitere Zielmuskeln 4–14, Nebenmuskeln 2–7, unerwünschte 0. **Jede Prio-3-Muskelgruppe mindestens 10** (`levels.advanced.minWeeklySetsPrio3`, geprüft in `validatePlan`) | teilweise | ACSM 2026: etwa 10 Sätze je Muskelgruppe und Woche für Hypertrophie, mehr bringt weiter etwas (laut Pressemitteilung). Mehr Volumen bringt mehr, mit abnehmendem Grenznutzen: Schoenfeld 2017 (+0,37 % Zuwachs je Wochensatz; der Vergleich ≥ 10 vs. < 5 Sätze ist nur ein Trend, p = 0,074), Baz-Valle 2022 (12–20 Sätze, aber nur junge trainierte Männer, 6 Studien), Pelland 2026 (anteilige Zählung erklärt die Daten am besten). Erhalt mit wenig Volumen: Bickel 2011 (bei Jungen hielt schon 1/9 der Dosis die Muskeln, bei Älteren reichte 1/3 nicht). **Die konkreten Spannen sind Festlegung**, ebenso die Übertragung "Nebenmuskel braucht wenig" |
| Mehr Tage | Mehr Tage verteilen **ähnliches Wochenvolumen** auf kürzere Einheiten: Fortgeschritten 48–53 Sätze bei 3 Tagen, 55–59 bei 4 und 5 Tagen (etwa 10–20 % mehr; die Grenze je Einheit begrenzt die 3-Tage-Pläne) | teilweise | Bei gleichem Volumen kein nachweisbarer Frequenz-Effekt auf die Hypertrophie (Schoenfeld 2019, Pelland 2026; für Kraft ein kleiner). Die Unterschiede zwischen 3, 4 und 5 Tagen sind Festlegung. (Bis 23.10. stand hier "+ 0–10 %"; das stimmte schon vorher nicht, Sanduhr hatte 48 zu 56.) |
| Grenzen je Einheit | Höchstens **10 anteilige Sätze je Muskel und Einheit**. Fortgeschritten 3–7 Übungen und **max. 18 Sätze** (ca. 55–60 Min.), Einsteiger 3–6 Übungen und max. 12 Sätze. **Hauptmuskelgruppe max. 2 Zeilen pro Tag, alle anderen 1** (Nicoles Vorgabe 23.10.2026) | teilweise | Remmert 2025 (Preprint): ab ~11 anteiligen Sätzen pro Einheit kein **nachweisbarer** Zusatznutzen; 10 ist davon abgeleitet. 18/12 Sätze und 7/6 Übungen sind Festlegung (Dauer, Qualität der letzten Sätze) |
| Frequenz | Prio-3-Kategorien mindestens 2× pro Woche, Hauptmuskel 3–4× | teilweise | ACSM 2026: mindestens 2× pro Woche. Bei gleichem Volumen ist ein eigener Effekt höherer Frequenz nicht belegt (Schoenfeld 2019); 3–4× beim Hauptmuskel ist organisatorisch, damit die Grenze je Einheit hält |
| Wdh.-Bereiche | **6–8** schwere Grundübung (je Hauptmuskel 1× pro Woche), **6–10** weitere Grundübungen, **8–12** Maschinen, Kabel, Isolation, **12–15** Isolation für kleine Muskeln | teilweise | Hypertrophie über ein breites Lastspektrum gleich, wenn nah am Versagen (Schoenfeld 2017 Last-Meta, Lopez 2021); Kraft besser mit schwerer Last (Lopez 2021, Schoenfeld 2021). Die Bereichsgrenzen, ihre Zuordnung und "4–8 entfällt" sind Festlegung |
| Wellen über die Woche | Der Hauptmuskel bekommt an verschiedenen Tagen verschiedene Bereiche: z. B. Apfel 3 Tage Po **6–8 / 8–12 / 12–15**. Jeder Fortgeschrittenen-Plan hat beim Hauptmuskel mindestens 3 Bereiche (Test) | Festlegung | Für die Hypertrophie kein Vorteil gegenüber gleichbleibenden Bereichen (Grgic 2017, d = −0,02); ACSM 2026: komplexe Methoden sind nicht nötig. Mehr Kraft mit Wellen nur in einer kleinen Studie (Rhea 2002, 20 Männer). Gewählt für Abwechslung und weil schwere und leichte Tage sich gut verteilen |
| Warum 8–12 statt 10–12 | Gewichtssprünge an Maschinen und Kabeln sind groß (eine Stufe ist oft 5–10 %). Ein Bereich von 4 Wdh. fängt einen Sprung auf | Festlegung | Praxis der doppelten Progression |
| Intensität | 0–3 Wdh. in Reserve, schwere Grundübung 2–4. Hinweis im Onboarding, kein Pflichtfeld | teilweise | Robinson 2024 (Nähe zum Versagen wirkt auf die Hypertrophie, kaum auf die Kraft), Refalo 2023 (Versagen vs. nicht: ES 0,19, trivial), ACSM 2026 (Versagen bringt keinen Zusatznutzen). Die Zahlen 0–3/2–4 sind Festlegung |
| Übungsauswahl | **Frei je Muskelgruppe** (Nicoles Vorgabe 23.10.2026), 200 Übungen, jede Kategorie mindestens 7. **Stern** = beste Wahl fürs Ziel, mit **Stretch-Bias** (z. B. sitzender Beinbeuger, RDL, Schrägbank-Flys, Seitheben, Überkopf-Trizeps, Preacher Curls). Volle Bewegung, keine "Partials only" | teilweise | ACSM 2026: Maschinen und freie Gewichte gleichwertig, das stützt die freie Wahl. Belegt: sitzender > liegender Beinbeuger (Maeo 2021, +14 % vs. +9 %), Trizeps über Kopf (Maeo 2023, ~1,4–1,5-fach), gedehnte Teilbewegung bei Untrainierten (Pedrosa 2022 Beinstrecker, Kassiano 2023 Waden), lange > kurze Partials (Strey 2026); bei Trainierten lange Partials = volle Bewegung (Wolf 2025). **Ohne eigene Studie:** Sterne für RDL und Schrägbank-Flys; Seitheben am Kabel und mit Kurzhantel wirken gleich (Larsen 2025), beide haben den Stern. Die Zahl 200 und "mindestens 7" sind Festlegung |
| Po | Hip Thrust **und** tiefe kniedominante Übung: gleich gut für Glute Max, tiefe Kniebeuge zusätzlich für Adduktoren. Glute Med wächst durch Grundübungen nicht → direkte Abduktion. Adduktor magnus ist Hüftstrecker → eigene Kategorie | teilweise | Plotkin 2023 (34 Untrainierte: Hip Thrust = Kniebeuge für Glute Max; Kniebeuge besser für Oberschenkel und Adduktoren; Glute Med/Min wuchsen kaum), Kubo 2019 (tiefe vs. halbe Kniebeuge: Glute Max +6,7 % vs. +2,2 %). **Keine Hypertrophie-Studie zur Abduktion** – Annahme aus Anatomie/EMG |
| V-Form / Taille | Seitheben für Schulterbreite, vertikaler Zug für den Lat. "Keine schweren Seitbeugen" ist Praxis-Vorsicht. Taille ist vor allem Körperfett | teilweise | Larsen 2025 (Seitheben +3,3–4,6 % in 8 Wochen, ohne Kontrollgruppe). Lat-Zug und Seitbeugen: keine Hypertrophie-Studie (EMG bzw. Annahme) |
| Regionen | Schrägbank für obere Brust, Überkopf-Strecken für langen Trizepskopf, Preacher Curls für distalen Bizeps – als Sterne und Zeilen-Hinweis (`focus`) | teilweise | Chaves 2020 (Schrägbank nur an 1 von 3 Messstellen überlegen, Untrainierte), Maeo 2023, Pedrosa 2023 und Kassiano 2025 (Preacher mehr distal, Schrägbank-Curl mehr proximal; Untrainierte) |
| Volumen-Steigerung | Auto-Zusatzsatz +1 nach 3 stagnierenden Wochen, max. 5 Sätze je Zeile (Peach-Regel) | Festlegung | Gestützt, aber nicht belegt: Enes 2024 (mehr Sätze brachten Kraft, Hypertrophie nicht signifikant, p = 0,067); Remmert (Preprint, nur Bizeps, 34 Trainierte): Autoregulation = festes Volumen |
| Progression | Doppelte Progression: Obergrenze im 1. Satz erreicht → nächstes Mal mehr Gewicht | teilweise | Last- und Wdh.-Progression gleichwertig (Plotkin 2022). Die doppelte Progression selbst hat keinen eigenen RCT |
| Einsteiger | **Nur 3 oder 4 Tage** (5 Tage ergäben Einheiten mit 6 Sätzen; Entscheidung 23.10.2026). Gleiche Tage wie Fortgeschrittene, aber **2 Sätze je Zeile**, 6–8 und 6–10 werden **8–12**, Zeilen mit `beginner: false` entfallen. 24–34 Sätze pro Woche, 6–10 je Einheit; jeder Zielmuskel mindestens 4 anteilige Sätze pro Woche auf 2 Einheiten | teilweise | ACSM 2009: Einsteiger 1–3 Sätze, 8–12 Wdh. Jede Last wirkt, wenn nah am Versagen (Lopez 2021). Mehrere Sätze besser als einer (Currier 2023, nicht speziell Einsteiger). 2 Sätze, 55–65 % des Volumens und die Mindestzahl 4 sind Festlegung |
| Kein Deload, leichter Zyklusstart | Es gibt keine Deload-Woche. Nach 12 Wochen beginnt der nächste Zyklus mit **5–10 % weniger Gewicht** (`progression.nextCycleLighterPct`), Woche 1 ohne Vergleich; erklärt im Plan und auf "Heute" (Entscheidung 23.10.2026) | teilweise | Eine Deload-Woche brachte keinen Vorteil: Coleman 2024 (39 Trainierte: Hypertrophie gleich, Kraft eher ohne; der Deload war eine Woche komplette Pause), Pancar 2026 (19 untrainierte Männer, Deload in Woche 4 und 8: kein Unterschied). Die 5–10 % sind Festlegung |
| Zyklus | 12 Wochen, Woche 1 leichter Einstieg ohne Vergleich, unbegrenzt viele Zyklen | Festlegung | Praxis (Peach) |
| Kurz-Modus | Für einzelne Tage 45 oder 30 Min.: **jede Übung bekommt weniger Sätze**, mindestens 1 (Nicoles Entscheidung 23.10.2026). Dauer-Schätzung: Satz 45 s + Pause des Bereichs + 120 s Wechsel/Aufwärmen je Übung (`timing`) | teilweise | Ein Satz nah am Versagen wirkt schon, mehrere wirken mehr (Currier 2023, Schoenfeld 2017, Pelland 2026); für einzelne kurze Tage ist der Verlust klein. Die Steigerung hängt am 1. Satz, die Bewertung am Schnitt je Satz; beides bleibt gültig. Nebenwirkung: Ohne die ermüdeten letzten Sätze fällt der Schnitt eher höher aus, die Bewertung zeigt dann leichter "Mehr Wiederholungen". Die Zeiten der Schätzung sind Festlegung |

## Korrekturen und Vorbehalte aus der Recherche

- **Prüfung 23.10.2026:** Alle Quellen online über PubMed, PMC und Verlagsseiten gesucht. Direkte Abrufe waren aus der Arbeitsumgebung gesperrt; geprüft wurde über die Suchtreffer. Bei Schoenfeld 2017 (Volumen) und Kubo 2019 stammen die genauen Zahlen aus Sekundärquellen.
- Korrigiert: Schoenfeld 2017 belegt den Zuwachs je Satz, der Vergleich ≥ 10 vs. < 5 ist nur ein Trend. Bickel 2011 belegt "ein Drittel reicht zum Erhalt" nicht allgemein (bei Jungen reichte 1/9, bei Älteren 1/3 nicht). Lopez 2021 belegt "jede Last", nicht "wenig Volumen". Larsen 2025 stützt keinen Vorrang für Kabel-Seitheben. "Greig 2021" (Autoregulation) ist ein Konzeptpapier ohne Ergebnisvergleich und ist entfernt.
- Remmert (Grenze pro Einheit) und die Volumen-Autoregulation sind Preprints.
- Vereinfachung im Muskelmodell: Die Kniebeuge zählt für den Po nur 0,5, obwohl Plotkin 2023 und Kubo 2019 eher für eine volle Anrechnung beim Glute Max sprechen. Das Po-Volumen bei Apfel und Sanduhr ist dadurch eher unterschätzt (vorsichtige Seite). Bleibt bewusst so (Nicoles Entscheidung 23.10.2026).
- Viele Studien betreffen Untrainierte, junge Männer oder einzelne Muskeln. Die Übertragung auf andere Gruppen ist Annahme.
- Die Zielspannen sind eine Festlegung aus den Metaanalysen, keine Werte aus einer einzelnen Studie. Menschen reagieren individuell sehr unterschiedlich; deshalb gibt es den Auto-Zusatzsatz bei Stillstand.
- Lange Partials sind vor allem bei Untrainierten und Einzelgelenk-Übungen überlegen; bei Trainierten gleich volle Bewegung. Deshalb "Stretch-Bias", nicht "Partials".
- Die Apfel-Pläne sind **nicht** Nicoles Peach-Plan (P3/P4). Der ist ihr persönlicher Plan mit deutlich mehr Volumen; für Gymcreator gilt das Modell oben (Entscheidung 23.10.2026).

## Abgleich mit dem ACSM Position Stand 2026

Currier BS et al. (Vorsitz Stuart Phillips), Med Sci Sports Exerc 2026;58(4):851–872: Übersicht über 137 systematische Reviews, Nachfolger des Position Stands von 2009. **Gelesen über Abstract, Pressemitteilung und Sekundärquellen; der Volltext war aus der Arbeitsumgebung gesperrt.** Die genaue Empfehlungstabelle ist deshalb nicht im Original geprüft; Zahlen, bei denen sich die Sekundärquellen widersprechen (z. B. die Lastgrenze für Kraft), sind hier nicht übernommen.

| Aussage (ACSM 2026) | Gymcreator | Folge |
|---|---|---|
| Den größten Effekt hat der Schritt von keinem zu regelmäßigem Krafttraining | Einsteiger mit wenig Volumen, 3 oder 4 Tage | passt |
| Hypertrophie: etwa 10 Sätze je Muskelgruppe und Woche, mehr bringt weiter etwas | Hauptmuskeln 12–16; drei Prio-3-Muskelgruppen lagen bei 8–9 | **geändert:** jede Prio-3-Muskelgruppe mindestens 10 (Apfel Glute Med 8 → 10, Sanduhr Schultern bei 4 Tagen 9 → 10, V-Form Brust 8 → 10) |
| Mindestens 2× pro Woche | Prio-3-Kategorien mindestens 2× pro Woche | passt |
| Training bis zum Versagen nicht nötig | 0–3 Wdh. in Reserve | passt |
| Hypertrophie über ein breites Lastspektrum, wenn nah am Versagen; Kraft profitiert von schweren Lasten | 6–8 bis 12–15, eine schwere Grundübung je Hauptmuskel | passt |
| Maschinen und freie Gewichte gleichwertig | Übungen frei wählbar | passt |
| Komplexe Methoden nicht nötig | Wellen über die Woche sind Festlegung für Abwechslung, kein behaupteter Vorteil | passt |

Umsetzung V-Form: Die Brust bekommt eine dritte Übung (Flys 2 × 12–15, gedehnte Position) am Rücken-Tag, statt die beiden Brustzeilen auf 5 Sätze zu erhöhen. So bleiben 4 Sätze je Übung, der Auto-Zusatzsatz bleibt möglich, und die Brust wird 3× pro Woche trainiert. Der Tag heißt jetzt „Oberkörper“ (3 Tage) bzw. „Rücken & Brust“ (4 und 5 Tage).

Bewusst unter 10 bleiben die Prio-2-Muskeln (z. B. Rücken bei Apfel und Sanduhr: 6). Sie werden trainiert, aber nicht maximal aufgebaut; das ist die Priorisierung des Körperziels innerhalb von max. 18 Sätzen je Einheit. Einsteiger haben keine Untergrenze von 10, weil bei Untrainierten auch wenig Volumen wirkt.

## Verifizierte Volumen (aus `data/`, geprüft mit `scripts/verify-plan-data.mjs`)

Anteilige Sätze pro Woche (Fortgeschritten 3 / 4 / 5 Tage, Einsteiger 3 / 4 Tage), daneben die Zielspanne aus `targets`.

Anpassung 23.10.2026 (abends): Apfel bekommt eine zweite kniebetonte Übung (Ausfallschritt oder Split Squat, belastet den Po stark mit) statt des zweiten Hüftbeuge-Slots, Oberschenkel vorne 3 → 5, Beinrückseite 8 → 6. Sanduhr-Einsteiger bekommen Glute Med an zwei Tagen (2 → 4). ACSM-Abgleich (23.10.2026): Prio-3-Muskelgruppen bei Fortgeschrittenen mindestens 10 (siehe oben).

### Fortgeschritten

| Muskel | Apfel | Ziel | Sanduhr | Ziel | V-Form | Ziel |
|---|---|---|---|---|---|---|
| Po (Glute Max) | 14 / 16 / 16 | 12–17 | 12 / 13,5 / 12 | 11–16 | 3 / 3 / 3 | 2–7 |
| Hüfte außen (Glute Med) | 10 / 10 / 10 | 10–12 | 4 / 4 / 6 | 4–8 | 0 / 0 / 0 | 0 |
| Beinrückseite | 6 / 6 / 6 | 6–10 | 6 / 6 / 6 | 5–10 | 3 / 3 / 3 | 3–6 |
| Oberschenkel vorne | 5 / 5 / 5 | 4–7 | 6 / 9 / 5 | 5–10 | 6 / 6 / 6 | 5–9 |
| Adduktoren | 4 / 4 / 4 | 3–6 | 0 / 0 / 0 | 0–4 | 0 / 0 / 0 | 0 |
| Rücken | 6 / 6 / 6 | 6–10 | 6 / 6 / 6 | 6–10 | 12 / 12 / 12 | 12–16 |
| Schultern | 7 / 7 / 7 | 6–9 | 10 / 10 / 10 | 10–14 | 10 / 12 / 11 | 10–14 |
| Brust | 2 / 3 / 3 | 0–4 | 3 / 3 / 3 | 2–5 | 10 / 10 / 10 | 10–13 |
| Bizeps | 3 / 3 / 3 | 0–5 | 3 / 5 / 5 | 3–7 | 9 / 9 / 9 | 6–10 |
| Trizeps | 1 / 1,5 / 1,5 | 0–3 | 1,5 / 3,5 / 3,5 | 1–5 | 8 / 10 / 10 | 5–10 |
| Waden | 0 / 0 / 0 | 0 | 0 / 0 / 0 | 0 | 2 / 3 / 5 | 2–6 |
| Bauch | 4 / 6 / 6 | 2–6 | 4 / 6 / 6 | 2–6 | 4 / 4 / 4 | 2–6 |
| **Sätze gesamt** | 52 / 57 / 57 |  | 48 / 57 / 55 |  | 53 / 58 / 59 |  |
| Sätze je Einheit | 16–18 / 12–16 / 9–13 |  | 15–17 / 13–15 / 9–13 |  | 17–18 / 12–16 / 10–14 |  |

### Einsteiger

| Muskel | Apfel | Ziel | Sanduhr | Ziel | V-Form | Ziel |
|---|---|---|---|---|---|---|
| Po (Glute Max) | 10 / 10 | 7–11 | 8 / 8 | 6–10 | 2 / 2 | 1–5 |
| Hüfte außen (Glute Med) | 6 / 6 | 4–6 | 4 / 4 | 4–6 | 0 / 0 | 0 |
| Beinrückseite | 4 / 4 | 3–7 | 4 / 4 | 3–6 | 2 / 2 | 2–4 |
| Oberschenkel vorne | 4 / 4 | 3–5 | 4 / 4 | 3–6 | 2 / 2 | 2–6 |
| Adduktoren | 2 / 2 | 0–4 | 0 / 0 | 0–3 | 0 / 0 | 0 |
| Rücken | 4 / 4 | 3–6 | 4 / 4 | 3–6 | 6 / 8 | 6–10 |
| Schultern | 4 / 4 | 2–6 | 6 / 6 | 4–8 | 4 / 6 | 4–8 |
| Brust | 0 / 0 | 0–3 | 2 / 2 | 0–4 | 4 / 4 | 4–8 |
| Bizeps | 2 / 2 | 0–3 | 2 / 2 | 1–4 | 5 / 6 | 3–6 |
| Trizeps | 0 / 0 | 0–2 | 1 / 1 | 0–3 | 2 / 4 | 2–6 |
| Waden | 0 / 0 | 0 | 0 / 0 | 0 | 2 / 0 | 0–4 |
| Bauch | 0 / 4 | 0–4 | 0 / 2 | 0–4 | 2 / 0 | 0–4 |
| **Sätze gesamt** | 30 / 34 |  | 30 / 32 |  | 24 / 26 |  |
| Sätze je Einheit | 10 / 8–10 |  | 10 / 6–10 |  | 8 / 6–8 |  |

Die Tagesvorlagen selbst (Tagesname, Zeilen, Sätze, Bereich) druckt `node scripts/verify-plan-data.mjs` für alle 15 Pläne aus.

## Quellen

Status nach der Online-Prüfung am 23.10.2026: **bestätigt** (gefunden, stützt die Aussage), **korrigiert** (Angabe oder Aussage angepasst), **Preprint** (nicht begutachtet).

1. Pelland JC, Remmert JF, Robinson ZP, Hinson SR, Zourdos MC. Sports Med 2026;56(2):481–505 (online 4.12.2025), PMID 41343037. **bestätigt.** https://link.springer.com/article/10.1007/s40279-025-02344-w
2. Remmert JF et al. "Is There Too Much of a Good Thing?" SportRxiv 2025, DOI 10.51224/SRXIV.537. **Preprint, bestätigt.** https://sportrxiv.org/index.php/server/preprint/view/537
3. Remmert JF et al. The Effect of Set Volume Autoregulation on Hypertrophy. SportRxiv. **Preprint, bestätigt** (34 Trainierte, nur Bizepscurl). https://sportrxiv.org/index.php/server/preprint/view/1108
4. Schoenfeld BJ, Ogborn D, Krieger JW. J Sports Sci 2017;35(11):1073–1082, DOI 10.1080/02640414.2016.1210197. **korrigiert** (Kategorienvergleich nur Trend).
5. Baz-Valle E, Balsalobre-Fernández C, Alix-Fages C, Santos-Concejero J. J Hum Kinet 2022;81:199–210. **bestätigt** (junge trainierte Männer).
6. Schoenfeld BJ, Grgic J, Krieger J. J Sports Sci 2019;37(11):1286–1295, DOI 10.1080/02640414.2018.1555906. **bestätigt.**
7. Lopez P et al. Med Sci Sports Exerc 2021;53(6):1206–1216, DOI 10.1249/MSS.0000000000002585. **bestätigt** (Aussage auf "jede Last" begrenzt). https://jyx.jyu.fi/handle/123456789/75929
8. Robinson ZP et al. Sports Med 2024;54(9):2209–2231. **bestätigt.** https://link.springer.com/article/10.1007/s40279-024-02069-2
9. Refalo MC et al. Sports Med 2023;53(3):649–665. **bestätigt.** https://pmc.ncbi.nlm.nih.gov/articles/PMC9935748
10. Enes A, De Souza EO, Souza-Junior TP. Med Sci Sports Exerc 2024;56(3):553–563. **bestätigt.** https://pubmed.ncbi.nlm.nih.gov/37796222/
11. Coleman M et al. PeerJ 2024;12:e16777. **bestätigt** (Deload = eine Woche Pause). https://peerj.com/articles/16777
12. Wolf M et al. Int J Strength Cond 2023;3(1), DOI 10.47206/ijsc.v3i1.182. **bestätigt.** https://journal.iusca.org/index.php/Journal/article/view/182
13. Wolf M et al. PeerJ 2025;13:e18904. **bestätigt** (lange Partials = volle Bewegung bei Trainierten). https://peerj.com/articles/18904/
14. Strey B, Irigoyen A, McMahon G, Pinto RS. Sport Sci Health 2026;22, Art. 33. **bestätigt.** https://link.springer.com/article/10.1007/s11332-025-01586-5
15. Maeo S et al. Greater Hamstrings Muscle Hypertrophy but Similar Damage Protection after Training at Long versus Short Muscle Lengths. Med Sci Sports Exerc 2021;53(4):825–837. **bestätigt.** https://pubmed.ncbi.nlm.nih.gov/33009197/
16. Maeo S et al. Eur J Sport Sci 2023;23(7):1240–1250. **bestätigt.** https://pubmed.ncbi.nlm.nih.gov/35819335/
17. Pedrosa GF et al. Eur J Sport Sci 2022;22(8):1250–1260, DOI 10.1080/17461391.2021.1927199 (Beinstrecker, gedehnte Teilbewegung, 45 untrainierte Frauen). **korrigiert** (Fundstelle ergänzt).
18. Pedrosa GF et al. Sports 2023;11(2):39 (Bizeps ROM). **bestätigt.** https://www.mdpi.com/2075-4663/11/2/39
19. Kassiano W et al. Int J Sports Med 2025;46(5):334–343 (Preacher vs. Schrägbank-Curls, 63 untrainierte Frauen). **korrigiert** (Fundstelle ergänzt). https://pubmed.ncbi.nlm.nih.gov/39809454/
20. Plotkin DL et al. Front Physiol 2023;14:1279170 (Hip Thrust vs. Kniebeuge, 34 Untrainierte). **bestätigt.** https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2023.1279170/full
21. Kubo K et al. Eur J Appl Physiol 2019;119(9):1933–1942, DOI 10.1007/s00421-019-04181-y (tiefe vs. halbe Kniebeuge, n = 17). **bestätigt über Sekundärquellen** (Link durch DOI ersetzt). https://doi.org/10.1007/s00421-019-04181-y
22. Plotkin DL et al. PeerJ 2022;10:e14142 (Last- vs. Wdh.-Progression). **korrigiert** (Fundstelle). https://peerj.com/articles/14142/
23. Larsen S et al. Dumbbell versus cable lateral raises. Front Physiol 2025;16:1611468. **korrigiert** (Kabel = Kurzhantel, keine Kontrollgruppe). https://pmc.ncbi.nlm.nih.gov/articles/PMC12277279/
24. Chaves SFN et al. Int J Exerc Sci 2020;13(6):859–872 (Schrägbank, obere Brust). **bestätigt** (nur 1 von 3 Messstellen). https://pmc.ncbi.nlm.nih.gov/articles/PMC7449336/
25. Currier BS et al. Br J Sports Med 2023;57(18):1211–1220. **bestätigt** (nicht speziell Einsteiger). https://pmc.ncbi.nlm.nih.gov/articles/PMC10579494/
26. Pancar et al. Sci Rep 2026, DOI 10.1038/s41598-026-40612-5 (Deload, 19 untrainierte Männer). **korrigiert** (Fundstelle ergänzt). https://www.nature.com/articles/s41598-026-40612-5
27. Bickel CS, Cross JM, Bamman MM. Med Sci Sports Exerc 2011;43(7):1177–1187 (Erhalt mit reduziertem Volumen). **korrigiert** (Aussage). https://pubmed.ncbi.nlm.nih.gov/21131862/
28. Grgic J, Mikulic P, Podnar H, Pedisic Z. PeerJ 2017;5:e3695 (lineare vs. wellenförmige Periodisierung, 13 Studien). **bestätigt.** https://pmc.ncbi.nlm.nih.gov/articles/PMC5571788/
29. Rhea MR, Ball SD, Phillips WT, Burkett LN. J Strength Cond Res 2002;16(2):250–255 (wellenförmige Periodisierung, Kraft, 20 Männer). **bestätigt.** https://pubmed.ncbi.nlm.nih.gov/11991778/
30. American College of Sports Medicine. Med Sci Sports Exerc 2009;41(3):687–708 (Position Stand Krafttraining). **bestätigt;** abgelöst durch Quelle 34.
31. Schoenfeld BJ, Grgic J, Ogborn D, Krieger JW. J Strength Cond Res 2017;31(12):3508–3523, DOI 10.1519/JSC.0000000000002200 (niedrige vs. hohe Last). **bestätigt.**
32. Schoenfeld BJ, Grgic J, Van Every DW, Plotkin DL. Sports 2021;9(2):32, DOI 10.3390/sports9020032 (Wiederholungs-Kontinuum). **bestätigt.**
33. Kassiano W et al. J Strength Cond Res 2023;37(9):1746–1753 (Waden, gedehnte Teilbewegung +15,2 % vs. +6,7 %). **bestätigt.** https://pubmed.ncbi.nlm.nih.gov/37015016/
34. Currier BS et al. American College of Sports Medicine Position Stand. Resistance Training Prescription for Muscle Function, Hypertrophy, and Physical Performance in Healthy Adults: An Overview of Reviews. Med Sci Sports Exerc 2026;58(4):851–872, DOI 10.1249/MSS.0000000000003897. **über Suchtreffer bestätigt, Volltext nicht gelesen.**
