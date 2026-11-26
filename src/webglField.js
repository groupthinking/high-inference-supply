/**
 * Interactive WebGL2 orbital interference & phosphor telemetry field.
 * Renders harmonic flow lines inspired by High Inference's optical study
 * and hero interference graphic, reacting to scroll velocity, chapter, and pointer.
 */

const VERTEX_SHADER = `#version 300 es
precision highp float;
const vec2 POS[3] = vec2[3](
  vec2(-1.0, -1.0),
  vec2( 3.0, -1.0),
  vec2(-1.0,  3.0)
);
out vec2 vUv;
void main() {
  vec2 p = POS[gl_VertexID];
  vUv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_scroll;
uniform float u_velocity;
uniform vec2 u_pointer;
uniform float u_chapter;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  vec2 ptr = (u_pointer - 0.5) * vec2(u_resolution.x / min(u_resolution.x, u_resolution.y), 1.0);

  // Subtle orbital warp driven by scroll & pointer
  float t = u_time * 0.22;
  float scrollPhase = u_scroll * 3.4;
  float velBoost = clamp(abs(u_velocity) * 0.045, 0.0, 1.4);

  // Rotate coordinates gently with scroll
  float angle = 0.24 * sin(t * 0.5 + scrollPhase * 0.35) + scrollPhase * 0.14;
  float ca = cos(angle), sa = sin(angle);
  vec2 p = mat2(ca, -sa, sa, ca) * uv;

  // Pointer gravity well displacement
  vec2 dp = p - ptr * 0.55;
  float distPtr = length(dp);
  p += dp * exp(-distPtr * 3.2) * (0.14 + velBoost * 0.08);

  // Dual harmonic toroidal interference field (inspired by hero-dark-v1.webp)
  float r1 = length(p - vec2(0.32 * cos(t), 0.18 * sin(t * 1.1)));
  float r2 = length(p + vec2(0.32 * cos(t * 0.9), 0.20 * cos(t * 0.7)));

  float waveA = sin(r1 * 28.0 - t * 3.0 + scrollPhase * 2.0 + p.x * 4.5);
  float waveB = sin(r2 * 24.0 + t * 2.4 - scrollPhase * 1.6 - p.y * 5.0);

  // Fine architectural contour lines
  float lineA = smoothstep(0.92, 0.995, abs(waveA));
  float lineB = smoothstep(0.93, 0.996, abs(waveB));
  float interference = smoothstep(0.86, 0.99, abs(waveA * waveB));

  // Subtle CRT scanline cadence
  float scan = 0.96 + 0.04 * sin(gl_FragCoord.y * 1.6 + u_time * 2.0);

  // Brand palette: Obsidian (#0A0A0A), Smoke Blue (#4E6373), Phosphor Ochre (#C68A2B), Bone (#F5F6F0)
  vec3 obsidian = vec3(0.039, 0.039, 0.041);
  vec3 smokeBlue = vec3(0.24, 0.42, 0.62);
  vec3 phosphorOchre = vec3(0.776, 0.541, 0.169);
  vec3 bone = vec3(0.96, 0.965, 0.94);

  // Attenuate intensity after Act 1 hero so product photography stays crisp
  float heroPresence = mix(1.0, 0.32, smoothstep(0.05, 0.30, u_scroll));
  float vignette = smoothstep(1.35, 0.15, length(uv));

  vec3 col = obsidian;
  col += smokeBlue * lineA * (0.26 + velBoost * 0.18) * heroPresence * vignette;
  col += mix(smokeBlue, phosphorOchre, 0.55) * lineB * 0.16 * heroPresence * vignette;
  col += phosphorOchre * interference * (0.28 + velBoost * 0.25) * heroPresence * vignette;

  // Sparse telemetry node sparks along interference ridges
  float spark = step(0.9975, hash(floor(p * 32.0))) * interference * heroPresence;
  col += bone * spark * 0.7;

  // Radial phosphor glow near pointer
  col += phosphorOchre * exp(-distPtr * 4.5) * 0.055 * heroPresence;

  col *= scan;

  // Fine film grain
  float grain = (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) * 0.018;
  col += grain;

  outColor = vec4(col, 1.0);
}
`;

export function initWebGLField(canvas) {
  if (!canvas) return { updateMetrics() {} };

  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    powerPreference: 'high-performance',
  });

  if (!gl) {
    canvas.style.background =
      'radial-gradient(circle at 60% 35%, rgba(78, 99, 115, 0.24), #0A0A0A 68%)';
    return { updateMetrics() {} };
  }

  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('WebGL2 shader compile error:', gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  };

  const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
  const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vs || !fs) return { updateMetrics() {} };

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('WebGL2 link error:', gl.getProgramInfoLog(program));
    return { updateMetrics() {} };
  }

  gl.useProgram(program);

  const uResolution = gl.getUniformLocation(program, 'u_resolution');
  const uTime = gl.getUniformLocation(program, 'u_time');
  const uScroll = gl.getUniformLocation(program, 'u_scroll');
  const uVelocity = gl.getUniformLocation(program, 'u_velocity');
  const uPointer = gl.getUniformLocation(program, 'u_pointer');
  const uChapter = gl.getUniformLocation(program, 'u_chapter');

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const metrics = {
    scroll: 0,
    velocity: 0,
    targetPointerX: 0.5,
    targetPointerY: 0.5,
    pointerX: 0.5,
    pointerY: 0.5,
    chapter: 1,
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.floor(window.innerWidth * dpr);
    const h = Math.floor(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  };

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener(
    'pointermove',
    (e) => {
      metrics.targetPointerX = e.clientX / window.innerWidth;
      metrics.targetPointerY = 1.0 - e.clientY / window.innerHeight;
    },
    { passive: true }
  );

  resize();

  const start = performance.now();
  const render = (now) => {
    const t = (now - start) * 0.001;
    metrics.pointerX += (metrics.targetPointerX - metrics.pointerX) * 0.07;
    metrics.pointerY += (metrics.targetPointerY - metrics.pointerY) * 0.07;
    metrics.velocity *= 0.92;

    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.uniform1f(uTime, t);
    gl.uniform1f(uScroll, metrics.scroll);
    gl.uniform1f(uVelocity, metrics.velocity);
    gl.uniform2f(uPointer, metrics.pointerX, metrics.pointerY);
    gl.uniform1f(uChapter, metrics.chapter);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);

  return {
    updateMetrics({ scroll, velocity, chapter }) {
      if (typeof scroll === 'number') metrics.scroll = scroll;
      if (typeof velocity === 'number') metrics.velocity = velocity;
      if (typeof chapter === 'number') metrics.chapter = chapter;
    },
  };
}
