document.getElementById("year").textContent = new Date().getFullYear();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12
});

document.querySelectorAll(".reveal").forEach((element) => {
  observer.observe(element);
});

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

window.matchMedia("(min-width: 721px)").addEventListener("change", (event) => {
  if (event.matches && document.body.classList.contains("menu-open")) {
    setMobileMenu(false, false);
  }
});

const themeToggle = document.querySelector(".theme-toggle");
const themeQuery = window.matchMedia("(prefers-color-scheme: light)");
const getStoredTheme = () => {
  try {
    return localStorage.getItem("portfolio-theme");
  } catch {
    return null;
  }
};

const storeTheme = (theme) => {
  try {
    localStorage.setItem("portfolio-theme", theme);
  } catch {
    // Theme still changes for the current visit when storage is unavailable.
  }
};

const setTheme = (theme, shouldStore = false) => {
  const themeChanged = document.documentElement.dataset.theme !== theme;

  if (themeChanged) {
    document.documentElement.classList.add("theme-switching");
    document.documentElement.dataset.theme = theme;

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.documentElement.classList.remove("theme-switching");
      });
    });
  }

  if (themeToggle) {
    const nextTheme = theme === "light" ? "dark" : "light";
    const label = `Ativar tema ${nextTheme === "light" ? "claro" : "escuro"}`;
    themeToggle.setAttribute("aria-label", label);
    themeToggle.setAttribute("title", label);
    themeToggle.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
  }

  if (shouldStore) {
    storeTheme(theme);
  }
};

setTheme(document.documentElement.dataset.theme || (themeQuery.matches ? "light" : "dark"));

themeToggle?.addEventListener("click", () => {
  const currentTheme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
  setTheme(currentTheme === "light" ? "dark" : "light", true);
});

themeQuery.addEventListener("change", (event) => {
  if (!getStoredTheme()) {
    setTheme(event.matches ? "light" : "dark");
  }
});

const isInstagramBrowser = /Instagram/i.test(navigator.userAgent);

if (isInstagramBrowser) {
  document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    link.removeAttribute("target");
    link.removeAttribute("rel");
  });
}

document.getElementById("contactForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const submitButton = document.getElementById("contactSubmit");
  const formStatus = document.getElementById("formStatus");
  const formData = new FormData(form);
  const originalButtonText = submitButton.textContent;

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
  } catch (error) {
    formStatus.classList.add("error");
    formStatus.textContent = "Não foi possível enviar. Verifique sua conexão e tente novamente.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
});
