document.addEventListener("DOMContentLoaded", () => {

  /* =========================================
     0. PRELOADER & SITE REVEAL
     ========================================= */
  const preloader = document.getElementById("preloader");
  const body = document.body;

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual'; 
  }

  // SCENARIO A: Preloader exists (Homepage)
  if(preloader) {
    // 1. Lock scroll immediately
    body.style.overflow = "hidden";
    window.scrollTo(0, 0); 

    // 2. Wait 2.6 Seconds then fade out
    setTimeout(() => {
      preloader.classList.add("fade-out");
      body.classList.add("site-loaded"); // <--- Shows the header
      
      // Wait for transition, then unlock scroll
      setTimeout(() => {
        body.style.overflow = ""; 
      }, 600);
    }, 2600);

  } 
  // SCENARIO B: No preloader (About/Internal Pages)
  else {
    // Check if the page wants to control the reveal manually (e.g. About Page)
    if (document.body.classList.contains("manual-reveal")) {
      // Do nothing here. The specific page's <script> will handle the reveal.
    } else {
      // Default behavior: Immediate reveal for standard pages
      setTimeout(() => {
        body.classList.add("site-loaded");
      }, 100); 
    }
  }

  /* =========================================
     1. INITIALIZE LENIS (SMOOTH SCROLL)
     ========================================= */
  // This creates the smooth momentum scrolling effect on the whole page.
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    smoothTouch: false, // Disable on mobile for native feel
    touchMultiplier: 2,
  });

  lenis.scrollTo(0, { immediate: true });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  /* =========================================
     2. ANCHOR LINKS INTERGRATION
     ========================================= */
  // Tells Lenis to scroll smoothly when clicking anchor links (e.g. #contact)
  document.body.addEventListener("click", (e) => {
    const link = e.target.closest("a[href^='#']");
    if (!link) return;

    // Prevent default jump
    e.preventDefault();

    const id = link.getAttribute("href").slice(1);
    if (!id) return;

    const target = document.getElementById(id);
    if (target) {
      lenis.scrollTo(target, { offset: 0, duration: 1.5 });
      
      // Also close mobile menu if it's open
      document.body.classList.remove("menu-open");
      document.body.style.overflow = "";
    }
  });

  /* =========================================
     3. NAVIGATION LOGIC (DESKTOP & MOBILE)
     ========================================= */

  // --- A. DESKTOP DROPDOWNS (Click to toggle) ---
  const desktopPillBtns = document.querySelectorAll(".pill-link");

  desktopPillBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      // Only run on desktop
      if (window.innerWidth <= 960) return;

      e.stopPropagation(); 
      const parentItem = btn.parentElement;
      const isActive = parentItem.classList.contains("active");

      // Close others
      document.querySelectorAll(".pill-item").forEach(item => {
        item.classList.remove("active");
      });

      // Toggle current
      if (!isActive) {
        parentItem.classList.add("active");
      }
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", () => {
    document.querySelectorAll(".pill-item").forEach(item => {
      item.classList.remove("active");
    });
  });

  // --- B. MOBILE MENU TOGGLE ---
  const navToggle = document.querySelector(".nav-toggle");
  
  if (navToggle) {
    navToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      body.classList.toggle("menu-open");
      
      // Lock scroll when menu is open
      if (body.classList.contains("menu-open")) {
        body.style.overflow = "hidden";
      } else {
        body.style.overflow = "";
      }
    });
  }

  // --- C. MOBILE ACCORDIONS ---
  const accordions = document.querySelectorAll(".mobile-accordion-btn");
  
  accordions.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const item = btn.parentElement;
      
      // Close other items (Accordion behavior)
      document.querySelectorAll(".mobile-item").forEach(other => {
        if (other !== item) other.classList.remove("active");
      });

      item.classList.toggle("active");
    });
  });

  /* =========================================
     4. HEADER SCROLL STATE & COLLISION
     ========================================= */
  (function setupHeaderScrollState() {
    const hero = document.getElementById("hero");
    const header = document.querySelector(".split-header");
    // Specifically target the text container in the About Hero
    const heroTextContainer = document.querySelector(".hero-about-text"); 
    
    if (!header) return;

    function updateHeader() {
      const scrollY = window.scrollY;
      const headerHeight = header.offsetHeight;
      
      // A. SCROLLED STATE (Generic)
      if (scrollY > 50) {
        body.classList.add("scrolled");
      } else {
        body.classList.remove("scrolled");
      }

      // B. COLLISION DETECTION (Logo vs Hero Text)
      // Only run collision logic if we have scrolled a bit to avoid initial load issues
      if (heroTextContainer && scrollY > 10) {
        const textRect = heroTextContainer.getBoundingClientRect();
        
        // Define safety zone. Reduced buffer to prevent immediate triggering.
        // The logo will fade out when the text gets within 10px of the header bottom.
        const collisionThreshold = headerHeight + 10; 
        
        if (textRect.top <= collisionThreshold) {
          body.classList.add("overlap-text"); // CSS hides .header-side
        } else {
          body.classList.remove("overlap-text");
        }
      } else {
         // Ensure it's removed at the very top
         body.classList.remove("overlap-text");
      }
    }

    // Run immediately to set initial state, then on scroll
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  })();

  /* =========================================
     5. CONTACT FORM
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
          contactStatus.textContent = "Thank you! We will get back to you soon.";
          contactForm.reset();
        } else {
          contactStatus.textContent = "Something went wrong. Please try again.";
        }
      } catch (err) {
        contactStatus.textContent = "Network error. Please check your connection.";
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

  // Apply initial language
  applyLang(currentLang);

  if (langToggleBtn) {
    langToggleBtn.addEventListener("click", () => {
      const next = currentLang === "en" ? "hi" : "en";
      applyLang(next);
    });
  }

  /* =========================================
     7. HERO PARALLAX EFFECT
     ========================================= */
  const heroSection = document.querySelector(".hero");
  if (heroSection) {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          // Move background slower than text
          heroSection.style.setProperty("--hero-bg-offset", `${scrollY * 0.4}px`);
          heroSection.style.setProperty("--hero-text-offset", `${scrollY * 0.15}px`);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* =========================================
     8. "WHO WE ARE" TEXT REVEAL
     ========================================= */
  // Reveals text lines one by one as you scroll
  const textLines = Array.from(document.querySelectorAll(".line-reveal"));
  if (textLines.length) {
    function checkLineReveal() {
      const triggerY = window.innerHeight * 0.85; 
      textLines.forEach((el) => {
        if (el.classList.contains("visible")) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < triggerY) {
          el.classList.add("visible");
        }
      });
    }
    checkLineReveal();
    window.addEventListener("scroll", checkLineReveal, { passive: true });
  }

  /* =========================================
     9. HORIZONTAL SCROLL (FOCUS AREAS)
     ========================================= */
  // Moves the track sideways as you scroll down
  (function setupHorizontalScroll() {
    const section = document.querySelector(".horizontal-scroll-section");
    const track = document.querySelector(".horizontal-track");
    const clipper = document.querySelector(".track-clipper");
    
    // Only active on Desktop (> 960px)
    const mediaQuery = window.matchMedia("(min-width: 961px)");

    function onScroll() {
      if (!mediaQuery.matches || !section || !track || !clipper) return;

      // Calculate progress
      const rect = section.getBoundingClientRect();
      const scrollDist = rect.height - window.innerHeight;
      let scrolled = -rect.top;

      if (scrolled < 0) scrolled = 0;
      if (scrolled > scrollDist) scrolled = scrollDist;

      // Calculate logic: Total Track Width - Visible Window Width
      const maxTranslate = track.scrollWidth - clipper.clientWidth;
      const progress = scrolled / scrollDist;
      const translateX = maxTranslate * progress;

      track.style.transform = `translateX(-${translateX}px)`;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Run once to set initial position
    onScroll();
  })();

  /* =========================================
     10. IMPACT COUNTERS (COUNT UP)
     ========================================= */
  const counterSection = document.querySelector(".impact-minimal");
  const counters = document.querySelectorAll(".impact-number");
  
  if (counterSection && counters.length > 0) {
    const startCounters = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          
          counters.forEach(counter => {
            const target = +counter.getAttribute("data-target");
            const duration = 2000; 
            const increment = target / (duration / 16); 
            
            let current = 0;
            const updateCounter = () => {
              current += increment;
              if (current < target) {
                counter.innerText = Math.ceil(current);
                requestAnimationFrame(updateCounter);
              } else {
                counter.innerText = target;
                // Reveal the "+" sign
                counter.closest('.impact-item')?.classList.add('animated');
              }
            };
            updateCounter();
          });

          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(startCounters, { threshold: 0.5 });
    observer.observe(counterSection);
  }

  /* =========================================
     11. STORIES ANIMATION (CURTAIN REVEAL)
     ========================================= */
  // Triggers the image "unrolling" effect
  const revealImages = document.querySelectorAll(".reveal-image");

  if (revealImages.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add class to start CSS Keyframe Animation
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 }); // Trigger when 15% visible

    revealImages.forEach(img => revealObserver.observe(img));
  }

  /* =========================================
     12. FOOTER YEAR
     ========================================= */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* =========================================
     13. GALLERY LIGHTBOX
     ========================================= */
  const galleryImages = document.querySelectorAll(".gallery-item img");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-image");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const btnPrev = document.querySelector(".lightbox-prev");
  const btnNext = document.querySelector(".lightbox-next");
  const closeEls = document.querySelectorAll("[data-lightbox-close]");

  if (lightbox && galleryImages.length > 0) {
    let currentIndex = 0;

    function openLightbox(index) {
      currentIndex = index;
      const img = galleryImages[currentIndex];
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || "";
      
      const cap = img.closest("figure")?.querySelector("figcaption");
      lightboxCaption.textContent = cap ? cap.innerText.trim() : "";
      
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
      lightbox.classList.remove("open");
      document.body.style.overflow = "";
    }

    function showNext(delta) {
      currentIndex = (currentIndex + delta + galleryImages.length) % galleryImages.length;
      openLightbox(currentIndex);
    }

    // Event Listeners
    galleryImages.forEach((img, index) => {
      img.addEventListener("click", () => openLightbox(index));
    });

    closeEls.forEach((el) => el.addEventListener("click", closeLightbox));

    if (btnPrev) btnPrev.addEventListener("click", (e) => { e.stopPropagation(); showNext(-1); });
    if (btnNext) btnNext.addEventListener("click", (e) => { e.stopPropagation(); showNext(1); });

    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") showNext(1);
      if (e.key === "ArrowLeft") showNext(-1);
    });
  }

});

