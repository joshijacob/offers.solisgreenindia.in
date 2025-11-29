/* assets/js/offers.js
   Combined JS for offers.solisgreenindia.in
   - Offer card click handling & GTM/dataLayer pushes
   - Accessibility helpers
   - Auto-slide carousel with pause-on-hover/focus and manual-interaction pause
   - Keeps a small public debug object window.christmasOffer
*/

/* eslint-disable no-console */
(function () {
  // -------------------------
  // Configuration
  // -------------------------
  const REVEAL_API = "/api/reveal"; // server endpoint placeholder
  const CLAIM_API = "/api/claim";   // server endpoint placeholder

  // GTM dataLayer
  window.dataLayer = window.dataLayer || [];

  function pushEvent(name, data) {
    try {
      window.dataLayer.push(Object.assign({ event: name }, data || {}));
    } catch (e) {
      // ignore
    }
  }

  // -------------------------
  // DOM helpers & bindings
  // -------------------------
  document.addEventListener("DOMContentLoaded", function () {
    // Card click and keyboard handling
    const cards = Array.from(document.querySelectorAll(".offer-card"));
    cards.forEach((card) => {
      const offer = card.dataset.offer;
      const link = card.querySelector(".offer-cta");

      card.addEventListener("click", function (e) {
        // If user clicked on the CTA itself, let it proceed but push event
        if (e.target.closest(".offer-cta")) {
          pushEvent("offer_click", { offer });
          return;
        }
        // Otherwise, navigate to the CTA href if present
        if (link && link.href && !link.classList.contains("disabled")) {
          pushEvent("offer_click", { offer });
          // small delay to allow GTM to capture event in some cases
          setTimeout(() => { window.location = link.href; }, 120);
        }
      });

      // keyboard: Enter opens link
      card.addEventListener("keypress", function (e) {
        if (e.key === "Enter" || e.keyCode === 13) {
          if (link && link.href && !link.classList.contains("disabled")) {
            pushEvent("offer_click", { offer });
            window.location = link.href;
          }
        }
      });

      // focus styling
      card.addEventListener("focus", function () { card.classList.add("focused"); });
      card.addEventListener("blur", function () { card.classList.remove("focused"); });
    });

    // Accessibility: optional focus first highlighted card
    const first = document.querySelector(".offer-card.highlight");
    if (first) {
      // first.focus();
    }
  });

  // Expose debug helpers
  window.christmasOffer = {
    pushEvent,
    getDataLayer: () => (window.dataLayer || []).slice(),
  };

  // -------------------------
  // CAROUSEL: auto-slide with pause on hover/focus/interact
  // -------------------------
  (function () {
    const TRACK_SELECTOR = ".offers-list";
    const INTERVAL_MS = 3500; // auto-advance interval (ms)
    const USER_PAUSE_MS = 6000; // pause after user interaction (ms)
    let autoTimer = null;
    let userPaused = false;
    let lastUserInteractionAt = 0;
    let currentIndex = 0;

    const track = document.querySelector(TRACK_SELECTOR);
    if (!track) return;

    const slides = Array.from(track.querySelectorAll(".offer-card"));
    if (slides.length < 2) return;

    function nowMs() { return Date.now(); }

    function getSlideWidth() {
      const first = slides[0];
      return first ? first.offsetWidth : track.clientWidth;
    }

    function scrollToIndex(index) {
      const slide = slides[index];
      if (!slide) return;
      const containerWidth = track.clientWidth;
      const slideLeft = slide.offsetLeft;
      const target = Math.max(0, slideLeft - (containerWidth - slide.offsetWidth) / 2);
      track.scrollTo({ left: target, behavior: "smooth" });
      currentIndex = index;
    }

    function nextIndex() {
      return (currentIndex + 1) % slides.length;
    }

    function startAutoSlide() {
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = setInterval(() => {
        if (userPaused && (nowMs() - lastUserInteractionAt) < USER_PAUSE_MS) return;
        const idx = nextIndex();
        scrollToIndex(idx);
      }, INTERVAL_MS);
    }

    function stopAutoSlide() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    }

    function pauseForUser() {
      userPaused = true;
      lastUserInteractionAt = nowMs();
      stopAutoSlide();
    }
    function resumeAfterUser() {
      userPaused = false;
      startAutoSlide();
    }

    // Pause on mouse enter / resume on leave
    track.addEventListener("mouseenter", () => { pauseForUser(); });
    track.addEventListener("mouseleave", () => {
      lastUserInteractionAt = nowMs();
      userPaused = false;
      startAutoSlide();
    });

    // Focus pause for keyboard users
    slides.forEach((s, i) => {
      s.addEventListener("focusin", () => { pauseForUser(); });
      s.addEventListener("focusout", () => { userPaused = false; startAutoSlide(); });
      s.addEventListener("click", () => {
        pauseForUser();
        setTimeout(() => { userPaused = false; }, USER_PAUSE_MS);
      });
    });

    // Manual scroll/wheel/touch interactions pause the auto-slide briefly
    let scrollTimeout = null;
    track.addEventListener("wheel", () => {
      pauseForUser();
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        userPaused = false;
        startAutoSlide();
      }, USER_PAUSE_MS);
    }, { passive: true });

    track.addEventListener("touchstart", () => { pauseForUser(); }, { passive: true });

    // Keyboard arrow navigation
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        pauseForUser();
        scrollToIndex(nextIndex());
      } else if (e.key === "ArrowLeft") {
        pauseForUser();
        const idx = (currentIndex - 1 + slides.length) % slides.length;
        scrollToIndex(idx);
      }
    });

    // When window resizes, keep current index centered
    window.addEventListener("resize", () => { setTimeout(() => scrollToIndex(currentIndex), 120); });

    // Initialize: center first slide and start auto
    setTimeout(() => {
      scrollToIndex(0);
      startAutoSlide();
    }, 300);
  })();

})();
