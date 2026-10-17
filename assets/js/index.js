const root = document.documentElement;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

const EMAIL = "andersonneto.dev.fullstack@gmail.com";
const EMAILJS_PUBLIC_KEY = "36yDEOHFF-0JgD1D_";
const EMAILJS_SERVICE = "service_hsm58s7";
const EMAILJS_TEMPLATE = "template_akdz2vc";

const $ = (selector, scope = document) => scope.querySelector(selector);

/* ---------- Textos por língua (a página define <html lang>) ---------- */
const LANG = (root.getAttribute("lang") || "pt").toLowerCase().startsWith("en") ? "en" : "pt";
const I18N = {
  pt: {
    themeToLight: "Mudar para tema claro",
    themeToDark: "Mudar para tema escuro",
    menuOpen: "Abrir menu",
    menuClose: "Fechar menu",
    showMore: "Ver mais projetos",
    showLess: "Ver menos",
    visibleOne: "projeto visível.",
    visibleMany: "projetos visíveis.",
    shotAlt: "Captura de ecrã do projeto",
    copied: "Copiado",
    copy: "Copiar",
    copiedToast: "Copiado para a área de transferência",
    emailCopied: "Email copiado",
    groups: { nav: "Navegar", projects: "Projetos", actions: "Ações", links: "Links" },
    nav: { sobre: "Sobre", experiencia: "Experiência", projetos: "Projetos", competencias: "Competências", engenharia: "Engenharia", formacao: "Formação", contacto: "Contacto" },
    copyEmail: "Copiar email",
    downloadCv: "Descarregar CV",
    toggleTheme: "Mudar tema",
    switchLang: "Ver em inglês (English)",
    cvHref: "assets/docs/CV-Anderson-Neto-PT.pdf",
    cvName: "CV-Anderson-Neto.pdf",
    otherLangHref: "en.html",
    sent: "Mensagem enviada com sucesso. Obrigado pelo contacto!",
    wait: "Aguarde alguns segundos antes de enviar novamente.",
    invalidEmail: "Introduza um email válido.",
    fillAll: "Preencha todos os campos para enviar a mensagem.",
    sending: "A enviar…",
    sendingStatus: "A enviar mensagem…",
    sentToast: "Mensagem enviada",
    fallback: "Não foi possível enviar automaticamente. A abrir o seu email…",
    submit: "Enviar mensagem",
    mailPrefix: "[Portfólio]",
    mailBody: (name, email, message) => `Nome: ${name}\nEmail: ${email}\n\nMensagem:\n${message}`
  },
  en: {
    themeToLight: "Switch to light theme",
    themeToDark: "Switch to dark theme",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    showMore: "Show more projects",
    showLess: "Show less",
    visibleOne: "project shown.",
    visibleMany: "projects shown.",
    shotAlt: "Screenshot of the project",
    copied: "Copied",
    copy: "Copy",
    copiedToast: "Copied to clipboard",
    emailCopied: "Email copied",
    groups: { nav: "Navigate", projects: "Projects", actions: "Actions", links: "Links" },
    nav: { sobre: "About", experiencia: "Experience", projetos: "Projects", competencias: "Skills", engenharia: "Engineering", formacao: "Education", contacto: "Contact" },
    copyEmail: "Copy email",
    downloadCv: "Download CV",
    toggleTheme: "Toggle theme",
    switchLang: "Ver em português (Portuguese)",
    cvHref: "assets/docs/CV-Anderson-Neto-EN.pdf",
    cvName: "CV-Anderson-Neto-EN.pdf",
    otherLangHref: "index.html",
    sent: "Message sent. Thank you for getting in touch!",
    wait: "Please wait a few seconds before sending again.",
    invalidEmail: "Please enter a valid email.",
    fillAll: "Please fill in all fields to send your message.",
    sending: "Sending…",
    sendingStatus: "Sending message…",
    sentToast: "Message sent",
    fallback: "Could not send automatically. Opening your email app…",
    submit: "Send message",
    mailPrefix: "[Portfolio]",
    mailBody: (name, email, message) => `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
  }
};
const t = I18N[LANG];
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

/* ---------- Toast ---------- */
const toastEl = $("#toast");
let toastTimer = 0;

function showToast(message) {
  if (!toastEl) {
    return;
  }
  toastEl.textContent = message;
  toastEl.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2200);
}

/* ---------- Tema (claro / escuro) ---------- */
const themeToggle = $("#themeToggle");

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  if (themeToggle) {
    themeToggle.setAttribute(
      "aria-label",
      theme === "dark" ? t.themeToLight : t.themeToDark
    );
  }
  try {
    localStorage.setItem("theme", theme);
  } catch (error) {
    /* localStorage indisponível: ignora */
  }
}

function toggleTheme(origin) {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";

  if (!document.startViewTransition || prefersReducedMotion.matches) {
    applyTheme(next);
    return;
  }

  // Revela o novo tema num círculo que cresce a partir do botão.
  const rect = origin ? origin.getBoundingClientRect() : null;
  const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const y = rect ? rect.top + rect.height / 2 : 0;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  const transition = document.startViewTransition(() => applyTheme(next));
  transition.ready.then(() => {
    root.animate(
      { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 550, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" }
    );
  });
}

if (themeToggle) {
  applyTheme(root.getAttribute("data-theme") || "dark");
  themeToggle.addEventListener("click", () => toggleTheme(themeToggle));
}

/* ---------- Navbar, progresso e menu mobile ---------- */
const navBar = $(".navbar");
const navMenu = $("#navMenu");
const mobileToggle = $("#mobileToggle");
const progressBar = $(".scroll-progress");

let scrollTicking = false;

function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? window.scrollY / max : 0;
  if (progressBar) {
    progressBar.style.setProperty("--progress", progress.toFixed(4));
  }
  if (navBar) {
    navBar.classList.toggle("scrolled", window.scrollY > 16);
  }
  scrollTicking = false;
}

window.addEventListener(
  "scroll",
  () => {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(onScroll);
    }
  },
  { passive: true }
);
onScroll();

function setMenu(open) {
  if (!navMenu || !mobileToggle) {
    return;
  }
  navMenu.classList.toggle("open", open);
  mobileToggle.setAttribute("aria-expanded", String(open));
  mobileToggle.setAttribute("aria-label", open ? t.menuClose : t.menuOpen);
  const use = $("use", mobileToggle);
  if (use) {
    use.setAttribute("href", open ? "#i-close" : "#i-menu");
  }
}

if (mobileToggle) {
  mobileToggle.addEventListener("click", () => setMenu(!navMenu.classList.contains("open")));
}

$$(".nav-link").forEach((link) => link.addEventListener("click", () => setMenu(false)));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenu(false);
  }
});

/* ---------- Scroll spy com indicador deslizante ---------- */
const navLinks = $$(".nav-link");
const navIndicator = $(".nav-indicator");

function moveIndicator(link) {
  if (!navIndicator) {
    return;
  }
  if (!link) {
    navIndicator.style.opacity = "0";
    return;
  }
  navIndicator.style.opacity = "1";
  navIndicator.style.width = `${link.offsetWidth}px`;
  navIndicator.style.transform = `translateX(${link.offsetLeft}px)`;
}

function setActiveLink(id) {
  let activeLink = null;
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === id;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "true");
      activeLink = link;
    } else {
      link.removeAttribute("aria-current");
    }
  });
  moveIndicator(activeLink);
}

const spySections = navLinks
  .map((link) => $(link.getAttribute("href")))
  .filter(Boolean);

if (spySections.length && "IntersectionObserver" in window) {
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveLink(`#${entry.target.id}`);
        }
      });
    },
    { rootMargin: "-35% 0px -60% 0px" }
  );
  spySections.forEach((section) => spy.observe(section));

  // Secções sem link próprio no menu marcam a secção mais próxima.
  const unlinked = [
    ["#engenharia", "#competencias"],
    ["#formacao", "#competencias"]
  ];
  unlinked.forEach(([sectionId, linkId]) => {
    const section = $(sectionId);
    if (!section) {
      return;
    }
    new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveLink(linkId);
          }
        });
      },
      { rootMargin: "-35% 0px -60% 0px" }
    ).observe(section);
  });

  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY < 200) {
        setActiveLink(null);
      }
    },
    { passive: true }
  );
  window.addEventListener("resize", () => moveIndicator($(".nav-link.active")));
}

