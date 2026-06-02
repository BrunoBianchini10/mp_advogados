/* ============================================================
   MARTINS & PELLINI — main.js
   ============================================================ */
(function () {
    'use strict';

    /* ── AOS ─────────────────────────────────────────────────── */
    AOS.init({ once: true, offset: 60, duration: 820, easing: 'ease-out-cubic' });

    /* ── Header scroll ──────────────────────────────────────── */
    const header = document.getElementById('header');
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 56);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ── Mobile nav ─────────────────────────────────────────── */
    const hamburger = document.getElementById('hamburger');
    const nav       = document.getElementById('nav');

    function closeNav() {
        hamburger.classList.remove('is-open');
        nav.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('is-open');
        hamburger.classList.toggle('is-open', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    nav.querySelectorAll('.nav__link').forEach(link => link.addEventListener('click', closeNav));

    document.addEventListener('click', e => {
        if (nav.classList.contains('is-open') && !nav.contains(e.target) && !hamburger.contains(e.target)) closeNav();
    });

    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });

    /* ── Smooth anchor scroll ───────────────────────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const id = a.getAttribute('href');
            if (id === '#') return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - 76;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    /* ── Counter animation ──────────────────────────────────── */
    const counters = document.querySelectorAll('.stats__num');

    const counterObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el       = entry.target;
            const target   = +el.dataset.target;
            const duration = 1800;
            const fps      = 60;
            const steps    = (duration / 1000) * fps;
            const step     = target / steps;
            let current    = 0;

            const tick = () => {
                current = Math.min(current + step, target);
                el.textContent = Math.floor(current).toLocaleString('pt-BR');
                if (current < target) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            counterObserver.unobserve(el);
        });
    }, { threshold: 0.6 });

    counters.forEach(c => counterObserver.observe(c));

    /* ── Testimonials slider ────────────────────────────────── */
    const track     = document.getElementById('sliderTrack');
    const dotsWrap  = document.getElementById('sliderDots');
    const btnPrev   = document.getElementById('prevSlide');
    const btnNext   = document.getElementById('nextSlide');

    if (track) {
        const cards    = Array.from(track.querySelectorAll('.tcard'));
        let current    = 0;
        let perView    = getPerView();
        let total      = Math.ceil(cards.length / perView);
        let timer;

        function getPerView() {
            if (window.innerWidth <= 768)  return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        }

        function buildDots() {
            dotsWrap.innerHTML = '';
            total = Math.ceil(cards.length / perView);
            for (let i = 0; i < total; i++) {
                const btn = document.createElement('button');
                btn.className = 'sdot' + (i === 0 ? ' is-active' : '');
                btn.setAttribute('aria-label', `Slide ${i + 1}`);
                btn.addEventListener('click', () => { goTo(i); resetTimer(); });
                dotsWrap.appendChild(btn);
            }
        }

        function goTo(index) {
            current = ((index % total) + total) % total;
            const cardW = cards[0].offsetWidth + 24;
            track.style.transform = `translateX(-${current * cardW * perView}px)`;
            dotsWrap.querySelectorAll('.sdot').forEach((d, i) => d.classList.toggle('is-active', i === current));
        }

        function resetTimer() {
            clearInterval(timer);
            timer = setInterval(() => goTo(current + 1), 5000);
        }

        btnPrev.addEventListener('click', () => { goTo(current - 1); resetTimer(); });
        btnNext.addEventListener('click', () => { goTo(current + 1); resetTimer(); });

        track.addEventListener('mouseenter', () => clearInterval(timer));
        track.addEventListener('mouseleave', resetTimer);

        /* Touch/swipe */
        let touchStart = 0;
        track.addEventListener('touchstart', e => { touchStart = e.changedTouches[0].clientX; }, { passive: true });
        track.addEventListener('touchend',   e => {
            const delta = touchStart - e.changedTouches[0].clientX;
            if (Math.abs(delta) > 40) { goTo(delta > 0 ? current + 1 : current - 1); resetTimer(); }
        }, { passive: true });

        let resizeId;
        window.addEventListener('resize', () => {
            clearTimeout(resizeId);
            resizeId = setTimeout(() => { perView = getPerView(); buildDots(); goTo(0); }, 200);
        });

        buildDots();
        resetTimer();
    }

    /* ── Back to top ────────────────────────────────────────── */
    const backTop = document.getElementById('backTop');
    window.addEventListener('scroll', () => backTop.classList.toggle('visible', window.scrollY > 420), { passive: true });
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    /* ── Active nav link on scroll ──────────────────────────── */
    const sections  = document.querySelectorAll('section[id]');
    const navLinks  = document.querySelectorAll('.nav__link[href^="#"]');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY + 120;
        sections.forEach(sec => {
            if (scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight) {
                navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + sec.id));
            }
        });
    }, { passive: true });

    /* ── Contact form feedback ──────────────────────────────── */
    const form   = document.getElementById('contactForm');
    const submit = document.getElementById('submitBtn');

    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            if (!form.checkValidity()) { form.reportValidity(); return; }

            submit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando…';
            submit.disabled = true;

            setTimeout(() => {
                submit.innerHTML = '<i class="fas fa-check-circle"></i> Mensagem Enviada!';
                submit.style.background = '#2a9d5c';
                form.reset();
                setTimeout(() => {
                    submit.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Mensagem';
                    submit.style.background = '';
                    submit.disabled = false;
                }, 3500);
            }, 1200);
        });

        /* Phone mask */
        const phoneInput = document.getElementById('cf-phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', () => {
                let v = phoneInput.value.replace(/\D/g, '').slice(0, 11);
                if (v.length > 6) v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
                else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
                phoneInput.value = v;
            });
        }
    }

    /* ── Footer year ────────────────────────────────────────── */
    const fy = document.getElementById('footerYear');
    if (fy) fy.textContent = new Date().getFullYear();

})();
