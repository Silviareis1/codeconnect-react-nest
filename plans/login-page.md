# Plano de implementação — página de login

## 1. Objetivo e escopo

Implementar futuramente a tela de login do CodeConnect em `apps/web`, usando React, Vite, TypeScript, Atomic Design, CSS Modules, abordagem Mobile First e os assets oficiais fornecidos.

Este documento é somente um plano. Nesta etapa não serão criados componentes, estilos, rotas, validações ou integrações com a API.

A estrutura deverá ser reutilizável pela futura página de cadastro. Login e cadastro compartilharão o mesmo shell visual; cada página fornecerá seu próprio banner e seu próprio formulário.

## 2. Fonte oficial e arquivos analisados

A referência oficial da tela completa é:

- `C:\Users\silvi\OneDrive\Área de Trabalho\IMERSÕES ALURA\2026\Login.png` — composição desktop de 1920 × 1300 px.

Assets oficiais fornecidos:

- `IMG_1 - Desktop.png` — banner vertical do login, 407 × 636 px, com fundo transparente e marca CodeConnect incorporada na parte inferior;
- `Github.svg` — símbolo branco do GitHub, viewBox aproximado de 33 × 32;
- `Google.svg` — símbolo colorido do Google, viewBox de 28 × 28.

Os assets estão fora do repositório e deverão ser copiados, na fase de implementação, para uma pasta pública organizada, com nomes normalizados e sem alterar os originais. Sugestão:

```text
apps/web/public/assets/auth/
  login-banner.png
  github.svg
  google.svg
```

Não recriar o banner, a marca ou os ícones em CSS. Não usar `IMG_1 - Desktop.png` como fundo da página: ele representa somente a coluna visual interna do cartão.

## 3. Estado atual do front-end

- `apps/web/src/App.tsx` contém apenas a tela provisória “CodeConnect”.
- `apps/web/src/index.css` possui somente estilos globais iniciais.
- Ainda não há componentes, páginas, roteamento ou biblioteca de formulários.
- O projeto já dispõe de React e TypeScript; nenhuma dependência adicional é necessária para esta tela.
- O escopo é exclusivamente `apps/web`; `apps/api`, configurações compartilhadas e `pnpm-lock.yaml` não devem ser alterados.

## 4. Leitura visual do layout

### 4.1 Página

- Fundo quase preto com leve tonalidade azul-esverdeada.
- Dois grafismos grandes e decorativos da identidade CodeConnect, em baixo contraste: um no quadrante superior esquerdo e outro parcialmente cortado no canto inferior direito.
- Conteúdo principal centralizado horizontal e verticalmente, com folga ampla ao redor em desktop.
- Os grafismos não devem participar da ordem de leitura nem receber texto alternativo.

### 4.2 Cartão de autenticação

- Painel central escuro, com cantos arredondados e sem sombra evidente.
- No desktop da referência, o painel usa duas colunas: banner à esquerda e conteúdo do login à direita.
- A coluna do banner é alta e estreita, mantendo a proporção original da imagem.
- A coluna do formulário tem largura próxima à do banner, conteúdo alinhado à esquerda e espaçamento vertical regular.
- O painel precisa crescer verticalmente no cadastro, sem altura fixa e sem deformar o banner.

Proporções de referência observadas em `Login.png` (usar como guia de comparação, não como medidas rígidas):

- viewport da composição: 1920 × 1300 px;
- painel central: aproximadamente 994 × 746 px;
- início do painel: aproximadamente 463 px no eixo horizontal e 215 px no vertical;
- banner renderizado: aproximadamente 407 × 628 px, muito próximo da proporção do asset original de 407 × 636 px;
- espaçamento interno do painel: cerca de 76 px no topo/rodapé e 77 px nas laterais;
- intervalo visual entre banner e coluna do formulário: cerca de 68 px;
- coluna útil do formulário: cerca de 318 px, com inputs e botão ocupando toda essa largura.

Na implementação, converter essas relações em `max-width`, `gap`, padding fluido e limites responsivos. Evitar posicionamento absoluto do cartão ou valores que só funcionem em 1920 × 1300 px.

### 4.3 Conteúdo do formulário

Ordem observada:

