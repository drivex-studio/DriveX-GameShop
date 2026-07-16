import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import ScrambleTextPlugin from 'gsap/ScrambleTextPlugin';
import CustomEase from 'gsap/CustomEase';
import SplitText from 'gsap/SplitText';

gsap.registerPlugin(
  ScrollTrigger,
  ScrambleTextPlugin,
  SplitText,
  CustomEase
);

export {
  gsap,
  ScrollTrigger,
  ScrambleTextPlugin,
  CustomEase,
  SplitText
};
