import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { Maximize2, RotateCcw, Volume2, VolumeX, Sparkles } from "lucide-react";

// ============================================================
// Atkins Hero — Juan Atkins 追悼キービジュアル & Web Audio Dub Techno
// 7th Garden Vol.4 @ Compufunk Records & BAR SPACE (OSAKA)
// ============================================================

const POSTER_URL = "/promo/7th_garden_1112_flyer.jpg";

// ---- (1) Web Audio API Detroit Dub Techno Synthesizer ----
class DubTechnoEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.bpm = 124;
    this.step = 0;
    this.timerId = null;
    this.analyser = null;
    this.dataArray = null;
    this.masterGain = null;
    this.delayNode = null;
    this.delayFeedback = null;
    this.delayFilter = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    this.ctx = new AudioContextClass();

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64;
    this.analyser.smoothingTimeConstant = 0.8;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);

    // Dub Delay bus (dotted 3/16 echo at 124 BPM)
    this.delayNode = this.ctx.createDelay();
    this.delayNode.delayTime.setValueAtTime(0.363, this.ctx.currentTime);

    this.delayFeedback = this.ctx.createGain();
    this.delayFeedback.gain.setValueAtTime(0.46, this.ctx.currentTime);

    // Lowpass filter inside delay loop for authentic tape dub damping
    this.delayFilter = this.ctx.createBiquadFilter();
    this.delayFilter.type = "lowpass";
    this.delayFilter.frequency.setValueAtTime(1350, this.ctx.currentTime);

    // Wire delay feedback loop
    this.delayNode.connect(this.delayFilter);
    this.delayFilter.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);

    // Wire to master output & analyser
    this.delayNode.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  async start() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }
    this.isPlaying = true;
    this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
    this.schedule();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    }
  }

  schedule = () => {
    if (!this.isPlaying || !this.ctx) return;
    const stepDuration = 60 / this.bpm / 4;
    const now = this.ctx.currentTime;

    this.playStep(this.step, now);
    this.step = (this.step + 1) % 16;

    this.timerId = setTimeout(this.schedule, stepDuration * 1000);
  };

  playStep(step, time) {
    // Kick on quarter notes (0, 4, 8, 12)
    if (step % 4 === 0) {
      this.playKick(time);
    }
    // Offbeat open/closed hat on (2, 6, 10, 14)
    if (step % 4 === 2) {
      this.playHat(time, 0.22);
    } else if (step % 2 === 1 && Math.random() < 0.28) {
      this.playHat(time, 0.08);
    }
    // Dub chords on syncopated steps (step 4, 11)
    if (step === 4 || step === 11 || (step === 0 && Math.random() < 0.2)) {
      this.playDubChord(time);
    }
    // Deep sub bass
    if (step === 0 || step === 3 || step === 8 || step === 10) {
      const notes = [36.7, 43.65, 36.7, 41.2]; // D1, F1, D1, E1
      this.playBass(time, notes[step % notes.length]);
    }
  }

  playKick(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(145, time);
    osc.frequency.exponentialRampToValueAtTime(36, time + 0.12);

    gain.gain.setValueAtTime(0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.3);
  }

  playHat(time, vol = 0.2) {
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.04);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(7800, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.045);
  }

  playDubChord(time) {
    // Dm9 chord: D3 (146.8), F3 (174.6), A3 (220.0), C4 (261.6), E4 (329.6)
    const freqs = [146.83, 174.61, 220.0, 261.63, 329.63];

    const chordGain = this.ctx.createGain();
    chordGain.gain.setValueAtTime(0.32, time);
    chordGain.gain.exponentialRampToValueAtTime(0.001, time + 0.42);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.setValueAtTime(4.2, time);
    filter.frequency.setValueAtTime(2300, time);
    filter.frequency.exponentialRampToValueAtTime(420, time + 0.36);

    freqs.forEach((freq) => {
      [-3, 3].forEach((detune) => {
        const osc = this.ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, time);
        osc.detune.setValueAtTime(detune, time);
        osc.connect(filter);
        osc.start(time);
        osc.stop(time + 0.44);
      });
    });

    filter.connect(chordGain);
    chordGain.connect(this.masterGain);
    chordGain.connect(this.delayNode);
  }

  playBass(time, freq) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.38, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.25);
  }

  triggerDrop() {
    if (!this.ctx) this.init();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    const now = this.ctx.currentTime;
    // Sub impact bass bomb
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(26, now + 0.65);

    gain.gain.setValueAtTime(1.0, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(this.masterGain);
    gain.connect(this.delayNode);

    osc.start(now);
    osc.stop(now + 0.75);

    // Burst chord
    this.playDubChord(now + 0.04);
  }

  getAudioLevels() {
    if (!this.analyser || !this.dataArray || !this.isPlaying) {
      return { level: 0, bass: 0 };
    }
    this.analyser.getByteFrequencyData(this.dataArray);
    let bassSum = 0;
    for (let i = 0; i < 4; i++) {
      bassSum += this.dataArray[i];
    }
    const bass = bassSum / (4 * 255);

    let totalSum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      totalSum += this.dataArray[i];
    }
    const level = totalSum / (this.dataArray.length * 255);

    return { level, bass };
  }
}

