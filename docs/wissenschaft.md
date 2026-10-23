# Trainingswissenschaftliche Grundlage

Stand: 23.10.2026 (Volumen-Modell neu). Diese Datei begründet die Zahlen in `data/goals.json` (Wochenziele je Muskel, Grenzen, Wdh.-Bereiche, Stufen) und `data/templates.json` (Tagesvorlagen). Wo die Evidenz dünn ist, steht das dabei – die App verspricht nichts, was die Studienlage nicht hergibt.

## Grundsatz

Ziel ist Muskelaufbau mit **so viel Volumen wie nötig, nicht so viel wie möglich**. Jeder Plan (3 Ziele × 2 Stufen × 3/4/5 Tage = 18 Pläne) muss im Prüfskript `scripts/verify-plan-data.mjs` die Wochenziele je Muskel, die Grenzen je Einheit und die Stufen-Regeln einhalten. Die Übungen wählt die Person selbst, je Zeile aus der passenden Muskelgruppe; ein Stern markiert die besten Übungen für ihr Ziel.

## Regeln und ihre Evidenz

| Parameter | Regel in Gymcreator | Evidenz (Kurzform) |
|---|---|---|
| Wochenvolumen je Muskel | Je Ziel und Stufe eine **Zielspanne pro Muskel** (`targets`), anteilig gezählt (direkte Übung 1, Mitarbeit 0,5, z. B. Kniebeuge = Oberschenkel 1 + Po 0,5). Fortgeschritten: Hauptmuskel 11–17 (Po bei Apfel/Sanduhr, Rücken bei V-Form), weitere Zielmuskeln 6–14, Nebenmuskeln 2–7 (Erhalt bis leichter Aufbau), unerwünschte 0 | Dosis-Wirkung mit abnehmendem Grenznutzen: Schoenfeld 2017 (≥ 10 > < 5 Sätze/Woche), Baz-Valle 2022 (12–20 für Trainierte), Pelland 2026 (anteilige Zählung erklärt die Daten am besten, Zuwachs flacht ab). Erhalt mit etwa einem Drittel des Aufbauvolumens (Bickel 2011) |
| Mehr Tage | Mehr Tage verteilen **ungefähr dasselbe Wochenvolumen** auf kürzere Einheiten (+ 0–10 %), statt es zu verdoppeln: Fortgeschritten 48–51 Sätze bei 3 Tagen, 55–57 bei 4 und 5 Tagen | Bei gleichem Volumen bringt mehr Frequenz kaum etwas (Schoenfeld 2019, Pelland 2026). Der Vorteil vieler Tage ist die kürzere, frischere Einheit |
| Grenzen je Einheit | Höchstens **10 anteilige Sätze je Muskel und Einheit**. Fortgeschritten 3–7 Übungen und **max. 18 Sätze** (ca. 55–60 Min.), Einsteiger 3–6 Übungen und max. 12 Sätze. **Hauptmuskelgruppe max. 2 Zeilen pro Tag, alle anderen 1** (Nicoles Vorgabe 23.10.2026: Vielfalt statt mehrerer gleichartiger Übungen) | Remmert 2025 (Preprint): ab ~11 anteiligen Sätzen pro Einheit kein Zusatznutzen. 18 Sätze sind ein Praxiswert für Dauer und Qualität der letzten Sätze |
| Frequenz | Prio-3-Kategorien mindestens 2× pro Woche, Hauptmuskel 3–4× | Vor allem, um die Grenze je Einheit einzuhalten; bei gleichem Volumen kein eigener Effekt (Schoenfeld 2019) |
| Wdh.-Bereiche | **6–8** schwere Grundübung (je Hauptmuskel 1× pro Woche), **6–10** weitere Grundübungen, **8–12** Maschinen, Kabel, Isolation, **12–15** Isolation für kleine Muskeln und Pump | Hypertrophie über ~6–30 Wdh. gleich, wenn nah am Versagen (Schoenfeld 2017 Last-Meta, Lopez 2021); Kraft profitiert von schwerer Last (Schoenfeld 2021). 4–8 ist entfallen: kaum mehr Muskel, höheres Gelenk- und Technikrisiko |
| Wellen über die Woche | Der Hauptmuskel bekommt an verschiedenen Tagen verschiedene Bereiche: z. B. Apfel 3 Tage Po **6–8 / 8–12 / 12–15**, V-Form Rücken 6–8 und 6–10 an einem Tag, 8–12 am anderen. Jeder Fortgeschrittenen-Plan hat beim Hauptmuskel mindestens 3 Bereiche (Test) | Wellenförmige (DUP) und lineare Periodisierung bringen gleich viel Muskel (Grgic 2017), DUP etwas mehr Kraft (Rhea 2002). Vorteil hier: schwere Last für Kraft, leichtere Sätze für Volumen ohne zusätzliche Gelenkbelastung |
| Warum 8–12 statt 10–12 | Gewichtssprünge an Maschinen und Kabeln sind groß (eine Stufe ist oft 5–10 %). Ein Bereich von 4 Wdh. fängt einen Sprung auf, ohne den Bereich zu verlassen | Praxis der doppelten Progression, keine Studienfrage |
| Intensität | 0–3 Wdh. in Reserve, schwere Grundübung 2–4. Hinweis im Onboarding, kein Pflichtfeld | Robinson 2024 (näher am Versagen = etwas mehr Hypertrophie, Kraft unverändert), Refalo 2023 (Versagen vs. nicht: ES 0,19, trivial) |
| Übungsauswahl | **Frei je Muskelgruppe** (Nicoles Vorgabe 23.10.2026), 200 Übungen, jede Kategorie mindestens 7. **Stern** = beste Wahl fürs Ziel, mit **Stretch-Bias** (Last in der gedehnten Position: sitzender Beinbeuger, RDL, Überzug, Schrägbank-Flys, Kabel-Seitheben, Überkopf-Trizeps, Preacher Curls). Volle Bewegung, keine "Partials only" | Maeo 2021 (sitzender > liegender Beinbeuger, ~14 % vs. ~9 %), Pedrosa 2022, Kassiano 2023, Maeo 2023 (Trizeps Überkopf ~1,4×), Wolf 2023 Meta, Wolf 2025 RCT, Strey 2026 Meta (lange > kurze Partials, ES 0,28) |
| Po | Hip Thrust **und** tiefe kniedominante Übung: gleich gut für Glute Max, tiefe Kniebeuge zusätzlich für Adduktoren. Glute Med wächst durch Grundübungen nicht → direkte Abduktion. Adduktor magnus ist Hüftstrecker → eigene Kategorie | Plotkin 2023 (HT = SQ für Glute Max; SQ > HT für Quads/Adduktoren; Glute Med/Min ~kein Wachstum bei beiden), Kubo 2019. **Keine Hypertrophie-Studie zu Glute-Med-Abduktion** – Annahme aus Anatomie/EMG |
| V-Form / Taille | Seitheben für Schulterbreite (belegt), vertikaler Zug für Lat (EMG-basiert). "Keine schweren Seitbeugen" ist Praxis-Vorsicht, keine Studienlage. Taille ist vor allem Körperfett | Larsen 2025 (Seitheben +3–5 % in 8 Wochen). Oblique-Training → dickere Taille: **kein Trial** |
| Regionen | Schrägbank für obere Brust, Überkopf-Strecken für langen Trizepskopf, Preacher Curls für distalen Bizeps – als Sterne und Zeilen-Hinweis (`focus`) hinterlegt | Chaves 2020 (Schrägbank, klein, Untrainierte), Maeo 2023, Pedrosa 2023, Kassiano 2025 |
| Volumen-Steigerung | Konservativ: Auto-Zusatzsatz +1 nach 3 stagnierenden Wochen, max. 5 Sätze je Zeile (Peach-Regel) | Enes 2024 (MSSE 56(3):553–563): mehr Sätze brachten Kraft, Hypertrophie-Unterschied nicht signifikant; Autoregulation des Volumens ≈ festes Volumen (Remmert, Preprint) |
| Progression | Doppelte Progression: Obergrenze im 1. Satz erreicht → nächstes Mal mehr Gewicht (Hinweis mit Vorschlag in der Übung) | Last- ≈ Wdh.-Progression (Plotkin 2022); kein RCT zur doppelten Progression selbst; Autoregulation ≈ fest (Greig 2021, Larsen 2021) |
| Einsteiger | Gleiche Tage wie Fortgeschrittene, aber **2 Sätze je Zeile**, 6–8 und 6–10 werden **8–12**, Zeilen mit `beginner: false` entfallen (meist Bauch, zweite Isolation, Arme). Ergebnis: 24–32 Sätze pro Woche, 6–10 je Einheit, etwa 55–65 % des Fortgeschrittenen-Volumens, Hauptmuskel 6–10 anteilige Sätze | Einsteiger wachsen schon mit wenig Volumen und jeder Last (Lopez 2021, Currier 2023: mehrere Sätze > ein Satz). ACSM 2009: Einsteiger 8–12 Wdh., 1–3 Sätze |
| Deload | Standard: keine. Opt-in in den Einstellungen (noch nicht gebaut) | Coleman 2024 (n = 39 Trainierte, 9 Wochen: Hypertrophie gleich, Kraft eher ohne Deload-Woche), Pancar 2026 (Untrainierte: kein Unterschied) |
| Zyklus | 12 Wochen, Woche 1 leichter Einstieg ohne Vergleich, unbegrenzt viele Zyklen | Praxis (Peach), keine Studienfrage |

