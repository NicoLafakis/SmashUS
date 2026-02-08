import * as PIXI from 'pixi.js'

/**
 * CRT Arcade Post-Processing Filter
 *
 * Transforms the game into a retro arcade CRT experience with:
 * - Barrel distortion (subtle screen curvature)
 * - Scanlines (horizontal darkening)
 * - Chromatic aberration (RGB offset at edges)
 * - Vignette (darkened corners)
 * - Phosphor bloom (bright pixels glow)
 * - Film grain (subtle noise)
 * - CRT color warmth (slight amber tint)
 */

const CRT_FRAGMENT_SHADER = `
  precision mediump float;

  varying vec2 vTextureCoord;
  uniform sampler2D uSampler;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uScanlineIntensity;
  uniform float uCurvature;
  uniform float uVignetteStrength;
  uniform float uChromaticAberration;
  uniform float uNoiseIntensity;
  uniform float uBloomStrength;
  uniform float uBrightness;
  uniform float uGlitchIntensity;

  // Barrel distortion - simulates curved CRT glass
  vec2 curveUV(vec2 uv) {
    vec2 centered = uv * 2.0 - 1.0;
    vec2 offset = centered.yx * centered.yx * uCurvature;
    centered += centered * offset;
    return centered * 0.5 + 0.5;
  }

  // Scanlines - horizontal brightness modulation
  float scanlines(vec2 uv) {
    float line = sin(uv.y * uResolution.y * 3.14159265) * 0.5 + 0.5;
    return mix(1.0, line, uScanlineIntensity);
  }

  // Vignette - darkened edges
  float vignette(vec2 uv) {
    vec2 centered = uv - 0.5;
    float dist = dot(centered, centered);
    return 1.0 - dist * uVignetteStrength;
  }

  // Pseudo-random noise
  float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    // Apply barrel distortion
    vec2 uv = curveUV(vTextureCoord);

    // Black outside curved screen area
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }

    // Chromatic aberration - offset R and B channels
    vec2 caOffset = (uv - 0.5) * uChromaticAberration;
    float r = texture2D(uSampler, uv + caOffset).r;
    float g = texture2D(uSampler, uv).g;
    float b = texture2D(uSampler, uv - caOffset).b;
    vec3 color = vec3(r, g, b);

    // Phosphor bloom - boost bright areas for glow effect
    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    float bloom = max(0.0, luminance - 0.4) * uBloomStrength;
    color += color * bloom;

    // CRT color warmth - slight amber shift
    color.r *= 1.05;
    color.g *= 1.02;
    color.b *= 0.95;

    // Scanlines
    color *= scanlines(uv);

    // Interlace-style brightness variation (every other frame-ish)
    float interlace = sin(uv.y * uResolution.y * 1.5 + uTime * 2.0) * 0.015 + 0.985;
    color *= interlace;

    // Vignette
    color *= vignette(uv);

    // Film grain noise
    float noise = rand(uv + fract(uTime)) * uNoiseIntensity;
    color += vec3(noise) - uNoiseIntensity * 0.5;

    // Horizontal glitch (for special events)
    if (uGlitchIntensity > 0.0) {
      float glitchLine = step(0.98, rand(vec2(floor(uv.y * 20.0), floor(uTime * 10.0))));
      vec2 glitchOffset = vec2(glitchLine * uGlitchIntensity * (rand(vec2(uTime)) * 2.0 - 1.0), 0.0);
      vec3 glitchColor = texture2D(uSampler, uv + glitchOffset).rgb;
      color = mix(color, glitchColor, glitchLine * uGlitchIntensity);
    }

    // Overall brightness
    color *= uBrightness;

    // Clamp
    color = clamp(color, 0.0, 1.0);

    gl_FragColor = vec4(color, 1.0);
  }
`

export class CRTFilter extends PIXI.Filter {
  private _time: number = 0
  private glitchTimer: number = 0
  private glitchDuration: number = 0
  private targetGlitch: number = 0

  constructor() {
    super(undefined, CRT_FRAGMENT_SHADER, {
      uTime: 0,
      uResolution: [1280, 720],
      uScanlineIntensity: 0.18,
      uCurvature: 0.03,
      uVignetteStrength: 1.2,
      uChromaticAberration: 0.003,
      uNoiseIntensity: 0.03,
      uBloomStrength: 0.6,
      uBrightness: 1.1,
      uGlitchIntensity: 0.0
    })
  }

  update(dt: number): void {
    this._time += dt
    this.uniforms.uTime = this._time

    // Glitch decay
    if (this.glitchTimer > 0) {
      this.glitchTimer -= dt
      const progress = Math.max(0, this.glitchTimer / this.glitchDuration)
      this.uniforms.uGlitchIntensity = this.targetGlitch * progress
    } else {
      this.uniforms.uGlitchIntensity = 0
    }
  }

  /** Trigger a CRT glitch/static burst */
  glitch(intensity: number = 0.3, duration: number = 0.4): void {
    this.targetGlitch = intensity
    this.glitchDuration = duration
    this.glitchTimer = duration
  }

  /** Set resolution for proper scanline scaling */
  setResolution(width: number, height: number): void {
    this.uniforms.uResolution = [width, height]
  }
}

// Singleton
let crtInstance: CRTFilter | null = null

export function initCRT(): CRTFilter {
  crtInstance = new CRTFilter()
  return crtInstance
}

export function getCRT(): CRTFilter | null {
  return crtInstance
}

export function crtGlitch(intensity: number = 0.3, duration: number = 0.4): void {
  crtInstance?.glitch(intensity, duration)
}
