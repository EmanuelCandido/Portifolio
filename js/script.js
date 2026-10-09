/* ==========================================================================
   Emanuel Cândido — Portfólio v2
   JavaScript sem dependências. Cada bloco é independente e tolera ausência
   dos elementos que controla.
   ========================================================================== */

window.__portfolioReady = true;

const root = document.documentElement;
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const compactQuery = window.matchMedia("(max-width: 960px)");

const storage = {
  get(store, key) {
    try { return window[store].getItem(key); } catch { return null; }
  },
  set(store, key, value) {
    try { window[store].setItem(key, value); } catch { /* armazenamento indisponível */ }
  }
};

$$("[data-year]").forEach((node) => { node.textContent = new Date().getFullYear(); });

/* ---------- Tema claro/escuro ---------- */
const themeQuery = window.matchMedia("(prefers-color-scheme: dark)");
const themeColors = { light: "#f3f2ee", dark: "#0c0c0b" };

const currentTheme = () => root.dataset.theme || (themeQuery.matches ? "dark" : "light");

const syncThemeMeta = () => {
  if (!root.dataset.theme) return;
  $$('meta[name="theme-color"]').forEach((meta) => { meta.content = themeColors[root.dataset.theme]; });
};

$("[data-theme-toggle]")?.addEventListener("click", () => {
  const next = currentTheme() === "dark" ? "light" : "dark";
  root.classList.add("theme-anim");
  root.dataset.theme = next;
  storage.set("localStorage", "theme", next);
  syncThemeMeta();
  window.setTimeout(() => root.classList.remove("theme-anim"), 500);
});
syncThemeMeta();

/* ---------- Títulos divididos em palavras ---------- */
const splitWords = (element) => {
  let index = 0;

  const walk = (node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
        return;
      }

      if (child.nodeType !== Node.TEXT_NODE) return;

      const fragment = document.createDocumentFragment();
      child.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;

        if (/^\s+$/.test(part)) {
          fragment.append(" ");
          return;
        }

        const word = document.createElement("span");
        const inner = document.createElement("span");
        word.className = "w";
        inner.textContent = part;
        inner.style.setProperty("--i", index++);
        word.append(inner);
        fragment.append(word);
      });

      child.replaceWith(fragment);
    });
  };

  element.normalize();
  walk(element);
};

if (!reducedMotion) {
  $$("[data-split]").forEach(splitWords);
}

/* ---------- Texto "decodificado" nos rótulos mono ---------- */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>_-";

