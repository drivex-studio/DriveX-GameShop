// original component name: $ -> initThumbnails

import { cx } from '../../utils/cx.js';
import { easings } from '../../utils/easings.js';
import { SanityImage } from '../../assets/medias/SanityImage.js';

const backInOutSubtle = easings.backInOutSubtle;

export function initThumbnails(parentEl, props = {}) {
  const {
    items = [],
    currentIndex = 0,
    onSelect,
    rotationCount,
    gap = 16,
    className,
  } = props;

  if (items.length === 0) return null;

  const rootEl = document.createElement('div');
  rootEl.className = cx('relative flex flex-col items-center', className);

  const trackWrapperEl = document.createElement('div');
  trackWrapperEl.className = 'relative overflow-hidden';

  // motion.div: animate={{ x: currentIndex * itemStep }}, transition={{ duration: .8, ease: backInOutSubtle }}
  // TODO: 'motion.div' (framer-motion) requires a React render root; Vanilla JS
  // output cannot invoke it directly -- needs a React island or a GSAP-driven
  // replacement. Final x position is applied statically below (no tween).
  const indicatorEl = document.createElement('div');
  indicatorEl.className = 'pointer-events-none absolute top-0 z-10 h-full border border-foreground/30';
  indicatorEl.style.width = '80px';
  indicatorEl.dataset.motionAnimate = JSON.stringify({ x: null });
  indicatorEl.dataset.motionTransition = JSON.stringify({ duration: 0.8, ease: 'backInOutSubtle' });

  const rowEl = document.createElement('div');
  rowEl.className = 'flex items-center';
  rowEl.style.gap = `${gap}px`;

  trackWrapperEl.appendChild(indicatorEl);
  trackWrapperEl.appendChild(rowEl);

  const markerTrackEl = document.createElement('div');
  markerTrackEl.className = 'relative mt-8';

  // motion.div: animate={{ x: underlineX, rotate }}, transition={{ x: {...}, rotate: {...} }}
  // TODO: 'motion.div' (framer-motion) requires a React render root; Vanilla JS
  // output cannot invoke it directly -- needs a React island or a GSAP-driven
  // replacement. Final x/rotate applied statically below (no tween).
  const markerEl = document.createElement('div');
  markerEl.className = 'absolute top-0 h-8 w-8 bg-brand';
  markerTrackEl.appendChild(markerEl);

  rootEl.appendChild(trackWrapperEl);
  rootEl.appendChild(markerTrackEl);
  parentEl.appendChild(rootEl);

  function render() {
    const itemCount = items.length;
    const totalWidth = 80 * itemCount + (itemCount - 1) * gap;
    const itemStep = 80 + gap;
    const indicatorX = currentIndex * itemStep;
    const underlineX = currentIndex * itemStep + 40;

    indicatorEl.style.transform = `translateX(${indicatorX}px)`;
    indicatorEl.dataset.motionAnimate = JSON.stringify({ x: indicatorX });

    rowEl.innerHTML = '';
    items.forEach((item, index) => {
      const isCurrent = index === currentIndex;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'group';
      btn.setAttribute('aria-label', `Go to ${item.title ?? `slide ${index + 1}`}`);
      if (isCurrent) btn.setAttribute('aria-current', 'true');
      btn.addEventListener('click', () => onSelect?.(index));

      const thumbWrapper = document.createElement('div');
      thumbWrapper.className = cx(
        'relative aspect-[16/9] w-80 overflow-hidden transition-opacity duration-300',
        isCurrent ? 'opacity-100' : 'opacity-40 group-hover:opacity-70'
      );

      if (item.mainImage?.image) {
        // SOURCE NOT PRESENT: SanityImage's real implementation is not in the input.
        const imgEl = SanityImage({
          image: item.mainImage.image,
          alt: item.title ?? '',
          className: 'h-full w-full object-cover',
        });
        if (imgEl) thumbWrapper.appendChild(imgEl);
      }

      btn.appendChild(thumbWrapper);
      rowEl.appendChild(btn);
    });

    markerTrackEl.style.width = `${totalWidth}px`;
    const markerX = underlineX - 4;
    const markerRotate = 90 * (rotationCount === undefined ? 0 : rotationCount);
    markerEl.style.transform = `translateX(${markerX}px) rotate(${markerRotate}deg)`;
    markerEl.dataset.motionAnimate = JSON.stringify({ x: markerX, rotate: markerRotate });
  }

  render();

  return {
    el: rootEl,
    update(nextProps) {
      Object.assign(props, nextProps);
      render();
    },
  };
}