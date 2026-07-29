document.getElementById("year").textContent = new Date().getFullYear();

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const desktop3DTiltQuery = window.matchMedia(
  "(hover: hover) and (pointer: fine) and (min-width: 651px)"
);
const heroTitle = document.querySelector(".hero-title");
const heroSection = document.querySelector(".hero");
const heroTiltCard = document.querySelector("[data-tilt-card]");

if (heroTiltCard && !reducedMotionQuery.matches && desktop3DTiltQuery.matches) {
  let tiltFrame = null;

  const resetHeroTilt = () => {
    if (tiltFrame) {
      window.cancelAnimationFrame(tiltFrame);
    }

    heroTiltCard.style.setProperty("--tilt-x", "0deg");
    heroTiltCard.style.setProperty("--tilt-y", "0deg");
    heroTiltCard.style.setProperty("--tilt-scale", "1");
    heroTiltCard.style.setProperty("--tilt-shadow-x", "0px");
    heroTiltCard.style.setProperty("--tilt-shadow-y", "0px");
    heroTiltCard.style.setProperty("--tilt-shadow-solid", "rgba(61,63,61,0)");
    heroTiltCard.style.setProperty("--tilt-shadow-soft", "rgba(70,72,70,0)");
  };

  heroTiltCard.addEventListener("pointermove", (event) => {
    const bounds = heroTiltCard.getBoundingClientRect();
    const horizontalPosition = (event.clientX - bounds.left) / bounds.width - 0.5;
    const verticalPosition = (event.clientY - bounds.top) / bounds.height - 0.5;

    if (tiltFrame) {
      window.cancelAnimationFrame(tiltFrame);
    }

    tiltFrame = window.requestAnimationFrame(() => {
      heroTiltCard.style.setProperty("--tilt-x", `${verticalPosition * -7}deg`);
      heroTiltCard.style.setProperty("--tilt-y", `${horizontalPosition * 8}deg`);
      heroTiltCard.style.setProperty("--tilt-scale", "1.012");
      heroTiltCard.style.setProperty("--tilt-shadow-x", `${horizontalPosition * -22}px`);
      heroTiltCard.style.setProperty("--tilt-shadow-y", `${18 + verticalPosition * 8}px`);
      heroTiltCard.style.setProperty("--tilt-shadow-solid", "rgba(61,63,61,.48)");
      heroTiltCard.style.setProperty("--tilt-shadow-soft", "rgba(70,72,70,.22)");
    });
  });

  heroTiltCard.addEventListener("pointerleave", resetHeroTilt);
}

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

const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
const skillCards = Array.from(document.querySelectorAll(".skill-card"));
const projectGrid = document.querySelector(".projects-grid");
const projectCards = Array.from(document.querySelectorAll(".project-card"));
const skillPreviewStops = new Map();
const projectReadyTimers = new Map();
let activeProjectCard = null;
let projectPreviewToken = 0;
let mediaVisibilityToken = 0;

const resetVideo = (video) => {
  if (!video) {
    return;
  }

  video.pause();

  try {
    video.currentTime = 0;
  } catch {
    // The metadata may not be available yet; playback will still restart when loaded.
  }
};

const deactivateProjectPreview = (card = activeProjectCard) => {
  const isActiveTarget = !card || card === activeProjectCard;

  if (isActiveTarget) {
    projectPreviewToken += 1;
  }

  if (card) {
    card.classList.remove("is-active-preview");
    resetVideo(card.querySelector(".project-preview"));
  }

  if (isActiveTarget) {
    activeProjectCard = null;
    projectGrid?.classList.remove("has-active-preview");
  }
};

const activateProjectPreview = (card) => {
  if (!projectGrid || !card.classList.contains("load-complete")) {
    return;
  }

  if (activeProjectCard && activeProjectCard !== card) {
    deactivateProjectPreview(activeProjectCard);
  }

  activeProjectCard = card;
  const token = ++projectPreviewToken;
  const visibilityToken = mediaVisibilityToken;
  const video = card.querySelector(".project-preview");

  if (!video) {
    card.classList.add("is-active-preview");
    projectGrid.classList.add("has-active-preview");
    return;
  }

  resetVideo(video);
  const playRequest = video.play();

  const showPlayingProject = () => {
    if (
      token !== projectPreviewToken
      || visibilityToken !== mediaVisibilityToken
      || activeProjectCard !== card
    ) {
      resetVideo(video);
      return;
    }

    card.classList.add("is-active-preview");
    projectGrid.classList.add("has-active-preview");
  };

  if (playRequest instanceof Promise) {
    playRequest
      .then(showPlayingProject)
      .catch(() => {
        if (token === projectPreviewToken && activeProjectCard === card) {
          deactivateProjectPreview(card);
        }
      });
  } else {
    showPlayingProject();
  }
};