const scrambleText = (textNode, duration = 700) => {
  const finalText = textNode.textContent;
  const startedAt = performance.now();

  const frame = (now) => {
    const progress = clamp((now - startedAt) / duration, 0, 1);
    const revealed = Math.floor(progress * finalText.length);
    let output = finalText.slice(0, revealed);

    for (let i = revealed; i < finalText.length; i++) {
      output += /\s/.test(finalText[i]) ? finalText[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }

    textNode.textContent = output;
    if (progress < 1) window.requestAnimationFrame(frame);
    else textNode.textContent = finalText;
  };

  window.requestAnimationFrame(frame);
};

const scrambleLabel = (element) => {
  if (reducedMotion) return;
  const textNode = Array.from(element.childNodes).reverse().find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
  if (textNode) scrambleText(textNode);
};

/* ---------- Reveal no scroll ---------- */
const revealTargets = $$("[data-reveal], [data-split]:not(.hero-title)");

const revealElement = (element, delay = 0) => {
  element.style.setProperty("--rd", `${delay}ms`);
  element.classList.add("is-in");
  if (element.classList.contains("section-index")) {
    window.setTimeout(() => scrambleLabel(element), delay);
  }
};

if ("IntersectionObserver" in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver((entries) => {
    let order = 0;
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      revealElement(entry.target, Math.min(order++, 6) * 90);
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: .12 });

  revealTargets.forEach((element) => revealObserver.observe(element));
} else {
  revealTargets.forEach((element) => element.classList.add("is-in"));
}

/* ---------- Intro ---------- */
const intro = $(".intro");

const setReady = () => root.classList.add("is-ready");

const runIntro = () => {
  const bar = $("[data-intro-bar]");
  const duration = 1250;
  const startedAt = performance.now();
  const fontsReady = Promise.race([
    document.fonts?.ready ?? Promise.resolve(),
    new Promise((resolve) => window.setTimeout(resolve, 2400))
  ]);

  const finish = () => {
    intro.classList.add("is-done");
    storage.set("sessionStorage", "intro-seen", "1");
    window.setTimeout(setReady, 280);
    window.setTimeout(() => intro.remove(), 1300);
  };

  const tick = (now) => {
    const progress = clamp((now - startedAt) / duration, 0, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    bar.parentElement.style.setProperty("--p", eased.toFixed(3));
    bar.style.setProperty("--p", eased.toFixed(3));

    if (progress < 1) window.requestAnimationFrame(tick);
    else fontsReady.then(finish);
  };

  window.requestAnimationFrame(tick);
};

if (!intro || reducedMotion || root.classList.contains("intro-skip")) {
  intro?.remove();
  window.setTimeout(setReady, 40);
} else {
  runIntro();
}

/* ---------- Navegação: estado, seção ativa, indicador ---------- */
const nav = $("[data-nav]");
const navList = $("[data-nav-links]");
const navIndicator = $(".nav-indicator");
const navLinks = $$("[data-nav-links] a");
const menuLinks = $$(".menu-links a");
const railLinks = $$("[data-rail-link]");
const rail = $("[data-rail]");
const sections = $$("[data-section]");
let lastScrollY = window.scrollY;
let activeSectionId = null;
let menuIsOpen = false;

const moveIndicator = (link) => {
  if (!navList || !navIndicator) return;

  if (!link || link.offsetParent === null) {
    navList.classList.remove("has-active");
    return;
  }

  navIndicator.style.setProperty("--x", `${link.offsetLeft}px`);
  navIndicator.style.setProperty("--w", `${link.offsetWidth}px`);
  navList.classList.add("has-active");
};

const setActiveSection = (id) => {
  if (id === activeSectionId) return;
  activeSectionId = id;

  [...navLinks, ...menuLinks, ...railLinks].forEach((link) => {
    const isActive = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("is-active", isActive);
    if (isActive) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });

  moveIndicator(navLinks.find((link) => link.classList.contains("is-active")));
};

const updateRailPositions = () => {
  if (!rail) return;
  const maxScroll = Math.max(root.scrollHeight - window.innerHeight, 1);

  railLinks.forEach((link) => {
    const section = $(link.getAttribute("href"));
    if (!section) return;
    const position = clamp(section.offsetTop / maxScroll, 0, 1);
    link.style.setProperty("--pos", position.toFixed(4));
  });
};

let scrollFrame = null;

const onScroll = () => {
  scrollFrame = null;
  const y = window.scrollY;
  const delta = y - lastScrollY;

  nav?.classList.toggle("is-scrolled", y > 24);

  if (Math.abs(delta) > 6 && !menuIsOpen) {
    const hide = delta > 0 && y > window.innerHeight * .6 && !nav?.matches(":focus-within");
    nav?.classList.toggle("is-hidden", hide);
    lastScrollY = y;
  }

  const marker = y + window.innerHeight * .4;
  let current = sections[0]?.id ?? null;
  sections.forEach((section) => {
    if (section.offsetTop <= marker) current = section.id;
  });
  if (y + window.innerHeight >= root.scrollHeight - 4) current = sections.at(-1)?.id ?? current;
  setActiveSection(current);

  if (rail) {
    const maxScroll = Math.max(root.scrollHeight - window.innerHeight, 1);
    rail.style.setProperty("--p", clamp(y / maxScroll, 0, 1).toFixed(4));
  }
};

const queueScroll = () => {
  if (!scrollFrame) scrollFrame = window.requestAnimationFrame(onScroll);
};

window.addEventListener("scroll", queueScroll, { passive: true });
window.addEventListener("resize", () => {
  updateRailPositions();
  moveIndicator(navLinks.find((link) => link.classList.contains("is-active")));
  queueScroll();
});
window.addEventListener("load", () => { updateRailPositions(); queueScroll(); });
if ("ResizeObserver" in window) new ResizeObserver(updateRailPositions).observe(document.body);
updateRailPositions();
onScroll();
window.requestAnimationFrame(() => navIndicator?.classList.add("is-ready"));

/* ---------- Menu mobile ---------- */
const menu = $("#menu");
const menuOpenButton = $("[data-menu-open]");

const openMenu = () => {
  if (!menu || menuIsOpen) return;
  menuIsOpen = true;
  menu.showModal();
  root.style.overflow = "hidden";
  menuOpenButton?.setAttribute("aria-expanded", "true");
  window.requestAnimationFrame(() => menu.classList.add("is-open"));
};

const closeMenu = ({ immediate = false } = {}) => {
  if (!menu || !menuIsOpen) return;
  menuIsOpen = false;
  menu.classList.remove("is-open");
  root.style.overflow = "";
  menuOpenButton?.setAttribute("aria-expanded", "false");

  if (immediate || reducedMotion) menu.close();
  else window.setTimeout(() => menu.close(), 320);
};

menuOpenButton?.addEventListener("click", openMenu);
$("[data-menu-close]")?.addEventListener("click", () => closeMenu());
menu?.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeMenu();
});

menuLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = $(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    closeMenu({ immediate: true });
    target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    history.replaceState(null, "", link.getAttribute("href"));
  });
});

compactQuery.addEventListener("change", (event) => {
  if (!event.matches) closeMenu({ immediate: true });
});

/* ---------- Hero: luz que segue o cursor, tilt e botões magnéticos ---------- */
const hero = $(".hero");
const heroSpot = $("[data-hero-spot]");

if (hero && heroSpot && finePointer && !reducedMotion) {
  hero.addEventListener("pointermove", (event) => {
    const bounds = hero.getBoundingClientRect();
    heroSpot.style.setProperty("--sx", `${event.clientX - bounds.left}px`);
    heroSpot.style.setProperty("--sy", `${event.clientY - bounds.top}px`);
  });
}

const tiltCard = $("[data-tilt]");

if (tiltCard && finePointer && !reducedMotion) {
  let tiltFrame = null;

  tiltCard.addEventListener("pointermove", (event) => {
    const bounds = tiltCard.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;

    window.cancelAnimationFrame(tiltFrame);
    tiltFrame = window.requestAnimationFrame(() => {
      tiltCard.classList.add("is-tilting");
      tiltCard.style.setProperty("--rx", `${(.5 - y) * 7}deg`);
      tiltCard.style.setProperty("--ry", `${(x - .5) * 9}deg`);
      tiltCard.style.setProperty("--gx", `${x * 100}%`);
      tiltCard.style.setProperty("--gy", `${y * 100}%`);
    });
  });

  tiltCard.addEventListener("pointerleave", () => {
    window.cancelAnimationFrame(tiltFrame);
    tiltCard.classList.remove("is-tilting");
    tiltCard.style.setProperty("--rx", "0deg");
    tiltCard.style.setProperty("--ry", "0deg");
  });
}

if (finePointer && !reducedMotion) {
  $$("[data-magnetic]").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const bounds = element.getBoundingClientRect();
      const dx = event.clientX - (bounds.left + bounds.width / 2);
      const dy = event.clientY - (bounds.top + bounds.height / 2);
      element.style.transform = `translate(${dx * .18}px, ${dy * .3}px)`;
    });

    element.addEventListener("pointerleave", () => { element.style.transform = ""; });
  });
}

/* ---------- Chip de requisições da API ---------- */
const apiChip = $(".api-chip");
const apiRequests = [
  ["GET", "/api/projects", "200 OK", "38ms"],
  ["POST", "/api/auth/login", "200 OK", "112ms"],
  ["GET", "/api/services?active=true", "200 OK", "24ms"],
  ["PUT", "/api/schedule/42", "204 No Content", "57ms"],
  ["POST", "/api/contact", "201 Created", "89ms"]
];

