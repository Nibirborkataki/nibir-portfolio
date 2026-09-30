// Raymarched liquid-metal droplets (signed distance field), lit by a procedural photo studio.
// Everything is computed per pixel on the GPU: smooth-merging droplets, chrome reflections
// with a crisp horizon, soft-box highlights, creases, and a soft contact shadow on an
// invisible floor. Output is premultiplied alpha for a transparent canvas.

export const MAX_DROPS = 6;

export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy * 2.0, 0.0, 1.0); // full-viewport quad
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform vec4 uDrops[${MAX_DROPS}]; // xyz = centre, w = radius (0 = unused)
  uniform float uTime;
  uniform float uBlend;    // how eagerly droplets melt into each other
  uniform float uWobble;   // surface ripple amplitude
  uniform float uCamZ;
  uniform float uCamY;     // camera height – below 0 lifts the droplets up in the frame
  uniform float uTanHalf;  // tan(fov / 2)
  uniform float uPixel;    // world size of one pixel at the object – for anti-aliasing
  uniform float uGround;   // y of the invisible floor
  uniform float uShadow;   // shadow strength

  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  float map(vec3 p) {
    float d = 1e3;
    for (int i = 0; i < ${MAX_DROPS}; i++) {
      vec4 b = uDrops[i];
      if (b.w > 0.001) d = smin(d, length(p - b.xyz) - b.w, uBlend);
    }
    // slow liquid undulation – mixed-direction waves so the surface never looks boxy
    float w = sin(p.x * 2.1 + p.y * 0.7 + uTime * 0.9) * cos(p.y * 2.4 - p.z * 0.6 - uTime * 0.7)
            + 0.6 * sin(p.y * 1.7 + p.z * 2.2 + uTime * 1.1)
            + 0.4 * cos(p.z * 2.6 - p.x * 1.3 - uTime * 0.8);
    d += uWobble * w * 0.5;
    return d;
  }

  vec3 calcNormal(vec3 p) {
    const vec2 e = vec2(1.0, -1.0) * 0.0015;
    return normalize(
      e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) +
      e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx)
    );
  }

  // Soft-edged rectangle in (azimuth, elevation) space – a studio light or flag.
  float rect(float az, float el, float az0, float el0, float w, float h, float soft) {
    float da = abs(atan(sin(az - az0), cos(az - az0)));
    float de = abs(el - el0);
    return (1.0 - smoothstep(w - soft, w + soft, da)) * (1.0 - smoothstep(h - soft, h + soft, de));
  }

  // The photo studio the metal reflects (linear HDR). +z points back toward the viewer.
  vec3 studio(vec3 d) {
    float el = asin(clamp(d.y, -1.0, 1.0));
    float az = atan(d.x, d.z);
    // bright sweep above (fading to a darker ceiling), dark floor below, crisp horizon
    // between – the signature of chrome. The dark ceiling outlines the top edge.
    vec3 sky = mix(vec3(0.62), vec3(0.95), smoothstep(0.0, 0.45, el));
    sky = mix(sky, vec3(0.16), smoothstep(0.75, 1.35, el));
    vec3 flo = mix(vec3(0.012), vec3(0.08), smoothstep(-1.3, -0.03, el));
    vec3 col = mix(flo, sky, smoothstep(-0.012, 0.012, el));
    // black flags left and right keep the silhouette crisp against a white page
    col *= 1.0 - 0.9 * rect(az, el, 1.8, 0.4, 0.5, 0.75, 0.2);
    col *= 1.0 - 0.9 * rect(az, el, -1.8, 0.4, 0.5, 0.75, 0.2);
    // soft boxes
    col += vec3(3.4) * rect(az, el, -0.7, 0.32, 0.15, 0.42, 0.05); // key strip, front-left
    col += vec3(1.7) * rect(az, el, 0.95, 0.22, 0.09, 0.36, 0.04); // fill strip, right
    col += vec3(2.6) * rect(az, el, 0.0, 0.95, 0.9, 0.16, 0.07);   // overhead panel, front-top
    return col;
  }

  vec3 shade(vec3 p, vec3 rd) {
    vec3 n = calcNormal(p);
    vec3 r = reflect(rd, n);
    float fres = pow(1.0 - max(dot(n, -rd), 0.0), 5.0);
    vec3 f0 = vec3(0.8); // liquid mercury / polished chrome
    vec3 c = studio(r) * (f0 + (1.0 - f0) * fres);
    // creases where droplets meet catch less light
    float ao = clamp(map(p + n * 0.09) / 0.09, 0.0, 1.0);
    return c * mix(0.45, 1.0, ao);
  }

  vec3 aces(vec3 x) {
    return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
  }

  void main() {
    vec3 ro = vec3(0.0, uCamY, uCamZ);
    vec3 rd = normalize(vec3((vUv * 2.0 - 1.0) * uTanHalf, -1.0));

    // Only march rays that pass through the sphere bounding all droplets – most of the
    // drawn square is empty space, so this skips most of the work.
    const float BOUND = 1.8;
    float b = dot(ro, rd);
    float disc = b * b - (dot(ro, ro) - BOUND * BOUND);
    float minD = 1e3;
    float t = 0.0;
    float tMin = 0.0;
    bool hit = false;
    if (disc > 0.0) {
      float root = sqrt(disc);
      t = max(-b - root, 0.0);
      float tMax = -b + root;
      tMin = t;
      for (int i = 0; i < 96; i++) {
        float d = map(ro + rd * t);
        if (d < minD) { minD = d; tMin = t; }
        if (d < 0.0006) { hit = true; break; }
        t += d * 0.92;
        if (t > tMax) break;
      }
    }

    // object (with a one-pixel soft edge for anti-aliasing)
    vec3 col = vec3(0.0);
    float alpha = 0.0;
    float aa = uPixel * 1.3;
    if (hit || minD < aa) {
      vec3 p = ro + rd * (hit ? t : tMin);
      col = pow(aces(shade(p, rd)), vec3(1.0 / 2.2));
      alpha = hit ? 1.0 : 1.0 - minD / aa;
    }

    // soft contact shadow on the invisible floor, shaped by the droplets themselves
    float shadowA = 0.0;
    vec3 g = ro + rd * ((uGround - ro.y) / min(rd.y, -1e-4));
    if (alpha < 1.0 && rd.y < 0.0 && length(g.xz) < 2.6) {
      vec3 ld = normalize(vec3(0.12, 1.0, 0.2));
      float sh = 1.0;
      float s = 0.03;
      for (int i = 0; i < 40; i++) {
        float h = map(g + ld * s);
        sh = min(sh, 4.0 * h / s); // lower = softer penumbra
        s += clamp(h, 0.03, 0.3);
        if (sh < 0.001 || s > 3.5) break;
      }
      float castShadow = 1.0 - clamp(sh, 0.0, 1.0);
      float contact = 1.0 - smoothstep(0.0, 1.1, map(g));
      shadowA = uShadow * max(castShadow * 0.55, contact * 0.45);
    }

    // fade to nothing at the edges of the drawn square, so no hard boundary can ever show
    vec2 e = min(vUv, 1.0 - vUv);
    float edge = smoothstep(0.0, 0.08, e.x) * smoothstep(0.0, 0.08, e.y);
    alpha *= edge;
    shadowA *= edge;

    // premultiplied "object over shadow"
    gl_FragColor = vec4(col * alpha, alpha + shadowA * (1.0 - alpha));
  }
`;
