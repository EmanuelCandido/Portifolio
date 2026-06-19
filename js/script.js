if (window.location.search) {
  window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
}

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
  const destinationEmail = "emanoelcandidolima@gmail.com";
  const subjectText = "Contato pelo portfólio";
  const bodyText = `Nome: ${name}\nEmail: ${email}\n\nMensagem:\n${message}`;

  const subject = encodeURIComponent(subjectText);
  const body = encodeURIComponent(bodyText);
  const mailtoUrl = `mailto:${destinationEmail}?subject=${subject}&body=${body}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${destinationEmail}&su=${subject}&body=${body}`;
  const isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);

  if (isMobile) {
    window.location.href = mailtoUrl;
    return;
  }

  const emailWindow = window.open(gmailUrl, "_blank", "noopener,noreferrer");

  if (!emailWindow) {
    window.location.href = mailtoUrl;
  }
});