if (apiChip && !reducedMotion) {
  const fields = ["[data-api-method]", "[data-api-path]", "[data-api-status]", "[data-api-time]"].map((selector) => $(selector, apiChip));
  let requestIndex = 0;
  let heroVisible = true;

  if ("IntersectionObserver" in window && hero) {
    new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; }).observe(hero);
  }

  window.setInterval(() => {
    if (!heroVisible || document.hidden) return;
    requestIndex = (requestIndex + 1) % apiRequests.length;
    apiChip.classList.add("is-swapping");

    window.setTimeout(() => {
      apiRequests[requestIndex].forEach((value, i) => { if (fields[i]) fields[i].textContent = value; });
      apiChip.classList.remove("is-swapping");
    }, 300);
  }, 2800);
}

/* ---------- Faixa de tecnologias ---------- */
const marqueeTrack = $(".marquee-track");

if (marqueeTrack) {
  const list = $(".marquee-list", marqueeTrack);
  const clone = list.cloneNode(true);
  clone.setAttribute("aria-hidden", "true");
  marqueeTrack.append(clone);
}

/* ---------- Pausa global de mídia ---------- */
const resetVideo = (video) => {
  if (!video) return;
  video.pause();
  try { video.currentTime = 0; } catch { /* metadados ainda não carregados */ }
};

const playVideo = (video) => {
  if (!video || reducedMotion) return Promise.resolve(false);
  const request = video.play();
  return request instanceof Promise ? request.then(() => true).catch(() => false) : Promise.resolve(true);
};

/* ---------- 01 · Especialidades ---------- */
const skillsRoot = $("[data-skills]");

if (skillsRoot) {
  const skills = $$(".skill", skillsRoot);
  const stageFrame = $(".stage-frame", skillsRoot);
  const stageVideos = $$(".stage-video", skillsRoot);
  const stageProgress = $("[data-stage-progress]", skillsRoot);
  let activeSkill = 0;
  let stageVisible = false;
  let progressFrame = null;

  const currentVideo = () => compactQuery.matches
    ? $(".skill-media-inline", skills[activeSkill])
    : stageVideos[activeSkill];

  const allVideos = () => [...stageVideos, ...$$(".skill-media-inline", skillsRoot)];

  const trackProgress = () => {
    const video = currentVideo();
    const progress = video && video.duration ? video.currentTime / video.duration : 0;
    skills[activeSkill]?.style.setProperty("--p", progress.toFixed(4));
    stageProgress?.style.setProperty("--p", progress.toFixed(4));
    progressFrame = window.requestAnimationFrame(trackProgress);
  };

  const syncPlayback = () => {
    const video = currentVideo();
    allVideos().forEach((candidate) => { if (candidate !== video) candidate.pause(); });

    const shouldPlay = stageVisible && !document.hidden && !reducedMotion;
    if (!video || !shouldPlay) {
      video?.pause();
      window.cancelAnimationFrame(progressFrame);
      return;
    }

    playVideo(video);
    window.cancelAnimationFrame(progressFrame);
    progressFrame = window.requestAnimationFrame(trackProgress);
  };

  const setSkill = (index) => {
    if (index === activeSkill && skills[index].classList.contains("is-active")) return;
    const previous = currentVideo();
    activeSkill = index;

    skills.forEach((skill, i) => {
      skill.classList.toggle("is-active", i === index);
      if (i !== index) skill.style.setProperty("--p", 0);
    });
    stageVideos.forEach((video, i) => video.classList.toggle("is-active", i === index));
    resetVideo(previous);


    syncPlayback();
  };

  skills.forEach((skill, index) => {
    skill.addEventListener("focus", () => setSkill(index));
    if (finePointer) skill.addEventListener("pointerenter", () => setSkill(index));
  });

  if ("IntersectionObserver" in window) {
    const centerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setSkill(skills.indexOf(entry.target));
      });
    }, { rootMargin: "-46% 0px -46% 0px" });
    skills.forEach((skill) => centerObserver.observe(skill));

    new IntersectionObserver(([entry]) => {
      stageVisible = entry.isIntersecting;
      syncPlayback();
    }, { threshold: .2 }).observe(skillsRoot);
  }

  compactQuery.addEventListener("change", () => {
    allVideos().forEach(resetVideo);
    syncPlayback();
  });
  document.addEventListener("visibilitychange", syncPlayback);
}

