import { initCardsSectionClient } from './features/general/CardsSectionClient.js';
import { initAnimatedListSectionClient } from './features/general/AnimatedListSectionClient.js';

import { animatedListSectionData } from './data/animatedListSectionData.js';

export function initCardsSection(mainContainer) {
  const cardsData = [
    {
      _type: 'mediaCard',
      media: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: 'image-e3542975abcf0a14d3121ec9420e01aa149fd8f7-2556x1179-png',
        }
      },
      alt: 'project item tast',
    },
    {
      _type: 'textCard',
      cardTheme: 'light',
      headlineDisplay: 'h1',
      headline: { text: '$50B+' },
      text: 'Combined client market cap',
      plainText: false,
    },
    {
      _type: 'textCard',
      cardTheme: 'light',
      headlineDisplay: 'h1',
      headline: { text: '10M+' },
      text: 'People reached by our work',
      plainText: false,
    },
    {
      _type: 'textCard',
      cardTheme: 'light',
      headlineDisplay: 'h1',
      headline: { text: '50+' },
      text: 'Projects shipped',
      plainText: false,
    },
  ];

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

  const cardsSectionInstance = initCardsSectionClient({ cards: cardsData });

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