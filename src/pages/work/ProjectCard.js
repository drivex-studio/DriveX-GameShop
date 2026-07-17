// original component name: _ -> initProjectCard

import { initSanityMedia as SanityMedia } from '../../assets/medias/initSanityMedia.js';

import { initScrambleText as ScrambleText } from '../../utils/ScrambleText.js';

import { springTransition } from './springTransition.js';

function renderCardTag(tag, index) {
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

export function initProjectCard(parentEl, props = {}) {
  const { _id, title, uri, tags, mainImage, className } = props;

  const scrambleTriggerRef = { current: null };

  // motion.div: layoutId={_id} layout transition={{ layout: { type: 'spring', ...springTransition } }}
  // TODO: 'motion.div' (framer-motion) shared-layout animation (layoutId) has
  // no DOM equivalent outside React -- requires a React island. Config
  // preserved below for a future React-island or GSAP FLIP based revival.
  const rootEl = document.createElement('div');
  if (className) rootEl.className = className;
  rootEl.dataset.motionLayoutId = _id;
  rootEl.dataset.motionTransition = JSON.stringify({ layout: { type: 'spring', ...springTransition } });

  const href = uri ?? '#';

  function handleMouseEnter() {
    scrambleTriggerRef.current?.();
  }

  const linkEl = document.createElement('a');
  linkEl.href = href;
  linkEl.className = 'group block';
  linkEl.setAttribute('data-cursor-text', 'VIEW PROJECT');
  linkEl.addEventListener('mouseenter', handleMouseEnter);

  const imageOuterEl = document.createElement('div');
  imageOuterEl.className = 'relative w-full overflow-hidden';
  imageOuterEl.style.paddingBottom = '66.67%';
  const imageInnerEl = document.createElement('div');
  imageInnerEl.className = 'absolute inset-0';
  imageOuterEl.appendChild(imageInnerEl);

  let mediaInstance = null;
  if (mainImage) {
    mediaInstance = SanityMedia(imageInnerEl, {
      media: mainImage,
      className: 'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105',
      imageProps: {
        sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
        builderOptions: { sourceWidths: [400, 600, 800, 1000, 1200, 1400] },
      },
    });
  }

  const metaRowEl = document.createElement('div');
  metaRowEl.className = 'mt-16 flex items-start justify-between gap-16';

  const titleEl = document.createElement('h3');
  titleEl.className = 'text-accent';
  metaRowEl.appendChild(titleEl);

  ScrambleText(titleEl, {
    duration: 0.5,
    onReady: (fn) => {
      scrambleTriggerRef.current = fn;
    },
    children: title,
  });

  if (tags && tags.length > 0) {
    const tagsEl = document.createElement('div');
    tagsEl.className = 'flex items-center gap-8 text-body text-foreground-muted';
    tags.forEach((tag, i) => renderCardTag(tag, i).forEach((node) => tagsEl.appendChild(node)));
    metaRowEl.appendChild(tagsEl);
  }

  linkEl.appendChild(imageOuterEl);
  linkEl.appendChild(metaRowEl);
  rootEl.appendChild(linkEl);
  parentEl.appendChild(rootEl);

  return {
    el: rootEl,
    destroy() {
      linkEl.removeEventListener('mouseenter', handleMouseEnter);
      mediaInstance?.destroy?.();
      rootEl.remove();
    },
  };
}