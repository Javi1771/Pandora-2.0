// src/components/PageHeader.tsx
"use client";
import Image from "next/image";
import { ReactNode } from "react";
import { motion } from "framer-motion";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  imageSrc: string;
  imageAlt?: string;
  doctorName?: ReactNode;
  doctorLabel?: string;
  onBack?: () => void;
  backText?: string;
  rightExtra?: ReactNode;
  bottomSlot?: ReactNode;
  className?: string;
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
      className={`relative mb-8 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 ${className}`}
    >
      {/* Fondo principal estilo dashboard */}
      <div
        className={`bg-gradient-to-r from-indigo-800 to-purple-900 text-white ${
          isHero ? "p-6 md:p-8" : "p-4 md:p-5"
        }`}
      >
        {/* Brillos decorativos */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -left-10 -bottom-10 w-52 h-52 bg-white/10 rounded-full blur-2xl" />
        </div>

        {/* Contenido principal */}
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
          {/* Izquierda: botón volver + imagen + títulos */}
          <div className="flex items-center gap-4 sm:gap-5 min-w-0 flex-1 w-full">
            {onBack && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onBack}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold bg-gradient-to-r from-red-500 to-red-700 shadow-lg hover:shadow-red-500/30"
                title={backText}
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span>{backText}</span>
              </motion.button>
            )}

            {/* Imagen / ícono */}
            <div
              className={`relative rounded-2xl p-3 sm:p-4 bg-white/10 backdrop-blur-xl ring-1 ring-white/20 ${
                isHero ? "h-20 w-20" : "h-16 w-16"
              } shrink-0`}
            >
              <Image
                src={imageSrc}
                alt={imageAlt}
                width={isHero ? 64 : 48}
                height={isHero ? 64 : 48}
                className="object-contain w-full h-full"
                priority
              />
              <div className="absolute inset-0 rounded-2xl bg-white/5" />
            </div>

            {/* Títulos */}
            <div className="min-w-0">
              <h1
                className={`${
                  isHero ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
                } font-bold leading-tight drop-shadow`}
              >
                {title}
              </h1>
              <div className="mt-2 flex items-center gap-3">
                {subtitle && (
                  <p className={`${
                    isHero ? "text-sm md:text-base" : "text-sm"
                  } text-indigo-100/90 truncate max-w-full md:max-w-[60vw]`}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Derecha: chip del médico + extra */}
          <div className="flex items-center gap-3 w-full md:w-auto md:justify-end flex-wrap">
            {rightExtra && <div className="hidden sm:block">{rightExtra}</div>}

            {doctorName && (
              <div className="relative max-w-full">
                <div className="flex flex-col items-end bg-white/10 backdrop-blur-xl px-4 py-3 rounded-2xl ring-1 ring-white/15 shadow-lg">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-100/90">
                    <span className="relative inline-flex items-center">
                      <span className="w-2 h-2 rounded-full bg-emerald-300" />
                      <span className="absolute inset-0 rounded-full bg-emerald-300 opacity-40 animate-ping" />
                    </span>
                    {doctorLabel}
                  </div>
                  <div className="mt-1 text-sm font-semibold truncate max-w-[80vw] md:max-w-[280px]">
                    {doctorName}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contenido inferior (tabs, filtros, etc.) */}
        {bottomSlot && (
          <div className="relative z-10 mt-5 pt-5 border-t border-white/10 overflow-x-auto">
            <div className="absolute -top-px left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            <div className="min-w-max md:min-w-0">{bottomSlot}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// Permite importar como default o con llaves { PageHeader }
export { PageHeader };