/* ---------- Revelação ao fazer scroll ---------- */
const revealEls = $$("[data-reveal]");

if ("IntersectionObserver" in window && !prefersReducedMotion.matches) {
  const reveal = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        const el = entry.target;
        el.classList.add("is-visible");
        reveal.unobserve(el);
        // Depois de revelado, devolve as transições de hover ao próprio componente.
        setTimeout(() => {
          el.removeAttribute("data-reveal");
          el.style.removeProperty("--i");
        }, 1200);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => reveal.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("is-visible"));
}

/* ---------- Contadores ---------- */
const counters = $$("[data-count]");

function runCounter(el) {
  const target = Number(el.dataset.count);
  const suffix = el.dataset.suffix || "";
  const duration = 1400;
  const start = performance.now();

  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 4);
    el.textContent = `${Math.round(target * eased)}${suffix}`;
    if (t < 1) {
      requestAnimationFrame(frame);
    }
  }
  requestAnimationFrame(frame);
}

if (counters.length && "IntersectionObserver" in window && !prefersReducedMotion.matches) {
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((el) => {
    el.textContent = `0${el.dataset.suffix || ""}`;
    countObserver.observe(el);
  });
}

/* ---------- Spotlight e botões magnéticos ---------- */
if (finePointer.matches && !prefersReducedMotion.matches) {
  $$(".spotlight").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--x", `${event.clientX - rect.left}px`);
      card.style.setProperty("--y", `${event.clientY - rect.top}px`);
    });
  });

  $$(".magnetic").forEach((btn) => {
    const strength = 6;
    btn.addEventListener("pointermove", (event) => {
      const rect = btn.getBoundingClientRect();
      const dx = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const dy = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      btn.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
    });
    btn.addEventListener("pointerleave", () => {
      btn.style.transform = "";
    });
  });
}