// ---- (2) GLSL Shaders ----
const bgVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const bgFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uPoster;
  uniform float uTime;
  uniform float uChaos;
  uniform float uAudioLevel;
  uniform float uBassLevel;
  uniform vec2 uMouse;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = uv - 0.5;

    // 呼吸ズーム + オーディオキック連動の脈動
    float breathe = 1.0 + sin(uTime * 0.18) * 0.04 + uBassLevel * 0.14 + uChaos * 0.22;
    vec2 uvImg = p / breathe + 0.5;

    // glitch: カオス時およびビートピーク時に水平スライスずれ
    float band = floor(uvImg.y * 42.0);
    float gThreshold = 0.985 - uChaos * 0.14 - uBassLevel * 0.05;
    float g = step(gThreshold, hash(vec2(band, floor(uTime * 8.0))));
    uvImg.x += g * (hash(vec2(band + 3.0, floor(uTime * 8.0))) - 0.5) * (0.04 + uChaos * 0.25 + uBassLevel * 0.08);

    // RGB分離（音圧・ドロップで増幅）
    float ab = 0.0016 + sin(uTime * 0.7) * 0.0008 + uBassLevel * 0.012 + uChaos * 0.02;
    vec3 col;
    col.r = texture2D(uPoster, uvImg + vec2(ab, 0.0)).r;
    col.g = texture2D(uPoster, uvImg).g;
    col.b = texture2D(uPoster, uvImg - vec2(ab, 0.0)).b;

    // 冷たいシアン・ダブトーン
    col = mix(col, col * vec3(0.82, 0.94, 1.12), 0.38);

    // Vignette
    float vig = smoothstep(1.15, 0.45, length(p * vec2(1.0, 1.02)));
    col *= mix(0.62, 1.0, vig);
    col += vec3(0.0, 0.012, 0.03) * (1.0 - vig);

    // 走査線
    float scan = 0.94 + 0.06 * sin(uv.y * 720.0 + uTime * 2.0);
    col *= scan;

    // フィルムグレインノイズ
    float grain = (hash(uv * 900.0 + fract(uTime) * 137.0) - 0.5) * (0.05 + uChaos * 0.10 + uAudioLevel * 0.04);
    col += grain;

    // 明部グロー（キック音圧でフラッシュ）
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    col += vec3(0.08, 0.14, 0.20) * smoothstep(0.55, 1.0, lum) * (0.4 + 0.6 * sin(uTime * 0.9) + uBassLevel * 0.8);

    // マウス追従
    float d = length(uv - (uMouse * 0.5 + 0.5));
    col += vec3(0.04, 0.08, 0.12) * smoothstep(0.35, 0.0, d);

    gl_FragColor = vec4(col, 1.0);
  }