## Korrekturen und Vorbehalte aus der Recherche

- Pelland et al. ist seit Dez. 2025 begutachtet (Sports Med 2026;56(2):481–505). Die Zahlen "4 Sätze Minimum / ~31 Sätze Obergrenze" stammen aus dem Preprint 2024 und Sekundärquellen, nicht aus dem Endtext.
- Remmert (Grenze pro Einheit) und die Volumen-Autoregulation sind Preprints. Gymcreator bleibt mit 10 anteiligen Sätzen bewusst darunter.
- Die Zielspannen sind eine begründete Festlegung aus den Metaanalysen, keine Werte aus einer einzelnen Studie. Menschen reagieren individuell sehr unterschiedlich; deshalb gibt es den Auto-Zusatzsatz bei Stillstand.
- Lange Partials sind vor allem bei Untrainierten und Einzelgelenk-Übungen überlegen; bei Trainierten gleich volle ROM. Deshalb "Stretch-Bias", nicht "Partials".
- Glute-Med-Abduktion und Oblique/Taille beruhen auf Anatomie/EMG, nicht auf Hypertrophie-Studien.
- Doppelte Progression hat keinen eigenen RCT; sie ist die praktikable Umsetzung der belegten Gleichwertigkeit von Last- und Wdh.-Progression.
- Die Apfel-Pläne sind **nicht** mehr Nicoles Peach-Plan (P3/P4). Der ist ihr persönlicher Plan mit deutlich mehr Volumen; für Gymcreator gilt das Modell oben (Entscheidung 23.10.2026).

