# Recuperação e redefinição de senha

## Objetivo

Concluir a interface do módulo de autenticação com páginas responsivas de recuperação e redefinição de senha, sem integração com API.

## Arquitetura

- páginas específicas sob `pages`;
- formulários sob `organisms`;
- mensagens de status compartilhadas sob `molecules`;
- shell e responsividade centralizados em `AuthTemplate` e `AuthForm`.

## Componentes reutilizados

- `AuthTemplate`;
- `AuthForm`;
- `FormField` e `Input`;
- `Button`;
- banners responsivos do Login.

## Arquivos modificados

- rotas locais em `App.tsx`;
- estados acessíveis de `FormField`, `Input` e `Button`;
- link de recuperação em `LoginForm`.

## Estratégia de testes

- validar erros, carregamento e sucesso por teclado;
- conferir as seis resoluções obrigatórias do `AGENTS.md`;
- executar `corepack pnpm build:web`.
