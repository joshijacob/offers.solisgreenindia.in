/* assets/js/offers.js
   - Click handling & GTM (dataLayer) pushes
   - Accessibility helpers
   - Auto-slide carousel with pause-on-hover/focus and manual-interaction pause
   - Small sparkle particle system for decorative stars
*/

/* eslint-disable no-console */
(function () {
  // -------------------------
  // Config
  // -------------------------
  const INTERVAL_MS = 3500;
  const USER_PAUSE_MS = 6000;

  // GTM dataLayer
  window.dataLayer = window.dataLayer || [];
  function pushEvent(name, data) {
    try { window.dataLayer.push(Object.assign({ event: name }, data || {})); }
    catch(e){ /* ignore */ }
  }

  // Document ready
  document.addEventListener('DOMContentLoaded', function () {
    // Card event bindings
    const cards = Array.from(document.querySelectorAll('.offer-card'));
    cards.forEach(card => {
      const offer = card.dataset.offer;
      const link = card.querySelector('.offer-cta');

      card.addEventListener('click', function (e) {
        if (e.target.closest('.offer-cta')) {
          pushEvent('offer_click', { offer });
          return;
        }
        if (link && link.href && !link.classList.contains('disabled')) {
          pushEvent('offer_click', { offer });
          setTimeout(()=> window.location = link.href, 120);
        }
      });

      card.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
          if (link && link.href && !link.classList.contains('disabled')) {
            pushEvent('offer_click', { offer });
            window.location = link.href;
          }
        }
      });
    });

    // Initialize carousel auto-slide + pause logic
    initCarousel();

    // Sparkle/star canvas (decorative)
    initSparkles();
  });

  // expose debug
  window.christmasOffer = {
    pushEvent,
    getDataLayer: () => (window.dataLayer || []).slice()
  };

  // -------------------------
  // Carousel
  // -------------------------
  function initCarousel() {
    const track = document.querySelector('.offers-list');
    if (!track) return;
    const slides = Array.from(track.querySelectorAll('.offer-card'));
    if (slides.length < 2) return;

    let autoTimer = null;
    let userPaused = false;
    let lastUserInteractionAt = 0;
    let currentIndex = 0;

    function nowMs() { return Date.now(); }
    function getSlideWidth() { const f = slides[0]; return f ? f.offsetWidth : track.clientWidth; }
    function scrollToIndex(index) {
      const slide = slides[index]; if (!slide) return;
      const containerWidth = track.clientWidth;
      const slideLeft = slide.offsetLeft;
      const target = Math.max(0, slideLeft - (containerWidth - slide.offsetWidth) / 2);
      track.scrollTo({ left: target, behavior: 'smooth' });
      currentIndex = index;
    }
    function nextIndex() { return (currentIndex + 1) % slides.length; }
    function startAutoSlide() { if (autoTimer) clearInterval(autoTimer); autoTimer = setInterval(()=>{ if (userPaused && (nowMs()-lastUserInteractionAt) < USER_PAUSE_MS) return; const idx = nextIndex(); scrollToIndex(idx); }, INTERVAL_MS); }
    function stopAutoSlide(){ if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }
    function pauseForUser(){ userPaused = true; lastUserInteractionAt = nowMs(); stopAutoSlide(); }
    function resumeAfterUser(){ userPaused = false; startAutoSlide(); }

    track.addEventListener('mouseenter', ()=> pauseForUser());
    track.addEventListener('mouseleave', ()=> { lastUserInteractionAt = nowMs(); userPaused=false; startAutoSlide(); });

    slides.forEach((s)=>{
      s.addEventListener('focusin', ()=> pauseForUser());
      s.addEventListener('focusout', ()=> { userPaused=false; startAutoSlide(); });
      s.addEventListener('click', ()=> { pauseForUser(); setTimeout(()=> { userPaused=false; }, USER_PAUSE_MS); });
    });

    let scrollTimeout = null;
    track.addEventListener('wheel', ()=> { pauseForUser(); clearTimeout(scrollTimeout); scrollTimeout = setTimeout(()=> { userPaused=false; startAutoSlide(); }, USER_PAUSE_MS); }, { passive:true });
    track.addEventListener('touchstart', ()=> pauseForUser(), { passive:true });

    track.addEventListener('keydown', (e)=> {
      if (e.key === 'ArrowRight'){ pauseForUser(); scrollToIndex(nextIndex()); }
      else if (e.key === 'ArrowLeft'){ pauseForUser(); const idx=(currentIndex-1+slides.length)%slides.length; scrollToIndex(idx); }
    });

    window.addEventListener('resize', ()=> setTimeout(()=> scrollToIndex(currentIndex), 120));
    setTimeout(()=> { scrollToIndex(0); startAutoSlide(); }, 300);
  }

  // -------------------------
  // Sparkle particle system (small decorative stars)
  // -------------------------
  function initSparkles() {
    const canvas = document.getElementById('sparkleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const particles = [];
    const MAX = 30;

    function rand(min,max){ return Math.random()*(max-min)+min; }

    function initParticles(){
      particles.length = 0;
      for (let i=0;i<MAX;i++){
        particles.push({
          x: rand(0,w),
          y: rand(0,h*0.35),
          radius: rand(0.6,2.0),
          alpha: rand(0.25,0.95),
          speed: rand(0.02,0.12),
          twinkle: rand(0.5,1.6),
          phase: Math.random()*Math.PI*2
        });
      }
    }

    function draw(){
      ctx.clearRect(0,0,w,h);
      particles.forEach((p)=>{
        p.phase += p.twinkle * 0.02;
        const a = 0.5 + 0.5*Math.sin(p.phase);
        ctx.globalAlpha = p.alpha * a * 0.9;
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 240, 200, 1)';
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }

    function resize(){ w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; initParticles(); }
    window.addEventListener('resize', resize);
    initParticles();
    draw();
  }

})();
