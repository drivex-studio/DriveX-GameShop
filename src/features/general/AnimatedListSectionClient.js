
import { gsap } from '../../vendor.js';
import { ScrollTrigger } from '../../vendor.js';

import { subscribeMotionValue } from '../../lib/motionValueEvents.js';

import { getLenis } from '../../lib/lenisState.js';

import { initSanityMedia } from '../../assets/medias/initSanityMedia.js';
import { SanityImage as initSanityImage } from '../../assets/medias/SanityImage.js';

import { initScrollAnimatedHeadline } from '../ScrollAnimatedHeadline.js';
import { cx } from '../../utils/cx.js';
import { useIdleGSAP } from '../../hooks/useIdleGSAP.js';

const EASE = 'power3.inOut';
const INDICATOR_EASE = 'back.inOut(1.4)';
const SCROLL_EASE = (e) => 1 - (1 - e) ** 3; 
const HOLD = 1 / 6;

function progressToIndex(progress, count) {
  if (count <= 1) return 0;
  if (progress < HOLD) return 0;
  const remaining = (progress - HOLD) / (1 - HOLD);
  return Math.min(count - 1, Math.floor(remaining * (count - 1)) + 1);
}

export function initAnimatedListSectionClient(parentElement, {
  headline,
  label,
  text,
  items = [],
  variant = 'standard',
  headlineDisplay,
  fixedMedia,
} = {}) {

  let parent = parentElement;
  if (typeof parent === 'string') parent = document.querySelector(parent);
  if (parent && typeof parent.length === 'number' && parent[0]) parent = parent[0];

  const sectionEl = document.createElement('div');
  sectionEl.className = cx('grid-container');

  const desktopEl = buildDesktopLayout({ headline, label, text, items, isImageLeft: variant === 'imageLeft', headlineDisplay, fixedMedia });
  const mobileEl = buildMobileLayout({ headline, label, text, items, isImageLeft: variant === 'imageLeft', headlineDisplay, fixedMedia });

  sectionEl.appendChild(desktopEl.element);
  sectionEl.appendChild(mobileEl.element);

  if (parent && typeof parent.appendChild === 'function') {
    parent.appendChild(sectionEl);
  } else {
    console.warn('initAnimatedListSectionClient: invalid parentElement, returning element for caller to append', parent);
  }

  desktopEl.mount();
  mobileEl.mount();

  const idleGsapCleanup = useIdleGSAP(() => ScrollTrigger.refresh(), { scope: sectionEl });

  function destroy() {
    if (typeof idleGsapCleanup === 'function') idleGsapCleanup();
    desktopEl.destroy();
    mobileEl.destroy();
    if (sectionEl.parentNode) sectionEl.parentNode.removeChild(sectionEl);
  }

  return { element: sectionEl, destroy, mount: () => { desktopEl.mount(); mobileEl.mount(); } };
}

function buildHeadlineBlock({ headline, label, text, headlineDisplay, className }) {
  const wrapEl = document.createElement('div');
  if (className) wrapEl.className = className;

  let headlineInstance = null;

  if (headline?.text) {
    
    headlineInstance = initScrollAnimatedHeadline({
      headline: { text: headline.text, level: headline.level ?? 'h2' },
      displayAs: headlineDisplay ?? headline.level ?? 'h2',
    });
    if (headlineInstance?.element) wrapEl.appendChild(headlineInstance.element);
  }

  if (text) {
    const textEl = document.createElement('p');
    textEl.className = 'mt-16 text-body text-foreground-muted';
    textEl.textContent = text;
    wrapEl.appendChild(textEl);
  }
  if (label) {
    const labelEl = document.createElement('span');
    labelEl.className = 'section-label mt-16 block';
    labelEl.textContent = label;
    wrapEl.appendChild(labelEl);
  }

  return {
    element: wrapEl,
    mount() {
      if (headlineInstance && typeof headlineInstance.mount === 'function') headlineInstance.mount();
    },
    destroy() {
      if (headlineInstance && typeof headlineInstance.destroy === 'function') headlineInstance.destroy();
    },
  };
}

