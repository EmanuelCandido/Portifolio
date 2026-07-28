document.getElementById("year").textContent = new Date().getFullYear();

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const heroTitle = document.querySelector(".hero-title");
const heroSection = document.querySelector(".hero");

const startHeroTyping = () => {
  if (!heroTitle || reducedMotionQuery.matches) {
    return;
  }

  const accessibleTitle = heroTitle.textContent.replace(/\s+/g, " ").trim();
  const textWalker = document.createTreeWalker(heroTitle, NodeFilter.SHOW_TEXT);
  const textNodes = [];

  while (textWalker.nextNode()) {
    textNodes.push(textWalker.currentNode);
  }

  heroTitle.setAttribute("aria-label", accessibleTitle);
  heroTitle.classList.add("is-typing");

  textNodes.forEach((textNode) => {
    const fragment = document.createDocumentFragment();

    Array.from(textNode.textContent).forEach((character) => {
      const characterElement = document.createElement("span");
      characterElement.className = "typing-char";
      characterElement.setAttribute("aria-hidden", "true");
      characterElement.textContent = character;
      fragment.appendChild(characterElement);
    });

    textNode.replaceWith(fragment);
  });

  const characters = Array.from(heroTitle.querySelectorAll(".typing-char"));
  const caret = document.createElement("span");
  caret.className = "typing-caret";
  caret.setAttribute("aria-hidden", "true");
  caret.textContent = "|";

  if (!characters.length) {
    return;
  }

  characters[0].before(caret);

  let characterIndex = 0;

  const typeNextCharacter = () => {
    const character = characters[characterIndex];

    character.classList.add("is-typed");
    character.after(caret);
    characterIndex += 1;

    if (characterIndex < characters.length) {
      const typedCharacter = character.textContent;
      const pause = /[.,]/.test(typedCharacter) ? 120 : typedCharacter === " " ? 22 : 36;
      window.setTimeout(typeNextCharacter, pause);
    } else {
      heroTitle.classList.add("typing-complete");
      heroSection?.classList.add("typing-finished");
      window.setTimeout(() => caret.remove(), 360);
    }
  };

  window.setTimeout(typeNextCharacter, 420);
};

startHeroTyping();

const cardRevealSelector = [
  ".skill-card",
  ".project-card",
  ".about-card",
  ".contact-card",
  ".form-card"
].join(",");

const CARD_LOAD_DURATION = 1550;
const CARD_LOAD_COMPLETE_DELAY = 140;
const CARD_LOADER_REMOVAL_DELAY = 500;

const createCardLoader = (element) => {
  const loader = document.createElement("div");
  const percentage = document.createElement("span");
  const track = document.createElement("span");
  const fill = document.createElement("span");

  loader.className = "card-upload-loader";
  loader.setAttribute("aria-hidden", "true");
  percentage.className = "card-upload-percentage";
  percentage.textContent = "0%";
  track.className = "card-upload-track";
  fill.className = "card-upload-fill";

  track.appendChild(fill);
  loader.append(percentage, track);
  element.appendChild(loader);
};

const getRevealDelay = (element) => {
  const cssDelay = getComputedStyle(element).getPropertyValue("--reveal-delay").trim();
  const delayValue = Number.parseFloat(cssDelay) || 0;
  return cssDelay.endsWith("ms") ? delayValue : delayValue * 1000;
};

const startCardLoading = (element) => {
  if (element.dataset.loadingStarted === "true") {
    return;
  }

  element.dataset.loadingStarted = "true";
  element.classList.add("visible");

  const percentage = element.querySelector(".card-upload-percentage");

  if (reducedMotionQuery.matches || !percentage) {
    element.style.setProperty("--upload-progress", "1");
    element.classList.add("load-complete");
    element.querySelector(".card-upload-loader")?.remove();
    return;
  }

  const delay = getRevealDelay(element);

  window.setTimeout(() => {
    const startedAt = performance.now();

    const updateProgress = (timestamp) => {
      const elapsed = Math.min((timestamp - startedAt) / CARD_LOAD_DURATION, 1);
      const progress = elapsed < .5
        ? 2 * elapsed * elapsed
        : 1 - Math.pow(-2 * elapsed + 2, 2) / 2;

      element.style.setProperty("--upload-progress", progress.toFixed(4));
      percentage.textContent = `${Math.round(progress * 100)}%`;

      if (elapsed < 1) {
        window.requestAnimationFrame(updateProgress);
      } else {
        percentage.textContent = "100%";
        window.setTimeout(() => {
          element.classList.add("load-complete");
          window.setTimeout(
            () => element.querySelector(".card-upload-loader")?.remove(),
            CARD_LOADER_REMOVAL_DELAY
          );
        }, CARD_LOAD_COMPLETE_DELAY);
      }
    };

    window.requestAnimationFrame(updateProgress);
  }, delay);
};

