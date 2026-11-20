# DESIGN.md · Portfólio de Emanuel Cândido

> Se este arquivo e o código discordarem, vale o código até o dono decidir. Anote o conflito em Perguntas em aberto.

## Produto
Portfólio pessoal de um estudante de Engenharia de Software (UNIFSA, Teresina). Uma página só, com as seções
Início, Portfólio, Sobre mim, Por que eu, Pesquisa e Contato. Lido no computador (recrutador abrindo o link do
currículo ou do LinkedIn) e no celular. Função principal: convencer um recrutador a chamar para conversa e
deixar o contato a um clique.

## Público e voz
Recrutadores e empresas, para vaga de estágio ou júnior com foco em backend (Java, Spring Boot, APIs REST).
Tom formal e profissional, primeira pessoa, frases curtas, fatos no lugar de adjetivos.
Português do Brasil; datas "Ago 2026"; telefone e WhatsApp do Brasil.

## Clima
Palavras: sóbrio, profissional, cuidadoso (estúdio escuro).
Nunca parecer: template de portfólio de dev (hero com gradiente, cards com ícone, barras de habilidade em %),
landing page de SaaS (promessas vagas, números inventados), neon ou gamer (brilhos coloridos, roxo e ciano),
currículo em texto puro (seco, sem cuidado visual).

## Marca
Sem logo. Assinatura "emanuel(dev)" no cordão e no verso do crachá.
Cores: preto e cinzas em `css/style.css` › `:root` (`--bg`, `--panel`, `--line*`, `--text*`, `--dim`); sem cor de destaque.
Fontes: Archivo variável (texto e títulos largos, `--wide: 112%`) e Fragment Mono (rótulos), hospedadas em `assets/fonts/`.
Objetos físicos como linguagem: pasta na mão (Início), pastas de arquivo (Portfólio), crachá com cordão (Sobre),
cartão na mão (Contato). Setas em `assets/icons/arrows.svg`.
Fonte do design system: `css/style.css` (tokens no `:root`, componentes `.btn`, `.chip`, `.tags`, `.channel`, `.field`).

## Referências
- `assets/source/referencia.png` (pasta escura segurada por uma mão sobre grade fina): pegar o fundo preto com
  grade, o menu em pílula, o objeto físico como peça central e o texto mínimo em branco e cinza; evitar nada em
  particular. Para as seções de baixo, estender a mesma lógica.

## Restrições
Desktop (1280 px) e celular (390 px). Só tema escuro. Contraste AA (`--text-3` ≥ 4,5:1 para texto pequeno).
Celular fraco e rede lenta: classes `lite` e `save-data`, vídeos sob demanda, `prefers-reduced-motion` respeitado.
Site estático no GitHub Pages; formulário via FormSubmit.

## Registro de decisões
- 2026-11-19 — Texto enxugado com o unslop-ui (sem rótulos numerados, sem bloco de princípios, sem travessões) — o texto genérico enfraquecia o tom profissional.
- 2026-11-19 — Importação do design system para o Figma recusada — o trabalho segue só no código.
- 2026-11-19 — "Por que eu?" mostra provas com link (API do ClinicCase, pesquisa, projetos no ar, Full Stack) em vez de áreas — áreas genéricas não diferenciam um candidato júnior.
- 2026-11-19 — Cards de "Por que eu" usam subgrid, com altura definida pelo conteúdo — títulos, textos e links alinhados nos quatro cards.
- 2026-11-19 — Contato na ordem LinkedIn, Email, Currículo, GitHub, WhatsApp, Instagram — recrutador procura LinkedIn, email e currículo primeiro; WhatsApp e Instagram mantidos a pedido do dono.
- 2026-11-19 — Email do site é emanoelcandidolima@gmail.com (confirmado pelo dono).
- 2026-11-19 — Dica "passe o mouse" escondida em telas de toque — lá as pastas já ficam abertas.
- 2026-11-19 — Currículo é o botão principal no Início e no Sobre — é o que o recrutador procura primeiro.
- 2026-11-19 — "Certificado" em Pesquisa é rótulo de texto (`.pub-note`), não chip — chip tem cara de botão e ele não abre nada.
- 2026-11-19 — Rótulos "Abrir/Copiar/Copiado" do Contato com largura fixa — a linha não muda ao copiar.
- 2026-11-19 — Títulos com `text-wrap: balance` e parágrafos com `pretty` — sem palavra sozinha na última linha.
- 2026-11-19 — Cor de erro virou o token `--danger`.
- 2026-11-19 — Terê Burg fica sem link — decisão do dono; não há repositório público.

## Perguntas em aberto
- Nenhuma no momento.
