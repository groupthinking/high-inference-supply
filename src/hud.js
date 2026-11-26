import { store } from './store.js';

export function initHud() {
  const hudEl = document.getElementById('hud');
  const chapterButtons = Array.from(document.querySelectorAll('.hud__chapter'));
  const hapticsBtn = document.getElementById('haptics-toggle');
  const hapticsStatus = document.getElementById('haptics-status');
  const bagBtn = document.getElementById('bag-toggle');
  const bagCount = document.getElementById('bag-count');
  const brandLink = document.getElementById('hud-brand');

  const scrollToAct = (chapterNum) => {
    const target = document.getElementById(`act-${chapterNum}`);
    if (!target) return;
    store.setActiveChapter(chapterNum, true);
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  chapterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      scrollToAct(Number(btn.dataset.chapter));
    });
  });

  brandLink?.addEventListener('click', (e) => {
    e.preventDefault();
    scrollToAct(1);
  });

  hapticsBtn?.addEventListener('click', () => {
    store.toggleHaptics();
  });

  bagBtn?.addEventListener('click', () => {
    store.toggleDrawer();
  });

  const sync = (state) => {
    const isLightSurface = state.activeChapter >= 2 && state.activeChapter <= 4;
    if (hudEl) {
      hudEl.classList.toggle('hud--light', isLightSurface);
      hudEl.classList.toggle('hud--dark', !isLightSurface);
    }

    chapterButtons.forEach((btn) => {
      const isActive = Number(btn.dataset.chapter) === state.activeChapter;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-current', isActive ? 'true' : 'false');
    });

    if (hapticsBtn && hapticsStatus) {
      hapticsBtn.setAttribute('aria-pressed', String(state.hapticsEnabled));
      hapticsBtn.classList.toggle('is-on', state.hapticsEnabled);
      hapticsStatus.textContent = state.hapticsEnabled ? '[ On ]' : '[ Off ]';
    }

    if (bagBtn && bagCount) {
      const count = store.getBagCount();
      bagCount.textContent = `(${count})`;
      bagBtn.classList.toggle('has-items', count > 0);
      bagBtn.setAttribute('aria-expanded', String(state.drawerOpen));
    }
  };

  store.subscribe(sync);
  sync(store.state);
}