const wantsProjectPreview = (card) => (
  card.matches(":hover")
  || card.contains(document.activeElement)
);

const requestProjectPreview = (card) => {
  if (card.classList.contains("load-complete")) {
    activateProjectPreview(card);
    return;
  }

  if (projectReadyTimers.has(card)) {
    return;
  }

  const waitForCard = () => {
    projectReadyTimers.delete(card);

    if (!wantsProjectPreview(card)) {
      return;
    }

    if (card.classList.contains("load-complete")) {
      activateProjectPreview(card);
      return;
    }

    projectReadyTimers.set(card, window.setTimeout(waitForCard, 120));
  };

  projectReadyTimers.set(card, window.setTimeout(waitForCard, 120));
};

if (!reducedMotionQuery.matches && finePointerQuery.matches) {
  skillCards.forEach((card) => {
    const video = card.querySelector(".skill-preview");
    let previewToken = 0;
    let readyTimer = null;
    let wantsPreview = false;

    if (!video) {
      return;
    }

    const stopSkillPreview = () => {
      wantsPreview = false;
      previewToken += 1;
      window.clearTimeout(readyTimer);
      readyTimer = null;
      card.classList.remove("is-previewing");
      resetVideo(video);
    };

    const startSkillPreview = () => {
      wantsPreview = true;

      if (!card.classList.contains("load-complete")) {
        if (!readyTimer) {
          readyTimer = window.setTimeout(() => {
            readyTimer = null;

            if (wantsPreview && card.matches(":hover")) {
              startSkillPreview();
            }
          }, 120);
        }

        return;
      }

      const token = ++previewToken;
      const visibilityToken = mediaVisibilityToken;
      resetVideo(video);
      const playRequest = video.play();

      if (playRequest instanceof Promise) {
        playRequest
          .then(() => {
            if (
              wantsPreview
              && token === previewToken
              && visibilityToken === mediaVisibilityToken
            ) {
              card.classList.add("is-previewing");
            } else {
              resetVideo(video);
            }
          })
          .catch(() => {
            card.classList.remove("is-previewing");
          });
      } else {
        card.classList.add("is-previewing");
      }
    };

    skillPreviewStops.set(card, stopSkillPreview);
    card.addEventListener("pointerenter", startSkillPreview);
    card.addEventListener("pointerleave", stopSkillPreview);
  });

  projectCards.forEach((card) => {
    card.addEventListener("pointerenter", () => requestProjectPreview(card));
    card.addEventListener("pointerleave", () => {
      if (!card.contains(document.activeElement)) {
        deactivateProjectPreview(card);
      }
    });
  });
}

if (!reducedMotionQuery.matches) {
  projectCards.forEach((card) => {
    card.addEventListener("focusin", () => requestProjectPreview(card));
    card.addEventListener("focusout", (event) => {
      if (!card.contains(event.relatedTarget) && !card.matches(":hover")) {
        deactivateProjectPreview(card);
      }
    });
  });

  if ("IntersectionObserver" in window) {
    const mediaVisibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          return;
        }

        skillPreviewStops.get(entry.target)?.();

        if (activeProjectCard === entry.target) {
          deactivateProjectPreview(entry.target);
        }
      });
    }, { threshold: .05 });

    [...skillCards, ...projectCards].forEach((card) => {
      mediaVisibilityObserver.observe(card);
    });
  }
}

const aboutTiltSurface = document.querySelector("[data-about-tilt]");

