import gsap from 'gsap';
import { cx } from '../../utils/cx.js';
import { buildChevronIcon } from './ChevronIcon.js';
import {
  triggerVariants,
  chevronWrapperVariants,
  labelVariants,
} from './dropdownVariants.js';

export function initDropdown(parentEl, props = {}) {
  const {
    label,
    options = [],
    value,
    onChange,
    className,
    size = 'default',
    theme = 'light',
  } = props;

  let isOpen = false;

  const rootEl = document.createElement('div');
  rootEl.className = cx('relative', className);

  const triggerEl = document.createElement('button');
  triggerEl.type = 'button';
  triggerEl.setAttribute('aria-haspopup', 'listbox');

  const leftChevronWrapper = document.createElement('span');
  leftChevronWrapper.appendChild(buildChevronIcon('rotate-180'));

  const labelWrapper = document.createElement('span');
  const activeDotEl = document.createElement('span');
  activeDotEl.className = 'size-8 bg-brand';
  const labelTextEl = document.createElement('span');
  labelTextEl.className = 'text-accent-sm';

  const rightChevronWrapper = document.createElement('span');
  rightChevronWrapper.appendChild(buildChevronIcon());

  labelWrapper.appendChild(labelTextEl);
  const innerWrapper = document.createElement('span');
  innerWrapper.className = 'relative flex w-full items-center gap-6';
  innerWrapper.appendChild(leftChevronWrapper);
  innerWrapper.appendChild(labelWrapper);
  innerWrapper.appendChild(rightChevronWrapper);
  triggerEl.appendChild(innerWrapper);

  const panelEl = document.createElement('div');
  panelEl.className = 'absolute top-full left-0 z-50 mt-8 min-w-200 origin-top-left bg-background md:min-w-0';
  panelEl.setAttribute('role', 'listbox');
  panelEl.tabIndex = -1;
  panelEl.setAttribute('data-theme', 'dark');
  panelEl.style.visibility = 'hidden';
  panelEl.style.opacity = '0';

  const panelInner = document.createElement('div');
  panelInner.className = 'py-8';
  panelEl.appendChild(panelInner);

  rootEl.appendChild(triggerEl);
  rootEl.appendChild(panelEl);
  parentEl.appendChild(rootEl);

  let gsapContext = null;

  function handleSelect(nextValue) {
    onChange?.(nextValue);
    setIsOpen(false);
  }

  function handleOptionKeyDown(e, nextValue) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(nextValue);
    }
  }

  function renderOptions() {
    panelInner.innerHTML = '';
    const optionsWithAll = [null, ...options];
    optionsWithAll.forEach((optionValue) => {
      const isSelected = optionValue === value;
      const displayLabel = optionValue ?? 'All';

      const optionEl = document.createElement('div');
      optionEl.setAttribute('role', 'option');
      optionEl.setAttribute('aria-selected', String(isSelected));
      optionEl.tabIndex = 0;
      optionEl.className = cx(
        'flex cursor-pointer items-center gap-8 px-16 py-8 transition-colors hover:bg-surface',
        isSelected && 'text-brand'
      );
      optionEl.addEventListener('keydown', (e) => handleOptionKeyDown(e, optionValue));
      optionEl.addEventListener('click', () => handleSelect(optionValue));

      if (isSelected) {
        const dot = document.createElement('span');
        dot.className = 'size-8 bg-brand';
        optionEl.appendChild(dot);
      }

      const textEl = document.createElement('span');
      textEl.className = 'text-accent-sm';
      textEl.textContent = `[${displayLabel}]`;
      optionEl.appendChild(textEl);

      panelInner.appendChild(optionEl);
    });
  }

  function render() {
    triggerEl.className = cx(triggerVariants({ size }), isOpen && 'group');
    leftChevronWrapper.className = cx(
      chevronWrapperVariants({ size, theme, position: 'left' }),
      isOpen && 'rotate-0 scale-100'
    );
    rightChevronWrapper.className = cx(
      chevronWrapperVariants({ size, theme, position: 'right' }),
      isOpen && '-rotate-45 scale-0'
    );
    labelWrapper.className = cx(
      labelVariants({ size, theme }),
      isOpen && 'translate-x-0'
    );
    activeDotEl.remove();
    if (value) labelWrapper.prepend(activeDotEl);

    const displayLabel = value ?? (label === undefined ? 'FILTER' : label);
    labelTextEl.textContent = displayLabel;

    triggerEl.setAttribute('aria-expanded', String(isOpen));
    triggerEl.setAttribute('data-open', String(isOpen));

    renderOptions();
  }

  function setIsOpen(nextOpen) {
    if (isOpen === nextOpen) return;
    isOpen = nextOpen;
    render();
    playPanelTransition();
  }

  // useGSAP(() => {...}, { scope: rootEl, dependencies: [isOpen] })
  function playPanelTransition() {
    if (gsapContext) gsapContext.revert();
    gsapContext = gsap.context(() => {
      gsap.killTweensOf(panelEl);
      if (isOpen) {
        gsap.set(panelEl, { visibility: 'visible' });
        gsap.fromTo(
          panelEl,
          { opacity: 0, scale: 0.95, y: -8 },
          { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(1.7)' }
        );
      } else {
        gsap.to(panelEl, {
          opacity: 0,
          scale: 0.95,
          y: -8,
          duration: 0.21,
          ease: 'power2.out',
          onComplete: () => {
            gsap.set(panelEl, { visibility: 'hidden' });
          },
        });
      }
    }, rootEl);
  }

  function handleToggle() {
    setIsOpen(!isOpen);
  }

  function handleTriggerKeyDown(e) {
    if (e.key === 'ArrowDown' && !isOpen) {
      e.preventDefault();
      setIsOpen(true);
    }
  }

  triggerEl.addEventListener('click', handleToggle);
  triggerEl.addEventListener('keydown', handleTriggerKeyDown);

  // useEffect(() => { document.addEventListener('mousedown', ...) }, [])
  function handleOutsideMouseDown(e) {
    if (rootEl && !rootEl.contains(e.target)) setIsOpen(false);
  }
  document.addEventListener('mousedown', handleOutsideMouseDown);

  // useEffect(() => { document.addEventListener('keydown', ...) }, [])
  function handleEscapeKeyDown(e) {
    if (e.key === 'Escape') setIsOpen(false);
  }
  document.addEventListener('keydown', handleEscapeKeyDown);

  render();

  return {
    el: rootEl,
    destroy() {
      document.removeEventListener('mousedown', handleOutsideMouseDown);
      document.removeEventListener('keydown', handleEscapeKeyDown);
      triggerEl.removeEventListener('click', handleToggle);
      triggerEl.removeEventListener('keydown', handleTriggerKeyDown);
      if (gsapContext) gsapContext.revert();
      rootEl.remove();
    },
  };
}