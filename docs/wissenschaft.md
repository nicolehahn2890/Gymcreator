# Trainingswissenschaftliche Grundlage

Stand der Recherche: 22.10.2026. Diese Datei begründet die Zahlen in `data/goals.json` (Slot-Pools, Grenzen) und die Regeln des Generators. Wo die Evidenz dünn ist, steht das dabei – die App verspricht nichts, was die Studienlage nicht hergibt.

## Regeln des Generators und ihre Evidenz

| Parameter | Regel in Gymcreator | Evidenz (Kurzform) |
|---|---|---|
| Wochenvolumen je Muskel | Anteilig gezählt (Hauptmuskel 1, Mitarbeit 0,5). Prio 3: 12–16 Sätze, Prio 2: 8–10, Prio 1: 4–6, Prio 0: nur indirekt. Mindestdosis ~4 | Dosis-Wirkung mit abnehmendem Grenznutzen: Schoenfeld 2017 (10+ > <5 Sätze/Woche, ~0,37 %/Satz), Baz-Valle 2022 (12–20 optimal), Pelland et al., Sports Med 2026 (log-linear; Kraft plateaut bei 3–4 Sätzen/Woche) |
| Obergrenze pro Einheit | max. 11 anteilige Sätze je Muskel und Einheit (harte Grenze in `limits`), Warnung ab 20 Sätzen je Einheit, Fehler ab 25 | Remmert et al. 2025 (SportRxiv-Preprint, nicht begutachtet): ab ~11 anteiligen Sätzen pro Einheit kein Zusatznutzen |
| Volumen-Steigerung | Konservativ: Auto-Zusatzsatz +1 nach 3 stagnierenden Wochen, max. 5 Sätze je Zeile (Peach-Regel). Kein aggressives Hochfahren | Enes 2024 (MSSE 56(3):553–563): +4/+6 Sätze alle 2 Wochen brachte Kraft, Hypertrophie-Unterschied nicht signifikant (p = 0,067); Autoregulation des Volumens ≈ festes Volumen (Remmert, Preprint) |
| Frequenz | Prio-3-Kategorien ≥ 2× pro Woche (`minFrequencyPrio3`) – vor allem, um die Einheiten-Grenze einzuhalten | Schoenfeld 2016 (2× > 1×, meist nicht volumen-gleich), Schoenfeld 2019 (bei gleichem Volumen kein Effekt), Pelland 2026 (vernachlässigbar für Hypertrophie) |
| Wdh.-Bereiche | 4–8 nur Fortgeschrittene (schwere Grundübung), 6–10, 8–12, 12–15 (Pump/Isolation) | Hypertrophie über ~5–30 Wdh. gleich, wenn nah am Versagen (Lopez 2021, Schoenfeld 2021); Kraft braucht schwere Last |
| Intensität | 0–3 Wdh. in Reserve, schwere Grundübung 2–4. Hinweis im Onboarding, kein Pflichtfeld | Robinson 2024 (näher am Versagen = etwas mehr Hypertrophie, Kraft unverändert), Refalo 2023 (Versagen vs. nicht: ES 0,19, trivial) |
| Übungsauswahl (Stern) | **Stretch-Bias**: Last in der gedehnten Position bevorzugt (sitzender Beinbeuger, RDL, Überzug, Schrägbank-Flys, Kabel-Seitheben, Überkopf-Trizeps, Preacher Curls). Volle Bewegung; keine "Partials only" | Maeo 2021 (sitzender > liegender Beinbeuger, ~14 % vs. ~9 %), Pedrosa 2022, Kassiano 2023, Maeo 2023 (Trizeps Überkopf ~1,4×), Wolf 2023 Meta (voll vs. partial trivial), Wolf 2025 RCT (Trainierte: lange Partials = volle ROM), Strey 2026 Meta (lange > kurze Partials, ES 0,28) |
| Po | Hip Thrust **und** tiefe kniedominante Übung: gleich gut für Glute Max, tiefe Kniebeuge zusätzlich für Adduktoren. Glute Med wächst durch Grundübungen nicht → direkte Abduktion. Adduktor magnus ist Hüftstrecker → eigene Kategorie | Plotkin 2023 (HT = SQ für Glute Max; SQ > HT für Quads/Adduktoren; Glute Med/Min ~kein Wachstum bei beiden), Kubo 2019 (tiefe vs. halbe Kniebeuge: Glute Max +6,7 % vs. +2,2 %, Adduktoren +6,2 % vs. +2,7 %). **Keine Hypertrophie-Studie zu Glute-Med-Abduktion** – Annahme aus Anatomie/EMG |
| V-Form / Taille | Seitheben für Schulterbreite (belegt), vertikaler Zug für Lat (EMG-basiert). "Keine schweren Seitbeugen" ist Praxis-Vorsicht, keine Studienlage. Taille ist vor allem Körperfett | Larsen 2025 (Seitheben +3–5 % in 8 Wochen). Oblique-Training → dickere Taille: **kein Trial** |
| Regionen | Schrägbank für obere Brust, Überkopf-Strecken für langen Trizepskopf, Preacher Curls für distalen Bizeps – als Sterne/Fokus-Hinweise hinterlegt | Chaves 2020 (Schrägbank, klein, Untrainierte), Maeo 2023, Pedrosa 2023, Kassiano 2025 |
| Progression | Doppelte Progression: Obergrenze im 1. Satz erreicht → nächstes Mal mehr Gewicht | Last- ≈ Wdh.-Progression (Plotkin 2022); kein RCT zur doppelten Progression selbst; Autoregulation ≈ fest (Greig 2021, Larsen 2021) |
| Deload | Standard: keine. Opt-in in den Einstellungen | Coleman 2024 (n = 39 Trainierte, 9 Wochen: Hypertrophie gleich, Kraft eher ohne Deload-Woche), Pancar 2026 (Untrainierte: kein Unterschied) |
| Einsteiger | Alle Slots 2 Sätze, Bereiche ab 6–10, Kategorien mit ≥ 3 Slots verlieren den letzten (≈ 0,7–0,8× Volumen), Maschinen bevorzugt | Currier 2023 (BJSM: mehrere Sätze > ein Satz, jede Last wächst), Lopez 2021 (Untrainierte reagieren auf jede Last) |
| Zyklus | 12 Wochen, Woche 1 leichter Einstieg ohne Vergleich, unbegrenzt viele Zyklen | Praxis (Peach), keine Studienfrage |

