/**
 * Hoja de vida — Tomás Hernández Herrera
 * JavaScript sin dependencias (Bootstrap solo se usa para el menú colapsable).
 */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const RING_LENGTH = 2 * Math.PI * 52; // circunferencia de los anillos de idiomas (r = 52)

  /* ------------------------------------------------------------------
   * 1. Navegación: estilo al hacer scroll, ocultar al bajar y
   *    barra de progreso de lectura.
   * ------------------------------------------------------------------ */
  const nav = $('#siteNav');
  const progress = $('.scroll-progress');
  const toTop = $('.to-top');
  let lastY = window.scrollY;

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const menuOpen = $('#navMenu').classList.contains('show');

    nav.classList.toggle('scrolled', y > 40);
    nav.classList.toggle('hidden', !menuOpen && y > lastY && y > 400);
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    toTop.classList.toggle('show', y > 600);
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', () => window.scrollTo({ top: 0 }));

  // Cierra el menú móvil al elegir una sección
  $$('#navMenu .nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      const menu = $('#navMenu');
      if (menu.classList.contains('show') && window.bootstrap) {
        bootstrap.Collapse.getOrCreateInstance(menu).hide();
      }
    });
  });

  /* ------------------------------------------------------------------
   * 2. Resaltar en el menú la sección visible (scrollspy propio).
   * ------------------------------------------------------------------ */
  const navLinks = $$('#navMenu .nav-link');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((l) => l.classList.toggle('active', l.hash === `#${entry.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach((s) => spy.observe(s));

  /* ------------------------------------------------------------------
   * 3. Animaciones de aparición y activación de indicadores
   *    (barras de habilidad, anillos de idioma y contadores).
   * ------------------------------------------------------------------ */
  const fillBar = (el) => { el.style.width = `${el.dataset.level}%`; };
  const fillRing = (el) => { el.style.strokeDashoffset = RING_LENGTH * (1 - el.dataset.level / 100); };

  const countUp = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (reducedMotion) { el.textContent = target + suffix; return; }
    const start = performance.now();
    const duration = 1400;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3))) + (t === 1 ? suffix : '');
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const revealer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (el.classList.contains('reveal')) el.classList.add('in');
      if (el.matches('.bar span')) fillBar(el);
      if (el.matches('.ring-fg')) fillRing(el);
      if (el.matches('[data-count]')) countUp(el);
      obs.unobserve(el);
    });
  }, { threshold: 0.15 });

  // Escalonar ligeramente los elementos que aparecen juntos
  $$('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 80}ms`;
    revealer.observe(el);
  });
  $$('.bar span, .ring-fg, [data-count]').forEach((el) => revealer.observe(el));

  /* ------------------------------------------------------------------
   * 4. Filtros por categoría (habilidades y proyectos).
   *    Cada botón tiene data-filter; cada elemento, data-cat con una o
   *    varias categorías separadas por espacios.
   * ------------------------------------------------------------------ */
  $$('[data-filter-group]').forEach((bar) => {
    const group = bar.dataset.filterGroup;
    const items = $$(`[data-filter-target="${group}"] .filter-item`);
    const buttons = $$('.filter-btn', bar);

    bar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      const filter = btn.dataset.filter;

      buttons.forEach((b) => {
        const on = b === btn;
        b.classList.toggle('active', on);
        b.setAttribute('aria-selected', on);
      });

      items.forEach((item) => {
        const show = filter === 'all' || item.dataset.cat.split(' ').includes(filter);
        if (show) {
          item.classList.remove('is-hidden');
          requestAnimationFrame(() => item.classList.remove('is-hiding'));
          $$('.bar span', item).forEach(fillBar);
        } else {
          item.classList.add('is-hiding');
          setTimeout(() => item.classList.contains('is-hiding') && item.classList.add('is-hidden'), reducedMotion ? 0 : 300);
        }
      });
    });
  });

  /* ------------------------------------------------------------------
   * 5. Efecto de escritura en la presentación.
   * ------------------------------------------------------------------ */
  const typed = $('#typed');
  const words = ['Backend', 'Bases de datos SQL', 'Python & Flask', 'Arquitectura de software'];
  if (typed && !reducedMotion) {
    let w = 0;
    let c = words[0].length;
    let deleting = true;
    const type = () => {
      const word = words[w];
      c += deleting ? -1 : 1;
      typed.textContent = word.slice(0, c);
      let delay = deleting ? 45 : 90;
      if (!deleting && c === word.length) { deleting = true; delay = 1800; }
      else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; delay = 300; }
      setTimeout(type, delay);
    };
    setTimeout(type, 2200);
  }

  /* ------------------------------------------------------------------
   * 6. Descargar / imprimir: antes de imprimir se muestran todos los
   *    contenidos y se rellenan todos los indicadores.
   * ------------------------------------------------------------------ */
  const prepareForPrint = () => {
    $$('.reveal').forEach((el) => el.classList.add('in'));
    $$('.bar span').forEach(fillBar);
    $$('.ring-fg').forEach(fillRing);
    $$('[data-count]').forEach((el) => { el.textContent = el.dataset.count + (el.dataset.suffix || ''); });
    if (typed) typed.textContent = words[0];
  };
  window.addEventListener('beforeprint', prepareForPrint);
  $$('.js-print').forEach((btn) => btn.addEventListener('click', () => { prepareForPrint(); window.print(); }));

  /* ------------------------------------------------------------------
   * 7. Copiar correo al portapapeles.
   * ------------------------------------------------------------------ */
  $$('.js-copy').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const label = $('span', btn);
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        label.textContent = '¡Copiado!';
      } catch {
        label.textContent = btn.dataset.copy;
      }
      setTimeout(() => { label.textContent = 'Copiar correo'; }, 2000);
    });
  });

  // Año actual en el pie de página
  $('#year').textContent = new Date().getFullYear();
})();
