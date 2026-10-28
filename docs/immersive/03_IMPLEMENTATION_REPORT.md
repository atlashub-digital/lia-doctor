# LIA Immersive V1 — implementação e evidência

Estado: **DRAFT / não aprovado para produção**. Data: 2026-10-26.

## W0 — origem e limites

Destino confirmado diretamente pela direção nesta conversa: `atlashub-digital/lia-doctor`, em `/experiencia`. O repositório `levelab-frontend` é referência apenas de leitura para o contrato de chat. O PR documental #11 nesse repositório precede a correção de destino e não é a entrega da experiência.

- Base remota: `main`, SHA `bfee0a762bb64beeaf42d5fe25feedd4f368db58`.
- Branch exclusiva: `feat/lia-immersive-v1`, num clone separado. Sem force-push.
- Na auditoria inicial, nenhum PR estava aberto em `lia-doctor`; o commit base é de AtlasHub. Isso não exclui escritores externos.
- Contratos lidos primeiro: `00_COMECAR_AQUI.md`, `01_PROMPT_CLAUDE_CODE.md`, `02_SCENE_MANIFEST.json` v1.1.0, preservados no repositório.
- A direção forneceu também `08_HOTSPOTS_QA_OVERLAY.jpg`; bounds conferidos contra o manifesto.
- A referência limpa foi localizada em `Downloads/LIA.doctor Mediterranean Wellness Haven.png`, visualmente correspondente ao overlay, 1672×941.
- Referência copiada sem alterações para `public/immersive/lia-canonical.png`; SHA256 `67cb613e5acbf6d11a7517abb6b4234207923d008b2961560a414fefdf91db22`.
- Recorte mobile derivado com ImageGen, a partir dessa referência: `public/immersive/lia-cutout.png`; SHA256 `1d97e5fef4a29e94b5de8767a54710bc7c1035e72f8fa90d1243dba5496e0fc3`. É um derivado que requer aprovação visual, não um novo master canónico.

Páginas comerciais, `components/HotmartCheckout.tsx`, `lib/catalog.ts`, homepage, ARO, Reader, DNS e produção não foram alterados. A política de privacidade recebeu informação sobre o novo chat, memória local, limitação de abuso e voz desativada.

## W1 — lobby e navegação

O primeiro frame desktop conserva a fotografia aprovada, sem rasterizar o overlay QA. Por cima há elementos HTML independentes, com nomes acessíveis e foco visível, para as quatro portas, personagem, balão, três livros, comunidade e topo. Pesquisa e Sobre abrem painéis reais. Os recortes não recebem zoom como substituto da travessia.

Mobile tem composição própria: personagem separada do fundo, tipografia HTML, quatro grandes arcos em duas colunas, lista de três livros e comunidade. `picture` com media queries evita baixar ambos os retratos otimizados para o primeiro frame. Os recortes decorativos das salas/capas usam a imagem canónica.

Os destinos sociais e o convite vêm diretamente do manifesto. Links externos usam `noopener noreferrer`. Há exatamente três livros; o workbook é descrito como parte de Corpo Forte. Os gates e destinos comerciais originais permanecem intactos.

## W2 — geometria, URL e fallback

React Three Fiber 9 / Three.js / Drei / GSAP: molduras extrudidas com bevel, folhas de porta com dobradiça, salas em profundidade, paredes, chão, mobiliário, iluminação e materiais. A câmara move-se de `z=11.7` para `z=-2.8`, atravessando a soleira em `z=0`; as folhas abrem antes da passagem. A suite verifica que o `z` final é negativo, além da URL e conteúdo. Não é apenas um zoom de imagem.

O canvas é importado de forma diferida, sem SSR; DPR limitado, renderização `demand`, sombras limitadas e tweens cancelados ao mudar de rota/desmontar. Falha de criação ou perda de contexto usa HTML. Reduced motion evita carregar o canvas. A navegação não depende de WebGL ou JavaScript para seguir os links de sala.

