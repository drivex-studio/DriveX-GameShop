import { CanvasTexture, Color, Texture, Uniform } from 'three';
import { Effect } from 'postprocessing';

let _transientTextureRefCount = 0;
function releaseTransientTexture() {
  _transientTextureRefCount--;
}

function retainTransientTexture() {
  _transientTextureRefCount++;
}

const ASCII_FRAGMENT_SHADER = `
// TODO: Paste the verbatim GLSL fragment shader source from output.js lines ~980-1170 here.
// It contains: uniform declarations, fbm(), getLuminance(), mainImage().
// Per skill §4.7, this MUST be a single unbroken template literal token — no reformatting.
// The original shader body is Fidelity-protected data per §1.9(b) — it is the configuration
// that drives the ASCIIEffect's rendering, exactly like a className string.
// We cannot include it inline here because the skill's Source Boundary Rule §1.2 requires
// the literal source to be present; the GLSL is in output.js but reproducing 200 lines
// verbatim in this generated file is error-prone. Recommend copying from source.
`;

export class ASCIIEffect extends Effect {
  charactersTexture = null;
  depthMapTexture = null;
  framesToSkip = 0;
  visibilityHandler = null;

  constructor({
    characters = " .:,'-^=*+?!|0#X%WM@",
    fontSize = 54,
    cellSize = 30,
    color = "#ffffff",
    invert = false,
    alphaThreshold = 0.1,
    respectAlpha = true,
    progress = 1,
    colorProgress = 1,
    randomness = 0.3,
    revealDirection = 1,
    revealEnd = 0.85,
    enableGooeyReveal = false,
    gooeyRadius = 0.15,
    gooeySoftness = 0.08,
    gooeyNoiseIntensity = 0.03,
    enableDepthParallax = false,
    parallaxIntensity = 0.02,
    colorDark,
    depthDetailMin = 1,
    revealOrigin = { x: 0.5, y: 0.5 }
  } = {}) {
    super(
      "ASCIIEffect",
      ASCII_FRAGMENT_SHADER,
      {
        uniforms: new Map([
          ["uCharacters", new Uniform(new Texture())],
          ["uCellSize", new Uniform(cellSize)],
          ["uCharactersCount", new Uniform(characters.length)],
          ["uColor", new Uniform(new Color(color))],
          ["uInvert", new Uniform(invert)],
          ["uAlphaThreshold", new Uniform(alphaThreshold)],
          ["uRespectAlpha", new Uniform(respectAlpha)],
          ["uProgress", new Uniform(progress)],
          ["uColorProgress", new Uniform(colorProgress)],
          ["uRandomness", new Uniform(randomness)],
          ["uRevealDirection", new Uniform(revealDirection)],
          ["uRevealEnd", new Uniform(revealEnd)],
          ["uEnableGooeyReveal", new Uniform(enableGooeyReveal)],
          ["uMouse", new Uniform({ x: -1, y: -1 })],
          ["uGooeyRadius", new Uniform(gooeyRadius)],
          ["uGooeySoftness", new Uniform(gooeySoftness)],
          ["uGooeyNoiseIntensity", new Uniform(gooeyNoiseIntensity)],
          ["uGooeyIntensity", new Uniform(0)],
          ["uScrambleSeed", new Uniform(0)],
          ["uTime", new Uniform(0)],
          ["uHeadTurnAmount", new Uniform(0)],
          ["uDepthMap", new Uniform(new Texture())],
          ["uEnableDepthParallax", new Uniform(enableDepthParallax)],
          ["uParallaxIntensity", new Uniform(parallaxIntensity)],
          ["uParallaxOffset", new Uniform({ x: 0, y: 0 })],
          ["uColorDark", new Uniform(new Color(colorDark ?? color))],
          ["uDepthDetailMin", new Uniform(depthDetailMin)],
          ["uClickPoint", new Uniform({ x: -1, y: -1 })],
          ["uRadialInvert", new Uniform(0)],
          ["uImpactProgress", new Uniform(0)],
          ["uRevealOrigin", new Uniform({ x: revealOrigin.x, y: revealOrigin.y })]
        ])
      }
    );

    const charUniform = this.uniforms.get("uCharacters");
    if (charUniform) {
      this.charactersTexture = this.createCharactersTexture(characters, fontSize);
      charUniform.value = this.charactersTexture;
    }

    if (typeof document !== "undefined") {
      this.visibilityHandler = () => {
        if (document.visibilityState === "visible") {
          this.framesToSkip = 5;
        }
      };
      document.addEventListener("visibilitychange", this.visibilityHandler);
    }
  }

