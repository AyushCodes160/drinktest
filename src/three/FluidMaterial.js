import * as THREE from 'three';

// Glowing, viscous "energy sludge". The vertex stage turns a unit sphere into a twisting,
// bulging column displaced by 3D simplex noise (a Perlin-family gradient noise); the
// fragment stage lights it with a fresnel rim, a hot core and a wet specular highlight.

const NOISE = /* glsl */ `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
      i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
      i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
`;

const columnVertex = /* glsl */ `
  uniform float uTime;
  uniform float uHeight;   // column length
  uniform float uRadius;   // column thickness
  uniform float uCenterY;  // column center (local)
  uniform float uTwist;    // radians of twist per unit of column
  uniform float uAmp;      // noise displacement strength
  uniform float uFreq;     // noise frequency
  varying vec3 vNormalV;
  varying vec3 vViewPos;
  varying float vNoise;

  ${NOISE}

  // Unit-sphere point -> displaced point on the fluid column.
  vec3 shape(vec3 p, out float n) {
    vec3 q = vec3(p.x * uRadius, p.y * uHeight * 0.5 + uCenterY, p.z * uRadius);
    // Peristaltic bulges travelling along the column.
    float bulge = 1.0 + 0.24 * sin(p.y * 7.0 - uTime * 2.6) + 0.12 * sin(p.y * 13.0 + uTime * 1.9);
    q.xz *= bulge;
    // Twist around the axis.
    float a = p.y * uTwist + uTime * 0.9;
    q.xz = mat2(cos(a), -sin(a), sin(a), cos(a)) * q.xz;
    // Slow, viscous noise pushing the surface in and out.
    n = snoise(q * uFreq + vec3(0.0, -uTime * 0.55, uTime * 0.25));
    q += normalize(vec3(p.x, p.y * 0.35, p.z) + 1e-5) * n * uAmp;
    return q;
  }

  void main() {
    vec3 p = normalize(position);
    float n;
    vec3 q = shape(p, n);

    // Recompute the normal from two nearby displaced points.
    vec3 t1 = normalize(abs(p.y) > 0.99 ? cross(p, vec3(1.0, 0.0, 0.0)) : cross(p, vec3(0.0, 1.0, 0.0)));
    vec3 t2 = normalize(cross(p, t1));
    float eps = 0.01;
    float na, nb;
    vec3 qa = shape(normalize(p + t1 * eps), na);
    vec3 qb = shape(normalize(p + t2 * eps), nb);
    vec3 nrm = normalize(cross(qa - q, qb - q));
    if (dot(nrm, q - vec3(0.0, uCenterY, 0.0)) < 0.0) nrm = -nrm;

    vec4 mv = modelViewMatrix * vec4(q, 1.0);
    vViewPos = mv.xyz;
    vNormalV = normalize(normalMatrix * nrm);
    vNoise = n;
    gl_Position = projectionMatrix * mv;
  }
`;

// Metaball surfaces from MarchingCubes already have smooth normals; no displacement needed.
const blobVertex = /* glsl */ `
  varying vec3 vNormalV;
  varying vec3 vViewPos;
  varying float vNoise;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewPos = mv.xyz;
    vNormalV = normalize(normalMatrix * normal);
    vNoise = position.y * 2.0;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  uniform float uTime;
  uniform float uGlow;
  uniform float uOpacity;
  varying vec3 vNormalV;
  varying vec3 vViewPos;
  varying float vNoise;

  void main() {
    vec3 N = normalize(vNormalV);
    vec3 V = normalize(-vViewPos);
    float facing = max(dot(N, V), 0.0);
    float fres = pow(1.0 - facing, 2.2);

    vec3 deep = vec3(0.03, 0.28, 0.06);
    vec3 lime = vec3(0.78, 1.0, 0.18);
    vec3 hot = vec3(0.95, 1.0, 0.72);

    // Slow internal bands, like light scattering through thick liquid.
    float bands = 0.5 + 0.5 * sin(vNoise * 5.0 + uTime * 1.3);
    vec3 col = mix(deep, lime, 0.25 + 0.55 * fres + 0.2 * bands);
    col += hot * pow(fres, 4.0) * 0.9;

    // Wet specular highlight from a key light above-right.
    vec3 L = normalize(vec3(0.5, 0.9, 0.6));
    vec3 H = normalize(L + V);
    col += vec3(pow(max(dot(N, H), 0.0), 70.0)) * 1.1;

    gl_FragColor = vec4(col * uGlow, uOpacity);
  }
`;

export function createColumnMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: columnVertex,
    fragmentShader: fragment,
    uniforms: {
      uTime: { value: 0 },
      uHeight: { value: 0 },
      uRadius: { value: 0 },
      uCenterY: { value: 0 },
      uTwist: { value: 2.2 },
      uAmp: { value: 0.12 },
      uFreq: { value: 2.2 },
      uGlow: { value: 1.6 },
      uOpacity: { value: 0.96 },
    },
    transparent: true,
    toneMapped: false,
  });
}

export function createBlobMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: blobVertex,
    fragmentShader: fragment,
    uniforms: {
      uTime: { value: 0 },
      uGlow: { value: 1.5 },
      uOpacity: { value: 0.96 },
    },
    transparent: true,
    toneMapped: false,
  });
}