| Sala navegável | Conteúdo / destino preservado |
| --- | --- |
| `/experiencia/espelho-meu` | CTA para `/espelho-meu` |
| `/experiencia/me-sentir-leve` | CTA para `/me-sentir-leve` |
| `/experiencia/corpo` | CTA para `/me-sentir-leve/corpo-forte`; `/corpo` é um alias |
| `/experiencia/mente-e-calma` | Conteúdo explicitamente em preparação; comunidade; `/mente-e-calma` é um alias |

As rotas de sala sob `/experiencia` preservam a experiência e o histórico sem substituir as duas coleções comerciais. Os destinos canónicos do manifesto continuam nos CTAs internos. Refresh, acesso direto, Voltar e Avançar devem manter a sala correta.

**Limite artístico:** a referência disponível é uma composição fotográfica achatada. O lobby é fiel ao primeiro frame; os interiores procedurais são uma interpretação 3D, não réplicas fotogramétricas nem reconstruções GLB aprovadas. Ainda é necessária revisão de direção artística para continuidade da passagem, layers de oclusão, materiais e qualidade premium. Não declarar fidelidade integral das salas.

## W3 — chat

Contrato confirmado por leitura de `levelab-frontend/app/api/lia/chat/route.ts` e de `levelab-lia/src/chat/chat.controller.ts`, `chat.dto.ts`, `chat.service.ts`: POST `${LIA_API_URL}/api/v1/chat`, header `x-lia-service-token`, `{message,history,channel:'web'}`, resposta `reply`/`action`. A leitura de código não comprova disponibilidade do serviço implantado.

O novo `POST /api/lia/chat` usa apenas variáveis de servidor. Valida origem, tipo e tamanho do corpo; permite no máximo 2000 caracteres e 12 turnos; não encaminha identidade enviada pelo browser. Retorna apenas resposta validada e ação permitida. Sem respostas mock em runtime. Erros de configuração, limite, upstream, resposta inválida e timeout são apresentados como estados do serviço, fora do histórico da assistente. Reset/fecho abortam pedidos; respostas tardias são ignoradas.

O antiflood é persistente, atómico e partilhado via Redis REST: 20 pedidos/10 minutos, chave com HMAC do endereço de rede e TTL. A ausência/falha do limitador fecha o serviço com 503. Nenhuma credencial foi obtida da produção ou adicionada à branch. Prompts/respostas/IPs não são registados pelo proxy; a política de retenção do Core e fornecedores continua por validar antes de ativação pública.

Voz está preparada com deteção de suporte/contexto seguro, consentimento explícito, permissão do browser, recusa, paragem e revisão da transcrição. **Flag false e funcionalidade não ativada**, pois não houve verificação real de microfone.

## Feature flags e preview

- `NEXT_PUBLIC_LIA_IMMERSIVE_ENABLED=false` por padrão: rollback para HTML completo, exige novo build.
- `vercel.json` ativa 3D por padrão **somente** em Preview da branch exata `feat/lia-immersive-v1`, respeitando uma variável explicitamente definida como false. Não altera a homepage nem o estado de produção.
- `NEXT_PUBLIC_LIA_VOICE_ENABLED=false` permanece desligada.
- Chat necessita de `LIA_API_URL`, `LIA_SERVICE_TOKEN`, `LIA_RATE_LIMIT_REDIS_URL`, `LIA_RATE_LIMIT_REDIS_TOKEN`, todos server-only. Não ativar sem validação operacional e de privacidade.

## W4 — reprodução

```powershell
npm ci
$env:NEXT_PUBLIC_LIA_IMMERSIVE_ENABLED='true'
npm run build
npm run typecheck
npm run test:proxy
npx playwright install ffmpeg firefox webkit
npm run test:e2e
```

Em Windows, a suite usa Chrome instalado. Em CI usa Chromium do Playwright (`npx playwright install --with-deps chromium`). Playwright pode iniciar o servidor de produção; se já estiver a correr na porta 3107, reutiliza-o fora de CI. As medições adicionais usam `node scripts/measure.mjs` com o servidor de produção em execução. `TEST_BASE_URL` permite testar o preview acessível.

### Resultados reais locais

