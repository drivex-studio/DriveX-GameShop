
import { cx } from '../../utils/cx.js';

function buildArrowSvg(pathD) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', pathD);
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.5');
  svg.appendChild(path);
  return svg;
}

export function initSliderNavArrows(parentEl, props = {}) {
  const { onPrev, onNext, className } = props;

  const rootEl = document.createElement('div');
  rootEl.className = cx('flex items-center gap-8', className);

  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'flex size-32 cursor-pointer items-center justify-center bg-surface/75 transition-colors duration-400 hover:bg-surface';
  prevBtn.setAttribute('aria-label', 'Previous slide');
  prevBtn.appendChild(buildArrowSvg('M10 12L6 8L10 4'));
  prevBtn.addEventListener('click', () => onPrev?.());

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'flex size-32 cursor-pointer items-center justify-center bg-surface/75 transition-colors duration-400 hover:bg-surface';
  nextBtn.setAttribute('aria-label', 'Next slide');
  nextBtn.appendChild(buildArrowSvg('M6 4L10 8L6 12'));
  nextBtn.addEventListener('click', () => onNext?.());

  rootEl.appendChild(prevBtn);
  rootEl.appendChild(nextBtn);
  parentEl.appendChild(rootEl);

  return rootEl;
}