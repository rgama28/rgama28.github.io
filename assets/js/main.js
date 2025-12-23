async function loadContent() {
  const res = await fetch("content.json", { cache: "no-store" });
  if (!res.ok) throw new Error("content.json not found");
  return res.json();
}

function setImg(id, src) {
  const el = document.getElementById(id);
  if (el && src) el.src = src;
}

function revealOnScroll() {
  const els = Array.from(document.querySelectorAll("[data-reveal]"));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("is-visible");
      });
    },
    { threshold: 0.12 }
  );
  els.forEach((el) => io.observe(el));
}

function setupActivePills() {
  const pills = Array.from(document.querySelectorAll(".pill[data-section]"));
  const sections = pills
    .map((p) => document.getElementById(p.dataset.section))
    .filter(Boolean);

  if (!pills.length || !sections.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;

      pills.forEach((p) => p.classList.remove("is-active"));
      const active = pills.find((p) => p.dataset.section === visible.target.id);
      if (active) active.classList.add("is-active");
    },
    { threshold: [0.2, 0.35, 0.5] }
  );

  sections.forEach((s) => io.observe(s));
}

function el(tag, className, text) {
  const x = document.createElement(tag);
  if (className) x.className = className;
  if (text != null) x.textContent = text;
  return x;
}

/* INDEX PAGE RENDER */
function renderIndex(c) {
  const name = document.getElementById("siteName");
  if (name) name.textContent = (c.name || "ROBERT GAMA").toUpperCase();

  const subs = document.getElementById("heroSubtitles");
  if (subs) {
    subs.innerHTML = "";
    (c.subtitles || []).forEach((s) => {
      subs.appendChild(el("div", "subitem", s));
    });
  }

  const aboutHeadline = document.getElementById("aboutHeadline");
  if (aboutHeadline) aboutHeadline.textContent = c.aboutHeadline || "Student exploring business and sustainability";

  const aboutText = document.getElementById("aboutText");
  if (aboutText) {
    aboutText.innerHTML = "";
    (c.aboutParagraphs || []).forEach((p) => {
      const para = document.createElement("p");
      para.textContent = p;
      aboutText.appendChild(para);
    });
  }

  setImg("aboutImage", c.aboutImage);

  // Projects feature (Artwork card)
  const pf = document.getElementById("projectFeature");
  if (pf) {
    pf.innerHTML = "";
    const proj = c.projects?.find((p) => p.slug === "artwork") || c.projects?.[0];
    if (proj) {
      const a = document.createElement("a");
      a.href = proj.page;
      a.className = "project-card";

      const img = document.createElement("img");
      img.src = proj.cover;
      img.alt = proj.title;
      img.loading = "lazy";

      const kicker = el("div", "project-kicker", proj.title);
      const sub = el("div", "project-sub", proj.subtitle);

      a.appendChild(img);
      a.appendChild(kicker);
      a.appendChild(sub);
      pf.appendChild(a);
    }
  }

  // Awards table rows, each row links out
  const awards = document.getElementById("awardsRows");
  if (awards) {
    awards.innerHTML = "";
    (c.awards || []).forEach((aw) => {
      const row = el("div", "table-row");
      const org = el("div", "table-cell", aw.org);
      const award = el("div", "table-cell");
      const year = el("div", "table-cell right", String(aw.year));

      const link = document.createElement("a");
      link.href = aw.url;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = aw.name;

      award.appendChild(link);
      row.appendChild(org);
      row.appendChild(award);
      row.appendChild(year);
      awards.appendChild(row);
    });
  }

  // Education cards
  const edu = document.getElementById("educationCards");
  if (edu) {
    edu.innerHTML = "";
    (c.education || []).forEach((ed, idx) => {
      const card = el("div", "edu-card" + (idx % 2 === 1 ? " right" : ""));
      card.appendChild(el("div", "line big", ed.school));
      card.appendChild(el("div", "line small", ed.yearLine));
      card.appendChild(el("div", "line small", ed.detailLine));
      edu.appendChild(card);
    });
  }

  // Contact
  const contact = document.getElementById("contactGrid");
  if (contact) {
    contact.innerHTML = "";
    const wrap = el("div", "contact-list");

    const emailA = document.createElement("a");
    emailA.className = "contact-item";
    emailA.href = `mailto:${c.contact?.email}`;
    emailA.appendChild(el("span", "contact-pillnum", "001"));
    emailA.appendChild(el("span", "", c.contact?.email || "email@example.com"));

    const liA = document.createElement("a");
    liA.className = "contact-item";
    liA.href = c.contact?.linkedin || "#";
    liA.target = "_blank";
    liA.rel = "noopener";
    liA.appendChild(el("span", "contact-pillnum", "002"));
    liA.appendChild(el("span", "", "LinkedIn"));

    wrap.appendChild(emailA);
    wrap.appendChild(liA);
    contact.appendChild(wrap);
  }

  // Footer meta
  const fl = document.getElementById("footerLeft");
  const fm = document.getElementById("footerLinks");
  const fr = document.getElementById("footerRight");

  if (fl) fl.textContent = c.footer?.left || "Designed by Robert";
  if (fm) fm.textContent = c.footer?.middle || "About • Works";
  if (fr) fr.textContent = c.footer?.right || "Made in HTML/CSS";
}

