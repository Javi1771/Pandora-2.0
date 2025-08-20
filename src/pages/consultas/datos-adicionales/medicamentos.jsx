/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
  useRef,
} from "react";
import dynamic from "next/dynamic";
import { showCustomAlert } from "../../../utils/alertas";
import { FormularioContext } from "/src/context/FormularioContext";
import MedicamentoDropdown from "../components/MedicamentoDropdown";
import TratamientoInput from "../components/TratamientoInput";
import { FiRefreshCw } from "react-icons/fi";
import { FaCalendarAlt } from "react-icons/fa";

/* ---------------- Constantes fuera del componente (no se recrean) ---------------- */
const DEFAULT_MED = Object.freeze({
  medicamento: "",
  indicaciones: "",
  tratamiento: "",
  tratamientoDias: 30,
  piezas: "",
  resurtir: "no",
  mesesResurtir: null,
});
const PHRASE_TEMPLATES = Object.freeze([
  "Durante __ días.",
  "Por __ días.",
  "En __ días.",
]);
const SUCCESS_SOUND = "/assets/applepay.mp3";
const ERROR_SOUND = "/assets/error.mp3";

/* Code-splitting: el historial se carga cuando se necesita */
const HistorialMedicamentos = dynamic(
  () => import("../components/HistorialMedicamentos"),
  {
    loading: () => (
      <div className="mt-6 animate-pulse">
        <div className="h-4 w-40 bg-gray-200 rounded mb-3" />
        <div className="h-20 w-full bg-gray-100 rounded" />
      </div>
    ),
    ssr: false,
  }
);

