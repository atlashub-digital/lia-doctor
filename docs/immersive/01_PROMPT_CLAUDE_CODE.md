# CLAUDE CODE — LIA.DOCTOR IMMERSIVE V1 | HANDOFF CANÓNICO

**Objetivo:** construir uma experiência de visita tridimensional no domínio **lia.doctor**, preservando exatamente a imagem mediterrânica aprovada. Repositório de escrita **atlashub-digital/lia-doctor**. O repositório `levelab-frontend` é apenas referência READ-ONLY para a implementação existente de webchat.

## Source of truth
- Maquete master: **LIA.doctor Mediterranean Wellness Haven**, imagem aprovada pelo utilizador 1672×941 px, anexada à conversa. Versão Canva editável: https://www.canva.com/d/vgQo-YbP5pcDuJ9. O Canva separou parte do texto, não gerou uma cena 3D.
- Pacote local de apoio: `LIA_DOCTOR_IMERSAO_V1_CORRIGIDO.zip` da conversa (contém WebP de referência, mapa dos hotspots, JSON completo, este prompt e QA).
- O primeiro portal deve ser desenvolvido em **/experiencia**, sem substituir a homepage atual. Promover /experiencia para / somente após aprovação visual da Direção e gates QA.

## Governança
1. Inspecionar HEAD remoto main, branch, writers, Next/React, `app/page.tsx`, `app/me-sentir-leve`, `app/espelho-meu`, `components/HotmartCheckout.tsx`, `lib/catalog.ts`, CSS e Vercel. Criar branch exclusiva `feat/lia-immersive-v1` e PR DRAFT, sem force-push.
2. Não tocar no backend ARO, WebReader, checkout Hotmart, direitos de utilizadores nem `espelho.lia.doctor`. Preservar todas as páginas comerciais.
3. Next.js/React/TypeScript existentes; para a cena 3D usar Three.js, @react-three/fiber 9, @react-three/drei e GSAP após validar versões. 2.5D com planos visuais para o primeiro frame; geometria real de arcos e salas atrás das portas. Não simular uma cena tridimensional apenas com zoom numa imagem.
4. Renderizar conteúdo HTML semântico e hotspots com foco/teclado, e adaptar bounds para o crop real de cada viewport. Não usar um screenshot inteiro como único elemento interativo.

## Composição exata
- LIA à esquerda sentada na sala mediterrânica com iluminação quente, vegetação, mesas e livros. Quatro arcos à direita.
- Da esquerda para a direita: **EspelhoMeu** (pêssego/rosé claro); **Me Sentir Leve** (verde profundo); **Corpo** (marfim/areia); **Mente & Calma** (verde sálvia).
- Três livros à frente: **Tomei Mounjaro. E Agora?**, **Corpo Forte — Além da Balança** (workbook incluído, mas não é terceiro cartão), **Eu Sou Bela Do Meu Jeito**.
- Faixa de Comunidade LIA; redes sociais; balão discreto junto ao rosto e ombro da LIA.
- Fidelidade de tipografia editorial, micro relevo, bevel das molduras, sombra de contacto, tons botânicos, reflexos subtis e perspetiva confortável.

## Animação das quatro portas
Estados `idle → focus/hover → preparing-room → door-opening → camera-travel → room-ready`.
- Ao clicar ou pressionar Enter, pré-carregar a sala, abrir/desdobrar a porta e deslocar a câmera através da soleira num arco 3D verdadeiro, com oclusão coerente e room interior; terminar em rota navegável, preservando browser history e back.
- **EspelhoMeu → /espelho-meu**; **Me Sentir Leve → /me-sentir-leve**; **Corpo → /corpo** (criar); **Mente & Calma → /mente-e-calma** (criar; conteúdos em breve, não inventar serviços).
- Fazer deep links, refreshing, back/forward. Mobile com portas grandes clicáveis e animação simplificada, não crop de desktop. Reduced-motion e WebGL indisponível devem usar HTML simples sem perda funcional. Animação desktop alvo ~1100 ms; mobile ~350 ms.

## Todos os hotspots de comércio e comunidade
- Mounjaro: `/me-sentir-leve/tomei-mounjaro-e-agora` → Hotmart já configurado naquela landing; validar preço/entrega final antes de publicidade.
- Corpo Forte: `/me-sentir-leve/corpo-forte`; ainda não ativar CTA Hotmart até oferta válida com ambos PDFs.
- EspelhoMeu volume 2: `/espelho-meu/eu-sou-bela-do-meu-jeito` → fluxo comercial original do EspelhoMeu.
- WhatsApp comunidade: https://chat.whatsapp.com/FHzvr72KCiYCzlQ7klCTN3?s=sh&p=a&mlu=4&ilr=4
- Facebook: https://web.facebook.com/lia.levelab
- YouTube: https://www.youtube.com/@LIA.Doctor
- TikTok: https://tiktok.com/@lia.doctor
- Instagram: https://www.instagram.com/lia.levelab
- Sem `href="#"`, botões decorativos ou redirecionamento fictício. Com target _blank e noopener/noreferrer nos links externos.

## Webchat real e transparente
- Hover ou foco na LIA mostra tooltip; click/touch abre painel de conversa. Texto, Enter, Escape, loading, retry, estados de erro e acessibilidade.
- **No repo lia-doctor**, implementar `POST /api/lia/chat` apenas depois de confirmar contrato com LIA Core. Usar como referência read-only `levelab-frontend/app/api/lia/chat/route.ts` que liga a `${LIA_API_URL}/api/v1/chat` com `LIA_SERVICE_TOKEN` server-only. Nunca passar token ao browser.
- Inexistência de configuração, 503, timeout ou falha: mostrar **LIA temporariamente indisponível**. Não produzir respostas falsas como se fossem IA real. Limitar input, antiflood persistente, logging redigido, proteção contra abuso e aviso de assistente IA. Não recolher dados clínicos na entrada pública.
- Voz somente com suporte do browser, feature flag e permissão explícita. Sem microfone inerte.

## Critérios de aceite
- Scene layout fiel à maquete com 4 portas e 3 livros, responsive 390/768/1440/1920, QA em Chrome/Safari/Firefox.
- Quatro travessias 3D demonstradas em vídeo/GIF, endpoints e routes válidos, back/forward e deep link, fallback WebGL e reduced motion.
- Chat com estados 200/429/503/502 testados, sem respostas mock enganadoras.
- Comunidade e 4 sociais reais; nenhum CTA comercial alterado.
- Relatório com SHA, Vercel preview, screenshots comparativos, Web Vitals MEDIDOS e riscos, rollback por flag.
- **PR DRAFT**, sem merge em main até GO visual.

O objetivo é uma sala LIA imersiva que preserva a direção artística aprovada e usa as páginas de vendas atuais sem as reconstruir.
