// src/components/PageHeader.tsx
"use client";
import Image from "next/image";
import { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  imageSrc: string;
  imageAlt?: string;
  doctorName?: ReactNode;
  doctorLabel?: string;    // "MÉDICO" por defecto
  onBack?: () => void;
  backText?: string;       // "Regresar" por defecto
  rightExtra?: ReactNode;
  bottomSlot?: ReactNode;
  className?: string;
  /** hero = alto como la captura, compact = más bajito */
  size?: "hero" | "compact";
};

export default function PageHeader({
  title,
  subtitle,
  imageSrc,
  imageAlt = "Icono",
  doctorName,
  doctorLabel = "MÉDICO",
  onBack,
  backText = "Regresar",
  rightExtra,
  bottomSlot,
  className = "",
  size = "hero",
}: PageHeaderProps) {
  const isHero = size === "hero";

  return (
    <div
      className={[
        "relative overflow-hidden rounded-2xl",
        // Gradiente angular vibrante con movimiento
        "bg-[linear-gradient(135deg,#ff0076,#ff7a00,#ffeb00,#00ff66,#00f0ff,#a200ff)]",
        "bg-size-200 bg-pos-0",
        "animate-gradientFlow",
        // Sombra intensa con efecto neón
        "shadow-[0_0_30px_rgba(255,0,118,0.5),0_0_60px_rgba(0,240,255,0.3),0_0_90px_rgba(162,0,255,0.2)]",
        isHero ? "px-8 py-8" : "px-6 py-5",
        "mb-10 transform transition-all duration-500 hover:scale-[1.01]",
        className,
      ].join(" ")}
    >
      {/* Efecto de partículas brillantes */}
      <div 
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 10 + 2}px`,
              height: `${Math.random() * 10 + 2}px`,
              background: "#ffffff",
              borderRadius: "50%",
              opacity: Math.random() * 0.6 + 0.2,
              animationDuration: `${Math.random() * 3 + 2}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* Capa oscura para contraste */}
      <div className="absolute inset-0 bg-black/30 rounded-2xl pointer-events-none" />
      
      {/* Borde neón animado */}
      <div 
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          boxShadow: "inset 0 0 15px rgba(255, 255, 255, 0.8), inset 0 0 30px rgba(255, 0, 118, 0.6)",
          animation: "pulseBorder 3s infinite alternate"
        }}
      />
      
      {/* Contenido principal */}
      <div className="relative grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-6 items-center z-10">
        {/* Icono con efecto 3D y resplandor */}
        <div className="flex justify-center">
          <div className="relative">
            <div 
              className={[
                "bg-white rounded-xl p-1.5 border-2 border-white/80",
                "transform rotate-3d",
                "shadow-[0_0_20px_rgba(255,255,255,0.7)]",
                isHero ? "h-24 w-24" : "h-20 w-20"
              ].join(" ")}
              style={{
                transformStyle: "preserve-3d",
                transform: "perspective(1000px) rotateX(5deg) rotateY(-5deg)"
              }}
            >
              <Image
                src={imageSrc}
                alt={imageAlt}
                width={isHero ? 90 : 70}
                height={isHero ? 90 : 70}
                className="rounded-lg object-cover w-full h-full"
              />
            </div>
            {/* Resplandor */}
            <div 
              className="absolute inset-0 rounded-xl bg-white blur-xl opacity-50 pointer-events-none"
              style={{zIndex: -1}}
            />
          </div>
        </div>

        {/* Títulos con efecto de texto brillante */}
        <div className="text-center md:text-left min-w-0">
          <h1 
            className={[
              "font-bold tracking-tight",
              isHero ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl",
              "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]",
              "animate-textGlow"
            ].join(" ")}
          >
            {title}
          </h1>
          
          {subtitle && (
            <p 
              className={[
                "mt-3 font-medium max-w-2xl",
                isHero ? "text-xl" : "text-lg",
                "text-white/90 drop-shadow-[0_0_5px_rgba(255,255,255,0.7)]"
              ].join(" ")}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Controles con efecto neón */}
        <div className="flex flex-col items-center gap-5">
          {/* Bloque médico con efecto holográfico */}
          {doctorName && (
            <div 
              className="bg-black/30 backdrop-blur-sm rounded-xl py-3 px-4 border border-white/30"
              style={{
                boxShadow: "0 0 15px rgba(0, 240, 255, 0.5)",
                animation: "hologramPulse 2s infinite alternate"
              }}
            >
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <span 
                    className="h-3 w-3 rounded-full bg-cyan-400"
                    style={{
                      boxShadow: "0 0 10px rgba(0, 240, 255, 1)"
                    }}
                  ></span>
                  <span className="text-xs font-bold uppercase tracking-widest text-cyan-300">
                    {doctorLabel}
                  </span>
                </div>
                <p className="text-sm font-bold text-white mt-1 truncate w-full text-center">
                  {doctorName}
                </p>
              </div>
            </div>
          )}

          {/* Botón con efecto neón interactivo */}
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className={[
                  "relative overflow-hidden",
                  "inline-flex items-center gap-2 rounded-xl",
                  "px-5 py-3 text-sm font-bold text-white",
                  "border-2 border-cyan-400/80",
                  "shadow-[0_0_15px_rgba(0,240,255,0.7)]",
                  "hover:shadow-[0_0_25px_rgba(0,240,255,1)]",
                  "transform transition-all duration-300 hover:scale-105",
                  "animate-buttonGlow"
                ].join(" ")}
              >
                <span className="text-xl">←</span>
                <span>{backText}</span>
                {/* Efecto de luz al pasar mouse */}
                <div className="absolute inset-0 bg-white/10 pointer-events-none opacity-0 hover:opacity-100 transition-opacity" />
              </button>
            )}
            {rightExtra}
          </div>
        </div>
      </div>

      {/* Slot inferior con efecto de luz */}
      {bottomSlot && (
        <div 
          className="mt-8 pt-5 border-t border-white/20 relative"
          style={{
            boxShadow: "inset 0 10px 20px -15px rgba(255,255,255,0.5)"
          }}
        >
          <div className="relative z-10">
            {bottomSlot}
          </div>
          {/* Luz inferior */}
          <div 
            className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-white/20 to-transparent pointer-events-none"
            style={{zIndex: 0}}
          />
        </div>
      )}

      {/* Efecto de rayos de luz */}
      <div 
        className="absolute top-1/2 left-1/2 w-[200%] h-[200%] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 60%)",
          transform: "translate(-50%, -50%)",
          zIndex: 0
        }}
      />

      {/* Estilos de animación en línea */}
      <style jsx>{`
        @keyframes gradientFlow {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
        
        @keyframes pulseBorder {
          0% { box-shadow: inset 0 0 15px rgba(255, 255, 255, 0.8), inset 0 0 30px rgba(255, 0, 118, 0.6); }
          100% { box-shadow: inset 0 0 25px rgba(255, 255, 255, 1), inset 0 0 45px rgba(0, 240, 255, 0.8); }
        }
        
        @keyframes textGlow {
          0% { text-shadow: 0 0 10px rgba(255, 255, 255, 0.9); }
          50% { text-shadow: 0 0 20px rgba(255, 255, 255, 1), 0 0 30px rgba(0, 240, 255, 0.8); }
          100% { text-shadow: 0 0 10px rgba(255, 255, 255, 0.9); }
        }
        
        @keyframes buttonGlow {
          0% { box-shadow: 0 0 15px rgba(0, 240, 255, 0.7); }
          50% { box-shadow: 0 0 25px rgba(0, 240, 255, 1); }
          100% { box-shadow: 0 0 15px rgba(0, 240, 255, 0.7); }
        }
        
        @keyframes hologramPulse {
          0% { box-shadow: 0 0 15px rgba(0, 240, 255, 0.5); }
          100% { box-shadow: 0 0 25px rgba(162, 0, 255, 0.8); }
        }
      `}</style>
    </div>
  );
}

export { PageHeader };