# LIA.DOCTOR — IMMERSIVE V1.1 · S1 AUDITORIA + BLOCKOUT GOLDEN ROOM (ESPELHOMEU)

**Data:** 2026-10-27
**Branch:** `feat/lia-immersive-v11-golden-room` (a partir de `feat/lia-immersive-v1` @ `b744fa3`)
**Estado:** S1 concluído como proposta para G1 (Direction); blockout da EspelhoMeu implementado. Sem assets pagos, sem merge, sem deploy.
**Fontes:** `04_SCROLLCRAFT_INTERIORS_V11.md` (PR #5), `public/immersive/lia-canonical.png`, `docs/immersive/evidence/desktop-room-*.png` (PR #4), skill Scrollcraft 0.3.1 (`SKILL.md`, `hero-depth.md`, `approved-collection.md`, `uniqueness.md`, `feel.md`, `devices.md`).

## 1. Auditoria: maquete vs. salas V1

O que a maquete promete através do arco EspelhoMeu (recorte ~700–900 × 300–500 px): espelho redondo **retroiluminado** com halo quente, estantes cheias dos dois lados, sofá/poltronas rosé, flores, uma janela larga com a baía e o morro ao fundo, chão de pedra clara com reflexo, luz de fim de tarde.

| Eixo | Maquete (lobby) | V1 EspelhoMeu (`desktop-room-espelho-meu.png`) | Gap | Ação S2 |
|---|---|---|---|---|
| Perspetiva | olho ~1,6 m, 28–35 mm, profundidade longa | câmara a 1,65 m, FOV 43°, sala 4,3 × 10 m vista de frente | coerente em altura; sala parece caixa de sapatos (3 paredes planas) | partir a caixa: arco interior, nichos, janela, profundidade em 3 planos |
| Paleta | pêssego/marfim/latão, verde folhagem | pêssego chapado em toda a parede do fundo | sem contraste de valores; sem verde | marfim/calcário nas paredes, pêssego reservado a arco e estofos, verde nas plantas |
| Luz | sol rasante da esquerda, halos quentes | luz uniforme + point light central | sem direção, sem sombras longas | key quente pela janela esquerda, halo no espelho, rim nos nichos |
| Espelho | redondo/oval retroiluminado, reflexo claro | disco metálico **escuro** (metal sem env map) | lê-se como taça/buraco | vidro acetinado claro + halo de cobre; reflexo real fica para S2-final |
| Mobiliário | sofá estofado, mesas de pedra, flores | poltrona de RoundedBox, mesa-cilindro, planta de esferas | denuncia o procedural | banco estofado longo, mesa orgânica em pedra, vaso cerâmico com flores (blockout ainda procedural, mas à escala e com função) |
| Livros | protagonistas, capas reais | 4 caixas coloridas repetidas por prateleira | sem hierarquia, sem conteúdo real | *biblioteca viva*: 5 volumes EspelhoMeu reais em nichos, frente para a câmara, ligados a HTML |
| Fundo | vista costeira | sem janela (outras salas usam recorte do lobby) | perde o universo | janela arqueada com plate costeiro (recorte do master como placeholder do plate #7) |
| Escala | humana, vivida | objetos flutuam sem rodapé/contacto | | rodapés, plinto, tapete, contact shadows |
| Marca/texto | HTML/SVG | HTML | ok | manter; capas **não** inventadas |

Diferenças que **não** se resolvem sem assets (ver §5): fotorealismo de materiais (texturas PBR reais), capas oficiais, reflexo fisicamente plausível, plantas com translucidez.

## 2. Planta esquemática e câmara

Unidades = metros do mundo R3F. Lobby em `z ≥ 0`, salas em `z < 0`. Centros das portas `x = −6,6 / −2,2 / 2,2 / 6,6` (inalterados). HOME `(0,4; 2,45; 11,7)`, FOV 43°.

```
                 z = −10  ┌───────────── parede do fundo ──────────────┐
                          │ [ESPELHO]    [NICHO BIBLIOTECA]   [JANELA]  │
                 z = −9   │  oval 2,1m    5 volumes, 3 níveis   costa    │
                          │                                     ▢ vaso  │
                 z = −7,5 │          (tapete)        [BANCO]─────┐      │
          janela ◁ luz    │                 [MESA PEDRA]         │      │
          (esq., key)     │                                       │      │
                 z = −5   ├──╮     ARCO INTERIOR (pêssego)    ╭──┤      │  ← primeiro plano / oclusão
                          │  │                                │  │
                 z = −2,8 │        ● câmara (x=−6,6; y=1,65) olha para z=−9
                 z = 0    └──┘══════ porta/ombreira do lobby ═══└──┘
                    x = −8,75 (−2,15)                   x = −4,45 (+2,15)
```

- **Travessia:** inalterada (GSAP, `cameraZ < 0`, porta roda −1,65 rad). Testes Playwright do PR #4 continuam a validar o contrato.
- **Arco interior a z = −5:** à distância 2,2 m da câmara de chegada; o vão interior (raio 1,25, arranque 2,2 m) deixa as ombreiras e os ombros do arco visíveis nos cantos — oclusão real sem tapar a copy HTML.
- **Espelho a x ≈ −1,15 (local), z = −9,1:** cai a ~35 % da largura do ecrã em 16:10, à direita do cartão de copy (que ocupa 4,5 %–31 %).

## 3. Layer contract — EspelhoMeu

| Plano | Asset (blockout → final) | Movimento | Regra de contacto/oclusão |
|---|---|---|---|
| Fundo real | janela arqueada + plate costeiro (recorte master → plate #7 dedicado) | parado; parallax ≤ 2 % só se houver scroll | horizonte à altura dos olhos da maquete |
| Arquitetura | parede calcário, nicho biblioteca, rodapés (procedural → GLB room shell #5) | parada | nicho embutido, sem objetos a flutuar |
| Plano de ação | espelho oval, 5 volumes, banco, mesa de pedra, vaso (procedural → set dressing #6) | volume focado avança 0,14 m e roda 0,22 rad (GSAP, 0,45 s) | livros apoiados em prateleira; móveis no chão com contact shadow |
| Primeiro plano | arco interior pêssego (procedural → módulo arco GLB #4) | parado | enquadra; nunca cobre copy nem CTA |
| Atmosfera | luz quente pela janela esquerda, halo do espelho | estática (frameloop `demand`) | sem partículas |
| Tipografia/controlos | HTML: cartão da sala, *biblioteca viva*, reflexão do espelho | fade 200 ms | sempre legível; mesmo conteúdo sem WebGL |

## 4. Decisão de grammar (Scrollcraft `uniqueness.md`)

O PR #5 propõe *chaptered editorial*. Pela skill essa grammar **proíbe** media acima da dobra (hero = página de título), `spotlight` e `magnet`, e não admite misturas. O lobby fotográfico com portas é exatamente media acima da dobra, portanto a proposta viola a própria grammar.

**Proposta para G1:** grammar nova, nomeada com restrições próprias (permitido em `SKILL.md` Step 2 quando nav, sequência, fecho e bans diferem):

**Casa explorável (hub & rooms)**
- *Nav:* as próprias portas/hotspots do lobby são o índice; dentro da sala, *switcher* de salas + "Voltar ao lobby". Nada de barra de marketing nova.
- *Hero:* posição de estabelecimento dentro da casa (a maquete canónica), já interativa.
- *Sequência:* clique/Enter → travessia 3D real → sala-destino (rota). O scroll **nunca** move a câmara R3F.
- *Dentro da sala:* curto (≤ 2–3 vh), esquema de etiqueta de museu para os livros (eyebrow · título · descrição · detalhes) — empresta a disciplina do *gallery/catalog*.
- *Fecho:* chegada a um objeto da sala (livro/CTA real), não um rodapé.
- *Bans:* `scrub` (não há footage próprio), `kinetic`, `magnet`, `spotlight` decorativo, voo de câmara contínuo por scroll, contadores numéricos.
- *Signature move:* **a lombada que se adianta** — focar/hover num volume no HTML puxa o mesmo volume para fora do nicho em 3D e abre a etiqueta; o espelho devolve uma frase, nunca uma imagem do visitante.

**Registo de fingerprints:** `/root/tools/scrollcraft/FINGERPRINTS.md` está vazio → gate trivialmente aprovado. A linha só é registada depois do GO visual.

**Exceção de marca a registar:** `taste.md` desaconselha a paleta "cream-and-brass artisan" como default. Aqui é paleta de marca aprovada (maquete + manifesto), não default; mantém-se.

**Scrollcraft engine (`scrollcraft.js/css`) não entra no S1/S2.** A Golden Room não precisa de scroll-driven; integrar o motor agora só criaria um segundo controlador. Entra no S4 confinado a `/experiencia`, conforme §4 do doc V1.1.

## 5. Matriz de assets e bloqueios

| # | Asset | Estado | Bloqueio |
|---|---|---|---|
| 1 | Lobby clean plate | em falta | geração/retoque (kie.ai ou fotógrafo) |
| 2 | LIA cutout desktop | V1 tem `lia-cutout.png` (mobile) | avaliar alfa desktop |
| 4 | Módulo arco/porta GLB | procedural | modelação 3D |
| 5 | Room shell EspelhoMeu GLB | **blockout procedural (este commit)** | look-dev sobre este blockout |
| 6 | Set dressing (espelho, banco, mesa, vaso, flores) | blockout | modelação ou kit licenciado |
| 7 | Plate costeiro da janela | recorte do master (placeholder) | geração com o preamble único do doc V1.1 |
| 8 | **Capas oficiais P01–P05** | **não existem no repositório** | fornecer ficheiros aprovados (alta resolução) |
| — | `KIE_AI_API_KEY` | ausente | necessária só se a Direção autorizar geração paga |

Até as capas existirem, os volumes 3D mostram blocos de cor da coleção **sem título nem arte** (nada inventado); o título real vive no HTML.

## 6. Gates

- **G0 Preserve:** `git diff origin/feat/lia-immersive-v1 -- app lib/catalog.ts lib/lia-proxy.ts vercel.json next.config.ts package.json package-lock.json` = vazio. Nenhuma dependência nova.
- **G1 Direction:** este documento + capturas do blockout. Requer decisão da Direção sobre a grammar (§4) e sobre geração de assets (§5).
- **G2 Golden Room:** não pode ser declarado com blockout procedural; precisa de §5 #5–#8.

## 7. Blockout entregue (S2 parcial)

**Código**
- `components/immersive/scene-kit.tsx` — arcos, gesso, planta e cadeira partilhados (extraídos de `PortalScene`). `archFrame` aceita base/raio; com os valores por defeito a geometria das molduras do lobby é idêntica.
- `components/immersive/rooms/EspelhoMeuRoom.tsx` — interior da Galeria do Reflexo: arco interior pêssego (primeiro plano), espelho oval em pé com aro cobre e frase textual, nicho-biblioteca com os 5 volumes do catálogo, janela arqueada com vista costeira, banco estofado, mesa orgânica em pedra com vaso, tapete, rodapés, teto, cortina luminosa como fonte de luz.
- `PortalScene.tsx` — `Room` passa a ser só moldura + porta; o interior é escolhido por sala. As outras três salas usam `LegacyInterior`, que é o código V1 sem alterações.
- `Experience.tsx` + `experience.css` — `LivingLibrary`: gémeo HTML da estante (links reais para `/espelho-meu/<slug>`, etiqueta eyebrow/descrição/detalhes do catálogo). Hover/foco puxa o mesmo volume para fora do nicho em 3D (GSAP 0,5 s, `frameloop="demand"`). Sem WebGL ou em mobile a frase do espelho aparece no cartão.
- `scripts/golden-room-shots.mjs` — captura reprodutível das evidências abaixo.

**Verificação local (Chrome for Testing 156, SwiftShader, `NEXT_PUBLIC_LIA_IMMERSIVE_ENABLED=true`)**
- `tsc --noEmit` e `next build` OK.
- Playwright do PR #4: 7/7 passam (travessias com `cameraZ < 0`, histórico, mobile, fallback, chat, axe do lobby, overflow, context loss).
- axe na sala EspelhoMeu com um volume focado: 0 violações a 1440 e 390.
- Capturas sem erros de página/consola: `evidence/v11/espelho-desktop-1440-arrival.png`, `-focus-p03.png`, `-keyboard-p04.png`, `-1280.png`, `-1920.png`, `espelho-mobile-390.png`, `espelho-mobile-360.png`, `espelho-fallback-reduced.png`. Sem overflow horizontal a 360/390.

**Limites honestos**
- É um blockout: materiais procedurais e cores planas, contraste de valores ainda baixo (sala muito clara). Não atinge fotorealismo e **não** cumpre G2.
- Os volumes não têm capa (por regra). A janela usa um recorte do master como placeholder do plate #7.
- O espelho é vidro acetinado, sem reflexo real.
- Não testado: Safari/WebKit, Firefox, hardware real, leitor de ecrã, Web Vitals.
- `vercel.json` só ativa o 3D em preview na branch `feat/lia-immersive-v1`; um preview desta branch mostraria o fallback HTML até a Direção decidir alargar a regra.

## 8. Decisões pedidas à Direção (G1)
1. Aprovar a grammar *Casa explorável* (§4) ou manter *chaptered editorial* aceitando a exceção.
2. Fornecer as capas oficiais P01–P05.
3. Autorizar (ou não) geração paga de plates/room shell com o preamble único; alternativa: modelação/fotografia própria.
