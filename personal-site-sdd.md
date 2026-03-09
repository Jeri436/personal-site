1. Projektübersicht

Dieses Dokument beschreibt die Architektur und das Design einer persönlichen Portfolio-Website für einen Softwareentwickler. Der Fokus liegt auf einer modernen Benutzererfahrung durch performante Animationen und eine interaktive Projekt-Präsentation.
2. Tech-Stack

    Framework: Astro JS (Island Architecture)

    Styling: Tailwind CSS

    Animationen: Framer Motion oder GSAP (für das Scroll-Feature)

    Hosting: GitHub Pages via GitHub Actions

    Inhaltsverwaltung: Markdown / Content Collections (Astro)

3. Design-Beschreibung

  A high-contrast, Neo-Brutalist website layout inspired by 90s manga zines and underground fanzines. The color palette consists of vintage olive-drab, cream/parchment backgrounds, and deep charcoal borders, with bold red accents. The layout uses a thick-bordered grid system (3px black strokes) separating content sections.

Typography features massive, heavy-weight sans-serif headlines and bold Japanese Katakana characters. Navigation is styled as a horizontal row of uniform rectangular blocks with white text on black backgrounds. Include high-contrast black-and-white manga illustrations with visible halftone screen-tone textures. The overall vibe is industrial, structured, and 'analog-digital' hybrid."*


4. Kern-Feature: Interactive Scroll Showcase

Das Herzstück der Website ist der Übergang vom Hero-Bereich zur Projekt-Präsentation.
4.1 Der Ablauf (User Flow)

    Hero-Sektion: Ein statischer oder dezent animierter Einstieg mit Name, Titel und CTA.

    Scroll-Trigger: Sobald der User scrollt, wird die Hero-Sektion sanft ausgeblendet oder nach oben geschoben.

    Sticky Project Stack: * Die Projekte erscheinen nicht als einfache Liste, sondern "stapeln" sich oder gleiten ineinander über.

        Verhalten: Während der User scrollt, bleibt der Container fixiert (sticky), während die einzelnen Projekte nacheinander hereinzoomen, rotieren oder ihre Deckkraft ändern.

        Fortschrittsindikator: Ein dezenter Balken oder eine Anzeige visualisiert, bei welchem Projekt man sich gerade befindet.

4.2 Technische Umsetzung

Um die Performance hochzuhalten, nutzen wir in Astro eine Client-Island für diesen Bereich:

    Intersection Observer API: Um festzustellen, welches Projekt gerade im Viewport ist.

    Scroll-Driven Animations: Nutzung von Framer Motion useScroll und useTransform, um die Animation direkt an die Scroll-Position zu koppeln.

5. Systemarchitektur & Verzeichnisstruktur
Plaintext

/src
  /components
    /hero         # Hero-Sektion (statisch)
    /projects     # Die interaktive Scroll-Komponente (React/Preact Island)
    /ui           # Buttons, Icons, Cards
  /content
    /projects     # .md Dateien mit Projektdaten (Titel, Image, Tech-Stack)
  /layouts        # MainLayout.astro
  /pages          # index.astro (Zusammenführung aller Sektionen)

6. Funktionale Anforderungen

    Dynamic Loading: Projektdaten werden automatisch aus dem /content Ordner generiert.

    Smooth Scrolling: Implementierung von weichem Scroll-Verhalten (Lenis oder CSS scroll-behavior).

    Mobile Optimierung: Auf Mobilgeräten wird das komplexe Scroll-Feature zugunsten der Performance in eine einfachere, vertikale Liste umgewandelt.

7. Nicht-funktionale Anforderungen

    Ladezeit: First Contentful Paint (FCP) unter 1 Sekunde.

    Wartbarkeit: Neue Projekte müssen lediglich als Markdown-Datei hinzugefügt werden, ohne den Code anzupassen.

    Barrierefreiheit: Tastaturnavigation muss trotz Scroll-Animationen funktionieren (Focus Management).

8. Deployment & CI/CD

    Branch: main für die Entwicklung.

    Action: GitHub Pages Deploy Action triggert bei jedem Push.

    Environment: Node.js Umgebung für den Build-Prozess.