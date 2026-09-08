const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const themeIcon = themeToggle ? themeToggle.querySelector("i") : null;
const navBar = document.querySelector(".navbar");
const navMenu = document.getElementById("navMenu");
const mobileToggle = document.getElementById("mobileToggle");
const yearEl = document.getElementById("year");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

/* ---------- Tema (claro / escuro) ---------- */
function setTheme(theme) {
  body.setAttribute("data-theme", theme);
  if (themeIcon) {
    themeIcon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
  }
}

(function initTheme() {
  let saved = null;
  try {
    saved = localStorage.getItem("theme");
  } catch (error) {
    saved = null;
  }

  if (saved === "dark" || saved === "light") {
    setTheme(saved);
    return;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(prefersDark ? "dark" : "light");
})();

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = body.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch (error) {
      /* localStorage indisponível: ignora */
    }
  });
}

/* ---------- Menu mobile ---------- */
function closeMenu() {
  if (navMenu) {
    navMenu.classList.remove("open");
  }
  if (mobileToggle) {
    mobileToggle.setAttribute("aria-expanded", "false");
  }
}

if (mobileToggle && navMenu) {
  mobileToggle.addEventListener("click", () => {
    const willOpen = !navMenu.classList.contains("open");
    navMenu.classList.toggle("open", willOpen);
    mobileToggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
  });
}

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

/* ---------- Sombra da navbar ao fazer scroll ---------- */
window.addEventListener("scroll", () => {
  if (!navBar) {
    return;
  }
  navBar.classList.toggle("scrolled", window.scrollY > 16);
});

/* ---------- Revelação de secções ---------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
    rootMargin: "0px 0px -40px 0px"
  }
);

document.querySelectorAll("[data-reveal]").forEach((el) => revealObserver.observe(el));

/* ---------- Estado ativo da navegação (scroll spy) ---------- */
const navLinks = Array.from(document.querySelectorAll(".nav-link"));
const sections = navLinks
  .map((link) => {
    const id = link.getAttribute("href");
    return id && id.startsWith("#") ? document.querySelector(id) : null;
  })
  .filter(Boolean);

if (sections.length) {
  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        const id = "#" + entry.target.id;
        navLinks.forEach((link) => {
          const isActive = link.getAttribute("href") === id;
          link.classList.toggle("active", isActive);
          if (isActive) {
            link.setAttribute("aria-current", "true");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    },
    {
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0
    }
  );

  sections.forEach((section) => spyObserver.observe(section));

  // Garante "Início" ativo quando a página está no topo.
  window.addEventListener("scroll", () => {
    if (window.scrollY < 40) {
      navLinks.forEach((link, index) => {
        const isFirst = index === 0;
        link.classList.toggle("active", isFirst);
        if (isFirst) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }
  }, { passive: true });
}

/* ---------- Ver todos os projetos ---------- */
const toggleProjects = document.getElementById("toggleProjects");
const projectsExtra = document.getElementById("projectsExtra");

if (toggleProjects && projectsExtra) {
  const labelEl = toggleProjects.querySelector(".toggle-label");
  toggleProjects.addEventListener("click", () => {
    const isHidden = projectsExtra.hasAttribute("hidden");
    if (isHidden) {
      projectsExtra.removeAttribute("hidden");
    } else {
      projectsExtra.setAttribute("hidden", "");
    }
    toggleProjects.setAttribute("aria-expanded", isHidden ? "true" : "false");
    if (labelEl) {
      labelEl.textContent = isHidden ? "Ver menos projetos" : "Ver todos os projetos";
    }
  });
}

/* ---------- Ano no rodapé ---------- */
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

/* ---------- Formulário de contacto ---------- */
if (contactForm && formStatus) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const MIN_INTERVAL_MS = 20000;
  let lastSubmitAt = 0;

  const sanitize = (value) => value.replace(/[<>]/g, "");

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(contactForm);

    // Honeypot: campo invisível para humanos. Se vier preenchido, é um bot.
    const honeypot = String(data.get("company") || "").trim();
    if (honeypot) {
      formStatus.textContent = "Mensagem enviada com sucesso. Obrigado pelo contacto!";
      formStatus.className = "form-status success";
      contactForm.reset();
      return;
    }

    const now = Date.now();
    if (now - lastSubmitAt < MIN_INTERVAL_MS) {
      formStatus.textContent = "Aguarde alguns segundos antes de enviar novamente.";
      formStatus.className = "form-status error";
      return;
    }

    const name = sanitize(String(data.get("name") || "").trim()).slice(0, 100);
    const email = sanitize(String(data.get("email") || "").trim()).slice(0, 150);
    const subject = sanitize(String(data.get("subject") || "").trim()).slice(0, 150);
    const message = sanitize(String(data.get("message") || "").trim()).slice(0, 3000);

    if (!name || !email || !subject || !message) {
      formStatus.textContent = "Preencha todos os campos para enviar a mensagem.";
      formStatus.className = "form-status error";
      return;
    }

    if (!emailPattern.test(email)) {
      formStatus.textContent = "Introduza um email válido.";
      formStatus.className = "form-status error";
      return;
    }

    lastSubmitAt = now;

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton ? submitButton.innerHTML : "";
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> A enviar...';
    }

    formStatus.textContent = "A enviar mensagem...";
    formStatus.className = "form-status";

    const mailSubject = encodeURIComponent(`[Portfólio] ${subject}`);
    const mailBody = encodeURIComponent(
      `Nome: ${name}\nEmail: ${email}\n\nMensagem:\n${message}`
    );
    const mailtoFallback = () => {
      window.location.href =
        `mailto:andersonneto.dev.fullstack@gmail.com?subject=${mailSubject}&body=${mailBody}`;
    };

    try {
      if (!window.emailjs) {
        throw new Error("Serviço de email indisponível");
      }

      await emailjs.send("service_hsm58s7", "template_akdz2vc", {
        name,
        email,
        subject: `[Portfólio] ${subject}`,
        message
      });

      formStatus.textContent = "Mensagem enviada com sucesso. Obrigado pelo contacto!";
      formStatus.className = "form-status success";
      contactForm.reset();
    } catch (error) {
      formStatus.textContent =
        "Não foi possível enviar automaticamente. A abrir o seu email...";
      formStatus.className = "form-status error";
      mailtoFallback();
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
      }
    }
  });
}
