// original component name: C -> initDuoGrid

import { cx } from '../../utils/cx.js';
import { initProjectCard } from './ProjectCard.js';

export function initDuoGrid(parentEl, props = {}) {
  let { items = [], className } = props;

  const rootEl = document.createElement('div');
  rootEl.className = cx('grid-container', className);

  // AnimatePresence mode="popLayout"
  // TODO: 'AnimatePresence' (framer-motion) orchestrates exit animations via
  // React's render cycle; Vanilla JS output cannot invoke it directly. Items
  // are appended/removed immediately below with no exit transition.
  const listEl = document.createElement('div');
  listEl.className = 'grid grid-cols-1 gap-16 sm:grid-cols-2';
  listEl.dataset.motionAnimatePresence = 'popLayout';

  let cardInstances = [];

  function render() {
    cardInstances.forEach((instance) => instance.destroy());
    cardInstances = [];
    listEl.innerHTML = '';
    items.forEach((item) => {
      cardInstances.push(initProjectCard(listEl, item));
    });
  }

  rootEl.appendChild(listEl);
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
      cardInstances.forEach((instance) => instance.destroy());
      rootEl.remove();
    },
  };
}