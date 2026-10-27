# LIA.DOCTOR — IMMERSIVE V1.1 · G2 GOLDEN ROOM ESPELHOMEU · LOOK-DEV

**Data:** 2026-10-27
**Branch:** `feat/lia-immersive-v11-golden-room` (PR #6, DRAFT). Base `feat/lia-immersive-v1` @ `b744fa3`.
**Antecede:** `05_V11_S1_AUDIT_GOLDEN_ROOM.md` (G1 aprovado pela Direção, comentário de 27/10 no PR #6).
**Estado:** look-dev entregue para revisão G2. **Não é declaração de G2 aprovado.** Sem serviços pagos, sem merge, sem produção.

## 1. O que mudou face ao blockout

| Eixo (pedido da Direção) | Blockout `8bf76d6` | Look-dev G2 |
|---|---|---|
| Luz direcional do lado certo | point lights uniformes; sol do lobby entrava pelo teto aberto | janela arqueada na parede **esquerda** com cortina de linho; *spotlight* quente de fim de tarde é a única luz com sombra dentro da sala (sombras de folhas e caixilhos no chão). Paredes e teto projetam sombra, por isso o sol do lobby deixa de inundar a sala. As luzes do lobby baixam progressivamente quando a câmara passa `z < 0` (só para a EspelhoMeu) |
| Espelho | disco acetinado, sem reflexo | `Reflector` planar real (three.js) em vidro ligeiramente cobreado: reflete o arco, a mesa e a luz da sala. Aro em tubo de cobre contínuo, halo retroiluminado como na maquete. Frase textual mantida; nunca câmara do visitante |
| Materiais PBR | cores planas + ruído de gesso único | mapas procedurais deterministas: cal mineral (paredes), cal pêssego (arco), travertino em placas com juntas/poros/roughness (chão, mesa, rodapés), linho/bouclé (estofos, tapete, cortina), carvalho, cerâmica *clearcoat*, cobre metálico. Iluminação ambiente por *env map* (`RoomEnvironment` + PMREM) só nos materiais desta sala |
| Mobiliário | RoundedBox / cilindros | poltrona *tub* torneada em lathe aberta à frente; banqueta com almofada extrudida e rolo em cápsula; mesa de travertino de contorno orgânico com pé torneado; vasos em lathe; oliveira com 620 folhas instanciadas; raminhos de oliveira na mesa (em vez de flores inventadas) |
| Oclusão de ombreira | arco fino | arco interior com 0,45 m de espessura e chanfro, em cal pêssego, a enquadrar a chegada |
| Vista costeira | recorte de 168 px da maquete (desfocado) | plate pintado proceduralmente (céu, promontórios com perspetiva aérea, baía, sebe), sem texto e sem perda de resolução, 1,6 m atrás do vidro para manter paralaxe; caixilhos em cruz |
| Livros | blocos coloridos | volumes com tela de encadernação, miolo marfim e lombada de cobre. **Capas continuam em branco** (ver §4) |

Ficheiros: `components/immersive/rooms/EspelhoMeuRoom.tsx`, `components/immersive/rooms/espelho-materials.ts` (novo), `components/immersive/PortalScene.tsx` (`LightRig`), `components/immersive/experience.css` (contraste da frase do espelho). As outras três salas, a travessia, as rotas e o HTML não mudaram.

## 2. Comparação visual rigorosa

- `evidence/v11-g2/compare-maquete-blockout-g2.png` — A recorte do arco EspelhoMeu da maquete · B blockout · C look-dev (B e C com **o mesmo enquadramento**, câmara de chegada a 1440×900).
- `evidence/v11-g2/diff-blockout-vs-g2.png` — B | C | diferença absoluta (área 3D sem cartões).

Métricas `ffmpeg signalstats` (luma 0–255; área 3D 620×700 sem cartões; maquete = recorte do arco):

| | Luma mín. | Luma média | Luma máx. | Amplitude | Saturação média |
|---|---|---|---|---|---|
| A Maquete | 80 | 142 | 206 | 126 | 41,4 |
| B Blockout | 176 | 191 | 207 | 31 | 13,0 |
| C Look-dev G2 | 116 | 168 | 207 | 91 | 18,2 |

Leitura: a amplitude tonal triplicou e a sala ganhou luz direcional e materiais, mas **ainda é mais clara e muito menos saturada do que a maquete** (dourado intenso, flores, candeeiros, espelho redondo retroiluminado de parede). O fosso que resta é sobretudo de *grading* e de *set dressing* fotográfico, não de geometria.

## 3. Evidência técnica (local)

Chrome for Testing 156, WebGL por SwiftShader (software), `NEXT_PUBLIC_LIA_IMMERSIVE_ENABLED=true`, `next start`.

- `tsc --noEmit`, `next build`: OK.
- Playwright do PR #4: **7/7** (travessias com `cameraZ < 0`, histórico, deep links, mobile, fallback/reduced motion, chat, axe do lobby, overflow 360/768/1920, perda de contexto WebGL).
- axe na sala EspelhoMeu com volume focado: **0 violações** a 1440 e 390.
- `scripts/golden-room-shots.mjs`: sem erros de página/consola; sem overflow horizontal a 360/390. Capturas em `evidence/v11-g2/`: desktop 1280/1440/1920, foco por rato (P03) e teclado (P04), mobile 390 e 360, fallback sem WebGL + reduced motion.
- **G0:** `git diff origin/feat/lia-immersive-v1 -- app lib/catalog.ts lib/lia-proxy.ts vercel.json next.config.ts package.json package-lock.json` vazio. Nenhuma dependência nova (Reflector/RoomEnvironment vêm de `three/examples`).

**Custo de render — a medir em hardware real.** Em SwiftShader o teste das quatro travessias passou de ~25 s para ~58 s: reflexo planar (render extra da cena), *shadow map* do sol, mais luzes e ~650 instâncias. Mitigações já aplicadas: `frameloop="demand"`, reflexo 640×1280 (384×768 em mobile), DPR limitado como no V1. A seguir: medir FPS/INP em GPU real, desligar o `Reflector` quando a sala não está ativa e considerar *bake* de sombras.

## 4. Capas P01–P05

Localizadas na biblioteca privada **ESPELHOMEU EDITIONS — BIBLIOTECA UNICA** (Google Drive da conta AtlasHub): um ficheiro `04_CAPA_*` por pasta numerada P01–P05. P04 está marcada como "capa de referência"; P01 é JPG; P05 é a versão v1.3. Existem também versões arquivadas/antigas noutras pastas, que **não** devem ser usadas.

Conforme o GO: nenhum ficheiro foi descarregado, nenhum link/ID do Drive entra neste repositório público e não foi criada nenhuma substituição. Processo proposto:
1. A editorial confirma a versão final de cada capa (direitos/créditos, dimensão, correspondência ao PDF de distribuição; decidir P04).
2. Transferência autorizada dos 5 masters para um pipeline restrito (fora do repositório público).
3. Só depois do GO editorial: variantes WebP/AVIF 512 px e 1024 px, com manifesto (nome, versão, licença, dimensões, tamanho), aplicadas como `map` da face frontal de cada volume. O código já tem um material por volume, por isso a troca é local.

## 5. Preview 3D desta branch

- Variável Vercel `NEXT_PUBLIC_LIA_IMMERSIVE_ENABLED=true`, alvo **Preview**, `gitBranch = feat/lia-immersive-v11-golden-room` (projeto `lia-doctor`). Não está ativa em Production nem noutras branches.
- Precedência: o `buildCommand` do `vercel.json` só faz `export` na branch `feat/lia-immersive-v1`, por isso não sobrepõe a variável desta branch. `vercel.json` não foi alterado.
- **Rollback:** apagar a variável (ou pô-la a `false`) e fazer redeploy do preview; o código cai no fallback HTML.
- O preview continua protegido por Vercel Authentication; a proteção não foi alterada.

## 6. Orçamento de assets (proposta, nada gasto)

| Rota | O que entrega | Custo |
|---|---|---|
| A. Continuar procedural/modelação própria (atual) | grading mais quente, candeeiros e flores modelados, espelho redondo de parede alternativo para teste A/B | só tempo de engenharia |
| B. Biblioteca PBR licenciada CC0 (p. ex. scans de travertino, linho, carvalho) | texturas fotográficas reais 2K para 5–6 materiais | 0 € em licença; requer verificação de licença por ficheiro e ~3–6 MB extra (comprimido KTX2/WebP) |
| C. Geração paga (kie.ai), após autorização específica | 1 plate costeiro + 2 variações de *set dressing* como referência de look-dev; nunca capas, nunca a LIA | preço unitário a confirmar com `kie.mjs probe` antes de pedir autorização; estimativa de volume: 6–10 imagens fixas, sem vídeo |

Proposta de teste A/B: mesma câmara de chegada, B vs. C contra a maquete, com as métricas do §2 e revisão visual da Direção.

## 7. Ainda não aprovado / não verificado
- Paridade fotográfica com a maquete (ver §2): não atingida.
- Capas oficiais nos volumes: bloqueado pelo GO editorial.
- Safari/WebKit, Firefox, iPhone/Android reais, GPU modesta, leitor de ecrã, WCAG manual, Web Vitals: não testados.
- QA visual do 3D no URL de preview: depende do acesso autenticado ao preview (ver relatório no PR).