/* =========================================
   14. DESKTOP: PINNED STORIES ANIMATION
   ========================================= */
(function setupStoriesPin() {
  const section = document.querySelector(".stories-pinned-wrapper");
  const card1 = document.querySelector(".card-1");
  const card2 = document.querySelector(".card-2");

  // SAFETY CHECK: Only run if elements exist
  if (!section || !card1 || !card2) return;

  // 1. Desktop Logic (> 960px)
  const mediaQuery = window.matchMedia("(min-width: 961px)");

  function onScroll() {
    // If we are on mobile, STOP here. Do not touch styles.
    if (!mediaQuery.matches) {
      // Clean up inline styles so CSS can take over on mobile
      card1.style.transform = "";
      card1.style.opacity = "";
      card2.style.transform = "";
      card2.style.opacity = "";
      return; 
    }

    const rect = section.getBoundingClientRect();
    const sectionTop = rect.top;
    const sectionHeight = rect.height;
    const viewportHeight = window.innerHeight;

    const end = Math.max(1, sectionHeight - viewportHeight);
    let scrolled = -sectionTop;
    if (scrolled < 0) scrolled = 0;
    if (scrolled > end) scrolled = end;

    const raw = scrolled / end;

    // Start animation logic
    const START = -0.01; 
    let base = (raw - START) / (1 - START);
    if (base < 0) base = 0;
    if (base > 1) base = 1;

    const ease = (t) => 1 - Math.pow(1 - t, 3);

    const p1 = ease(base);
    const p2 = ease(Math.max(0, Math.min(1, base - 0.15)));

    const TRAVEL = 60; 

    const y1 = TRAVEL * (1 - p1);
    const y2 = TRAVEL * (1 - p2);

    card1.style.transform = `translateY(${y1}vh)`;
    card2.style.transform = `translateY(${y2}vh)`;
    card1.style.opacity = p1;
    card2.style.opacity = p2;
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll(); 
})();


/* =========================================
   15. MOBILE: SCROLL REVEAL
   ========================================= */
(function setupMobileStoriesReveal() {
  const cards = document.querySelectorAll(".story-card");
  if (!cards.length) return;

  // 1. Mobile Logic (< 960px)
  const mq = window.matchMedia("(max-width: 960px)");

  function initMobileObserver() {
    if (!mq.matches) return; // Don't run on desktop

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add the class to trigger CSS transition
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 } // Trigger when 15% of card is visible
    );

    cards.forEach((card) => observer.observe(card));
  }

  // Initialize immediately
  initMobileObserver();

  // Re-check on resize (in case user flips tablet orientation)
  window.addEventListener("resize", initMobileObserver);
})();

