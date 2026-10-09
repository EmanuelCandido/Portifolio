# Portfólio — Emanuel Cândido

Portfólio profissional desenvolvido para apresentar minha trajetória em Engenharia de Software, minhas competências técnicas e projetos que transformam necessidades reais em soluções digitais.

O projeto combina uma identidade visual autoral com uma experiência responsiva e acessível. Toda a interface foi construída com HTML, CSS e JavaScript puros, mantendo a base de código leve, organizada e simples de evoluir.

## Destaques

- Identidade editorial com tipografia Geist e Geist Mono, grid de 12 colunas e paleta grafite com laranja de destaque.
- Tema claro e escuro, seguindo o sistema por padrão e com alternância manual salva no navegador.
- Introdução curta (exibida uma vez por sessão), títulos revelados palavra a palavra e conteúdos que entram durante a rolagem.
- Régua lateral de progresso com marcação das seções e navegação com indicador animado da seção ativa.
- Cartão de perfil com inclinação 3D, foto ampliável e chip animado de requisições de API.
- Especialidades com vídeos autorais (fluxo de API, modelagem de dados, interface responsiva e grafo do Git) sincronizados à rolagem.
- Projetos com prévias animadas que tocam ao entrar na tela e cursor contextual.
- Janela de IDE na seção Sobre, com abas, digitação e destaque de sintaxe para Java, SQL e JavaScript.
- Contato com cópia rápida do email, formulário com rótulos flutuantes, validação acessível e envio assíncrono.
- Menu mobile em tela cheia e foto ampliada usando `<dialog>` nativo (foco e tecla Esc tratados pelo navegador).
- Metadados de compartilhamento (Open Graph), dados estruturados (JSON-LD), favicon SVG e ícone para iOS.
- Respeito à preferência de movimento reduzido e funcionamento sem JavaScript (conteúdo sempre visível).

## Tecnologias

- HTML5 semântico
- CSS3 (custom properties, grid, `color-mix`, `:has`)
- JavaScript puro, sem dependências
- Google Fonts
- SVG
- Git e GitHub

## Estrutura do projeto

```text
Portifolio/
├── assets/
│   ├── documents/        # currículo em PDF
│   ├── icons/            # favicon.svg
│   ├── images/           # foto, capas dos projetos, og-cover e pôsteres dos vídeos
│   └── videos/
│       ├── projects/
│       └── skills/
├── css/
│   └── style.css
├── js/
│   └── script.js
├── index.html
├── LICENSE
└── README.md
```

## Execução local

O portfólio não exige instalação de dependências ou etapa de compilação.

1. Clone o repositório:

   ```bash
   git clone https://github.com/EmanuelCandido/Portifolio.git
   ```

2. Entre na pasta do projeto:

   ```bash
   cd Portifolio
   ```

3. Abra o arquivo `index.html` em um navegador moderno.

Para trabalhar com recarregamento automático, também é possível servir a pasta com uma extensão como Live Server.

## Personalização

- `index.html`: conteúdo, links, projetos e o sprite de ícones SVG (no início do `<body>`).
- `css/style.css`: tokens de design (cores dos dois temas, fontes, espaçamentos) no topo, seguidos de componentes, seções e animações.
- `js/script.js`: tema, introdução, navegação, revelações, vídeos, IDE, formulário e diálogos.
- `assets/images/`: imagens otimizadas em WebP/JPG; `og-cover.jpg` é a imagem de compartilhamento (1200×630).
- `assets/videos/`: prévias locais, compactadas e sem áudio.

Ao substituir uma imagem, preserve nomes descritivos, dimensões adequadas e textos alternativos relevantes.

## Projetos apresentados

- **ClinicCase** ([GitHub](https://github.com/EmanuelCandido/ClinicCase) · [site](https://cliniccase.site)): plataforma educacional com IA generativa para criação de casos clínicos, desenvolvida no PIBIC (Java, Spring Boot, PostgreSQL, React e TypeScript).
- **[Agendamento de Barbearia](https://github.com/EmanuelCandido/Sistema-de-barbeiro):** agendamento online pelo celular e painel administrativo, com React, TypeScript e Firebase.
- **[Link na Bio — Personal Trainer](https://github.com/EmanuelCandido/Linktree):** página de links com serviços em destaque, tema claro/escuro e contato pelo WhatsApp.
- **[Eco City](https://github.com/EmanuelCandido/Jogo_INOVATECH):** jogo educativo 3D no navegador sobre sustentabilidade.
- **[TopNote](https://github.com/EmanuelCandido/TopNote):** aplicativo de notas para Windows aberto por atalho, com dados salvos localmente.

## Artigos e eventos

- **DELTA SAÚDE 2026** — 5º Congresso Internacional de Estudantes e Profissionais da Saúde (painel eletrônico, com certificado, [banner](assets/documents/banner-delta-saude-2026.pdf)).
- **Opala Tech V** — IFPI Pedro II, 1 a 3 de junho: artigo sobre a arquitetura LLM + RAG do ClinicCase (com certificado, [PDF](assets/documents/artigo-opala-tech-v.pdf)).
- **PIBIC** — artigo sobre a plataforma ClinicCase ([PDF](assets/documents/artigo-pibic-clinic-case.pdf)).
- **Git e GitHub na prática** — curso de extensão do Centro Universitário Santo Agostinho.

## Autor

**Emanuel Cândido**

Estudante de Engenharia de Software — Teresina, Piauí, Brasil.

- [GitHub](https://github.com/EmanuelCandido)
- [LinkedIn](https://www.linkedin.com/in/emanuecandido)
- [Instagram](https://www.instagram.com/_emanuel_1)

## Licença

Este projeto é distribuído sob os termos definidos no arquivo [LICENSE](LICENSE).
