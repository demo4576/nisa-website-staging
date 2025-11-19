document.addEventListener("DOMContentLoaded", () => {
  /* ===== Mobile nav toggle ===== */
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navLinks.classList.toggle("show");
    });

    navLinks.addEventListener("click", (e) => {
      if (e.target.tagName === "A" && navLinks.classList.contains("show")) {
        navLinks.classList.remove("show");
      }
    });
  }

  const contactForm = document.getElementById("contact-form");
const contactStatus = document.getElementById("contact-status");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    contactStatus.textContent = "Sending...";
    try {
      const formData = new FormData(contactForm);
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        contactStatus.textContent = "Thank you for writing to us. We will get back to you soon.";
        contactForm.reset();
      } else {
        contactStatus.textContent = "There was a problem sending your message. Please try again or email us directly.";
      }
    } catch (err) {
      contactStatus.textContent = "Network error. Please check your connection or email us directly.";
    }
  });
}


  /* ===== Language toggle ===== */
  const htmlEl = document.documentElement;
  const langToggleBtn = document.getElementById("lang-toggle");

  // Read saved lang or default to 'en'
  let currentLang = localStorage.getItem("nisaLang") || "en";

  function applyLang(lang) {
    currentLang = lang === "hi" ? "hi" : "en";
    htmlEl.setAttribute("data-lang", currentLang);
    localStorage.setItem("nisaLang", currentLang);
  }

  applyLang(currentLang);

  if (langToggleBtn) {
    langToggleBtn.addEventListener("click", () => {
      const next = currentLang === "en" ? "hi" : "en";
      applyLang(next);
    });
  }

  /* ===== Impact counters (home + footer) ===== */
  const counters = document.querySelectorAll("[data-target]");

  const animateCounters = () => {
    counters.forEach((counter) => {
      const target = parseInt(counter.dataset.target, 10);
      if (!target || counter.dataset.animated === "true") return;

      const rect = counter.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      counter.dataset.animated = "true";
      let current = 0;
      const step = Math.max(1, Math.floor(target / 100));

      const update = () => {
        current += step;
        if (current >= target) current = target;
        counter.textContent = current.toLocaleString("en-IN");
        if (current < target) {
          requestAnimationFrame(update);
        }
      };

      requestAnimationFrame(update);
    });
  };

  animateCounters();
  window.addEventListener("scroll", animateCounters);

  /* ===== Footer year ===== */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ===== Smooth scroll for in-page anchors ===== */
  document.body.addEventListener("click", (e) => {
    const link = e.target.closest("a[href^='#']");
    if (!link) return;

    const id = link.getAttribute("href").slice(1);
    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });

    /* ===== GALLERY LIGHTBOX ===== */
  const galleryImages = document.querySelectorAll(".gallery-item img");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-image");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const btnPrev = document.querySelector(".lightbox-prev");
  const btnNext = document.querySelector(".lightbox-next");
  const closeEls = document.querySelectorAll("[data-lightbox-close]");

  let currentIndex = 0;

  function openLightbox(index) {
    if (!lightbox || !lightboxImg) return;
    currentIndex = index;
    const img = galleryImages[currentIndex];
    if (!img) return;

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || "";
    // caption: take the visible caption text
    const cap = img.closest("figure")?.querySelector("figcaption");
    lightboxCaption.textContent = cap ? cap.innerText.trim() : "";
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }

  function showNext(delta) {
    if (!galleryImages.length) return;
    currentIndex = (currentIndex + delta + galleryImages.length) % galleryImages.length;
    openLightbox(currentIndex);
  }

  galleryImages.forEach((img, index) => {
    img.addEventListener("click", () => openLightbox(index));
  });

  closeEls.forEach((el) => {
    el.addEventListener("click", closeLightbox);
  });

  if (btnPrev) {
    btnPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      showNext(-1);
    });
  }

  if (btnNext) {
    btnNext.addEventListener("click", (e) => {
      e.stopPropagation();
      showNext(1);
    });
  }

  document.addEventListener("keydown", (e) => {
    if (!lightbox || !lightbox.classList.contains("open")) return;

    if (e.key === "Escape") {
      closeLightbox();
    } else if (e.key === "ArrowRight") {
      showNext(1);
    } else if (e.key === "ArrowLeft") {
      showNext(-1);
    }
  });
});


