# Duarte Engenharia | Registro de publicação V7.4.3 (07/11/2026)

## Produção homologada
- Projeto Vercel: `engenharia` (`prj_fhsUatk3OsgDCWmHbxAXXi7Dv75d`).
- Equipe Vercel: `team_J5dAb9TGIDUB3PRNOofisIdf`.
- Implantação **atual em produção**: `dpl_cdX5Wsyz2oroUYZsbELHMAnbUaGf`, status READY.
- Domínio canônico: https://www.engenhariaduarte.com.br/
- Domínio sem www: redirecionamento HTTP 308 para o domínio canônico.
- Implantação de produção anterior à V7.4.3: `dpl_Ba1QN91dxKhenpYzHwUJkRNSvuJX`.
- Preview fonte da versão homologada: `dpl_7HzHCpGkSzghTpMY5JtqnmwaW5sy`.

## Comprovações
- Chrome/Playwright: 320, 375, 412 e 1440 px; menu e expansão exclusiva de especialidades funcionais, sem rolagem lateral.
- Lighthouse Preview V7.4.3: performance 99 móvel e 98 desktop; acessibilidade 100 nos dois; boas práticas 100. O SEO 69 no Preview reflete o `X-Robots-Tag: noindex` da proteção Vercel, não do domínio oficial.
- Produção: Home, 10 páginas internas, robots.txt e sitemap.xml respondendo HTTP 200. URLs canônicas conferidas; sem `noindex` em produção.
- Integração do formulário: POST sintético identificável para `/api/leads` em produção retornou HTTP 200, `ok: true` e comprovante de recebimento.
- Segredos não registrados neste documento. Não copiar credenciais ou variáveis de ambiente para o GitHub.

## Bloqueio para sincronização automática
A branch `main` do GitHub ainda corresponde à versão anterior (commit `5848ae9c0aa9dcd7bb9f868525955fb05418a1c9`). A V7.4.3 foi implantada **diretamente na Vercel** a partir de 87 arquivos da fonte do deployment, e a API `api/leads.js` não deve ser sobrescrita por código antigo. Uma atualização da `main` sem reconciliação pode regredir visual, SEO e integração com CRM.

**Não mesclar esta branch de documentação na `main` como substituto de uma sincronização completa.** Primeiro recuperar e comparar integralmente os 87 arquivos da origem de produção, incluindo arquivos binários e backend, reproduzir o build em Preview conectado ao GitHub e executar testes de API, SEO e Lighthouse. Somente depois fazer merge controlado.

## Rollback
Implantações antigas permanecem identificadas na Vercel. Se ocorrer falha crítica, usar o fluxo de rollback do projeto após verificar o deployment de destino e a compatibilidade da API com as configurações vigentes. Não confundir o deployment de Preview com uma implantação de produção pronta para promoção.

## Próximos controles
1. Sincronização segura de código, sem alteração automática do domínio.
2. Inspeção de URLs principais e sitemap no Google Search Console.
3. Auditoria de consentimento e eventos GA4: page_view, generate_lead, whatsapp_click e form_error.
4. Validação da entrada efetiva dos leads no CRM, além do receipt HTTP.
5. Monitoramento de Core Web Vitals e oportunidades orgânicas.