const Medicamentos = ({ clavenomina, clavepaciente }) => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [listaMedicamentos, setListaMedicamentos] = useState([]);
  const [loadingMedicamentos, setLoadingMedicamentos] = useState(true);
  const [decisionTomada, setDecisionTomada] = useState("no");
  const { updateFormulario } = useContext(FormularioContext);

  /* Refs para reutilizar audios (no crear new Audio cada vez) */
  const okAudioRef = useRef(null);
  const errAudioRef = useRef(null);

  useEffect(() => {
    // Pre-carga de audio solo en cliente
    okAudioRef.current = new Audio(SUCCESS_SOUND);
    errAudioRef.current = new Audio(ERROR_SOUND);
  }, []);

  const playSound = useCallback((ok) => {
    const el = ok ? okAudioRef.current : errAudioRef.current;
    if (!el) return;
    try {
      el.currentTime = 0;
      el.play();
    } catch (_) {
      // Dispositivos con restricciones de autoplay: ignorar
    }
  }, []);

  /* Fetch con AbortController (evita trabajo innecesario) */
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      setLoadingMedicamentos(true);
      try {
        const r = await fetch("/api/medicamentos/listar", {
          signal: ac.signal,
        });
        const data = await r.json();
        setListaMedicamentos(Array.isArray(data) ? data : []);
      } catch (_) {
        // Silencio: ya hay skeleton/estado
      } finally {
        setLoadingMedicamentos(false);
      }
    })();
    return () => ac.abort();
  }, []);

  /* Restaurar decisión y datos */
  useEffect(() => {
    const sd = localStorage.getItem("decisionTomada");
    const sm = JSON.parse(localStorage.getItem("medicamentos") || "[]");
    if (sd) setDecisionTomada(sd);
    if (Array.isArray(sm) && sm.length) setMedicamentos(sm);
  }, []);

  /* Persistir solo cuando aplica */
  useEffect(() => {
    if (decisionTomada === "si") {
      localStorage.setItem("medicamentos", JSON.stringify(medicamentos));
    }
  }, [medicamentos, decisionTomada]);

  /* Validación de completitud (memoizada) */
  const completos = useMemo(() => {
    return (
      decisionTomada === "no" ||
      (decisionTomada === "si" &&
        medicamentos.every(
          (m) =>
            m.medicamento &&
            m.indicaciones &&
            m.tratamiento &&
            m.tratamientoDias &&
            m.piezas &&
            (m.resurtir === "no" || (m.resurtir === "si" && m.mesesResurtir))
        ))
    );
  }, [medicamentos, decisionTomada]);

  useEffect(() => {
    updateFormulario("Medicamentos", completos);
  }, [completos, updateFormulario]);

  useEffect(() => {
    localStorage.setItem("decisionTomada", decisionTomada);
  }, [decisionTomada]);

  /* Handlers optimizados */
  const handleDecision = useCallback((d) => {
    setDecisionTomada(d);
    if (d === "no") {
      setMedicamentos([]);
      localStorage.removeItem("medicamentos");
    } else {
      const saved = JSON.parse(localStorage.getItem("medicamentos") || "[]");
      setMedicamentos(saved.length ? saved : [{ ...DEFAULT_MED }]);
    }
    localStorage.setItem("decisionTomada", d);
  }, []);

  const handleMedicamentoChange = useCallback((i, field, val) => {
    setMedicamentos((prev) => {
      const tmp = [...prev];
      const next = { ...tmp[i], [field]: val };
      // Si baja de 30 días, no permitir resurtir
      if (field === "tratamientoDias" && Number(val) < 30) {
        next.resurtir = "no";
        next.mesesResurtir = null;
      }
      tmp[i] = next;
      return tmp;
    });
  }, []);

  const handleSelectMedicamento = useCallback(
    async (idx, nuevo) => {
      if (medicamentos.some((m, j) => j !== idx && m.medicamento === nuevo)) {
        await showCustomAlert(
          "error",
          "Medicamento duplicado",
          "Ya seleccionaste ese medicamento. Elige otro.",
          "Aceptar"
        );
        playSound(false);
        return;
      }
      handleMedicamentoChange(idx, "medicamento", nuevo);
      playSound(true);
    },
    [medicamentos, handleMedicamentoChange, playSound]
  );

  const agregarMedicamento = useCallback(
    () => setMedicamentos((prev) => [...prev, { ...DEFAULT_MED }]),
    []
  );

  const quitarMedicamento = useCallback(
    (i) => setMedicamentos((prev) => prev.filter((_, idx) => idx !== i)),
    []
  );

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-md overflow-hidden w-full min-w-0">
      {/* Header (menos costoso de pintar) */}
      <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <h3 className="font-bold text-white text-[clamp(15px,3.8vw,20px)]">
            Prescripción de Medicamentos
          </h3>
          <span className="px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-white/20 text-white">
            {medicamentos.length} en la receta
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4 md:p-6">
        {/* Toggle Sí/No (100% ancho en móvil) */}
        <div className="mb-5 sm:mb-6">
          <p className="text-gray-800 font-semibold mb-2 text-[clamp(13px,3.6vw,15px)]">
            ¿Se darán medicamentos en esta consulta?
          </p>

          <div className="w-full">
            <div className="relative w-full bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-1 ring-1 ring-indigo-200">
              <div className="grid grid-cols-2 gap-1">
                {/* Sí */}
                <button
                  onClick={() => handleDecision("si")}
                  aria-pressed={decisionTomada === "si"}
                  className={`relative w-full px-4 sm:px-6 py-3 rounded-xl text-[clamp(13px,3.5vw,17px)] font-semibold transition-[background,color,box-shadow]
                    ${
                      decisionTomada === "si"
                        ? "bg-white text-indigo-700 ring-1 ring-indigo-300 shadow"
                        : "text-indigo-800/80 hover:text-indigo-900 hover:bg-white/50"
                    }`}
                >
                  <span className="flex items-center justify-center gap-2 sm:gap-3">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-sm
                        ${
                          decisionTomada === "si"
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "bg-white/90 text-indigo-400 border-indigo-300"
                        }`}
                    >
                      ✓
                    </span>
                    Sí
                  </span>
                </button>

                {/* No */}
                <button
                  onClick={() => handleDecision("no")}
                  aria-pressed={decisionTomada === "no"}
                  className={`relative w-full px-4 sm:px-6 py-3 rounded-xl text-[clamp(13px,3.5vw,17px)] font-semibold transition-[background,color,box-shadow]
                    ${
                      decisionTomada === "no"
                        ? "bg-white text-rose-700 ring-1 ring-rose-300 shadow"
                        : "text-rose-800/80 hover:text-rose-900 hover:bg-white/50"
                    }`}
                >
                  <span className="flex items-center justify-center gap-2 sm:gap-3">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-sm
                        ${
                          decisionTomada === "no"
                            ? "bg-rose-500 text-white border-rose-500"
                            : "bg-white/90 text-rose-400 border-rose-300"
                        }`}
                    >
                      ✕
                    </span>
                    No
                  </span>
                </button>
              </div>
            </div>
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Puedes cambiar esta opción en cualquier momento.
          </p>
        </div>

        {/* Lista de medicamentos */}
        {decisionTomada === "si" &&
          medicamentos.map((med, idx) => (
            <div
              key={idx}
              className="relative mt-5 sm:mt-6 rounded-2xl border border-indigo-100 bg-white shadow-sm p-3 sm:p-4"
            >
              {/* header mini */}
              <div className="mb-3 sm:mb-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200">
                  #{idx + 1} Medicamento
                </span>
                {medicamentos.length > 1 && (
                  <button
                    onClick={() => quitarMedicamento(idx)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-200"
                  >
                    Quitar
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Dropdown */}
                <div className="min-w-0">
                  <label className="text-sm font-semibold text-gray-700">
                    Medicamento
                  </label>
                  <div className="mt-2">
                    <MedicamentoDropdown
                      listaMedicamentos={listaMedicamentos}
                      value={med.medicamento}
                      playSound={playSound}
                      isLoading={loadingMedicamentos}
                      onChangeMedicamento={(v) =>
                        handleSelectMedicamento(idx, v)
                      }
                    />
                  </div>
                </div>

                {/* Indicaciones */}
                <div className="min-w-0">
                  <label className="text-sm font-semibold text-gray-700 uppercase">
                    Indicaciones
                  </label>
                  <textarea
                    value={med.indicaciones}
                    onChange={(e) =>
                      handleMedicamentoChange(
                        idx,
                        "indicaciones",
                        e.target.value.slice(0, 90).toUpperCase()
                      )
                    }
                    maxLength={90}
                    className="mt-2 w-full h-[26vh] sm:h-36 rounded-xl bg-white border border-gray-300 text-gray-800 p-3 uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-[clamp(12px,3.4vw,14px)]"
                    placeholder="ESCRIBE AQUÍ..."
                  />
                  <p className="text-[11px] text-gray-500 mt-1 uppercase">
                    {med.indicaciones.length}/90
                  </p>
                </div>

                {/* Tratamiento */}
                <div className="min-w-0">
                  <label className="text-sm font-semibold text-gray-700">
                    Tratamiento
                  </label>
                  <div className="mt-2">
                    <TratamientoInput
                      med={med}
                      index={idx}
                      handleMedicamentoChange={handleMedicamentoChange}
                      phraseTemplates={PHRASE_TEMPLATES}
                    />
                  </div>
                </div>

                {/* Piezas y resurtir */}
                <div className="min-w-0">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    Piezas
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={med.piezas}
                    onChange={(e) =>
                      handleMedicamentoChange(idx, "piezas", e.target.value)
                    }
                    className="w-full h-12 rounded-xl bg-white border border-gray-300 text-gray-800 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Cantidad"
                    aria-label={`Piezas para medicamento #${idx + 1}`}
                  />

                  {Number(med.tratamientoDias) === 30 && (
                    <>
                      {/* Resurtir — RESPONSIVE */}
                      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-3 sm:gap-4">
                          {/* Pregunta */}
                          <div className="flex items-center gap-2 min-w-0">
                            <FiRefreshCw className="text-emerald-500 shrink-0" />
                            <span className="text-gray-800 font-medium text-[clamp(13px,3.4vw,15px)]">
                              ¿Resurtir?
                            </span>
                          </div>

                          {/* Toggle SI / NO */}
                          <div className="w-full sm:w-auto">
                            <div className="grid grid-cols-2 sm:inline-grid sm:auto-cols-max sm:grid-flow-col gap-2 w-full">
                              <button
                                onClick={() =>
                                  handleMedicamentoChange(idx, "resurtir", "si")
                                }
                                aria-pressed={med.resurtir === "si"}
                                className={`px-4 py-2 rounded-lg text-[clamp(12px,3.2vw,14px)] font-semibold transition-colors w-full sm:w-auto
                ${
                  med.resurtir === "si"
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                                title="Sí"
                              >
                                Sí
                              </button>
                              <button
                                onClick={() => {
                                  handleMedicamentoChange(
                                    idx,
                                    "resurtir",
                                    "no"
                                  );
                                  handleMedicamentoChange(
                                    idx,
                                    "mesesResurtir",
                                    null
                                  );
                                }}
                                aria-pressed={med.resurtir === "no"}
                                className={`px-4 py-2 rounded-lg text-[clamp(12px,3.2vw,14px)] font-semibold transition-colors w-full sm:w-auto
                ${
                  med.resurtir === "no"
                    ? "bg-rose-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                                title="No"
                              >
                                No
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {med.resurtir === "si" && (
                        <div className="mt-4">
                          <label className="flex items-center text-gray-700 font-medium mb-1">
                            <FaCalendarAlt className="mr-2 text-purple-500 shrink-0" />
                            <span className="text-[clamp(13px,3.4vw,15px)]">
                              ¿Cuántos meses?
                            </span>
                          </label>
                          <select
                            value={med.mesesResurtir ?? ""}
                            onChange={(e) =>
                              handleMedicamentoChange(
                                idx,
                                "mesesResurtir",
                                Number(e.target.value)
                              )
                            }
                            className="w-full h-10 rounded-xl bg-white border border-gray-300 text-gray-800 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">Selecciona</option>
                            <option value={2}>2 meses</option>
                            <option value={3}>3 meses</option>
                          </select>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

        {/* Agregar medicamento */}
        {decisionTomada === "si" && (
          <div className="text-right mt-5">
            <button
              onClick={agregarMedicamento}
              className="px-5 sm:px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-500 active:scale-[0.99]"
            >
              + Agregar Medicamento
            </button>
          </div>
        )}

        {/* Historial (carga diferida) */}
        <div className="mt-6">
          <HistorialMedicamentos
            clavenomina={clavenomina}
            clavepaciente={clavepaciente}
          />
        </div>
      </div>

      {/* Respeto a usuarios con reduce motion */}
      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Medicamentos;
