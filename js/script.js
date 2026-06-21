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
