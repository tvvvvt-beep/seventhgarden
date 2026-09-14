import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { Sparkles, Maximize2 } from "lucide-react";

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

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 360;
    let height = container.clientHeight || 460;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06070d, 0.12);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.8);

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
    // 縦横比率厳守: 幅 2.456, 高さ 4.0
    const photoTex = textureLoader.load(photoImage);
    photoTex.colorSpace = THREE.SRGBColorSpace;
    photoTex.generateMipmaps = true;
    photoTex.minFilter = THREE.LinearMipmapLinearFilter;

    // 横長メインバナー (1024 x 434 -> aspect: 2.359)
    // 縦横比率厳守: 幅 4.8, 高さ 2.035
    const bannerTex = textureLoader.load(bannerImage);
    bannerTex.colorSpace = THREE.SRGBColorSpace;
    bannerTex.generateMipmaps = true;
    bannerTex.minFilter = THREE.LinearMipmapLinearFilter;

    // 4. メイングループ
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // --- (A) 写真アートワークメッシュ (切り株と林檎) ---
    // 反転なし・比率厳守 (2.456 x 4.0)
    const photoGeom = new THREE.PlaneGeometry(2.456, 4.0);
    const photoMat = new THREE.MeshPhysicalMaterial({
      map: photoTex,
      transparent: true,
      roughness: 0.22,
      metalness: 0.1,
      clearcoat: 0.85,
      clearcoatRoughness: 0.15,
      reflectivity: 0.75,
      side: THREE.FrontSide, // 正面のみ (反転なし)
    });
    const photoMesh = new THREE.Mesh(photoGeom, photoMat);
    photoMesh.position.set(0, 0, 0.35);
    mainGroup.add(photoMesh);

    // 写真フレームの外枠ネオンライン
    const photoEdges = new THREE.EdgesGeometry(photoGeom);
    const photoEdgeMat = new THREE.LineBasicMaterial({
      color: 0xff007f,
      linewidth: 2,
      transparent: true,
      opacity: 0.85,
    });
    const photoFrame = new THREE.LineSegments(photoEdges, photoEdgeMat);
    photoMesh.add(photoFrame);

    // --- (B) 奥に浮遊するシネマティックワイドバナー ---
    // 比率厳守 (4.8 x 2.035)
    const bannerGeom = new THREE.PlaneGeometry(4.8, 2.035);
    const bannerMat = new THREE.MeshPhysicalMaterial({
      map: bannerTex,
      transparent: true,
      opacity: 0.65,
      roughness: 0.3,
      metalness: 0.2,
      clearcoat: 0.5,
      side: THREE.FrontSide,
    });
    const bannerMesh = new THREE.Mesh(bannerGeom, bannerMat);
    bannerMesh.position.set(0, 0.4, -1.2);
    mainGroup.add(bannerMesh);

    const bannerEdges = new THREE.EdgesGeometry(bannerGeom);
    const bannerEdgeMat = new THREE.LineBasicMaterial({
      color: 0x00f3ff,
      linewidth: 1,
      transparent: true,
      opacity: 0.45,
    });
    const bannerFrame = new THREE.LineSegments(bannerEdges, bannerEdgeMat);
    bannerMesh.add(bannerFrame);

    // --- (C) サイバー・アンビエント パーティクル ---
    const particleCount = 280;
    const particleGeom = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleCol = new Float32Array(particleCount * 3);

    const colors = [
      new THREE.Color(0xff007f), // Pink
      new THREE.Color(0x00f3ff), // Cyan
      new THREE.Color(0xa855f7), // Purple
      new THREE.Color(0xffd700), // Gold
    ];

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 12;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 0.5;

      const c = colors[Math.floor(Math.random() * colors.length)];
      particleCol[i * 3] = c.r;
      particleCol[i * 3 + 1] = c.g;
      particleCol[i * 3 + 2] = c.b;
    }

    particleGeom.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    particleGeom.setAttribute("color", new THREE.BufferAttribute(particleCol, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // --- (D) ダイナミックライティング ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    // 動くネオンスポットライト (ポスター表面を走る光)
    const pinkLight = new THREE.PointLight(0xff007f, 4.0, 10);
    pinkLight.position.set(2, 2, 2.5);
    scene.add(pinkLight);

    const cyanLight = new THREE.PointLight(0x00f3ff, 3.5, 10);
    cyanLight.position.set(-2, -2, 2.5);
    scene.add(cyanLight);

    // --- (E) マウス・タッチパララックス ---
    const handleMove = (e) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((clientY - rect.top) / rect.height) * 2 - 1);

      targetMouse.current.x = x * 0.4;
      targetMouse.current.y = y * 0.3;
    };

    const handleLeave = () => {
      targetMouse.current.x = 0;
      targetMouse.current.y = 0;
    };

    container.addEventListener("mousemove", handleMove);
    container.addEventListener("touchmove", handleMove, { passive: true });
    container.addEventListener("mouseleave", handleLeave);
    container.addEventListener("touchend", handleLeave);

    // --- (F) アニメーションループ (動画的な自動シネマティックモーション) ---
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      if (isIntersecting.current) {
        const t = clock.getElapsedTime();

        // 1. マウスパララックスのイージング
        mousePos.current.x = THREE.MathUtils.lerp(mousePos.current.x, targetMouse.current.x, 0.05);
        mousePos.current.y = THREE.MathUtils.lerp(mousePos.current.y, targetMouse.current.y, 0.05);

        // 2. 自動シネマティックカメラワーク（動画のように優雅に動く）
        // 周期的な緩やかなパン＆ズーム
        const camWaveX = Math.sin(t * 0.4) * 0.35 + mousePos.current.x * 0.8;
        const camWaveY = Math.cos(t * 0.35) * 0.25 + mousePos.current.y * 0.8;
        const camZoom = 5.8 + Math.sin(t * 0.25) * 0.35; // じわっとズームイン・アウト

        camera.position.x = camWaveX;
        camera.position.y = camWaveY;
        camera.position.z = camZoom;
        camera.lookAt(0, 0, 0);

        // 3. 写真アートワークの動画的モーション (呼吸・浮遊・傾き)
        // アスペクト比を維持したまま、3D空間で優雅に浮遊
        photoMesh.position.y = Math.sin(t * 0.8) * 0.08;
        photoMesh.position.x = Math.cos(t * 0.5) * 0.05;
        photoMesh.rotation.y = Math.sin(t * 0.4) * 0.12 + mousePos.current.x * 0.25;
        photoMesh.rotation.x = -Math.cos(t * 0.5) * 0.08 - mousePos.current.y * 0.25;
        photoMesh.rotation.z = Math.sin(t * 0.3) * 0.02;

        // 4. 奥の横長バナーのパララックスモーション
        bannerMesh.position.y = 0.4 - Math.sin(t * 0.6) * 0.1;
        bannerMesh.position.x = -Math.cos(t * 0.4) * 0.15;
        bannerMesh.rotation.y = -Math.sin(t * 0.3) * 0.08;
        // 周期的にバナーの存在感が呼吸のように変化
        bannerMat.opacity = 0.5 + Math.sin(t * 0.5) * 0.25;

        // 5. ネオンスポットライトのシネマティックスイープ (アートワーク上を走る光)
        pinkLight.position.x = Math.sin(t * 0.9) * 3.5;
        pinkLight.position.y = Math.cos(t * 0.7) * 3.0;
        cyanLight.position.x = -Math.cos(t * 0.8) * 3.5;
        cyanLight.position.y = -Math.sin(t * 0.6) * 3.0;

        // 6. パーティクル空間の緩やかな回転
        particles.rotation.y = t * 0.04;
        particles.rotation.x = Math.sin(t * 0.03) * 0.06;

        // 7. エッジフレームのネオンパルス
        photoEdgeMat.opacity = 0.6 + Math.sin(t * 2.5) * 0.35;
        bannerEdgeMat.opacity = 0.35 + Math.cos(t * 2.0) * 0.2;

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

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      photoGeom.dispose();
      bannerGeom.dispose();
      photoEdges.dispose();
      bannerEdges.dispose();
      particleGeom.dispose();
      photoMat.dispose();
      bannerMat.dispose();
      photoEdgeMat.dispose();
      bannerEdgeMat.dispose();
      particleMat.dispose();
      photoTex.dispose();
      bannerTex.dispose();
      renderer.dispose();
    };
  }, [photoImage, bannerImage]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden glass-panel-glow border border-neon-pink/50 shadow-2xl bg-[#06070d] select-none">
      {/* 3D Motion Canvas (縦長ポスターがすっぽり収まる高さ) */}
      <div 
        ref={mountRef} 
        className="w-full h-[440px] sm:h-[490px] relative overflow-hidden cursor-pointer"
        onClick={onOpenModal}
        title="タップで公式ポスターを高解像度拡大表示"
      />

      {/* Top Left Status Badge */}
      <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/80 backdrop-blur-md border border-neon-pink/70 text-neon-pink font-mono text-[10px] font-extrabold tracking-widest rounded-full shadow-neon-pink">
          <Sparkles className="w-3 h-3 text-neon-pink animate-pulse" />
          <span>7TH GARDEN 3D MOTION</span>
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neon-cyan/20 backdrop-blur-md border border-neon-cyan/60 text-neon-cyan font-mono text-[10px] font-extrabold tracking-widest rounded-full">
          {entranceFee}
        </span>
      </div>

      {/* Top Right Live Cinema Indicator */}
      <div className="absolute top-3.5 right-3.5 z-10 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/75 backdrop-blur-md border border-red-500/50 text-red-400 font-mono text-[9px] font-bold rounded-full">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
          <span>AUTOPLAY 3D</span>
        </span>
      </div>

      {/* Bottom Bar Controls */}
      <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 flex items-center justify-between gap-2 pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-gray-300 bg-black/70 backdrop-blur-md border border-white/10 px-2.5 py-1.5 rounded-xl flex items-center gap-1">
            <span className="text-neon-cyan font-bold">09/17</span>
            <span>@ Compufunk Records</span>
          </span>
        </div>

        <button
          onClick={onOpenModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-neon-pink/80 to-neon-purple/80 hover:from-neon-pink hover:to-neon-purple backdrop-blur-md border border-neon-pink/60 text-white font-mono text-[11px] font-bold shadow-neon-pink transition-all active:scale-95"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>ポスター拡大・保存</span>
        </button>
      </div>

      {/* Bottom Subtle Guide */}
      <div className="absolute bottom-11 left-1/2 -translate-x-1/2 z-0 pointer-events-none text-center opacity-70">
        <span className="text-[9px] font-mono text-gray-400 bg-black/50 px-2.5 py-0.5 rounded-full">
          タップでポスター全画面表示 ・ マウス/タッチで視差連動
        </span>
      </div>
    </div>
  );
}
