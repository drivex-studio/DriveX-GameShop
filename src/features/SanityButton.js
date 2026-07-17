

import { SanityLink } from '../assets/medias/SanityLink.js';
import { AnimatedLink } from '../components/utils/AnimatedLink.js';
import { initAnimatedButton } from '../components/utils/AnimatedButton.js';

export function initSanityButton({ button = {}, className } = {}) {
  if (!button.link?.href) return null;

  const linkContent = SanityLink({ link: button.link, children: button.link.text });

  if (button.variant === 'link') {
    const isExternal = button.link.type === 'external';
    return AnimatedLink({
      href: button.link.href,
      target: isExternal ? '_blank' : undefined,
      rel: isExternal ? 'noopener noreferrer' : undefined,
      indicator: isExternal,
      className,
      children: linkContent,
    });
  }

  const { el } = initAnimatedButton(null, {
    size: button.size,
    theme: button.theme,
    className,
    children: linkContent,
  });
  return el;
}