/* =========================================
     16. LETTER-BY-LETTER SCROLL REVEAL (TUNED)
     ========================================= */
  (function setupCharReveal() {
    const contentDiv = document.querySelector(".editorial-content");
    if (!contentDiv) return;

    // A. Helper: Split text into characters
    function splitTextToChars(node) {
      if (node.nodeType === 3) { // Text Node
        const text = node.textContent;
        if (!text.trim() && !text.includes('\n')) return; 
        
        const wrapper = document.createDocumentFragment();
        const words = text.split(/(\s+)/); 
        
        words.forEach(word => {
          if (word.match(/^\s+$/)) {
            wrapper.appendChild(document.createTextNode(word));
          } else {
            const letters = word.split("");
            letters.forEach(letter => {
              const span = document.createElement("span");
              span.classList.add("reveal-char");
              span.textContent = letter;
              wrapper.appendChild(span);
            });
          }
        });
        node.replaceWith(wrapper);
      } else if (node.nodeType === 1) { 
        Array.from(node.childNodes).forEach(splitTextToChars);
      }
    }

    // B. Run the splitter
    const paragraphs = contentDiv.querySelectorAll("p");
    paragraphs.forEach(p => splitTextToChars(p));

    // C. Scroll Logic
    const allChars = document.querySelectorAll(".reveal-char");

    function onScroll() {
      const windowHeight = window.innerHeight;
      
      // FIX 1: Raise the trigger line. 
      // 0.65 means the text activates when it's slightly below the middle of the screen.
      // (Previously 0.85 was too low).
      const baseTrigger = windowHeight * 0.65;

      allChars.forEach(char => {
        const box = char.getBoundingClientRect();
        
        // FIX 2: Reduce horizontal friction.
        // Changed 0.4 to 0.1. This reduces the "lag" on the right side
        // so the paragraph finishes reading before the next one starts.
        const horizontalDelay = box.left * 0.1; 
        
        const triggerPoint = baseTrigger - horizontalDelay;

        if (box.top < triggerPoint) {
          char.classList.add("active");
        } else {
          char.classList.remove("active");
        }
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
  })();

  /* =========================================
   17. MISSION GRID REVEAL (SLOWER STAGGER)
   ========================================= */
(function setupMissionReveal() {
  const grid = document.querySelector('.mission-grid');
  const cards = document.querySelectorAll('.mission-box');
  
  if (!grid || !cards.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        
        // Reveal cards one by one with a slower rhythm
        cards.forEach((card, i) => {
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, i * 300); // Changed from 150 to 300 for distinct steps
        });

        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 }); // Wait until 20% of section is visible

  // Set initial state
  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(40px)'; // Start slightly lower for more drama
    // Slower ease for the movement itself
    card.style.transition = 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
  });

  observer.observe(grid);
})();