/* ---------- 02 · Projetos: prévia em vídeo e cursor ---------- */
const projectVideos = $$(".project-video");
const visibleProjectVideos = new Set();

if (!reducedMotion && "IntersectionObserver" in window) {
  const projectObserver = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) {
        visibleProjectVideos.add(target);
        if (!document.hidden) playVideo(target);
      } else {
        visibleProjectVideos.delete(target);
        target.pause();
      }
    });
  }, { threshold: .35 });

  projectVideos.forEach((video) => projectObserver.observe(video));

  document.addEventListener("visibilitychange", () => {
    projectVideos.forEach((video) => {
      if (document.hidden) video.pause();
      else if (visibleProjectVideos.has(video)) playVideo(video);
    });
  });
}

const cursorLabel = $("[data-cursor-label]");

if (cursorLabel && finePointer && !reducedMotion) {
  const cursorText = $("[data-cursor-text]", cursorLabel);
  const target = { x: 0, y: 0 };
  const position = { x: 0, y: 0 };
  let following = false;
  let cursorFrame = null;

  const render = () => {
    position.x += (target.x - position.x) * .2;
    position.y += (target.y - position.y) * .2;
    cursorLabel.style.transform = `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`;

    if (following || Math.abs(target.x - position.x) > .5 || Math.abs(target.y - position.y) > .5) {
      cursorFrame = window.requestAnimationFrame(render);
    } else {
      cursorFrame = null;
    }
  };

  window.addEventListener("pointermove", (event) => {
    target.x = event.clientX;
    target.y = event.clientY;
    if (!cursorFrame && following) cursorFrame = window.requestAnimationFrame(render);
  }, { passive: true });

  $$("[data-cursor]").forEach((element) => {
    element.addEventListener("pointerenter", (event) => {
      cursorText.textContent = element.dataset.cursor;
      target.x = position.x = event.clientX;
      target.y = position.y = event.clientY;
      following = true;
      root.classList.add("has-cursor-label");
      cursorLabel.classList.add("is-visible");
      if (!cursorFrame) cursorFrame = window.requestAnimationFrame(render);
    });

    element.addEventListener("pointerleave", () => {
      following = false;
      root.classList.remove("has-cursor-label");
      cursorLabel.classList.remove("is-visible");
    });
  });
}

/* ---------- 03 · IDE com digitação e syntax highlight ---------- */
const ideRoot = $("[data-ide]");

const codeSamples = [
  {
    lang: "Java",
    code: `@RestController
@RequestMapping("/api/projects")
class ProjectController {
  @GetMapping
  List<Project> list() {
    return service.findAll();
  }
}`
  },
  {
    lang: "Java",
    code: `@Service
class PortfolioService {
  Project publish(Project input) {
    validate(input);
    return repository.save(input);
  }
}`
  },
  {
    lang: "SQL",
    code: `-- projetos em destaque
SELECT title, stack, status
FROM projects
WHERE featured = true
ORDER BY updated_at DESC;`
  },
  {
    lang: "JavaScript",
    code: `await fetch("/api/contact", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(message)
});`
  }
];

const KEYWORDS = {
  Java: new Set(["class", "public", "private", "return", "new", "void", "final", "static", "if", "else", "throws", "extends", "implements"]),
  SQL: new Set(["SELECT", "FROM", "WHERE", "ORDER", "BY", "DESC", "ASC", "AND", "OR", "JOIN", "ON", "LIMIT", "true", "false"]),
  JavaScript: new Set(["const", "let", "await", "async", "return", "new", "function", "true", "false", "if", "else"])
};