## Verifizierte Volumen (aus `data/`, geprüft mit `scripts/verify-plan-data.mjs`)

Anteilige Sätze pro Woche für 3 / 4 / 5 Tage, daneben die Zielspanne aus `targets`.

### Fortgeschritten

| Muskel | Apfel | Ziel | Sanduhr | Ziel | V-Form | Ziel |
|---|---|---|---|---|---|---|
| Po (Glute Max) | 14 / 16 / 16 | 12–17 | 12 / 13,5 / 12 | 11–16 | 3 / 3 / 3 | 2–7 |
| Hüfte außen (Glute Med) | 8 / 8 / 8 | 6–10 | 4 / 4 / 6 | 4–8 | 0 / 0 / 0 | 0 |
| Beinrückseite | 8 / 8 / 8 | 6–10 | 6 / 6 / 6 | 5–10 | 3 / 3 / 3 | 3–6 |
| Oberschenkel vorne | 3 / 3 / 3 | 3–7 | 6 / 9 / 5 | 5–10 | 6 / 6 / 6 | 5–9 |
| Adduktoren | 4 / 4 / 4 | 3–6 | 0 / 0 / 0 | 0–4 | 0 / 0 / 0 | 0 |
| Rücken | 6 / 6 / 6 | 6–10 | 6 / 6 / 6 | 6–10 | 12 / 12 / 12 | 12–16 |
| Schultern | 7 / 7 / 7 | 6–9 | 10 / 9 / 10 | 9–14 | 10 / 12 / 11 | 9–14 |
| Brust | 2 / 3 / 3 | 0–4 | 3 / 3 / 3 | 2–5 | 8 / 8 / 8 | 8–13 |
| Bizeps | 3 / 3 / 3 | 0–5 | 3 / 5 / 5 | 3–7 | 9 / 9 / 9 | 6–10 |
| Trizeps | 1 / 1,5 / 1,5 | 0–3 | 1,5 / 3,5 / 3,5 | 1–5 | 7 / 9 / 9 | 5–10 |
| Waden | 0 / 0 / 0 | 0 | 0 / 0 / 0 | 0 | 2 / 3 / 5 | 2–6 |
| Bauch | 4 / 6 / 6 | 2–6 | 4 / 6 / 6 | 2–6 | 4 / 4 / 4 | 2–6 |
| **Sätze gesamt** | 50 / 55 / 55 |  | 48 / 56 / 55 |  | 51 / 56 / 57 |  |
| Sätze je Einheit | 15–18 / 12–15 / 9–13 |  | 15–17 / 13–15 / 9–13 |  | 15–18 / 12–15 / 10–14 |  |

