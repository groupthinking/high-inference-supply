/**
 * Luxury WebGL2 Atmospheric Silk & Caustic Light Field.
 * Renders slow-moving sculptural folds in obsidian, smoked slate, and brushed bronze
 * that react with velvety inertia to pointer movement and scroll depth.
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

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    v += amp * noise(p);
    p = rot * p * 2.02;
    amp *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  vec2 ptr = (u_pointer - 0.5) * vec2(u_resolution.x / min(u_resolution.x, u_resolution.y), 1.0);

  float t = u_time * 0.14;
  float scrollDrift = u_scroll * 1.8;
  float vel = clamp(abs(u_velocity) * 0.015, 0.0, 0.4);

  // Domain-warped architectural silk folds
  vec2 q = vec2(
    fbm(uv * 1.45 + vec2(t * 0.6, scrollDrift * 0.3)),
    fbm(uv * 1.45 + vec2(-t * 0.45, 2.4 - scrollDrift * 0.25))
  );

  vec2 r = vec2(
    fbm(uv * 1.9 + 2.6 * q + vec2(1.7, 9.2) + t * 0.35 - ptr * 0.28),
    fbm(uv * 1.9 + 2.6 * q + vec2(8.3, 2.8) - t * 0.28 + ptr * 0.22)
  );

  float f = fbm(uv * 1.6 + 2.2 * r + vel);

  // Sculptural light ridges (caustic silk crest)
  float crest = smoothstep(0.52, 0.86, f);
  float fineRibbon = smoothstep(0.95, 0.996, abs(sin((uv.x * 2.2 + r.x * 3.1 - t) * 3.14159)));

  // Luxury darkroom palette
  vec3 obsidian = vec3(0.035, 0.036, 0.042);
  vec3 smokedSlate = vec3(0.11, 0.135, 0.165);
  vec3 brushedBronze = vec3(0.71, 0.537, 0.278);
  vec3 warmIvory = vec3(0.92, 0.90, 0.86);

  vec3 col = mix(obsidian, smokedSlate, smoothstep(0.18, 0.72, f) * 0.75);
  col += brushedBronze * crest * 0.28;
  col += mix(brushedBronze, warmIvory, 0.45) * fineRibbon * 0.14;

  // Soft gallery spotlight following pointer
  float spot = exp(-length(uv - ptr * 0.45) * 2.3);
  col += brushedBronze * spot * 0.075;

  // Vignette framing
  float vig = smoothstep(1.38, 0.2, length(uv));
  col *= mix(0.45, 1.0, vig);

  // Ultra-fine film grain
  float grain = (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) * 0.016;
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
      'radial-gradient(circle at 65% 32%, rgba(181, 137, 71, 0.16), #09090B 66%)';
    return { updateMetrics() {} };
  }

  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('WebGL2 compile error:', gl.getShaderInfoLog(shader));
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

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return { updateMetrics() {} };

  gl.useProgram(program);
  const uResolution = gl.getUniformLocation(program, 'u_resolution');
  const uTime = gl.getUniformLocation(program, 'u_time');
  const uScroll = gl.getUniformLocation(program, 'u_scroll');
  const uVelocity = gl.getUniformLocation(program, 'u_velocity');
  const uPointer = gl.getUniformLocation(program, 'u_pointer');

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const metrics = {
    scroll: 0,
    velocity: 0,
    targetPointerX: 0.5,
    targetPointerY: 0.5,
    pointerX: 0.5,
    pointerY: 0.5,
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
    metrics.pointerX += (metrics.targetPointerX - metrics.pointerX) * 0.05;
    metrics.pointerY += (metrics.targetPointerY - metrics.pointerY) * 0.05;
    metrics.velocity *= 0.92;

    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.uniform1f(uTime, t);
    gl.uniform1f(uScroll, metrics.scroll);
    gl.uniform1f(uVelocity, metrics.velocity);
    gl.uniform2f(uPointer, metrics.pointerX, metrics.pointerY);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);

  return {
    updateMetrics({ scroll, velocity }) {
      if (typeof scroll === 'number') metrics.scroll = scroll;
      if (typeof velocity === 'number') metrics.velocity = velocity;
    },
  };
}
