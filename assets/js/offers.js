/* assets/js/offers.js
   Shared JS for the offers root page.
   Behavior:
    - Pushes GTM/dataLayer events when offer CTA clicked
    - Adds keyboard accessibility (Enter on card opens link)
    - Highlights active card (optional)
*/

(function () {
  // ensure dataLayer exists
  window.dataLayer = window.dataLayer || [];

  function pushEvent(name, data) {
    try {
      window.dataLayer.push(Object.assign({ event: name }, data || {}));
    } catch (e) {
      // ignore
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const cards = Array.from(document.querySelectorAll(".offer-card"));
    cards.forEach((card) => {
      const offer = card.dataset.offer;
      const link = card.querySelector(".offer-cta");

      // click handler for card (if user clicks card, follow CTA)
      card.addEventListener("click", function (e) {
        // if clicking the CTA itself, let default happen
        if (e.target.closest(".offer-cta")) {
          pushEvent("offer_click", { offer });
          return;
        }
        // else navigate to CTA href if present
        if (link && link.href && !link.classList.contains("disabled")) {
          pushEvent("offer_click", { offer });
          window.location = link.href;
        }
      });

      // keyboard accessibility: Enter opens link
      card.addEventListener("keypress", function (e) {
        if (e.key === "Enter" || e.keyCode === 13) {
          if (link && link.href && !link.classList.contains("disabled")) {
            pushEvent("offer_click", { offer });
            window.location = link.href;
          }
        }
      });

      // focus styling for accessibility
      card.addEventListener("focus", function () {
        card.classList.add("focused");
      });
      card.addEventListener("blur", function () {
        card.classList.remove("focused");
      });
    });

    // Optional: highlight the first card (christmas) as active
    const first = document.querySelector(".offer-card.highlight");
    if (first) {
      first.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
})();
