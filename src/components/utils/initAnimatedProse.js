
import { animate, stagger } from '@motionone/dom';
import { cx } from '../../utils/cx.js';

export let animatedProseActive = false;

let hasEnteredViewport = false;
let linesReady = false;
let hasAnimated = false;

let containerEl = null;
let pollIntervalId = null;
let fallbackTimeoutId = null;
let activeAnimation = null;
let observer = null;
let resizeObserver = null;

let animConfig = { staggerDelay: 0.03, duration: 0.5, delay: 0 };

function splitIntoLines(el) {
  if (!el) return [];

  const originalHTML = el.innerHTML;
  const text = el.textContent || '';
  if (!text.trim()) return [];

  el.textContent = '';

  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const tempSpans = words.map((word, i) => {
    const span = document.createElement('span');
    span.textContent = word + (i < words.length - 1 ? '\u00A0' : '');
    span.style.display = 'inline-block';
    el.appendChild(span);
    return span;
  });

  let lineGroups = [];
  try {
    let currentTop = null;
    let currentGroup = [];
    tempSpans.forEach((span) => {
      const top = span.offsetTop;
      if (currentTop === null || Math.abs(top - currentTop) < 1) {
        currentGroup.push(span);
      } else {
        lineGroups.push(currentGroup);
        currentGroup = [span];
      }
      currentTop = top;
    });
    if (currentGroup.length) lineGroups.push(currentGroup);
  } catch (err) {

    el.innerHTML = originalHTML;
    return [];
  }

  if (lineGroups.length === 0) {
    el.innerHTML = originalHTML;
    return [];
  }

  el.textContent = '';
  const lineEls = lineGroups.map((group) => {
    const mask = document.createElement('div');
    mask.style.overflow = 'clip';
    mask.className = 'split-line-mask';

    const line = document.createElement('div');
    line.className = 'split-line';
    line.style.transform = 'translateY(100%)';
    line.style.willChange = 'transform';

    group.forEach((wordSpan) => line.appendChild(wordSpan));
    mask.appendChild(line);
    el.appendChild(mask);
    return line;
  });

  return lineEls;
}

function setHasEnteredViewport(value) {
  hasEnteredViewport = value;
  runLineRevealAnimation();
}

function setLinesReady(value) {
  linesReady = value;
  runLineRevealAnimation();
}

export function initAnimatedProse(parentEl, props = {}) {
  if (!parentEl) {
    console.warn('initAnimatedProse: parentEl is required');
    return null;
  }

  const {
    children,
    className,
    staggerDelay = 0.03,
    duration = 0.5,
    delay = 0,
    margin = '0px 0px -10% 0px',
  } = props;

  animConfig = { staggerDelay, duration, delay };

  containerEl = document.createElement('div');
  containerEl.className = cx(className, 'invisible');

  if (children != null) {
    (Array.isArray(children) ? children : [children]).forEach((child) => {
      if (child instanceof Node) {
        containerEl.appendChild(child);
      } else if (typeof child === 'string') {
        containerEl.appendChild(document.createTextNode(child));
      }
    });
  }

  parentEl.appendChild(containerEl);
  animatedProseActive = true;

  const lines = splitIntoLines(containerEl);

  if (lines.length === 0) {

    containerEl.classList.remove('invisible');
    return containerEl;
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setHasEnteredViewport(true);
          observer.disconnect();
        }
      });
    },
    { rootMargin: margin }
  );
  observer.observe(containerEl);

  const observeSplitLines = () => {
    const splitLines = containerEl?.querySelectorAll('.split-line');
    if (splitLines && splitLines.length > 0) {
      setLinesReady(true);
      return true;
    }
    return false;
  };

  if (!observeSplitLines()) {
    pollIntervalId = setInterval(() => {
      if (observeSplitLines()) clearInterval(pollIntervalId);
    }, 50);
    fallbackTimeoutId = setTimeout(() => {
      clearInterval(pollIntervalId);
      setLinesReady(true);
    }, 500);
  }

  return containerEl;
}

function runLineRevealAnimation() {
  if (!hasEnteredViewport || !linesReady || !containerEl || hasAnimated) return;

  const lines = containerEl.querySelectorAll('.split-line');
  if (lines.length === 0) return;

  hasAnimated = true;
  containerEl.querySelectorAll('.invisible').forEach((el) => {
    el.style.visibility = 'visible';
  });
  containerEl.classList.remove('invisible');

  try {
    activeAnimation = animate(
      Array.from(lines),
      { y: ['100%', '0%'] },
      {
        delay: stagger(animConfig.staggerDelay, { startDelay: animConfig.delay }),
        duration: animConfig.duration,
        easing: [0.33, 1, 0.68, 1],
      }
    );
  } catch (err) {
    
    console.warn('AnimatedProse: animation failed, showing content instantly', err);
    lines.forEach((line) => {
      line.style.transform = 'translateY(0%)';
    });
  }
}

export function destroyAnimatedProse() {
  if (pollIntervalId) clearInterval(pollIntervalId);
  if (fallbackTimeoutId) clearTimeout(fallbackTimeoutId);
  if (observer) observer.disconnect();
  if (resizeObserver) resizeObserver.disconnect();
  activeAnimation?.cancel?.();

  if (containerEl && containerEl.parentNode) {
    containerEl.parentNode.removeChild(containerEl);
  }

  containerEl = null;
  hasEnteredViewport = false;
  linesReady = false;
  hasAnimated = false;
  pollIntervalId = null;
  fallbackTimeoutId = null;
  activeAnimation = null;
  observer = null;
  resizeObserver = null;
  animatedProseActive = false;
}