`;

const shardFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uPoster;
  uniform float uTime;
  uniform float uAudioLevel;
  varying vec2 vUv;
  void main() {
    vec3 col = texture2D(uPoster, vUv).rgb;
    col = mix(col, col * vec3(0.6, 0.88, 1.25), 0.45);
    float edge = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x)
               * smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.88, vUv.y);
    float alpha = 0.55 + 0.3 * sin(uTime * 1.5 + vUv.y * 6.0) + uAudioLevel * 0.4;
    gl_FragColor = vec4(col, alpha * edge);
  }
`;

// ---- (3) Text Texture Generator ----
function createTextTexture(text, options = {}) {
  const {
    textColor = "#ffffff",
    fontSize = 44,
    fontWeight = "bold",
    fontFamily = "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  } = options;

  const dpr = 2;
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  tempCtx.font = `${fontWeight} ${fontSize * dpr}px ${fontFamily}`;
  const textWidth = tempCtx.measureText(text).width;

  const padX = 16 * dpr;
  const padY = 10 * dpr;
  const canvasWidth = Math.ceil(textWidth + padX * 2);
  const canvasHeight = Math.ceil(fontSize * 1.4 * dpr + padY * 2);

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  ctx.font = `${fontWeight} ${fontSize * dpr}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const cx = canvasWidth / 2;
  const cy = canvasHeight / 2;

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
  ctx.shadowBlur = 12 * dpr;
  ctx.shadowOffsetY = 2 * dpr;
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(0, 0, 0, 0.85)";
  ctx.lineWidth = 4 * dpr;
  ctx.strokeText(text, cx, cy);
  ctx.fillStyle = textColor;
  ctx.fillText(text, cx, cy);
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;

  return { texture: tex, aspect: canvasWidth / canvasHeight };
}

// ---- (4) Main Hero Component ----
export default function AtkinsHero3D({ onOpenModal, entranceFee = "Charge Free" }) {
  const mountRef = useRef(null);
  const isIntersecting = useRef(true);
  const mousePos = useRef({ x: 0, y: 0 });
  const targetMouse = useRef({ x: 0, y: 0 });
  const chaosProgress = useRef(0);

  const [isSpinning, setIsSpinning] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef(null);

  // Init Audio Engine instance
  useEffect(() => {
    audioRef.current = new DubTechnoEngine();
    return () => {
      if (audioRef.current) {
        audioRef.current.stop();
      }
    };
  }, []);

  const toggleAudio = useCallback(async () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.stop();
      setIsPlayingAudio(false);
    } else {
      await audioRef.current.start();
      setIsPlayingAudio(true);
    }
  }, [isPlayingAudio]);

  const triggerChaos = useCallback(() => {
    chaosProgress.current = 1.0;
    setIsSpinning(true);
    if (audioRef.current) {
      audioRef.current.triggerDrop();
    }
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 360;
    let height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Poster Texture
    const loader = new THREE.TextureLoader();
    const posterTex = loader.load(POSTER_URL);
    posterTex.colorSpace = THREE.SRGBColorSpace;
    posterTex.wrapS = posterTex.wrapT = THREE.ClampToEdgeWrapping;

    // Fullscreen Shader Plane
    const bgUniforms = {
      uPoster: { value: posterTex },
      uTime: { value: 0 },
      uChaos: { value: 0 },
      uAudioLevel: { value: 0 },
      uBassLevel: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    };

    const bgGeom = new THREE.PlaneGeometry(1, 1);
    const bgMat = new THREE.ShaderMaterial({
      uniforms: bgUniforms,
      vertexShader: bgVert,
      fragmentShader: bgFrag,
      depthWrite: false,
    });
    const bgMesh = new THREE.Mesh(bgGeom, bgMat);
    bgMesh.renderOrder = -1;
    scene.add(bgMesh);

    const fitBgPlane = () => {
      const dist = 9;
      const vFOV = (camera.fov * Math.PI) / 180;
      const h = 2 * Math.tan(vFOV / 2) * dist;
      const w = h * (width / height);
      bgMesh.scale.set(w, h, 1);
      bgMesh.position.set(0, 0, -dist + camera.position.z);
    };
    fitBgPlane();

    // 3D Glass Shards
    const shardGroup = new THREE.Group();
    scene.add(shardGroup);
    const shards = [];
    const SHARD_N = 16;
    for (let i = 0; i < SHARD_N; i++) {
      const w = 0.5 + Math.random() * 0.9;
      const h = 0.5 + Math.random() * 0.9;
      const geom = new THREE.PlaneGeometry(w, h);
      const su = 0.15 + Math.random() * 0.7;
      const sv = 0.15 + Math.random() * 0.7;
      const uvAttr = geom.attributes.uv;
      for (let k = 0; k < uvAttr.count; k++) {
        uvAttr.setXY(k, su + uvAttr.getX(k) * 0.3, sv + uvAttr.getY(k) * 0.3);
      }
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uPoster: { value: posterTex },
          uTime: { value: 0 },
          uAudioLevel: { value: 0 },
        },
        vertexShader: bgVert,
        fragmentShader: shardFrag,
        transparent: true,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geom, mat);
      const a = (i / SHARD_N) * Math.PI * 2;
      mesh.userData = {
        home: new THREE.Vector3(Math.cos(a) * 1.9, Math.sin(a) * 1.5, -0.6 - Math.random() * 1.4),
        angle: a,
        speed: (0.3 + Math.random() * 0.8) * (i % 2 === 0 ? 1 : -1),
        spinX: (Math.random() - 0.5) * 6,
        spinY: (Math.random() - 0.5) * 6,
        drift: Math.random() * Math.PI * 2,
      };
      mesh.position.copy(mesh.userData.home);
      shardGroup.add(mesh);
      shards.push(mesh);
    }

    // Audio-reactive Equalizer Ring (Glowing 3D Visualizer Circle)
    const RING_COUNT = 64;
    const ringGeom = new THREE.BufferGeometry();
    const ringPos = new Float32Array(RING_COUNT * 3);
    for (let i = 0; i < RING_COUNT; i++) {
      const theta = (i / RING_COUNT) * Math.PI * 2;
      ringPos[i * 3] = Math.cos(theta) * 1.45;
      ringPos[i * 3 + 1] = Math.sin(theta) * 1.45;
      ringPos[i * 3 + 2] = 0.2;
    }
    ringGeom.setAttribute("position", new THREE.BufferAttribute(ringPos, 3));
    const ringMat = new THREE.LineBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      linewidth: 2,
    });
    const ringLine = new THREE.LineLoop(ringGeom, ringMat);
    scene.add(ringLine);

    // Holographic Typography
    const textItems = [
      { text: "IN MEMORIAM", color: "#9fd8ff", size: 34, height: 0.24, pos: [0, 1.62, 0.5] },
      { text: "JUAN ATKINS", color: "#ffffff", size: 64, height: 0.46, pos: [0, 1.28, 0.6] },
      { text: "7th GARDEN Vol.4", color: "#e2e8f0", size: 40, height: 0.3, pos: [0, -1.28, 0.6] },
      { text: "11/12 (THU) 2026 — 18:00 → 24:00", color: "#cfe6ff", size: 30, height: 0.22, pos: [0, -1.56, 0.55] },
      { text: "Compufunk Records & BAR SPACE (OSAKA) — Charge Free", color: "#cbd5e1", size: 24, height: 0.18, pos: [0, -1.78, 0.5] },
    ];

    const textMeshes = [];
    textItems.forEach((item, index) => {
      const { texture, aspect } = createTextTexture(item.text, {
        textColor: item.color,
        fontSize: item.size,
      });
      const geom = new THREE.PlaneGeometry(item.height * aspect, item.height);
      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(...item.pos);
      const angle = (index / textItems.length) * Math.PI * 2;
      mesh.userData = {
        homePos: new THREE.Vector3(...item.pos),
        geometry: geom,
        material: mat,
        texture: texture,
        angle,
        orbitSpeed: (1.6 + Math.random() * 2.4) * (index % 2 === 0 ? 1 : -1),
        orbitRadius: 1.6 + Math.random() * 1.6,
        spinSpeedX: (Math.random() - 0.5) * 7,
        spinSpeedY: (Math.random() - 0.5) * 9,
        spinSpeedZ: (Math.random() - 0.5) * 5,
      };
      scene.add(mesh);
      textMeshes.push(mesh);
    });

    // Particle Spores (Dust)
    const N = 280;
    const pGeom = new THREE.BufferGeometry();
    const pPos = new Float32Array(N * 3);
    const pCol = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 14;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 9;
      pPos[i * 3 + 2] = -1 - Math.random() * 6;
      const b = 0.7 + Math.random() * 0.3;
      pCol[i * 3] = b * (Math.random() < 0.25 ? 0.6 : 1);
      pCol[i * 3 + 1] = b * (Math.random() < 0.25 ? 0.85 : 1);
      pCol[i * 3 + 2] = b;
    }
    pGeom.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    pGeom.setAttribute("color", new THREE.BufferAttribute(pCol, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(pGeom, pMat);
    scene.add(particles);

    // Dub Pulse Scanning Beam
    const beamGeom = new THREE.PlaneGeometry(14, 0.06);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x8fd4ff,
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const beam = new THREE.Mesh(beamGeom, beamMat);
    scene.add(beam);

    // Interaction Listeners
    const handleMove = (e) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      targetMouse.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      targetMouse.current.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
    };
    const handleLeave = () => {
      targetMouse.current.x = 0;
      targetMouse.current.y = 0;
    };
    const handleClick = () => {
      triggerChaos();
    };

    container.addEventListener("mousemove", handleMove);
    container.addEventListener("touchmove", handleMove, { passive: true });
    container.addEventListener("mouseleave", handleLeave);
    container.addEventListener("touchend", handleLeave);
    container.addEventListener("click", handleClick);

    // Animation Loop
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      if (isIntersecting.current) {
        const t = clock.getElapsedTime();

        // Audio Reactive Values
        let audioLevel = 0;
        let bassLevel = 0;
        if (audioRef.current && audioRef.current.isPlaying) {
          const levels = audioRef.current.getAudioLevels();
          audioLevel = levels.level;
          bassLevel = levels.bass;
        } else {
          // Rhythmic fallback simulation at 124 BPM
          const beat = Math.sin(t * 13.0);
          bassLevel = Math.max(0, beat) * 0.45;
          audioLevel = 0.15 + bassLevel * 0.25;
        }

        mousePos.current.x = THREE.MathUtils.lerp(mousePos.current.x, targetMouse.current.x, 0.05);
        mousePos.current.y = THREE.MathUtils.lerp(mousePos.current.y, targetMouse.current.y, 0.05);

        if (chaosProgress.current > 0.005) {
          chaosProgress.current = THREE.MathUtils.lerp(chaosProgress.current, 0, 0.022);
        } else {
          chaosProgress.current = 0;
          setIsSpinning(false);
        }
        const chaos = chaosProgress.current;

        bgUniforms.uTime.value = t;
        bgUniforms.uChaos.value = chaos;
        bgUniforms.uAudioLevel.value = audioLevel;
        bgUniforms.uBassLevel.value = bassLevel;
        bgUniforms.uMouse.value.set(mousePos.current.x, mousePos.current.y);

        // Camera gentle drift & bass reaction
        camera.position.x = Math.sin(t * 0.22) * 0.1 + mousePos.current.x * 0.22;
        camera.position.y = Math.cos(t * 0.18) * 0.08 + mousePos.current.y * 0.18;
        camera.position.z = 5 - chaos * 0.6 - bassLevel * 0.15;
        camera.lookAt(0, 0, 0);
        fitBgPlane();

        // Animate Equalizer Ring
        const posArr = ringGeom.attributes.position.array;
        const baseR = 1.45 + bassLevel * 0.35 + chaos * 0.4;
        for (let i = 0; i < RING_COUNT; i++) {
          const theta = (i / RING_COUNT) * Math.PI * 2;
          const wave = Math.sin(theta * 8.0 + t * 4.0) * (0.04 + bassLevel * 0.12);
          const r = baseR + wave;
          posArr[i * 3] = Math.cos(theta) * r;
          posArr[i * 3 + 1] = Math.sin(theta) * r;
        }
        ringGeom.attributes.position.needsUpdate = true;
        ringMat.opacity = 0.35 + bassLevel * 0.6 + chaos * 0.3;

        // Shards motion
        shards.forEach((mesh) => {
          const u = mesh.userData;
          const idle = new THREE.Vector3(
            u.home.x + Math.sin(t * 0.4 + u.drift) * 0.12,
            u.home.y + Math.cos(t * 0.35 + u.drift) * 0.12,
            u.home.z
          );
          const ca = u.angle + t * u.speed * 2.2;
          const r = 2.4 + Math.sin(t * 1.6 + u.drift) * 0.8 + bassLevel * 0.4;
          const chaosPos = new THREE.Vector3(
            Math.cos(ca) * r,
            Math.sin(ca) * r * 0.75,
            -1.5 + Math.sin(ca * 2 + u.drift) * 2.2
          );
          mesh.position.lerpVectors(idle, chaosPos, chaos);
          if (chaos > 0.01) {
            mesh.rotation.x = t * u.spinX * chaos;
            mesh.rotation.y = t * u.spinY * chaos;
          } else {
            mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, Math.sin(t * 0.3 + u.drift) * 0.12, 0.08);
            mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, mousePos.current.x * 0.3, 0.06);
          }
          mesh.material.uniforms.uTime.value = t;
          mesh.material.uniforms.uAudioLevel.value = audioLevel;
        });

        // Text typography motion
        textMeshes.forEach((mesh) => {
          const u = mesh.userData;
          const idlePos = new THREE.Vector3(
            u.homePos.x + Math.sin(t * 0.9 + u.angle) * 0.05,
            u.homePos.y + Math.cos(t * 0.8 + u.angle) * 0.05,
            u.homePos.z
          );
          const ca = u.angle + t * u.orbitSpeed;
          const cr = u.orbitRadius * (1 + Math.sin(t * 2) * 0.3);
          const chaosPos = new THREE.Vector3(
            Math.cos(ca) * cr,
            Math.sin(ca) * cr * 0.8,
            u.homePos.z + Math.sin(ca * 2) * 1.6
          );
          mesh.position.lerpVectors(idlePos, chaosPos, chaos);
          if (chaos > 0.01) {
            mesh.rotation.x = THREE.MathUtils.lerp(0, t * u.spinSpeedX, chaos);
            mesh.rotation.y = THREE.MathUtils.lerp(0, t * u.spinSpeedY, chaos);
            mesh.rotation.z = THREE.MathUtils.lerp(0, ca, chaos);
          } else {
            mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, 0, 0.1);
            mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, 0, 0.1);
            mesh.rotation.z = THREE.MathUtils.lerp(mesh.rotation.z, 0, 0.1);
          }
          if (u.homePos.y > 1.5) {
            u.material.opacity = 0.75 + Math.sin(t * 0.6) * 0.25;
          }
        });

        // Pulse scanning beam
        beam.position.y = ((t * 0.35) % 2.4) - 1.2;
        beam.material.opacity = 0.10 + Math.max(0, Math.sin(t * 1.7)) * 0.10 + bassLevel * 0.12;

        particles.rotation.y = t * 0.015;
        particles.position.x = mousePos.current.x * 0.3;

        renderer.render(scene, camera);
      }
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      fitBgPlane();
    };
    window.addEventListener("resize", handleResize);

    const observer = new IntersectionObserver(([entry]) => {
      isIntersecting.current = entry.isIntersecting;
    });
    observer.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMove);
      container.removeEventListener("touchmove", handleMove);
      container.removeEventListener("mouseleave", handleLeave);
      container.removeEventListener("touchend", handleLeave);
      container.removeEventListener("click", handleClick);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      bgGeom.dispose();
      bgMat.dispose();
      beamGeom.dispose();
      beamMat.dispose();
      pGeom.dispose();
      pMat.dispose();
      ringGeom.dispose();
      ringMat.dispose();
      posterTex.dispose();
      shards.forEach((m) => {
        m.geometry.dispose();
        m.material.dispose();
      });
      textMeshes.forEach((m) => {
        m.userData.geometry.dispose();
        m.userData.material.dispose();
        m.userData.texture.dispose();
      });
      renderer.dispose();
    };
  }, [triggerChaos]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-[#04060b] border border-cyan-200/20 shadow-2xl select-none">
      {/* 3D Key Visual Canvas */}
      <div
        ref={mountRef}
        className="w-full h-[520px] sm:h-[580px] relative overflow-hidden cursor-pointer"
        title="タップ/クリックでドロップ＆拡散します"
      />

      {/* Top Left Badge */}
      <div className="absolute top-3.5 left-3.5 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/75 backdrop-blur-md border border-cyan-200/30 text-cyan-100 font-mono text-[10px] font-bold tracking-widest rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
          <span>7TH GARDEN Vol.4</span>
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-100/10 backdrop-blur-md border border-cyan-100/20 text-cyan-50 font-mono text-[10px] font-bold tracking-widest rounded-full">
          {entranceFee}
        </span>
      </div>

      {/* Top Right Controls (Sound Toggle & Diffuse / Drop) */}
      <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-2">
        {/* Sound ON/OFF Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleAudio();
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md border transition-all text-[10px] font-mono font-bold shadow-lg ${
            isPlayingAudio
              ? "bg-cyan-300 text-black border-cyan-200 shadow-cyan-400/30 scale-105 animate-pulse"
              : "bg-black/80 hover:bg-cyan-900/40 text-cyan-200 border-cyan-300/40 hover:border-cyan-200"
          }`}
          title="Web Audio APIによる124 BPMデトロイト・ダブテクノ実音再生"
        >
          {isPlayingAudio ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-black animate-bounce" />
              <span>124 BPM SOUND ON</span>
              <span className="flex items-center gap-0.5 ml-0.5">
                <span className="w-1 h-2.5 bg-black rounded-full animate-ping" />
                <span className="w-1 h-3.5 bg-black rounded-full animate-pulse" />
              </span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-cyan-300" />
              <span className="text-cyan-100">SOUND: OFF (TAP TO PLAY)</span>
            </>
          )}
        </button>

        {/* Diffuse / Drop Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerChaos();
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md border transition-all text-[10px] font-mono font-bold shadow-md ${
            isSpinning
              ? "bg-purple-300 text-black border-purple-200 scale-105"
              : "bg-black/75 hover:bg-cyan-100/15 text-cyan-100 border-cyan-200/25 hover:border-cyan-100"
          }`}
        >
          <RotateCcw className={`w-3 h-3 ${isSpinning ? "animate-spin text-black" : "text-cyan-100"}`} />
          <span>{isSpinning ? "DIFFUSING" : "⚡ DROP / DIFFUSE"}</span>
        </button>
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 flex items-center justify-between gap-2 pointer-events-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerChaos();
          }}
          className="text-[10px] font-mono text-cyan-100/90 bg-black/70 hover:bg-black/90 backdrop-blur-md border border-cyan-200/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md"
        >
          <Sparkles className="w-3 h-3 text-cyan-300" />
          <span className="text-cyan-50 font-bold">画面タップ</span>
          <span>でドロップ ↺</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenModal && onOpenModal();
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-100/15 hover:bg-cyan-100/25 backdrop-blur-md border border-cyan-100/30 text-cyan-50 font-mono text-[11px] font-bold shadow-lg transition-all active:scale-95"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>公式ポスター拡大</span>
        </button>
      </div>
    </div>
  );
}