if (aboutTiltSurface && !reducedMotionQuery.matches && desktop3DTiltQuery.matches) {
  let aboutTiltFrame = null;

  const resetAboutTilt = () => {
    if (aboutTiltFrame) {
      window.cancelAnimationFrame(aboutTiltFrame);
      aboutTiltFrame = null;
    }

    aboutTiltSurface.classList.remove("is-tilting");
    aboutTiltSurface.style.setProperty("--about-tilt-x", "0deg");
    aboutTiltSurface.style.setProperty("--about-tilt-y", "0deg");
    aboutTiltSurface.style.setProperty("--about-tilt-scale", "1");
    aboutTiltSurface.style.setProperty("--about-shadow-x", "0px");
    aboutTiltSurface.style.setProperty("--about-shadow-y", "0px");
    aboutTiltSurface.style.setProperty("--about-shadow-solid", "rgba(61,63,61,0)");
    aboutTiltSurface.style.setProperty("--about-shadow-soft", "rgba(70,72,70,0)");
  };

  aboutTiltSurface.addEventListener("pointerenter", () => {
    aboutTiltSurface.classList.add("is-tilting");
  });

  aboutTiltSurface.addEventListener("pointermove", (event) => {
    aboutTiltSurface.classList.add("is-tilting");
    const bounds = aboutTiltSurface.getBoundingClientRect();
    const horizontalPosition = (event.clientX - bounds.left) / bounds.width - .5;
    const verticalPosition = (event.clientY - bounds.top) / bounds.height - .5;

    if (aboutTiltFrame) {
      window.cancelAnimationFrame(aboutTiltFrame);
    }

    aboutTiltFrame = window.requestAnimationFrame(() => {
      aboutTiltFrame = null;
      aboutTiltSurface.style.setProperty("--about-tilt-x", `${verticalPosition * -5}deg`);
      aboutTiltSurface.style.setProperty("--about-tilt-y", `${horizontalPosition * 6}deg`);
      aboutTiltSurface.style.setProperty("--about-tilt-scale", "1.008");
      aboutTiltSurface.style.setProperty("--about-shadow-x", `${horizontalPosition * -20}px`);
      aboutTiltSurface.style.setProperty("--about-shadow-y", `${17 + verticalPosition * 7}px`);
      aboutTiltSurface.style.setProperty("--about-shadow-solid", "rgba(61,63,61,.44)");
      aboutTiltSurface.style.setProperty("--about-shadow-soft", "rgba(70,72,70,.2)");
    });
  });

  aboutTiltSurface.addEventListener("pointerleave", resetAboutTilt);
  aboutTiltSurface.addEventListener("pointercancel", resetAboutTilt);
  window.addEventListener("blur", resetAboutTilt);
}

const aboutCard = document.querySelector(".about-card");
const codeTerminal = document.querySelector("[data-code-terminal]");
const aboutCodeSamples = [
  `@RestController
@RequestMapping("/api/projects")
class ProjectController {
  @GetMapping
  List<Project> list() {
    return service.findAll();
  }
}`,
  `@Service
class PortfolioService {
  Project publish(Project input) {
    validate(input);
    return repository.save(input);
  }
}`,
  `SELECT title, stack, status
FROM projects
WHERE featured = true
ORDER BY updated_at DESC;`,
  `fetch("/api/contact", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(message)
});`
];

if (aboutCard && codeTerminal) {
  if (reducedMotionQuery.matches) {
    codeTerminal.textContent = aboutCodeSamples[0];
  } else {
    let sampleIndex = 0;
    let characterIndex = 0;
    let typingDirection = 1;
    let phase = "typing";
    let typingTimer = null;
    let isAboutVisible = false;
    let isAboutReady = aboutCard.classList.contains("load-complete");

    const canTypeCode = () => (
      isAboutVisible
      && isAboutReady
      && !document.hidden
    );

    const scheduleCodeTick = (delay) => {
      window.clearTimeout(typingTimer);
      typingTimer = window.setTimeout(typeCodeTick, delay);
    };

    const typeCodeTick = () => {
      typingTimer = null;

      if (!canTypeCode()) {
        return;
      }

      const sample = aboutCodeSamples[sampleIndex];

      if (phase === "typing") {
        characterIndex = Math.min(characterIndex + typingDirection, sample.length);
        codeTerminal.textContent = sample.slice(0, characterIndex);

        if (characterIndex >= sample.length) {
          phase = "holding";
          scheduleCodeTick(1100);
        } else {
          const character = sample[characterIndex - 1];
          scheduleCodeTick(character === "\n" ? 70 : /[{},;]/.test(character) ? 42 : 20);
        }
      } else if (phase === "holding") {
        phase = "erasing";
        scheduleCodeTick(20);
      } else {
        characterIndex = Math.max(characterIndex - 3, 0);
        codeTerminal.textContent = sample.slice(0, characterIndex);

        if (characterIndex === 0) {
          sampleIndex = (sampleIndex + 1) % aboutCodeSamples.length;
          phase = "typing";
          scheduleCodeTick(320);
        } else {
          scheduleCodeTick(10);
        }
      }
    };

    const syncCodeTyping = () => {
      if (canTypeCode() && !typingTimer) {
        scheduleCodeTick(120);
      } else if (!canTypeCode()) {
        window.clearTimeout(typingTimer);
        typingTimer = null;
      }
    };

    if ("IntersectionObserver" in window) {
      const codeVisibilityObserver = new IntersectionObserver((entries) => {
        isAboutVisible = entries[0]?.isIntersecting ?? false;
        syncCodeTyping();
      }, { threshold: .18 });

      codeVisibilityObserver.observe(aboutCard);
    } else {
      isAboutVisible = true;
    }

    if (!isAboutReady && "MutationObserver" in window) {
      const cardReadyObserver = new MutationObserver(() => {
        if (aboutCard.classList.contains("load-complete")) {
          isAboutReady = true;
          cardReadyObserver.disconnect();
          syncCodeTyping();
        }
      });

      cardReadyObserver.observe(aboutCard, { attributes: true, attributeFilter: ["class"] });
    } else if (!isAboutReady) {
      const cardReadyPoll = window.setInterval(() => {
        if (aboutCard.classList.contains("load-complete")) {
          isAboutReady = true;
          window.clearInterval(cardReadyPoll);
          syncCodeTyping();
        }
      }, 160);
    }

    syncCodeTyping();
    document.addEventListener("visibilitychange", syncCodeTyping);
  }
}