### Einsteiger

| Muskel | Apfel | Ziel | Sanduhr | Ziel | V-Form | Ziel |
|---|---|---|---|---|---|---|
| Po (Glute Max) | 10 / 9 / 9 | 7–11 | 8 / 8 / 8 | 6–10 | 2 / 2 / 2 | 1–5 |
| Hüfte außen (Glute Med) | 6 / 6 / 4 | 4–6 | 2 / 2 / 4 | 2–6 | 0 / 0 / 0 | 0 |
| Beinrückseite | 6 / 4 / 4 | 3–7 | 4 / 4 / 4 | 3–6 | 2 / 2 / 2 | 2–4 |
| Oberschenkel vorne | 2 / 2 / 2 | 2–5 | 4 / 4 / 4 | 3–6 | 2 / 2 / 2 | 2–6 |
| Adduktoren | 2 / 2 / 2 | 0–4 | 0 / 0 / 0 | 0–3 | 0 / 0 / 0 | 0 |
| Rücken | 4 / 4 / 4 | 3–6 | 4 / 4 / 4 | 3–6 | 6 / 8 / 8 | 6–10 |
| Schultern | 4 / 4 / 6 | 2–6 | 6 / 6 / 6 | 4–8 | 4 / 6 / 6 | 4–8 |
| Brust | 0 / 0 / 0 | 0–3 | 2 / 2 / 2 | 0–4 | 4 / 4 / 4 | 4–8 |
| Bizeps | 2 / 2 / 2 | 0–3 | 2 / 2 / 2 | 1–4 | 5 / 6 / 6 | 3–6 |
| Trizeps | 0 / 0 / 0 | 0–2 | 1 / 1 / 1 | 0–3 | 2 / 4 / 6 | 2–6 |
| Waden | 0 / 0 / 0 | 0 | 0 / 0 / 0 | 0 | 2 / 0 / 0 | 0–4 |
| Bauch | 0 / 4 / 4 | 0–4 | 0 / 2 / 2 | 0–4 | 2 / 0 / 2 | 0–4 |
| **Sätze gesamt** | 30 / 32 / 32 |  | 28 / 30 / 32 |  | 24 / 26 / 30 |  |
| Sätze je Einheit | 10 / 8 / 6–8 |  | 8–10 / 6–10 / 6–8 |  | 8 / 6–8 / 6 |  |

Die Tagesvorlagen selbst (Tagesname, Zeilen, Sätze, Bereich) druckt `node scripts/verify-plan-data.mjs` für alle 18 Pläne aus.

## Quellen