const prepareTypingReveal = (element) => {
  if (element.dataset.typingPrepared === "true") {
    return Array.from(element.querySelectorAll(".section-typing-char"));
  }

  const textTargets = element.matches(".about-text")
    ? element.querySelectorAll(".section-label, .section-title, p")
    : element.querySelectorAll(".section-label, .section-title, .section-desc");

  const characters = [];

  textTargets.forEach((target) => {
    const text = target.textContent.replace(/\s+/g, " ").trim();

    if (!text) {
      return;
    }

    target.setAttribute("aria-label", text);
    target.textContent = "";

    const typingLine = document.createElement("span");

    Array.from(text).forEach((character) => {
      const characterElement = document.createElement("span");
      characterElement.className = "section-typing-char";
      characterElement.setAttribute("aria-hidden", "true");
      characterElement.textContent = character;
      typingLine.appendChild(characterElement);
      characters.push(characterElement);
    });

    target.appendChild(typingLine);
  });

  element.dataset.typingPrepared = "true";
  return characters;
};

const startTypingReveal = (element) => {
  if (element.dataset.typingStarted === "true") {
    return;
  }

  element.dataset.typingStarted = "true";

  if (reducedMotionQuery.matches) {
    return;
  }

  const characters = prepareTypingReveal(element);

  if (!characters.length) {
    return;
  }

  const caret = document.createElement("span");
  caret.className = "typing-caret section-typing-caret";
  caret.setAttribute("aria-hidden", "true");
  caret.textContent = "|";
  characters[0].before(caret);

  const batchSize = Math.max(1, Math.ceil(characters.length / 170));
  let characterIndex = 0;

  const typeCharacterBatch = () => {
    const batchEnd = Math.min(characterIndex + batchSize, characters.length);

    while (characterIndex < batchEnd) {
      characters[characterIndex].classList.add("is-typed");
      characterIndex += 1;
    }

    characters[characterIndex - 1].after(caret);

    if (characterIndex < characters.length) {
      window.setTimeout(typeCharacterBatch, 14);
    } else {
      element.classList.add("typing-finished");
      window.setTimeout(() => caret.remove(), 320);
    }
  };

  window.setTimeout(typeCharacterBatch, 90);
};

const revealElements = Array.from(document.querySelectorAll(".reveal"));

revealElements.forEach((element) => {
  if (element.matches(cardRevealSelector)) {
    element.classList.add("reveal-card");
    createCardLoader(element);
  } else {
    element.classList.add("reveal-text");

    if (!reducedMotionQuery.matches) {
      prepareTypingReveal(element);
    }
  }
});

const showRevealElement = (element) => {
  if (element.classList.contains("reveal-text")) {
    startTypingReveal(element);
  } else {
    startCardLoading(element);
  }
};

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        showRevealElement(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.01,
    rootMargin: "0px 0px -4% 0px"
  });

  revealElements.forEach((element) => {
    observer.observe(element);
  });

  window.setTimeout(() => {
    revealElements.forEach((element) => {
      const bounds = element.getBoundingClientRect();
      const isInsideViewport = bounds.top < window.innerHeight && bounds.bottom > 0;

      if (isInsideViewport) {
        showRevealElement(element);
        observer.unobserve(element);
      }
    });
  }, 600);
} else {
  revealElements.forEach((element) => {
    showRevealElement(element);
  });
}

const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
const mobileMenuLinks = Array.from(document.querySelectorAll('.mobile-menu-links a[href^="#"]'));
const navSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

let activeNavFrame = null;

