# LIA Immersive V1 — START HERE
Este diretório entrega **uma alternativa GitHub**, que não depende de ZIP descarregado pela conversa.

## Handoff
1. [01_PROMPT_CLAUDE_CODE.md](./01_PROMPT_CLAUDE_CODE.md) — instruções operacionais exatas para o Claude Code.
2. [02_SCENE_MANIFEST.json](./02_SCENE_MANIFEST.json) — portas, hotspots (na referência 1672×941), CTA, redes sociais e contrato do chat.
3. [Maquete editável no Canva](https://www.canva.com/d/vgQo-YbP5pcDuJ9) — fonte visual auxiliar; versão original da imagem foi anexada à conversa.
4. Pacote completo otimizado, com referências visuais, na conversa: **LIA_DOCTOR_IMERSAO_V1_CORRIGIDO.zip** (1,57 MB).

## Projeto certo
**Repositório:** `atlashub-digital/lia-doctor`. Não usar `levelab-frontend` como destino da implementação. As antigas instruções apontavam incorretamente ao outro repositório e foram substituídas por estas.

## Release
Branch de feature + PR DRAFT. Preview /experiencia. Preservar `/me-sentir-leve`, `/espelho-meu` e Hotmart. O chat LIA deve ser proxy server-only, nunca mockado como real.

## Nota sobre assets
Este diretório GitHub guarda os **contratos de desenvolvimento em texto**. Os assets fotográficos são disponibilizados no pacote otimizado e no Canva. A conversão editável Canva não separa automaticamente todos os planos fotográficos para Three.js; exige pipeline específico de layers/máscaras/GLB.
