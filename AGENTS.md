# Instruções do projeto para agentes

## Visão geral

Este repositório é um monorepo gerenciado com pnpm workspaces.

- `apps/web`: aplicação React com Vite e TypeScript.
- `apps/api`: API NestJS com TypeScript.

## Gerenciador de pacotes

- Use pnpm por meio do Corepack.
- Execute os comandos a partir da raiz do repositório.
- Não use npm ou Yarn e não crie outros arquivos de lock.
- Mantenha `pnpm-lock.yaml` atualizado ao alterar dependências.

## Comandos principais

- Desenvolvimento completo: `corepack pnpm dev`
- Front-end: `corepack pnpm dev:web`
- API: `corepack pnpm dev:api`
- Build completo: `corepack pnpm build`
- Build do front-end: `corepack pnpm build:web`
- Build da API: `corepack pnpm build:api`

## Regras de implementação

- Use TypeScript nos dois aplicativos.
- Preserve a separação entre front-end e API.
- Coloque código do React em `apps/web/src`.
- Coloque código do NestJS em `apps/api/src`.
- Faça alterações pequenas e focadas no pedido atual.
- Não altere arquivos ou comportamentos não relacionados.
- Antes de concluir uma mudança de código, execute o build do aplicativo afetado.
- Ao mudar os dois aplicativos ou configurações compartilhadas, execute `corepack pnpm build`.

## Convenções

- Siga o estilo já existente no arquivo editado.
- Prefira nomes claros e descritivos.
- Não adicione dependências sem necessidade.
- Nunca inclua segredos, credenciais ou arquivos `.env` no repositório.

## Projeto

- Monorepo com pnpm workspaces
- React + Vite no front-end
- NestJS no back-end
- TypeScript obrigatório

## Front-end

- Atomic Design
- Prefira componentes reutilizáveis antes de criar novos.
- Mobile First
- Acessibilidade
- Organize componentes em:
  - atoms
  - molecules
  - organisms
  - templates
  - pages

- Utilize CSS Modules ou a estratégia definida no projeto.
- Evite duplicação de componentes.

## Back-end

- Desenvolva a API seguindo os princípios REST.
- Utilize DTOs para entrada de dados.
- Valide dados com class-validator.
- Controllers não devem conter regra de negócio.
- A lógica deve ficar nos Services.
- Utilize respostas padronizadas.

## Git

Todos os commits devem seguir o padrão Conventional Commits.

Exemplos:

- feat(web): adiciona página de login
- fix(api): corrige validação de usuário
- docs(root): atualiza documentação
- refactor(web): reorganiza componentes

Antes de criar um commit, confirme que o build foi executado sem erros.

## Qualidade

- Não modificar código sem explicar o motivo.
- Validar antes de concluir uma tarefa.
- Manter consistência com a arquitetura existente.
- Prefira soluções simples e de fácil manutenção.

## Design

- Sempre que houver um layout no Figma, ele deve ser considerado a fonte oficial da interface.
- Não alterar cores, tipografia, espaçamentos ou componentes sem justificativa.

##  Layouts compartilhados

- Sempre que várias páginas tiverem estrutura semelhante, crie ou reutilize um layout compartilhado.
- Evite repetir regras de layout e responsividade em cada página.
- Centralize largura máxima, espaçamentos, breakpoints e comportamento de colunas em componentes ou estilos reutilizáveis.
- Prefira reutilizar layouts existentes antes de criar um novo.
- Alterações em layouts compartilhados devem preservar a compatibilidade com todas as páginas que os utilizam.

## Responsividade global do projeto

