# LIA.DOCTOR — IMMERSIVE V1.1 | DIREÇÃO ARTÍSTICA DOS QUATRO INTERIORES + SCROLLCRAFT
**Data:** 2026-10-27  
**Estado:** proposta de direção artística e implementação; não aprovada para produção  
**Repositório canónico:** \`atlashub-digital/lia-doctor\`  
**Base de engenharia:** PR #4 \`feat/lia-immersive-v1\` (preservar código e provas existentes)  
**Rota de homologação:** \`/experiencia\` (não alterar \`/\` até GO)  
**Referência visual imutável:** \`public/immersive/lia-canonical.png\` + manifesto \`docs/immersive/02_SCENE_MANIFEST.json\`.  
**Referência metodológica:** \`nateherkai/scroll-craft\`, licença MIT; preservar LICENSE se incluir cópias do motor.

## 0. GOAL & LIMITS
Transformar a visita demonstrativa com quatro portas numa experiência premium coerente e navegável. Preservar a fachada mediterrânica, luz dourada, quatro arcos na mesma ordem, LIA oficial, três livros e banda de comunidade. A qualidade procurada é **fotorealismo arquitetónico**, não miniatura, videojogo ou cenário procedural evidente.

O PR #4 JÁ TEM: First frame, hotspots, four doors, passagem real da câmara, rotas, mobile, fallback HTML, chat proxy e testes locais. **Não refazer**. O maior défice é a continuidade entre a fotografia do lobby e as salas interiores: paredes planas, cadeiras/cilindros/esferas/plantas procedurais e texturas reutilizadas denunciam o corte. Substituir cenário com art direction, geometria arquitetónica mais credível, materiais/texturas, enquadramentos e asset pipeline. Separar função de cena, estado de navegação e conteúdo.

**Não tocar:** homepage \`/\` em produção, Hotmart, \`lib/catalog.ts\`, ARO, WebReader LeveLab, \`espelho.lia.doctor\`, DNS ou direitos de acesso. Produtos não validados mantêm gates e CTAs existentes. \`Força na Caneta\` = NAO_PUBLICAR neste site; não incluir como produto de compra ou acesso. A LIA é assistente virtual educativa, não profissional de saúde; não prometer intervenções clínicas ou resultados.

## 1. ONE BUILDING, FOUR ATMOSPHERES
### Architectural continuity contract
O utilizador entra sempre na **mesma casa**: terraço/sala de acolhimento mediterrânica com mar e montanhas ao fundo, acabamentos de calcário/travertino bege, estuque mineral, soalhos naturais, latão envelhecido, vegetação viva, mobiliário tátil e luz solar de fim de tarde. Os corredores e vistas através das portas têm de coincidir geometricamente com as quatro aberturas do lobby. Não inventar janelas com perspetiva incompatível nem reposicionar os arcos.

**Shared invariants:**
- Portas da esquerda para a direita: EspelhoMeu, Me Sentir Leve, Corpo, Mente & Calma.
- Pés direitos, espessura das ombreiras, largura da soleira, direção de sol, tonalidade do chão e linha de horizonte coerentes.
- 3 planos por sala: **primeiro plano** (arco/ombreira e objeto de oclusão), **plano de ação** (mobiliário/objeto interativo), **fundo real** (janela/galeria/estante com profundidade).
- Matéria PBR plausível: estuque mineral roughness ~0.82–0.96, travertino ~0.55–0.78, madeira natural ~0.55–0.78, metais escovados ~0.22–0.45; números apenas diretrizes artísticas para calibrar à exposição.
- Contact shadow de todos os móveis, rodapés e encontros; bevels discretos nas bordas; imperfeições naturais leves. Evitar espelhos artificiais com reflexo incoerente.
- Movimento ambiental discreto: folhas e sombras suavíssimas, nunca uma chuva de partículas nem objetos a flutuar.
- Texto, preços, títulos, botões e marcas são HTML/SVG e assets oficiais, **não texto gerado numa textura de IA**.
- A personagem LIA aparece com a identidade aprovada no lobby e, se entrar numa sala, apenas mediante assets consistentes. Preferir presença por chat/voz em overlay a inventar novas poses de uma mulher diferente.

### Camera and continuity
Base atual: portas extrudidas com animação GSAP e câmara que atravessa \`z=0\`. Preservar esse contrato testado. Criar uma zona de transição curta com oclusão real pela ombreira/folha da porta, luz compatível, e passagem para o interior com **shot matching**; nunca trocar subitamente o lobby fotográfico por um quarto estilizado. Se não for possível igualar a perspetiva, usar reveal arquitetónico deliberado de 300–600 ms em vez de falso plano contínuo. Manter o clique/Enter do visitante como iniciador da travessia.

## 2. FOUR ROOM BIBLES

### A. ESPELHOMEU — "GALERIA DO REFLEXO"
**Intenção emocional:** reconhecimento, acolhimento, beleza real, autoexpressão. Não é clínica, salão de estética nem cenário rosa genérico.  
**Paleta:** pêssego queimado \`#EEC9B5\`, rosé suave \`#D8AA9C\`, marfim \`#FBF8F0\`, cobre escovado \`#B77B5A\`, verde de folhagem como contraste.  
**Luz:** sol dourado filtrado por cortinas finas; key lateral suave, reflexo quente no aro do espelho, sombras cremosas.  
**Arquitetura:** entrada por arco pêssego, parede de estuque cor calcário, espelho oval alto com aro fino em cobre e reflexo fisicamente plausível, nichos curvos para livros, banco estofado, mesa orgânica em pedra clara, vaso cerâmico e flores discretas. Uma janela/porta secundária conserva vista costeira do universo principal.  
**Composição ao chegar:** a ombreira pêssego em primeiro plano, espelho/reflexo à esquerda e *biblioteca viva* central. Os livros oficiais são os protagonistas: P01 "7 Dias Para Me Escolher", P02 "Eu Sou Bela Do Meu Jeito", P03 "21 Dias: Meu Melhor Reflexo", P04 "Recomeçar Depois dos 40", P05 "Diário de Amor-Próprio". Não inventar capas.  
**Interação assinatura:** hover/foco abre suavemente uma lombada e apresenta título/descrição real num cartão HTML acessível; clique abre a rota EspelhoMeu adequada. No espelho surge uma reflexão **textual** "Há espaço para me reconhecer", nunca análise visual do rosto, câmara de selfie ou scoring da beleza.  
**Desfecho:** CTA "Explorar EspelhoMeu" → \`/espelho-meu\`. Preservar checkout e páginas da coleção existentes.

### B. ME SENTIR LEVE — "JARDIM DA LEVEZA"
**Intenção emocional:** clareza, autonomia informada, segurança, continuidade, suavidade.  
**Paleta:** verde oliva \`#244C39\`, sálvia \`#9DAF91\`, marfim \`#FBF8F0\`, pedra \`#E5D7C0\`, dourado discreto \`#B79A5B\`.  
**Luz:** sol rasante através de grande arco/janela de jardim; sombras de folhas realistas; bounce creme, sem luz hospitalar.  
**Arquitetura:** pequeno jardim de inverno mediterrânico, arcada vegetal, sofá leve em linho, biblioteca com nichos iluminados indiretamente, mesa de leitura em madeira clara, ramos de oliveira e cerâmica artesanal. A estante funciona como foco editorial, não como dispensário de medicamentos.  
**Composição ao chegar:** a porta verde abre sobre um ambiente calmo; à direita, um livro premium real sobre mesa; ao fundo, vegetação e paisagem compatível.  
**Interação assinatura:** tocar numa edição causa um close editorial de baixa amplitude (camera dolly curta ou parallax) e revela ficha do produto em HTML. Destacar "Tomei Mounjaro. E Agora?" como guia educativo e "Corpo Forte — Além da Balança" quando aplicável. Não recomendar fármacos, doses ou prometer perda de peso.  
**Desfecho:** CTA "Explorar Me Sentir Leve" → \`/me-sentir-leve\`; CTA livro existente → \`/me-sentir-leve/tomei-mounjaro-e-agora\` com fluxo Hotmart preservado.

### C. CORPO — "ATELIER DA FORÇA SERENA"
**Intenção emocional:** capacidade funcional, consistência e energia sem pressão estética ou cultura de transformação milagrosa.  
**Paleta:** areia \`#E8DBC2\`, travertino \`#D8C6A7\`, verde profundo \`#24493E\`, bronze antigo \`#A8885B\`, branco natural.  
**Luz:** claridade definida, sensação de manhã luminosa mas com temperatura cromática coerente com o lobby; sombra de arcos no chão.  
**Arquitetura:** sala espaçosa e elegante com nichos arqueados, chão em pedra antiderrapante de aspeto natural, tapete premium e área de movimento funcional. Poucos objetos úteis, todos à escala: banco ergonómico, halteres discretos, bola de estabilidade, prateleira baixa, água e toalha. Não transformar numa academia genérica.  
**Composição ao chegar:** a ombreira areia em primeiro plano; ao centro uma estação de movimento e ao lado uma mesa com **Corpo Forte — Além da Balança** e o workbook **O Meu Corpo em Construção** (workbook incluído, não produto extra obrigatório).  
**Interação assinatura:** livro e workbook apresentam dois cartões editoriais ligados; um toque revela princípios educativos de força/capacidade, sem instruções médicas personalizadas nem vídeos de exercícios não validados.  
**Desfecho:** CTA "Conhecer Corpo Forte" → \`/me-sentir-leve/corpo-forte\`. Não representar a edição eBook como 8 semanas com suporte LIA automático, salvo contrato/oferta real distinta.

### D. MENTE & CALMA — "SALA DA PAUSA"
**Intenção emocional:** pausa, clareza, hospitalidade, tranquilidade e espaço. Não simular terapia ou tratamento de saúde mental.  
**Paleta:** sálvia \`#A3B3A0\`, creme \`#F6F1E6\`, areia clara \`#DCCEB7\`, madeira mel, bronze claro.  
**Luz:** luminância difusa, sombras de folhas e tecidos, reflexo macio no piso; menos intensidade visual que nas outras salas.  
**Arquitetura:** espaço contemplativo com teto claro, banco curvo em linho, mesinha de leitura vazia, jardim interior com folhagem suave, cortinas de algodão, fonte silenciosa opcional. O espaço deve ter zonas de respiro e vista exterior convincente.  
**Composição ao chegar:** mais espaço negativo; uma instalação sutil de luz com variação muito lenta, nunca animação agressiva.  
**Interação assinatura:** permitir um pequeno modo de contemplação **opt-in** com alteração suave de luz e instrução genérica "Faça uma pausa", botão sair claro e respeito por \`prefers-reduced-motion\`. Evitar música automática, respiração forçada, pseudo-terapia e alegações clínicas.  
**Desfecho:** "Novos conteúdos em preparação". CTA real à Comunidade LIA através do manifesto. Nunca inventar eBooks ou lançar compra inexistente.

## 3. ART DIRECTION / ASSET PIPELINE
O PNG master é uma imagem achatada; precisa de componentes verdadeiros. **Não se resolve o problema com zoom numa imagem inteira.**

Assets necessários, identificados por função:
1. **Lobby clean plate:** reconstrução fiel da área atrás de LIA e dos objetos dianteiros. Não pode deixar duplicações quando os recortes se deslocam.
2. **LIA cutout verdadeiro com alfa**, preserving rosto/roupa/mãos, com ponto de contacto do sofá e iluminação consistente; o recorte mobile V1 exige avaliação específica.
3. **Foreground alpha:** plantas/bule/mesa/bordas para oclusão subtil e sombras de contacto, com bordas inspecionadas.
4. **Arch/door modules (GLB):** uma base arquitetónica com quatro skins; proporções compatíveis com a maquete e com os hotspots HTML.
5. **Quatro room shells em GLB/glTF:** dimensões, janelas, luz, sombras e curvas de parede coerentes; materiais PBR, meshes instanciadas para decoração repetida, LOD quando necessário.
6. **Set dressing por sala:** livros, banco, estante, mirror, mobiliário, cerâmicas, plantas com folhas em vários níveis de translucidez; objetos não flutuantes.
7. **Quatro environment plates** fotográficos/luminosos coerentes com câmara, parallax e perspetiva, usados como planos de fundo e fallback, não como totalidade da sala.
8. **Capas editoriais aprovadas em alta resolução**, não títulos inventados ou gerados na renderização.

**Prompt preamble único para asset creation (em inglês, copiar SEM alterações em cada cena):**  
"Photorealistic Mediterranean luxury wellness interior matching the approved LIA.doctor architectural lobby; warm late-afternoon coastal sunlight entering from camera-left, travertine limestone, fine mineral plaster, brushed antique brass, natural linen, handmade ceramics, botanical olive and climbing plants, premium editorial architecture photography, 28mm rectilinear lens, consistent eye-level camera height, physically plausible shadows and PBR materials, coherent warm ivory/olive/sage/peach palette, refined lived-in human scale, no people unless separately provided, no text, no labels, no watermarks, not cartoon, not low-poly, not clay render, not generic spa stock imagery."

**Procura de fidelidade:** primeiro criar layout/blockout das quatro salas; depois look-dev sobre screenshots com a mesma FOV/câmara do 3D; só depois produzir assets definitivos e animações. Validar imagem isoladamente. Não gerar quatro imagens independentes sem mapa arquitetónico comum.

## 4. SCROLLCRAFT — COMPATIBLE STORY, NOT A SECOND CAMERA ENGINE
O Scrollcraft é um skill + motor vanilla JS para efeitos marcados com atributos \`data-sc-*\`; o React/Three/GSAP do PR #4 mantém as responsabilidades atuais. **Não instalar automaticamente um segundo controlador de câmara no canvas R3F.** O scroll controla narrativa/camadas HTML e estados de apresentação; o clique/Enter abre a porta 3D real e o histórico Next.js.

**Recommended page grammar:** \`chaptered editorial\` com lobby imersivo e *visita explorável* como assinatura. Não uma sequência contínua de vídeo na qual o utilizador fica preso.

Scroll score proposto:
| Beat | Emoção | Dispositivo | Resultado |
|---|---|---|---|
| 1 · Chegada | curiosidade | hero depth + parallax de 3–5 planos | maquete ganha volume sem perder legibilidade |
| 2 · Encontrar a LIA | confiança | reveal + copy HTML | presença acolhedora; botão de chat verdadeiro |
| 3 · As quatro portas | descoberta (pico) | pin curto + iluminação de foco | quatro portais, escolha livre com click/keyboard |
| 4 · Leitura e produtos | substância | pan horizontal suave, scroll nativo no mobile | livros reais; CTAs reais; 3D separado |
| 5 · Comunidade e decisão | proximidade | flow + fade/resolution | WhatsApp da Comunidade LIA; regresso às áreas |

Quatro famílias de interação distintas; não repetir a mesma sequência de zoom por ato; no máximo um \`scrub\` de vídeo no hero, apenas se houver footage próprio já validado e browser/ffmpeg aptos. O primeiro frame deve funcionar sem vídeo. **Signature move:** quando se foca um arco, a luz da sala correspondente revela profundidade atrás da ombreira e os planos do lobby afastam-se ligeiramente; clique/Enter abre a porta em geometria verdadeira. Foco, hover e toque exibem a mesma informação, com teclado acessível e fallback HTML.

**Integração proposta:** colocar o motor e CSS Scrollcraft em módulo de client-side carregado somente em \`/experiencia\`; confinar seletores ao root e limpar listeners/observers no unmount. Não mudar scroll nativo, não capturar o wheel global, nem ligar \`ScrollTrigger\` e motor Scrollcraft ao mesmo \`transform\`/câmara simultaneamente. Animar apenas \`transform\`, \`opacity\`, CSS vars; reduzir layers em mobile e com \`prefers-reduced-motion\`.

## 5. EXPERIENCE DESIGN / INTERACTION
- **Cada sala é destino real:** \`/experiencia/espelho-meu\`, \`/experiencia/me-sentir-leve\`, \`/experiencia/corpo\`, \`/experiencia/mente-e-calma\`; preservar refresh, Back/Forward, deep links, foco no heading ao entrar e saída "Voltar ao átrio".
- **Hotspots são HTML real:** labels, focus ring, tab order; objetos 3D enriquecem a superfície, não substituem acessibilidade.
- **Chat LIA:** usar proxy criado no PR #4, erros claros se Core/Redis não configurados; não simular conversa. Não recolher história clínica num chat público. Música e voz off por defeito; só com consentimento explícito e funcionalidades homologadas.
- **Vendas:** compras apenas por rotas/checkout existentes; nunca adicionar "Comprar" em ofertas pendentes.
- **LeveLab:** não tocar em \`levelab.org\`, nas versões antigas do WebReader nem importar PDFs não homologados para a LIA.doctor.
- **Analytics:** apenas quando aprovados com consentimento e finalidade definida; não transformar a experiência numa fonte de tracking sem autorização.

## 6. IMPLEMENTATION SPRINTS
### S1 — Auditoria visual e contratos
Comparar screenshot local, maquete master e quatro screenshots interiores atuais; criar matriz de diferenças de perspetiva, cor, escala, luz, materiais, oclusão, marca. Congelar PR #4 como baseline funcional, sem o reproduzir. Criar planta esquemática do lobby com quatro salas, FOV, paths de câmara e coordenadas de porta. Entregar screenshot/overlay e matriz de assets.

### S2 — Arquitetura + primeira sala GOLDEN ROOM
Construir primeiro **EspelhoMeu** com continuidade fotográfica premium de entrada até cadeira/espelho/estante e um objeto interativo, sem tocar nas outras salas. Validar desktop/mobile/fallback e comparar pixels. A sala aprovada torna-se referência de materiais, sombras, carga e escala.

### S3 — Três salas restantes
Aplicar *shared architectural kit* às outras salas, mas respeitando as quatro bíblias acima; nunca simples recolor de um mesmo quarto. Me Sentir Leve tem jardim/informação, Corpo tem atelier funcional, Mente & Calma tem espaço negativo/pausa. Testar quatro travessias, foco, links e fallback.

### S4 — Scrollcraft editorial
Incorporar componentes mínimos do motor Scrollcraft apenas onde existam ganhos comprovados. Completar cinco beats e signature move sem concorrer com o controlador R3F. Criar asset variants desktop/mobile, posters e fallback.

### S5 — QA, design GO e promoção
Antes de pedir GO visual: screenshots comparativos 390, 768, 1440, 1920; strip por posição de scroll; vídeos de entrada/saída em cada sala; desktop Chrome, Firefox, WebKit/Safari físico; reduced motion, keyboard, screen-reader; context lost e GPU modesta; validação Hotmart sem alterar checkout.

**Budgets de referência (não medições):** Core Web Vitals LCP p75 <= 2.5 s, INP p75 <= 200 ms, CLS <= 0.1; medir inclusive hardware real e cache frio. Reutilizar cenas/GLB e lazy load de cada sala. Só carregar WebGL depois de intenção clara e com poster visível; DPR escalável; proibir regressão descontrolada de bytes. O relatório V1 indicou mobile LCP ~2.52 s num ensaio local, que não constitui prova de campo.

## 7. GATES E ENTREGÁVEIS PARA CLAUDE CODE
- **G0 Preserve:** tree diff das rotas comerciais e Hotmart = zero; screenshot canónico preservado; o branch \`feat/lia-immersive-v1\` mantém escritor único.
- **G1 Direction:** planta, layer contract, blocos de sala, screenshot de materiais e breve justificativa de assinatura visual aprováveis.
- **G2 Golden Room:** EspelhoMeu tem room-scale, entrada e saída com fotos coerentes, objetos não genéricos, nav e fallback.
- **G3 Four Rooms:** cada sala tem identidade reconhecível *sem ler o título*, interação e links válidos; nada inventado.
- **G4 Scrollcraft:** quatro device families, sem dead scroll, nenhuma competição entre motores, no máximo um scrub hero; screenshot strip.
- **G5 Production readiness:** acessibilidade, Web Vitals, compatibilidade, chat real ou indisponível honesto, comerciais intocados, rollback e PR DRAFT. **Não merge nem deploy de produção automático.**

Entregar no PR: diff, SHA, quatro imagens de sala, lobby desktop/mobile, quatro gravações das portas (ou um vídeo com quatro sequências), folha de contacto Scrollcraft, testes Playwright, relatório métricas com metodologia, asset manifest (nome/versão/license/dimensions/size), e riscos em aberto. Manter um registo de decisões de arte. Qualquer cena gerada por IA que altere a identidade da personagem ou as capas requer correção.

## 8. DIRECT INSTRUCTION — EXECUTION PROMPT
> CLAUDE CODE: Implementa o LIA.DOCTOR IMMERSIVE V1.1 em \`atlashub-digital/lia-doctor\`, partindo do PR #4 e deste documento, sem refazer o bootstrap, nem substituir o lobby ou o checkout. Inspeciona os HEADs, congela a base funcional e assume writer único apenas numa nova branch de implementação autorizada. Instala a skill Scrollcraft usando as instruções oficiais do repo, executa o \`doctor.mjs\`, lê \`SKILL.md\`, \`hero-depth.md\`, \`approved-collection.md\`, \`devices.md\` e \`verify.md\`. Não copies cegamente uma página HTML: integra a coreografia de scroll na app Next.js existente e preserva Three.js/React Three Fiber/GSAP como motor de portas. Constrói primeiro a GOLDEN ROOM EspelhoMeu com fidelidade premium, depois as outras três conforme as room bibles. Regista evidência visual das passagens, QA e performance. Não merges nem publiques sem GO da Direção.

## STATUS TRANSPARENCY
Este documento é **especificação e ordem proposta de trabalho**, não prova de execução de código, geração de assets, QA ou deploy. Uma rama de documentação não altera a implementação do PR #4. Nenhum preço ou novo entitlement Hotmart foi validado neste handoff.
