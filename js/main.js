(() => {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;
  /* Classes definidas no <head>: "save-data" (rede lenta / economia de dados) e "lite" (aparelho fraco) */
  const saveData = root.classList.contains("save-data");
  const lite = root.classList.contains("lite");

  /* Ano atual */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* Entrada do hero quando a imagem carregar */
  const heroImg = document.querySelector("[data-hero-img]");
  const markLoaded = () => requestAnimationFrame(() => root.classList.add("is-loaded"));
  if (!heroImg || heroImg.complete) markLoaded();
  else {
    heroImg.addEventListener("load", markLoaded, { once: true });
    heroImg.addEventListener("error", markLoaded, { once: true });
    setTimeout(markLoaded, 1200); // não segura o hero por muito tempo em rede lenta
  }

  /* Revelação ao rolar (com atraso escalonado entre irmãos) */
  const reveals = document.querySelectorAll("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-in"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const siblings = [...el.parentElement.children].filter((c) => c.hasAttribute("data-reveal"));
          el.style.setProperty("--d", `${Math.min(siblings.indexOf(el), 4) * 0.08}s`);
          el.classList.add("is-in");
          revealObserver.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    reveals.forEach((el) => revealObserver.observe(el));
  }

  /* Tudo que estava escondido já tem quem revele: desliga a proteção de 4 s do <head> */
  root.classList.add("js-ok");

  /* Navegação: fundo ao rolar + indicador da seção ativa */
  const nav = document.querySelector("[data-nav]");
  const links = [...document.querySelectorAll("[data-nav-link]")];
  const indicator = document.querySelector("[data-nav-indicator]");
  const pill = indicator?.parentElement;

  /* Menu que rola de lado (telas pequenas): marca para que lado ainda há itens escondidos */
  const updatePillFade = () => {
    if (!pill) return;
    const max = pill.scrollWidth - pill.clientWidth;
    pill.classList.toggle("can-left", pill.scrollLeft > 4);
    pill.classList.toggle("can-right", pill.scrollLeft < max - 4);
  };
  pill?.addEventListener("scroll", updatePillFade, { passive: true });

  const moveIndicator = (link) => {
    updatePillFade();
    if (!indicator || !link) return;
    indicator.style.width = `${link.offsetWidth}px`;
    indicator.style.transform = `translateX(${link.offsetLeft}px)`;
    indicator.classList.add("is-ready");
    links.forEach((l) => l.classList.toggle("is-active", l === link));
    if (pill && pill.scrollWidth > pill.clientWidth) {
      pill.scrollTo({ left: link.offsetLeft - pill.clientWidth / 2 + link.offsetWidth / 2, behavior: reduceMotion ? "auto" : "smooth" });
    }
  };

  /* Em telas pequenas a navbar some ao rolar para baixo e volta ao rolar para cima */
  const smallScreen = window.matchMedia("(max-width: 720px)");
  let lastY = window.scrollY;
  const updateNav = () => {
    const y = window.scrollY;
    nav?.classList.toggle("is-scrolled", y > 24);
    if (!smallScreen.matches || y < 120 || nav?.contains(document.activeElement)) {
      nav?.classList.remove("is-hidden");
      lastY = y;
      return;
    }
    const dy = y - lastY;
    if (Math.abs(dy) < 8) return;          // ignora tremidas pequenas
    nav?.classList.toggle("is-hidden", dy > 0);
    lastY = y;
  };
  updateNav();
  window.addEventListener("scroll", updateNav, { passive: true }); // leve: só lê scrollY e alterna classes
  nav?.addEventListener("focusin", () => nav.classList.remove("is-hidden"));

  const sections = [...document.querySelectorAll("[data-section]")];
  let current = links[0];
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const link = links.find((l) => l.getAttribute("href") === `#${entry.target.id}`);
        if (link && link !== current) { current = link; moveIndicator(link); }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => sectionObserver.observe(s));
  document.fonts?.ready.then(() => moveIndicator(current));
  moveIndicator(current);
  window.addEventListener("resize", () => moveIndicator(current));

  /* Vídeos dos projetos: pôster só carrega quando a pasta se aproxima da tela */
  const videos = document.querySelectorAll(".folder-sheet video");
  const posterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const v = entry.target;
      if (v.dataset.poster) { v.poster = v.dataset.poster; v.removeAttribute("data-poster"); }
      obs.unobserve(v);
    });
  }, { rootMargin: "700px 0px" });
  videos.forEach((v) => posterObserver.observe(v));

  /* ...e tocam quando a pasta está visível */
  const startVideo = (video) => {
    if (video.preload === "none") { video.preload = "auto"; video.load(); }
    video.play().catch(() => {});
  };
  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) startVideo(entry.target);
        else entry.target.pause();
      });
    },
    { threshold: 0.35 }
  );
  if (!reduceMotion && !saveData) {
    videos.forEach((v) => videoObserver.observe(v));
  } else {
    /* Economia de dados ou movimento reduzido: fica só o pôster, com um botão para tocar */
    videos.forEach((video) => {
      const sheet = video.closest(".folder-sheet");
      const name = video.closest("[data-folder]")?.querySelector(".folder-title")?.textContent.trim();
      if (!sheet) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sheet-play";
      btn.innerHTML = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 0.5v9l8-4.5z"/></svg><span>Tocar prévia</span>';
      if (name) btn.setAttribute("aria-label", `Tocar prévia de ${name}`);
      btn.addEventListener("click", () => {
        btn.remove();
        startVideo(video);
        videoObserver.observe(video); // daqui em diante pausa fora da tela, como os demais
      });
      sheet.after(btn);
    });
  }

  /* Pastas: a folha fecha em 16:9 e abre na proporção real do vídeo (sem cortar) */
  const folders = [...document.querySelectorAll("[data-folder]")];
  const sizeSheet = (folder) => {
    const sheet = folder.querySelector(".folder-sheet");
    const video = sheet?.querySelector("video");
    if (!sheet) return;
    const ratio = video && video.videoWidth ? video.videoHeight / video.videoWidth : Number(sheet.dataset.ratio || 1);
    const w = sheet.clientWidth;
    sheet.style.setProperty("--h-closed", `${Math.round(w * 9 / 16)}px`);
    sheet.style.setProperty("--h-open", `${Math.round(w * ratio)}px`);
  };
  if (folders.length) {
    const ro = new ResizeObserver((entries) => entries.forEach((e) => sizeSheet(e.target.closest("[data-folder]"))));
    folders.forEach((folder) => {
      const sheet = folder.querySelector(".folder-sheet");
      if (!sheet) return;
      ro.observe(sheet);
      sheet.querySelector("video")?.addEventListener("loadedmetadata", () => sizeSheet(folder));
      /* Abre só com o mouse (ou o foco do teclado) sobre o vídeo, não sobre a pasta inteira */
      if (canHover) {
        sheet.addEventListener("pointerenter", () => folder.classList.add("is-open"));
        sheet.addEventListener("pointerleave", () => folder.classList.remove("is-open"));
      }
      sheet.addEventListener("focus", () => folder.classList.add("is-open"));
      sheet.addEventListener("blur", () => folder.classList.remove("is-open"));
    });
    root.classList.add("has-sheet-sizes");
  }

  /* Grade do fundo acende perto do cursor (camada mais clara revelada por máscara) */
  const lit = document.querySelector("[data-grid-lit]");
  if (lit && canHover && !reduceMotion) {
    let raf = 0;
    window.addEventListener("pointermove", (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        lit.style.setProperty("--gx", `${e.clientX}px`);
        lit.style.setProperty("--gy", `${e.clientY}px`);
        lit.classList.add("is-on");
      });
    }, { passive: true });
    document.documentElement.addEventListener("pointerleave", () => lit.classList.remove("is-on"));
  }

  /* Parallax sutil na pasta do hero */
  const hero = document.querySelector("[data-hero]");
  if (hero && canHover && !reduceMotion) {
    const layers = hero.querySelectorAll(".hero-hand, .hero-card");
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      layers.forEach((l) => { l.style.transform = `translate3d(${x * -10}px, ${y * -8}px, 0)`; });
    });
    hero.addEventListener("pointerleave", () => layers.forEach((l) => { l.style.transform = ""; }));
  }

  /* Destaque que segue o cursor nos cartões "Por que eu" */
  document.querySelectorAll("[data-spot]").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  /* Crachá pendurado: cordão flexível + cartão 3D.
     - O cordão é uma corrente de pontos (integração de Verlet) presa no punho: fica
       esticado com o peso do cartão e dobra quando o cartão é levantado.
     - Mosquetão e cartão são hastes rígidas no fim da corrente (ilhós → centro de massa).
     - O cartão ainda gira em 3D: em torno do próprio eixo vertical (ry, mostra o verso)
       e inclina para frente/trás (rx), com molas de torção.
     Arraste para mover, solte em movimento para arremessar e girar, clique para virar.
     Medidas em "unidades" = 1% da largura do conjunto (as mesmas em cqw do CSS). */
  const rig = document.querySelector("[data-badge]");
  const cardEl = rig?.querySelector("[data-badge-card]");
  const claspEl = rig?.querySelector(".lanyard-clasp");
  if (rig && cardEl && claspEl && !reduceMotion) {
    const PX = 50, PY = 40;                    // saída do cordão no punho (--pivot-y: 40cqw)
    const N = 8, ROPE = 29, SEG = ROPE / N;    // cordão: 8 trechos
    const CLASP = 26, BODY = 50;               // ponta do cordão → ilhós → centro do cartão
    const REACH = ROPE + CLASP + BODY - 0.5;   // até onde o cartão alcança com o cordão esticado
    const G = 950, DT = 1 / 120, DAMP = 1 - 0.8 * DT, ITER = 16;
    const KS = 16, CS = 3.6;                   // mola e amortecimento do giro (ry)
    const KX = 40, CX = 7;                     // idem para a inclinação (rx)
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    const mk = (x, y, w) => ({ x, y, px: x, py: y, w }); // w = 1 / massa (0 = fixo)
    const pts = [];
    for (let i = 0; i <= N; i++) pts.push(mk(PX, PY + SEG * i, i ? 1 : 0));
    const end = pts[N];
    const eye = mk(PX, PY + ROPE + CLASP, 0.4);
    const com = mk(PX, eye.y + BODY, 0.1);
    pts.push(eye, com);
    const links = [];
    for (let i = 0; i < N; i++) links.push([pts[i], pts[i + 1], SEG]);
    links.push([end, eye, CLASP], [eye, com, BODY]);
    /* rigidez da fita: pontos alternados não chegam perto demais (evita dobra em quina);
       o ponto fixo acima do punho faz o cordão sair da mão apontando para baixo */
    const bends = [[{ x: PX, y: PY - SEG, w: 0 }, pts[1]]];
    for (let i = 0; i <= N - 2; i++) bends.push([pts[i], pts[i + 2]]);

    /* Cordão desenhado em SVG (o texto acompanha a curva) */
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "lanyard-rope");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<path class="rope-edge"/><path class="rope-body" id="lanyard-rope-path"/>' +
      '<text class="rope-text"><textPath href="#lanyard-rope-path" startOffset="42%">emanuel(dev)</textPath></text>';
    rig.querySelector("[data-badge-swing]").before(svg);
    const ropePaths = svg.querySelectorAll("path");
    rig.classList.add("is-live");

    let u = rig.clientWidth / 100 || 1;        // px por unidade
    let ry = 0, wy = 0, rx = 0, wx = 0;        // giro 3D do cartão
    let face = 0, faceLock = 0;                // lado em repouso (par = frente) e trava após o clique
    let tiltY = 0, tiltX = 0, hoverY = 0, hoverX = 0;
    let dragging = false, tx = com.x, ty = com.y, offX = 0, offY = 0, grabX = 0, grabY = 0;
    let downX = 0, downY = 0, downT = 0, moved = false;
    let raf = 0, last = 0, acc = 0, calm = 0;

    const solve = (a, b, len, wa, wb, k) => {
      const sum = wa + wb;
      if (!sum) return;
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 0.0001;
      const diff = ((d - len) / d) * k;
      a.x += dx * diff * (wa / sum); a.y += dy * diff * (wa / sum);
      b.x -= dx * diff * (wb / sum); b.y -= dy * diff * (wb / sum);
    };

    const step = () => {
      for (const p of pts) {
        if (!p.w || (dragging && p === com)) continue;
        const vx = (p.x - p.px) * DAMP, vy = (p.y - p.py) * DAMP;
        p.px = p.x; p.py = p.y;
        p.x += vx; p.y += vy + G * DT * DT;
      }
      if (dragging) { // o cartão segue o ponteiro, sem passar do alcance do cordão
        let dx = tx - PX, dy = ty - PY;
        const d = Math.hypot(dx, dy);
        if (d > REACH) { dx *= REACH / d; dy *= REACH / d; }
        com.px = com.x; com.py = com.y;
        com.x += (PX + dx - com.x) * 0.3; com.y += (PY + dy - com.y) * 0.3;
      }
      const wc = dragging ? 0 : com.w;
      for (let it = 0; it < ITER; it++) {
        for (const [a, b, len] of links) solve(a, b, len, a === com ? wc : a.w, b === com ? wc : b.w, 1);
        for (const [a, b] of bends) {
          if (Math.hypot(b.x - a.x, b.y - a.y) < 2 * SEG) solve(a, b, 2 * SEG, a.w, b.w, 0.25);
        }
        if (dragging) { // a mão segura o cartão mais ou menos em pé
          eye.x += (com.x - eye.x) * 0.05; eye.y += (com.y - BODY - eye.y) * 0.05;
        }
      }
      /* giro 3D */
      const vx = (com.x - com.px) / DT, vy = (com.y - com.py) / DT;
      tiltY = hoverY; tiltX = hoverX;
      if (dragging) { tiltY = grabX * 0.3 + clamp(vx * 0.003, -0.6, 0.6); tiltX = -grabY * 0.12; }
      tiltX += clamp(-vy * 0.0012, -0.3, 0.3);
      if (!dragging && performance.now() > faceLock) face = Math.round(ry / Math.PI);
      wy += (-KS * (ry - face * Math.PI - tiltY) - CS * wy + (dragging ? 0 : vx * 0.012)) * DT;
      ry += wy * DT;
      wx += (-KX * (rx - tiltX) - CX * wx) * DT;
      rx += wx * DT;
    };

    const f = (v) => (v * u).toFixed(1);
    const render = () => {
      // do mosquetão para o punho, para o texto ler de baixo para cima
      let d = `M${f(end.x)} ${f(end.y)}L${f((end.x + pts[N - 1].x) / 2)} ${f((end.y + pts[N - 1].y) / 2)}`;
      for (let i = N - 1; i >= 1; i--) {
        const p = pts[i], q = pts[i - 1];
        d += `Q${f(p.x)} ${f(p.y)} ${f((p.x + q.x) / 2)} ${f((p.y + q.y) / 2)}`;
      }
      d += `L${f(PX)} ${f(PY)}L${f(PX)} ${f(PY - 4)}`;
      ropePaths.forEach((p) => p.setAttribute("d", d));

      const ac = Math.atan2(end.x - eye.x, eye.y - end.y);
      claspEl.style.transform = `translate(${f(end.x - PX)}px,${f(end.y - PY - ROPE)}px) rotate(${ac.toFixed(4)}rad)`;
      const az = Math.atan2(eye.x - com.x, com.y - eye.y);
      cardEl.style.transform =
        `translate3d(${f(eye.x - PX)}px,${f(eye.y - PY - ROPE - CLASP)}px,0) perspective(${Math.round(u * 260)}px) ` +
        `rotateZ(${az.toFixed(4)}rad) rotateX(${rx.toFixed(4)}rad) rotateY(${ry.toFixed(4)}rad)`;
      if (!lite) {
        cardEl.style.setProperty("--sheen", `${(50 + Math.sin(ry) * 70 + rx * 60).toFixed(1)}%`);
        cardEl.style.setProperty("--sheen-o", clamp(Math.abs(Math.sin(ry)) * 1.6 + Math.abs(rx) * 2, 0, 1).toFixed(2));
      }
    };

    const tick = (t) => {
      acc += Math.min(0.05, (t - (last || t)) / 1000) || DT;
      last = t;
      let n = 0;
      while (acc >= DT && n < 6) { step(); acc -= DT; n++; }
      if (n === 6) acc = 0;
      render();
      let motion = Math.abs(wy) + Math.abs(wx) + Math.abs(ry - face * Math.PI - tiltY) + Math.abs(rx - tiltX);
      for (const p of pts) motion += Math.abs(p.x - p.px) + Math.abs(p.y - p.py);
      calm = !dragging && motion < 0.004 ? calm + 1 : 0;
      if (calm > 20) { raf = 0; last = 0; acc = 0; calm = 0; return; } // parado: desliga o laço
      raf = requestAnimationFrame(tick);
    };
    const wake = () => { if (!raf) raf = requestAnimationFrame(tick); };
    /* empurrão lateral (unidades/s) no cartão */
    const push = (v) => { com.px -= v * DT; eye.px -= v * DT * 0.5; wake(); };
    const flip = () => {
      face += 1;
      faceLock = performance.now() + 900;
      cardEl.setAttribute("aria-pressed", String(face % 2 !== 0));
      wake();
    };

    new ResizeObserver(() => { u = rig.clientWidth / 100 || 1; render(); }).observe(rig);

    const toUnits = (e) => {
      const r = rig.getBoundingClientRect();
      return { x: (e.clientX - r.left) / u, y: (e.clientY - r.top) / u };
    };
    cardEl.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      const p = toUnits(e);
      dragging = true; moved = false;
      downX = e.clientX; downY = e.clientY; downT = performance.now();
      offX = p.x - com.x; offY = p.y - com.y; tx = com.x; ty = com.y;
      grabX = clamp(offX / 39, -1, 1) * (Math.cos(ry) < 0 ? -1 : 1); // de que lado do cartão segurou
      grabY = clamp(offY / 61, -1, 1);
      cardEl.classList.add("is-dragging");
      cardEl.setPointerCapture(e.pointerId);
      wake();
    });
    cardEl.addEventListener("pointermove", (e) => {
      if (dragging) {
        const p = toUnits(e);
        tx = p.x - offX; ty = p.y - offY;
        if (Math.hypot(e.clientX - downX, e.clientY - downY) > 5) moved = true;
      } else if (canHover && e.pointerType === "mouse") { // inclina na direção do cursor
        const r = cardEl.getBoundingClientRect();
        hoverY = clamp(((e.clientX - r.left) / r.width - 0.5) * 2, -1, 1) * 0.26;
        hoverX = -clamp(((e.clientY - r.top) / r.height - 0.5) * 2, -1, 1) * 0.16;
      }
      wake();
    });
    cardEl.addEventListener("pointerleave", () => { hoverY = hoverX = 0; wake(); });
    const release = (e) => {
      if (!dragging) return;
      dragging = false;
      cardEl.classList.remove("is-dragging");
      const click = e.type === "pointerup" && !moved && performance.now() - downT < 400;
      if (click) flip();
      else { // arremesso: quanto mais na borda segurou, mais o cartão gira
        const vx = (com.x - com.px) / DT;
        wy = clamp(wy + vx * 0.05 * (0.5 + Math.abs(grabX)) * (grabX < 0 ? -1 : 1), -16, 16);
      }
      wake();
    };
    cardEl.addEventListener("pointerup", release);
    cardEl.addEventListener("pointercancel", release);
    cardEl.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      flip();
    });

    render();

    // Balanços automáticos (rolagem e entrada) só em aparelhos com folga;
    // em aparelhos fracos o crachá só se mexe quando é segurado.
    if (!lite) {
      let rigVisible = false, lastScrollY = window.scrollY;
      new IntersectionObserver((entries) => { rigVisible = entries[0].isIntersecting; }).observe(rig);
      window.addEventListener("scroll", () => {
        const dy = window.scrollY - lastScrollY; lastScrollY = window.scrollY;
        if (rigVisible) push(clamp(dy * 0.4, -60, 60));
      }, { passive: true });
      new IntersectionObserver((entries, obs) => {
        if (entries[0].isIntersecting) { push(220); obs.disconnect(); }
      }, { threshold: 0.4 }).observe(rig);
    }
  }

  /* Animações infinitas (faixa de tecnologias, seta do hero) pausam fora da tela */
  document.querySelectorAll(".marquee, .scroll-cue").forEach((el) => {
    new IntersectionObserver((entries) => {
      el.classList.toggle("is-paused", !entries[0].isIntersecting);
    }).observe(el);
  });

  /* Toast */
  const toast = document.querySelector("[data-toast]");
  let toastTimer = 0;
  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-on"), 2400);
  };

  /* Copiar email (botão dos contatos e email do cartão): aviso "Email copiado" */
  const copyText = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; }
    } catch { /* cai no método alternativo */ }
    try {
      const ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
      document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch { return false; }
  };
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault(); // o email do cartão copia em vez de abrir o programa de email
      const ok = await copyText(btn.dataset.copy);
      showToast(ok ? "Email copiado" : `Copie manualmente: ${btn.dataset.copy}`);
      const label = btn.querySelector("[data-copy-label]");
      if (ok && label) { label.textContent = "Copiado"; setTimeout(() => { label.textContent = "Copiar"; }, 2000); }
    });
  });

  /* Formulário com validação e envio assíncrono */
  const form = document.querySelector("[data-form]");
  const status = document.querySelector("[data-form-status]");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll("[required]").forEach((field) => {
        const ok = field.checkValidity() && field.value.trim() !== "";
        field.closest(".field")?.classList.toggle("is-invalid", !ok);
        if (!ok) valid = false;
      });
      if (!valid) {
        status.textContent = "Preencha nome, um email válido e a mensagem.";
        form.querySelector(".is-invalid input, .is-invalid textarea")?.focus();
        return;
      }
      const button = form.querySelector("[type=submit]");
      button.disabled = true;
      status.textContent = "Enviando…";
      try {
        const endpoint = form.action.replace("formsubmit.co/", "formsubmit.co/ajax/");
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form),
        });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        status.textContent = "Mensagem enviada. Obrigado!";
      } catch {
        status.textContent = "Não foi possível enviar agora. Use o email ou o WhatsApp.";
      } finally {
        button.disabled = false;
      }
    });
    form.addEventListener("input", (e) => e.target.closest(".field")?.classList.remove("is-invalid"));
  }
})();