const updateActiveNav = () => {
  const marker = window.scrollY + window.innerHeight * 0.34;
  const atPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
  let activeSectionId = null;

  navSections.forEach((section) => {
    if (section.offsetTop <= marker) {
      activeSectionId = section.id;
    }
  });

  if (atPageEnd && navSections.length) {
    activeSectionId = navSections.at(-1).id;
  }

  [...navLinks, ...mobileMenuLinks].forEach((link) => {
    const isActive = link.getAttribute("href") === `#${activeSectionId}`;
    link.classList.toggle("active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  activeNavFrame = null;
};

window.addEventListener("scroll", () => {
  if (!activeNavFrame) {
    activeNavFrame = window.requestAnimationFrame(updateActiveNav);
  }
}, { passive: true });

window.addEventListener("resize", updateActiveNav);
updateActiveNav();

const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.getElementById("mobileMenu");
const mobileMenuClose = document.querySelector(".mobile-menu-close");
let menuLastFocused = null;

const setMobileMenu = (isOpen, restoreFocus = true) => {
  if (!menuToggle || !mobileMenu) {
    return;
  }

  if (isOpen) {
    menuLastFocused = document.activeElement;
  }

  document.body.classList.toggle("menu-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  mobileMenu.setAttribute("aria-hidden", String(!isOpen));
  mobileMenu.inert = !isOpen;

  if (isOpen) {
    window.setTimeout(() => mobileMenuClose?.focus(), 0);
  } else if (restoreFocus && menuLastFocused instanceof HTMLElement) {
    menuLastFocused.focus();
  }
};

menuToggle?.addEventListener("click", () => {
  setMobileMenu(!document.body.classList.contains("menu-open"));
});

document.querySelectorAll("[data-menu-close]").forEach((control) => {
  control.addEventListener("click", () => setMobileMenu(false));
});

mobileMenuLinks.forEach((link) => {
  link.addEventListener("click", () => setMobileMenu(false, false));
});

document.addEventListener("keydown", (event) => {
  if (!document.body.classList.contains("menu-open")) {
    return;
  }

  if (event.key === "Escape") {
    setMobileMenu(false);
    return;
  }

  if (event.key === "Tab" && mobileMenu) {
    const focusable = Array.from(mobileMenu.querySelectorAll("a, button:not([disabled])"));
    const first = focusable[0];
    const last = focusable.at(-1);

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
});

window.matchMedia("(min-width: 651px)").addEventListener("change", (event) => {
  if (event.matches && document.body.classList.contains("menu-open")) {
    setMobileMenu(false, false);
  }
});

const isInstagramBrowser = /Instagram/i.test(navigator.userAgent);

if (isInstagramBrowser) {
  document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    link.removeAttribute("target");
    link.removeAttribute("rel");
  });
}

const profilePhotoLink = document.querySelector("[data-profile-photo]");
const profilePhotoLightbox = document.getElementById("profilePhotoLightbox");
const profilePhotoClose = profilePhotoLightbox?.querySelector(".photo-lightbox-close");

const setProfilePhotoOpen = (isOpen) => {
  if (!profilePhotoLink || !profilePhotoLightbox) {
    return;
  }

  document.body.classList.toggle("photo-view-open", isOpen);
  profilePhotoLightbox.setAttribute("aria-hidden", String(!isOpen));
  profilePhotoLightbox.inert = !isOpen;

  if (isOpen) {
    profilePhotoClose?.focus();
  } else {
    profilePhotoLink.focus();
  }
};

profilePhotoLink?.addEventListener("click", (event) => {
  event.preventDefault();
  setProfilePhotoOpen(true);
});

profilePhotoClose?.addEventListener("click", () => {
  setProfilePhotoOpen(false);
});

profilePhotoLightbox?.addEventListener("click", (event) => {
  if (event.target === profilePhotoLightbox) {
    setProfilePhotoOpen(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (!document.body.classList.contains("photo-view-open")) {
    return;
  }

  if (event.key === "Escape") {
    setProfilePhotoOpen(false);
  } else if (event.key === "Tab") {
    event.preventDefault();
    profilePhotoClose?.focus();
  }
});

document.getElementById("contactForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const submitButton = document.getElementById("contactSubmit");
  const formStatus = document.getElementById("formStatus");
  const formData = new FormData(form);
  const originalButtonContent = submitButton.innerHTML;

  submitButton.disabled = true;
  submitButton.textContent = "Enviando...";
  formStatus.className = "form-status";
  formStatus.textContent = "";

  try {
    const response = await fetch(
      "https://formsubmit.co/ajax/emanoelcandidolima@gmail.com",
      {
        method: "POST",
        headers: {
          Accept: "application/json"
        },
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error("Não foi possível enviar a mensagem.");
    }

    form.reset();
    formStatus.classList.add("success");
    formStatus.textContent = "Mensagem enviada com sucesso!";
  } catch {
    formStatus.classList.add("error");
    formStatus.textContent = "Não foi possível enviar. Verifique sua conexão e tente novamente.";
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonContent;
  }
});