1. título “Login”;
2. texto “Boas-vindas! Faça seu login.”;
3. campo “Email ou usuário” com o valor ilustrativo `usuario123`;
4. campo “Senha” com conteúdo mascarado;
5. linha com checkbox “Lembrar-me” à esquerda e link “Esqueci a senha” à direita;
6. botão primário verde “Login” com seta para a direita;
7. divisor “ou entre com outras contas”, com linhas laterais;
8. ações sociais de GitHub e Google/Gmail;
9. texto “Ainda não tem conta?”;
10. chamada verde “Crie seu cadastro!” acompanhada por ícone de cadastro.

### 4.4 Aparência dos controles

- Textos principais em branco/cinza muito claro; textos secundários em cinza.
- Inputs com fundo cinza médio, texto escuro, borda discreta ou ausente e raio pequeno.
- Botão principal verde vivo, largura total da coluna, texto escuro em peso forte e cantos arredondados.
- Checkbox quadrado com marca verde e rótulo cinza.
- Link de recuperação claro e sublinhado.
- Ícones sociais exibidos acima de seus rótulos e organizados lado a lado.
- Chamada para cadastro em verde, centralizada na parte inferior.

Os valores finais de cor, tipografia, espaçamento e raio deverão ser afinados por comparação visual com `Login.png`, sem substituir a referência por escolhas genéricas.

## 5. Arquitetura Atomic Design proposta

```text
apps/web/src/
  components/
    atoms/
      Button/
        Button.tsx
        Button.module.css
      Checkbox/
        Checkbox.tsx
        Checkbox.module.css
      Input/
        Input.tsx
        Input.module.css
      TextLink/
        TextLink.tsx
        TextLink.module.css
    molecules/
      FormField/
        FormField.tsx
        FormField.module.css
      SocialLoginOption/
        SocialLoginOption.tsx
        SocialLoginOption.module.css
      AuthDivider/
        AuthDivider.tsx
        AuthDivider.module.css
    organisms/
      LoginForm/
        LoginForm.tsx
        LoginForm.module.css
      SocialLoginGroup/
        SocialLoginGroup.tsx
        SocialLoginGroup.module.css
    templates/
      AuthTemplate/
        AuthTemplate.tsx
        AuthTemplate.module.css
    pages/
      LoginPage/
        LoginPage.tsx
        LoginPage.module.css
```

### 5.1 Responsabilidades

- `Input`: elemento de entrada visual, com suporte aos atributos nativos, estados de foco, inválido e desabilitado.
- `Checkbox`: checkbox acessível com rótulo associado; não criar um falso checkbox apenas com `div`.
- `Button`: botão primário reutilizável, preservando `type="submit"` no formulário.
- `TextLink`: estilo comum para ações textuais; usar âncora somente quando houver destino real.
- `FormField`: compõe `label`, `Input`, mensagem auxiliar e erro. Deve gerar ou receber IDs para manter `htmlFor`, `aria-describedby` e `aria-invalid` consistentes.
- `SocialLoginOption`: compõe ícone oficial, nome do provedor e controle interativo.
- `AuthDivider`: divisor semântico/decorativo com texto central.
- `SocialLoginGroup`: agrupa as opções sociais e fornece nome acessível ao conjunto.
- `LoginForm`: contém somente conteúdo, estado e ações específicos do login.
- `AuthTemplate`: shell compartilhado entre autenticação e cadastro; recebe banner, texto alternativo, conteúdo do formulário e identificação opcional de página.
- `LoginPage`: escolhe o banner do login e injeta `LoginForm` no template.

Evitar extrair componentes que apareçam uma única vez e não tenham responsabilidade própria. O ícone da seta do botão e o ícone de cadastro podem ser SVGs inline simples, desde que sejam decorativos, usem `currentColor` e não exijam uma nova dependência.

## 6. Contrato reutilizável do template

O template não deverá conhecer login ou cadastro. Um contrato inicial possível:

```ts
type AuthTemplateProps = {
  bannerSrc: string;
  bannerAlt: string;
  children: React.ReactNode;
};
```

Decisões importantes:

- a página define qual banner usar;
- o formulário entra por composição via `children`;
- não usar propriedades como `isLogin` ou `isRegister`;
- não colocar campos, textos, validação ou envio dentro do template;
- não impor altura fixa ao painel ou à coluna de conteúdo;
- permitir que a coluna visual seja ocultada ou reposicionada em telas estreitas sem mudar a ordem lógica do formulário;
- no cadastro, reutilizar `AuthTemplate`, `FormField`, `Input`, `Button` e, quando aplicável, os componentes sociais.

### 6.1 Variações previstas para cadastro

O reaproveitamento deve acontecer por composição, mantendo estas fronteiras:

| Camada compartilhada | Login | Cadastro futuro |
| --- | --- | --- |
| `AuthTemplate` | recebe banner e `LoginForm` | recebe outro banner e `RegisterForm` |
| estrutura do painel | duas colunas e fundo decorativo | exatamente a mesma estrutura |
| átomos e `FormField` | usuário, senha e lembrar-me | conjunto próprio de campos |
| ações sociais | configuradas pelo formulário/página | reutilizadas apenas se a referência de cadastro exigir |
| textos, validação e envio | responsabilidade de `LoginForm` | responsabilidade de `RegisterForm` |

Não parametrizar o formulário inteiro por uma lista genérica de campos nesta primeira etapa. Login e cadastro podem ter regras, agrupamentos e acessibilidade diferentes; compartilhar os elementos básicos e o template mantém a reutilização sem esconder essas diferenças.

## 7. Estratégia responsiva Mobile First

Como foi fornecida apenas a referência desktop, o comportamento móvel será uma adaptação conservadora da mesma linguagem visual:

### Mobile (a partir de 320 px)

- página com padding lateral seguro e conteúdo rolável verticalmente;
- cartão em uma coluna e largura limitada ao viewport;
- formulário como conteúdo prioritário;
- banner acima do formulário em versão proporcional/cortada ou oculto em telas muito estreitas se a imagem comprometer a usabilidade; decidir após teste visual, sem esconder informação funcional;
- campos e botão com largura total;
- linha “Lembrar-me / Esqueci a senha” capaz de quebrar sem sobreposição;
- alvos interativos com dimensão confortável e foco visível;
- grafismos de fundo reposicionados ou reduzidos para não gerar rolagem horizontal.

### Desktop

- ativar duas colunas quando houver espaço para banner, formulário e paddings sem compressão;
- centralizar o cartão no viewport, preservando a proporção do banner;
- limitar largura máxima do painel para não crescer indefinidamente;
- manter o formulário centralizado verticalmente dentro de sua coluna somente quando isso não criar alturas artificiais;
- reproduzir a posição dos grafismos decorativos conforme a imagem de 1920 × 1300.

O breakpoint deverá ser escolhido pelo ponto real em que as duas colunas deixam de caber, e não por um dispositivo específico.

## 8. Semântica e acessibilidade

- Usar um único `main` e um `h1` “Login”.
- Usar `form`, `label`, `input` e `button` nativos.
- Configurar `name`, `type` e `autoComplete`: `username` para “Email ou usuário” e `current-password` para senha.
- Não usar placeholder como substituto de rótulo.
- Manter foco visível em campos, checkbox, botões e links.
- Garantir contraste suficiente, inclusive no texto cinza sobre o painel e no texto do botão verde.
- Marcar grafismos e ícones redundantes como decorativos (`aria-hidden="true"` ou `alt=""`).
- Dar nomes acessíveis completos às ações sociais, por exemplo “Entrar com GitHub” e “Entrar com Google”.
- Não expor uma seta decorativa do botão ao leitor de tela.
- Garantir navegação por teclado na ordem visual correta.
- Associar futuras mensagens de erro aos campos e anunciar mudanças relevantes.
- Testar reflow com 320 px de largura e zoom de 200%, sem rolagem horizontal.

## 9. Escopo funcional da primeira implementação

