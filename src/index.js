import { initCardsSectionClient } from './features/general/CardsSectionClient.js';
import { initAnimatedListSectionClient } from './features/general/AnimatedListSectionClient.js';
import { initFeaturedWorkSectionClient } from './features/general/FeaturedWorkSectionClient.js';

import { cardsSectionData } from './data/cardsSectionData.js';
import { animatedListSectionData } from './data/animatedListSectionData.js';
import { featuredWorkSectionData } from './data/featuredWorkSectionData.js';

export function initCardsSection(mainContainer) {
  const sectionEl = document.createElement('section');
  sectionEl.setAttribute('data-theme', 'light');
  sectionEl.setAttribute('data-page-builder-section', 'cardsSection');
  sectionEl.className = 'bg-background pt-64 lg:pt-128 pb-64 lg:pb-128';

  const gridContainerEl = document.createElement('div');
  gridContainerEl.className = 'grid-container';

  const gridLayoutEl = document.createElement('div');
  gridLayoutEl.className = 'grid-layout';

  const gridSpanEl = document.createElement('div');
  gridSpanEl.className = 'grid-span-12';

  const cardsSectionInstance = initCardsSectionClient({ cards: cardsSectionData });

  gridSpanEl.appendChild(cardsSectionInstance.element);
  gridLayoutEl.appendChild(gridSpanEl);
  gridContainerEl.appendChild(gridLayoutEl);
  sectionEl.appendChild(gridContainerEl);

  if (mainContainer) {
    mainContainer.appendChild(sectionEl);
  }

  function destroy() {
    if (typeof cardsSectionInstance.destroy === 'function') {
      cardsSectionInstance.destroy();
    }
    if (sectionEl.parentNode) {
      sectionEl.parentNode.removeChild(sectionEl);
    }
  }

  return { element: sectionEl, destroy };
}

export function initAnimatedListSection(mainContainer) {
  const sectionEl = document.createElement('section');
  sectionEl.setAttribute('data-theme', 'light');
  sectionEl.setAttribute('data-page-builder-section', 'animatedListSection');
  sectionEl.className = 'bg-background pt-64 lg:pt-128 pb-64 lg:pb-128';

  const listSectionInstance = initAnimatedListSectionClient(sectionEl, animatedListSectionData);

  if (mainContainer) {
    mainContainer.appendChild(sectionEl);
  }

  function mount() {
    if (typeof listSectionInstance.mount === 'function') {
      listSectionInstance.mount();
    }
  }

  function destroy() {
    if (typeof listSectionInstance.destroy === 'function') {
      listSectionInstance.destroy();
    }
    if (sectionEl.parentNode) {
      sectionEl.parentNode.removeChild(sectionEl);
    }
  }

  return { element: sectionEl, mount, destroy };
}

export function initFeaturedWorkSection(mainContainer) {
  const sectionEl = document.createElement('section');
  sectionEl.setAttribute('data-theme', 'dark');
  sectionEl.setAttribute('data-page-builder-section', 'featuredWorkSection');
  sectionEl.className = 'bg-background pt-64 lg:pt-128 pb-64 lg:pb-128';

  const featuredWorkInstance = initFeaturedWorkSectionClient(sectionEl, {
    section: featuredWorkSectionData,
  });

  if (mainContainer) {
    mainContainer.appendChild(sectionEl);
  }

  function mount() {
    if (featuredWorkInstance && typeof featuredWorkInstance.mount === 'function') {
      featuredWorkInstance.mount();
    }
  }

  function destroy() {
    if (typeof featuredWorkInstance.destroy === 'function') {
      featuredWorkInstance.destroy();
    }
    if (sectionEl.parentNode) {
      sectionEl.parentNode.removeChild(sectionEl);
    }
  }

  return { element: sectionEl, mount, destroy };
}