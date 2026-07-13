# Instruções do projeto para agentes

## Objetivo

Este documento define os padrões obrigatórios de desenvolvimento deste projeto.

Todos os agentes devem seguir estas regras durante:

- planejamento;
- implementação;
- refatoração;
- revisão de código;
- geração de documentação.

Em caso de conflito entre implementações e este documento, este documento prevalece.

---

# Arquitetura do projeto

## Visão geral

Este repositório é um monorepo gerenciado com pnpm workspaces.

- `apps/web`: React + Vite + TypeScript
- `apps/api`: NestJS + TypeScript

## Gerenciador de pacotes

- Utilize apenas **pnpm** por meio do Corepack.
- Execute comandos sempre pela raiz do projeto.
- Nunca utilize npm ou Yarn.
- Nunca gere outros arquivos de lock.
- Mantenha `pnpm-lock.yaml` atualizado.

## Comandos principais

Desenvolvimento

- `corepack pnpm dev`
- `corepack pnpm dev:web`
- `corepack pnpm dev:api`

Build

- `corepack pnpm build`
- `corepack pnpm build:web`
- `corepack pnpm build:api`

---

# Fluxo de desenvolvimento

Toda nova funcionalidade deve seguir este fluxo.

1. Criar uma branch.
2. Analisar o Figma.
3. Elaborar um plano em `/plans`.
4. Implementar.
5. Executar o build.
6. Validar Desktop, Tablet e Mobile.
7. Criar commit seguindo Conventional Commits.
8. Abrir Pull Request.
9. Realizar Code Review.
10. Fazer Merge.

Nunca desenvolva diretamente na branch `main`.

A branch `main` deve receber alterações apenas por Pull Requests.

---

# Planejamento

Antes de implementar funcionalidades grandes:

- criar um plano em `/plans`;
- validar o plano;
- somente então iniciar a implementação.

Todo plano deve conter:

- objetivo;
- arquitetura;
- componentes reutilizados;
- arquivos modificados;
- estratégia de testes.

Utilize nomes descritivos.

Exemplos:

- login.md
- cadastro.md
- perfil.md
- feed.md

Evite nomes genéricos como:

- teste.md
- plano1.md
- novo.md

---

# Front-end

## Tecnologias

- React
- Vite
- TypeScript

## Arquitetura

Utilize Atomic Design.

Organize componentes em:

- atoms
- molecules
- organisms
- templates
- pages

## Componentes compartilhados

Sempre verifique se já existe um componente reutilizável.

Quando um componente atender várias páginas:

- evolua o componente existente;
- preserve compatibilidade;
- evite duplicações;
- prefira parametrização.

## Layouts compartilhados

Sempre reutilize layouts quando várias páginas possuírem estrutura semelhante.

Evite repetir:

- breakpoints;
- regras de layout;
- espaçamentos;
- largura máxima.

Centralize essas regras em componentes compartilhados.

---

# Back-end

Utilize arquitetura REST.

- DTOs para entrada de dados.
- class-validator para validações.
- Controllers sem regra de negócio.
- Regras de negócio em Services.
- Respostas padronizadas.

---

# Design System

## Figma

Sempre que existir um layout no Figma:

o Figma é a fonte oficial da interface.

Nunca altere:

- cores;
- tipografia;
- componentes;
- espaçamentos;
- hierarquia visual;

sem justificativa.

## Fluxo de implementação

Antes de implementar qualquer tela:

1. localizar Desktop;
2. localizar Tablet;
3. localizar Mobile;
4. identificar componentes reutilizáveis;
5. reutilizar layouts existentes;
6. somente então iniciar a implementação.

Nunca implemente uma tela analisando apenas uma versão.

---

# Responsividade

## Diretrizes

Todo o projeto deve seguir Mobile First.

O objetivo é preservar o layout do Figma em:

- Desktop
- Notebook
- Tablet
- Mobile

Evite:

- larguras fixas;
- alturas fixas;
- overflow ocultando conteúdo;
- paddings exagerados.

Prefira:

- clamp()
- min()
- max()
- fit-content
- max-width
- min-height
- gap responsivo

Utilize media queries também por altura quando necessário.

Em notebooks 1366×768 e 1280×720 a aplicação deve funcionar em zoom 100%.

## Breakpoints

Cada breakpoint representa um layout diferente.

Não reduza apenas larguras.

Sempre siga o Figma.

Desktop

↓

Tablet

↓

Mobile

## Padrões compartilhados

Sempre que possível:

- width: min(...)
- clamp(...)
- max-width
- max-height
- min-height: 100svh

Em layouts de autenticação:

- breakpoint principal: 820px.

Para telas com pouca altura:

reduza primeiro:

- paddings;
- gaps;
- banners;

Somente depois reduza:

- fontes;
- campos;
- botões.

---

# Validação obrigatória

Antes de concluir qualquer alteração relevante:

Execute o build correspondente.

Valide nas resoluções:

- 1920×1300
- 1366×768
- 1280×720
- 1024×768
- 768×1024
- 390×844

Verifique:

- zoom 100%;
- ausência de cortes;
- ausência de sobreposição;
- ausência de scroll causado apenas por espaçamentos.

---

# Git

Todos os commits devem seguir Conventional Commits.

Exemplos

- feat(web): adiciona login
- feat(api): adiciona autenticação
- fix(web): corrige layout
- refactor(web): reorganiza componentes
- docs(root): atualiza documentação

Nunca faça commit sem executar o build.

---

# Qualidade

Sempre:

- explicar alterações relevantes;
- manter consistência arquitetural;
- preferir soluções simples;
- evitar alterações não relacionadas;
- validar antes de concluir.

---

# Segurança

Nunca:

- subir `.env`;
- expor tokens;
- expor senhas;
- registrar credenciais;
- incluir segredos em documentação ou planos.

Utilize sempre o menor conjunto possível de permissões em integrações.

---

# Ferramentas

Utilize integrações somente quando agregarem contexto.

Sempre:

- explicar qual ferramenta será utilizada;
- validar os resultados obtidos;
- preferir integrações oficiais.

Nunca:

- executar merge;
- excluir recursos;
- modificar repositórios remotos;

sem confirmação explícita do usuário.