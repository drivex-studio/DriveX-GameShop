// original component name: F -> initSlider
// Renamed from mangled source identifiers:
// s -> containerEl, l -> dragTargetEl, c -> draggableInstancesRef,
// d -> dragStartXRef, u -> scrambleTriggersRef, g -> hasPlayedInitialScrambleRef,
// m/x -> dims/setDims, v -> isDraggingRef, y -> hasDraggedRef,
// w -> dragDistanceRef, b -> itemCount, k -> displayX, j -> springX,
// N -> lastIndexRef, T -> dimsRef, _ -> extendedItems, S -> cloneOffset,
// C -> totalWidth, E -> normalizeIndex, M -> goToPosition, P -> goToNext,
// R -> goToPrev, O -> goToSlide, Y -> registerScramble, B -> hasItems
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { cx } from '../../utils/cx.js';
import { easings } from '../../utils/easings.js';
import { SanityMedia, Link } from '../shared.js';

gsap.registerPlugin(Draggable, InertiaPlugin);

const power4InOut = easings.power4InOut;

// ---- framer-motion replacements ----
// The original component used framer-motion's `motionValue`/`animate`, which
// isn't available in this vanilla build (not in the importmap, no React
// render root to host it). These are minimal drop-in replacements: a
// motionValue is just a observable box with get/set/on('change', cb), and
// animate() tweens it using GSAP (already a project dependency) so the
// power4InOut cubic-bezier from easings.js keeps working unchanged.
function createMotionValue(initial = 0) {
  let current = initial;
  const listeners = new Set();
  return {
    get: () => current,
    set(next) {
      current = next;
      listeners.forEach((fn) => fn(current));
    },
    on(event, cb) {
      if (event !== 'change') return () => {};
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
  };
}

function cubicBezier(x1, y1, x2, y2) {
  // Standard cubic-bezier(t) solver (same curve family CSS/framer-motion use).
  const cx_ = 3 * x1, bx_ = 3 * (x2 - x1) - cx_, ax_ = 1 - cx_ - bx_;
  const cy_ = 3 * y1, by_ = 3 * (y2 - y1) - cy_, ay_ = 1 - cy_ - by_;
  const sampleX = (t) => ((ax_ * t + bx_) * t + cx_) * t;
  const sampleY = (t) => ((ay_ * t + by_) * t + cy_) * t;
  const sampleDerivX = (t) => (3 * ax_ * t + 2 * bx_) * t + cx_;
  return function solve(x) {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const dx = sampleX(t) - x;
      const d = sampleDerivX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= dx / d;
    }
    return sampleY(t);
  };
}

function animateValue(motionVal, target, { duration = 0.8, ease } = {}) {
  const easeFn = Array.isArray(ease) ? cubicBezier(...ease) : (t) => cubicBezier(0.83, 0, 0.17, 1)(t);
  const proxy = { v: motionVal.get() };
  return gsap.to(proxy, {
    v: target,
    duration,
    ease: easeFn,
    onUpdate() {
      motionVal.set(proxy.v);
    },
  });
}