/* ---------- Faixa de tecnologias (movimento contínuo + arrastar) ---------- */
const marquee = $(".marquee");

if (marquee) {
  const tracks = $$(".marquee-track", marquee);
  const baseSpeed = prefersReducedMotion.matches ? 35 : 70; // px por segundo
  let offset = 0;
  let velocity = 0; // velocidade extra vinda do arrasto (px/s)
  let trackWidth = tracks[0].offsetWidth;
  let hovering = false;
  let dragging = false;
  let visible = true;
  let lastX = 0;
  let lastMoveTime = 0;
  let lastFrame = performance.now();

  const render = () => {
    // Mantém o deslocamento dentro de uma volta para o ciclo ser contínuo.
    offset = ((offset % trackWidth) + trackWidth) % trackWidth;
    const transform = `translate3d(${-offset}px, 0, 0)`;
    tracks.forEach((track) => {
      track.style.transform = transform;
    });
  };

  const tick = (now) => {
    const dt = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;

    if (!dragging && visible) {
      const auto = hovering ? 0 : baseSpeed;
      offset += (auto + velocity) * dt;
      velocity *= Math.pow(0.04, dt); // inércia que se dissipa em ~1s
      if (Math.abs(velocity) < 1) {
        velocity = 0;
      }
      render();
    }
    requestAnimationFrame(tick);
  };

  marquee.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) {
      return;
    }
    dragging = true;
    velocity = 0;
    lastX = event.clientX;
    lastMoveTime = performance.now();
    marquee.classList.add("is-dragging");
    marquee.setPointerCapture(event.pointerId);
  });

  marquee.addEventListener("pointermove", (event) => {
    if (!dragging) {
      return;
    }
    const now = performance.now();
    const dx = event.clientX - lastX;
    const dt = Math.max((now - lastMoveTime) / 1000, 0.001);
    offset -= dx;
    // Suaviza a velocidade para a inércia ao largar não dar saltos.
    velocity = velocity * 0.6 + (-dx / dt) * 0.4;
    lastX = event.clientX;
    lastMoveTime = now;
    render();
  });

  const endDrag = (event) => {
    if (!dragging) {
      return;
    }
    dragging = false;
    marquee.classList.remove("is-dragging");
    if (marquee.hasPointerCapture(event.pointerId)) {
      marquee.releasePointerCapture(event.pointerId);
    }
    // Se o cursor ficou parado antes de largar, não há impulso.
    if (performance.now() - lastMoveTime > 120) {
      velocity = 0;
    }
    velocity = Math.max(-3000, Math.min(3000, velocity));
    lastFrame = performance.now();
  };

  marquee.addEventListener("pointerup", endDrag);
  marquee.addEventListener("pointercancel", endDrag);

  if (finePointer.matches) {
    marquee.addEventListener("pointerenter", () => {
      hovering = true;
    });
    marquee.addEventListener("pointerleave", () => {
      hovering = false;
    });
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      lastFrame = performance.now();
    }).observe(marquee);
  }

  // A largura muda quando as fontes carregam ou a janela é redimensionada.
  const measure = () => {
    trackWidth = tracks[0].offsetWidth || trackWidth;
  };
  if ("ResizeObserver" in window) {
    new ResizeObserver(measure).observe(tracks[0]);
  } else {
    window.addEventListener("resize", measure);
  }
  if (document.fonts) {
    document.fonts.ready.then(measure);
  }

  render();
  requestAnimationFrame(tick);
}

