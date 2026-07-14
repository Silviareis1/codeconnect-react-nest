# Autenticação da API

## Objetivo

Implementar o primeiro módulo de autenticação da API CodeConnect, com cadastro, login e consulta do usuário autenticado, mantendo os usuários exclusivamente em memória nesta etapa.

## Arquitetura

- `AuthModule` como módulo responsável pela autenticação;
- `AuthController` apenas para receber requisições e delegar operações;
- `AuthService` concentrando cadastro, autenticação e acesso aos usuários em memória;
- DTOs concretos com `class-validator` para validar os corpos das requisições;
- `JwtStrategy` integrada ao Passport para validar JWTs e recuperar o usuário atual;
- `JwtAuthGuard` para proteger `GET /auth/me`;
- interfaces separando o usuário armazenado, o usuário público e o payload JWT;
- configuração global de ambiente, validação e Swagger no bootstrap da aplicação;
- respostas de sucesso padronizadas com `message` e `data`, mantendo o formato de erros HTTP do NestJS.

Os usuários serão armazenados em um array privado do `AuthService`. As senhas serão protegidas com `scrypt`, salt aleatório e comparação segura usando apenas `node:crypto`.

## Componentes reutilizados

- `AppModule` como módulo raiz;
- `main.ts` como ponto central do bootstrap, validação global e Swagger;
- scripts existentes da raiz para instalação, build e execução da API;
- `.gitignore` existente, que já impede o versionamento de arquivos `.env` e permite `.env.example`.

## Arquivos modificados

- `apps/api/package.json`;
- `pnpm-lock.yaml`;
- `apps/api/src/main.ts`;
- `apps/api/src/app.module.ts`.

## Arquivos criados

- `apps/api/.env.example`;
- `apps/api/src/auth/auth.module.ts`;
- `apps/api/src/auth/auth.controller.ts`;
- `apps/api/src/auth/auth.service.ts`;
- DTOs de registro, login e respostas;
- interfaces de usuário e payload JWT;
- `apps/api/src/auth/strategies/jwt.strategy.ts`;
- `apps/api/src/auth/guards/jwt-auth.guard.ts`.

## Contratos HTTP

### `POST /auth/register`

- valida nome, e-mail e senha;
- normaliza o e-mail antes de verificar duplicidade;
- retorna `201 Created` sem senha ou hash;
- retorna `400 Bad Request` para dados inválidos;
- retorna `409 Conflict` para e-mail duplicado.

### `POST /auth/login`

- valida e-mail e senha;
- retorna `200 OK`, JWT e usuário público;
- retorna `401 Unauthorized` com mensagem genérica para credenciais inválidas.

### `GET /auth/me`

- exige `Authorization: Bearer <token>`;
- utiliza JWT Strategy e AuthGuard;
- retorna `200 OK` com o usuário autenticado;
- retorna `401 Unauthorized` para token ausente, inválido ou expirado.

## Configuração e Swagger

- `JWT_SECRET` será obrigatório e a aplicação falhará ao iniciar quando estiver ausente ou vazio;
- `JWT_EXPIRES_IN` definirá a expiração do token;
- `apps/api/.env.example` conterá somente as duas variáveis aprovadas;
- Swagger será disponibilizado em `/api`, com documento OpenAPI em `/api-json`;
- o esquema Bearer documentará explicitamente `Authorization: Bearer <token>`.

## Estratégia de testes

1. Executar `corepack pnpm build:api` pela raiz.
2. Confirmar que a aplicação falha sem `JWT_SECRET`.
3. Iniciar a aplicação compilada com segredo temporário apenas na sessão.
4. Confirmar resposta do Swagger em `/api` e presença das rotas em `/api-json`.
5. Validar cadastro válido, payload inválido, ausência de senha na resposta e e-mail duplicado.
6. Validar login válido e credenciais inválidas.
7. Validar `/auth/me` sem token, com token inválido e com Bearer token válido.
8. Confirmar que os usuários desaparecem após reiniciar a aplicação.