1. Pelland JC, Remmert JF, Robinson ZP, Hinson SR, Zourdos MC. Sports Med 2026;56(2):481–505 (online 4.12.2025). https://link.springer.com/article/10.1007/s40279-025-02344-w
2. Remmert JF et al. "Is There Too Much of a Good Thing?" SportRxiv 2025 (Preprint). https://sportrxiv.org/index.php/server/preprint/view/537
3. Remmert JF et al. Set-volume autoregulation, SportRxiv (Preprint). https://sportrxiv.org/index.php/server/preprint/view/1108
4. Schoenfeld BJ, Ogborn D, Krieger JW. J Sports Sci 2017;35(11):1073–1082 (Dosis-Wirkung Wochenvolumen).
5. Baz-Valle E, Balsalobre-Fernández C, Alix-Fages C, Santos-Concejero J. J Hum Kinet 2022;81:199–210.
6. Schoenfeld BJ, Grgic J, Krieger J. J Sports Sci 2019;37(11):1286–1295 (Frequenz, volumen-gleich).
7. Lopez P et al. Med Sci Sports Exerc 2021;53(6):1206–1216 (Last und Hypertrophie). https://jyx.jyu.fi/handle/123456789/75929
8. Robinson ZP et al. Sports Med 2024;54:2209–2231. https://link.springer.com/article/10.1007/s40279-024-02069-2
9. Refalo MC et al. Sports Med 2023;53:649–665. https://pmc.ncbi.nlm.nih.gov/articles/PMC9935748
10. Enes A et al. Med Sci Sports Exerc 2024;56(3):553–563. https://pubmed.ncbi.nlm.nih.gov/37796222/
11. Coleman M et al. PeerJ 2024;12:e16777. https://peerj.com/articles/16777
12. Wolf M et al. Int J Strength Cond 2023;3(1) (Meta ROM). https://journal.iusca.org/index.php/Journal/article/view/182
13. Wolf M et al. PeerJ 2025;13:e18904 (RCT lange Partials, Trainierte). https://peerj.com/articles/18904/
14. Strey B, Irigoyen A, McMahon G, Pinto RS. Sport Sci Health 2026;22(1). https://link.springer.com/article/10.1007/s11332-025-01586-5
15. Maeo S et al. Med Sci Sports Exerc 2021;53(4):825–837 (sitzender vs. liegender Beinbeuger).
16. Maeo S et al. Eur J Sport Sci 2023;23(7):1240–1250 (Trizeps Überkopf). https://pubmed.ncbi.nlm.nih.gov/35819335/
17. Pedrosa GF et al. Eur J Sport Sci 2022 (Beinstrecker, gedehnte Teilbewegung).
18. Pedrosa GF et al. Sports 2023;11(2):39 (Bizeps ROM). https://www.mdpi.com/2075-4663/11/2/39
19. Kassiano W et al. Int J Sports Med 2025 (Preacher vs. Schrägbank-Curls). https://www.thieme-connect.com/products/ejournals/abstract/10.1055/a-2517-0509
20. Plotkin DL et al. Front Physiol 2023;14:1279170 (Hip Thrust vs. Kniebeuge). https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2023.1279170/full
21. Kubo K et al. Eur J Appl Physiol 2019 (tiefe vs. halbe Kniebeuge). https://highfit.com.br/wp-content/uploads/2019/06/KEITARO-KUBO-2019.pdf
22. Plotkin DL et al. PeerJ 2022 (Last- vs. Wdh.-Progression). https://www.researchgate.net/publication/364069602
23. Larsen S et al. Front Physiol 2025 (Seitheben). https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12277279/
24. Chaves SFN et al. Int J Exerc Sci 2020;13(6) (Schrägbank, obere Brust). https://digitalcommons.wku.edu/ijes/vol13/iss6/12
25. Currier BS et al. Br J Sports Med 2023;57:1211–1220. https://pmc.ncbi.nlm.nih.gov/articles/PMC10579494/
26. Pancar et al. 2026, Sci Rep (Deload, Untrainierte). Registrierung: https://clinicaltrials.gov/study/NCT06825052
27. Bickel CS, Cross JM, Bamman MM. Med Sci Sports Exerc 2011;43(7):1177–1187 (Erhalt mit reduziertem Volumen).
28. Grgic J, Mikulic P, Podnar H, Pedisic Z. PeerJ 2017;5:e3695 (lineare vs. wellenförmige Periodisierung, Hypertrophie).
29. Rhea MR, Ball SD, Phillips WT, Burkett LN. J Strength Cond Res 2002;16(2):250–255 (wellenförmige Periodisierung, Kraft).
30. American College of Sports Medicine. Med Sci Sports Exerc 2009;41(3):687–708 (Position Stand Krafttraining).
31. Schoenfeld BJ, Grgic J, Ogborn D, Krieger JW. J Strength Cond Res 2017;31(12):3508–3523 (Last-Meta: niedrige vs. hohe Last).
32. Schoenfeld BJ, Grgic J, Van Every DW, Plotkin DL. Sports 2021;9(2):32 (Wiederholungs-Kontinuum: Kraft, Hypertrophie, Ausdauer).