export function initSlider(parentEl, props = {}) {
  let { items = [], onIndexChange, className, scrambleKey } = props;

  const containerEl = document.createElement('div');
  containerEl.className = 'relative cursor-grab touch-pan-y overflow-x-clip active:cursor-grabbing';

  const dragTargetEl = document.createElement('div');
  dragTargetEl.className = 'pointer-events-none invisible absolute';
  dragTargetEl.style.width = '1px';
  dragTargetEl.style.height = '1px';

  const rootEl = document.createElement('div');
  rootEl.className = cx('relative', className);
  rootEl.appendChild(dragTargetEl);
  rootEl.appendChild(containerEl);
  parentEl.appendChild(rootEl);

  const draggableInstancesRef = { current: null };
  const dragStartXRef = { current: 0 };
  const scrambleTriggersRef = { current: new Map() };
  const isDraggingRef = { current: false };
  const hasDraggedRef = { current: false };
  const dragDistanceRef = { current: 0 };
  const lastIndexRef = { current: 0 };

  let dims = { containerWidth: 0, slideWidth: 0, wrapWidth: 0, centerOffset: 0 };
  let itemCount = items.length;
  let extendedItems = [];
  let cloneOffset = 0;
  let totalWidth = 0;
  let slideInstances = [];

  const displayX = createMotionValue(0);
  const springX = createMotionValue(0);

  function normalizeIndex(i) {
    return ((i % itemCount) + itemCount) % itemCount;
  }

  function computeExtended() {
    if (itemCount === 0) {
      extendedItems = [];
      cloneOffset = 0;
      return;
    }
    extendedItems = [
      ...items.map((item, i) => ({ ...item, _id: `clone-before-${item._id}`, originalIndex: i, isClone: true })),
      ...items.map((item, i) => ({ ...item, originalIndex: i, isClone: false })),
      ...items.map((item, i) => ({ ...item, _id: `clone-after-${item._id}`, originalIndex: i, isClone: true })),
    ];
    cloneOffset = itemCount;
  }
  computeExtended();

  function goToPosition(x) {
    displayX.set(x);
    animateValue(springX, x, { duration: 0.8, ease: power4InOut });
    if (dragTargetEl) gsap.set(dragTargetEl, { x });
  }

  function goToNext() {
    if (isDraggingRef.current || itemCount === 0 || dims.wrapWidth === 0) return;
    goToPosition(displayX.get() - dims.wrapWidth);
  }

  function goToPrev() {
    if (isDraggingRef.current || itemCount === 0 || dims.wrapWidth === 0) return;
    goToPosition(displayX.get() + dims.wrapWidth);
  }

  function goToSlide(targetIndex) {
    if (isDraggingRef.current || itemCount === 0 || dims.wrapWidth === 0) return;
    const target = ((targetIndex % itemCount) + itemCount) % itemCount;
    const currentX = displayX.get();
    let diff = (target - normalizeIndex(Math.round(-currentX / dims.wrapWidth)) + itemCount) % itemCount;
    if (diff === 0) diff = itemCount;
    goToPosition(currentX - diff * dims.wrapWidth);
  }

  function registerScramble(index, fn) {
    scrambleTriggersRef.current.set(index, fn);
  }

  // useEffect(() => { ...run scramble reveal sequence... }, [scrambleKey])
  let scrambleTimeout = null;
  function runScrambleReveal() {
    if (scrambleTimeout) clearTimeout(scrambleTimeout);
    if (scrambleKey === undefined) return;
    scrambleTimeout = setTimeout(() => {
      Array.from(scrambleTriggersRef.current.values()).forEach((fn, i) => {
        setTimeout(() => fn(), 80 * i);
      });
    }, 100);
  }

  // useEffect(() => { ...ResizeObserver on containerEl... }, [])
  const resizeObserver = new ResizeObserver(([entry]) => {
    if (!entry) return;
    const width = entry.contentRect.width;
    if (width === 0) return;
    const perView = window.matchMedia('(max-width: 767px)').matches ? 1.1 : 2;
    const slideWidth = (width - 16 * (Math.ceil(perView) - 1)) / perView;
    setDims({
      containerWidth: width,
      slideWidth,
      wrapWidth: slideWidth + 16,
      centerOffset: (width - slideWidth) / 2,
    });
  });
  resizeObserver.observe(containerEl);

  // useMotionValueEvent(springX, 'change', ...)
  const unsubscribeSpringChange = springX.on('change', (value) => {
    if (dims.wrapWidth === 0) return;
    const nextIndex = normalizeIndex(Math.round(-value / dims.wrapWidth));
    if (nextIndex !== lastIndexRef.current) {
      lastIndexRef.current = nextIndex;
      onIndexChange?.(nextIndex);
    }
  });

  function handleKeyDown(e) {
    if (e.key === 'ArrowLeft') goToPrev();
    else if (e.key === 'ArrowRight') goToNext();
  }
  window.addEventListener('keydown', handleKeyDown);

  let gsapContext = null;

  function setupDraggable() {
    if (!dragTargetEl || !containerEl || dims.wrapWidth === 0) return;
    if (gsapContext) gsapContext.revert();

    gsapContext = gsap.context(() => {
      const wrapWidth = dims.wrapWidth;
      if (draggableInstancesRef.current) {
        draggableInstancesRef.current.forEach((instance) => instance.kill());
        draggableInstancesRef.current = null;
      }
      const currentX = displayX.get();
      gsap.set(dragTargetEl, { x: currentX });

      draggableInstancesRef.current = Draggable.create(dragTargetEl, {
        type: 'x',
        trigger: containerEl,
        inertia: true,
        throwResistance: 1500,
        maxDuration: 1,
        minDuration: 0.2,
        overshootTolerance: 0,
        snap: { x: (x) => Math.round(x / wrapWidth) * wrapWidth },
        onPress() {
          hasDraggedRef.current = false;
          dragDistanceRef.current = 0;
        },
        onDragStart() {
          isDraggingRef.current = true;
          hasDraggedRef.current = false;
          dragStartXRef.current = this.x;
          dragDistanceRef.current = 0;
        },
        onDrag() {
          const dist = Math.abs(this.x - dragStartXRef.current);
          dragDistanceRef.current = dist;
          if (dist > 10) hasDraggedRef.current = true;
          displayX.set(this.x);
          springX.set(this.x);
        },
        onThrowUpdate() {
          displayX.set(this.x);
          springX.set(this.x);
        },
        onDragEnd() {
          if (this.tween === undefined) {
            setTimeout(() => {
              isDraggingRef.current = false;
              setTimeout(() => {
                hasDraggedRef.current = false;
              }, 100);
            }, 10);
          }
        },
        onThrowComplete() {
          displayX.set(this.x);
          springX.set(this.x);
          isDraggingRef.current = false;
          setTimeout(() => {
            hasDraggedRef.current = false;
          }, 100);
        },
      });
      if (draggableInstancesRef.current[0]) draggableInstancesRef.current[0].update();
    }, containerEl);
  }

  function destroySlides() {
    slideInstances.forEach((instance) => instance?.destroy());
    slideInstances = [];
  }

  function render() {
    itemCount = items.length;
    computeExtended();
    totalWidth = extendedItems.length * dims.wrapWidth;

    containerEl.innerHTML = '';
    destroySlides();

    const hasItems = itemCount > 0 && dims.containerWidth > 0;
    if (!hasItems) return;

    const spacerEl = document.createElement('div');
    spacerEl.className = 'pointer-events-none invisible';
    spacerEl.style.width = `${dims.slideWidth}px`;
    const spacerInner = document.createElement('div');
    spacerInner.className = 'relative w-full';
    spacerInner.style.paddingBottom = '66.67%';
    const spacerGap = document.createElement('div');
    spacerGap.className = 'mt-16 h-24';
    spacerEl.appendChild(spacerInner);
    spacerEl.appendChild(spacerGap);
    containerEl.appendChild(spacerEl);

    extendedItems.forEach((item, i) => {
      const slideInstance = initSlide(containerEl, {
        item,
        index: i,
        springX,
        slideWidth: dims.slideWidth,
        wrapWidth: dims.wrapWidth,
        centerOffset: dims.centerOffset,
        totalWidth,
        containerWidth: dims.containerWidth,
        onRegisterScramble: registerScramble,
        isDraggingRef,
        hasDraggedRef,
      });
      slideInstances.push(slideInstance);
    });
  }

  function setDims(nextDims) {
    dims = nextDims;
    // useEffect(() => { resets to -cloneOffset*wrapWidth }, [cloneOffset, dims.wrapWidth])
    if (dims.wrapWidth !== 0) {
      const resetX = -cloneOffset * dims.wrapWidth;
      displayX.set(resetX);
      springX.set(resetX);
      if (dragTargetEl) gsap.set(dragTargetEl, { x: resetX });
    }
    render();
    setupDraggable();
  }

  render();
  runScrambleReveal();

  return {
    el: rootEl,
    goToSlide,
    goToNext,
    goToPrev,
    update(nextProps) {
      Object.assign(props, nextProps);
      if ('items' in nextProps) items = nextProps.items;
      if ('scrambleKey' in nextProps) runScrambleReveal();
      render();
    },
    destroy() {
      resizeObserver.disconnect();
      unsubscribeSpringChange();
      window.removeEventListener('keydown', handleKeyDown);
      if (scrambleTimeout) clearTimeout(scrambleTimeout);
      if (draggableInstancesRef.current) {
        draggableInstancesRef.current.forEach((instance) => instance.kill());
      }
      if (gsapContext) gsapContext.revert();
      destroySlides();
      rootEl.remove();
    },
  };
}

