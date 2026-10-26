# LIA.DOCTOR — Sales Hub V1

Sales-first storefront for EspelhoMeu and Me Sentir Leve.

## Canonical architecture
- Repo: `atlashub-digital/lia-doctor`
- Public hostname: `https://lia.doctor` (DNS/Vercel needs separate operations validation).
- Framework: Next.js 16 / React 19 / TypeScript / simple CSS.
- Checkout & digital fulfillment: **Hotmart** for validated offers.
- Existing `espelho.lia.doctor`: **kept intact**, volume CTAs link to its existing purchase operation.
- LeveLab ARO, protected WebReader, own OTP and LIA conversational service: **no dependency**.
- No health data, no client-side analytics by default, no speculative testimonials or discounts.

## Active routes
- `/`: collection hub
- `/me-sentir-leve`: MSL catalog
- `/me-sentir-leve/tomei-mounjaro-e-agora`: commercial landing + real Hotmart widget + fallback
- `/me-sentir-leve/corpo-forte`: landing, checkout gated until Hotmart product + PDF pair verified
- `/espelho-meu`: five volumes plus existing collection
- `/espelho-meu/[slug]`: collection volume landing linked to existing canonical commercial page
- `/privacidade`, `/robots.txt`, `/sitemap.xml`

## Run
```bash
npm install
npm run typecheck
npm run build
npm run dev
```

## Commercial gates / product registry
- MSL001 checkout is `https://pay.hotmart.com/S108189606N?checkoutMode=2`. Its presence was publicly verified. US-localized browsing displayed USD; **Brazilian BRL price / Pix / final fulfillment still require a localized real checkout check** before announcing numbers.
- MSL002+MSL003: **no real Hotmart offer URL has been validated**, so this page has no active purchase button.
- EspelhoMeu P01–P05: links lead to the existing `espelho.lia.doctor` pages, which still own sales and old customers. **Do not claim they are Hotmart offers until migrated individually.**
- Força na Caneta: **NAO_PUBLICAR**, excluded from public routes and navigation.
- The exact cover assets of the canonical manuscripts should replace the illustrative CSS book mockups in a visual polish sprint.
- The site itself does not collect leads at this stage; later lead forms must be backed by a consent-aware AtlasHub endpoint, anti-abuse validation and unsubscribe handling.

## Go-live requirements
1. Vercel project in the correct AtlasHub team, root directory `./`, framework Next.js, production `main`.
2. DNS/HTTPS for `lia.doctor` resolves to the intended Vercel project; retain `espelho.lia.doctor` unchanged.
3. Build + mobile QA at 390 and 1440 px.
4. Test Hotmart widget/modal and direct-link fallback on Chrome/Safari; check actual BRL value and purchased PDF fulfillment in Hotmart.
5. Verify accessibility, no fake promotions/claims, product privacy notices.
6. Lead capture not to be enabled without its own signed-off service and privacy notices.