const tokenize = ({ lang, code }) => {
  const pattern = /(\/\/.*|--.*)|("(?:[^"\\]|\\.)*")|(@\w+)|(\b\d+\b)|([A-Za-z_]\w*)|([{}()[\];,.<>=:])|(\s+|.)/g;
  const tokens = [];
  let match;

  while ((match = pattern.exec(code))) {
    const [text, comment, string, annotation, number, word, punctuation] = match;
    let type = "";

    if (comment) type = "com";
    else if (string) type = "str";
    else if (annotation) type = "ann";
    else if (number) type = "num";
    else if (punctuation) type = "pun";
    else if (word) {
      const nextChar = code[pattern.lastIndex];
      if (KEYWORDS[lang].has(word)) type = "kw";
      else if (/^[A-Z]/.test(word) && lang !== "SQL") type = "type";
      else if (nextChar === "(") type = "fn";
    }

    tokens.push({ text, type });
  }

  return tokens;
};

const escapeHtml = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

if (ideRoot) {
  const codeElement = $("[data-ide-code]", ideRoot);
  const gutter = $("[data-ide-gutter]", ideRoot);
  const langLabel = $("[data-ide-lang]", ideRoot);
  const tabs = $$("[data-ide-tab]", ideRoot);
  const tokenized = codeSamples.map(tokenize);
  let sampleIndex = 0;
  let typed = 0;
  let timer = null;
  let ideVisible = false;
  let hovering = false;

  const render = (count, showCaret = true) => {
    let remaining = count;
    let html = "";

    for (const token of tokenized[sampleIndex]) {
      if (remaining <= 0) break;
      const text = token.text.slice(0, remaining);
      remaining -= text.length;
      html += token.type ? `<span class="tk-${token.type}">${escapeHtml(text)}</span>` : escapeHtml(text);
    }

    codeElement.innerHTML = html + (showCaret ? '<span class="ide-caret"></span>' : "");
  };

  const selectSample = (index) => {
    sampleIndex = index;
    typed = 0;
    const sample = codeSamples[index];
    gutter.textContent = sample.code.split("\n").map((_, i) => i + 1).join("\n");
    if (langLabel) langLabel.textContent = sample.lang;

    tabs.forEach((tab, i) => {
      const isActive = i === index;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });
  };

  const step = () => {
    timer = null;
    if (!ideVisible || document.hidden) return;

    const sample = codeSamples[sampleIndex].code;

    if (typed < sample.length) {
      typed += 1;
      render(typed);
      const char = sample[typed - 1];
      timer = window.setTimeout(step, char === "\n" ? 110 : /[{};,(]/.test(char) ? 55 : 22 + Math.random() * 18);
    } else {
      timer = window.setTimeout(() => {
        if (hovering) { timer = window.setTimeout(step, 600); return; }
        selectSample((sampleIndex + 1) % codeSamples.length);
        render(0);
        timer = window.setTimeout(step, 350);
      }, 2600);
    }
  };

  const sync = () => {
    if (reducedMotion) return;
    if (ideVisible && !document.hidden && !timer) timer = window.setTimeout(step, 250);
    if ((!ideVisible || document.hidden) && timer) { window.clearTimeout(timer); timer = null; }
  };

  selectSample(0);

  if (reducedMotion) {
    render(codeSamples[0].code.length, false);
  } else {
    render(0);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      window.clearTimeout(timer);
      timer = null;
      selectSample(index);
      if (reducedMotion) render(codeSamples[index].code.length, false);
      else { render(0); sync(); }
    });

    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const next = (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].focus();
      tabs[next].click();
    });
  });

  ideRoot.addEventListener("pointerenter", () => { hovering = true; });
  ideRoot.addEventListener("pointerleave", () => { hovering = false; });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      ideVisible = entry.isIntersecting;
      sync();
    }, { threshold: .25 }).observe(ideRoot);
  } else {
    ideVisible = true;
    sync();
  }

  document.addEventListener("visibilitychange", sync);
}

/* ---------- Toast ---------- */
const toast = $("[data-toast]");
let toastTimer = null;

const showToast = (message) => {
  if (!toast) return;
  toast.innerHTML = `<svg aria-hidden="true"><use href="#i-check"/></svg><span></span>`;
  $("span", toast).textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
};