// ---- Single slide item ----
// Renders one case study inside the infinite draggable track. Position is
// not driven by moving a track element; each slide computes its own
// translateX from its index plus the shared springX position, which is how
// the extended clone-before/clone-after arrays produce the infinite-loop
// illusion.
export function initSlide(parentEl, props = {}) {
  const {
    item,
    index,
    springX,
    slideWidth,
    wrapWidth,
    centerOffset,
    totalWidth,
    containerWidth,
    onRegisterScramble,
    isDraggingRef,
    hasDraggedRef,
  } = props;

  const rootEl = document.createElement('div');
  rootEl.className = 'absolute top-0 left-0 will-change-transform';
  rootEl.style.width = `${slideWidth}px`;

  function applyPosition(xValue) {
    const x = index * wrapWidth + xValue + centerOffset;
    rootEl.style.transform = `translate3d(${x}px, 0, 0)`;
  }
  applyPosition(springX.get());
  const unsubscribe = springX.on('change', applyPosition);

  const href = item?.uri ?? '#';
  const linkEl = document.createElement('a');
  linkEl.href = href;
  linkEl.className = 'group block';
  linkEl.setAttribute('data-cursor-text', 'VIEW PROJECT');

  // A drag gesture ending on top of a slide shouldn't trigger navigation.
  function handleClick(event) {
    if (hasDraggedRef?.current || isDraggingRef?.current) {
      event.preventDefault();
    }
  }
  linkEl.addEventListener('click', handleClick);

  const imageOuterEl = document.createElement('div');
  imageOuterEl.className = 'relative w-full overflow-hidden';
  imageOuterEl.style.paddingBottom = '66.67%';
  const imageInnerEl = document.createElement('div');
  imageInnerEl.className = 'absolute inset-0';
  imageOuterEl.appendChild(imageInnerEl);

  let mediaEl = null;
  if (item?.mainImage) {
    mediaEl = SanityMedia({
      media: item.mainImage,
      className: 'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105',
      imageProps: {
        sizes: '(max-width: 767px) 90vw, 50vw',
        builderOptions: { sourceWidths: [400, 600, 800, 1000, 1200, 1400] },
      },
    });
    if (mediaEl) imageInnerEl.appendChild(mediaEl);
  }

  const metaRowEl = document.createElement('div');
  metaRowEl.className = 'mt-16 flex items-start justify-between gap-16';

  const titleEl = document.createElement('h3');
  titleEl.className = 'text-accent';
  titleEl.textContent = item?.title ?? '';
  titleEl.style.opacity = '0';
  metaRowEl.appendChild(titleEl);

  if (item?.tags && item.tags.length > 0) {
    const tagsEl = document.createElement('div');
    tagsEl.className = 'flex items-center gap-8 text-body text-foreground-muted';
    item.tags.forEach((tag, i) => {
      if (i > 0) {
        const dash = document.createElement('span');
        dash.className = 'text-foreground-muted';
        dash.textContent = '--';
        tagsEl.appendChild(dash);
      }
      const tagEl = document.createElement('span');
      tagEl.className = 'text-accent-sm uppercase';
      tagEl.textContent = `[${tag}]`;
      tagsEl.appendChild(tagEl);
    });
    metaRowEl.appendChild(tagsEl);
  }

  linkEl.appendChild(imageOuterEl);
  linkEl.appendChild(metaRowEl);
  rootEl.appendChild(linkEl);
  parentEl.appendChild(rootEl);

  // The slider calls this once per slide, then fires all of them staggered
  // on mount/scrambleKey change (see runScrambleReveal in initSlider above).
  // No ScrambleText util is wired in yet, so this is a plain fade-in reveal.
  function reveal() {
    gsap.to(titleEl, { opacity: 1, duration: 0.4, ease: 'power1.out' });
  }
  onRegisterScramble?.(index, reveal);

  return {
    el: rootEl,
    destroy() {
      unsubscribe();
      linkEl.removeEventListener('click', handleClick);
      rootEl.remove();
    },
  };
}