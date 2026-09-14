import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Sparkles, Maximize2, RotateCcw } from "lucide-react";

// Canvasからネオンテキストテクスチャを生成するヘルパー
function createTextTexture(text, textColor, borderColor, bgColor = "rgba(8, 10, 20, 0.85)") {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 512;
  canvas.height = 120;

  // 角丸背景
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(8, 8, canvas.width - 16, canvas.height - 16, 20);
  ctx.fill();

  // ネオンボーダー
  ctx.lineWidth = 4;
  ctx.strokeStyle = borderColor;
  ctx.shadowColor = borderColor;
  ctx.shadowBlur = 12;
  ctx.stroke();

  // ネオンテキスト
  ctx.shadowBlur = 10;
  ctx.shadowColor = textColor;
  ctx.fillStyle = textColor;
  ctx.font = "bold 38px 'Space Grotesk', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
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

    // --- (A) 中央の写真アートワークメッシュ (切り株と林檎) ---
    const photoWidth = 2.2;
    const photoHeight = 3.58;
    const photoGeom = new THREE.PlaneGeometry(photoWidth, photoHeight);
    const photoMat = new THREE.MeshPhysicalMaterial({
      map: photoTex,
      transparent: true,
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
      reflectivity: 0.8,
      side: THREE.FrontSide, // 正面・反転なし
    });
    const photoMesh = new THREE.Mesh(photoGeom, photoMat);
    photoMesh.position.set(0, 0, 0.2);
    mainGroup.add(photoMesh);

    // 写真のネオンフレーム
    const photoEdges = new THREE.EdgesGeometry(photoGeom);
    const photoEdgeMat = new THREE.LineBasicMaterial({
      color: 0xff007f,
      linewidth: 2,
      transparent: true,
      opacity: 0.8,
    });
    const photoFrame = new THREE.LineSegments(photoEdges, photoEdgeMat);
    photoMesh.add(photoFrame);

    // --- (B) 奥のシネマティックワイドバナー ---
    const bannerGeom = new THREE.PlaneGeometry(4.8, 2.035);
    const bannerMat = new THREE.MeshPhysicalMaterial({
      map: bannerTex,
      transparent: true,
      opacity: 0.45,
      roughness: 0.4,
      metalness: 0.2,
      side: THREE.FrontSide,
    });
    const bannerMesh = new THREE.Mesh(bannerGeom, bannerMat);
    bannerMesh.position.set(0, 0.3, -1.5);
    mainGroup.add(bannerMesh);

    // --- (C) 写真以外の全フライヤー要素（テキストパーティクル） ---
    // フライヤーに記載されていたテキスト要素の定義
    const textItems = [
      { text: "7th GARDEN", color: "#22c55e", border: "#22c55e", pos: [-1.6, 1.4, 0.6], scale: 1.1 },
      { text: "09/17 (THU)", color: "#ef4444", border: "#ef4444", pos: [1.6, 1.4, 0.6], scale: 1.0 },
      { text: "Compufunk Records & BAR", color: "#00f3ff", border: "#00f3ff", pos: [0, -1.85, 0.7], scale: 1.15 },
      { text: "18:00~24:00 Charge Free", color: "#eab308", border: "#eab308", pos: [0, -2.25, 0.6], scale: 0.95 },
      { text: "toru yamanaka (Dumb Type)", color: "#c084fc", border: "#c084fc", pos: [-1.75, 0.8, 0.4], scale: 0.9 },
      { text: "Dune (U.V.)", color: "#38bdf8", border: "#38bdf8", pos: [1.75, 0.8, 0.4], scale: 0.85 },
      { text: "tvvt", color: "#ff007f", border: "#ff007f", pos: [-1.65, 0.2, 0.5], scale: 0.8 },
      { text: "KASSIS. (MOKSA.)", color: "#f43f5e", border: "#f43f5e", pos: [1.65, 0.2, 0.5], scale: 0.85 },
      { text: "youngANDoldNEVERdie", color: "#a3e635", border: "#a3e635", pos: [-1.7, -0.4, 0.45], scale: 0.85 },
      { text: "Selector: Sen 11", color: "#00f3ff", border: "#00f3ff", pos: [1.7, -0.4, 0.45], scale: 0.85 },
      { text: "CRYSTAL BOWL: tamako", color: "#fb7185", border: "#fb7185", pos: [-1.6, -1.0, 0.4], scale: 0.85 },
      { text: "Live P.A.: Sen & Jerry", color: "#a855f7", border: "#a855f7", pos: [1.6, -1.0, 0.4], scale: 0.85 },
      { text: "VISUALS : FisH + HIWATASHI", color: "#06b6d4", border: "#06b6d4", pos: [0, 1.95, 0.5], scale: 1.0 },
      { text: "PayPay tipping method", color: "#ff007f", border: "#ff007f", pos: [1.5, -2.6, 0.5], scale: 0.8 },
      { text: "PLACE FOR ART AND MUSIC", color: "#e2e8f0", border: "#a855f7", pos: [-1.4, -2.6, 0.5], scale: 0.8 },
    ];

    const textMeshes = [];
    const textGeom = new THREE.PlaneGeometry(1.6, 0.38);

    textItems.forEach((item, index) => {
      const tex = createTextTexture(item.text, item.color, item.border);
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      const mesh = new THREE.Mesh(textGeom, mat);
      mesh.scale.set(item.scale, item.scale, 1);

      // 初期配置 (定位置)
      mesh.position.set(item.pos[0], item.pos[1], item.pos[2]);

      // ランダムスピン・渦巻き動作用パラメータを各メッシュに保持
      const angle = (index / textItems.length) * Math.PI * 2;
      const speed = 2.0 + Math.random() * 3.5;
      const radius = 1.8 + Math.random() * 2.2;
      const dir = Math.random() > 0.5 ? 1 : -1;

      mesh.userData = {
        homePos: new THREE.Vector3(...item.pos),
        homeRot: new THREE.Euler(0, 0, 0),
        angle: angle,
        orbitSpeed: speed * dir,
        orbitRadius: radius,
        spinSpeedX: (Math.random() - 0.5) * 8.0,
        spinSpeedY: (Math.random() - 0.5) * 12.0,
        spinSpeedZ: (Math.random() - 0.5) * 6.0,
        zSpread: (Math.random() - 0.5) * 3.5,
        material: mat,
        texture: tex,
      };

      mainGroup.add(mesh);
      textMeshes.push(mesh);
    });

    // --- (D) 背景の微粒子パーティクル ---
    const particleCount = 200;
    const particleGeom = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleCol = new Float32Array(particleCount * 3);

    const colors = [
      new THREE.Color(0xff007f),
      new THREE.Color(0x00f3ff),
      new THREE.Color(0xa855f7),
      new THREE.Color(0x22c55e),
    ];

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 12;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1;

      const c = colors[Math.floor(Math.random() * colors.length)];
      particleCol[i * 3] = c.r;
      particleCol[i * 3 + 1] = c.g;
      particleCol[i * 3 + 2] = c.b;
    }

    particleGeom.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    particleGeom.setAttribute("color", new THREE.BufferAttribute(particleCol, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // --- (E) ライティング ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const pinkLight = new THREE.PointLight(0xff007f, 4.0, 12);
    pinkLight.position.set(2.5, 2, 3);
    scene.add(pinkLight);

    const cyanLight = new THREE.PointLight(0x00f3ff, 3.5, 12);
    cyanLight.position.set(-2.5, -2, 3);
    scene.add(cyanLight);

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

        // 1. カメラワーク（緩やかな動画的ズーム＆パン）
        const camX = Math.sin(t * 0.3) * 0.2 + mousePos.current.x * 0.6;
        const camY = Math.cos(t * 0.25) * 0.15 + mousePos.current.y * 0.6;
        const camZ = 6.4 + Math.sin(t * 0.2) * 0.25 - chaos * 0.4;

        camera.position.set(camX, camY, camZ);
        camera.lookAt(0, 0, 0);

        // 2. 中央の写真アートワーク（微小な呼吸と、クリック時のパルス）
        const pulseScale = 1.0 + chaos * 0.12;
        photoMesh.scale.set(pulseScale, pulseScale, 1);
        photoMesh.position.y = Math.sin(t * 0.7) * 0.06;
        photoMesh.rotation.y = Math.sin(t * 0.4) * 0.08 + mousePos.current.x * 0.2;
        photoMesh.rotation.x = -Math.cos(t * 0.4) * 0.06 - mousePos.current.y * 0.2;

        // 3. テキストパーティクルのアニメーション（平常時は浮遊、クリックでぐるぐるスピンして元に戻る）
        textMeshes.forEach((mesh) => {
          const u = mesh.userData;

          // 平常時の微細な浮遊位置
          const idleOffsetX = Math.sin(t * 1.2 + u.angle) * 0.05;
          const idleOffsetY = Math.cos(t * 1.0 + u.angle) * 0.06;
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

          // 位置の合成（chaosProgressで滑らかにカオス位置 ⇔ 平常位置を補間）
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
        bannerMat.opacity = 0.4 + Math.sin(t * 0.4) * 0.15;

        // 5. ムービングライト
        pinkLight.position.x = Math.sin(t * 0.8) * 3.5;
        pinkLight.position.y = Math.cos(t * 0.6) * 3.0;
        cyanLight.position.x = -Math.cos(t * 0.7) * 3.5;
        cyanLight.position.y = -Math.sin(t * 0.5) * 3.0;

        // 6. パーティクル
        particles.rotation.y = t * 0.03;

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
      photoEdges.dispose();
      particleGeom.dispose();
      textGeom.dispose();
      photoMat.dispose();
      bannerMat.dispose();
      photoEdgeMat.dispose();
      particleMat.dispose();
      photoTex.dispose();
      bannerTex.dispose();

      textMeshes.forEach((mesh) => {
        mesh.userData.material.dispose();
        mesh.userData.texture.dispose();
      });

      renderer.dispose();
    };
  }, [photoImage, bannerImage]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden glass-panel-glow border border-neon-pink/50 shadow-2xl bg-[#06070d] select-none">
      {/* 3D Motion Canvas */}
      <div 
        ref={mountRef} 
        className="w-full h-[460px] sm:h-[520px] relative overflow-hidden cursor-pointer"
        title="タップ/クリックでテキストパーティクルがランダムにぐるぐる回転！"
      />

      {/* Top Left Status Badge */}
      <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/80 backdrop-blur-md border border-neon-pink/70 text-neon-pink font-mono text-[10px] font-extrabold tracking-widest rounded-full shadow-neon-pink">
          <Sparkles className="w-3 h-3 text-neon-pink animate-pulse" />
          <span>CYBER AMBIENT 3D</span>
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neon-cyan/20 backdrop-blur-md border border-neon-cyan/60 text-neon-cyan font-mono text-[10px] font-extrabold tracking-widest rounded-full">
          {entranceFee}
        </span>
      </div>

      {/* Top Right Spin Action Hint Button */}
      <div className="absolute top-3.5 right-3.5 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerChaos();
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md border transition-all text-[10px] font-mono font-bold shadow-lg ${
            isSpinning
              ? "bg-neon-pink text-white border-neon-pink scale-105 animate-pulse"
              : "bg-black/75 hover:bg-neon-pink/20 text-gray-200 border-white/20 hover:border-neon-pink"
          }`}
        >
          <RotateCcw className={`w-3 h-3 ${isSpinning ? "animate-spin text-white" : "text-neon-pink"}`} />
          <span>{isSpinning ? "SPINNING!" : "CLICK TO SCATTER 🌀"}</span>
        </button>
      </div>

      {/* Bottom Bar Controls */}
      <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 flex items-center justify-between gap-2 pointer-events-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerChaos();
          }}
          className="text-[10px] font-mono text-gray-300 bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all"
        >
          <span className="text-neon-cyan font-bold">画面タップ</span>
          <span>でカオススピン ↺</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenModal && onOpenModal();
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-neon-pink/80 to-neon-purple/80 hover:from-neon-pink hover:to-neon-purple backdrop-blur-md border border-neon-pink/60 text-white font-mono text-[11px] font-bold shadow-neon-pink transition-all active:scale-95"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>公式ポスター拡大</span>
        </button>
      </div>

      {/* Center Prompt Banner on First Render */}
      <div className="absolute bottom-11 left-1/2 -translate-x-1/2 z-0 pointer-events-none text-center opacity-75">
        <span className="text-[9px] font-mono text-gray-400 bg-black/60 px-3 py-0.5 rounded-full border border-white/10">
          画面クリックでテキストがぐるぐる回転して元に戻ります
        </span>
      </div>
    </div>
  );
}