/* ---------- Filtros de projetos ---------- */
const filterButtons = $$("[data-filter]");
const projectRows = $$(".project-row");
const filterStatus = $("#filterStatus");
const rowsToggle = $("#rowsToggle");
const rowsHiddenCount = $("#rowsHiddenCount");
const ROWS_PREVIEW = 4; // projetos visíveis em "Todos" antes de "Ver mais"

let activeFilter = "all";
let rowsExpanded = false;

function updateRows({ animateFrom = 0 } = {}) {
  const matching = projectRows.filter(
    (row) => activeFilter === "all" || row.dataset.category === activeFilter
  );
  // O limite só se aplica a "Todos"; um filtro mostra sempre todos os resultados.
  const limit = activeFilter === "all" && !rowsExpanded ? ROWS_PREVIEW : Infinity;

  let visible = 0;
  projectRows.forEach((row) => {
    const index = matching.indexOf(row);
    const show = index !== -1 && index < limit;
    const wasHidden = row.hidden;
    row.hidden = !show;
    if (show) {
      visible += 1;
      if (wasHidden || animateFrom === 0) {
        row.classList.remove("is-entering");
        // Força o reinício da animação de entrada.
        void row.offsetWidth;
        row.classList.add("is-entering");
        row.style.animationDelay = `${Math.max(index - animateFrom, 0) * 50}ms`;
      }
    }
  });

  if (rowsToggle) {
    const hiddenCount = matching.length - Math.min(matching.length, ROWS_PREVIEW);
    rowsToggle.hidden = activeFilter !== "all" || hiddenCount === 0;
    rowsToggle.setAttribute("aria-expanded", String(rowsExpanded));
    rowsToggle.classList.toggle("is-expanded", rowsExpanded);
    $(".rows-toggle-label", rowsToggle).textContent = rowsExpanded ? t.showLess : t.showMore;
    rowsHiddenCount.textContent = rowsExpanded ? "" : `+${hiddenCount}`;
  }

  return visible;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    rowsExpanded = false;
    filterButtons.forEach((b) => {
      const active = b === button;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", String(active));
    });

    const visible = updateRows();
    if (filterStatus) {
      filterStatus.textContent = `${visible} ${visible === 1 ? t.visibleOne : t.visibleMany}`;
    }
  });
});

if (rowsToggle) {
  rowsToggle.addEventListener("click", () => {
    rowsExpanded = !rowsExpanded;
    const visible = updateRows({ animateFrom: rowsExpanded ? ROWS_PREVIEW : Infinity });
    if (filterStatus) {
      filterStatus.textContent = `${visible} ${t.visibleMany}`;
    }
    if (!rowsExpanded) {
      // Ao recolher, mantém a lista à vista em vez de deixar o utilizador lá em baixo.
      $("#projectRows").scrollIntoView({ block: "nearest", behavior: prefersReducedMotion.matches ? "auto" : "smooth" });
    }
  });
}

if (projectRows.length) {
  // Estado inicial sem animação: as linhas entram com o reveal da secção.
  projectRows.forEach((row, index) => {
    row.hidden = index >= ROWS_PREVIEW;
  });
  updateRows({ animateFrom: Infinity });
}

/* ---------- Links para o cartão de um projeto ---------- */
document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#projeto-"]');
  if (!link) {
    return;
  }
  const target = $(link.getAttribute("href"));
  if (!target) {
    return;
  }
  event.preventDefault();

  // Um projeto em "Mais projetos" pode estar escondido pelo filtro ou pelo "Ver mais".
  if (target.hidden) {
    const all = $('[data-filter="all"]');
    if (all && !all.classList.contains("is-active")) {
      all.click();
    }
    if (target.hidden && rowsToggle && !rowsExpanded) {
      rowsToggle.click();
    }
  }

  target.scrollIntoView({ behavior: prefersReducedMotion.matches ? "auto" : "smooth", block: "center" });
  target.classList.remove("is-highlighted");
  void target.offsetWidth;
  target.classList.add("is-highlighted");
  setTimeout(() => target.classList.remove("is-highlighted"), 2200);
});