- Construir a interface e os estados locais estritamente necessários.
- O envio deve ser tratado sem recarregar a página enquanto não houver integração autorizada com a API.
- Não simular login bem-sucedido, token, persistência ou chamada HTTP.
- O checkbox pode manter estado local.
- Os links “Esqueci a senha” e “Crie seu cadastro!” só devem receber rotas reais quando essas páginas/rotas forem definidas; não inventar destinos.
- As ações sociais devem ter semântica de botão enquanto não houver URLs ou fluxo OAuth definido.
- Não instalar React Router, biblioteca de formulário, biblioteca de ícones ou pacote de CSS apenas para esta tela.

## 10. Sequência de implementação futura

1. Criar `apps/web/public/assets/auth` e copiar os três assets oficiais com nomes normalizados.
2. Definir reset mínimo e tokens globais necessários em `index.css` (cores, família tipográfica confirmada, `box-sizing` e fundo base).
3. Criar os átomos necessários e seus estados acessíveis.
4. Criar `FormField`, `AuthDivider` e `SocialLoginOption`.
5. Criar `SocialLoginGroup` e compor `LoginForm` sem integração externa.
6. Criar `AuthTemplate` Mobile First, incluindo os grafismos decorativos de fundo.
7. Criar `LoginPage`, informando o banner oficial e injetando o formulário.
8. Substituir a tela provisória de `App.tsx` por `LoginPage`; não adicionar roteador enquanto só existir uma página.
9. Comparar lado a lado com `Login.png` na proporção de referência e ajustar cores, dimensões, alinhamentos e espaçamentos.
10. Testar larguras de 320, 375, 768, 1024 e 1920 px, além de zoom e teclado.
11. Executar `corepack pnpm build:web` a partir da raiz e corrigir qualquer erro antes da entrega.

## 11. Critérios de aceite

- A composição desktop reproduz fielmente `Login.png`.
- O banner exibido é o asset oficial e mantém sua proporção sem distorção.
- Os SVGs oficiais são usados nas ações sociais.
- O layout funciona a partir de 320 px sem sobreposição ou rolagem horizontal.
- O formulário possui HTML semântico, rótulos associados, foco visível e navegação por teclado.
- O shell visual não contém regras específicas de login e pode receber o banner e o formulário do cadastro.
- Não há duplicação estrutural planejada entre login e cadastro.
- Nenhuma dependência desnecessária, alteração na API ou mudança não relacionada é introduzida.
- `corepack pnpm build:web` termina sem erros.

## 12. Arquivos previstos na implementação

Alterar:

- `apps/web/src/App.tsx`;
- `apps/web/src/index.css`.

Criar:

- assets em `apps/web/public/assets/auth/`;
- componentes estritamente necessários sob `apps/web/src/components/{atoms,molecules,organisms,templates}`;
- `apps/web/src/pages/LoginPage/`.

Não alterar:

- `apps/api/**`;
- dependências e `pnpm-lock.yaml`, salvo se surgir uma necessidade técnica explícita e previamente justificada;
- configurações de workspace ou build.

## 13. Riscos e pontos a confirmar durante a implementação

- **Tipografia:** a imagem sugere uma fonte geométrica; confirmar se existe arquivo oficial ou especificação antes de importar fonte externa. Até lá, não assumir uma família específica.
- **Cores exatas:** obter por amostragem da imagem e validar visualmente, mantendo tokens nomeados em vez de valores espalhados.
- **Grafismos de fundo:** não há asset separado fornecido; recriar apenas a forma geométrica simples com CSS ou SVG decorativo local, sem tentar extrair a marca do banner.
- **Rótulo do Google:** o SVG é `Google.svg`, mas a referência visual mostra “Gmail”; confirmar o texto de produto antes da implementação final.
- **Responsividade:** não existe frame mobile fornecido; documentar as decisões conservadoras adotadas e priorizar legibilidade e acessibilidade.
- **Rotas e autenticação:** recuperação, cadastro, login social e envio real permanecem fora do escopo até haver contratos definidos.

## 14. Validação e entrega

Na fase de código, registrar:

- quais arquivos foram criados ou alterados e o motivo;
- comparação visual realizada contra a referência;
- testes manuais de teclado, foco e responsividade;
- resultado de `corepack pnpm build:web`;
- limitações restantes por falta de especificação funcional ou de frame mobile.

Se houver commit, usar Conventional Commits somente depois do build aprovado, por exemplo: `feat(web): adiciona página de login`.