const contactLinks = Array.from(document.querySelectorAll("[data-contact-message]"));
const CONTACT_PREVIEW_TYPING_DURATION = 900;
const CONTACT_PREVIEW_HOLD_DURATION = 2200;

if (!reducedMotionQuery.matches) {
  contactLinks.forEach((link) => {
    const previewText = link.querySelector("[data-contact-preview-text]");
    const message = link.dataset.contactMessage || "";
    let animationFrame = null;
    let holdTimer = null;
    let clearTimer = null;
    let previewLocked = false;

    if (!previewText || !message) {
      return;
    }

    const stopContactPreview = ({ unlock = false, clearImmediately = false } = {}) => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(holdTimer);
      window.clearTimeout(clearTimer);
      animationFrame = null;
      holdTimer = null;
      link.classList.remove("is-previewing");

      if (clearImmediately) {
        previewText.textContent = "";
      } else {
        clearTimer = window.setTimeout(() => {
          previewText.textContent = "";
          clearTimer = null;
        }, 260);
      }

      if (unlock) {
        previewLocked = false;
      }
    };

    const startContactPreview = () => {
      if (previewLocked) {
        return;
      }

      previewLocked = true;
      window.clearTimeout(clearTimer);
      previewText.textContent = "";
      link.classList.add("is-previewing");
      const startedAt = performance.now();

      const animateMessage = (timestamp) => {
        const progress = Math.min(
          (timestamp - startedAt) / CONTACT_PREVIEW_TYPING_DURATION,
          1
        );
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const visibleCharacters = Math.max(1, Math.round(message.length * easedProgress));
        previewText.textContent = message.slice(0, visibleCharacters);

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(animateMessage);
        } else {
          animationFrame = null;
          holdTimer = window.setTimeout(() => {
            stopContactPreview();
          }, CONTACT_PREVIEW_HOLD_DURATION);
        }
      };

      animationFrame = window.requestAnimationFrame(animateMessage);
    };

    if (finePointerQuery.matches) {
      link.addEventListener("pointerenter", startContactPreview);
      link.addEventListener("pointerleave", () => {
        stopContactPreview({ unlock: true, clearImmediately: true });
      });
    }

    link.addEventListener("focus", startContactPreview);
    link.addEventListener("blur", () => {
      stopContactPreview({ unlock: true, clearImmediately: true });
    });
  });
}

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    return;
  }

  mediaVisibilityToken += 1;
  skillPreviewStops.forEach((stopPreview) => stopPreview());
  projectReadyTimers.forEach((timer) => {
    window.clearTimeout(timer);
  });
  projectReadyTimers.clear();

  deactivateProjectPreview();
  projectCards.forEach((card) => {
    resetVideo(card.querySelector(".project-preview"));
  });
});

const navList = document.querySelector(".nav-links");
const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
const mobileMenuLinks = Array.from(document.querySelectorAll('.mobile-menu-links a[href^="#"]'));
const navSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

let activeNavFrame = null;

const updateNavIndicator = (activeLink) => {
  const canShowIndicator = activeLink
    && !activeLink.classList.contains("nav-cta")
    && activeLink.offsetParent !== null;

  if (!navList || !canShowIndicator) {
    navList?.classList.remove("has-active-indicator");
    return;
  }

  const navListRect = navList.getBoundingClientRect();
  const activeLinkRect = activeLink.getBoundingClientRect();
  const indicatorX = activeLinkRect.left - navListRect.left;

  navList.style.setProperty("--active-indicator-x", `${indicatorX}px`);
  navList.style.setProperty("--active-indicator-width", `${activeLinkRect.width}px`);
  navList.classList.add("has-active-indicator");
};

const updateActiveNav = () => {
  const marker = window.scrollY + window.innerHeight * 0.34;
  const atPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
  let activeSectionId = null;
  let activeDesktopLink = null;

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
      if (navLinks.includes(link)) {
        activeDesktopLink = link;
      }
    } else {
      link.removeAttribute("aria-current");
    }
  });

  updateNavIndicator(activeDesktopLink);
  activeNavFrame = null;
};

window.addEventListener("scroll", () => {
  if (!activeNavFrame) {
    activeNavFrame = window.requestAnimationFrame(updateActiveNav);
  }
}, { passive: true });

window.addEventListener("resize", updateActiveNav);
updateActiveNav();
window.requestAnimationFrame(() => navList?.classList.add("indicator-ready"));

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