/* ---------- Detalhe do projeto ---------- */
const projectDialog = $("#projectDialog");
let projectsData = [];

try {
  projectsData = JSON.parse($("#projectsData").textContent);
} catch (error) {
  projectsData = [];
}

function setLink(el, href) {
  if (!el) {
    return;
  }
  el.hidden = !href;
  if (href) {
    el.href = href;
  }
}

function openProject(id) {
  const project = projectsData.find((p) => p.id === id);
  if (!project || !projectDialog) {
    return;
  }

  $("#dlgTitle").textContent = project.title;
  $("#dlgLabel").textContent = project.label;
  $("#dlgStatus").textContent = project.statusLabel;
  $("#dlgBadge").className = `badge badge-${project.status}`;
  $("#dlgProblem").textContent = project.problem;
  $("#dlgSolution").textContent = project.solution;
  $("#dlgRoleText").textContent = project.role;
  $("#dlgRole").hidden = !project.role;

  const image = $("#dlgImage");
  image.src = project.image;
  image.alt = project.imageAlt || `${t.shotAlt} ${project.title}`;
  image.parentElement.classList.toggle("is-contain", project.imageFit === "contain");

  const featuresWrap = $("#dlgFeaturesWrap");
  const features = $("#dlgFeatures");
  features.replaceChildren(
    ...project.features.map((feature) => {
      const li = document.createElement("li");
      li.innerHTML =
        '<span class="check"><svg class="i" width="12" height="12" aria-hidden="true"><use href="#i-check"></use></svg></span>';
      li.append(feature);
      return li;
    })
  );
  featuresWrap.hidden = project.features.length === 0;

  const decisions = project.decisions || [];
  $("#dlgDecisions").replaceChildren(
    ...decisions.map((decision) => {
      const li = document.createElement("li");
      const title = document.createElement("strong");
      title.textContent = decision.title;
      const text = document.createElement("span");
      text.textContent = decision.text;
      li.append(title, text);
      return li;
    })
  );
  $("#dlgDecisionsWrap").hidden = decisions.length === 0;

  $("#dlgStack").replaceChildren(
    ...project.stack.map((tech, i) => {
      const li = document.createElement("li");
      const iconData = project.stackIcons && project.stackIcons[i];
      if (iconData) {
        const ti = document.createElement("span");
        ti.className = iconData.tone ? `ti ti-${iconData.tone}` : "ti";
        ti.setAttribute("aria-hidden", "true");
        ti.style.setProperty("--ti", `url(${iconData.path})`);
        ti.style.setProperty("--tc", iconData.color);
        li.style.setProperty("--tc", iconData.color);
        li.append(ti);
      }
      li.append(tech);
      return li;
    })
  );

  setLink($("#dlgLive"), project.url);
  setLink($("#dlgRepo"), project.repo);
  $("#dlgNoLink").hidden = Boolean(project.url || project.repo);

  projectDialog.showModal();
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-open-project]");
  if (trigger) {
    openProject(trigger.dataset.openProject);
  }
});

$$("dialog").forEach((dialog) => {
  // Fecha ao clicar fora do conteúdo.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });
  $$("[data-close-dialog]", dialog).forEach((btn) => btn.addEventListener("click", () => dialog.close()));
});

/* ---------- Copiar para a área de transferência ---------- */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.append(helper);
    helper.select();
    const ok = document.execCommand("copy");
    helper.remove();
    return ok;
  }
}

$$(".copy-btn").forEach((btn) => {
  const label = $(".copy-label", btn);
  btn.addEventListener("click", async () => {
    const ok = await copyText(btn.dataset.copy);
    if (!ok) {
      return;
    }
    btn.classList.add("is-copied");
    if (label) {
      label.textContent = t.copied;
    }
    showToast(t.copiedToast);
    setTimeout(() => {
      btn.classList.remove("is-copied");
      if (label) {
        label.textContent = t.copy;
      }
    }, 1800);
  });
});

/* ---------- Paleta de comandos (Ctrl/⌘ + K) ---------- */
const palette = $("#palette");
const paletteInput = $("#paletteInput");
const paletteList = $("#paletteList");
const paletteEmpty = $("#paletteEmpty");
const paletteOpenBtn = $("#paletteOpen");

