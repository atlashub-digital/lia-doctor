# LIA.DOCTOR — V1.2 · CASA EXPLORÁVEL + LIVRARIA IMERSIVA ESPELHOMEU

**Data:** 2026-10-28
**Branch:** `feat/lia-immersive-v12-livraria`, criada a partir de `feat/lia-immersive-v11-golden-room` @ `ab881ce` (PR #6). PR DRAFT próprio; sem merge, sem produção, proteções Vercel intactas.
**Writer:** Claude Code, único writer desta branch.

## 1. Mapa de rotas e estados

```
/                                   homepage produtiva — NÃO ALTERADA
/entrada                            pré-visualização da entrada cinematográfica (noindex)
   ├─ aproximação → revelação → chegada à LIA → "Entrar no átrio" ──► /experiencia
   ├─ "Saltar introdução" → estado final, foco no CTA
   └─ reduced motion / sem JS → composição final estática + CTA
/experiencia                        Átrio LIA (lobby canónico, hotspots, chat)  [PR #4]
   └─ porta EspelhoMeu (travessia 3D real) ──► /experiencia/espelho-meu
/experiencia/espelho-meu            Sala temática + Livraria (estante 3D + lista HTML)
   ├─ hover/foco num volume          destaque físico (o livro sai 10 cm da estante + luz de destaque)
   └─ clique (3D ou lista) / Enter ──► /experiencia/espelho-meu/<volume>
/experiencia/espelho-meu/<volume>   Livro apresentado + ficha editorial
   ├─ P01  "Comprar na Hotmart" ──► https://pay.hotmart.com/A108182228Y  (checkout direto)
   ├─ P02–P05  "Compra nesta loja em preparação" (sem link)
   ├─ ×, "Devolver à estante", Escape, Voltar ──► /experiencia/espelho-meu (livro regressa à estante)
   ├─ escolher outro volume com a ficha aberta: troca o volume sem nova entrada de histórico (replace)
   └─ refresh / link partilhado: abre já com o livro apresentado e a ficha
/espelho-meu                        coleção pública: "Entrar na Livraria EspelhoMeu" (antes: espelho.lia.doctor)
/espelho-meu/<volume>               ficha pública: P01 Hotmart; P02–P05 em preparação; "Ver na Livraria"
```

Estados do livro (atributo `data-book-state` no canvas, usado por testes e pelos caches de render): `shelf` → `moving` → `<slug>` → `moving` → `shelf`.

## 2. O que mudou

**Comércio (Missão 3)**
- `lib/offers.ts` (novo): catálogo central de ofertas, independente da geometria 3D. P01 `live` com checkout `https://pay.hotmart.com/A108182228Y` e hotlink `https://go.hotmart.com/A108182228Y?dp=1` (guardado, não usado). P02–P05 `pending`, sem URLs. Widget Hotmart preparado (`widget.enabled: false`), **não ativado**. Capas `pending-editorial`.
- `lib/catalog.ts`: removidos todos os `destination` para `espelho.lia.doctor` e `espelhoCollection`.
- `/espelho-meu` e `/espelho-meu/<volume>`: sem nenhum link para `espelho.lia.doctor`. `components/OfferAction.tsx` mostra "Comprar na Hotmart" só quando a oferta é `live`.
- Nada no código concede direitos de Reader ou ARO; a entrega das compras novas continua na Hotmart. A operação histórica em `espelho.lia.doctor` não foi tocada.

**Livraria (Missões 2 e 4)**
- Os cinco volumes oficiais estão de lombada para fora, juntos, na prateleira do meio, com título e referência na lombada (texto real do catálogo).
- Seleção por clique no livro 3D **ou** pela lista HTML (teclado, leitor de ecrã). GSAP: tira o livro da estante, traz-o até à câmara, roda para mostrar a capa e amplia; ao fechar faz o percurso inverso e o livro volta ao lugar. A câmara não se move; estado do livro, URL e interface vêm todos do mesmo `pathname`.
- Ficha editorial integrada: papel com textura, filete de cobre, Playfair, título, sinopse, "Inclui", coleção/referência/compra e CTA. Entra depois de o livro chegar. Em mobile é uma folha inferior própria, com o livro apresentado acima.
- Foco: abre no título da ficha; ao fechar regressa ao link do volume. Escape fecha (exceto se um diálogo modal estiver aberto).
- Rota `app/experiencia/[room]/[book]` (estática para os 5 volumes; 404 para os restantes e para outras salas).

**Desempenho / WebGL**
- Encontrado e corrigido: montar/desmontar luzes por hover/seleção mudava o número de luzes e **recompilava todos os shaders** (5,2 s medidos). Agora há uma única luz de destaque sempre montada que se desloca.
- Dentro da sala (câmara parada) os shadow maps só são recalculados quando a cena muda, e o reflexo do espelho só é re-renderizado quando a câmara se move ou um livro assenta.
- `gsap.ticker.lagSmoothing(0)`: animações acabam a horas mesmo com poucos frames. `PerformanceMonitor` baixa o DPR para 1 se o dispositivo não aguentar.
- Medido (SwiftShader, sem GPU): clique → início da animação 67 ms; livro apresentado em 1,35 s; regresso em 1,9 s.

**Entrada cinematográfica (Missão 1)**
- `/entrada` (`components/entry/CinematicEntry.tsx`): cortina "Um espaço seu." → aproximação às quatro portas (desfocado) → revelação da sala → chegada à LIA com as portas ao fundo → "Entrar no átrio". ~6 s. Composições próprias para desktop e mobile. "Saltar introdução" sempre disponível; movimento reduzido e sem JavaScript mostram a composição final. A LIA é a imagem canónica sem alterações.
- A homepage `/` não foi alterada.

## 3. Evidências

`docs/immersive/evidence/v12/` (gerado por `scripts/livraria-evidence.mjs`; resumo em `evidence-run.txt`):
- Entrada: `entry-{desktop,mobile}-{1..4}.png`; vídeos `video/entry-{desktop,mobile}.webm`.
- Livraria: `library-{desktop,mobile}-shelf.png`, `library-desktop-hover-p03.png`, `library-desktop-3d-hover.png` e `library-desktop-3d-click.png` (clique real na lombada 3D abriu P01), `library-{desktop,mobile}-p01-sheet.png`, `library-desktop-p02-pending.png`, `library-fallback-p01.png`; vídeos `video/library-{desktop,mobile}.webm`.
- Página pública: `public-p01-page.png`.
- Sem erros de página/consola em nenhuma corrida.

**Testes** (`tests/livraria.spec.ts`, 8 novos, mais os 7 do PR #4): catálogo de ofertas; seleção P01 com ficha, CTA Hotmart exato, Escape, foco de regresso, Avançar, refresh, Voltar; teclado e volume pendente; mobile sem overflow e axe; fallback sem WebGL + reduced motion com placa de capa; axe da ficha e 404 de volumes inválidos; páginas públicas sem `espelho.lia.doctor`; entrada com Saltar, reduced motion, noindex e axe.

## 4. Riscos e pendências

1. **Capas P01–P05**: continuam por transferir. O repositório é **público**, por isso não foram descarregadas nem commitadas. O livro mostra uma placa explícita "Capa oficial em homologação". Quando houver GO editorial: colocar os ficheiros aprovados num pipeline restrito, gerar WebP/AVIF e mudar `cover` para `{ status: 'approved', src, width, height }` em `lib/offers.ts`.
2. **Checkout P02–P05**: pendente de associação pela Direção.
3. **Copy editorial**: sinopses e "Inclui" vêm do catálogo existente (`description`/`details`). Não há preço, número de páginas nem formato porque não estão confirmados; a ficha mostra esse limite em vez de inventar.
4. **Entrada**: é um movimento de câmara 2D sobre a maquete achatada. A maquete tem UI desenhada (navegação, botões "Conhecer", balão de chat) que aqui não é clicável. Uma entrada verdadeiramente em camadas precisa de clean plate + recorte alfa da LIA alinhado (`hero-depth.md`).
5. **`/espelho-meu` público**: ao fazer merge, P02–P05 passam a mostrar "em preparação" em vez de enviar para `espelho.lia.doctor`. Isto é a decisão comercial pedida, mas é uma mudança visível em produção no merge.
6. **Desempenho em hardware real**: medido só em SwiftShader. Falta GPU real, iPhone/Android, Safari/Firefox, Web Vitals, leitor de ecrã e WCAG manual.

## 5. QA do 3D no preview real (28/10, deployment `dpl_C3sCh2jfWbWSDztBv8whUJoCMVsn`, commit `e05b212`)

Por GO da Direção: variável Vercel `NEXT_PUBLIC_LIA_IMMERSIVE_ENABLED=true`, alvo Preview, `gitBranch = feat/lia-immersive-v12-livraria` (não ativa em Production nem noutras branches; `vercel.json` inalterado). Redeploy do preview para aplicar a variável. Rollback: apagar a variável e fazer redeploy.
Acesso por link de partilha Vercel temporário (23 h), sem alterar a proteção do projeto; o link não está no repositório. Chrome for Testing 156 com SwiftShader.

| Verificação | Resultado |
|---|---|
| `/experiencia` | `data-mode=webgl` |
| Travessia real pela porta EspelhoMeu | `cameraZ = -2.8` |
| Seleção P01 pela lista | livro apresentado (estado `7-dias-para-me-escolher`) em ~2 s incluindo o Playwright; ficha visível |
| CTA | `https://pay.hotmart.com/A108182228Y` |
| Links para `espelho.lia.doctor` | 0 |
| Escape | volta a `/experiencia/espelho-meu`, livro na estante, foco no volume |
| Avançar / refresh / Voltar | reabre a ficha / mantém a seleção / regressa |
| Clique na lombada 3D | abriu P01 |
| Mobile 390 por deep link | WebGL, sem overflow |
| axe da ficha (1440 e 390) | 0 violações |
| P02 | sem botão de compra |
| Fallback sem WebGL + reduced motion | `data-mode=html`, ficha completa |
| `/entrada` | "Saltar" foca o CTA; reduced motion mostra o CTA; `noindex, nofollow` |
| `/`, `/espelho-meu`, P01, P02, `/me-sentir-leve`, `/corpo`, `/mente-e-calma`, `/privacidade` | 200; nenhum contém `espelho.lia.doctor` |
| Checkouts | P01 na página pública; Mounjaro `S108189606N` intacto |
| Erros de página, consola ou pedidos | nenhum |

Capturas: `evidence/v12/preview-library-shelf.png`, `preview-p01-sheet.png`, `preview-3d-click.png`, `preview-mobile-p01.png`, `preview-entrada-approach.png`, `preview-entrada-arrival.png`.
