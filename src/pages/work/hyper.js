// Renamed from mangled source identifiers:
export function incrementRotationCount(value) {
  return value + 1;
}

export function incrementScrambleKey(value) {
  return value + 1;
}

export function toThumbnailItem(caseStudy) {
  return {
    _id: caseStudy._id,
    title: caseStudy.title,
    mainImage: caseStudy.mainImage?.type === 'image'
      ? { type: 'image', image: caseStudy.mainImage.image }
      : null,
  };
}

export function toSliderItem(caseStudy) {
  return {
    _id: caseStudy._id,
    title: caseStudy.title,
    uri: caseStudy.uri,
    tags: caseStudy.tags,
    mainImage: caseStudy.mainImage,
  };
}