const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
if (isMac && paletteOpenBtn) {
  const hint = $(".kbd-hint", paletteOpenBtn);
  if (hint) {
    hint.textContent = "⌘ K";
  }
}

function goTo(hash) {
  const target = $(hash);
  if (target) {
    target.scrollIntoView({ behavior: prefersReducedMotion.matches ? "auto" : "smooth" });
  }
}

function downloadFile(href, name) {
  const link = document.createElement("a");
  link.href = href;
  link.download = name;
  link.click();
}

const commands = [
  ...["sobre", "experiencia", "projetos", "competencias", "engenharia", "formacao", "contacto"].map((id) => ({
    group: t.groups.nav,
    label: t.nav[id],
    icon: "hash",
    run: () => goTo(`#${id}`)
  })),
  ...projectsData.map((project) => ({
    group: t.groups.projects,
    label: project.title,
    icon: "arrow-up-right",
    run: () => openProject(project.id)
  })),
  {
    group: t.groups.actions,
    label: t.copyEmail,
    icon: "copy",
    run: async () => {
      if (await copyText(EMAIL)) {
        showToast(t.emailCopied);
      }
    }
  },
  {
    group: t.groups.actions,
    label: t.downloadCv,
    icon: "download",
    run: () => downloadFile(t.cvHref, t.cvName)
  },
  { group: t.groups.actions, label: t.toggleTheme, icon: "moon", run: () => toggleTheme(themeToggle) },
  { group: t.groups.actions, label: t.switchLang, icon: "arrow-right", run: () => { window.location.href = t.otherLangHref; } },
  { group: t.groups.links, label: "GitHub", icon: "github", run: () => window.open("https://github.com/anderson-fullstack-developer", "_blank", "noopener") },
  { group: t.groups.links, label: "LinkedIn", icon: "linkedin", run: () => window.open("https://linkedin.com/in/anderson-fullstack-developer", "_blank", "noopener") }
];

let filteredCommands = [];
let selectedIndex = 0;

const normalize = (value) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function renderPalette() {
  const query = normalize(paletteInput.value.trim());
  filteredCommands = commands.filter((cmd) => normalize(`${cmd.group} ${cmd.label}`).includes(query));
  selectedIndex = Math.min(selectedIndex, Math.max(filteredCommands.length - 1, 0));

  const fragment = document.createDocumentFragment();
  let lastGroup = "";
  filteredCommands.forEach((cmd, index) => {
    if (cmd.group !== lastGroup) {
      const group = document.createElement("li");
      group.className = "palette-group";
      group.setAttribute("role", "presentation");
      group.textContent = cmd.group;
      fragment.append(group);
      lastGroup = cmd.group;
    }
    const item = document.createElement("li");
    item.className = "palette-item";
    item.id = `cmd-${index}`;
    item.setAttribute("role", "option");
    item.setAttribute("aria-selected", String(index === selectedIndex));
    item.innerHTML = `<svg class="i" width="16" height="16" aria-hidden="true"><use href="#i-${cmd.icon}"></use></svg>`;
    item.append(cmd.label);
    item.addEventListener("click", () => runCommand(index));
    item.addEventListener("pointermove", () => {
      if (selectedIndex !== index) {
        selectedIndex = index;
        updateSelection();
      }
    });
    fragment.append(item);
  });

  paletteList.replaceChildren(fragment);
  paletteEmpty.hidden = filteredCommands.length > 0;
  updateSelection();
}

function updateSelection() {
  $$(".palette-item", paletteList).forEach((item) => {
    const selected = item.id === `cmd-${selectedIndex}`;
    item.setAttribute("aria-selected", String(selected));
    if (selected) {
      item.scrollIntoView({ block: "nearest" });
    }
  });
  paletteInput.setAttribute("aria-activedescendant", filteredCommands.length ? `cmd-${selectedIndex}` : "");
}

function runCommand(index) {
  const cmd = filteredCommands[index];
  if (!cmd) {
    return;
  }
  palette.close();
  cmd.run();
}

function openPalette() {
  if (!palette || palette.open) {
    return;
  }
  paletteInput.value = "";
  selectedIndex = 0;
  renderPalette();
  palette.showModal();
  paletteInput.focus();
}

