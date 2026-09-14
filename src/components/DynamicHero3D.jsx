import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Sparkles, RefreshCw, Eye, Maximize2, Layers } from "lucide-react";

export default function DynamicHero3D({ 
  frontImage = "/hero-banner.jpg", 
  backImage = "/promo/7th_garden_0917_flyer.jpg", 
  onOpenModal,
  entranceFee = "Charge Free"
}) {
  const mountRef = useRef(null);
  const [currentFace, setCurrentFace] = useState("front"); // 'front' | 'back'
  const [isLoaded, setIsLoaded] = useState(false);

  // 回転ターゲット (0: front, Math.PI: back)
  const targetRotationY = useRef(0);
  const currentRotationY = useRef(0);
  const tiltTarget = useRef({ x: 0, y: 0 });
  const tiltCurrent = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const isIntersecting = useRef(true);

  // フリップ切り替え関数
  const toggleFlip = () => {
    if (targetRotationY.current === 0) {
      targetRotationY.current = Math.PI;
      setCurrentFace("back");
    } else {
      targetRotationY.current = 0;
      setCurrentFace("front");
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 360;
    let height = container.clientHeight || 280;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 5.2;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 3. Card Container Group
    const cardGroup = new THREE.Group();
    scene.add(cardGroup);

    // 4. Textures Loading
    const textureLoader = new THREE.TextureLoader();

    // Front: メインバナー (横長)
    const frontTex = textureLoader.load(frontImage, () => {
      setIsLoaded(true);
    });
    frontTex.colorSpace = THREE.SRGBColorSpace;

    // Back: 公式ポスター (縦型) - 裏面用に左右反転補正
    const backTex = textureLoader.load(backImage);
    backTex.colorSpace = THREE.SRGBColorSpace;
    backTex.wrapS = THREE.RepeatWrapping;
    backTex.repeat.x = -1; // Y軸180度回転時に正しい向きで読めるように反転

    // 5. Materials & Card Meshes
    // 厚みのあるスタイリッシュな3Dカード
    const cardWidth = 3.6;
    const cardHeight = 2.4;
    const cardThickness = 0.06;

    const frontMaterial = new THREE.MeshPhysicalMaterial({
      map: frontTex,
      roughness: 0.25,
      metalness: 0.1,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
      reflectivity: 0.5,
    });

    const backMaterial = new THREE.MeshPhysicalMaterial({
      map: backTex,
      roughness: 0.25,
      metalness: 0.1,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
      reflectivity: 0.5,
    });

    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1d2e,
      metalness: 0.8,
      roughness: 0.3,
      emissive: 0x220538,
      emissiveIntensity: 0.4,
    });

    // Boxの各面 [右, 左, 上, 下, 前, 後]
    const materials = [
      edgeMaterial, // right
      edgeMaterial, // left
      edgeMaterial, // top
      edgeMaterial, // bottom
      frontMaterial, // front
      backMaterial  // back
    ];

    const cardGeometry = new THREE.BoxGeometry(cardWidth, cardHeight, cardThickness);
    const cardMesh = new THREE.Mesh(cardGeometry, materials);
    cardGroup.add(cardMesh);

    // 6. 光るエッジ枠線 (Neon Edge)
    const edgesGeom = new THREE.EdgesGeometry(cardGeometry);
    const edgesMat = new THREE.LineBasicMaterial({
      color: 0xff007f,
      linewidth: 2,
      transparent: true,
      opacity: 0.65,
    });
    const edgeLines = new THREE.LineSegments(edgesGeom, edgesMat);
    cardGroup.add(edgeLines);

    // 7. サイバー・アンビエント パーティクル
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const palette = [
      new THREE.Color(0xff007f), // Neon Pink
      new THREE.Color(0x00f3ff), // Neon Cyan
      new THREE.Color(0xa855f7), // Neon Purple
    ];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 10;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;

      const col = palette[Math.floor(Math.random() * palette.length)];
      particleColors[i * 3] = col.r;
      particleColors[i * 3 + 1] = col.g;
      particleColors[i * 3 + 2] = col.b;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 8. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pinkLight = new THREE.PointLight(0xff007f, 3.5, 12);
    pinkLight.position.set(3, 2, 4);
    scene.add(pinkLight);

    const cyanLight = new THREE.PointLight(0x00f3ff, 3.0, 12);
    cyanLight.position.set(-3, -2, 4);
    scene.add(cyanLight);

    // 9. Interaction Handlers (Mouse & Touch)
    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);

      tiltTarget.current.x = THREE.MathUtils.clamp(normY * 0.35, -0.4, 0.4);
      tiltTarget.current.y = THREE.MathUtils.clamp(normX * 0.45, -0.5, 0.5);

      // ライトをカーソルに軽く連動
      pinkLight.position.x = normX * 4 + 2;
      pinkLight.position.y = normY * 3 + 1;
    };

    const handlePointerLeave = () => {
      tiltTarget.current.x = 0;
      tiltTarget.current.y = 0;
    };

    container.addEventListener("mousemove", handlePointerMove);
    container.addEventListener("touchmove", handlePointerMove, { passive: true });
    container.addEventListener("mouseleave", handlePointerLeave);
    container.addEventListener("touchend", handlePointerLeave);

    // 10. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      if (isIntersecting.current) {
        const elapsedTime = clock.getElapsedTime();

        // フリップ回転 (スムーズなLerp補間)
        currentRotationY.current = THREE.MathUtils.lerp(
          currentRotationY.current,
          targetRotationY.current,
          0.09
        );

        // チルト回転 (マウス追従)
        tiltCurrent.current.x = THREE.MathUtils.lerp(tiltCurrent.current.x, tiltTarget.current.x, 0.08);
        tiltCurrent.current.y = THREE.MathUtils.lerp(tiltCurrent.current.y, tiltTarget.current.y, 0.08);

        // 浮遊アニメーション
        const floatOffset = Math.sin(elapsedTime * 1.5) * 0.06;
        cardGroup.position.y = floatOffset;

        // カードの最終角度合成
        cardGroup.rotation.x = tiltCurrent.current.x;
        cardGroup.rotation.y = currentRotationY.current + tiltCurrent.current.y;

        // パーティクルの緩やかな自転
        particles.rotation.y = elapsedTime * 0.03;
        particles.rotation.x = Math.sin(elapsedTime * 0.02) * 0.05;

        // エッジ光の脈動
        edgesMat.opacity = 0.5 + Math.sin(elapsedTime * 3) * 0.25;

        renderer.render(scene, camera);
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // 11. Resize Observer
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // 12. Intersection Observer (スクロールで見えなくなったら描画一時停止)
    const observer = new IntersectionObserver(([entry]) => {
      isIntersecting.current = entry.isIntersecting;
    });
    observer.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handlePointerMove);
      container.removeEventListener("touchmove", handlePointerMove);
      container.removeEventListener("mouseleave", handlePointerLeave);
      container.removeEventListener("touchend", handlePointerLeave);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      cardGeometry.dispose();
      edgesGeom.dispose();
      particleGeometry.dispose();
      frontMaterial.dispose();
      backMaterial.dispose();
      edgeMaterial.dispose();
      edgesMat.dispose();
      particleMaterial.dispose();
      frontTex.dispose();
      backTex.dispose();
      renderer.dispose();
    };
  }, [frontImage, backImage]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden glass-panel-glow border border-neon-pink/50 shadow-2xl bg-black/80 select-none">
      {/* Three.js Canvas Container */}
      <div 
        ref={mountRef} 
        className="w-full h-72 sm:h-80 cursor-grab active:cursor-grabbing relative overflow-hidden"
        onClick={toggleFlip}
        title="タップで表面（バナー）と裏面（公式ポスター）を3D回転切替"
      />

      {/* Top Overlay Badges */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/75 backdrop-blur-md border border-neon-pink/70 text-neon-pink font-mono text-[10px] font-extrabold tracking-widest rounded-full shadow-neon-pink">
          <Sparkles className="w-3 h-3 text-neon-pink animate-pulse" />
          <span>3D INTERACTIVE</span>
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neon-cyan/20 backdrop-blur-md border border-neon-cyan/60 text-neon-cyan font-mono text-[10px] font-extrabold tracking-widest rounded-full">
          {entranceFee}
        </span>
      </div>

      {/* Top Right Current Mode Indicator */}
      <div className="absolute top-3 right-3 z-10">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-black/70 backdrop-blur-md border border-white/20 text-gray-200 font-mono text-[9px] font-bold rounded-full">
          <Layers className="w-2.5 h-2.5 text-neon-cyan" />
          <span>{currentFace === "front" ? "MAIN BANNER" : "OFFICIAL POSTER"}</span>
        </span>
      </div>

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between gap-2 pointer-events-auto">
        {/* Flip Toggle Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFlip();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-neon-pink/20 backdrop-blur-md border border-neon-pink/50 text-white font-mono text-[11px] font-bold shadow-lg transition-all active:scale-95 group"
        >
          <RefreshCw className="w-3.5 h-3.5 text-neon-pink group-hover:rotate-180 transition-transform duration-500" />
          <span>{currentFace === "front" ? "ポスター面へ回転 ↻" : "メインバナーへ戻す ↺"}</span>
        </button>

        {/* Modal Enlarge Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenModal && onOpenModal();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neon-cyan/20 hover:bg-neon-cyan/30 backdrop-blur-md border border-neon-cyan/60 text-neon-cyan font-mono text-[11px] font-bold shadow-lg transition-all active:scale-95"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>拡大表示</span>
        </button>
      </div>

      {/* Hint Tooltip */}
      <div className="absolute bottom-11 left-1/2 -translate-x-1/2 z-0 pointer-events-none text-center">
        <span className="text-[9px] font-mono text-gray-400/80 bg-black/50 px-2 py-0.5 rounded-full">
          マウス/タッチで3D傾き追従 ・ タップで回転
        </span>
      </div>
    </div>
  );
}