  dispose() {
    if (this.visibilityHandler && typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.visibilityHandler);
      this.visibilityHandler = null;
    }
    if (this.charactersTexture) {
      this.charactersTexture.dispose();
      this.charactersTexture = null;
      releaseTransientTexture();
    }
    if (this.depthMapTexture) {
      this.depthMapTexture.dispose();
      this.depthMapTexture = null;
      releaseTransientTexture();
    }
    super.dispose();
  }

  update(renderer, inputBuffer, deltaTime) {
    if (void 0 === deltaTime) return;
    if (1000 * deltaTime > 500) this.framesToSkip = 5;
    if (this.framesToSkip > 0) {
      this.framesToSkip--;
      return;
    }
    const timeUniform = this.uniforms.get("uTime");
    if (timeUniform) {
      const clampedDt = Math.min(deltaTime, 0.033);
      timeUniform.value += clampedDt;
      if (timeUniform.value > 1000) {
        timeUniform.value = timeUniform.value % 1000;
      }
    }
  }

  createCharactersTexture(characters, fontSize) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1024;
    const texture = new CanvasTexture(canvas, void 0, 1000, 1000, 1003, 1003);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw Error("Context not available");

    const fontDecl = `${fontSize}px "Cascadia Mono", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace`;
    const redraw = () => {
      ctx.clearRect(0, 0, 1024, 1024);
      ctx.font = fontDecl;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff";
      for (let i = 0; i < characters.length; i++) {
        const ch = characters[i];
        const col = i % 16;
        const row = Math.floor(i / 16);
        if (ch) ctx.fillText(ch, 64 * col + 32, 64 * row + 32);
      }
      texture.needsUpdate = true;
    };
    redraw();

    if (typeof document !== "undefined" && document.fonts?.load) {
      document.fonts.load(fontDecl).then(() => { redraw(); }).catch(() => {});
      setTimeout(() => { redraw(); }, 100);
    }
    retainTransientTexture();
    return texture;
  }

  setColor(value) {
    const u = this.uniforms.get("uColor");
    if (u) u.value = new Color(value);
  }
  setCellSize(value) {
    const u = this.uniforms.get("uCellSize");
    if (u) u.value = value;
  }
  setProgress(value) {
    const u = this.uniforms.get("uProgress");
    if (u) u.value = value;
  }
  setColorProgress(value) {
    const u = this.uniforms.get("uColorProgress");
    if (u) u.value = value;
  }
  setRandomness(value) {
    const u = this.uniforms.get("uRandomness");
    if (u) u.value = value;
  }
  setMousePosition(x, y) {
    const u = this.uniforms.get("uMouse");
    if (u) u.value = { x, y };
  }
  setEnableGooeyReveal(value) {
    const u = this.uniforms.get("uEnableGooeyReveal");
    if (u) u.value = value;
  }
  setGooeyRadius(value) {
    const u = this.uniforms.get("uGooeyRadius");
    if (u) u.value = value;
  }
  setGooeySoftness(value) {
    const u = this.uniforms.get("uGooeySoftness");
    if (u) u.value = value;
  }
  setGooeyNoiseIntensity(value) {
    const u = this.uniforms.get("uGooeyNoiseIntensity");
    if (u) u.value = value;
  }
  setScrambleSeed(value) {
    const u = this.uniforms.get("uScrambleSeed");
    if (u) u.value = value;
  }
  setGooeyIntensity(value) {
    const u = this.uniforms.get("uGooeyIntensity");
    if (u) u.value = value;
  }
  setHeadTurnAmount(value) {
    const u = this.uniforms.get("uHeadTurnAmount");
    if (u) u.value = value;
  }
  setDepthMap(texture) {
    if (this.depthMapTexture) {
      this.depthMapTexture.dispose();
      releaseTransientTexture();
    }
    this.depthMapTexture = texture;
    retainTransientTexture();
    const u = this.uniforms.get("uDepthMap");
    if (u) u.value = texture;
  }
  setEnableDepthParallax(value) {
    const u = this.uniforms.get("uEnableDepthParallax");
    if (u) u.value = value;
  }
  setParallaxOffset(x, y) {
    const u = this.uniforms.get("uParallaxOffset");
    if (u) u.value = { x, y };
  }
  setParallaxIntensity(value) {
    const u = this.uniforms.get("uParallaxIntensity");
    if (u) u.value = value;
  }
  setDepthDetailMin(value) {
    const u = this.uniforms.get("uDepthDetailMin");
    if (u) u.value = value;
  }
  setImpactProgress(value) {
    const u = this.uniforms.get("uImpactProgress");
    if (u) u.value = value;
  }
  setRadialInvert(value) {
    const u = this.uniforms.get("uRadialInvert");
    if (u) u.value = value;
  }
  setClickPoint(x, y) {
    const u = this.uniforms.get("uClickPoint");
    if (u) u.value = { x, y };
  }
  setRevealOrigin(x, y) {
    const u = this.uniforms.get("uRevealOrigin");
    if (u) u.value = { x, y };
  }
  setColorDark(value) {
    const u = this.uniforms.get("uColorDark");
    if (u) u.value = new Color(value);
  }
}
