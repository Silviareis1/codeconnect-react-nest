# Integração do front-end com a autenticação da API

## 1. Objetivo

Integrar as telas existentes de Cadastro e Login do front-end React com a API NestJS, centralizando comunicação HTTP, sessão JWT, tratamento de erros e estado de autenticação sem alterar a composição visual definida no Figma.

Esta etapa deverá:

- enviar o cadastro para `POST /auth/register`;
- enviar o login para `POST /auth/login`;
- validar e reidratar a sessão por `GET /auth/me`;
- enviar o JWT automaticamente nas requisições protegidas;
- oferecer uma operação central de logout;
- manter responsividade, acessibilidade, componentes Atomic Design e contratos HTTP atuais.

Não serão integrados recuperação de senha, redefinição de senha ou login social porque não existem endpoints correspondentes.

## 2. Estado atual analisado

### Monorepo

- O projeto usa pnpm workspaces e deve continuar sendo operado somente por Corepack/pnpm a partir da raiz.
- O front-end está em `apps/web`, com React, Vite e TypeScript estrito.
- A API está em `apps/api`, com NestJS, JWT, PostgreSQL e TypeORM.
- A branch atual é `feature/auth-integration`.
- Existe uma alteração prévia em `apps/api/tsconfig.build.tsbuildinfo`; ela não pertence a esta feature e deverá ser preservada.

### Front-end

- Não há cliente HTTP, Axios, React Router, contexto de autenticação ou armazenamento de token.
- `App.tsx` escolhe páginas diretamente por `window.location.pathname`.
- Login e Cadastro já usam Atomic Design, CSS Modules e o mesmo `AuthTemplate` responsivo.
- `LoginForm` apenas previne o submit e ainda possui valores demonstrativos (`usuario123` e `123456`).
- `RegisterForm` valida localmente apenas os requisitos visíveis da senha e também contém valores demonstrativos nos campos de nome e e-mail.
- Login e Cadastro exibem o checkbox “Lembrar-me”, inicialmente marcado.
- `AuthStatusMessage`, `FormField`, `PasswordField`, `Button` e `Checkbox` já oferecem bases acessíveis para erros, mensagens, loading e foco.
- Recuperação e redefinição possuem simulações locais com `setTimeout`; elas deverão permanecer exatamente fora da integração.
- Não existe página autenticada, dashboard, feed ou rota protegida no front-end.
- Não há infraestrutura de testes automatizados no front-end nem script de lint para `apps/web`.

### API e contratos

`POST /auth/register`:

- recebe `{ nome, email, senha }`;
- normaliza nome e e-mail no back-end;
- retorna `201` com `{ message, data: { id, nome, email } }`;
- retorna `400` com `message: string[]` para validações;
- retorna `409` com `message: 'Já existe um usuário com este email.'`;
- não retorna JWT.

`POST /auth/login`:

- recebe `{ email, senha }` — a API não aceita nome de usuário;
- retorna `200` com `{ message, data: { accessToken, user } }`;
- retorna `400` para formato inválido;
- retorna `401` com a mensagem genérica `Email ou senha inválidos.`.

`GET /auth/me`:

- exige `Authorization: Bearer <token>`;
- retorna `200` com `{ message, data: { id, nome, email } }`;
- retorna `401` para token ausente, inválido, expirado ou sem usuário persistido.

A API já habilita CORS e não exige cookies (`withCredentials` não será ativado).

## 3. Decisões arquiteturais

### Cliente HTTP

Será usado Axios por meio de uma instância criada com `axios.create`, mantendo `baseURL`, timeout, headers e interceptors fora dos componentes. Essa abordagem segue a recomendação oficial para aplicações com mais de um arquivo e isola os interceptors na instância do projeto.