/* ---------- 04 · Contato: copiar email ---------- */
$$("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const value = button.dataset.copy;

    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const helper = document.createElement("textarea");
      helper.value = value;
      helper.setAttribute("readonly", "");
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.append(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
    }

    showToast("Email copiado para a área de transferência");
  });
});

/* ---------- 04 · Contato: formulário ---------- */
const form = $("#contactForm");

if (form) {
  const submitButton = $("#contactSubmit");
  const submitLabel = $(".btn-label", submitButton);
  const status = $("#formStatus");
  const counter = $("[data-count]", form);
  const message = $("#message", form);
  const touched = new Set();

  const rules = {
    name: (value) => value.trim().length >= 2 || "Informe seu nome.",
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) || "Informe um email válido.",
    message: (value) => value.trim().length >= 10 || "Escreva pelo menos 10 caracteres."
  };

  const validateField = (field) => {
    const rule = rules[field.name];
    if (!rule) return true;
    const result = rule(field.value);
    const error = $(`#${field.id}-error`, form);
    const isValid = result === true;

    field.setAttribute("aria-invalid", String(!isValid));
    if (error) error.textContent = isValid ? "" : result;
    return isValid;
  };

  Object.keys(rules).forEach((name) => {
    const field = form.elements[name];

    field.addEventListener("blur", () => {
      if (field.value) touched.add(name);
      if (touched.has(name)) validateField(field);
    });

    field.addEventListener("input", () => {
      if (touched.has(name)) validateField(field);
    });
  });

  message?.addEventListener("input", () => {
    if (counter) counter.textContent = message.value.length;
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.className = "form-status";
    status.textContent = "";

    const fields = Object.keys(rules).map((name) => form.elements[name]);
    fields.forEach((field) => touched.add(field.name));
    const results = fields.map(validateField);
    const firstInvalid = fields[results.indexOf(false)];

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    if (form.elements._honey?.value) {
      form.reset();
      return;
    }

    submitButton.classList.add("is-loading");
    submitButton.disabled = true;

    try {
      const response = await fetch("https://formsubmit.co/ajax/emanoelcandidolima@gmail.com", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      });

      if (!response.ok) throw new Error("Falha no envio");

      form.reset();
      touched.clear();
      if (counter) counter.textContent = "0";
      fields.forEach((field) => field.removeAttribute("aria-invalid"));
      submitButton.classList.add("is-success");
      submitLabel.textContent = "Mensagem enviada";
      status.classList.add("is-success");
      status.textContent = "Obrigado! Responderei assim que possível.";

      window.setTimeout(() => {
        submitButton.classList.remove("is-success");
        submitLabel.textContent = "Enviar mensagem";
      }, 4000);
    } catch {
      status.classList.add("is-error");
      status.textContent = "Não foi possível enviar. Verifique sua conexão ou use o email direto.";
    } finally {
      submitButton.classList.remove("is-loading");
      submitButton.disabled = false;
    }
  });
}

/* ---------- Foto ampliada ---------- */
const lightbox = $("#photoLightbox");
const lightboxOpener = $("[data-lightbox-open]");

const closeLightbox = () => {
  if (!lightbox?.open) return;
  lightbox.classList.remove("is-open");
  window.setTimeout(() => lightbox.close(), reducedMotion ? 0 : 300);
};

lightboxOpener?.addEventListener("click", () => {
  if (!lightbox) return;
  lightbox.showModal();
  window.requestAnimationFrame(() => lightbox.classList.add("is-open"));
});

$("[data-lightbox-close]")?.addEventListener("click", closeLightbox);
lightbox?.addEventListener("click", (event) => { if (event.target === lightbox) closeLightbox(); });
lightbox?.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeLightbox();
});
lightbox?.addEventListener("close", () => lightboxOpener?.focus());

/* ---------- Ajustes após o carregamento das fontes ---------- */
document.fonts?.ready.then(updateRailPositions);

/* ---------- Navegador interno do Instagram ---------- */
if (/Instagram/i.test(navigator.userAgent)) {
  $$('a[target="_blank"]').forEach((link) => {
    link.removeAttribute("target");
    link.removeAttribute("rel");
  });
}
