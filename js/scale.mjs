const DEFAULT_SCALE = 0.67;
const ALT_SCALE = 0.5;
const DESKTOP_MIN_WIDTH = 980;

const supportsZoom = () => typeof document.body.style.zoom !== 'undefined';
const isDesktop = () => window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`).matches;

const setTransformScale = (scale) => {
  document.body.style.transformOrigin = 'top left';
  document.body.style.transform = `scale(${scale})`;
  document.body.style.width = `${100 / scale}%`;
};

const clearTransformScale = () => {
  document.body.style.transform = '';
  document.body.style.transformOrigin = '';
  document.body.style.width = '';
};

const applyScale = (scale) => {
  if (!isDesktop()) {
    document.documentElement.style.setProperty('--ui-scale', '1');
    if (supportsZoom()) {
      document.body.style.zoom = '1';
    } else {
      clearTransformScale();
    }
    return;
  }

  document.documentElement.style.setProperty('--ui-scale', String(scale));
  if (supportsZoom()) {
    document.body.style.zoom = String(scale);
  } else {
    setTransformScale(scale);
  }
};

const createToggle = () => {
  const wrap = document.createElement('div');
  wrap.className = 'scale-toggle-wrap';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'scale-toggle';
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-label', 'Toggle page zoom');

  button.innerHTML = `
    <span class="scale-toggle__switch"><span class="scale-toggle__knob"></span></span>
  `;

  wrap.appendChild(button);

  let current = DEFAULT_SCALE;

  const updateVisuals = () => {
    const isAlt = current === ALT_SCALE;
    button.classList.toggle('scale-toggle--alt', isAlt);
    button.setAttribute('aria-pressed', String(isAlt));
  };

  button.addEventListener('click', () => {
    current = current === DEFAULT_SCALE ? ALT_SCALE : DEFAULT_SCALE;
    applyScale(current);
    updateVisuals();
  });

  updateVisuals();

  return { wrap, setDefault: () => { current = DEFAULT_SCALE; applyScale(current); updateVisuals(); } };
};

const mountToggle = () => {
  const sortSelect = document.querySelector('#frontSort');
  const headerActions = document.querySelector('.card-page-actions');
  const headerStrip = document.querySelector('.header-strip--editions .header-nav-links--editions');
  const toggle = createToggle();

  if (sortSelect && sortSelect.parentElement) {
    toggle.wrap.classList.add('scale-toggle-wrap--header');
    sortSelect.insertAdjacentElement('afterend', toggle.wrap);
  } else if (headerStrip) {
    toggle.wrap.classList.add('scale-toggle-wrap--header');
    headerStrip.appendChild(toggle.wrap);
  } else if (headerActions) {
    toggle.wrap.classList.add('scale-toggle-wrap--header');
    headerActions.appendChild(toggle.wrap);
  } else {
    toggle.wrap.classList.add('scale-toggle-wrap--floating');
    document.body.appendChild(toggle.wrap);
  }

  toggle.setDefault();

  return toggle;
};

window.addEventListener('DOMContentLoaded', () => {
  if (!document.body) return;

  const toggle = mountToggle();

  const handleResize = () => {
    if (!toggle) return;
    if (isDesktop()) {
      toggle.wrap.style.display = '';
      toggle.setDefault();
    } else {
      toggle.wrap.style.display = 'none';
      applyScale(1);
    }
  };

  handleResize();
  window.addEventListener('resize', handleResize);
});