- Desenvolva todas as páginas com abordagem Mobile First e garanta seu funcionamento correto em desktops grandes, notebooks menores, tablets e celulares.
- Preserve a composição visual do Figma em telas grandes, adaptando dimensões e espaçamentos de forma fluida conforme o espaço disponível.
- Trate o Figma como referência visual oficial, e não como um conjunto de dimensões rígidas que só funcionam na viewport original.
- Evite alturas e larguras fixas excessivas. Prefira `max-width`, `min()`, `max()`, `clamp()`, unidades relativas e media queries quando fizer sentido.
- Considere tanto a largura quanto a altura da viewport. Use media queries por altura quando a composição puder ultrapassar notebooks com pouca área vertical.
- Em notebooks de 13 polegadas, especialmente em 1366×768 e 1280×720, mantenha a página totalmente utilizável com zoom de 100%.
- Não use `overflow: hidden` para esconder conteúdo importante. O recorte de elementos puramente decorativos pode ser tratado separadamente sem impedir o acesso ao conteúdo.
- Permita rolagem apenas quando o conteúdo realmente exigir, como fallback para telas pequenas ou páginas naturalmente longas; não provoque rolagem apenas por paddings, gaps ou dimensões excessivas.
- Mantenha consistência visual e comportamento responsivo entre páginas por meio de componentes, templates e estilos compartilhados.
- Em layouts com duas ou mais colunas, reorganize, reduza ou empilhe o conteúdo conforme o espaço disponível, sem sobreposição ou corte.
- Preserve cores, tipografia, hierarquia visual e identidade do design durante qualquer adaptação responsiva.

### Padrões extraídos da tela de login

- Limite containers com construções como `width: min(100%, <largura-máxima>)`, permitindo que ocupem o espaço disponível sem crescer indefinidamente.
- Use `clamp()` para paddings e gaps fluidos, mantendo limites mínimos e máximos coerentes com o Figma.
- Defina o breakpoint de colunas pelo espaço real necessário ao conteúdo. Na autenticação, o layout de duas colunas é ativado a partir de `820px`.
- Preserve imagens responsivas com proporção natural, usando combinações como `max-width: 100%`, `width: auto` e altura limitada pela viewport quando necessário.
- Para desktops com pouca altura, aplique compactação progressiva. A tela de login usa `max-height: 800px` para reduzir paddings, banner e espaçamentos, e `max-height: 700px` para uma redução adicional e controlada de campos, botões e tipografia.
- Em versões compactas, calcule a largura do container a partir do conteúdo quando isso evitar áreas laterais vazias, sempre mantendo `max-width: 100%`.
- Reduza primeiro espaços externos, paddings, gaps e elementos visuais grandes. Diminua campos, botões e tipografia apenas quando ainda for necessário, preservando legibilidade e alvos interativos.
- Mantenha `min-height: 100svh` quando a página precisar ocupar a viewport, sem impor altura fixa ao painel ou ao conteúdo interno.
- Em telas estreitas, permita que linhas flexíveis quebrem ou mudem de direção antes que seus elementos se sobreponham.

### Validação obrigatória

- Antes de concluir uma nova página ou alteração relevante de layout, valide pelo menos nas seguintes resoluções:
  - 1920×1300
  - 1366×768
  - 1280×720
  - 1024×768
  - 768×1024
  - 390×844
- Verifique também zoom de 100%, ausência de cortes, sobreposições e rolagem causada apenas por espaçamento excessivo.
- Execute `corepack pnpm build:web` após alterações relevantes no front-end e corrija todos os erros antes de concluir.

## Segurança e credenciais

- Nunca exiba, registre ou versione tokens, senhas ou credenciais.
- Arquivos `.env` devem permanecer fora do Git.
- Use somente as permissões mínimas necessárias em integrações externas.
- Nunca inclua valores reais de segredos em prompts, planos, logs ou documentação.

## Ferramentas e integrações

- Utilize integrações externas somente quando agregarem contexto relevante à tarefa.
- Sempre explique ao usuário qual ferramenta será utilizada e por quê.
- Nunca execute ações destrutivas automaticamente (merge, exclusão ou alteração remota) sem confirmação explícita do usuário.
- Sempre valide resultados obtidos por integrações antes de concluir uma tarefa.
- Prefira utilizar integrações oficiais quando disponíveis.
