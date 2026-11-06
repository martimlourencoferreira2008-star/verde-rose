# Verde & Rose

## Publicar no GitHub Pages com Firebase AI Logic

O site é estático e fica no GitHub Pages. Para o assistente, a app usa o Firebase
AI Logic com o backend Gemini Developer API: não precisas de criar uma chave
Gemini do Google AI Studio nem publicar uma chave do modelo no browser. A app
usa App Check para permitir que os pedidos venham do site registado.

### 1. Criar e configurar o Firebase

1. Cria um projeto em https://console.firebase.google.com/ e adiciona uma app
   Web. Em **Project settings → General → Your apps**, guarda a configuração
   pública da app Web.
2. Na página **AI Logic**, inicia a configuração e escolhe **Gemini Developer
   API**. Esta opção permite começar sem configurar o backend de faturação
   Vertex AI/Agent Platform; aplica-se a quota gratuita do fornecedor.
3. Em **App Check**, regista a app Web com um fornecedor **reCAPTCHA v3**.
   Adiciona o domínio `<UTILIZADOR>.github.io` à lista de domínios permitidos da
   chave reCAPTCHA e copia a site key.
4. Em **App Check → APIs**, ativa a aplicação de App Check para **Firebase AI
   Logic**. O Firebase exige esta proteção para o serviço de AI Logic.

Documentação oficial:

- [Firebase AI Logic para a Web](https://firebase.google.com/docs/ai-logic/get-started?api=dev)
- [Proteger Firebase AI Logic com App Check](https://firebase.google.com/docs/ai-logic/app-check)

### 2. Configurar a publicação no GitHub

1. Envia o projeto para a branch `main` do teu repositório.
2. No GitHub, abre **Settings → Secrets and variables → Actions → Variables**
   e cria estas variáveis com os valores da app Firebase e do App Check:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_APP_ID`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_CHECK_SITE_KEY`
3. Em **Settings → Pages**, escolhe **GitHub Actions** como origem da publicação.
4. Envia um commit para `main`. Em **Actions**, espera que
   **Publicar GitHub Pages** termine. O GitHub mostra aí o URL do site.

Estas configurações Web e a site key do reCAPTCHA são públicas: são necessárias
no browser para inicializar Firebase e App Check. Guarda-as nas **Variables**
do GitHub Actions, não é preciso tratá-las como segredos. A chave Gemini do
Google AI Studio **não é utilizada nem deve ser publicada**.

Se o assistente disser que o Firebase não está configurado, verifica que as
seis variáveis existem, que o Pages usa **GitHub Actions** e que a publicação
mais recente terminou com sucesso. Depois recarrega o site.

Se a branch principal tiver outro nome, atualiza `main` no gatilho de
`.github/workflows/pages.yml`.

### Enviar as fotografias pelo site do GitHub

As fotografias dos arranjos têm de estar no repositório, dentro de `images`,
com estes nomes exatos:

- `arranjo-peonias.jpg`
- `arranjo-pastel.jpg`
- `arranjo-silvestre.jpg`
- `arranjo-rustico.jpg`
- `arranjo-zen.jpg`
- `arranjo-orquideas.jpg`

Para as adicionar sem instalar Git:

1. Abre o repositório no GitHub e escolhe **Add file → Create new file**.
2. No nome do ficheiro escreve `images/.gitkeep` e confirma com **Commit changes**.
   Isto cria a pasta `images`.
3. Abre a pasta `images` no repositório. Escolhe **Add file → Upload files** e
   arrasta para a página os seis ficheiros `.jpg` da pasta `images` no teu
   computador.
4. Confirma os nomes e escolhe **Commit changes**. Depois recarrega o site.

### Publicações e definições

As fotografias do feed mantêm a proporção original para evitar cortes e
deformações. As publicações criadas neste dispositivo têm um botão **Apagar**
no cabeçalho; a remoção pede confirmação.

Abre o ícone de perfil e escolhe **Definições** para selecionar o aspeto claro,
escuro ou igual ao dispositivo e para ativar/desativar os lembretes de rega.
Estas preferências são guardadas neste dispositivo.

### Executar localmente

Para experimentar o site sem publicar, instala Node.js 20.6 ou superior, copia
`.env.example` para `.env`, coloca aí uma chave Gemini de desenvolvimento e
executa `start.bat`. Não reutilizes a chave que foi partilhada anteriormente;
revoga-a no Google AI Studio. O ficheiro `.env` está excluído do Git. A versão
publicada no GitHub usa Firebase AI Logic em vez do servidor local.

O separador Comunidade inclui curiosidades diárias e publicações guardadas
apenas neste dispositivo. As fotografias ilustrativas dos arranjos são locais,
na pasta `images`.
