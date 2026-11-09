# Portfólio reimaginado — Emanuel Cândido

Nova versão do portfólio com direção de arte de estúdio escuro: fundo preto com grade fina,
navegação em pílula e uma pasta física como objeto central (inspirada na imagem em `assets/source/referencia.png`).

## Estrutura

```text
index.html            conteúdo e seções (Início, Portfólio, Sobre mim, Por que eu, Pesquisa, Contato)
css/style.css         tokens, layout, pastas, animações e responsivo
js/main.js            navegação ativa, revelações, vídeos, parallax, cópia de email e formulário
assets/images/        imagens otimizadas (WebP + JPG) usadas pelo site
assets/source/        PNGs originais gerados pelo Codex (gpt-6.1-sol) e a referência
assets/projects/      pôsteres e prévias em vídeo dos projetos
assets/fonts/         fontes hospedadas no site (Bricolage Grotesque, Hanken Grotesk, JetBrains Mono)
assets/documents/     currículo, artigos e banner em PDF
```

## Assets gerados

`hero-hand` e `contact-hand` foram gerados com o Codex (geração de imagem, gpt-6.1-sol) como
recortes com fundo transparente, com a manga da camisa social branca e o tom de pele do
dono do portfólio (usando a foto dele como referência): a mão segura a pasta/cartão em branco e a manga toca
a borda da imagem. O texto da pasta e do cartão é HTML sobreposto.

Como funciona o encaixe (em `css/style.css`):

- A face da pasta é posicionada em coordenadas da tela (`--fw`, `--fx`, `--fy` em `.hero-stage`;
  `--cw`, `--cx`, `--cy` em `.contact-stage`), com uma composição para telas deitadas e outra
  para telas em pé (`@media (max-aspect-ratio: 1/1)`).
- A imagem é escalada e deslocada para a face coincidir. Por isso o braço sempre passa da
  borda da tela, em qualquer proporção.
- `--hi-*` e `--ci-*` guardam onde está a face dentro de cada imagem. Se trocar uma imagem,
  meça o retângulo da face e atualize esses valores.

O crachá da seção Sobre mim é HTML/CSS (palavra "dev" gigante, foto recortada com contorno de luz,
painel diagonal, nome e cargo). A foto é `emanuel-recorte.webp`: o fundo foi removido com um modelo de
segmentação (rembg/BiRefNet) que gera só a máscara — os pixels da pessoa são os da foto original, sem
regeneração nem upscaling por IA (verificado pixel a pixel). A mão que segura o cordão
(`lanyard-hand.webp`) foi gerada pelo Codex; `lanyard-sleeve.webp` é uma fatia da manga esticada até a
borda da tela. Cordão, mosquetão e cartão balançam como um pêndulo a partir do punho (`js/main.js`):
dá para arrastar e arremessar.

O fundo tem uma grade que acende só perto do cursor (camada mais clara revelada por máscara).

Os ícones de seta estão em `assets/icons/arrows.svg` (sprite, também gerado pelo Codex; veja
`assets/icons/arrow-preview.html`) e são usados com `<svg class="ico"><use href="assets/icons/arrows.svg#arrow-up-right"></use></svg>`.

As pastas de projeto mostram um recorte 16:9 do vídeo e, ao passar o mouse (ou com foco
pelo teclado), crescem até a proporção real do vídeo — só com o mouse sobre o vídeo. Em telas de toque ficam sempre abertas.

## Desempenho (celulares fracos e redes lentas)

- Um script no `<head>` marca a página com `save-data` (rede 2G/3G ou "economia de dados") e
  `lite` (aparelho com até 4 GB de RAM ou 4 núcleos).
- `save-data`: vídeos dos projetos não são baixados (só o pôster).
- `lite`: sem `backdrop-filter`, sem balanços automáticos do crachá (só ao segurar) e efeitos de
  luz mais simples.
- Pôsteres dos vídeos carregam só quando a pasta se aproxima da tela; vídeos tocam só quando visíveis.
- Imagens com `srcset` (640/1024/1536) e `loading="lazy"`; no celular a mão do crachá usa uma versão
  sem a extensão de manga (≈4 MB decodificada em vez de ≈13 MB).
- Animações infinitas pausam fora da tela; seções simples usam `content-visibility: auto`.
- Em telas pequenas a navbar some ao rolar para baixo e volta ao rolar para cima.

## Rodar localmente

```bash
python -m http.server 5517
```

Depois abra http://localhost:5517.
