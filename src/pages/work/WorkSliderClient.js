import { cx } from '../../utils/cx.js';

import { initScrambleGroup as ScrambleGroup } from '../../utils/initScrambleGroup.js';

//import { LayoutGroup } from 'framer-motion';

import { incrementRotationCount, incrementScrambleKey, toSliderItem, toThumbnailItem } from './hyper.js';
import { initDropdown } from './Dropdown.js';
import { initViewModeToggle } from './ViewModeToggle.js';
import { initSliderNavArrows } from './SliderNavArrows.js';
import { initThumbnails } from './Thumbnails.js';
import { initSlider } from './Slide.js';
import { initDuoGrid } from './DuoGrid.js';
import { initGrid } from './Grid.js';
import { initList } from './List.js';

export function initWorkSliderClient(parentEl, props = {}) {
  const { section } = props;
  const content = section?.content ?? {};
  const { filterLabel, caseStudies } = content;

  if (!caseStudies || caseStudies.length === 0) return null;

  // ---- State (from useState) ----
  let selectedTag = null;
  let currentIndex = 0;
  let rotationCount = 0;
  let viewMode = 'slider';
  let containerHeight = 'auto';
  let scrambleKey = 0;
  let isSwitchingFromSlider = false;

  // ---- DOM refs / instance refs (from useRef) ----
  let sliderInstance = null;
  const containerRef = { current: null };

  // motion.div: animate/transition/style -- TODO markers are attached at each
  // call site below (Section 1.9(b)).

  // LayoutGroup id="work-slider" (see import note above): root element
  // stands in for it, tagged for traceability, never functionally active.
  const rootEl = document.createElement('div');
  rootEl.id = 'work-slider';
  rootEl.dataset.motionLayoutGroupId = 'work-slider';
  parentEl.appendChild(rootEl);

  const headerRowEl = document.createElement('div');
  headerRowEl.className = 'grid-container';
  const headerInnerEl = document.createElement('div');
  headerInnerEl.className = 'mb-16 flex items-end justify-between lg:grid lg:grid-cols-12 lg:items-center';
  headerRowEl.appendChild(headerInnerEl);

  const filterDropdownSlot = document.createElement('div');
  filterDropdownSlot.className = 'lg:col-span-4';
  let dropdownInstance = null;

  // motion.div: animate={{ opacity }} transition={{ duration: .3 }} style={{ pointerEvents }}
  // TODO: 'motion.div' (framer-motion) requires a React render root; opacity
  // and pointer-events are instead applied directly via style below.
  const thumbnailsWrapperEl = document.createElement('div');
  thumbnailsWrapperEl.className = 'hidden justify-center md:flex lg:col-span-4';
  let headerThumbnailsInstance = null;

  const viewControlsRowEl = document.createElement('div');
  viewControlsRowEl.className = 'flex items-center lg:col-span-4 lg:justify-end';
  const viewToggleSlot = document.createElement('div');
  let viewToggleInstance = null;

  const navGridEl = document.createElement('div');
  navGridEl.className = 'grid transition-[grid-template-columns] duration-300 ease-in-out';
  const navGridInnerEl = document.createElement('div');
  navGridInnerEl.className = 'overflow-hidden';
  const navGridPadEl = document.createElement('div');
  navGridPadEl.className = 'pl-16';
  navGridInnerEl.appendChild(navGridPadEl);
  navGridEl.appendChild(navGridInnerEl);
  initSliderNavArrows(navGridPadEl, { onPrev: handlePrev, onNext: handleNext });

  viewControlsRowEl.appendChild(viewToggleSlot);
  viewControlsRowEl.appendChild(navGridEl);

  headerInnerEl.appendChild(filterDropdownSlot);
  headerInnerEl.appendChild(thumbnailsWrapperEl);
  headerInnerEl.appendChild(viewControlsRowEl);

  const heightAnimWrapperEl = document.createElement('div');
  heightAnimWrapperEl.className = 'overflow-hidden transition-[height] duration-400 [transition-timing-function:var(--ease-power4-in-out)]';

  const viewsContainerEl = document.createElement('div');
  containerRef.current = viewsContainerEl;
  heightAnimWrapperEl.appendChild(viewsContainerEl);

  rootEl.appendChild(headerRowEl);
  rootEl.appendChild(heightAnimWrapperEl);

  // useEffect(() => { ResizeObserver on containerRef.current }, [])
  const resizeObserver = new ResizeObserver(([entry]) => {
    if (!entry) return;
    containerHeight = entry.contentRect.height;
    heightAnimWrapperEl.style.height = `${containerHeight}px`;
  });
  resizeObserver.observe(viewsContainerEl);

  // useEffect(() => { setCurrentIndex(0); setRotationCount(0) }, []) -- runs once on mount
  currentIndex = 0;
  rotationCount = 0;

  function computeAvailableTags() {
    if (!caseStudies) return [];
    const tagSet = new Set();
    for (const cs of caseStudies) {
      if (cs.tags) for (const tag of cs.tags) tagSet.add(tag);
    }
    return Array.from(tagSet).sort();
  }

  function computeFilteredCaseStudies() {
    if (!caseStudies) return [];
    if (!selectedTag) return caseStudies;
    return caseStudies.filter((cs) => cs.tags?.includes(selectedTag));
  }

  function handlePrev() {
    sliderInstance?.goToPrev();
  }

  function handleNext() {
    sliderInstance?.goToNext();
  }

  function handleSelect(index) {
    sliderInstance?.goToSlide(index);
  }

  function handleSliderIndexChange(index) {
    currentIndex = index;
    rotationCount = incrementRotationCount(rotationCount);
    renderHeaderControls();
  }

  function handleSelectedTagChange(nextTag) {
    selectedTag = nextTag;
    fullRender();
  }

  function handleViewModeChange(nextMode) {
    isSwitchingFromSlider = viewMode === 'slider' || nextMode === 'slider';
    viewMode = nextMode;
    currentIndex = 0;
    rotationCount = 0;
    scrambleKey = incrementScrambleKey(scrambleKey);
    fullRender();
  }

  let activeViewInstance = null;
  let activeScrambleGroupHandle = null;

  function renderHeaderControls() {
    const filteredCaseStudies = computeFilteredCaseStudies();
    const thumbnailItems = filteredCaseStudies.map(toThumbnailItem);
    const isSliderMode = viewMode === 'slider';

    if (headerThumbnailsInstance) {
      headerThumbnailsInstance.destroy?.();
      headerThumbnailsInstance = null;
    }
    thumbnailsWrapperEl.innerHTML = '';
    thumbnailsWrapperEl.style.opacity = isSliderMode ? '1' : '0';
    thumbnailsWrapperEl.style.pointerEvents = isSliderMode ? 'auto' : 'none';
    thumbnailsWrapperEl.dataset.motionAnimate = JSON.stringify({ opacity: isSliderMode ? 1 : 0 });
    headerThumbnailsInstance = initThumbnails(thumbnailsWrapperEl, {
      items: thumbnailItems,
      currentIndex,
      onSelect: handleSelect,
      rotationCount,
    });

    navGridEl.style.gridTemplateColumns = isSliderMode ? '1fr' : '0fr';
  }

  function renderActiveView() {
    const filteredCaseStudies = computeFilteredCaseStudies();
    const sliderItems = filteredCaseStudies.map(toSliderItem);

    if (activeViewInstance) {
      activeViewInstance.destroy?.();
      activeViewInstance = null;
    }
    if (activeScrambleGroupHandle) {
      activeScrambleGroupHandle.destroy?.();
      activeScrambleGroupHandle = null;
    }
    // AnimatePresence mode="popLayout"
    // TODO: 'AnimatePresence' (framer-motion) requires a React render root;
    // the previous view mode's DOM is simply cleared, with no exit transition.
    viewsContainerEl.innerHTML = '';

    if (viewMode === 'slider') {
      // motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      // TODO: see AnimatePresence note above.
      const variantEl = document.createElement('div');
      variantEl.className = 'flex flex-col gap-32';
      viewsContainerEl.appendChild(variantEl);

      sliderInstance = initSlider(variantEl, {
        items: sliderItems,
        onIndexChange: handleSliderIndexChange,
        className: 'page-enter-fade',
        scrambleKey,
      });

      const mobileThumbsWrap = document.createElement('div');
      mobileThumbsWrap.className = 'grid-container';
      variantEl.appendChild(mobileThumbsWrap);
      const mobileThumbnailItems = filteredCaseStudies.map(toThumbnailItem);
      const mobileThumbsInstance = initThumbnails(mobileThumbsWrap, {
        items: mobileThumbnailItems,
        currentIndex,
        onSelect: handleSelect,
        rotationCount,
        gap: 8,
        className: 'mt-32 md:hidden',
      });

      activeViewInstance = {
        destroy() {
          sliderInstance?.destroy();
          sliderInstance = null;
          mobileThumbsInstance?.destroy?.();
          variantEl.remove();
        },
      };
    } else if (viewMode === 'duo') {
      const variantEl = document.createElement('div');
      variantEl.dataset.motionInitial = isSwitchingFromSlider ? JSON.stringify({ opacity: 0 }) : 'false';
      viewsContainerEl.appendChild(variantEl);

      // SOURCE NOT PRESENT: ScrambleGroup's real implementation is not in the input.
      const groupEl = document.createElement('div');
      variantEl.appendChild(groupEl);
      activeScrambleGroupHandle = ScrambleGroup(groupEl, { stagger: 0.08, start: 'top 85%' });
      const duoInstance = initDuoGrid(groupEl, { items: filteredCaseStudies });
      activeViewInstance = { destroy() { duoInstance.destroy(); variantEl.remove(); } };
    } else if (viewMode === 'grid') {
      const variantEl = document.createElement('div');
      variantEl.dataset.motionInitial = isSwitchingFromSlider ? JSON.stringify({ opacity: 0 }) : 'false';
      viewsContainerEl.appendChild(variantEl);

      // SOURCE NOT PRESENT: ScrambleGroup's real implementation is not in the input.
      const groupEl = document.createElement('div');
      variantEl.appendChild(groupEl);
      activeScrambleGroupHandle = ScrambleGroup(groupEl, { stagger: 0.08, start: 'top 85%' });
      const gridInstance = initGrid(groupEl, { items: filteredCaseStudies });
      activeViewInstance = { destroy() { gridInstance.destroy(); variantEl.remove(); } };
    } else if (viewMode === 'list') {
      const variantEl = document.createElement('div');
      variantEl.dataset.motionInitial = isSwitchingFromSlider ? JSON.stringify({ opacity: 0 }) : 'false';
      viewsContainerEl.appendChild(variantEl);

      const listInstance = initList(variantEl, { items: filteredCaseStudies });
      activeViewInstance = { destroy() { listInstance.destroy(); variantEl.remove(); } };
    }
  }

  function renderFilterDropdown() {
    const availableTags = computeAvailableTags();
    if (dropdownInstance) {
      dropdownInstance.destroy();
      dropdownInstance = null;
    }
    filterDropdownSlot.innerHTML = '';
    const filterLabelValue = selectedTag ?? 'FILTER';
    dropdownInstance = initDropdown(filterDropdownSlot, {
      label: filterLabelValue,
      options: availableTags,
      value: selectedTag,
      onChange: handleSelectedTagChange,
      className: 'lg:col-span-4',
    });
  }

  function renderViewToggle() {
    if (viewToggleInstance) {
      viewToggleInstance.destroy?.();
      viewToggleInstance = null;
    }
    viewToggleSlot.innerHTML = '';
    viewToggleInstance = initViewModeToggle(viewToggleSlot, {
      value: viewMode,
      onChange: handleViewModeChange,
    });
  }

  function fullRender() {
    renderFilterDropdown();
    renderHeaderControls();
    renderViewToggle();
    renderActiveView();
  }

  fullRender();

  return {
    el: rootEl,
    destroy() {
      resizeObserver.disconnect();
      dropdownInstance?.destroy();
      headerThumbnailsInstance?.destroy?.();
      viewToggleInstance?.destroy?.();
      activeViewInstance?.destroy?.();
      activeScrambleGroupHandle?.destroy?.();
      rootEl.remove();
    },
  };
}