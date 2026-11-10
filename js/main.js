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

  /* Crachá pendurado: pêndulo com física simples.
     - .badge-swing (alça + crachá) gira em torno da base do clipe (ângulo th)
     - o crachá ainda gira um pouco em torno da fenda (ângulo ph), com atraso
     Arraste para segurar; solte para lançar para qualquer lado. */
  const rig = document.querySelector("[data-badge]");
  if (rig && !reduceMotion) {
    const swing = rig.querySelector("[data-badge-swing]");
    const card = rig.querySelector("[data-badge-card]");
    const K = 9;      // gravidade / comprimento  (cordinha longa: período ≈ 2,1 s)
    const C = 0.75;   // amortecimento do balanço
    const KP = 120, CP = 8, LAG = 0.28; // mola e atraso do crachá na fenda
    const LIMIT = 2.5; // rad — não deixa dar a volta completa
    let th = 0, w = 0, ph = 0, wp = 0;
    let dragging = false, grabA = 0, grabTh = 0, lastT = 0, lastTh = 0;
    let raf = 0, prev = 0;

    const pivot = () => {
      const r = rig.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + parseFloat(getComputedStyle(swing).marginTop) }; // pivô = saída do cordão no punho
    };
    const angleAt = (e) => {
      const p = pivot();
      return Math.atan2(e.clientX - p.x, e.clientY - p.y);
    };
    const render = () => {
      swing.style.transform = `rotate(${th}rad)`;
      card.style.transform = `rotate(${ph}rad)`;
    };
    const step = (dt) => {
      const wBefore = w;
      if (!dragging) {
        w += (-K * Math.sin(th) - C * w) * dt;
        th += w * dt;
        if (Math.abs(th) > LIMIT) { th = Math.sign(th) * LIMIT; w *= -0.35; }
      }
      const alpha = (w - wBefore) / dt;
      wp += (-KP * Math.sin(ph) - CP * wp - alpha * LAG) * dt;
      ph += wp * dt;
      ph = Math.max(-0.6, Math.min(0.6, ph));
    };
    const tick = (t) => {
      const dt = Math.min(0.05, (t - (prev || t)) / 1000) || 1 / 60;
      prev = t;
      const n = 4;
      for (let i = 0; i < n; i++) step(dt / n);
      render();
      const resting = !dragging && Math.abs(th) < 0.0015 && Math.abs(w) < 0.002 && Math.abs(ph) < 0.001 && Math.abs(wp) < 0.002;
      if (resting) { th = w = ph = wp = 0; render(); raf = 0; prev = 0; return; }
      raf = requestAnimationFrame(tick);
    };
    const wake = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const push = (dw) => { w = Math.max(-14, Math.min(14, w + dw)); wake(); };

    card.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      dragging = true;
      card.classList.add("is-dragging");
      card.setPointerCapture(e.pointerId);
      grabA = angleAt(e); grabTh = th;
      lastT = performance.now(); lastTh = th; w = 0;
      wake();
    });
    card.addEventListener("pointermove", (e) => {
      if (!dragging) return; // só reage enquanto estiver sendo segurado
      let target = grabTh - (angleAt(e) - grabA);
      target = Math.max(-LIMIT, Math.min(LIMIT, target));
      const now = performance.now();
      const dt = Math.max(0.008, (now - lastT) / 1000);
      const v = (target - lastTh) / dt;
      w = w * 0.5 + v * 0.5; // velocidade suavizada = força do arremesso
      th = target; lastTh = target; lastT = now;
    });
    const release = () => {
      if (!dragging) return;
      dragging = false;
      card.classList.remove("is-dragging");
      if (performance.now() - lastT > 90) w *= 0.2; // segurou parado: solta sem lançar
      w = Math.max(-14, Math.min(14, w));
      wake();
    };
    card.addEventListener("pointerup", release);
    card.addEventListener("pointercancel", release);

    // Balanços automáticos (rolagem e entrada) só em aparelhos com folga;
    // em aparelhos fracos o crachá só se mexe quando é segurado.
    if (!lite) {
      let rigVisible = false, lastScrollY = window.scrollY;
      new IntersectionObserver((entries) => { rigVisible = entries[0].isIntersecting; }).observe(rig);
      window.addEventListener("scroll", () => {
        const dy = window.scrollY - lastScrollY; lastScrollY = window.scrollY;
        if (rigVisible) push(Math.max(-0.6, Math.min(0.6, dy * 0.004)));
      }, { passive: true });
      new IntersectionObserver((entries, obs) => {
        if (entries[0].isIntersecting) { push(2.2); obs.disconnect(); }
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
