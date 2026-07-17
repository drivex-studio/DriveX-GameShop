import { cx } from '../../utils/cx.js';
import { springTransition } from './springTransition.js';
import { initSanityMedia as SanityMedia } from '../../assets/medias/initSanityMedia.js';

function renderListTag(tag, index) {
  const parts = [];
  if (index > 0) {
    const dash = document.createElement('span');
    dash.className = 'text-foreground-muted';
    dash.textContent = '--';
    parts.push(dash);
  }
  const tagEl = document.createElement('span');
  tagEl.className = 'text-accent-sm uppercase';
  tagEl.textContent = `[${tag}]`;
  parts.push(tagEl);
  return parts;
}

function renderListItem(parentEl, item) {
  // motion.div: layoutId={item._id} layout transition={{ layout: { type: 'spring', ...springTransition } }}
  // TODO: 'motion.div' (framer-motion) shared-layout animation (layoutId) has
  // no DOM equivalent outside React -- requires a React island.
  const rootEl = document.createElement('div');
  rootEl.dataset.motionLayoutId = item._id;
  rootEl.dataset.motionTransition = JSON.stringify({ layout: { type: 'spring', ...springTransition } });

  const linkEl = document.createElement('a');
  linkEl.href = item.uri ?? '#';
  linkEl.className = 'group flex items-stretch';
  linkEl.setAttribute('data-cursor-text', 'VIEW PROJECT');

  const thumbEl = document.createElement('div');
  thumbEl.className = 'relative aspect-square w-80 shrink-0 overflow-hidden';
  let mediaInstance = null;
  if (item.mainImage) {
    mediaInstance = SanityMedia(thumbEl, {
      media: item.mainImage,
      className: 'h-full w-full object-cover',
      imageProps: { sizes: '80px', builderOptions: { sourceWidths: [160, 240] } },
    });
  }

  const bodyEl = document.createElement('div');
  bodyEl.className = 'flex min-w-0 flex-1 items-center justify-between gap-8 px-16 py-12';

  const titleEl = document.createElement('h3');
  titleEl.className = 'truncate text-accent';
  titleEl.textContent = item.title;
  bodyEl.appendChild(titleEl);

  if (item.tags && item.tags.length > 0) {
    const tagsEl = document.createElement('div');
    tagsEl.className = 'xs:flex hidden shrink-0 items-center gap-8 text-body text-foreground-muted';
    item.tags.forEach((tag, i) => renderListTag(tag, i).forEach((node) => tagsEl.appendChild(node)));
    bodyEl.appendChild(tagsEl);
  }

  linkEl.appendChild(thumbEl);
  linkEl.appendChild(bodyEl);
  rootEl.appendChild(linkEl);
  parentEl.appendChild(rootEl);
  return rootEl;
}

export function initList(parentEl, props = {}) {
  let { items = [], className } = props;

  const rootEl = document.createElement('div');
  rootEl.className = cx('grid-container', className);

  // AnimatePresence mode="popLayout"
  // TODO: 'AnimatePresence' (framer-motion) orchestrates exit animations via
  // React's render cycle; Vanilla JS output cannot invoke it directly.
  const listWrapEl = document.createElement('div');
  listWrapEl.className = 'divide-y divide-foreground/10';
  listWrapEl.dataset.motionAnimatePresence = 'popLayout';

  function render() {
    listWrapEl.innerHTML = '';
    items.forEach((item) => renderListItem(listWrapEl, item));
  }

  rootEl.appendChild(listWrapEl);
  parentEl.appendChild(rootEl);
  render();

  return {
    el: rootEl,
    update(nextProps) {
      Object.assign(props, nextProps);
      if ('items' in nextProps) items = nextProps.items;
      render();
    },
    destroy() {
      rootEl.remove();
    },
  };
}