if (palette) {
  paletteInput.addEventListener("input", () => {
    selectedIndex = 0;
    renderPalette();
  });

  paletteInput.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      selectedIndex = (selectedIndex + 1) % Math.max(filteredCommands.length, 1);
      updateSelection();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      selectedIndex = (selectedIndex - 1 + filteredCommands.length) % Math.max(filteredCommands.length, 1);
      updateSelection();
    } else if (event.key === "Enter") {
      event.preventDefault();
      runCommand(selectedIndex);
    }
  });

  if (paletteOpenBtn) {
    paletteOpenBtn.addEventListener("click", openPalette);
  }

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (palette.open) {
        palette.close();
      } else {
        openPalette();
      }
    }
  });
}

/* ---------- Voltar ao topo ---------- */
// O alvo #top é a navbar fixa (sticky): o browser considera-a já visível e não faz scroll.
document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href="#top"]');
  if (!link) {
    return;
  }
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: prefersReducedMotion.matches ? "auto" : "smooth" });
  history.replaceState(null, "", location.pathname + location.search);
  // Devolve o foco ao início da página para quem navega por teclado.
  const logo = $(".logo");
  if (logo) {
    logo.focus({ preventScroll: true });
  }
});

/* ---------- Ano no rodapé ---------- */
const yearEl = $("#year");
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

/* ---------- Formulário de contacto ---------- */
const contactForm = $("#contactForm");
const formStatus = $("#formStatus");
// Cada página pode definir o seu prefixo no assunto (ex.: data-mail-prefix="[Freelance]").
const mailPrefix = (contactForm && contactForm.dataset.mailPrefix) || t.mailPrefix;

if (window.emailjs) {
  window.emailjs.init(EMAILJS_PUBLIC_KEY);
}

if (contactForm && formStatus) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const MIN_INTERVAL_MS = 20000;
  let lastSubmitAt = 0;

  const sanitize = (value) => value.replace(/[<>]/g, "");
  const fields = ["name", "email", "subject", "message"].map((name) => contactForm.elements[name]);

  const setStatus = (text, type = "") => {
    formStatus.textContent = text;
    formStatus.className = `form-status${type ? ` ${type}` : ""}`;
  };

  fields.forEach((field) => {
    field.addEventListener("input", () => field.removeAttribute("aria-invalid"));
  });

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(contactForm);

    // Honeypot: campo invisível para humanos. Se vier preenchido, é um bot.
    if (String(data.get("botcheck") || "").trim()) {
      setStatus(t.sent, "success");
      contactForm.reset();
      return;
    }

    const now = Date.now();
    if (now - lastSubmitAt < MIN_INTERVAL_MS) {
      setStatus(t.wait, "error");
      return;
    }

    const name = sanitize(String(data.get("name") || "").trim()).slice(0, 100);
    const email = sanitize(String(data.get("email") || "").trim()).slice(0, 150);
    const subject = sanitize(String(data.get("subject") || "").trim()).slice(0, 150);
    const message = sanitize(String(data.get("message") || "").trim()).slice(0, 3000);

    const invalid = fields.filter((field) => {
      const value = field.value.trim();
      return !value || (field.name === "email" && !emailPattern.test(value));
    });
    fields.forEach((field) => field.toggleAttribute("aria-invalid", invalid.includes(field)));

    if (invalid.length) {
      setStatus(
        invalid.length === 1 && invalid[0].name === "email" && invalid[0].value.trim()
          ? t.invalidEmail
          : t.fillAll,
        "error"
      );
      invalid[0].setAttribute("aria-invalid", "true");
      invalid[0].focus();
      return;
    }

    lastSubmitAt = now;

    const submitButton = $('button[type="submit"]', contactForm);
    const submitLabel = $(".submit-label", contactForm);
    submitButton.disabled = true;
    submitLabel.textContent = t.sending;
    setStatus(t.sendingStatus);

    try {
      if (!window.emailjs) {
        throw new Error("Serviço de email indisponível");
      }

      await window.emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
        name,
        email,
        subject: `${mailPrefix} ${subject}`,
        message
      });

      setStatus(t.sent, "success");
      showToast(t.sentToast);
      contactForm.reset();
    } catch (error) {
      setStatus(t.fallback, "error");
      const mailSubject = encodeURIComponent(`${mailPrefix} ${subject}`);
      const mailBody = encodeURIComponent(t.mailBody(name, email, message));
      window.location.href = `mailto:${EMAIL}?subject=${mailSubject}&body=${mailBody}`;
    } finally {
      submitButton.disabled = false;
      submitLabel.textContent = t.submit;
    }
  });
}