## Korrekturen und Vorbehalte aus der Recherche

- Pelland et al. ist seit Dez. 2025 begutachtet (Sports Med 2026;56(2):481–505). Die Zahlen "4 Sätze Minimum / ~31 Sätze Obergrenze" stammen aus dem Preprint 2024 und Sekundärquellen, nicht aus dem Endtext.
- Remmert (Grenze pro Einheit) und die Volumen-Autoregulation sind Preprints.
- Lange Partials sind vor allem bei Untrainierten und Einzelgelenk-Übungen überlegen; bei Trainierten gleich volle ROM. Deshalb "Stretch-Bias", nicht "Partials".
- Glute-Med-Abduktion und Oblique/Taille beruhen auf Anatomie/EMG, nicht auf Hypertrophie-Studien.
- Doppelte Progression hat keinen eigenen RCT; sie ist die praktikable Umsetzung der belegten Gleichwertigkeit von Last- und Wdh.-Progression.

## Verifizierte Volumen je Ziel (4 Tage, Fortgeschritten, Sätze/Woche aus `data/`)

| Kategorie | Peach | Sanduhr | V-Form |
|---|---|---|---|
| Glute Max | 15 | 12 | 3 |
| Glute Med | 10 | 8 | 0 |
| Glute & Quad | 5 | 6 | 3 |
| Glute & Hams | 7 | 6 | 3 |
| Beinbeuger | 3 | 3 | 3 |
| Beinstrecker | 2 | 3 | 3 |
| Adduktoren | 4 | 4 | 0 |
| Rücken | 7 | 9 | 14 |
| Schultern | 7 | 7 | 13 |
| Brust | 2 | 3 | 10 |
| Bizeps | 0 (indirekt) | 2 | 5 |
| Trizeps | 0 (indirekt) | 2 | 5 |
| Waden | 0 | 0 | 4 |
| Bauch | 8 | 6 | 6 |
| **Summe** | **70** | **71** | **72** |

3 Tage: Peach 62, Sanduhr 62, V-Form 61. 5 Tage: Peach 72, Sanduhr 73, V-Form 77. Die Peach-Spalte ist exakt der 4-Tage-Plan P4 (3 Tage = P3) aus der Trainingsapp, per Skript gegengeprüft.

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
