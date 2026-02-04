# Sítio Cangumbim - Website

Site oficial do Sítio Cangumbim, localizado no Povoado dos Pinto, Resende Costa - MG.

## 🏡 Sobre o Projeto

Website desenvolvido com Next.js 14, React e Tailwind CSS para divulgação e reservas do Sítio Cangumbim.

## 🚀 Tecnologias

- **Next.js 14** - Framework React com Server Components
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Lucide React** - Ícones modernos
- **Next Image** - Otimização automática de imagens

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/Sitio-Cangumbim.git

# Entre na pasta
cd Sitio-Cangumbim

# Instale as dependências
npm install
# ou
yarn install
# ou
pnpm install
```

## 🛠️ Desenvolvimento

```bash
# Inicie o servidor de desenvolvimento
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 📸 Adicionar Imagens

Antes de fazer deploy, adicione as imagens reais na pasta `public/`:

1. **logocangumbim.png** - Logo do sítio
2. **IMG_1073.jpg** - Imagem principal do hero
3. Adicione mais fotos reais do sítio na pasta `public/` e atualize as referências em [src/components/Gallery.tsx](src/components/Gallery.tsx)

## 🌐 Deploy na Vercel

### Opção 1: Deploy via Dashboard (Recomendado)

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em **"Add New Project"**
4. Importe o repositório `Sitio-Cangumbim`
5. A Vercel detectará automaticamente que é um projeto Next.js
6. Clique em **"Deploy"**

Pronto! Sua aplicação estará online em poucos segundos.

### Opção 2: Deploy via CLI

```bash
# Instale a CLI da Vercel
npm i -g vercel

# Faça login
vercel login

# Deploy
vercel

# Deploy em produção
vercel --prod
```

## 📱 Responsividade

O site está 100% responsivo e otimizado para:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large Desktop (1280px+)

## ⚙️ Configurações Importantes

### Contato WhatsApp

Edite o número em:
- [src/components/Hero.tsx](src/components/Hero.tsx)
- [src/components/BookingCalendar.tsx](src/components/BookingCalendar.tsx)
- [src/components/FloatingWhatsApp.tsx](src/components/FloatingWhatsApp.tsx)

Altere `CONTACT_NUMBER` para seu número real (formato: 5532999999999)

### Links Externos

Atualize em [src/components/Reviews.tsx](src/components/Reviews.tsx):
- `GOOGLE_REVIEWS_LINK`
- `AIRBNB_LINK`

### Datas Indisponíveis

Edite o array em [src/components/BookingCalendar.tsx](src/components/BookingCalendar.tsx):

```typescript
const UNAVAILABLE_DATES = [
  '2024-03-15', 
  '2024-03-16', 
  '2024-03-20'
];
```

## 🗂️ Estrutura do Projeto

```
Sitio-Cangumbim/
├── public/              # Imagens e assets estáticos
│   ├── logocangumbim.png
│   └── IMG_1073.jpg
├── src/
│   ├── app/            # App Router do Next.js
│   │   ├── layout.tsx  # Layout principal
│   │   ├── page.tsx    # Página inicial
│   │   └── globals.css # Estilos globais
│   └── components/     # Componentes React
│       ├── About.tsx
│       ├── Amenities.tsx
│       ├── BookingCalendar.tsx
│       ├── Button.tsx
│       ├── FloatingWhatsApp.tsx
│       ├── Footer.tsx
│       ├── Gallery.tsx
│       ├── Header.tsx
│       ├── Hero.tsx
│       ├── LocalTips.tsx
│       ├── Reviews.tsx
│       └── RoomDetails.tsx
├── .gitignore
├── next.config.mjs
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json
```

## 📝 Build de Produção

```bash
# Criar build otimizado
npm run build

# Testar build localmente
npm run start
```

## 🐛 Troubleshooting

### Erro: Cannot find module 'next'

```bash
rm -rf node_modules package-lock.json
npm install
```

### Imagens não carregam

Verifique se as imagens estão na pasta `public/` e se os caminhos estão corretos (começando com `/`)

### Erro de TypeScript

```bash
npm run lint
```

## 📄 Licença

Este projeto é privado e pertence ao Sítio Cangumbim.

## 👨‍💻 Suporte

Para dúvidas sobre o código ou deploy, entre em contato.

---

Desenvolvido com ❤️ para o Sítio Cangumbim