function buildListItems(items, { onSelect }) {
  const listWrapEl = document.createElement('div');
  listWrapEl.className = 'relative space-y-48';

  const indicatorEl = document.createElement('div');
  indicatorEl.className = 'absolute top-8 left-[28px] z-10 h-12 w-12 bg-brand';
  listWrapEl.appendChild(indicatorEl);

  const itemEls = items.map((item, index) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'flex cursor-pointer items-start gap-16 pl-16';
    itemEl.dataset.active = 'false';
    itemEl.addEventListener('click', () => onSelect(index));

    const indexEl = document.createElement('span');
    indexEl.className = 'mt-4 font-mono text-body text-foreground-muted';
    indexEl.textContent = String(index + 1).padStart(2, '0');

    const bodyEl = document.createElement('div');
    bodyEl.className = 'flex-1';

    const itemHeadlineEl = document.createElement('h3');
    itemHeadlineEl.className = 'mb-8 text-h4';
    itemHeadlineEl.textContent = item.headline ?? '';

    const itemTextEl = document.createElement('p');
    itemTextEl.className = 'text-body text-foreground-muted';
    itemTextEl.textContent = item.text ?? '';

    bodyEl.appendChild(itemHeadlineEl);
    bodyEl.appendChild(itemTextEl);
    itemEl.appendChild(indexEl);
    itemEl.appendChild(bodyEl);
    listWrapEl.appendChild(itemEl);
    return itemEl;
  });

  return { element: listWrapEl, indicatorEl, itemEls };
}