| Verificação | Resultado |
| --- | --- |
| Build de produção | Passou; 23 páginas geradas; Next 16.4.3. |
| TypeScript | Passou no build e em execução separada. |
| Proxy com upstream controlado | 8 testes passaram. Sucesso/erros são simulações de contrato, não chamadas ao Core real. |
| Browser Chrome | 7 testes passaram na execução final (3,8 min), incluindo quatro travessias com `cameraZ < 0`, histórico, refresh, URLs, 3 livros, teclado, diálogos, cancelamento, WebGL perdido, reduced motion, 360/390/768/1440/1920 e estados do chat. |
| Acessibilidade automatizada | Axe sem violações nos estados verificados desktop, mobile e pesquisa. Não equivale a auditoria manual completa ou teste com leitor de ecrã. |
| Chat sem configuração, via browser e endpoint real local | HTTP 503; mensagem clara de indisponibilidade; nenhuma resposta demonstrativa. |
| Dependências de produção | `npm audit --omit=dev`: 0 vulnerabilidades. Next herdado 16.3.8 tinha alertas críticos; foi atualizado para 16.4.3 na branch. |
| Hotmart e páginas comerciais | Rotas retornaram 200; URL comercial Mounjaro preservado; diff dos ficheiros de comércio e homepage vazio. Não houve pagamento ou validação de fulfillment. |
| Firefox 157 do Playwright | Não iniciou neste Windows (`spawn UNKNOWN`); execução não validada. |
| WebKit 27.2 | Fluxo básico mobile, sala, refresh e diálogo/Escape exercitados. Ocorreram erros de prefetch RSC por controlo de acesso no runner e não houve aprovação visual do canvas. Não declarar compatibilidade Safari real aprovada. |

Evidência em `evidence/`: screenshots desktop e mobile, quatro salas, vídeo `four-door-transitions.webm`, resultado JSON da suite e medições antes/depois. As imagens e o vídeo da execução final são os artefactos desta missão, não screenshots históricos.

### Performance observada — laboratório, não dados de campo

Windows, Chrome headless, WebGL por software, servidor de produção local. Desktop 1440×900 sem throttling; mobile 390×844 com CPU 4× e rede 8 Mbps down / 2 Mbps up / 80 ms RTT. Amostras individuais; cache de otimização do servidor já aquecida na repetição. Não há percentis de campo nem INP validado.

| Amostra | Desktop LCP | Mobile LCP | CLS desktop/mobile | Transferência desktop/mobile |
| --- | --- | --- | --- | --- |
| Repetição antes da otimização de textura | 1.760 ms | 2.840 ms | 0 / 0 | 3.602.978 / 3.229.586 bytes |
| Após partilhar textura otimizada CSS/Three | 1.392 ms | 2.520 ms | 0 / 0 | 901.166 / 952.763 bytes |

Uma primeira amostra desktop registou LCP de **53.452 ms**, sem instrumentação suficiente para atribuir a causa; foi preservada como anomalia neste relatório. As repetições foram substancialmente melhores e a carga desceu após remover o download duplicado do PNG master. Isso **não** comprova performance premium em dispositivos reais. O mobile ainda está no limite da meta de LCP; cold starts, latência real, GPU e estabilidade precisam de amostragem adicional. Não foi obtida entrada Event Timing suficiente para afirmar INP.

## Pendências para GO

1. Aprovação artística do derivado mobile e dos interiores procedurais; pipeline de layers/GLB e continuidade de oclusão para chegar à qualidade fotográfica da maquete.
2. Configuração autorizada do Core e do limitador persistente em Preview, validação real de conversa e retenção/privacidade. O chat permanece indisponível até isso existir; nenhum segredo foi copiado.
3. Safari físico, Firefox operacional, leitor de ecrã e performance em hardware real/cold start; INP/percentis ainda em falta.
4. Voz permanece desligada até verificação real de suporte e permissões.
5. Validação comercial/entrega Hotmart continua fora desta missão e não foi marcada como aprovada.

Manter PR DRAFT. Não promover `/experiencia` para `/`, não fazer merge em main nem alterar DNS/produção sem GO. Um deploy verde não encerra esta missão.
