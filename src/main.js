import './styles/hud-buttons.css';
import './styles/acts.css';
import './styles/stage-drawer.css';
import './styles/responsive.css';

import { initWebGLField } from './webglField.js';
import { initHud } from './hud.js';
import { initAct1Hero } from './act1Hero.js';
import { initApparelShowcases } from './apparelShowcases.js';
import { initObjectShowcases } from './objectShowcases.js';
import { initAct4Spread } from './act4Spread.js';
import { initAct5Lineup } from './act5Lineup.js';
import { bindPieceActionBars } from './pieceActionBar.js';
import { initProductStage } from './productStage.js';
import { initBagDrawer } from './bagDrawer.js';
import { store } from './store.js';

function initToasts() {
  const region = document.getElementById('toast-region');
  if (!region) return;

  store.onToast(({ message, accent }) => {
    const el = document.createElement('div');
    el.className = `toast ${accent === 'ochre' ? 'toast--ochre' : ''}`;
    el.textContent = message;
    region.appendChild(el);
    requestAnimationFrame(() => el.classList.add('is-visible'));
    setTimeout(() => {
      el.classList.remove('is-visible');
      setTimeout(() => el.remove(), 260);
    }, 2600);
  });
}

function initScrollObservers(webgl, heroCtrl, apparelCtrl) {
  const railFill = document.getElementById('scroll-rail-fill');
  const acts = Array.from(document.querySelectorAll('.act[data-act]'));
  const revealEls = Array.from(document.querySelectorAll('[data-reveal]'));

  // IntersectionObserver for scroll reveal
  const revealObs = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          revealObs.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach((el) => revealObs.observe(el));

  // IntersectionObserver for active chapter tracking
  const chapterObs = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const ch = Number(entry.target.dataset.act);
          if (ch) {
            store.setActiveChapter(ch, false);
            webgl.updateMetrics({ chapter: ch });
          }
        }
      }
    },
    { threshold: 0.22, rootMargin: '-18% 0px -45% 0px' }
  );
  acts.forEach((act) => chapterObs.observe(act));

  // Kinetic scroll loop (velocity + progress)
  let lastY = window.scrollY;
  let velocity = 0;

  const tick = () => {
    const y = window.scrollY;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const norm = Math.min(1, Math.max(0, y / maxScroll));

    const delta = y - lastY;
    velocity += (delta - velocity) * 0.18;
    lastY = y;

    if (railFill) {
      railFill.style.transform = `scaleX(${norm})`;
    }

    webgl.updateMetrics({ scroll: norm, velocity });
    heroCtrl?.onScroll({ scrollY: y, norm, velocity });
    apparelCtrl?.onScroll({ scrollY: y, norm, velocity });

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

function boot() {
  const canvas = document.getElementById('webgl-field');
  const webgl = initWebGLField(canvas);

  initHud();
  const heroCtrl = initAct1Hero();
  const apparelCtrl = initApparelShowcases();
  initObjectShowcases();
  initAct4Spread();
  initAct5Lineup();

  bindPieceActionBars(document);
  initProductStage();
  initBagDrawer();
  initToasts();
  initScrollObservers(webgl, heroCtrl, apparelCtrl);
}

boot();
