import { startTransition, usePageTransition } from '../hooks/usePageTransition.js';

function isModifiedOrNewTabClick(event) {
  const { nodeName } = event.currentTarget;
  if (nodeName.toUpperCase() !== 'A') return false;
  const target = event.currentTarget.getAttribute('target');
  return (
    (!!target && target !== '_self') ||
    !!event.metaKey ||
    !!event.ctrlKey ||
    !!event.shiftKey ||
    !!event.altKey ||
    (!!event.nativeEvent && event.nativeEvent.which === 2)
  );
}

function navigate(router, url, replace, scroll) {
  if (replace) {
    router.replace(url, { scroll: scroll ?? true });
  } else {
    router.push(url, { scroll: scroll ?? true });
  }
}

export function initLink(parentElement, { href, as, replace, scroll, onClick, router, ...attrs } = {}) {
  const target = as || href;
  const url = typeof target === 'string' ? target : target.toString();

  const anchor = document.createElement('a');
  Object.entries(attrs).forEach(([key, value]) => {
    if (value != null) anchor.setAttribute(key, value);
  });
  anchor.setAttribute('href', url);

  const handleClick = (event) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    const { isTransitioning } = usePageTransition();
    if (isTransitioning || isModifiedOrNewTabClick(event)) return;
    event.preventDefault();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      navigate(router, url, replace, scroll);
    } else {
      startTransition(() => navigate(router, url, replace, scroll));
    }
  };
  anchor.addEventListener('click', handleClick);

  parentElement?.appendChild(anchor);

  return function destroyLink() {
    anchor.removeEventListener('click', handleClick);
    anchor.remove();
  };
}
