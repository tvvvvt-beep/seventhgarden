import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Maximize2, RotateCcw } from "lucide-react";

// Canvasから高精細・可読性重視のタイポグラフィテクスチャを生成
// （枠線なし・半透明ダークピル＆黒アウトラインで写真の上に重なっても100%読める）
function createTextTexture(text, options = {}) {
  const {
    textColor = "#ffffff",
    fontSize = 44,
    fontWeight = "bold",
    fontFamily = "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  } = options;

  // Retina 2x 高解像度レンダリング
  const dpr = 2;
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  tempCtx.font = `${fontWeight} ${fontSize * dpr}px ${fontFamily}`;
  const textMetrics = tempCtx.measureText(text);
  const textWidth = textMetrics.width;

  // パディングを確保し、長いテキストでも端が絶対に切れないように計算
  const padX = 24 * dpr;
  const padY = 12 * dpr;
  const canvasWidth = Math.ceil(textWidth + padX * 2);
  const canvasHeight = Math.ceil(fontSize * 1.5 * dpr + padY * 2);

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");

  // 半透明ダークピル（枠線ではなく、写真や背景の上に重なっても確実に文字を読めるようにするバックドロップ）
  ctx.save();
  ctx.fillStyle = "rgba(6, 8, 14, 0.78)";
  const radius = canvasHeight * 0.28;
  ctx.beginPath();
  ctx.roundRect(padX * 0.25, padY * 0.25, canvasWidth - padX * 0.5, canvasHeight - padY * 0.5, radius);
  ctx.fill();
  ctx.restore();

  // フォント描画設定
  ctx.font = `${fontWeight} ${fontSize * dpr}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const cx = canvasWidth / 2;
  const cy = canvasHeight / 2;

  // 太い黒アウトライン（写真のハイライト部分と重なっても輪郭を完璧に際立たせる）
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  ctx.strokeStyle = "rgba(0, 0, 0, 0.95)";
  ctx.lineWidth = 6 * dpr;
  ctx.strokeText(text, cx, cy);

  // 文字本体（純白・シルバー）
  ctx.fillStyle = textColor;
  ctx.fillText(text, cx, cy);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;

  return {
    texture: tex,
    aspect: canvasWidth / canvasHeight,
  };
}

export default function DynamicHero3D({ 
  photoImage = "/promo/7th_garden_0917_photo_only.jpg", 
  bannerImage = "/hero-banner.jpg", 
  onOpenModal,
  entranceFee = "Charge Free"
}) {
  const mountRef = useRef(null);
  const isIntersecting = useRef(true);
  const mousePos = useRef({ x: 0, y: 0 });
  const targetMouse = useRef({ x: 0, y: 0 });

  // カオススピン状態 (1.0: 最大スピン, 0: 元の位置)
  const chaosProgress = useRef(0);
  const [isSpinning, setIsSpinning] = useState(false);

  // クリック時のトリガー（ランダムにぐるぐる回る）
  const triggerChaos = () => {
    chaosProgress.current = 1.0;
    setIsSpinning(true);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 360;
    let height = container.clientHeight || 480;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06070d, 0.08);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.4);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true, 
      powerPreference: "high-performance" 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 3. Textures
    const textureLoader = new THREE.TextureLoader();

    // 写真アートワーク単体 (468 x 762 -> aspect: 0.61417)
    // 縦横比率厳守: 幅 2.2, 高さ 3.58
    const photoTex = textureLoader.load(photoImage);
    photoTex.colorSpace = THREE.SRGBColorSpace;
    photoTex.generateMipmaps = true;
    photoTex.minFilter = THREE.LinearMipmapLinearFilter;

    // 奥の横長バナー (1024 x 434)
    const bannerTex = textureLoader.load(bannerImage);
    bannerTex.colorSpace = THREE.SRGBColorSpace;

    // 4. メイングループ
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // --- (A) 中央の写真アートワークメッシュ (枠線なし・純粋な写真) ---
    // 縦横比率厳守 (468:762 = 0.61417) かつ上下の余白を確保するためコンパクトに調整
    const photoHeight = 3.0;
    const photoWidth = photoHeight * 0.61417; // 約 1.84
    const photoGeom = new THREE.PlaneGeometry(photoWidth, photoHeight);
    const photoMat = new THREE.MeshPhysicalMaterial({
      map: photoTex,
      transparent: true,
      roughness: 0.25,
      metalness: 0.05,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
      reflectivity: 0.5,
      side: THREE.FrontSide, // 正面・反転なし
    });
    const photoMesh = new THREE.Mesh(photoGeom, photoMat);
    photoMesh.position.set(0, 0.0, 0.1);
    mainGroup.add(photoMesh);

    // --- (B) 奥のシネマティックワイドバナー (枠線なし) ---
    const bannerGeom = new THREE.PlaneGeometry(4.4, 1.865);
    const bannerMat = new THREE.MeshPhysicalMaterial({
      map: bannerTex,
      transparent: true,
      opacity: 0.35,
      roughness: 0.5,
      metalness: 0.1,
      side: THREE.FrontSide,
    });
    const bannerMesh = new THREE.Mesh(bannerGeom, bannerMat);
    bannerMesh.position.set(0, 0.2, -1.5);
    mainGroup.add(bannerMesh);

    // --- (C) 写真以外の全フライヤー要素（縦をギュッと詰めて上下の切れを解消） ---
    // 上下の安全マージンを確保し、中央に美しくスタック配置
    const textItems = [
      { text: "7th GARDEN", color: "#ffffff", size: 48, height: 0.36, pos: [0, 1.18, 0.65] },
      { text: "09/17 (THU)", color: "#f8fafc", size: 38, height: 0.28, pos: [0, 0.90, 0.62] },
      { text: "Compufunk Records & BAR", color: "#ffffff", size: 38, height: 0.28, pos: [0, 0.64, 0.60] },
      { text: "18:00~24:00 Charge Free", color: "#e2e8f0", size: 34, height: 0.25, pos: [0, 0.39, 0.58] },
      { text: "DJ: toru yamanaka (Dumb Type)", color: "#ffffff", size: 32, height: 0.24, pos: [0, 0.15, 0.56] },
      { text: "Dune (U.V.)  /  tvvt", color: "#f1f5f9", size: 32, height: 0.24, pos: [0, -0.08, 0.55] },
      { text: "KASSIS. (MOKSA.)  /  youngANDoldNEVERdie", color: "#f8fafc", size: 30, height: 0.23, pos: [0, -0.31, 0.54] },
      { text: "Selector: Sen 11", color: "#e2e8f0", size: 30, height: 0.23, pos: [-0.58, -0.54, 0.52] },
      { text: "CRYSTAL BOWL: tamako", color: "#f1f5f9", size: 30, height: 0.23, pos: [0.58, -0.54, 0.52] },
      { text: "Live P.A.: Sen & Jerry", color: "#f8fafc", size: 30, height: 0.23, pos: [0, -0.77, 0.52] },
      { text: "LIVE PAINT + VISUALS : FisH + HIWATASHI", color: "#ffffff", size: 30, height: 0.23, pos: [0, -1.00, 0.52] },
      { text: "PLACE FOR ART AND MUSIC", color: "#cbd5e1", size: 28, height: 0.22, pos: [-0.55, -1.23, 0.5] },
      { text: "\"PayPay tipping method\"", color: "#e2e8f0", size: 28, height: 0.22, pos: [0.55, -1.23, 0.5] },
    ];

    const textMeshes = [];

    textItems.forEach((item, index) => {
      // 動的Canvasでアスペクト比を自動算出し、一切文字切れ・歪みなしで生成
      const { texture, aspect } = createTextTexture(item.text, {
        textColor: item.color,
        fontSize: item.size,
      });

      const geom = new THREE.PlaneGeometry(item.height * aspect, item.height);
      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      const mesh = new THREE.Mesh(geom, mat);

      // 初期配置 (定位置)
      mesh.position.set(item.pos[0], item.pos[1], item.pos[2]);

      // スピン・渦巻き動作用パラメータ
      const angle = (index / textItems.length) * Math.PI * 2;
      const speed = 2.0 + Math.random() * 3.0;
      const radius = 1.8 + Math.random() * 2.0;
      const dir = index % 2 === 0 ? 1 : -1;

      mesh.userData = {
        homePos: new THREE.Vector3(...item.pos),
        geometry: geom,
        angle: angle,
        orbitSpeed: speed * dir,
        orbitRadius: radius,
        spinSpeedX: (Math.random() - 0.5) * 8.0,
        spinSpeedY: (Math.random() - 0.5) * 12.0,
        spinSpeedZ: (Math.random() - 0.5) * 6.0,
        zSpread: (Math.random() - 0.5) * 3.0,
        material: mat,
        texture: texture,
      };

      mainGroup.add(mesh);
      textMeshes.push(mesh);
    });

    // --- (D) 背景の静謐なホワイト／シルバーダスト微粒子 ---
    const particleCount = 200;
    const particleGeom = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleCol = new Float32Array(particleCount * 3);

    // カラフルを排除し、静かな白〜シルバーの微粒子
    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 12;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1;

      // 輝度変化 (白〜ライトグレー)
      const brightness = 0.75 + Math.random() * 0.25;
      particleCol[i * 3] = brightness;
      particleCol[i * 3 + 1] = brightness;
      particleCol[i * 3 + 2] = brightness;
    }

    particleGeom.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    particleGeom.setAttribute("color", new THREE.BufferAttribute(particleCol, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // --- (E) ライティング (カラフルを廃し、クリアなアートスタジオ光) ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0xffffff, 3.5, 14);
    mainLight.position.set(2.5, 2.5, 3.5);
    scene.add(mainLight);

    const fillLight = new THREE.PointLight(0xe2e8f0, 2.0, 12);
    fillLight.position.set(-2.5, -2, 3);
    scene.add(fillLight);

    // --- (F) インタラクション (マウス・タッチ) ---
    const handleMove = (e) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((clientY - rect.top) / rect.height) * 2 - 1);

      targetMouse.current.x = x * 0.35;
      targetMouse.current.y = y * 0.25;
    };

    const handleLeave = () => {
      targetMouse.current.x = 0;
      targetMouse.current.y = 0;
    };

    container.addEventListener("mousemove", handleMove);
    container.addEventListener("touchmove", handleMove, { passive: true });
    container.addEventListener("mouseleave", handleLeave);
    container.addEventListener("touchend", handleLeave);

    // クリック/タップでカオススピン発動
    const handleClick = () => {
      triggerChaos();
    };
    container.addEventListener("click", handleClick);

    // --- (G) アニメーションループ ---
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      if (isIntersecting.current) {
        const t = clock.getElapsedTime();

        // マウスパララックス補間
        mousePos.current.x = THREE.MathUtils.lerp(mousePos.current.x, targetMouse.current.x, 0.05);
        mousePos.current.y = THREE.MathUtils.lerp(mousePos.current.y, targetMouse.current.y, 0.05);

        // カオス減衰（クリックされたら1.0になり、徐々に0に戻っていく）
        if (chaosProgress.current > 0.005) {
          chaosProgress.current = THREE.MathUtils.lerp(chaosProgress.current, 0, 0.025);
        } else {
          chaosProgress.current = 0;
          setIsSpinning(false);
        }
        const chaos = chaosProgress.current;

        // 1. カメラワーク（緩やかな動画的ズーム＆パン ＋ 上下の余白を確保した自動フィッティング）
        const aspect = width / height;
        // 縦も横も絶対に画面外に見切れない安全なカメラ距離を算出
        const fitZ = Math.max(5.4, 2.7 / (0.8284 * Math.max(aspect, 0.45)));
        const camX = Math.sin(t * 0.3) * 0.12 + mousePos.current.x * 0.35;
        const camY = Math.cos(t * 0.25) * 0.10 + mousePos.current.y * 0.35;
        const camZ = fitZ + Math.sin(t * 0.2) * 0.15 - chaos * 0.35;

        camera.position.set(camX, camY, camZ);
        camera.lookAt(0, 0, 0);

        // 2. 中央の写真アートワーク（微小な呼吸と、クリック時のパルス）
        const pulseScale = 1.0 + chaos * 0.1;
        photoMesh.scale.set(pulseScale, pulseScale, 1);
        photoMesh.position.y = 0.05 + Math.sin(t * 0.7) * 0.05;
        photoMesh.rotation.y = Math.sin(t * 0.4) * 0.08 + mousePos.current.x * 0.2;
        photoMesh.rotation.x = -Math.cos(t * 0.4) * 0.06 - mousePos.current.y * 0.2;

        // 3. テキストパーティクルのアニメーション（平常時は浮遊、クリックでぐるぐるスピンして元に戻る）
        textMeshes.forEach((mesh) => {
          const u = mesh.userData;

          // 平常時の微細な浮遊位置
          const idleOffsetX = Math.sin(t * 1.2 + u.angle) * 0.04;
          const idleOffsetY = Math.cos(t * 1.0 + u.angle) * 0.04;
          const idlePos = new THREE.Vector3(
            u.homePos.x + idleOffsetX,
            u.homePos.y + idleOffsetY,
            u.homePos.z
          );

          // カオススピン位置（渦巻きオービット軌道）
          const currentAngle = u.angle + t * u.orbitSpeed;
          const currentRadius = u.orbitRadius * (1.0 + Math.sin(t * 2.0) * 0.3);
          const spinX = Math.cos(currentAngle) * currentRadius;
          const spinY = Math.sin(currentAngle) * currentRadius * 0.8;
          const spinZ = u.homePos.z + Math.sin(currentAngle * 2) * 1.5 + u.zSpread;
          const chaosPos = new THREE.Vector3(spinX, spinY, spinZ);

          // 位置の合成
          mesh.position.lerpVectors(idlePos, chaosPos, chaos);

          // 回転の合成（カオス時はX/Y/Z軸でぐるぐるランダムタンブリング、平常時は正面）
          if (chaos > 0.01) {
            mesh.rotation.x = THREE.MathUtils.lerp(0, t * u.spinSpeedX, chaos);
            mesh.rotation.y = THREE.MathUtils.lerp(0, t * u.spinSpeedY, chaos);
            mesh.rotation.z = THREE.MathUtils.lerp(0, t * u.spinSpeedZ + currentAngle, chaos);
          } else {
            mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, 0, 0.1);
            mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, 0, 0.1);
            mesh.rotation.z = THREE.MathUtils.lerp(mesh.rotation.z, 0, 0.1);
          }
        });

        // 4. 奥のワイドバナー
        bannerMesh.position.y = 0.3 - Math.sin(t * 0.5) * 0.08;
        bannerMat.opacity = 0.3 + Math.sin(t * 0.4) * 0.15;

        // 5. ムービングライト（ホワイト系）
        mainLight.position.x = Math.sin(t * 0.8) * 3.5;
        mainLight.position.y = Math.cos(t * 0.6) * 3.0;

        // 6. パーティクル
        particles.rotation.y = t * 0.02;

        renderer.render(scene, camera);
      }
      animId = requestAnimationFrame(animate);
    };
    animate();

    // Resize
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // Intersection
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

      photoGeom.dispose();
      bannerGeom.dispose();
      particleGeom.dispose();
      photoMat.dispose();
      bannerMat.dispose();
      particleMat.dispose();
      photoTex.dispose();
      bannerTex.dispose();

      textMeshes.forEach((mesh) => {
        mesh.userData.geometry.dispose();
        mesh.userData.material.dispose();
        mesh.userData.texture.dispose();
      });

      renderer.dispose();
    };
  }, [photoImage, bannerImage]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-[#07090e] border border-white/10 shadow-2xl select-none">
      {/* 3D Motion Canvas */}
      <div 
        ref={mountRef} 
        className="w-full h-[500px] sm:h-[560px] relative overflow-hidden cursor-pointer"
        title="タップ/クリックでテキストがぐるぐる回転して元に戻ります"
      />

      {/* Top Left Status Badge (ミニマル・ホワイト/グレー) */}
      <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-2 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/80 backdrop-blur-md border border-white/20 text-white font-mono text-[10px] font-bold tracking-widest rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>7TH GARDEN</span>
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 backdrop-blur-md border border-white/15 text-gray-200 font-mono text-[10px] font-bold tracking-widest rounded-full">
          {entranceFee}
        </span>
      </div>

      {/* Top Right Spin Action Button (ミニマル) */}
      <div className="absolute top-3.5 right-3.5 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerChaos();
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md border transition-all text-[10px] font-mono font-bold shadow-md ${
            isSpinning
              ? "bg-white text-black border-white scale-105"
              : "bg-black/75 hover:bg-white/20 text-gray-200 border-white/20 hover:border-white"
          }`}
        >
          <RotateCcw className={`w-3 h-3 ${isSpinning ? "animate-spin text-black" : "text-white"}`} />
          <span>{isSpinning ? "SPINNING" : "CLICK TO SCATTER"}</span>
        </button>
      </div>

      {/* Bottom Bar Controls (ミニマル・枠線なし調) */}
      <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 flex items-center justify-between gap-2 pointer-events-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerChaos();
          }}
          className="text-[10px] font-mono text-gray-300 bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all"
        >
          <span className="text-white font-bold">画面タップ</span>
          <span>でスピン ↺</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenModal && onOpenModal();
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 text-white font-mono text-[11px] font-bold shadow-lg transition-all active:scale-95"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>公式ポスター拡大</span>
        </button>
      </div>
    </div>
  );
}
