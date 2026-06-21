import { useEffect, useRef } from "react";

/**
 * Mouse-reactive crystalline orb. Pure CSS/SVG — no Three.js.
 * Parallax tilts the orb toward the cursor, with refractive gradients
 * and a soft platinum halo.
 */
const CrystallineOrb = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const orb = orbRef.current;
    if (!wrap || !orb) return;

    let raf = 0;
    let tx = 0, ty = 0, cx = 0, cy = 0;

    const onMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      const px = (e.clientX - (rect.left + rect.width / 2)) / window.innerWidth;
      const py = (e.clientY - (rect.top + rect.height / 2)) / window.innerHeight;
      tx = Math.max(-1, Math.min(1, px)) * 18;
      ty = Math.max(-1, Math.min(1, py)) * 18;
    };

    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      orb.style.transform = `translate3d(${cx}px, ${cy}px, 0) rotateX(${-cy * 0.8}deg) rotateY(${cx * 0.8}deg)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full h-full flex items-center justify-center pointer-events-none select-none">
      {/* outer halo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle_at_30%_30%,hsl(220_40%_70%/0.25),transparent_60%)] blur-2xl" />
      </div>
      <div
        ref={orbRef}
        className="relative animate-orb-float"
        style={{ transformStyle: "preserve-3d", perspective: "800px" }}
      >
        <div className="relative w-[280px] h-[280px] md:w-[340px] md:h-[340px]">
          {/* crystalline gradient sphere */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 32% 28%, hsl(220 30% 98%) 0%, hsl(220 25% 80%) 18%, hsl(225 35% 35%) 55%, hsl(225 45% 12%) 85%)",
              boxShadow:
                "inset -30px -40px 80px hsl(225 45% 5% / 0.85), inset 20px 30px 60px hsl(220 30% 90% / 0.45), 0 30px 80px hsl(220 50% 5% / 0.6), 0 0 80px hsl(220 30% 60% / 0.25)",
            }}
          />
          {/* refractive highlight */}
          <div
            className="absolute rounded-full"
            style={{
              top: "10%", left: "18%", width: "45%", height: "30%",
              background: "radial-gradient(ellipse, hsl(220 30% 100% / 0.55) 0%, transparent 70%)",
              filter: "blur(6px)",
            }}
          />
          {/* secondary glint */}
          <div
            className="absolute rounded-full"
            style={{
              bottom: "18%", right: "20%", width: "18%", height: "12%",
              background: "radial-gradient(ellipse, hsl(220 30% 95% / 0.45) 0%, transparent 70%)",
              filter: "blur(4px)",
            }}
          />
          {/* faceted rim */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 120deg, transparent 0deg, hsl(220 25% 85% / 0.18) 60deg, transparent 120deg, hsl(220 25% 85% / 0.12) 240deg, transparent 300deg)",
              mixBlendMode: "screen",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CrystallineOrb;