function buildDesktopLayout({ headline, label, text, items, isImageLeft, headlineDisplay, fixedMedia }) {
  const wrapperEl = document.createElement('div');
  wrapperEl.className = 'relative hidden min-h-[320vh] py-64 lg:block lg:py-128';

  const stickyEl = document.createElement('div');
  stickyEl.className = 'sticky top-0 flex h-screen items-center';

  const gridEl = document.createElement('div');
  gridEl.className = 'grid-container';
  const gridLayoutEl = document.createElement('div');
  gridLayoutEl.className = 'grid-layout';

  const { element: listEl, indicatorEl, itemEls } = buildListItems(items, { onSelect: scrollToIndex });

  let cleanupFns = [];
  let mediaEls = [];
  let mediaStackEl = null;
  let mountFns = [];

  if (isImageLeft) {
    const leftColEl = document.createElement('div');
    leftColEl.className = 'lg:grid-start-2 lg:grid-span-4 flex flex-col justify-between gap-32';
    const headlineBlock = buildHeadlineBlock({ headline, label, text, headlineDisplay });
    leftColEl.appendChild(headlineBlock.element);
    cleanupFns.push(headlineBlock.destroy);
    mountFns.push(headlineBlock.mount);

    if (fixedMedia) {
      const mediaWrapEl = document.createElement('div');
      mediaWrapEl.className = 'overflow-hidden';
      mediaWrapEl.style.aspectRatio = fixedMedia.aspectRatio ?? '4/5';
      const mediaHandle = (typeof initSanityMedia === 'function') ? initSanityMedia(mediaWrapEl, {
        media: fixedMedia,
        className: 'h-full w-full object-cover',
      }) : null;
      if (mediaHandle?.destroy) cleanupFns.push(mediaHandle.destroy);
      leftColEl.appendChild(mediaWrapEl);
    }

    const listColEl = document.createElement('div');
    listColEl.className = 'lg:grid-start-7 lg:grid-span-5 flex flex-col justify-center';
    listColEl.appendChild(listEl);

    gridLayoutEl.appendChild(leftColEl);
    gridLayoutEl.appendChild(listColEl);
  } else {
    const topRowEl = document.createElement('div');
    topRowEl.className = 'grid-span-8 mb-64 flex items-end justify-between';
    const headlineBlock = buildHeadlineBlock({ headline, label: null, text, headlineDisplay });
    topRowEl.appendChild(headlineBlock.element);
    cleanupFns.push(headlineBlock.destroy);
    mountFns.push(headlineBlock.mount);
    if (label) {
      const labelEl = document.createElement('span');
      labelEl.className = 'section-label';
      labelEl.textContent = label;
      topRowEl.appendChild(labelEl);
    }

    const bottomRowEl = document.createElement('div');
    bottomRowEl.className = 'grid-span-8 flex';

    const listColEl = document.createElement('div');
    listColEl.className = 'flex flex-col justify-center lg:flex-[1.1] lg:pr-[10%]';
    listColEl.appendChild(listEl);

    const mediaColEl = document.createElement('div');
    mediaColEl.className = 'relative aspect-[4/5] flex-1 overflow-hidden';
    mediaStackEl = document.createElement('div');
    mediaStackEl.className = 'flex h-full flex-col';

    items.forEach((item) => {
      const mediaItemEl = document.createElement('div');
      mediaItemEl.className = 'h-full w-full flex-shrink-0';
      if (item.image) {
        const createImage = typeof initSanityImage === 'function' ? initSanityImage : initSanityMedia;
        
        const mediaHandle = createImage ? createImage(mediaItemEl, {
          image: item.image,
          alt: item.alt ?? item.headline ?? '',
          className: 'h-full w-full object-cover',
          priority: true,
        }) : null;
        if (mediaHandle?.destroy) cleanupFns.push(mediaHandle.destroy);
      }
      mediaStackEl.appendChild(mediaItemEl);
      mediaEls.push(mediaItemEl);
    });

    mediaColEl.appendChild(mediaStackEl);
    bottomRowEl.appendChild(listColEl);
    bottomRowEl.appendChild(mediaColEl);

    gridLayoutEl.appendChild(topRowEl);
    gridLayoutEl.appendChild(bottomRowEl);
  }

  gridEl.appendChild(gridLayoutEl);
  stickyEl.appendChild(gridEl);
  wrapperEl.appendChild(stickyEl);

  let activeIndex = -1;
  let indicatorRotation = 0;
  let scrollTrigger = null;

  function setActive(index, immediate = false) {
    if (index === activeIndex) return;
    activeIndex = index;

    itemEls.forEach((itemEl, i) => {
      const isActive = i === index;
      itemEl.dataset.active = String(isActive);
      gsap.to(itemEl, {
        opacity: isActive ? 1 : 0.4,
        x: isActive ? 48 : 0,
        duration: immediate ? 0 : 0.8,
        ease: EASE,
      });
    });

    const indicatorRect = itemEls[index]?.getBoundingClientRect();
    const firstRect = itemEls[0]?.getBoundingClientRect();
    if (indicatorRect && firstRect) {
      indicatorRotation++;
      gsap.to(indicatorEl, {
        y: indicatorRect.top - firstRect.top,
        rotate: 90 * indicatorRotation,
        duration: immediate ? 0 : 0.8,
        ease: INDICATOR_EASE,
      });
    }

    if (!isImageLeft && mediaEls.length) {
      gsap.to(mediaStackEl, {
        yPercent: -100 * index,
        duration: immediate ? 0 : 0.8,
        ease: EASE,
      });
    }
  }

  function scrollToIndex(index) {
    const lenis = getLenis();
    if (!lenis || !scrollTrigger) return;
    const count = items.length;
    let progress;
    if (count <= 1) {
      progress = 0.5;
    } else if (index === 0) {
      progress = HOLD / 2;
    } else {
      const bandWidth = (1 - HOLD) / (count - 1);
      progress = HOLD + (index - 1) * bandWidth + bandWidth / 2;
    }
    const target = scrollTrigger.start + progress * (scrollTrigger.end - scrollTrigger.start);
    lenis.scrollTo(target, { duration: 0.2, easing: SCROLL_EASE });
  }

  scrollTrigger = ScrollTrigger.create({
    trigger: wrapperEl,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate(self) {
      const count = items.length;
      if (!count) return;
      setActive(progressToIndex(self.progress, count));
    },
  });

  setActive(0, true);

  return {
    element: wrapperEl,
    mount() {
      mountFns.forEach((fn) => fn && fn());
    },
    destroy() {
      scrollTrigger?.kill();
      cleanupFns.forEach((fn) => fn && fn());
    },
  };
}

