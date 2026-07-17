function buildRect(x, y, width, height) {
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', x);
  rect.setAttribute('y', y);
  rect.setAttribute('width', width);
  rect.setAttribute('height', height);
  rect.setAttribute('fill', 'none');
  rect.setAttribute('stroke', 'currentColor');
  rect.setAttribute('stroke-width', '1.5');
  return rect;
}

function buildLine(x1, y1, x2, y2) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
  line.setAttribute('stroke', 'currentColor');
  line.setAttribute('stroke-width', '1.5');
  return line;
}

function baseSvg() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');
  return svg;
}

function buildSliderIcon() {
  const svg = baseSvg();
  svg.appendChild(buildRect('1', '4', '6', '8'));
  svg.appendChild(buildRect('9', '4', '6', '8'));
  return svg;
}

function buildDuoIcon() {
  const svg = baseSvg();
  svg.appendChild(buildRect('1', '1', '6', '14'));
  svg.appendChild(buildRect('9', '1', '6', '14'));
  return svg;
}

function buildGridIcon() {
  const svg = baseSvg();
  [
    ['1', '1'], ['6', '1'], ['11', '1'],
    ['1', '6'], ['6', '6'], ['11', '6'],
    ['1', '11'], ['6', '11'], ['11', '11'],
  ].forEach(([x, y]) => svg.appendChild(buildRect(x, y, '4', '4')));
  return svg;
}

function buildListIcon() {
  const svg = baseSvg();
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.appendChild(buildLine('1', '4', '15', '4'));
  svg.appendChild(buildLine('1', '8', '15', '8'));
  svg.appendChild(buildLine('1', '12', '15', '12'));
  return svg;
}

export const viewModeOptions = [
  { mode: 'slider', label: 'Slider view', buildIcon: buildSliderIcon },
  { mode: 'duo', label: 'Two column view', visibility: 'hidden md:flex', buildIcon: buildDuoIcon },
  { mode: 'grid', label: 'Grid view', buildIcon: buildGridIcon },
  { mode: 'list', label: 'List view', visibility: 'flex md:hidden', buildIcon: buildListIcon },
];