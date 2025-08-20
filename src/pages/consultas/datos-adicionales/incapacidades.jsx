/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaCalendarAlt } from "react-icons/fa";
import { FormularioContext } from "/src/context/FormularioContext";
import HistorialIncapacidadesTable from "../components/HistorialIncapacidades";

/* ---------- Helpers ---------- */
const normalizeDateForSQL = (value, start) => {
  if (!value) return null;
  const d = typeof value === "string" ? new Date(value.replace(" ", "T")) : new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${
    start ? "00:00:00.000" : "23:59:00.000"
  }`;
};

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767.98px)");
    const update = () => setIsMobile(mq.matches);
    update();
    const add = mq.addEventListener ? mq.addEventListener : mq.addListener;
    const rm = mq.removeEventListener ? mq.removeEventListener : mq.removeListener;
    add.call(mq, "change", update);
    return () => rm.call(mq, "change", update);
  }, []);
  return isMobile;
};

/* ---------- Hook: alto visible robusto ---------- */
const useVisualHeight = () => {
  const [vhPx, setVhPx] = useState(
    typeof window !== "undefined" ? window.innerHeight : 0
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    const vv = window.visualViewport;
    const update = () => setVhPx((vv?.height ?? window.innerHeight));
    update();
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    window.addEventListener("orientationchange", update);
    return () => {
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);
  return vhPx;
};

/* ---------- Modal calendario SOLO móvil (con portal y visual viewport) ---------- */
function MobileCalendarModal({
  open,
  onClose,
  title = "Selecciona una fecha",
  accent = "indigo",
  value,
  onChange,
  tileDisabled,
}) {
  const vhPx = useVisualHeight();
  const portalNodeRef = useRef(null);

  // Crear contenedor de portal una sola vez
  useEffect(() => {
    const node = document.createElement("div");
    node.setAttribute("data-portal", "calendar-modal");
    document.body.appendChild(node);
    portalNodeRef.current = node;
    return () => {
      if (portalNodeRef.current) {
        document.body.removeChild(portalNodeRef.current);
        portalNodeRef.current = null;
      }
    };
  }, []);

  // Lock scroll y cerrar con ESC
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev || "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !portalNodeRef.current) return null;

  const headGrad = accent === "pink" ? "from-pink-600 to-rose-600" : "from-indigo-600 to-purple-600";

  const modal = (
    <div
      className="fixed inset-0 z-[9999] md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      // Alto real visible (sin contar scroll del documento)
      style={{ height: vhPx, contain: "layout paint size" }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/55" onPointerDown={onClose} />

      {/* Contenedor centrado respecto al viewport visible */}
      <div className="relative h-full w-full grid place-items-center p-4">
        <div
          className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`px-4 py-3 text-white bg-gradient-to-r ${headGrad} flex items-center justify-between`}>
            <h3 className="font-bold text-[clamp(15px,4vw,18px)] truncate">{title}</h3>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 font-semibold text-sm"
            >
              Cerrar
            </button>
          </div>

          {/* Calendario (se re-monta cada vez para evitar “pantalla en blanco” en iOS) */}
          <div className="p-3 w-full max-h-[80dvh] overflow-auto [-webkit-overflow-scrolling:touch]">
            <Calendar
              key={title}            // fuerza re-render entre inicio/fin
              locale="es-MX"
              value={value}
              onChange={onChange}
              tileDisabled={tileDisabled}
              next2Label={null}
              prev2Label={null}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, portalNodeRef.current);
}

/* =================== Componente principal =================== */
const Incapacidades = ({ clavepaciente, claveConsulta, clavenomina }) => {
  const { updateFormulario } = useContext(FormularioContext);
  const isMobile = useIsMobile();

  const [autorizarIncapacidad, setAutorizarIncapacidad] = useState("no");
  const [fechaInicio, setFechaInicio] = useState(null); // string normalizado o null
  const [fechaFin, setFechaFin] = useState(null);
  const [isFechaInicioOpen, setIsFechaInicioOpen] = useState(false);
  const [isFechaFinOpen, setIsFechaFinOpen] = useState(false);
  const [diagnostico, setDiagnostico] = useState("");

  const [historialIncapacidades, setHistorialIncapacidades] = useState([]);

  /* Cargar historial (solo clavenomina) */
  useEffect(() => {
    if (!clavenomina) {
      setHistorialIncapacidades([]);
      return;
    }
    (async () => {
      try {
        const qs = new URLSearchParams({ clavenomina });
        const r = await fetch(`/api/incapacidades/historial?${qs.toString()}`);
        if (!r.ok) return setHistorialIncapacidades([]);
        const data = await r.json();
        const limpio = Array.isArray(data?.historial)
          ? data.historial.filter((x) => x.claveincapacidad)
          : [];
        setHistorialIncapacidades(limpio);
      } catch {
        setHistorialIncapacidades([]);
      }
    })();
  }, [clavenomina]);

  /* Guardar en localStorage (cuando se autoriza) */
  useEffect(() => {
    if (autorizarIncapacidad !== "si") return;
    const payload = {
      autorizarIncapacidad,
      fechaInicio: normalizeDateForSQL(fechaInicio, true),
      fechaFin: normalizeDateForSQL(fechaFin, false),
      diagnostico: diagnostico.trim() || null,
    };
    localStorage.setItem("Incapacidad", JSON.stringify(payload));
  }, [autorizarIncapacidad, fechaInicio, fechaFin, diagnostico]);

  /* Cargar previos */
  useEffect(() => {
    const raw = localStorage.getItem("Incapacidad");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      setAutorizarIncapacidad(parsed.autorizarIncapacidad ?? "no");
      setFechaInicio(parsed.fechaInicio ?? null);
      setFechaFin(parsed.fechaFin ?? null);
      setDiagnostico(parsed.diagnostico ?? "");
    } catch {/* ignore */}
  }, []);

  /* Compleción formulario global */
  useEffect(() => {
    const ok =
      autorizarIncapacidad === "no" ||
      (autorizarIncapacidad === "si" && !!fechaInicio && !!fechaFin && !!diagnostico);
    updateFormulario?.("Incapacidades", ok);
  }, [autorizarIncapacidad, fechaInicio, fechaFin, diagnostico, updateFormulario]);

  /* Si elige "No", resetea */
  useEffect(() => {
    if (autorizarIncapacidad !== "no") return;
    const payload = { autorizarIncapacidad, fechaInicio: null, fechaFin: null, diagnostico: null };
    localStorage.setItem("Incapacidad", JSON.stringify(payload));
  }, [autorizarIncapacidad]);

  const handleAutorizarChange = (val) => {
    setAutorizarIncapacidad(val);
    if (val === "no") {
      setFechaInicio(null);
      setFechaFin(null);
      setDiagnostico("");
      setIsFechaInicioOpen(false);
      setIsFechaFinOpen(false);
    }
  };

  // Días de diferencia (incluyente)
  const getDiasDiferencia = () => {
    if (!fechaInicio || !fechaFin) return 0;
    const ini = new Date(fechaInicio.replace(" ", "T"));
    const fin = new Date(fechaFin.replace(" ", "T"));
    const diff = fin - ini;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  // Valores Date para <Calendar/>
  const dateInicioValue = useMemo(
    () => (fechaInicio ? new Date(fechaInicio.replace(" ", "T")) : null),
    [fechaInicio]
  );
  const dateFinValue = useMemo(
    () => (fechaFin ? new Date(fechaFin.replace(" ", "T")) : null),
    [fechaFin]
  );

  // Reglas de deshabilitado
  const disablePast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };
  const disableFin = (date) => {
    if (!fechaInicio) return true;
    const ini = new Date(fechaInicio.replace(" ", "T"));
    const min = new Date(ini);
    const max = new Date(ini);
    max.setDate(ini.getDate() + 14);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < min || date > max || date < today;
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-5 md:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-white">Incapacidades</h3>
          <span className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-white/90 text-indigo-900 ring-1 ring-white/70">
            {autorizarIncapacidad === "si" ? "Autorizada" : "No autorizada"}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 md:p-6">
        {/* Toggle Sí/No */}
        <div className="mb-6">
          <p className="text-gray-800 font-semibold mb-2">¿Autorizar incapacidad?</p>
          <div className="w-full">
            <div className="relative w-full bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-1 ring-1 ring-indigo-200 shadow-inner">
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => handleAutorizarChange("si")}
                  aria-pressed={autorizarIncapacidad === "si"}
                  className={`group relative w-full px-6 py-3 md:py-4 rounded-xl text-base md:text-lg font-semibold transition-all duration-150 
                    ${autorizarIncapacidad === "si" ? "bg-white text-indigo-700 ring-1 ring-indigo-300 shadow" : "text-indigo-800/80 hover:text-indigo-900 hover:bg-white/50"}`}
                >
                  <span className="flex items-center justify-center gap-3">
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-sm ${autorizarIncapacidad === "si" ? "bg-emerald-500 text-white border-emerald-500" : "bg-white/90 text-indigo-400 border-indigo-300"}`}>✓</span>
                    Sí
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAutorizarChange("no")}
                  aria-pressed={autorizarIncapacidad === "no"}
                  className={`group relative w-full px-6 py-3 md:py-4 rounded-xl text-base md:text-lg font-semibold transition-all duration-150 
                    ${autorizarIncapacidad === "no" ? "bg-white text-rose-700 ring-1 ring-rose-300 shadow" : "text-rose-800/80 hover:text-rose-900 hover:bg-white/50"}`}
                >
                  <span className="flex items-center justify-center gap-3">
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-sm ${autorizarIncapacidad === "no" ? "bg-rose-500 text-white border-rose-500" : "bg-white/90 text-rose-400 border-rose-300"}`}>✕</span>
                    No
                  </span>
                </button>
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">Puedes cambiar esta opción en cualquier momento.</p>
        </div>

        {autorizarIncapacidad === "si" && (
          <>
            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Fecha inicial */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha inicial</label>
                <button
                  type="button"
                  onClick={() => { setIsFechaInicioOpen(true); setIsFechaFinOpen(false); }}
                  className="w-full flex items-center justify-between gap-3 rounded-xl bg-white border border-gray-300 px-4 py-3 text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <span className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200">
                      <FaCalendarAlt />
                    </span>
                    <span className="font-medium">
                      {fechaInicio ? fechaInicio.substring(0, 10) : "Selecciona una fecha"}
                    </span>
                  </span>
                  <span className="text-xs text-gray-500">00:00</span>
                </button>

                {/* Popover escritorio */}
                {!isMobile && isFechaInicioOpen && (
                  <div className="absolute z-50 mt-2 left-0 w-[min(92vw,360px)] rounded-2xl bg-white ring-1 ring-indigo-200 shadow-xl p-3">
                    <Calendar
                      key="inicio-desktop"
                      locale="es-MX"
                      onChange={(date) => {
                        const sel = normalizeDateForSQL(date, true);
                        setFechaInicio(sel);
                        setFechaFin(null);
                        setIsFechaInicioOpen(false);
                      }}
                      value={dateInicioValue}
                      tileDisabled={({ date }) => disablePast(date)}
                      next2Label={null}
                      prev2Label={null}
                    />
                  </div>
                )}
              </div>

              {/* Fecha final */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha final</label>
                <button
                  type="button"
                  onClick={() => { setIsFechaFinOpen(true); setIsFechaInicioOpen(false); }}
                  className="w-full flex items-center justify-between gap-3 rounded-xl bg-white border border-gray-300 px-4 py-3 text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <span className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-pink-100 text-pink-700 ring-1 ring-pink-200">
                      <FaCalendarAlt />
                    </span>
                    <span className="font-medium">
                      {fechaFin ? fechaFin.substring(0, 10) : "Selecciona una fecha"}
                    </span>
                  </span>
                  <span className="text-xs text-gray-500">23:59</span>
                </button>

                {/* Popover escritorio */}
                {!isMobile && isFechaFinOpen && (
                  <div className="absolute z-50 mt-2 left-0 w-[min(92vw,360px)] rounded-2xl bg-white ring-1 ring-pink-200 shadow-xl p-3">
                    <Calendar
                      key="fin-desktop"
                      locale="es-MX"
                      onChange={(date) => {
                        const sel = normalizeDateForSQL(date, false);
                        setFechaFin(sel);
                        setIsFechaFinOpen(false);
                      }}
                      value={dateFinValue}
                      tileDisabled={({ date }) => disableFin(date)}
                      next2Label={null}
                      prev2Label={null}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Calendarios en MODAL (solo móvil) */}
            <MobileCalendarModal
              open={isMobile && isFechaInicioOpen}
              onClose={() => setIsFechaInicioOpen(false)}
              title="Selecciona fecha inicial"
              accent="indigo"
              value={dateInicioValue}
              onChange={(date) => {
                const sel = normalizeDateForSQL(date, true);
                setFechaInicio(sel);
                setFechaFin(null);
                setIsFechaInicioOpen(false);
              }}
              tileDisabled={disablePast}
            />
            <MobileCalendarModal
              open={isMobile && isFechaFinOpen}
              onClose={() => setIsFechaFinOpen(false)}
              title="Selecciona fecha final"
              accent="pink"
              value={dateFinValue}
              onChange={(date) => {
                const sel = normalizeDateForSQL(date, false);
                setFechaFin(sel);
                setIsFechaFinOpen(false);
              }}
              tileDisabled={disableFin}
            />

            {/* Contador de días */}
            {fechaInicio && fechaFin && (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 p-5 text-center">
                <span className="block text-sm font-semibold text-emerald-800">Días de Incapacidad</span>
                <div className="mt-2 flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-extrabold text-emerald-700">{getDiasDiferencia()}</span>
                  <span className="text-lg font-medium text-emerald-800">
                    {getDiasDiferencia() === 1 ? "día" : "días"}
                  </span>
                </div>
              </div>
            )}

            {/* Diagnóstico */}
            <div className="mt-6">
              <label className="text-sm font-semibold text-gray-700 mb-2 block uppercase">Diagnóstico</label>
              <textarea
                value={diagnostico || ""}
                onChange={(e) => e.target.value.length <= 120 && setDiagnostico(e.target.value.toUpperCase())}
                maxLength={120}
                className="block w-full rounded-xl bg-white border border-gray-300 text-gray-800 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase"
                placeholder="ESCRIBE AQUÍ EL DIAGNÓSTICO... (MÁX. 120 CARACTERES)"
              />
              <p className="text-xs text-gray-500 mt-1 uppercase">{diagnostico?.length || 0}/120</p>
            </div>
          </>
        )}

        {/* Historial */}
        <div className="mt-6">
          <HistorialIncapacidadesTable historial={historialIncapacidades} />
        </div>
      </div>

      {/* 🎨 Estilos globales react-calendar (mantengo tu skin) */}
      <style jsx global>{`
        .react-calendar { width: 100%; border: 1px solid rgba(99,102,241,.25); border-radius: 16px; background: #fff; padding: 8px; color: #111827; }
        .react-calendar__navigation { display: flex; height: 44px; margin-bottom: 8px; }
        .react-calendar__navigation button { min-width: 44px; background: transparent; border: 0; border-radius: 10px; color: #1f2937; font-weight: 800; font-size: 14px; }
        .react-calendar__navigation button:enabled:hover, .react-calendar__navigation button:enabled:focus { background: #eef2ff; color: #3730a3; }
        .react-calendar__navigation button[disabled]{opacity:.4}
        .react-calendar__month-view__weekdays { text-align: center; text-transform: uppercase; font-size: 11px; letter-spacing: .04em; color:#6366f1; margin-bottom:2px;}
        .react-calendar__month-view__weekdays__weekday abbr { text-decoration: none; font-weight: 700; }
        .react-calendar__tile { padding: 10px 0; font-size: 14px; color: #374151; border-radius: 12px; }
        .react-calendar__tile:enabled:hover { background: #f5f3ff; color: #6d28d9; }
        .react-calendar__tile:disabled { background: #f3f4f6; color:#9ca3af; border-radius:12px; }
        .react-calendar__tile--now { background:#fffbeb; color:#92400e; box-shadow: inset 0 0 0 1px #fde68a; }
        .react-calendar__tile--active { background:#e0e7ff; color:#3730a3; font-weight:800; box-shadow: inset 0 0 0 2px #c7d2fe; }
        .react-calendar__month-view__days__day--weekend { color:#b91c1c; }
        @media (max-width: 380px) {
          .react-calendar__navigation button { font-size: 13px; }
          .react-calendar__tile { font-size: 13px; }
          .react-calendar__month-view__weekdays { font-size: 10px; }
        }
      `}</style>
    </div>
  );
};

export default Incapacidades;
