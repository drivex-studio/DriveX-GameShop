// original component name: J -> initViewModeToggle
import { cx } from '../../utils/cx.js';
import { viewModeOptions } from './viewModeOptions.js';

export function initViewModeToggle(parentEl, props = {}) {
  const { value, onChange, className } = props;

  const rootEl = document.createElement('div');
  rootEl.className = cx('flex items-center gap-4', className);

  const groupEl = document.createElement('div');
  groupEl.setAttribute('role', 'group');
  groupEl.setAttribute('aria-label', 'View mode');
  rootEl.appendChild(groupEl);
  parentEl.appendChild(rootEl);

  function render() {
    groupEl.innerHTML = '';
    viewModeOptions.forEach(({ mode, label, buildIcon, visibility }) => {
      const isActive = value === mode;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = cx(
        'size-32 cursor-pointer items-center justify-center transition-colors duration-400',
        isActive ? 'bg-brand text-black' : 'bg-surface/75 text-foreground hover:bg-surface',
        visibility ?? 'flex'
      );
      btn.setAttribute('aria-label', label);
      btn.setAttribute('aria-pressed', String(isActive));
      btn.appendChild(buildIcon());
      btn.addEventListener('click', () => onChange?.(mode));
      groupEl.appendChild(btn);
    });
  }

  render();

  return { el: rootEl, render };
}