# Persistência da autenticação com PostgreSQL

## Objetivo

Substituir o array em memória do módulo de autenticação por persistência em PostgreSQL, sem alterar os contratos HTTP já publicados para cadastro, login e consulta do usuário autenticado.

Esta etapa abrange somente a API e a infraestrutura local do banco. A integração do front-end permanece fora do escopo.

## Estado atual analisado

- O monorepo usa pnpm workspaces, com a API NestJS em `apps/api`.
- `AuthService` mantém os usuários em um array privado de `StoredUser`.
- `POST /auth/register` normaliza o e-mail no DTO, verifica duplicidade em memória, gera UUID na aplicação e armazena `salt:hash` produzido com `scrypt`.
- `POST /auth/login` busca o usuário pelo e-mail normalizado, valida a senha com `scrypt` e `timingSafeEqual` e emite JWT com `sub` e `email`.
- `GET /auth/me` usa `JwtAuthGuard`; `JwtStrategy` procura o usuário do token pelo UUID no mesmo array.
- Os DTOs, o `ValidationPipe`, o JWT, o Swagger e os formatos de sucesso/erro já estão definidos e devem permanecer compatíveis.
- A configuração atual exige `JWT_SECRET` e aceita `JWT_EXPIRES_IN`, mas ainda não possui configuração de banco.
- Não há ORM, driver PostgreSQL, Docker Compose nem suíte de testes automatizados configurados.
- O `.gitignore` já ignora `.env`, `.env.*` e `*.tsbuildinfo`, mantendo `.env.example` versionável.

## Decisão de ORM

### Escolha: TypeORM

Será usado TypeORM com `@nestjs/typeorm` e o driver `pg`.

Justificativas:

- o NestJS oferece integração oficial e direta com TypeORM por meio de módulos, `forRootAsync`, `forFeature` e injeção de repositórios;
- a estrutura por entidades e repositórios se encaixa no padrão atual de módulos e services sem exigir um cliente gerado ou uma camada de providers própria;
- atende bem ao domínio relacional simples desta etapa e suporta UUID, índices únicos, tipos nativos do PostgreSQL e migrations versionadas;
- facilita testes unitários pela substituição do repository provider;
- mantém toda a implementação em TypeScript e adiciona pouca convenção externa ao projeto atual.

