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

// NEW: HeroTextOnly section
import { initHeroTextOnly } from './src/features/HeroTextOnly.js';
import { heroData } from './src/data/heroTextOnlyData.js';
import { initFooterClient } from './src/components/FooterClient.js';
import { footerProps } from './src/data/footerData.js';

import { initWorkSliderClient } from './src/pages/work/WorkSliderClient.js';
import { workSliderData } from './src/data/workSliderData.js';

let destroyLenisProvider = null;
let destroyPageEnterProvider = null;
let destroyThemeSync = null;
let heroInstance = null; // NEW
let workSliderInstance = null;
let footerInstance = null;

document.addEventListener('DOMContentLoaded', () => {

  destroyLenisProvider = initLenisProvider({});

  if (typeof initPageTransitionState === 'function') {
    initPageTransitionState(document.body);
  }

  if (typeof initPreloader === 'function') {
    initPreloader(document.body, {});
  }

  if (typeof initPreloaderScrollLock === 'function') {
    initPreloaderScrollLock();
  }

  if (typeof initSyncBodyTheme === 'function') {
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
  heroSectionWrapper.setAttribute('data-theme', 'light');
  heroSectionWrapper.setAttribute('data-page-builder-section', 'heroSection');
  heroSectionWrapper.className = 'relative bg-background pt-64 lg:pt-128 pb-24 lg:pb-48';
  mainContainer.appendChild(heroSectionWrapper);

  heroInstance = initHeroTextOnly(heroSectionWrapper, {
    headline: heroData.headline,
    headlineLevel: heroData.headlineLevel,
    headlineDisplay: heroData.headlineDisplay,
    subtext: heroData.subtext,
  });

  const workSectionWrapper = document.createElement('section');
  workSectionWrapper.setAttribute('data-theme', 'dark');
  workSectionWrapper.setAttribute('data-page-builder-section', 'workSection');
  workSectionWrapper.className = 'bg-background pt-128 lg:pt-192 pb-64 lg:pb-128';
  mainContainer.appendChild(workSectionWrapper);

  workSliderInstance = initWorkSliderClient(workSectionWrapper, { section: workSliderData });

  footerInstance = initFooterClient(document.body, footerProps);

  window.addEventListener('unload', () => {
    if (typeof destroyLenisProvider === 'function') destroyLenisProvider();
    if (typeof destroyPageEnterProvider === 'function') destroyPageEnterProvider();
    if (typeof destroyThemeSync === 'function') destroyThemeSync();

    // NEW
    if (heroInstance && typeof heroInstance.destroy === 'function') {
      heroInstance.destroy();
    }

    if (workSliderInstance && typeof workSliderInstance.destroy === 'function') {
      workSliderInstance.destroy();
    }

    if (footerInstance && typeof footerInstance.destroy === 'function') {
      footerInstance.destroy();
    }
  });
});
