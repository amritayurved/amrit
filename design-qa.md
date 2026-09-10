# Design QA — Amrit Ayurveda Play More-style redesign

## Evidence

- Source visual truth: https://playmore.in/?utm_source=google&utm_medium=cpc&utm_campaign=brand
- Source capture: Cloud Browser, desktop home page, top-to-footer captures in the current conversation.
- Implementation: http://terminal.local:4173/#home
- Implementation capture: Cloud Browser, desktop home page and focused interaction captures in the current conversation.
- Viewport: 1363 × 936 CSS px, desktop, default density.
- State: signed-out public storefront; one-bottle course selected; cart empty; first carousel slide.
- Source page height observed: 4,872 CSS px.
- Implementation page height observed: 5,107 CSS px.

## Full-view comparison evidence

The source and implementation were captured at the same desktop viewport. The comparison covered the red offer ticker, sticky black header, two-column carousel/course hero, white price cards, red pill CTA, private-delivery strip, authenticity alert, black trust section, buyer guide, use guide, FAQ, customer-trust area, and footer.

The implementation follows the source composition and hierarchy while intentionally replacing Play More branding, imagery, product range, testimonials, and claims with Amrit Ayurveda content and the supplied TAKAT POWER X photography.

## Focused region comparison evidence

- Hero: source and implementation top-viewport captures compared for column proportions, heading hierarchy, product carousel, course cards, price treatment, and sticky CTA.
- FAQ: source and implementation FAQ captures compared for black/red treatment, gold heading, accordion borders, open state, spacing, and control behavior.
- Cart: source empty-cart drawer and implementation populated-cart drawer inspected for placement, overlay, close action, and checkout path.

## Findings

- [Resolved P2] TAKAT POWER X wrapped awkwardly above the fold.
  - Evidence: initial implementation capture split the final “X” onto its own line while the source keeps the brand phrase visually grouped.
  - Fix: reduced the display size and added a dedicated no-wrap desktop title line.
  - Post-fix evidence: later desktop hero capture shows “Original TAKAT POWER X” on one line and “African Herbs” below.

- [P3] Display and body fonts are close system substitutes rather than the source site’s Lora and Poppins files.
  - Impact: minor differences in letter width and optical weight remain.
  - Rationale: source font assets were not copied; the implementation uses Georgia and Trebuchet/Arial fallbacks.

- [Intentional] Source-specific logos, testimonials, product images, and medical-style claims were not copied.
  - The implementation uses Amrit Ayurveda branding, supplied product photography, conservative wellness copy, and a customer promise section.

## Responsive verification blocker

The Cloud Browser rendered and verified desktop at 1363 × 936. A true 390 × 844 source capture could not be produced because the browser does not expose viewport resizing and blocked the safe embedded mobile-frame capture under its URL policy. No alternate browser surface or policy workaround was used.

The implementation includes responsive navigation, stacked hero/course layout, single-column content cards, responsive footer, cart drawer, and mobile sticky buy controls, but source-to-implementation mobile visual comparison remains unverified.

## Primary interactions tested

- Carousel next/previous state and image change.
- Course selection updates price and selected state.
- Buy Now opens cart with correct quantity and total.
- Cart remove and close actions.
- FAQ navigation and accordion open state.
- WhatsApp checkout link contains the selected quantity and total.

## Console check

No implementation-page errors were observed. The only logged errors came from the Cloud Browser extension itself, not the site.

## Comparison history

1. Initial desktop comparison found the P2 hero-title wrap.
2. Typography sizing and line grouping were fixed.
3. Post-fix desktop hero, carousel, cart, and FAQ states were re-captured and rechecked.

## Follow-up polish

- Run the same source/implementation comparison at 390 × 844 once mobile source screenshots are available.

final result: blocked