Referências da decisão: [integração de banco do NestJS](https://docs.nestjs.com/techniques/database) e [migrations do TypeORM](https://typeorm.io/docs/advanced-topics/migrations/).

### Alternativas consideradas

1. **Prisma**
   - Pontos favoráveis: cliente fortemente tipado, schema declarativo e fluxo de migrations maduro.
   - Motivo para não escolher agora: acrescentaria geração de cliente, schema e um service/provider específico, criando um segundo modelo de tipos fora das entidades NestJS para um domínio ainda pequeno. Continua sendo uma boa opção caso o projeto priorize uma camada de acesso independente do Nest no futuro.

2. **Drizzle ORM**
   - Pontos favoráveis: API enxuta, forte inferência de tipos e migrations SQL transparentes.
   - Motivo para não escolher agora: não possui a mesma integração oficial pronta com os módulos e a injeção de dependência do NestJS; seria necessário definir e manter providers e abstrações adicionais.

3. **Sequelize**
   - Também possui integração oficial com NestJS, mas TypeORM oferece um modelo de entidades e decorators mais alinhado ao código TypeScript atual, sem vantagem relevante do Sequelize para esta modelagem.

## Arquitetura proposta

```text
AuthController
      |
      v
 AuthService ---- JwtService
      |
      v
 UsersService
      |
      v
 Repository<User> ---- PostgreSQL

JwtStrategy ---> AuthService/UsersService ---> Repository<User>
```

- `AuthController` continuará apenas delegando as operações e conservará rotas, status, DTOs e decorators Swagger.
- `AuthService` continuará responsável pelas regras de autenticação: hash, verificação de senha, emissão de JWT e composição das respostas públicas.
- Um `UsersService` concentrará o acesso a usuários e esconderá detalhes do repository de `AuthService`.
- `UsersModule` registrará `User` com `TypeOrmModule.forFeature([User])` e exportará `UsersService`.
- Um `DatabaseModule` centralizará a conexão configurada por ambiente e será importado por `AppModule`.
- `JwtStrategy.validate` passará a ser assíncrono, pois a validação de `sub` consultará o PostgreSQL.
- A conversão para usuário público continuará explícita; entidade e hash nunca serão retornados diretamente pelos controllers.

## Modelagem da entidade `User`

Tabela `users`:

| Propriedade | Coluna | Tipo PostgreSQL | Regras |
| --- | --- | --- | --- |
| `id` | `id` | `uuid` | chave primária, fornecida pela aplicação |
| `nome` | `nome` | `varchar(100)` | obrigatório |
| `email` | `email` | `varchar(254)` | obrigatório e único |
| `passwordHash` | `password_hash` | `varchar(255)` | obrigatório e excluído das consultas padrão |
| `createdAt` | `created_at` | `timestamptz` | preenchido automaticamente |
| `updatedAt` | `updated_at` | `timestamptz` | atualizado automaticamente |

Decisões da modelagem:

- O UUID continuará sendo gerado na aplicação com `randomUUID()`, como na implementação atual, e exposto como `string`. A entidade e a migration apenas persistirão esse UUID, sem delegar sua geração ao PostgreSQL ou ao TypeORM.
- `email` terá constraint única no banco. A normalização para `trim().toLowerCase()` continuará nos DTOs.
- A constraint será a fonte final de verdade contra cadastros concorrentes. A violação PostgreSQL `23505` será convertida para o mesmo `409 Conflict` e a mesma mensagem pública atuais.
- `password_hash` armazenará exatamente o formato atual `salt:derivedKeyHex`. Com salt de 16 bytes em hexadecimal e chave de 64 bytes em hexadecimal, não haverá senha em texto puro. O tamanho de 255 permite futura evolução controlada do formato.
- `passwordHash` usará `select: false`; somente a consulta interna de login fará seleção explícita dessa coluna.
- Datas serão internas e não entrarão nos DTOs de resposta, no JWT ou no Swagger público.

## Dependências e scripts

### Dependências de execução

- `@nestjs/typeorm`: integração do TypeORM com módulos e providers NestJS;
- `typeorm`: entidades, repositories, conexão e migrations;
- `pg`: driver PostgreSQL;
- `dotenv`: carregamento explícito de ambiente pelo DataSource usado na CLI de migrations.

### Dependência de desenvolvimento

- `ts-node`, necessário para a CLI do TypeORM consumir o DataSource TypeScript no desenvolvimento.

As versões deverão ser instaladas com Corepack/pnpm pela raiz e compatibilizadas com NestJS e TypeScript já presentes. Nenhum lockfile adicional será criado; `pnpm-lock.yaml` será atualizado.

Scripts previstos em `apps/api/package.json`:

- `migration:generate`: `typeorm-ts-node-commonjs migration:generate -d src/database/data-source.ts`;
- `migration:run`: `typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts`;
- `migration:revert`: `typeorm-ts-node-commonjs migration:revert -d src/database/data-source.ts`;

Não será usado `schema:sync`, `db push` nem `synchronize: true`.

## Estrutura de arquivos

```text
compose.yaml
apps/api/
  .env.example
  package.json
  src/
    app.module.ts
    auth/
      auth.controller.ts
      auth.module.ts
      auth.service.ts
      interfaces/user.interface.ts
      strategies/jwt.strategy.ts
    database/
      database.module.ts
      database.config.ts
      data-source.ts
      migrations/
        <timestamp>-create-users-table.ts
    users/
      entities/user.entity.ts
      users.module.ts
      users.service.ts
package.json
pnpm-lock.yaml
```

Responsabilidades:

- `database.config.ts`: construir uma única configuração reutilizável de conexão, sempre com `synchronize: false` e migrations explícitas;
- `data-source.ts`: expor o `DataSource` standalone exigido pela CLI usando a mesma fábrica de `database.config.ts`, sem duplicar opções e sem imprimir credenciais;
- `database.module.ts`: registrar a conexão via `TypeOrmModule.forRootAsync` e `ConfigService`;
- `user.entity.ts`: representar a tabela e proteger `passwordHash` com `select: false`;
- `users.service.ts`: criar e consultar usuários, selecionar hash somente no login e traduzir duplicidade de e-mail;
- migration inicial: criar `users`, chave primária UUID, constraint única e colunas de auditoria;

`StoredUser` deixará de representar um item em memória. `PublicUser`, `AuthenticatedRequest` e `JwtPayload` serão preservados; os tipos internos serão ajustados para receber `User` sem expor a entidade nas respostas.

## Estratégia de migrations

1. Criar a entidade e a configuração do DataSource.
2. Gerar a migration inicial com a CLI do TypeORM.
3. Revisar o SQL gerado para confirmar nomes, tamanhos, `NOT NULL`, UUID, timestamps e constraint única de e-mail.
4. Versionar a migration junto com a entidade e o lockfile.
5. Aplicar migrations explicitamente antes de iniciar/validar a API.
6. Manter `synchronize: false` em todos os ambientes e `migrationsRun: false`, evitando alterações automáticas e não revisadas no schema durante o bootstrap.
7. Em ambientes compartilhados ou produção, executar apenas `migration:run`; `migration:generate` ficará restrito ao desenvolvimento.

Como a persistência anterior é somente em memória, não existe dado legado a migrar. A migration inicial criará uma tabela vazia.

## Configuração por variáveis de ambiente

`apps/api/.env.example` será atualizado com valores exclusivamente ilustrativos:

```dotenv
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1h
DATABASE_URL=postgresql://codeconnect:replace-me@localhost:5432/codeconnect
POSTGRES_DB=codeconnect
POSTGRES_USER=codeconnect
POSTGRES_PASSWORD=replace-me
POSTGRES_PORT=5432
```

- `DATABASE_URL` será obrigatória no bootstrap, assim como `JWT_SECRET`.
- A validação rejeitará valores ausentes ou vazios sem incluir a URL/credenciais na mensagem ou nos logs.
- `DATABASE_URL` será consumida pela API e pela CLI do TypeORM.
- As variáveis `POSTGRES_*` serão usadas apenas pelo Compose para inicializar o banco local e publicar a porta.
- O Compose será executado com `--env-file apps/api/.env`, pois o arquivo real permanece ignorado e não fica na raiz.
- Credenciais reais nunca serão adicionadas ao `.env.example`, ao Compose, às migrations, aos testes ou à documentação.
- Configurações SSL específicas de um provedor deverão ser adicionadas quando houver um ambiente de implantação definido; não será desabilitada a validação de certificado de forma genérica.

## Docker Compose e volume persistente

Será criado `compose.yaml` na raiz com um serviço `postgres`:

- imagem oficial `postgres:16-alpine`, fixada na versão major;
- porta do host configurável por `POSTGRES_PORT`, apontando para `5432` no container;
- `POSTGRES_DB`, `POSTGRES_USER` e `POSTGRES_PASSWORD` recebidos do arquivo de ambiente, sem defaults de senha no arquivo versionado;
- healthcheck com `pg_isready`;
- volume nomeado `postgres_data` montado em `/var/lib/postgresql/data`;
- sem serviço da aplicação nesta etapa, preservando o desenvolvimento da API pelos scripts pnpm existentes.

`docker compose down` removerá os containers e a rede, mas manterá `postgres_data`. `docker compose down -v` não fará parte do fluxo normal, pois apaga os dados e só deverá ser usado após confirmação explícita para um reset local.

## Alterações nos modules e services

### `AppModule`

- manter `ConfigModule` global;
- ampliar `validateEnvironment` para exigir `DATABASE_URL` sem remover as validações de JWT;
- importar `DatabaseModule` antes dos módulos que usam repositories.

### `DatabaseModule`

- configurar PostgreSQL por `TypeOrmModule.forRootAsync` e `ConfigService`;
- reutilizar a mesma fábrica de opções usada pelo DataSource da CLI, evitando divergência entre runtime e migrations;
- registrar entidades e migrations para execução em TypeScript durante desenvolvimento e JavaScript compilado quando aplicável;
- manter sincronização e execução automática de migration desabilitadas.

### `UsersModule` e `UsersService`

- registrar e injetar `Repository<User>`;
- implementar criação do usuário;
- implementar busca por e-mail com seleção explícita de `passwordHash` para login;
- implementar busca pública por ID para validação do JWT;
- converter a constraint única de e-mail em `ConflictException` com `Já existe um usuário com este email.`;
- nunca retornar ou registrar `passwordHash`.

### `AuthModule` e `AuthService`

- importar `UsersModule`;
- remover o array `users`, preservando o uso de `randomUUID()` na camada de autenticação;
- injetar `UsersService`;
- manter `randomBytes`, `scrypt`, `KEY_LENGTH`, `timingSafeEqual` e o formato `salt:hash` sem alterações funcionais;
- manter payload JWT, mensagens e mapeamento para `PublicUser`;
- tornar as buscas persistidas assíncronas.

### `JwtStrategy`

- aguardar a consulta ao banco por `payload.sub`;
- manter `UnauthorizedException('Token inválido.')` quando o usuário não existir;
- não confiar no e-mail do token para montar a resposta atual: os dados públicos virão do registro persistido localizado por ID.

### `AuthController`, DTOs, Swagger e contratos

- não alterar rotas, status HTTP, formatos de body ou validações;
- atualizar somente a descrição Swagger de cadastro que hoje afirma que o usuário é mantido em memória;
- continuar ocultando senha, hash, salt e campos internos do banco em todas as respostas e schemas públicos.

## Contratos HTTP que devem ser preservados

### `POST /auth/register`

- `201 Created` com `{ message: 'Usuário cadastrado com sucesso.', data: { id, nome, email } }`;
- `400 Bad Request` para DTO inválido;
- `409 Conflict` com `Já existe um usuário com este email.` para duplicidade, inclusive em cadastros concorrentes.

### `POST /auth/login`

- `200 OK` com `{ message: 'Login realizado com sucesso.', data: { accessToken, user } }`;
- `400 Bad Request` para formato inválido;
- `401 Unauthorized` com a mensagem genérica `Email ou senha inválidos.` tanto para usuário inexistente quanto para senha incorreta, sem permitir enumeração de contas.

### `GET /auth/me`

- exigir `Authorization: Bearer <token>`;
- `200 OK` com `{ message: 'Usuário autenticado recuperado com sucesso.', data: { id, nome, email } }`;
- `401 Unauthorized` para token ausente, inválido, expirado ou cujo usuário não exista mais.

## Segurança

- Nunca persistir `senha` nem qualquer senha em texto puro.
- Preservar salt aleatório de 16 bytes, derivação `scrypt` com chave de 64 bytes e comparação com `timingSafeEqual`.
- Armazenar somente `salt:hash` em `password_hash`, marcada como não selecionável por padrão.
- Nunca serializar entidade diretamente nem incluir `passwordHash` em JWT, logs, Swagger ou erros.
- Manter mensagens de login idênticas e genéricas nos dois casos de falha.
- Fazer a unicidade de e-mail valer no PostgreSQL, evitando condição de corrida entre requisições.
- Não criar seed com credenciais conhecidas nesta etapa.
- Não versionar `.env` nem credenciais reais; conferir o diff antes do commit.
- Executar migrations com usuário de banco limitado ao banco da aplicação. Uma futura separação entre usuário de migration e usuário de runtime poderá ser feita quando houver ambiente de implantação.

## Estratégia de validação

### Validação manual com PostgreSQL real

- Validar cadastro, normalização de e-mail, duplicidade sequencial e duas tentativas concorrentes com o mesmo e-mail.
- Consultar o banco para confirmar que `password_hash` contém salt e hash, não equivale à senha e não aparece em respostas.
- Validar login correto, usuário inexistente, senha errada e igualdade das mensagens de falha.
- Validar `/auth/me` com token válido, ausente e malformado.
- Validar o documento OpenAPI em `/api-json`, confirmando os mesmos paths e schemas públicos.
- Reiniciar a API e o container e confirmar que cadastro, login e `/auth/me` continuam funcionando com o mesmo usuário, demonstrando persistência no volume.

### Validação estática e de build

- executar lint da API;
- executar `corepack pnpm build:api` pela raiz;
- conferir que nenhum arquivo do front-end foi alterado;
- conferir que `.env`, senha, token ou URL real não aparecem no diff.

## Comandos previstos

Todos os comandos serão executados pela raiz do monorepo.

### Preparar ambiente e instalar dependências

```powershell
Copy-Item apps/api/.env.example apps/api/.env
corepack pnpm --filter @code-connect/api add @nestjs/typeorm typeorm pg dotenv
corepack pnpm --filter @code-connect/api add -D ts-node
```

Após copiar o arquivo, substituir localmente os placeholders de `JWT_SECRET` e `POSTGRES_PASSWORD` e manter o arquivo fora do Git.

### Subir e verificar o PostgreSQL

```powershell
docker compose --env-file apps/api/.env up -d postgres
docker compose --env-file apps/api/.env ps
docker compose --env-file apps/api/.env logs postgres
```

### Gerar e aplicar migrations

```powershell
corepack pnpm --filter @code-connect/api migration:generate src/database/migrations/create-users-table
corepack pnpm --filter @code-connect/api migration:run
```

A migration inicial será gerada uma vez, revisada e versionada. Em uma instalação normal ou CI será executado somente `migration:run`.

### Testar, buildar e iniciar a API

```powershell
corepack pnpm --filter @code-connect/api lint
corepack pnpm build:api
corepack pnpm dev:api
```

### Validar persistência e contratos

1. Cadastrar um usuário por `POST /auth/register` e guardar somente o JWT retornado posteriormente pelo login.
2. Repetir o cadastro com o mesmo e-mail e confirmar `409` e a mensagem atual.
3. Fazer login correto e incorreto, confirmando respostas e ausência de hash.
4. Consultar `GET /auth/me` com Bearer token válido e inválido.
5. Consultar `/api-json` e comparar paths e schemas com os contratos descritos acima.
6. Reiniciar API e PostgreSQL sem remover volumes:

```powershell
docker compose --env-file apps/api/.env restart postgres
```

7. Repetir login e `/auth/me`; o usuário deve continuar disponível.
8. Encerrar os containers preservando os dados:

```powershell
docker compose --env-file apps/api/.env down
```

## Ordem de implementação após aprovação

1. Instalar dependências e adicionar scripts, atualizando apenas `pnpm-lock.yaml`.
2. Criar `compose.yaml`, atualizar `.env.example` e validar a resolução das variáveis sem expor seus valores.
3. Criar a configuração reutilizável do banco, DataSource, entidade `User`, `UsersModule` e `UsersService`.
4. Gerar, revisar e aplicar a migration inicial.
5. Refatorar `AuthModule`, `AuthService` e `JwtStrategy` para operações assíncronas persistidas.
6. Atualizar somente a descrição desatualizada do Swagger no controller.
7. Executar lint, migrations, build e validação manual dos contratos e persistência.
8. Revisar o diff para garantir que o front-end, credenciais reais e alterações não relacionadas ficaram fora do escopo.
9. Somente após todas as validações e revisão final do usuário, criar commit Conventional Commit e abrir Pull Request; merge dependerá de confirmação explícita.

## Critérios de aceite

- usuários permanecem disponíveis após reinício da API e do container PostgreSQL;
- `POST /auth/register`, `POST /auth/login` e `GET /auth/me` mantêm status, mensagens, validações e formatos públicos;
- e-mail é único também sob concorrência;
- senha em texto puro nunca é persistida, retornada ou registrada;
- hash e salt continuam usando o formato e os parâmetros atuais;
- migrations são versionadas e `synchronize` permanece desabilitado;
- o Compose usa volume nomeado persistente e credenciais vindas do ambiente;
- Swagger e JWT continuam funcionais;
- lint, `corepack pnpm build:api` e a validação manual dos endpoints passam;
- nenhum arquivo do front-end é alterado.

## Fora do escopo

- integração do front-end;
- recuperação/redefinição de senha;
- provedores sociais;
- refresh token, revogação de tokens ou sessões;
- perfis e autorização por papéis;
- deploy ou escolha de provedor PostgreSQL gerenciado;
- migração de dados legados, pois o armazenamento atual é volátil.
- infraestrutura de testes automatizados com Jest, Supertest ou e2e.

## Ponto de aprovação

Nenhuma implementação descrita neste documento deve começar antes da aprovação explícita deste plano.
