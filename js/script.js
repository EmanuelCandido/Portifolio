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