/* =========================================
   18. VISION SECTION: CLARITY REVEAL & PARALLAX
   ========================================= */
(function setupVisionEffects() {
  const section = document.querySelector('.vision-banner');
  const content = document.querySelector('.vision-content');
  const pattern = document.querySelector('.vision-bg-pattern');

  if (!section || !content) return;

  // A. The "Focus" Reveal (Intersection Observer)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        content.classList.add('in-view');
        // Optional: Stop observing once revealed
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 }); // Trigger when 35% visible

  observer.observe(section);

  // B. The Background Parallax (Scroll Event)
  // Only runs on desktop/tablets to save battery on mobile
  if (window.innerWidth > 768 && pattern) {
    window.addEventListener('scroll', () => {
      const rect = section.getBoundingClientRect();
      const viewHeight = window.innerHeight;

      // Check if section is in viewport
      if (rect.top < viewHeight && rect.bottom > 0) {
        // Calculate scroll progress relative to the section
        // Moving the background slower (multiply by -0.1) creates depth
        const moveY = (rect.top * -0.15); 
        pattern.style.transform = `translateY(${moveY}px)`;
      }
    }, { passive: true });
  }
})();

/* =========================================
   19. CHALLENGES STAGGER REVEAL
   ========================================= */
(function setupChallengeReveal() {
  const section = document.querySelector('.challenges-section');
  const rows = document.querySelectorAll('.c-row');
  const image = document.querySelector('.challenges-image');

  if (!section || !rows.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        
        // 1. Reveal the Image
        if (image) image.classList.add('revealed');

        // 2. Stagger reveal the rows
        rows.forEach((row, index) => {
          setTimeout(() => {
            row.classList.add('revealed');
          }, index * 150); // 150ms delay between each line
        });

        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  observer.observe(section);
})();

/* =========================================
     20. BLUEPRINT GRID STAGGER REVEAL
     ========================================= */
  (function setupBlueprintReveal() {
    const gridWrapper = document.querySelector('.bp-grid-wrapper');
    const cards = document.querySelectorAll('.bp-card');

    if (!gridWrapper || !cards.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          
          // Stagger the reveal for each card
          cards.forEach((card, index) => {
            setTimeout(() => {
              card.classList.add('revealed');
            }, index * 100); // 100ms delay between each card
          });

          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    observer.observe(gridWrapper);
  })();