Referências: [instâncias Axios](https://axios-http.com/docs/instance), [interceptors Axios](https://axios-http.com/docs/interceptors) e [variáveis de ambiente do Vite](https://vite.dev/guide/env-and-mode).

### Estado de autenticação

Um `AuthProvider` centralizará:

- usuário autenticado em memória;
- estado de inicialização da sessão;
- login;
- reidratação por `/auth/me`;
- logout;
- reação a `401` de requisição protegida.

Os formulários não acessarão Axios, Web Storage ou headers diretamente.

### Navegação

React Router não será instalado nesta etapa. O projeto continuará com a navegação atual por URL e `window.location.assign`.

Como ainda não existe área autenticada, a feature não criará dashboard ou tela sem referência no Figma. Após login, a sessão será confirmada com `/auth/me`, o usuário ficará disponível no `AuthProvider` e será exibido feedback acessível de sucesso. A futura navegação para uma página protegida deverá ser adicionada quando essa página e sua rota existirem.

### Cadastro não autentica

`POST /auth/register` não retorna token. Portanto:

- não haverá login automático inventado;
- após `201`, será mostrada confirmação acessível;
- a senha será descartada;
- o usuário será direcionado ao Login após um intervalo curto, permitindo que a mensagem seja anunciada;
- o checkbox “Lembrar-me” do cadastro apenas conservará a preferência para o próximo Login, sem armazenar senha ou criar uma falsa sessão.

## 4. Dependências previstas

### Execução

- `axios`: cliente HTTP e interceptors.

### Desenvolvimento para lint

- `eslint`, `@eslint/js`, `typescript-eslint` e `globals`: análise estática do código React/TypeScript, pois o pacote web ainda não possui script de lint.

As dependências deverão ser instaladas somente em `@code-connect/web`, usando Corepack/pnpm pela raiz. `pnpm-lock.yaml` será o único lockfile atualizado.

Script previsto em `apps/web/package.json`:

- `lint`: análise de `src` e da configuração Vite.

## 5. Estrutura proposta

```text
apps/web/
  .env.example
  package.json
  vite.config.ts
  src/
    main.tsx
    App.tsx
    vite-env.d.ts
    config/
      env.ts
    http/
      apiClient.ts
      apiError.ts
      axios.d.ts
    services/
      auth/
        auth.service.ts
        auth.types.ts
        auth.validation.ts
        tokenStorage.ts
        authEvents.ts
    contexts/
      AuthContext.tsx
    components/
      organisms/
        LoginForm/LoginForm.tsx
        RegisterForm/RegisterForm.tsx
      molecules/
        AuthStatusMessage/AuthStatusMessage.tsx
```

Não serão criados componentes visuais novos sem necessidade real nem infraestrutura de testes automatizados nesta feature.

## 6. Configuração por variáveis de ambiente do Vite

Será criado `apps/web/.env.example`:

```dotenv
VITE_API_URL=http://localhost:3000
```

Decisões:

- apenas a URL pública da API usará prefixo `VITE_`;
- nenhum segredo, JWT, senha ou chave privada será colocado em variável Vite, pois valores `VITE_*` entram no bundle do navegador;
- `vite-env.d.ts` declarará `VITE_API_URL` para tipagem e IntelliSense;
- `config/env.ts` lerá, removerá barra final e validará a URL uma única vez;
- ausência ou valor inválido produzirá erro de configuração claro, sem fallback silencioso para produção;
- o `.env` local continuará ignorado pelo Git;
- mudanças no arquivo exigirão reinício do Vite.

A URL não incluirá `/auth`; os services usarão paths absolutos relativos como `/auth/login`.

## 7. Camada HTTP centralizada

### `apiClient.ts`

Criará uma única instância Axios com:

- `baseURL` vinda de `VITE_API_URL`;
- timeout inicial de 10 segundos;
- header `Accept: application/json`;
- JSON enviado pelos aliases `post` normalmente;
- `withCredentials: false`, pois a autenticação atual é Bearer e não cookie;
- interceptors registrados uma única vez no carregamento do módulo, nunca dentro de componentes React.

### Identificação de requisição protegida

Será adicionada tipagem por module augmentation para uma opção própria, por exemplo:

```ts
type AuthenticatedRequestConfig = {
  requiresAuth?: boolean;
};
```

Somente chamadas com `requiresAuth: true` receberão Bearer automaticamente. Assim:

- Login e Cadastro nunca enviam um token antigo desnecessariamente;
- `/auth/me` declara explicitamente que é protegido;
- o interceptor de `401` sabe diferenciar credenciais inválidas no Login de sessão inválida numa rota protegida.

### Interceptor de request

Para `requiresAuth: true`:

1. ler o token atual via `tokenStorage` no instante da requisição;
2. se existir, configurar `Authorization: Bearer <token>`;
3. não registrar token, headers completos ou payload sensível;
4. se não existir, deixar a requisição seguir ou rejeitar com erro de sessão normalizado, conforme o comportamento que produzir a mensagem mais consistente em `/auth/me`.

Ler o token por requisição evita manter um header global obsoleto após login ou logout.

### Interceptor de response

- respostas bem-sucedidas serão preservadas sem mudar seu formato;
- erros continuarão rejeitados para o service/formulário decidir a apresentação;
- em `401` de uma requisição `requiresAuth`, o interceptor limpará a sessão persistida e publicará um evento interno de “não autorizado”;
- o `AuthProvider` ouvirá esse evento, removerá o usuário em memória e apresentará estado anônimo;
- `401` de `POST /auth/login` não acionará logout global nem será transformado em erro diferente;
- não haverá retry automático de `401`, porque não existe refresh token.

## 8. Organização dos services

### `auth.service.ts`

Funções puras de infraestrutura, sem estado React:

```ts
register(input: RegisterInput): Promise<RegisterResponse>
login(input: LoginInput): Promise<LoginResponse>
getMe(): Promise<UserDataResponse>
```

Responsabilidades:

- mapear nomes do front-end para `{ nome, email, senha }`;
- usar `apiClient`;
- tipar respostas;
- marcar somente `getMe` com `requiresAuth: true`;
- retornar `response.data`, sem espalhar `AxiosResponse` pelos componentes.

### `tokenStorage.ts`

Única camada autorizada a acessar `localStorage` e `sessionStorage`:

```ts
getAccessToken(): string | null
setAccessToken(token: string, persistence: 'local' | 'session'): void
clearAccessToken(): void
```

Ao gravar em um storage, removerá qualquer cópia do outro. `clearAccessToken` limpará ambos para evitar sessão residual.

A mesma camada oferecerá funções separadas para salvar e consumir, em `sessionStorage`, apenas a preferência booleana de “Lembrar-me” vinda do Cadastro. Essa preferência terá chave própria, será consumida uma vez no Login e nunca compartilhará valor ou chave com o token.

### `authEvents.ts`

Canal interno pequeno e tipado para notificar `AuthProvider` sobre `401` protegido sem importar React na camada HTTP. Deve permitir inscrição e remoção do listener, evitando interceptors duplicados ou vazamento de memória.

### `auth.validation.ts`

Concentrará validações compartilhadas entre formulários e mapeamento de mensagens do back-end para campos conhecidos, sem misturar regras HTTP nos componentes.

## 9. Tipagens

`auth.types.ts` deverá refletir os contratos reais:

```ts
type AuthUser = {
  id: string;
  nome: string;
  email: string;
};

type RegisterInput = {
  nome: string;
  email: string;
  senha: string;
};

type LoginInput = {
  email: string;
  senha: string;
};

type UserDataResponse = {
  message: string;
  data: AuthUser;
};

type LoginResponse = {
  message: string;
  data: {
    accessToken: string;
    user: AuthUser;
  };
};

type ApiErrorResponse = {
  statusCode: number;
  message: string | string[];
  error?: string;
};
```

Não será decodificado JWT para obter usuário ou decidir validade. O servidor, por `/auth/me`, continuará sendo a fonte oficial da sessão.

## 10. Estratégia de armazenamento do JWT

O contrato atual entrega Bearer token no JSON e não oferece cookie HttpOnly ou refresh token. Dentro desse limite:

- “Lembrar-me” marcado: armazenar em `localStorage`, persistindo entre sessões do navegador;
- “Lembrar-me” desmarcado: armazenar em `sessionStorage`, limitado à aba/sessão;
- manter somente o `accessToken` no Web Storage;
- manter `AuthUser` apenas em memória e reidratá-lo por `/auth/me` ao recarregar;
- nunca armazenar senha, resposta completa de Login ou erro contendo dados do formulário;
- usar chave com namespace, por exemplo `codeconnect.auth.accessToken`;
- limpar local e session storage em logout e `401` protegido;
- nunca imprimir o token em console, telemetria ou mensagem.

Risco reconhecido: qualquer Web Storage acessível por JavaScript é exposto a XSS. A mitigação definitiva exigiria mudança de contrato para cookies HttpOnly/refresh token, fora desta etapa. A implementação deverá evitar HTML não confiável, manter React escapando conteúdo e limitar ao token o dado persistido.

## 11. `AuthProvider` e consumo de `/auth/me`

Estado sugerido:

```ts
type AuthStatus = 'initializing' | 'anonymous' | 'authenticated';

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  sessionError: 'unavailable' | null;
  login(input: LoginInput, rememberMe: boolean): Promise<AuthUser>;
  logout(reason?: 'manual' | 'unauthorized'): void;
  refreshUser(): Promise<AuthUser | null>;
};
```

Fluxo de inicialização:

1. `main.tsx` envolve `App` com `AuthProvider`.
2. O provider procura token pela abstração de storage.
3. Sem token: muda imediatamente para `anonymous`.
4. Com token: chama `GET /auth/me` com Bearer automático.
5. `200`: armazena somente o usuário em memória e define `authenticated`.
6. `401`: storage e usuário são limpos e o estado vira `anonymous`.
7. Erro de rede/servidor: não mascarar como credencial inválida; expor uma falha recuperável e evitar apagar token válido sem evidência de `401`.

O efeito deverá ser idempotente e seguro sob `StrictMode`, sem registrar interceptors a cada montagem ou produzir atualização depois do unmount.

## 12. Integração do Login

### Campos e validação

- remover valores demonstrativos;
- tornar e-mail e senha controlados;
- usar `name="email"`, `type="email"` e `autoComplete="email"`;
- alterar o texto “Email ou usuário” para “Email”, pois a API aceita somente e-mail, preservando posição, tipografia e dimensões do layout;
- validar e-mail obrigatório, formato e máximo de 254 caracteres;
- validar senha obrigatória;
- usar `noValidate` e mensagens controladas para comportamento consistente e acessível;
- limpar o erro do campo ao editar sem apagar prematuramente erros dos outros campos.

### Submit

1. prevenir recarregamento;
2. validar localmente;
3. limpar status global anterior;
4. definir `submitting`;
5. desabilitar campos, checkbox e botão para impedir envio duplicado;
6. chamar `AuthProvider.login`;
7. armazenar token segundo “Lembrar-me”;
8. chamar `/auth/me` para validar Bearer e obter usuário oficial;
9. exibir sucesso acessível e manter a sessão central disponível;
10. restaurar o estado interativo se houver falha.

O botão manterá o mesmo tamanho e seta. Durante envio:

- texto muda para “Entrando...”;
- `disabled` e `aria-busy="true"`;
- o formulário pode receber `aria-busy` sem remover controles da árvore acessível.

### Erros de Login

- `400`: associar mensagens conhecidas a e-mail/senha e deixar mensagem desconhecida no status global;
- `401`: mostrar apenas `Email ou senha inválidos.` em `AuthStatusMessage` global, sem indicar qual credencial falhou;
- timeout/rede: “Não foi possível conectar à API. Tente novamente.”;
- `5xx`: mensagem genérica de indisponibilidade;
- nunca substituir a mensagem genérica de Login por enumeração de conta.

## 13. Integração do Cadastro

### Campos e validação

- remover valores demonstrativos;
- controlar nome, e-mail e senha;
- enviar nomes de payload `nome`, `email` e `senha` no service;
- nome: `trim`, obrigatório, entre 2 e 100 caracteres;
- e-mail: `trim`, minúsculas, formato válido e máximo 254;
- senha: mínimo 8, máximo 128, maiúscula, minúscula, número e caractere especial;
- preservar a lista visual atual de requisitos; `maxLength={128}` reforçará o limite sem adicionar uma linha visual não prevista no Figma;
- marcar requisitos inválidos após blur ou tentativa de submit;
- manter o checkbox “Lembrar-me” no mesmo local.

### Submit

1. validar todos os campos, inclusive nome e e-mail;
2. impedir envio duplicado com loading e controles desabilitados;
3. chamar `authService.register`;
4. em `201`, mostrar a mensagem de sucesso do contrato;
5. limpar a senha da memória do componente;
6. guardar apenas a preferência não sensível de “Lembrar-me” em `sessionStorage` para inicializar o Login;
7. redirecionar para `/` após intervalo curto e cancelável no unmount;
8. não criar token nem usuário autenticado, pois Cadastro não retorna JWT.

Durante loading, o botão manterá o layout e mostrará “Cadastrando...”, com `disabled` e `aria-busy`.

### Erros de Cadastro

- `400`: mapear mensagens iniciadas por `nome`, `email` ou `senha` para o respectivo `FormField`/`PasswordField`;
- múltiplas mensagens de senha poderão ser condensadas numa mensagem de campo enquanto a lista de requisitos continua indicando cada regra;
- `409`: associar `Já existe um usuário com este email.` ao campo de e-mail e focá-lo;
- erro não mapeável, rede ou `5xx`: usar `AuthStatusMessage` global;
- nunca apagar valores de nome/e-mail após uma falha;
- nunca reter ou registrar a senha fora do estado transitório do formulário.

## 14. Tratamento centralizado de erros

`apiError.ts` converterá `unknown` em um tipo previsível:

```ts
type NormalizedApiError = {
  kind: 'validation' | 'unauthorized' | 'conflict' | 'network' | 'server' | 'unknown';
  status?: number;
  messages: string[];
};
```

Regras:

- usar `axios.isAxiosError<ApiErrorResponse>`;
- `error.response`: interpretar status e body do NestJS;
- `error.request`/timeout: classificar como rede;
- erro de configuração: classificar como desconhecido e não mostrar detalhes técnicos;
- aceitar `message` string ou array;
- preservar mensagens seguras conhecidas do servidor;
- nunca renderizar stack, URL com credenciais, config Axios ou payload bruto;
- componentes recebem somente erro normalizado.

## 15. Logout e sessão expirada

Não existe endpoint de logout/revogação na API. O logout atual será local:

1. limpar token de `localStorage` e `sessionStorage`;
2. limpar usuário e erro de sessão no `AuthProvider`;
3. definir estado `anonymous`;
4. direcionar para `/` quando o logout for acionado fora da tela de Login.

Para `401` protegido:

- executar a mesma limpeza central;
- disponibilizar mensagem “Sua sessão expirou. Entre novamente.”;
- não repetir a requisição;
- preservar o destino atual somente no futuro, quando existirem rotas protegidas.

Como não há tela autenticada nem header com referência no Figma, esta feature implementará e testará a operação `logout`, mas não inventará um novo botão ou página. O controle visual de logout deverá ser conectado pela primeira área autenticada.

## 16. Preservação do Figma, responsividade e acessibilidade

### Layout

- não alterar `AuthTemplate`, banners, grafismos, grid, breakpoints, largura do painel ou hierarquia;
- reutilizar os CSS Modules existentes;
- adicionar apenas espaço/estilo indispensável para mensagens já suportadas por `AuthStatusMessage` e `FormField`;
- evitar que erros provoquem sobreposição; o painel pode crescer verticalmente e a página deve rolar quando necessário;
- não esconder erros com `overflow` ou altura fixa;
- manter Mobile First e breakpoint principal de autenticação em 820px.

### Estados acessíveis

- erros globais usam `role="alert"` e `aria-live` já oferecidos por `AuthStatusMessage`;
- sucesso usa `role="status"` e `aria-live="polite"`;
- erros de campo continuam ligados por `aria-describedby` e `aria-invalid`;
- após submit inválido, focar o primeiro campo inválido;
- em `409`, focar e-mail;
- durante loading, preservar foco, indicar `aria-busy` e desabilitar controles;
- não alterar ordem de tabulação;
- manter foco visível e toggle de senha acessível;
- mensagens não dependerão somente de cor;
- redirecionamentos após sucesso terão intervalo suficiente para anúncio e timer cancelado no unmount.

### Resoluções obrigatórias

Validar em zoom 100%:

- 1920×1300;
- 1366×768;
- 1280×720;
- 1024×768;
- 768×1024;
- 390×844.

Em cada resolução, testar estados idle, loading, erro de campo, erro global e sucesso, sem corte, sobreposição ou scroll causado somente por espaçamento.

## 17. Estratégia de validação estática

- executar o lint do front-end;
- executar o build TypeScript/Vite;
- conferir que a camada HTTP está tipada e não usa `any` para escapar dos contratos;
- conferir que nenhum token, senha, stack ou config Axios é registrado;
- conferir que Login e Cadastro não recebem Bearer e que `/auth/me` é marcado como protegido;
- conferir que não foram adicionadas dependências ou configurações de testes automatizados.

## 18. Estratégia de validação manual

1. Subir PostgreSQL e aplicar migrations.
2. Iniciar API e front-end pelos scripts da raiz.
3. Abrir Cadastro e validar erros locais sem chamada indevida.
4. Cadastrar usuário válido e confirmar `201`, feedback e retorno ao Login.
5. Repetir o mesmo e-mail e confirmar `409` associado ao campo.
6. Fazer Login com senha errada e usuário inexistente; ambos devem mostrar a mesma mensagem.
7. Fazer Login válido com “Lembrar-me” marcado, recarregar e confirmar `/auth/me` e persistência em `localStorage`.
8. Fazer logout e confirmar remoção dos dois storages.
9. Repetir Login desmarcado, recarregar na mesma aba e confirmar `sessionStorage`.
10. Fechar a sessão da aba e confirmar expiração do token de sessão.
11. Alterar o token manualmente e confirmar limpeza e mensagem de sessão expirada após `/auth/me` retornar `401`.
12. Desligar a API e confirmar erro de rede sem apagar campos.
13. Validar que recuperação, redefinição e botões sociais não passaram a chamar endpoints inexistentes.
14. Inspecionar Network para confirmar Bearer somente em `/auth/me` e ausência de senha/token em logs.
15. Validar teclado, foco, anúncios e as seis resoluções obrigatórias.

## 19. Comandos previstos

Todos pela raiz:

```powershell
corepack pnpm --filter @code-connect/web add axios
corepack pnpm --filter @code-connect/web add -D eslint @eslint/js typescript-eslint globals
corepack pnpm --filter @code-connect/web lint
corepack pnpm build:web
```

Ambiente local completo:

```powershell
docker compose --env-file apps/api/.env up -d postgres
corepack pnpm --filter @code-connect/api migration:run
corepack pnpm dev
```

Antes de iniciar o Vite, criar `apps/web/.env` a partir de `.env.example` e configurar somente a URL pública da API.

## 20. Arquivos previstos

### Criar

- `apps/web/.env.example`;
- `apps/web/src/config/env.ts`;
- `apps/web/src/http/apiClient.ts`;
- `apps/web/src/http/apiError.ts`;
- `apps/web/src/http/axios.d.ts`;
- `apps/web/src/services/auth/auth.service.ts`;
- `apps/web/src/services/auth/auth.types.ts`;
- `apps/web/src/services/auth/auth.validation.ts`;
- `apps/web/src/services/auth/tokenStorage.ts`;
- `apps/web/src/services/auth/authEvents.ts`;
- `apps/web/src/contexts/AuthContext.tsx`;
- `apps/web/eslint.config.mjs`.

### Modificar

- `apps/web/package.json`;
- `pnpm-lock.yaml`;
- `apps/web/src/vite-env.d.ts`;
- `apps/web/src/main.tsx` para registrar o provider;
- `apps/web/src/components/organisms/LoginForm/LoginForm.tsx`;
- `apps/web/src/components/organisms/RegisterForm/RegisterForm.tsx`;
- CSS Modules somente se mensagens reais exigirem ajuste responsivo mínimo.

### Não modificar

- `apps/api/**`;
- `compose.yaml`;
- migrations ou banco;
- assets oficiais e estrutura visual do `AuthTemplate`;
- formulários de recuperação e redefinição;
- botões de login social;
- páginas sem relação com Login/Cadastro;
- arquivos gerados `vite.config.js`, `vite.config.d.ts` e `tsconfig.build.tsbuildinfo`.

## 21. Ordem de implementação após aprovação

1. Instalar Axios e dependências de teste com pnpm.
2. Criar `.env.example`, tipagem e validação da URL.
3. Criar tipos, storage, normalização de erro e eventos de sessão.
4. Criar instância Axios e interceptors.
5. Criar `auth.service.ts`.
6. Criar e registrar `AuthProvider`.
7. Integrar Cadastro sem alterar layout.
8. Integrar Login e confirmação por `/auth/me`.
9. Implementar logout central e expiração por `401` protegido.
10. Executar lint e `corepack pnpm build:web`.
11. Validar manualmente a API real, acessibilidade e seis resoluções.
12. Revisar diff para excluir segredos, arquivos gerados e mudanças na API.
13. Aguardar revisão final antes de commit ou push.

## 22. Critérios de aceite

- Cadastro usa `POST /auth/register` e preserva `201`, `400` e `409`.
- Login usa `POST /auth/login` e mantém `401` genérico.
- Sessão é confirmada e reidratada por `GET /auth/me`.
- Bearer é adicionado automaticamente somente às requisições protegidas.
- “Lembrar-me” escolhe corretamente local ou session storage.
- Logout e `401` protegido limpam integralmente a sessão local.
- Senha e JWT não aparecem em logs, UI de erro ou arquivos versionados.
- Loading impede submissões duplicadas e é anunciado de forma acessível.
- Erros de campo e globais são associados e anunciados corretamente.
- Layout, assets, componentes, responsividade e acessibilidade do Figma são preservados.
- Recuperação, redefinição e login social permanecem sem integração.
- Lint e validações manuais passam.
- `corepack pnpm build:web` passa.
- Nenhum arquivo da API é alterado.

## 23. Riscos e limites conhecidos

- Web Storage é vulnerável a XSS; cookies HttpOnly exigiriam mudança futura no back-end.
- Não há refresh token; token expirado encerra a sessão e exige novo Login.
- Não há endpoint de logout/revogação; logout é somente local.
- Não há rota protegida de destino nem UI de logout no Figma; esta feature prepara a sessão e a operação de logout sem inventar uma tela.
- A label atual do Login diz “Email ou usuário”, mas a API aceita apenas e-mail; ajustar o texto para “Email” é necessário para não prometer um contrato inexistente.
- Mensagens `400` do NestJS são textuais; o mapeamento por campo deve ter fallback global para não depender cegamente do prefixo.

## 24. Fora do escopo

- recuperação e redefinição de senha;
- login com GitHub ou Google;
- refresh token e rotação de token;
- cookies HttpOnly;
- revogação server-side;
- criação de dashboard, feed, perfil ou outra página autenticada;
- React Router;
- alterações na API, banco, migrations ou Swagger;
- mudança visual não prevista no Figma.

## 25. Ponto de aprovação

Nenhuma implementação descrita neste documento deverá começar antes da aprovação explícita deste plano.
