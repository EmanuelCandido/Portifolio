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
  document.documentElement.classList.add("theme-switching");
  document.documentElement.dataset.theme = theme;
  void document.body.offsetHeight;
  window.setTimeout(() => {
    document.documentElement.classList.remove("theme-switching");
  }, 80);

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

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));

    if (target) {
      event.preventDefault();
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });
});

document.getElementById("contactForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();
  const whatsappNumber = "558999928573";
  const whatsappText = encodeURIComponent(
    `Olá, Emanuel! Vim pelo seu portfólio.\n\nNome: ${name}\nEmail: ${email}\n\nMensagem:\n${message}`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappText}`;
  const whatsappWindow = window.open(whatsappUrl, "_blank", "noopener,noreferrer");

  if (!whatsappWindow) {
    window.location.href = whatsappUrl;
  }
});