function buildMobileLayout({ headline, label, text, items, isImageLeft, headlineDisplay, fixedMedia }) {
  const wrapperEl = document.createElement('div');
  wrapperEl.className = 'grid-container py-64 lg:hidden';

  const headlineBlock = buildHeadlineBlock({ headline, label, text, headlineDisplay, className: 'mb-32' });
  wrapperEl.appendChild(headlineBlock.element);

  const mediaCleanupFns = [headlineBlock.destroy];

  if (isImageLeft && fixedMedia) {
    const mediaWrapEl = document.createElement('div');
    mediaWrapEl.className = 'mb-48 overflow-hidden';
    mediaWrapEl.style.aspectRatio = fixedMedia.aspectRatio ?? '4/5';
    const mediaHandle = (typeof initSanityMedia === 'function') ? initSanityMedia(mediaWrapEl, { media: fixedMedia, className: 'h-full w-full object-cover' }) : null;
    if (mediaHandle?.destroy) mediaCleanupFns.push(mediaHandle.destroy);
    wrapperEl.appendChild(mediaWrapEl);
  }

  const listEl = document.createElement('div');
  listEl.className = 'space-y-48';

  items.forEach((item, index) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'space-y-16';

    const rowEl = document.createElement('div');
    rowEl.className = 'flex gap-16';

    const markerEl = document.createElement('div');
    markerEl.className = 'flex items-start gap-12';
    const dotEl = document.createElement('div');
    dotEl.className = 'mt-8 h-12 w-12 bg-brand';
    const indexEl = document.createElement('span');
    indexEl.className = 'mt-4 font-mono text-body-sm text-foreground-muted';
    indexEl.textContent = String(index + 1).padStart(2, '0');
    markerEl.appendChild(dotEl);
    markerEl.appendChild(indexEl);

    const bodyEl = document.createElement('div');
    bodyEl.className = 'flex-1';
    const itemHeadlineEl = document.createElement('h3');
    itemHeadlineEl.className = 'mb-8 text-h4';
    itemHeadlineEl.textContent = item.headline ?? '';
    const itemTextEl = document.createElement('p');
    itemTextEl.className = 'text-body text-foreground-muted';
    itemTextEl.textContent = item.text ?? '';
    bodyEl.appendChild(itemHeadlineEl);
    bodyEl.appendChild(itemTextEl);

    rowEl.appendChild(markerEl);
    rowEl.appendChild(bodyEl);
    itemEl.appendChild(rowEl);

    if (!isImageLeft && item.image) {
      const imageWrapEl = document.createElement('div');
      imageWrapEl.className = 'aspect-[4/5] overflow-hidden';
      const createImage = typeof initSanityImage === 'function' ? initSanityImage : initSanityMedia;
      const mediaHandle = createImage ? createImage(imageWrapEl, {
        image: item.image,
        alt: item.alt ?? item.headline ?? '',
        className: 'h-full w-full object-cover',
      }) : null;
      if (mediaHandle?.destroy) mediaCleanupFns.push(mediaHandle.destroy);
      itemEl.appendChild(imageWrapEl);
    }

    listEl.appendChild(itemEl);
  });

  wrapperEl.appendChild(listEl);

  return {
    element: wrapperEl,
    mount() {
      headlineBlock.mount();
    },
    destroy() {
      mediaCleanupFns.forEach((fn) => fn && fn());
    },
  };
}
