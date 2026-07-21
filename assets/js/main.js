/* Robert Gama — shared site behavior: nav, reveal, gallery filter, footer year */

function initNav(){
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("siteNav");
  const backdrop = document.getElementById("navBackdrop");
  if (!toggle || !nav) return;

  function closeNav(){
    nav.classList.remove("is-open");
    backdrop?.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }
  function openNav(){
    nav.classList.add("is-open");
    backdrop?.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
  }

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.contains("is-open");
    isOpen ? closeNav() : openNav();
  });
  backdrop?.addEventListener("click", closeNav);
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeNav));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });
}

function markCurrentNav(){
  const page = document.body.dataset.page;
  if (!page) return;
  document.querySelectorAll(".nav-links a[data-page]").forEach((a) => {
    if (a.dataset.page === page) {
      a.classList.add("is-current");
      a.setAttribute("aria-current", "page");
    }
  });
}

function revealOnScroll(){
  const els = Array.from(document.querySelectorAll("[data-reveal]"));
  if (!els.length) return;
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0 }
  );
  els.forEach((el) => io.observe(el));
}

function setFooterCopy(){
  const el = document.getElementById("footerCopy");
  if (el) el.textContent = "© " + new Date().getFullYear() + " Robert Gama.";
}

async function loadContent(){
  const res = await fetch("content.json", { cache: "no-store" });
  if (!res.ok) throw new Error("content.json not found");
  return res.json();
}

function buildPhotoGrid(container, items, altPrefix){
  container.innerHTML = "";
  items.forEach((item) => {
    const img = document.createElement("img");
    img.src = typeof item === "string" ? item : item.src;
    img.alt = typeof item === "string" ? altPrefix : item.alt || altPrefix;
    img.loading = "lazy";
    if (typeof item !== "string" && item.category) {
      img.dataset.category = item.category;
    }
    container.appendChild(img);
  });
}

function initFilters(container){
  const buttons = document.querySelectorAll(".filter-btn");
  if (!buttons.length || !container) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const filter = btn.dataset.filter;
      container.querySelectorAll("img").forEach((img) => {
        const show = filter === "all" || img.dataset.category === filter;
        img.classList.toggle("is-hidden", !show);
      });
    });
  });
}

(async function init(){
  initNav();
  markCurrentNav();
  revealOnScroll();
  setFooterCopy();

  const galleryGrid = document.getElementById("galleryGrid");
  const carinoGrid = document.getElementById("carinoGrid");

  if (galleryGrid || carinoGrid) {
    try {
      const c = await loadContent();
      if (galleryGrid) {
        buildPhotoGrid(galleryGrid, c.gallery.items, "Artwork by Robert Gama");
        initFilters(galleryGrid);
      }
      if (carinoGrid) {
        buildPhotoGrid(carinoGrid, c.carino.gallery, "Cariño Botánica");
      }
    } catch (err) {
      console.error(err);
    }
  }
})();
