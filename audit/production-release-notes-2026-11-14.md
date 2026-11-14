# Release Duarte Engenharia — 14/11/2026

## Implantação oficial
- Projeto Vercel: `engenharia` (`prj_fhsUatk3OsgDCWmHbxAXXi7Dv75d`)
- Deployment de produção ativo: `dpl_9aCJK5tGtbDzN7mRgqvojjvAixLE`
- Implantação anterior para rollback: `dpl_Gg9wXka4yALkaSRNQAcLK4EZMp98`
- Domínios: `www.engenhariaduarte.com.br` e `engenhariaduarte.com.br`
- Preview de homologação: `dpl_HoY85kxEaBdKTJupcFtRYR7c8a9b`

## Escopo
- Origem: os 100 arquivos-fonte identificados no deployment anterior e reutilizados pela Vercel pelo SHA dos arquivos.
- 98 arquivos permanecem byte a byte equivalentes pela identificação SHA da Vercel.
- Os dois arquivos alterados foram `consultoria-diagnostico/index.html` e `mentoria-especializada/index.html`, exclusivamente os campos Open Graph de título, descrição, URL e tipo.
- Nenhum arquivo removido ou acrescentado ao pacote de produção.

## Homologação
- 23 páginas HTML: HTTP 200 nos dois deployments e corpo equivalente fora das quatro tags OG das duas páginas ajustadas.
- Sitemap e robots.txt: equivalentes à produção anterior.
- CSS, script do formulário e imagem de logo amostrados: equivalentes.
- API `GET /api/leads`: HTTP 405 em ambos, conforme método permitido.
- API `POST /api/leads`: teste sintético no novo domínio em produção gerou HTTP 200, `ok:true` e recibo.
- Erros Vercel na última hora após a implantação: nenhum erro agregado encontrado.

## Pendências de governança
- **Este repositório ainda não contém integralmente os arquivos-fonte recuperados da produção.** O manifesto `audit/release-manifest-candidate-2026-11-14.json` lista os 100 caminhos e seus IDs de blob da Vercel, mas não é um backup independente dos bytes.
- A PR nº 6 continua somente para registro/revisão dos patches e não deve ser usada como fonte direta de um novo deployment.
- Recuperar os conteúdos para o repositório, especialmente arquivos estáticos binários, APIs e configuração, e construir uma pipeline de release reproduzível baseada nessa árvore antes de novos lançamentos pelo GitHub.
- Localizar e descartar no CRM os registros sintéticos `TESTE AUTORIZADO AUDITORIA DUARTE` e `TESTE AUTORIZADO POS-PUBLICACAO DUARTE`.
- PageSpeed Insights deve ser revalidado; os testes aqui não constituem uma nova pontuação Lighthouse.
