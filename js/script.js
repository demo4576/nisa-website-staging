document.addEventListener("DOMContentLoaded", () => {
  /* =========================================
     1. INITIALIZE LENIS (SMOOTH SCROLL)
     ========================================= */
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  /* =========================================
     2. UPDATE ANCHOR LINKS TO USE LENIS
     ========================================= */
  document.body.addEventListener("click", (e) => {
    const link = e.target.closest("a[href^='#']");
    if (!link) return;

    const id = link.getAttribute("href").slice(1);
    if (!id) return;

    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();
    lenis.scrollTo(target, {
      offset: 0,
      duration: 1.5
    });
  });

  /* =========================================
     3. NAVIGATION LOGIC (DESKTOP & MOBILE)
     ========================================= */
  
  const body = document.body;

  // --- A. DESKTOP DROPDOWN (CLICK TO OPEN) ---
  const desktopPillBtns = document.querySelectorAll(".pill-link");

  desktopPillBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      // Only run this on desktop (when the pill is visible)
      if (window.innerWidth <= 960) return;

      e.stopPropagation(); // Prevent closing immediately
      const parentItem = btn.parentElement;
      const isActive = parentItem.classList.contains("active");

      // 1. Close all other open dropdowns first
      document.querySelectorAll(".pill-item").forEach(item => {
        item.classList.remove("active");
      });

      // 2. If it wasn't active before, open it now
      if (!isActive) {
        parentItem.classList.add("active");
      }
    });
  });

  // Close Desktop dropdowns when clicking anywhere else on the page
  document.addEventListener("click", () => {
    document.querySelectorAll(".pill-item").forEach(item => {
      item.classList.remove("active");
    });
  });

  // Stop clicks inside the dropdown from closing itself
  document.querySelectorAll(".dropdown-mega").forEach(dropdown => {
    dropdown.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });


  // --- B. MOBILE MENU TOGGLE ---
  const navToggle = document.querySelector(".nav-toggle");
  
  if (navToggle) {
    navToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      body.classList.toggle("menu-open");
      
      if (body.classList.contains("menu-open")) {
        body.style.overflow = "hidden"; // Lock scroll
      } else {
        body.style.overflow = "";
      }
    });
  }

  // --- C. MOBILE ACCORDION LOGIC (The + Signs) ---
  const accordions = document.querySelectorAll(".mobile-accordion-btn");
  
  accordions.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent bubbling issues
      const item = btn.parentElement;
      
      // Close other mobile sections when one opens (Accordion style)
      document.querySelectorAll(".mobile-item").forEach(other => {
        if (other !== item) other.classList.remove("active");
      });

      // Toggle current
      item.classList.toggle("active");
    });
  });

  // Close mobile menu when clicking a link
  const mobileLinks = document.querySelectorAll(".mobile-sub-menu a");
  mobileLinks.forEach(link => {
    link.addEventListener("click", () => {
      body.classList.remove("menu-open");
      body.style.overflow = "";
    });
  });

  /* =========================================
     4. HEADER SCROLL STATE & OVERLAP DETECTION
     ========================================= */
  (function setupHeaderScrollState() {
    const hero = document.getElementById("hero");
    const header = document.querySelector(".split-header");
    const heroText = document.querySelector(".hero-text"); // Select the text container

    if (!header) return;

    function updateHeader() {
      // 1. NON-HOME PAGES: Simple scroll check
      if (!hero) {
        if (window.scrollY > 50) body.classList.add("scrolled");
        else body.classList.remove("scrolled");
        return;
      }

      const headerHeight = header.offsetHeight || 0;
      
      // 2. OVERLAP LOGIC (Fades logo/lang earlier)
      // Check if the Hero Text is hitting the bottom of the header
      if (heroText) {
        const textRect = heroText.getBoundingClientRect();
        // Add a small buffer (e.g., 20px) so it fades just before touching
        if (textRect.top <= headerHeight + 20) {
          body.classList.add("overlap-text");
        } else {
          body.classList.remove("overlap-text");
        }
      }

      // 3. SCROLLED LOGIC (Standard "Past Hero" state)
      const heroRect = hero.getBoundingClientRect();
      const isPastHero = heroRect.bottom - headerHeight <= 0;

      if (isPastHero) {
        body.classList.add("scrolled");
      } else {
        body.classList.remove("scrolled");
      }
    }

    // Run once on load and then on scroll
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  })();

  /* =========================================
     5. CONTACT FORM HANDLING
     ========================================= */
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

  /* =========================================
     6. LANGUAGE TOGGLE
     ========================================= */
  const htmlEl = document.documentElement;
  const langToggleBtn = document.getElementById("lang-toggle");

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

  /* =========================================
     7. IMPACT COUNTERS
     ========================================= */
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

  /* =========================================
     8. FOOTER YEAR
     ========================================= */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* =========================================
     9. GALLERY LIGHTBOX
     ========================================= */
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
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowRight") showNext(1);
    else if (e.key === "ArrowLeft") showNext(-1);
  });

  /* =========================================
     10. HERO PARALLAX
     ========================================= */
  (function setupHeroParallax() {
    const hero = document.querySelector(".hero");
    if (!hero) return;

    let ticking = false;

    function updateParallax() {
      const scrollY = window.scrollY;
      const bgSpeed = 0.4;
      const textSpeed = 0.15;

      const bgOffset = scrollY * bgSpeed;
      const textOffset = scrollY * textSpeed;

      hero.style.setProperty("--hero-bg-offset", `${bgOffset}px`);
      hero.style.setProperty("--hero-text-offset", `${textOffset}px`);

      ticking = false;
    }

    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  })();

});

/* =========================================
   11. SCROLL REVEAL FOR WHO-WE-ARE LINES
   ========================================= */
(function setupLineReveal() {
  const items = Array.from(document.querySelectorAll(".line-reveal"));
  if (!items.length) return;

  function onScroll() {
    const triggerY = window.innerHeight * 0.85; // reveal when 15% above bottom
    items.forEach((el) => {
      if (el.classList.contains("visible")) return; // already animated
      const rect = el.getBoundingClientRect();
      if (rect.top < triggerY) {
        el.classList.add("visible");
      }
    });
  }

  // Run once on load in case section is already in view
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();