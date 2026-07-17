import { gsap, ScrollTrigger } from './src/vendor.js';
import Lenis from 'lenis';
import { initPageTransitionState } from './src/lib/pageTransitionState.js';
import { initLenisProvider, getLenis, scrollToTop } from './src/lib/lenisState.js';
import { initPreloader } from './src/components/Preloader.js';
import { initPreloaderScrollLock } from './src/components/initPreloaderScrollLock.js';
import { initSyncBodyTheme } from './src/components/initSyncBodyTheme.js'; 
import { initPageEnterProvider } from './src/components/initPageEnterProvider.js';

import { initHeaderClient } from './src/components/initHeaderClient.js';

import { navItems, flyout, headerCta, spotsRemaining } from './src/data/navData.js';

import { initFooterClient } from './src/components/FooterClient.js';
import { footerProps } from './src/data/footerData.js';

import { initHeroSectionContent } from './src/features/general/HeroSectionContent.js';

import { initHeroScrollPush } from './src/features/general/HeroScrollPush.js';

import { initCardsSection, initAnimatedListSection, initFeaturedWorkSection } from './src/index.js';

let destroyLenisProvider = null;
let destroyPageEnterProvider = null;
let destroyThemeSync = null; 
let heroContentInstance = null; 
let heroPushInstance = null;
let cardsSectionInstance = null;
let animatedListInstance = null;
let featuredWorkInstance = null;
let footerInstance = null;   

document.addEventListener('DOMContentLoaded', () => {
  
  destroyLenisProvider = initLenisProvider({});

  if (typeof initPageTransitionState === "function") {
    initPageTransitionState(document.body);
  }

  if (typeof initPreloader === "function") {
    initPreloader(document.body, {});
  }

  if (typeof initPreloaderScrollLock === "function") {
    initPreloaderScrollLock();
  }

  if (typeof initSyncBodyTheme === "function") {
    destroyThemeSync = initSyncBodyTheme();
  }

  const headerMount = document.body;
  destroyPageEnterProvider = initPageEnterProvider(headerMount, {}, (parentElement) => {
    initHeaderClient(parentElement, { navItems, headerCta, flyout, spotsRemaining });
  });

  const mainContainer = document.createElement('main');
  mainContainer.id = 'main-content';
  document.body.appendChild(mainContainer);

  const heroSectionWrapper = document.createElement('section');
  heroSectionWrapper.setAttribute('data-theme', 'dark');
  heroSectionWrapper.setAttribute('data-page-builder-section', 'heroSection');
  heroSectionWrapper.className = 'relative min-h-svh overflow-hidden bg-background pt-0 pb-0';

  const heroGridLayoutEl = document.createElement('div');
  heroGridLayoutEl.className = 'grid-layout min-h-[calc(100svh-52px)]';

  const heroProps = {
    className: 'grid-span-12 lg:grid-span-7 pointer-events-none relative z-10 flex grid-rows-[1fr_auto] flex-col items-start justify-between pb-16 lg:pb-32',
    headline: 'Drive X Store',
    headlineLevel: 'h1',
    subtext: 'Premium gaming accounts and digital experiences.',
    ctas: {
      layout: 'horizontal',
      gap: 16,
      buttons: [
        {
          variant: 'default',
          size: 'default',
          theme: 'brand',
          link: { href: '/shop', text: 'Shop Now', type: 'internal' },
        },
        {
          variant: 'link',
          link: { href: 'https://discord.gg/drivex', text: 'Join Discord', type: 'external' },
        },
      ],
    },
    trustedBy: { title: 'Trusted By', items: [] },
  };
  heroContentInstance = initHeroSectionContent(heroProps);
  heroGridLayoutEl.appendChild(heroContentInstance.element);

  heroPushInstance = initHeroScrollPush({
    className: 'grid-container relative min-h-svh pt-52',
    children: heroGridLayoutEl,
  });
  
  heroSectionWrapper.appendChild(heroPushInstance.element);
  mainContainer.appendChild(heroSectionWrapper);
  
  cardsSectionInstance = initCardsSection(mainContainer);
  
  animatedListInstance = initAnimatedListSection(mainContainer);
  
  featuredWorkInstance = initFeaturedWorkSection(mainContainer);

  footerInstance = 
  initFooterClient(document.body, footerProps);

 if (heroContentInstance.mount) {
    heroContentInstance.mount();
  }
if (cardsSectionInstance && cardsSectionInstance.mount) {
  cardsSectionInstance.mount();
}
if (animatedListInstance && animatedListInstance.mount) {
  animatedListInstance.mount();
}
if (featuredWorkInstance && featuredWorkInstance.mount) {
  featuredWorkInstance.mount();
}

window.addEventListener('unload', () => {
  if (typeof destroyLenisProvider === 'function') destroyLenisProvider();
  if (typeof destroyPageEnterProvider === 'function') destroyPageEnterProvider();
  if (typeof destroyThemeSync === 'function') destroyThemeSync();

  if (heroPushInstance && typeof heroPushInstance.destroy === 'function') heroPushInstance.destroy();
  if (heroContentInstance && typeof heroContentInstance.destroy === 'function') heroContentInstance.destroy();

  if (cardsSectionInstance && typeof cardsSectionInstance.destroy === 'function') {
    cardsSectionInstance.destroy();
  }

  if (animatedListInstance && typeof animatedListInstance.destroy === 'function') {
    animatedListInstance.destroy();
  }

  if (featuredWorkInstance && typeof featuredWorkInstance.destroy === 'function') {
    featuredWorkInstance.destroy();
  }

  if (footerInstance && typeof footerInstance.destroy === 'function') {
    footerInstance.destroy();
  }
  });
});