/* PROJECT PAGES RENDER */
function renderArtwork(c) {
  const proj = c.projects?.find((p) => p.slug === "artwork");
  if (!proj) return;

  setImg("artworkHero", proj.hero);

  const blurb = document.getElementById("artworkBlurb");
  if (blurb) {
    blurb.innerHTML = "";
    (proj.blurb || []).forEach((p) => {
      const para = document.createElement("p");
      para.textContent = p;
      blurb.appendChild(para);
    });
  }

  const cats = document.getElementById("artworkCats");
  if (cats) {
    cats.innerHTML = "";
    (proj.categories || []).forEach((x) => cats.appendChild(el("div", "chip", x)));
  }

  const g = document.getElementById("artworkGallery");
  if (g) {
    g.innerHTML = "";
    (proj.gallery || []).forEach((src, i) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = `Artwork ${i + 1}`;
      img.loading = "lazy";
      g.appendChild(img);
    });
  }

  const next = document.getElementById("artworkNext");
  if (next) {
    const nextProj = c.projects?.find((p) => p.slug === "carino");
    if (!nextProj) return;

    next.innerHTML = "";
    const a = document.createElement("a");
    a.className = "next-card";
    a.href = nextProj.page;

    const img = document.createElement("img");
    img.src = nextProj.thumb;
    img.alt = nextProj.title;
    img.loading = "lazy";

    a.appendChild(img);
    a.appendChild(el("div", "", nextProj.title));
    next.appendChild(a);
  }
}

function renderCarino(c) {
  const proj = c.projects?.find((p) => p.slug === "carino");
  if (!proj) return;

  setImg("carinoHero", proj.hero);

  const blurb = document.getElementById("carinoBlurb");
  if (blurb) {
    blurb.innerHTML = "";
    (proj.blurb || []).forEach((p) => {
      const para = document.createElement("p");
      para.textContent = p;
      blurb.appendChild(para);
    });
  }

  const g = document.getElementById("carinoGallery");
  if (g) {
    g.innerHTML = "";
    (proj.gallery || []).forEach((src, i) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = `Cariño ${i + 1}`;
      img.loading = "lazy";
      g.appendChild(img);
    });
  }

  const next = document.getElementById("carinoNext");
  if (next) {
    const nextProj = c.projects?.find((p) => p.slug === "artwork");
    if (!nextProj) return;

    next.innerHTML = "";
    const a = document.createElement("a");
    a.className = "next-card";
    a.href = nextProj.page;

    const img = document.createElement("img");
    img.src = nextProj.thumb;
    img.alt = nextProj.title;
    img.loading = "lazy";

    a.appendChild(img);
    a.appendChild(el("div", "", nextProj.title));
    next.appendChild(a);
  }
}

(async function init(){
  revealOnScroll();

  const c = await loadContent();

  // Which page are we on?
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  if (path === "" || path === "index.html") {
    renderIndex(c);
    setupActivePills();
  }
  if (path === "artwork.html") renderArtwork(c);
  if (path === "carino.html") renderCarino(c);
})();
