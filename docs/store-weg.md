# Weg in die App Stores (Phase 3)

Stand der Recherche: 22.10.2026. Entwicklerin arbeitet auf Windows 11, kein Mac.

## Empfehlung

**Capacitor 8 + Codemagic (iOS-Build in der Cloud) + Android Studio lokal oder dieselbe CI.**

- Capacitor nimmt die Web-App (React, HTML/CSS) unverändert; Expo/React Native wäre ein Neubau ohne DOM.
- Capacitor braucht macOS nur für den iOS-Build, nicht für die Entwicklung. Codemagic: 500 kostenlose macOS-M2-Minuten pro Monat für Einzelkonten, eigene Capacitor-Vorlage, erzeugt Zertifikate/Profile selbst aus einem App-Store-Connect-API-Key und lädt zu TestFlight hoch. Ein Capacitor-iOS-Build dauert ~10–15 Minuten, also ~30 Builds/Monat frei.
- Rückfall: GitHub Actions. macOS-Runner sind in öffentlichen Repos kostenlos; private Repos haben 2.000 Minuten/Monat mit Faktor 10 für macOS (~200 macOS-Minuten), danach 0,062 USD/Minute. Braucht eine eigene fastlane/xcodebuild-Workflow-Datei und Zertifikate als Secrets.
- Ionic Appflow fällt weg (keine Neukunden seit Feb. 2025, Bestand bis 31.12.2027). Bitrise Hobby ist kostenlos, aber credit-basiert ("ein paar Builds pro Monat").
- Fixkosten: Apple Developer 99 USD/Jahr, Google Play 25 USD einmalig.

| Option | Kosten | Mac nötig | Aufwand | Anmerkung |
|---|---|---|---|---|
| Capacitor + Codemagic | 0 € CI (500 min/Monat) + 99 USD + 25 USD | nein | niedrig–mittel | Vorlage, Auto-Signatur, TestFlight-Upload eingebaut |
| Capacitor + GitHub Actions | öffentlich 0 €, privat ~200 macOS-min, dann 0,062 USD/min | nein | mittel–hoch | fastlane/xcodebuild-YAML selbst schreiben |
| Expo EAS | 15 iOS-Builds/Monat frei + 99 USD + 25 USD | nein | hoch | Neubau in React Native |
| Nur TWA (Android) | 25 USD | nein | minimal | kein iOS; 12-Tester-Regel gilt trotzdem |

## Fakten, die Design und Planung beeinflussen

1. **Capacitor 8** (8.12.2025): iOS 15+, Xcode 26+, Android minSdk 24, compile/target SDK 36, SPM als Standard. (Capacitor 7: iOS 14, minSdk 23, Xcode 16.)
2. **Apple Review 4.2 (Mindestfunktionalität):** "features, content, and UI that elevate it beyond a repackaged website". In der Praxis besteht ein Capacitor-Wrapper, wenn die App ein Werkzeug ist, komplett offline läuft (Reviewer testen Flugmodus), native Plugins nutzt (Haptik, lokale Benachrichtigung für den Pausentimer, Teilen/Export, Statusleiste/Safe Areas, Splash) und nie auf die Web-Version verlinkt. 4.2.6 (Vorlagen-Apps) ist die zweite Falle.
3. **TestFlight:** 100 interne, 10.000 externe Tester (erster externer Build braucht Beta-App-Review), Builds laufen nach 90 Tagen ab.
4. **Google Play:** TWA über Bubblewrap/PWABuilder funktioniert weiter (Packaging seit Okt. 2025 im PWABuilder-Hauptrepo; Bubblewrap 1.25). 25 USD einmalig, Ausweisprüfung. **Neue Privatkonten (ab 13.11.2023) müssen vor der Produktion einen geschlossenen Test mit ≥ 12 angemeldeten Testern über 14 Tage am Stück fahren.** Target API 36 (Android 16) ab 31.08.2026 Pflicht für neue Apps und Updates (Verlängerung bis 1.11.2026 möglich) – Capacitor 8 erfüllt das.
5. **Speicher auf iOS:** WebKit nimmt die Erstanbieter-Domain einer Home-Screen-Web-App von der 7-Tage-Löschregel aus. Capacitors WKWebView ist getrennt von Safari, aber Capacitor nennt localStorage/IndexedDB dort "transient" (iOS räumt bei wenig Speicher auf) → `@capacitor/preferences` (Kleinkram), `@capacitor-community/sqlite` (Trainingsverlauf), `@capacitor/filesystem` (Backup). iOS 26: jede zum Home-Screen hinzugefügte Seite öffnet standardmäßig als Web-App (Manifest optional); Push seit 16.4; kein Install-Prompt-API. EU: Home-Screen-Web-Apps seit iOS 17.4 wieder da (WebKit-only).
6. **Store-Pflichten für eine App ohne Server:** Beide Stores verlangen eine öffentliche Datenschutz-URL (Google: kein PDF) – auch bei null Datenerhebung. Apple: Label "Data Not Collected"; 5.1.1(v) Konto-Löschung nur bei Konten; 5.1.3 verbietet Fitnessdaten für Werbung. Google: Data-Safety-Formular (nichts erhoben/geteilt) + Health-Apps-Erklärung (Pflicht für alle Apps; "Activity and fitness" wählen). Kurzer Hinweis "vor dem Training ärztlich abklären", keine medizinischen oder Genauigkeits-Versprechen (1.4.1). Impressum (DE).
7. **PWA direkt im Store:** Nein. Apple braucht ein natives Binary; PWABuilders iOS-Ausgabe ist ein "experimenteller" WKWebView-Wrapper mit derselben 4.2-Prüfung. Google akzeptiert TWA-Wrapper.

## Quellen

- https://ionic.io/blog/announcing-capacitor-8 · https://capacitorjs.com/docs/updating/8-0 · https://capacitorjs.com/docs/updating/7-0 · https://capacitorjs.com/docs/getting-started/environment-setup · https://capacitorjs.com/docs/guides/storage
- https://docs.codemagic.io/billing/pricing/ · https://docs.codemagic.io/yaml-quick-start/building-an-ionic-app/
- https://docs.github.com/en/billing/concepts/product-billing/github-actions · https://docs.github.com/en/billing/reference/actions-runner-pricing
- https://ionic.io/blog/?p=6282 (Appflow-Ende) · https://www.bitrise.io/pricing
- https://expo.dev/pricing.md · https://docs.expo.dev/submit/testflight/
- https://developer.apple.com/app-store/review/guidelines/ · https://developer.apple.com/programs/whats-included/ · https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/ · https://www.apple.com/privacy/labels
- https://support.google.com/googleplay/android-developer/answer/14151465 (12 Tester / 14 Tage) · https://support.google.com/googleplay/android-developer/answer/6112435 (25 USD) · https://developer.android.com/google/play/requirements/target-sdk · https://support.google.com/googleplay/android-developer/answer/10787469 (Data Safety) · https://support.google.com/googleplay/android-developer/answer/14738291 (Health-Apps-Erklärung)
- https://webkit.org/tracking-prevention/ · https://webkit.org/blog/17333/webkit-features-in-safari-26-0/ · https://webkit.org/blog/16993/ · https://ionic.io/blog/is-apple-trying-to-kill-pwas
- https://github.com/pwa-builder/pwabuilder-google-play · https://github.com/GoogleChromeLabs/bubblewrap · https://blog.pwabuilder.com/posts/publish-your-pwa-to-the-ios-app-store/
- https://forum.ionicframework.com/t/app-store-rejection-4-2-design-minimum-functionality-my-first-after-2-years-of-ionic/200908
