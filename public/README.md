# IMPORTANTE: Adicione suas imagens nesta pasta

Antes de fazer deploy, você precisa adicionar as seguintes imagens:

1. **logocangumbim.png** - Logo do Sítio Cangumbim
2. **IMG_1073.jpg** - Foto principal (hero)

## Dica
Você pode adicionar mais fotos do sítio e atualizar as referências em:
`src/components/Gallery.tsx`

Substitua os links do Unsplash por caminhos locais como:
```typescript
{ src: "/sua-foto.jpg", category: "Exterior", title: "Descrição" }
```
